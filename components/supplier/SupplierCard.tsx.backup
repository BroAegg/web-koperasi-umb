import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Supplier } from '@/types/supplier';
import { getSupplierStatusBadge, getPaymentStatusBadge, formatCurrency, formatDate } from '@/lib/supplier-helpers';
import { useRouter } from 'next/navigation';

interface SupplierCardProps {
  supplier: Supplier;
  onApprove?: (supplierId: string) => void;
  onReject?: (supplierId: string) => void;
  onVerifyPayment?: (supplierId: string, approve: boolean) => void;
  onView?: (supplier: Supplier) => void;
  actionLoading?: boolean;
}

export default function SupplierCard({
  supplier,
  onApprove,
  onReject,
  onVerifyPayment,
  onView,
  actionLoading = false
}: SupplierCardProps) {
  const router = useRouter();
  const statusBadge = getSupplierStatusBadge(supplier.status);
  const paymentBadge = getPaymentStatusBadge(supplier.paymentStatus);
  const StatusIcon = statusBadge.icon;
  const PaymentIcon = paymentBadge.icon;

  // Check if supplier has CASH payment method and is APPROVED
  const isCashMethodApproved = 
    supplier.status === 'APPROVED' && 
    supplier.preferredPaymentMethod === 'CASH' &&
    supplier.paymentStatus !== 'PAID_PENDING_APPROVAL';

  const handleInputCashPayment = () => {
    // Navigate to kasir cash payment page with pre-filled supplier
    router.push(`/koperasi/kasir/payments/cash?supplierId=${supplier.id}&supplierName=${encodeURIComponent(supplier.businessName)}`);
  };

  // Get payment method display with better UX
  const getPaymentMethodBadge = () => {
    if (supplier.preferredPaymentMethod === 'CASH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
          💵 Cash di Tempat
        </span>
      );
    } else if (supplier.preferredPaymentMethod === 'TRANSFER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
          🏦 Transfer Bank
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
          ⚠️ Belum Dipilih
        </span>
      );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: supplier.status === 'PENDING' ? '#f59e0b' : supplier.paymentStatus === 'PAID_PENDING_APPROVAL' ? '#3b82f6' : '#10b981' }}>
      <CardContent className="p-6">
        {/* 3-Column Layout: Info | Status | Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Supplier Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Avatar + Header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{supplier.businessName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <Package className="w-3.5 h-3.5" />
                  {supplier.productCategory}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Owner:</span> {supplier.ownerName}
                </p>
              </div>
            </div>

            {/* Contact Info - Vertical Stack */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{supplier.address}</span>
              </div>
            </div>

            {/* Description */}
            {supplier.description && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 line-clamp-2">{supplier.description}</p>
              </div>
            )}
          </div>

          {/* CENTER COLUMN: Status Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Status Supplier */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Status Supplier</p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${statusBadge.color} shadow-sm`}>
                <StatusIcon className="w-4 h-4" />
                {statusBadge.label}
              </span>
            </div>

            {/* Status Pembayaran - DOMINAN */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Status Pembayaran</p>
              <div className="space-y-2">
                <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-bold ${paymentBadge.color} shadow-md`}>
                  <PaymentIcon className="w-5 h-5" />
                  {paymentBadge.label}
                </span>
                {supplier.paymentStatus === 'UNPAID' && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {supplier.preferredPaymentMethod === 'TRANSFER' ? 'Belum upload bukti' : supplier.preferredPaymentMethod === 'CASH' ? 'Belum bayar di kantor' : 'Menunggu pembayaran'}
                  </p>
                )}
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Metode Pembayaran</p>
              {getPaymentMethodBadge()}
            </div>

            {/* Fee Bulanan */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Biaya Bulanan</p>
              <p className="text-xl font-bold text-gray-900">
                {supplier.monthlyFee ? formatCurrency(Number(supplier.monthlyFee)) : 'Rp 0'}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Buttons (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">

            {/* Payment Proof */}
            {supplier.supplier_payments && supplier.supplier_payments.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  📄 Bukti Pembayaran Terakhir:
                  {supplier.paymentStatus === 'PAID_PENDING_APPROVAL' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      Menunggu Verifikasi
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <a 
                      href={supplier.supplier_payments[0].paymentProof || ''} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Bukti Transfer
                    </a>
                    <span className="text-xs text-gray-500">
                      {formatDate(supplier.supplier_payments[0].createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Jumlah: <strong>{formatCurrency(Number(supplier.supplier_payments[0].amount))}</strong></p>
                    <p>Status: <strong className="text-yellow-600">{supplier.paymentStatus}</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* CASH Payment Input Button - For APPROVED suppliers with CASH method */}
            {isCashMethodApproved && (
              <Button
                size="lg"
                onClick={handleInputCashPayment}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Input Cash Payment
              </Button>
            )}

            {/* Payment Verification Actions */}
            {supplier.paymentStatus === 'PAID_PENDING_APPROVAL' && onVerifyPayment && (
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={() => onVerifyPayment(supplier.id, true)}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approve Payment
                </Button>
                <Button
                  size="lg"
                  onClick={() => onVerifyPayment(supplier.id, false)}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold shadow-lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject Payment
                </Button>
              </div>
            )}

            {/* Supplier Approval Actions */}
            {supplier.status === 'PENDING' && (onApprove || onReject) && (
              <div className="space-y-3">
                {onApprove && (
                  <Button
                    size="lg"
                    onClick={() => onApprove(supplier.id)}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve Supplier
                  </Button>
                )}
                
                {onReject && (
                  <Button
                    size="lg"
                    onClick={() => onReject(supplier.id)}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold shadow-lg"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Supplier
                  </Button>
                )}
              </div>
            )}

            {/* View Details (Optional) */}
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(supplier)}
                disabled={actionLoading}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Lihat Detail
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
