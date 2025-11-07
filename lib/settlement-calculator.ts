/**
 * Settlement Calculator for Consignment Products
 * 
 * Calculates supplier payments based on:
 * - Sales transactions
 * - Commission rates
 * - Product pricing (buy price from supplier)
 * - Payment history
 */

import { prisma } from './prisma';

export interface SettlementConfig {
  // Commission rate (percentage) - default 15%
  defaultCommissionRate: number;
  // Minimum settlement amount (in Rp)
  minimumSettlementAmount: number;
  // Settlement period (days)
  settlementPeriodDays: number;
}

export const DEFAULT_SETTLEMENT_CONFIG: SettlementConfig = {
  defaultCommissionRate: 15, // 15% commission for koperasi
  minimumSettlementAmount: 50000, // Rp 50,000 minimum
  settlementPeriodDays: 30, // Monthly settlement
};

export interface ProductSale {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  unitPrice: number; // Harga beli dari supplier
  totalRevenue: number; // Total penjualan (sell price × quantity)
  supplierAmount: number; // Yang dibayar ke supplier
  commissionAmount: number; // Komisi koperasi
  commissionRate: number; // Rate yang digunakan
}

export interface SettlementSummary {
  supplierId: string;
  supplierName: string;
  supplierEmail: string | null;
  supplierPhone: string | null;
  startDate: Date;
  endDate: Date;
  totalProducts: number;
  totalQuantitySold: number;
  totalRevenue: number; // Total penjualan
  totalSupplierAmount: number; // Total yang harus dibayar ke supplier
  totalCommission: number; // Total komisi koperasi
  productSales: ProductSale[];
  previousPayments: number; // Pembayaran yang sudah dilakukan
  remainingBalance: number; // Sisa yang harus dibayar
}

/**
 * Calculate commission amount based on rate
 */
export function calculateCommission(
  amount: number,
  commissionRate: number
): number {
  return Math.floor((amount * commissionRate) / 100);
}

/**
 * Calculate supplier payment (buy price - commission)
 * Commission diambil dari harga beli supplier
 */
export function calculateSupplierPayment(
  buyPrice: number,
  quantity: number,
  commissionRate: number = DEFAULT_SETTLEMENT_CONFIG.defaultCommissionRate
): {
  totalBuyPrice: number;
  commission: number;
  supplierPayment: number;
} {
  const totalBuyPrice = buyPrice * quantity;
  const commission = calculateCommission(totalBuyPrice, commissionRate);
  const supplierPayment = totalBuyPrice - commission;

  return {
    totalBuyPrice,
    commission,
    supplierPayment,
  };
}

/**
 * Get consignment sales for a supplier within date range
 */
export async function getSupplierSales(
  supplierId: string,
  startDate: Date,
  endDate: Date
): Promise<ProductSale[]> {
  // Get all transactions within date range
  const transactions = await prisma.transactions.findMany({
    where: {
      type: 'SALE',
      status: 'COMPLETED',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      transaction_items: {
        include: {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              buyPrice: true,
              sellPrice: true,
              supplierId: true,
              isConsignment: true,
            },
          },
        },
      },
    },
  });

  const productSalesMap = new Map<string, ProductSale>();

  // Aggregate sales by product
  for (const transaction of transactions) {
    for (const item of transaction.transaction_items) {
      const product = item.products;
      
      // Skip if product is null or not from this supplier
      if (!product || product.supplierId !== supplierId) continue;

      const productId = product.id;
      const buyPrice = Number(product.buyPrice);
      const sellPrice = Number(product.sellPrice);
      const quantity = item.quantity;
      const revenue = sellPrice * quantity;

      // Calculate commission (default 15% of buy price)
      const commissionRate = DEFAULT_SETTLEMENT_CONFIG.defaultCommissionRate;
      const totalBuyPrice = buyPrice * quantity;
      const commission = calculateCommission(totalBuyPrice, commissionRate);
      const supplierAmount = totalBuyPrice - commission;

      if (productSalesMap.has(productId)) {
        const existing = productSalesMap.get(productId)!;
        existing.quantitySold += quantity;
        existing.totalRevenue += revenue;
        existing.supplierAmount += supplierAmount;
        existing.commissionAmount += commission;
      } else {
        productSalesMap.set(productId, {
          productId,
          productName: product.name,
          sku: product.sku || '',
          quantitySold: quantity,
          unitPrice: buyPrice,
          totalRevenue: revenue,
          supplierAmount,
          commissionAmount: commission,
          commissionRate,
        });
      }
    }
  }

  return Array.from(productSalesMap.values());
}

