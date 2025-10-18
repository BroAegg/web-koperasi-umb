// Supplier Types
export interface Supplier {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  productCategory: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED';
  paymentStatus: 'UNPAID' | 'PAID_PENDING_APPROVAL' | 'PAID_APPROVED' | 'PAID_REJECTED';
  createdAt: string;
  monthlyFee: number;
  supplier_payments?: SupplierPayment[];
}

export interface SupplierPayment {
  id: string;
  amount: number;
  paymentProof: string;
  verificationStatus: string;
  createdAt: string;
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
