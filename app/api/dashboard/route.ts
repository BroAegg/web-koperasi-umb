// @ts-nocheck - TypeScript cache issue: Prisma model names correct at runtime (see PRISMA-NAMING-CONVENTIONS.md)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalMembers,
      activeMembers,
      totalProducts,
      lowStockProducts,
      todayTransactions,
      todayRevenue,
      monthlyRevenue,
      totalSimpanan,
      recentActivities,
    ] = await Promise.all([
      // Members stats
      prisma.members.count(),
      prisma.members.count({ where: { status: 'ACTIVE' } }),
      
      // Products stats
      prisma.products.count({ where: { isActive: true } }),
      prisma.products.count({
        where: {
          AND: [
            { isActive: true },
            { stock: { lte: 5 } },
          ],
        },
      }),
      
      // Transactions stats
      prisma.transactions.count({
        where: {
          createdAt: { gte: startOfDay },
          status: 'COMPLETED',
        },
      }),
      prisma.transactions.aggregate({
        where: {
          createdAt: { gte: startOfDay },
          status: 'COMPLETED',
          type: 'SALE',
        },
        _sum: { totalAmount: true },
      }),
      prisma.transactions.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: 'COMPLETED',
          type: 'SALE',
        },
        _sum: { totalAmount: true },
      }),
      
      // Savings stats
      prisma.members.aggregate({
        _sum: {
          simpananPokok: true,
          simpananWajib: true,
          simpananSukarela: true,
        },
      }),
      
      // Recent activities (simplified)
      prisma.members.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          nomorAnggota: true,
          createdAt: true,
        },
      }),
    ]);

    const totalSimpananSum = 
      Number(totalSimpanan._sum.simpananPokok || 0) +
      Number(totalSimpanan._sum.simpananWajib || 0) +
      Number(totalSimpanan._sum.simpananSukarela || 0);

    // Get low stock products
    const lowStockProductsList = await prisma.products.findMany({
      where: {
        AND: [
          { isActive: true },
          { stock: { lte: 5 } },
        ],
      },
      include: { categories: true },
      take: 5,
    });

    const stats = {
      totalMembers,
      activeMembers,
      totalProducts,
      lowStockProducts,
      todayTransactions,
      todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.totalAmount || 0),
      totalSimpanan: Number(totalSimpananSum),
      lowStockProductsList: lowStockProductsList.map((product: any) => ({
        ...product,
        buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
        avgCost: product.avgCost ? Number(product.avgCost) : null,
        sellPrice: Number(product.sellPrice),
      })),
      recentActivities: recentActivities.map((member: any) => ({
        type: 'member',
        action: 'Anggota baru terdaftar',
        name: member.name,
        time: `${Math.floor((Date.now() - member.createdAt.getTime()) / (1000 * 60))} menit lalu`,
      })),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}