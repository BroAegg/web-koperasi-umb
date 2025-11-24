// Supplier Types
export type SupplierStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
export type PaymentStatus = 'UNPAID' | 'PAID_PENDING_APPROVAL' | 'PAID_APPROVED' | 'PAID_REJECTED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CREDIT';
export type ProductCategory = 'Kebutuhan Rumah Tangga' | 'Makanan & Minuman' | 'Sembako' | 'Lainnya';

export interface Supplier {
  id: string;
  code: string;
  userId?: string | null;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  productCategory: ProductCategory | string;
  description?: string;
  preferredPaymentMethod: PaymentMethod;
  monthlyFee: number;
  status: SupplierStatus;
  paymentStatus: PaymentStatus;
  approvedBy?: string | null;
  approvedAt?: Date | string | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | string | null;
  rejectedReason?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  supplier_payments?: SupplierPayment[];
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentProof?: string | null;
  paymentDate: Date | string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string | null;
  verifiedAt?: Date | string | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | string | null;
  rejectedReason?: string | null;
  note?: string | null;
  createdAt: Date | string;
  verificationStatus?: string; // legacy support
}

export type SupplierFilter = 'all' | 'pending' | 'payment_pending' | 'active';

export interface SupplierStats {
  pendingCount: number;
  paymentPendingCount: number;
  activeCount: number;
  totalCount: number;
}

export interface SupplierActionHandlers {
  onApprove: (supplierId: string) => Promise<void>;
  onReject: (supplierId: string, reason: string) => Promise<void>;
  onVerifyPayment: (supplierId: string, approve: boolean) => Promise<void>;
  onView: (supplier: Supplier) => void;
}

// Modal State Types
export type ModalState = 
  | { type: 'none' }
  | { type: 'approve'; supplier: Supplier }
  | { type: 'payment'; supplier: Supplier; payment: SupplierPayment }
  | { type: 'cash-input'; supplier: Supplier };

// Filter Types
export type FilterTab = 'ALL' | 'PENDING_REVIEW' | 'PENDING' | 'PAYMENT_PENDING' | 'ACTIVE';

export interface SupplierFilters {
  tab: FilterTab;
  search: string;
  category?: string;
  paymentMethod?: string;
  sortBy?: 'name' | 'date' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Pagination Types
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// API Response Types
export interface SupplierListResponse {
  success: boolean;
  data: Supplier[];
  error?: string;
}

export interface SupplierStatsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    approved: number;
    active: number;
    rejected: number;
    suspended: number;
    paymentPending: number;
  };
  error?: string;
}