/**
 * Calculate settlement summary for a supplier
 */
export async function calculateSettlement(
  supplierId: string,
  startDate: Date,
  endDate: Date,
  config: SettlementConfig = DEFAULT_SETTLEMENT_CONFIG
): Promise<SettlementSummary> {
  // Get supplier info
  const supplier = await prisma.suppliers.findUnique({
    where: { id: supplierId },
    select: {
      id: true,
      businessName: true,
      email: true,
      phone: true,
    },
  });

  if (!supplier) {
    throw new Error(`Supplier not found: ${supplierId}`);
  }

  // Get product sales
  const productSales = await getSupplierSales(supplierId, startDate, endDate);

  // Calculate totals
  const totalProducts = productSales.length;
  const totalQuantitySold = productSales.reduce((sum, p) => sum + p.quantitySold, 0);
  const totalRevenue = productSales.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalSupplierAmount = productSales.reduce((sum, p) => sum + p.supplierAmount, 0);
  const totalCommission = productSales.reduce((sum, p) => sum + p.commissionAmount, 0);

  // Get previous payments for this period
  // TODO: Implement payment tracking table
  const previousPayments = 0; // Will be implemented with payment tracking

  const remainingBalance = totalSupplierAmount - previousPayments;

  return {
    supplierId: supplier.id,
    supplierName: supplier.businessName,
    supplierEmail: supplier.email,
    supplierPhone: supplier.phone,
    startDate,
    endDate,
    totalProducts,
    totalQuantitySold,
    totalRevenue,
    totalSupplierAmount,
    totalCommission,
    productSales,
    previousPayments,
    remainingBalance,
  };
}

/**
 * Get all suppliers with consignment products and pending settlements
 */
export async function getSuppliersWithPendingSettlements(
  startDate: Date,
  endDate: Date
): Promise<Array<{
  supplierId: string;
  supplierName: string;
  totalProducts: number;
  totalSales: number;
  pendingAmount: number;
}>> {
  // Get all suppliers with consignment products
  const suppliers = await prisma.suppliers.findMany({
    where: {
      status: 'APPROVED',
      products: {
        some: {
          isConsignment: true,
        },
      },
    },
    select: {
      id: true,
      businessName: true,
    },
  });

  const results = [];

  for (const supplier of suppliers) {
    const settlement = await calculateSettlement(supplier.id, startDate, endDate);
    
    // Only include if there are sales
    if (settlement.totalQuantitySold > 0) {
      results.push({
        supplierId: supplier.id,
        supplierName: supplier.businessName,
        totalProducts: settlement.totalProducts,
        totalSales: settlement.totalQuantitySold,
        pendingAmount: settlement.remainingBalance,
      });
    }
  }

  return results;
}

/**
 * Format settlement period string
 */
export function formatSettlementPeriod(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const end = endDate.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  return `${start} - ${end}`;
}

/**
 * Get date range for current month settlement
 */
export function getCurrentMonthRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startDate, endDate };
}

/**
 * Get date range for previous month settlement
 */
export function getPreviousMonthRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  return { startDate, endDate };
}

/**
 * Validate settlement amount meets minimum requirement
 */
export function isSettlementValid(
  amount: number,
  config: SettlementConfig = DEFAULT_SETTLEMENT_CONFIG
): boolean {
  return amount >= config.minimumSettlementAmount;
}
