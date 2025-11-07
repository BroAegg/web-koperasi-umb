/**
 * Member Points System Utilities
 * 
 * Handle points earning, redemption, tier upgrades, and loyalty rewards
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type MemberTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface PointsConfig {
  earnRate: number; // Percentage of purchase amount that becomes points
  redemptionRate: number; // Points needed for 1 Rupiah
  expiryMonths: number; // Points expire after X months
  tierThresholds: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    PLATINUM: number;
  };
  tierDiscounts: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    PLATINUM: number;
  };
}

// Default points configuration
export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  earnRate: 1, // 1% of purchase amount
  redemptionRate: 100, // 100 points = Rp 1,000 (1 point = Rp 10)
  expiryMonths: 12, // Points expire after 1 year
  tierThresholds: {
    BRONZE: 0, // Default tier
    SILVER: 1000000, // Rp 1 juta total spending
    GOLD: 5000000, // Rp 5 juta total spending
    PLATINUM: 10000000, // Rp 10 juta total spending
  },
  tierDiscounts: {
    BRONZE: 0, // No discount
    SILVER: 2, // 2% discount
    GOLD: 5, // 5% discount
    PLATINUM: 10, // 10% discount
  },
};

/**
 * Calculate points earned from a purchase
 */
export function calculatePointsEarned(
  amount: number,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): number {
  return Math.floor((amount * config.earnRate) / 100);
}

/**
 * Calculate discount amount based on member tier
 */
export function calculateTierDiscount(
  amount: number,
  tier: MemberTier,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): number {
  const discountPercent = config.tierDiscounts[tier] || 0;
  return Math.floor((amount * discountPercent) / 100);
}

/**
 * Calculate cash value of points
 */
export function calculatePointsValue(
  points: number,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): number {
  return Math.floor((points / config.redemptionRate) * 1000);
}

/**
 * Calculate points needed for a specific cash value
 */
export function calculatePointsNeeded(
  cashValue: number,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): number {
  return Math.ceil((cashValue / 1000) * config.redemptionRate);
}

/**
 * Determine member tier based on total spending
 */
export function determineMemberTier(
  totalSpent: number,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): MemberTier {
  if (totalSpent >= config.tierThresholds.PLATINUM) return 'PLATINUM';
  if (totalSpent >= config.tierThresholds.GOLD) return 'GOLD';
  if (totalSpent >= config.tierThresholds.SILVER) return 'SILVER';
  return 'BRONZE';
}

/**
 * Add points to member account
 */
export async function addPoints(
  memberId: string,
  points: number,
  description: string,
  transactionId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Get current member data
    const member = await prisma.members.findUnique({
      where: { id: memberId },
      select: { points: true },
    });

    if (!member) {
      return { success: false, newBalance: 0, error: 'Member not found' };
    }

    const newBalance = member.points + points;

    // Calculate expiry date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + DEFAULT_POINTS_CONFIG.expiryMonths);

    // Update member points and create history
    await prisma.$transaction([
      prisma.members.update({
        where: { id: memberId },
        data: { points: newBalance },
      }),
      prisma.member_points_history.create({
        data: {
          memberId,
          transactionId,
          type: 'EARNED',
          points,
          balance: newBalance,
          description,
          expiresAt,
        },
      }),
    ]);

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error adding points:', error);
    return { success: false, newBalance: 0, error: 'Failed to add points' };
  }
}

/**
 * Redeem points from member account
 */
export async function redeemPoints(
  memberId: string,
  points: number,
  description: string,
  transactionId?: string
): Promise<{ success: boolean; newBalance: number; cashValue: number; error?: string }> {
  try {
    // Get current member data
    const member = await prisma.members.findUnique({
      where: { id: memberId },
      select: { points: true },
    });

    if (!member) {
      return { success: false, newBalance: 0, cashValue: 0, error: 'Member not found' };
    }

    if (member.points < points) {
      return { success: false, newBalance: member.points, cashValue: 0, error: 'Insufficient points' };
    }

    const newBalance = member.points - points;
    const cashValue = calculatePointsValue(points);

    // Update member points and create history
    await prisma.$transaction([
      prisma.members.update({
        where: { id: memberId },
        data: { points: newBalance },
      }),
      prisma.member_points_history.create({
        data: {
          memberId,
          transactionId,
          type: 'REDEEMED',
          points: -points, // Negative for redemption
          balance: newBalance,
          description,
        },
      }),
    ]);

    return { success: true, newBalance, cashValue };
  } catch (error) {
    console.error('Error redeeming points:', error);
    return { success: false, newBalance: 0, cashValue: 0, error: 'Failed to redeem points' };
  }
}

