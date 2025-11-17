"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Search, Users, Clock, CheckCircle2, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Components
import SupplierCard from '@/components/supplier/SupplierCard';
import { ApproveSupplierModal } from '@/components/supplier/ApproveSupplierModal';
import { PaymentProofModal } from '@/components/supplier/PaymentProofModal';

type FilterTab = 'ALL' | 'PENDING' | 'PAYMENT_PENDING' | 'ACTIVE';

export default function SuperAdminSuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulateLoading, setSimulateLoading] = useState(false);
  
  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | undefined>(undefined);
  
  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      
      if (data.success) {
        setSuppliers(data.data || []);
      } else {
        toast.error('Gagal memuat data supplier');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Calculate stats
  const stats = {
    pendingCount: suppliers.filter(s => s.status === 'PENDING').length,
    paymentPendingCount: suppliers.filter(s => s.paymentStatus === 'PAID_PENDING_APPROVAL').length,
    activeCount: suppliers.filter(s => s.status === 'ACTIVE').length,
    totalCount: suppliers.length,
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    // Tab filter
    if (activeTab === 'PENDING' && supplier.status !== 'PENDING') return false;
    if (activeTab === 'PAYMENT_PENDING' && supplier.paymentStatus !== 'PAID_PENDING_APPROVAL') return false;
    if (activeTab === 'ACTIVE' && supplier.status !== 'ACTIVE') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        supplier.businessName?.toLowerCase().includes(query) ||
        supplier.code?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query) ||
        supplier.ownerName?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (categoryFilter && supplier.productCategory !== categoryFilter) return false;

    // Payment method filter
    if (paymentMethodFilter && supplier.preferredPaymentMethod !== paymentMethodFilter) return false;

    return true;
  });

  // Action handlers
  const handleApproveClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowApproveModal(true);
  };

  const handleViewPaymentProof = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowPaymentProofModal(true);
  };

  const handleInputCashPayment = (supplier: any) => {
    // Navigate to cash payment page with pre-fill
    router.push(`/koperasi/kasir/payments/cash?supplierId=${supplier.id}&supplierName=${encodeURIComponent(supplier.businessName)}`);
  };

  const handleViewDetails = (supplier: any) => {
    // Navigate to supplier detail page (if exists)
    router.push(`/koperasi/super-admin/suppliers/${supplier.id}`);
  };

  const handleSimulateSupplier = async () => {
    if (!confirm('Buat supplier simulasi untuk testing?')) return;

    setSimulateLoading(true);
    try {
      const res = await fetch('/api/admin/suppliers/simulate', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchSuppliers(); // Refresh
      } else {
        toast.error(data.error || 'Gagal membuat supplier simulasi');
      }
    } catch (error) {
      console.error('Simulate error:', error);
      toast.error('Terjadi kesalahan saat membuat supplier simulasi');
    } finally {
      setSimulateLoading(false);
    }
  };

  // Get unique categories from suppliers
  const categories = Array.from(new Set(suppliers.map(s => s.productCategory).filter(Boolean)));

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat data supplier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage supplier approvals and payment verification</p>
        </div>
        <Button
          onClick={handleSimulateSupplier}
          disabled={simulateLoading}
          variant="outline"
        >
          {simulateLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Membuat...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Simulasi Supplier
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Pending Approval</p>
                <p className="text-3xl font-bold text-slate-900">{stats.pendingCount}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Payment Pending</p>
                <p className="text-3xl font-bold text-slate-900">{stats.paymentPendingCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Loader2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Suppliers</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Suppliers</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setActiveTab('ALL')}
          variant={activeTab === 'ALL' ? 'primary' : 'outline'}
          className="whitespace-nowrap"
        >
          All ({stats.totalCount})
        </Button>
        <Button
          onClick={() => setActiveTab('PENDING')}
          variant={activeTab === 'PENDING' ? 'primary' : 'outline'}
          className="whitespace-nowrap"
        >
          Pending ({stats.pendingCount})
        </Button>
        <Button
          onClick={() => setActiveTab('PAYMENT_PENDING')}
          variant={activeTab === 'PAYMENT_PENDING' ? 'primary' : 'outline'}
          className="whitespace-nowrap"
        >
          Payment Pending ({stats.paymentPendingCount})
        </Button>
        <Button
          onClick={() => setActiveTab('ACTIVE')}
          variant={activeTab === 'ACTIVE' ? 'primary' : 'outline'}
          className="whitespace-nowrap"
        >
          Active ({stats.activeCount})
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search supplier (name, code, email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-full md:w-[180px] border-gray-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat as string}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentMethodFilter || ""} onValueChange={(value) => setPaymentMethodFilter(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-full md:w-[180px] border-gray-300">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-3">
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No suppliers found
            </h3>
            <p className="text-gray-600">
              {searchQuery || categoryFilter || paymentMethodFilter 
                ? 'No suppliers match your filters'
                : 'No suppliers yet. Click "Simulasi Supplier" to add test data.'}
            </p>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onApproveClick={handleApproveClick}
              onViewPaymentProof={handleViewPaymentProof}
              onInputCashPayment={handleInputCashPayment}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {selectedSupplier && showApproveModal && (
        <ApproveSupplierModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
          onSuccess={fetchSuppliers}
        />
      )}

      {selectedSupplier && showPaymentProofModal && selectedSupplier.supplier_payments?.[0] && (
        <PaymentProofModal
          isOpen={showPaymentProofModal}
          onClose={() => {
            setShowPaymentProofModal(false);
            setSelectedSupplier(null);
          }}
          payment={selectedSupplier.supplier_payments[0]}
          supplier={selectedSupplier}
          onSuccess={fetchSuppliers}
        />
      )}
    </div>
  );
}
