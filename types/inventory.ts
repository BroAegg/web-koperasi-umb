// Inventory Types & Interfaces

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  description?: string;
  sku?: string;
  buyPrice: number | null;
  avgCost: number | null;
  sellPrice: number;
  stock: number;
  threshold: number;
  unit: string;
  soldToday: number;
  totalSold: number;
  profit: number;
  ownershipType?: 'TOKO' | 'TITIPAN';
  stockCycle?: 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN';
  isConsignment?: boolean;
  supplierId?: string | null;
  supplier?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  supplierContact?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  movementType?: 'PURCHASE_IN' | 'CONSIGNMENT_IN' | 'SALE_OUT' | 'RETURN_IN' | 'RETURN_OUT' | 'EXPIRED_OUT' | 'ADJUSTMENT';
  type: "IN" | "OUT" | "ADJUSTMENT"; // Legacy field
  quantity: number;
  unitCost?: number;
  note: string;
  date: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    unit: string;
    isConsignment?: boolean;
    ownershipType?: 'TOKO' | 'TITIPAN';
    avgCost?: number;
    buyPrice?: number;
  };
}

export interface FinancialData {
  totalRevenue: number;
  totalProfit: number;
  totalSoldItems: number;
  uniqueProductsSold: number; // Count of unique product types sold
  productBreakdown?: Array<{ name: string; quantity: number }>; // Breakdown of sold products
  consignmentBreakdown?: Array<{ supplierName: string; revenue: number; cogs: number; profit: number }>; // NEW: Breakdown of consignment by supplier
  toko: {
    revenue: number;
    cogs: number;
    profit: number;
  };
  consignment: {
    grossRevenue: number;
    cogs: number;
    profit: number;
    feeTotal: number;
  };
}

export interface DailySummary {
  totalIn: number;
  totalOut: number;
  totalMovements: number;
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  description?: string;
  sku?: string;
  buyPrice: string;
  sellPrice: string;
  stock: string;
  threshold: string;
  unit: string;
  ownershipType: 'TOKO' | 'TITIPAN';
  stockCycle: 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN';
  supplierId: string;
  supplierName?: string;
  supplierContact?: string;
  isConsignment?: boolean; // Legacy field for compatibility
}

export interface StockFormData {
  type: 'IN' | 'OUT';
  quantity: string;
  note: string;
}

export type FinancialPeriod = 'today' | '7days' | '1month' | '3months' | '6months' | '1year';
export type OwnershipFilter = 'semua' | 'TOKO' | 'TITIPAN';
export type StockCycleFilter = 'semua' | 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN';
