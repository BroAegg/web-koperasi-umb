'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useNotification } from '@/lib/notification-context';
import { Card, CardHeader, CardContent, Button, Badge } from '@/components/ui';
import { 
  ArrowLeft,
  FileText,
  Download,
  DollarSign,
  Package,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Percent
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import PaymentModal from '@/components/consignment/PaymentModal';

interface ProductSale {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  unitPrice: number;
  totalRevenue: number;
  supplierAmount: number;
  commissionAmount: number;
  commissionRate: number;
}

interface SettlementDetail {
  supplierId: string;
  supplierName: string;
  supplierEmail: string | null;
  supplierPhone: string | null;
  startDate: string;
  endDate: string;
  totalProducts: number;
  totalQuantitySold: number;
  totalRevenue: number;
  totalSupplierAmount: number;
  totalCommission: number;
  productSales: ProductSale[];
  previousPayments: number;
  remainingBalance: number;
}

export default function SettlementDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const supplierId = params.id as string;
  const period = searchParams.get('period') || 'current';
  
  const { user, loading } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  const { success, error } = useNotification();
  const [settlement, setSettlement] = useState<SettlementDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    if (supplierId) {
      fetchSettlementDetail();
      fetchPaymentHistory();
    }
  }, [supplierId, period]);

  const fetchSettlementDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/consignment/settlements?supplierId=${supplierId}&period=${period}`
      );
      const result = await response.json();
      
      if (result.success) {
        setSettlement(result.data);
      } else {
        error('Error', 'Failed to load settlement details');
      }
    } catch (err) {
      console.error('Error fetching settlement:', err);
      error('Error', 'Failed to load settlement details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(
        `/api/consignment/settlements/${supplierId}/payments?periodStart=${settlement?.startDate}&periodEnd=${settlement?.endDate}`
      );
      const result = await response.json();
      
      if (result.success) {
        setPaymentHistory(result.data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
    }
  };

  const handlePaymentSuccess = () => {
    success('Success', 'Payment recorded successfully!');
    fetchSettlementDetail();
    fetchPaymentHistory();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const exportPDF = () => {
    success('Success', 'PDF export feature coming soon!');
  };

  const exportExcel = () => {
    success('Success', 'Excel export feature coming soon!');
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Settlement Not Found
            </h3>
            <p className="text-slate-600 mb-4">
              The requested settlement could not be found.
            </p>
            <Link href="/koperasi/consignment/settlements">
              <Button>Back to Settlements</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/koperasi/consignment/settlements">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Settlements
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              onClick={exportPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              onClick={exportExcel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Supplier Info */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {settlement.supplierName}
                </h1>
                <p className="text-slate-600 text-lg">Settlement Report</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-sm px-3 py-1">
                Pending Payment
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Settlement Period</p>
                  <p className="font-medium text-slate-900 text-sm">
                    {formatDate(settlement.startDate)} - {formatDate(settlement.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="font-medium text-slate-900 text-sm">
                    {settlement.supplierEmail || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="font-medium text-slate-900 text-sm">
                    {settlement.supplierPhone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-blue-700 font-medium mb-1">Products Sold</p>
              <p className="text-3xl font-bold text-blue-900">
                {settlement.totalProducts}
              </p>
              <p className="text-xs text-blue-600 mt-1">Different items</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm text-amber-700 font-medium mb-1">Total Quantity</p>
              <p className="text-3xl font-bold text-amber-900">
                {settlement.totalQuantitySold}
              </p>
              <p className="text-xs text-amber-600 mt-1">Units sold</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-purple-700 font-medium mb-1">Commission (15%)</p>
              <p className="text-2xl font-bold text-purple-900">
                Rp {settlement.totalCommission.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-purple-600 mt-1">Koperasi earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-green-700 font-medium mb-1">Supplier Payment</p>
              <p className="text-2xl font-bold text-green-900">
                Rp {settlement.totalSupplierAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-green-600 mt-1">To be paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Sales Breakdown */}
        <Card>
          <CardHeader className="border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Product Sales Breakdown</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                      Qty Sold
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                      Total Buy
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                      Supplier Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {settlement.productSales.map((product, index) => {
                    const totalBuy = product.unitPrice * product.quantitySold;
                    return (
                      <tr key={product.productId} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{product.productName}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                          {product.sku || '-'}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-900">
                          {product.quantitySold}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          Rp {product.unitPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                          Rp {totalBuy.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-right text-purple-600 font-medium">
                          Rp {product.commissionAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-right text-green-600 font-bold">
                          Rp {product.supplierAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 font-bold text-slate-900">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      {settlement.totalQuantitySold}
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      Rp {(settlement.totalSupplierAmount + settlement.totalCommission).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-purple-700">
                      Rp {settlement.totalCommission.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-700 text-lg">
                      Rp {settlement.totalSupplierAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-slate-700">
                <span>Total Supplier Amount:</span>
                <span className="font-bold text-lg">
                  Rp {settlement.totalSupplierAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Previous Payments:</span>
                <span className="font-bold">
                  Rp {settlement.previousPayments.toLocaleString('id-ID')}
                </span>
              </div>
              <hr className="border-green-300" />
              <div className="flex justify-between items-center text-green-900">
                <span className="text-xl font-bold">Remaining Balance:</span>
                <span className="text-3xl font-bold">
                  Rp {settlement.remainingBalance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={settlement.remainingBalance <= 0}
              >
                <CheckCircle className="w-5 h-5" />
                Record Payment
              </Button>
              <Button 
                variant="outline"
                onClick={exportPDF}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(payment.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} • {payment.paymentMethod}
                      </p>
                      {payment.note && (
                        <p className="text-sm text-slate-500 mt-1">{payment.note}</p>
                      )}
                    </div>
                    <Badge className={payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      {settlement && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          supplierId={supplierId}
          supplierName={settlement.supplierName}
          pendingAmount={settlement.remainingBalance}
          period={`${formatDate(settlement.startDate)} - ${formatDate(settlement.endDate)}`}
          periodStart={settlement.startDate}
          periodEnd={settlement.endDate}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
