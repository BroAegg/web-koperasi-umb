// Financial Types & Interfaces
// Extracted from app/koperasi/financial/page.tsx for reusability

export interface Transaction {
  id: string;
  type: 'SALE' | 'PURCHASE' | 'RETURN' | 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CREDIT';
  reference?: string;
  date: string;
  createdAt: string;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface NewTransaction {
  type: string;
  amount: string;
  description: string;
  category: string;
  paymentMethod: string;
  reference: string;
  date: string;
}

export interface DailySummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
  toko?: {
    revenue: number;
    cogs: number;
    profit: number;
  };
  consignment?: {
    grossRevenue: number;
    cogs: number;
    profit: number;
    feeTotal: number;
  };
}

export type FinancialPeriod = 'today' | '7days' | '1month' | '3months' | '6months' | '1year';

export type TransactionType = 'SALE' | 'PURCHASE' | 'RETURN' | 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CREDIT';
