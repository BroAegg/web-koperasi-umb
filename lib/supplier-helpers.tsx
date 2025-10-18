import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Ban,
  LucideIcon
} from 'lucide-react';

interface BadgeConfig {
  color: string;
  icon: LucideIcon;
  label: string;
}

// Status Badge Helper
export const getSupplierStatusBadge = (status: string): BadgeConfig => {
  const badges: Record<string, BadgeConfig> = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
    REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
    ACTIVE: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Active' },
    SUSPENDED: { color: 'bg-gray-100 text-gray-800', icon: Ban, label: 'Suspended' },
  };
  return badges[status] || badges.PENDING;
};

// Payment Status Badge Helper
export const getPaymentStatusBadge = (status: string): BadgeConfig => {
  const badges: Record<string, BadgeConfig> = {
    UNPAID: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Belum Bayar' },
    PAID_PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Menunggu Verifikasi' },
    PAID_APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Bayar Terverifikasi' },
    PAID_REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Bayar Ditolak' },
  };
  return badges[status] || badges.UNPAID;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Get supplier statistics
export const calculateSupplierStats = (suppliers: any[]) => {
  return {
    pendingCount: suppliers.filter(s => s.status === 'PENDING').length,
    paymentPendingCount: suppliers.filter(s => s.paymentStatus === 'PAID_PENDING_APPROVAL').length,
    activeCount: suppliers.filter(s => s.status === 'ACTIVE').length,
    totalCount: suppliers.length
  };
};