/**
 * Update member tier based on total spending
 */
export async function updateMemberTier(
  memberId: string,
  newTotalSpent: number
): Promise<{ success: boolean; tier: MemberTier; upgraded: boolean }> {
  try {
    const member = await prisma.members.findUnique({
      where: { id: memberId },
      select: { tier: true, totalSpent: true },
    });

    if (!member) {
      return { success: false, tier: 'BRONZE', upgraded: false };
    }

    const oldTier = member.tier as MemberTier;
    const newTier = determineMemberTier(newTotalSpent);
    const upgraded = newTier !== oldTier;

    // Update tier if changed
    if (upgraded) {
      await prisma.members.update({
        where: { id: memberId },
        data: { 
          tier: newTier,
          totalSpent: newTotalSpent,
        },
      });
    } else {
      // Just update total spent
      await prisma.members.update({
        where: { id: memberId },
        data: { totalSpent: newTotalSpent },
      });
    }

    return { success: true, tier: newTier, upgraded };
  } catch (error) {
    console.error('Error updating member tier:', error);
    return { success: false, tier: 'BRONZE', upgraded: false };
  }
}

/**
 * Process purchase with points earning and tier benefits
 */
export async function processMemberPurchase(
  memberId: string,
  purchaseAmount: number,
  transactionId: string
): Promise<{
  success: boolean;
  pointsEarned: number;
  discount: number;
  finalAmount: number;
  tier: MemberTier;
  tierUpgraded: boolean;
}> {
  try {
    // Get member data
    const member = await prisma.members.findUnique({
      where: { id: memberId },
      select: { tier: true, totalSpent: true, name: true },
    });

    if (!member) {
      return {
        success: false,
        pointsEarned: 0,
        discount: 0,
        finalAmount: purchaseAmount,
        tier: 'BRONZE',
        tierUpgraded: false,
      };
    }

    const currentTier = member.tier as MemberTier;
    
    // Calculate tier discount
    const discount = calculateTierDiscount(purchaseAmount, currentTier);
    const finalAmount = purchaseAmount - discount;
    
    // Calculate points earned (based on final amount after discount)
    const pointsEarned = calculatePointsEarned(finalAmount);
    
    // Add points
    await addPoints(
      memberId,
      pointsEarned,
      `Pembelian sebesar ${formatCurrency(finalAmount)}`,
      transactionId
    );
    
    // Update total spent and check tier upgrade
    const newTotalSpent = Number(member.totalSpent) + finalAmount;
    const { tier: newTier, upgraded } = await updateMemberTier(memberId, newTotalSpent);
    
    // Update last purchase date
    await prisma.members.update({
      where: { id: memberId },
      data: { lastPurchase: new Date() },
    });

    return {
      success: true,
      pointsEarned,
      discount,
      finalAmount,
      tier: newTier,
      tierUpgraded: upgraded,
    };
  } catch (error) {
    console.error('Error processing member purchase:', error);
    return {
      success: false,
      pointsEarned: 0,
      discount: 0,
      finalAmount: purchaseAmount,
      tier: 'BRONZE',
      tierUpgraded: false,
    };
  }
}

/**
 * Get member points history
 */
export async function getMemberPointsHistory(
  memberId: string,
  limit: number = 50
) {
  return prisma.member_points_history.findMany({
    where: { memberId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Get tier badge info
 */
export function getTierBadge(tier: MemberTier): {
  name: string;
  color: string;
  icon: string;
  discount: number;
} {
  const badges = {
    BRONZE: {
      name: 'Bronze',
      color: 'bg-amber-700 text-white',
      icon: '🥉',
      discount: 0,
    },
    SILVER: {
      name: 'Silver',
      color: 'bg-gray-400 text-white',
      icon: '🥈',
      discount: 2,
    },
    GOLD: {
      name: 'Gold',
      color: 'bg-yellow-500 text-white',
      icon: '🥇',
      discount: 5,
    },
    PLATINUM: {
      name: 'Platinum',
      color: 'bg-purple-600 text-white',
      icon: '💎',
      discount: 10,
    },
  };
  return badges[tier];
}
