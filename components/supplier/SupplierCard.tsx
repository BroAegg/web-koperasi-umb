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
  Eye
} from 'lucide-react';
import { Supplier } from '@/types/supplier';
import { getSupplierStatusBadge, getPaymentStatusBadge, formatCurrency, formatDate } from '@/lib/supplier-helpers';

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
  const statusBadge = getSupplierStatusBadge(supplier.status);
  const paymentBadge = getPaymentStatusBadge(supplier.paymentStatus);
  const StatusIcon = statusBadge.icon;
  const PaymentIcon = paymentBadge.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{supplier.businessName}</h3>
                <p className="text-sm text-gray-600">Owner: {supplier.ownerName}</p>
              </div>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 truncate">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{supplier.productCategory}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 truncate">{supplier.address}</span>
              </div>
            </div>

            {/* Description */}
            {supplier.description && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {supplier.description}
              </p>
            )}

            {/* Status Badges */}
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status Supplier</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusBadge.label}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status Pembayaran</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentBadge.color}`}>
                  <PaymentIcon className="w-3 h-3" />
                  {paymentBadge.label}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Fee Bulanan</p>
                <span className="text-sm font-medium text-gray-900">
                  {supplier.monthlyFee ? formatCurrency(Number(supplier.monthlyFee)) : 'Rp 0'}
                </span>
              </div>
            </div>

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

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 ml-4">
            {/* Payment Verification Actions */}
            {supplier.paymentStatus === 'PAID_PENDING_APPROVAL' && onVerifyPayment && (
              <>
                <Button
                  size="sm"
                  onClick={() => onVerifyPayment(supplier.id, true)}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve Payment
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onVerifyPayment(supplier.id, false)}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject Payment
                </Button>
              </>
            )}

            {/* Supplier Approval Actions */}
            {supplier.status === 'PENDING' && supplier.paymentStatus === 'PAID_APPROVED' && onApprove && (
              <Button
                size="sm"
                onClick={() => onApprove(supplier.id)}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve Supplier
              </Button>
            )}

            {supplier.status === 'PENDING' && onReject && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onReject(supplier.id)}
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject Supplier
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
