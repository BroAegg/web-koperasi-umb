'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useNotification } from '@/lib/notification-context';
import { Card, CardHeader, CardContent, Button, Badge } from '@/components/ui';
import { 
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import PaymentModal from '@/components/consignment/PaymentModal';

interface SupplierSettlement {
  supplierId: string;
  supplierName: string;
  totalProducts: number;
  totalSales: number;
  pendingAmount: number;
}

interface SettlementPeriod {
  startDate: string;
  endDate: string;
}

export default function ConsignmentSettlementsPage() {
  const { user, loading } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  const { success, error } = useNotification();
  const [suppliers, setSuppliers] = useState<SupplierSettlement[]>([]);
  const [period, setPeriod] = useState<SettlementPeriod | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [isLoading, setIsLoading] = useState(true);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierSettlement | null>(null);

  useEffect(() => {
    fetchSettlements();
  }, [selectedPeriod]);

  const fetchSettlements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/consignment/settlements?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setSuppliers(result.data.suppliers);
        setPeriod(result.data.period);
        setTotalPendingAmount(result.data.totalPendingAmount);
      } else {
        error('Error', 'Failed to load settlements');
      }
    } catch (err) {
      console.error('Error fetching settlements:', err);
      error('Error', 'Failed to load settlements');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const exportAllSettlements = () => {
    success('Success', 'Export feature coming soon!');
  };

  const handleRecordPayment = (supplier: SupplierSettlement) => {
    setSelectedSupplier(supplier);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    success('Success', 'Payment recorded successfully!');
    setSelectedSupplier(null);
    fetchSettlements();
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Consignment Settlements</h1>
              <p className="text-slate-600">Supplier payment calculations and tracking</p>
            </div>
          </div>
          <Button
            onClick={exportAllSettlements}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>

        {/* Period Selection */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Settlement Period:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedPeriod === 'current' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPeriod('current')}
                >
                  Current Month
                </Button>
                <Button
                  size="sm"
                  variant={selectedPeriod === 'previous' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPeriod('previous')}
                >
                  Previous Month
                </Button>
              </div>
              {period && (
                <div className="ml-auto text-sm text-slate-600 font-medium">
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Suppliers</p>
                  <p className="text-3xl font-bold text-slate-900">{suppliers.length}</p>
                  <p className="text-xs text-slate-600 mt-1">With sales</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Products</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {suppliers.reduce((sum, s) => sum + s.totalProducts, 0)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Consignment items</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Sales</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {suppliers.reduce((sum, s) => sum + s.totalSales, 0)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Units sold</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Pending Payments</p>
                  <p className="text-2xl font-bold text-slate-900">
                    Rp {totalPendingAmount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">To be settled</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Settlements List */}
        <Card>
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Supplier Settlements</h2>
              <Badge variant="outline" className="text-sm">
                {suppliers.length} suppliers
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {suppliers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Settlements Found
                </h3>
                <p className="text-slate-600">
                  No consignment sales for the selected period.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suppliers.map((supplier) => (
                  <Card 
                    key={supplier.supplierId}
                    className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-slate-900">
                              {supplier.supplierName}
                            </h3>
                            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600 mb-1">Products Sold</p>
                              <p className="font-bold text-slate-900">
                                {supplier.totalProducts} items
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600 mb-1">Quantity Sold</p>
                              <p className="font-bold text-slate-900">
                                {supplier.totalSales} units
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600 mb-1">Pending Payment</p>
                              <p className="font-bold text-green-600 text-lg">
                                Rp {supplier.pendingAmount.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-6">
                          <Link href={`/koperasi/consignment/settlements/${supplier.supplierId}?period=${selectedPeriod}`}>
                            <Button className="flex items-center gap-2" size="sm">
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleRecordPayment(supplier)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Record Payment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Settlement Calculation:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Supplier payment = (Buy Price × Quantity) - Commission (15%)</li>
                  <li>Commission is calculated from supplier's buy price</li>
                  <li>Settlement period: Monthly (1st - end of month)</li>
                  <li>Minimum settlement amount: Rp 50,000</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {selectedSupplier && period && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedSupplier(null);
          }}
          supplierId={selectedSupplier.supplierId}
          supplierName={selectedSupplier.supplierName}
          pendingAmount={selectedSupplier.pendingAmount}
          period={`${formatDate(period.startDate)} - ${formatDate(period.endDate)}`}
          periodStart={period.startDate}
          periodEnd={period.endDate}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
