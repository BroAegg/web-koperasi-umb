/**
 * Profit Calculation Utilities
 * 
 * Calculate gross profit, net profit, and margins for financial reports
 */

export interface ProfitData {
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  totalRevenue: number;
  totalCOGS: number;
  operatingExpenses: number;
}

export interface TransactionWithProfit {
  id: string;
  date: Date | string;
  type: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  profit?: number;
  margin?: number;
}

/**
 * Calculate gross profit for a single transaction
 * Gross Profit = Revenue - COGS
 */
export function calculateGrossProfit(
  sellPrice: number,
  buyPrice: number,
  quantity: number
): number {
  return (sellPrice - buyPrice) * quantity;
}

/**
 * Calculate profit margin percentage
 * Margin = (Profit / Revenue) × 100
 */
export function calculateMargin(profit: number, revenue: number): number {
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}

/**
 * Calculate comprehensive profit data from transactions
 */
export function calculateProfitData(
  transactions: any[],
  operatingExpenses: number = 0
): ProfitData {
  let totalRevenue = 0;
  let totalCOGS = 0;

  // Calculate revenue and COGS from transactions
  transactions.forEach((trans) => {
    if (trans.type === 'INCOME' || trans.type === 'SALE') {
      totalRevenue += trans.amount;
      
      // If transaction has items with buy/sell prices, calculate COGS
      if (trans.items && Array.isArray(trans.items)) {
        trans.items.forEach((item: any) => {
          const buyPrice = item.buyPrice || 0;
          const quantity = item.quantity || 0;
          totalCOGS += buyPrice * quantity;
        });
      }
    }
  });

  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - operatingExpenses;
  const grossMargin = calculateMargin(grossProfit, totalRevenue);
  const netMargin = calculateMargin(netProfit, totalRevenue);

  return {
    grossProfit,
    netProfit,
    grossMargin,
    netMargin,
    totalRevenue,
    totalCOGS,
    operatingExpenses,
  };
}

/**
 * Enrich transactions with profit and margin calculations
 */
export function enrichTransactionsWithProfit(
  transactions: any[]
): TransactionWithProfit[] {
  return transactions.map((trans) => {
    let profit = 0;
    let margin = 0;

    if (trans.items && Array.isArray(trans.items)) {
      trans.items.forEach((item: any) => {
        const sellPrice = item.unitPrice || item.sellPrice || 0;
        const buyPrice = item.buyPrice || 0;
        const quantity = item.quantity || 0;
        profit += (sellPrice - buyPrice) * quantity;
      });

      const revenue = trans.amount || 0;
      margin = calculateMargin(profit, revenue);
    }

    return {
      ...trans,
      profit,
      margin,
    };
  });
}

/**
 * Calculate daily profit breakdown
 */
export function calculateDailyProfit(transactions: any[]): {
  date: string;
  revenue: number;
  profit: number;
  margin: number;
}[] {
  const dailyMap = new Map<string, { revenue: number; profit: number }>();

  transactions.forEach((trans) => {
    const date = new Date(trans.date).toISOString().split('T')[0];
    const current = dailyMap.get(date) || { revenue: 0, profit: 0 };

    let transProfit = 0;
    if (trans.items && Array.isArray(trans.items)) {
      trans.items.forEach((item: any) => {
        const sellPrice = item.unitPrice || item.sellPrice || 0;
        const buyPrice = item.buyPrice || 0;
        const quantity = item.quantity || 0;
        transProfit += (sellPrice - buyPrice) * quantity;
      });
    }

    current.revenue += trans.amount || 0;
    current.profit += transProfit;
    dailyMap.set(date, current);
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      profit: data.profit,
      margin: calculateMargin(data.profit, data.revenue),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate category-wise profit breakdown
 */
export function calculateCategoryProfit(transactions: any[]): {
  category: string;
  revenue: number;
  profit: number;
  margin: number;
  count: number;
}[] {
  const categoryMap = new Map<
    string,
    { revenue: number; profit: number; count: number }
  >();

  transactions.forEach((trans) => {
    const category = trans.category || 'Uncategorized';
    const current = categoryMap.get(category) || {
      revenue: 0,
      profit: 0,
      count: 0,
    };

    let transProfit = 0;
    if (trans.items && Array.isArray(trans.items)) {
      trans.items.forEach((item: any) => {
        const sellPrice = item.unitPrice || item.sellPrice || 0;
        const buyPrice = item.buyPrice || 0;
        const quantity = item.quantity || 0;
        transProfit += (sellPrice - buyPrice) * quantity;
      });
    }

    current.revenue += trans.amount || 0;
    current.profit += transProfit;
    current.count += 1;
    categoryMap.set(category, current);
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      revenue: data.revenue,
      profit: data.profit,
      margin: calculateMargin(data.profit, data.revenue),
      count: data.count,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Format profit data for display
 */
export function formatProfitData(data: ProfitData): {
  grossProfit: string;
  netProfit: string;
  grossMargin: string;
  netMargin: string;
} {
  return {
    grossProfit: `Rp ${data.grossProfit.toLocaleString('id-ID')}`,
    netProfit: `Rp ${data.netProfit.toLocaleString('id-ID')}`,
    grossMargin: `${data.grossMargin.toFixed(2)}%`,
    netMargin: `${data.netMargin.toFixed(2)}%`,
  };
}
