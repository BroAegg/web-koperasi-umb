"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Search, Users, Clock, CheckCircle2, Building2, X, Filter, Download, FileSpreadsheet, FileText, CheckSquare, Square, MoreVertical, Eye, Edit, Ban, Trash2, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Supplier, FilterTab, SupplierPayment } from '@/types/supplier';

// Components
import SupplierCard from '@/components/supplier/SupplierCard';
import { ApproveSupplierModal } from '@/components/supplier/ApproveSupplierModal';
import { PaymentProofModal } from '@/components/supplier/PaymentProofModal';
import { EvaluateSupplierModal } from '@/components/supplier/EvaluateSupplierModal';

export default function SuperAdminSuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulateLoading, setSimulateLoading] = useState(false);
  
  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | undefined>(undefined);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // ✅ IMPROVED: Modal state as discriminated union
  type ModalState = 
    | { type: 'none' }
    | { type: 'approve'; supplier: Supplier }
    | { type: 'payment'; supplier: Supplier; payment?: SupplierPayment }
    | { type: 'cash-input'; supplier: Supplier }
    | { type: 'evaluate'; supplier: Supplier };
  
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [actionLoading, setActionLoading] = useState(false);
  
  // ✅ Bulk Actions
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  
  // ✅ Export
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // ✅ Cleanup Simulation
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // ✅ IMPROVED: Fetch suppliers with better error handling
  const fetchSuppliers = async (retryCount = 0) => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers', {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setSuppliers(data.data || []);
        toast.success(`Loaded ${data.data?.length || 0} suppliers successfully`, {
          duration: 2000,
        });
      } else {
        throw new Error(data.error || 'Failed to load suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      
      // Retry mechanism (max 2 retries)
      if (retryCount < 2) {
        toast.error(`Failed to load suppliers. Retrying... (${retryCount + 1}/2)`, {
          duration: 2000,
        });
        setTimeout(() => fetchSuppliers(retryCount + 1), 1000);
      } else {
        toast.error(
          <div className="space-y-1">
            <p className="font-semibold">Failed to load suppliers</p>
            <p className="text-xs">{error instanceof Error ? error.message : 'Network error'}</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => fetchSuppliers()}
              className="mt-2 w-full"
            >
              Retry Now
            </Button>
          </div>,
          { duration: 5000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ✅ OPTIMIZED: Calculate stats with useMemo (only recalculate when suppliers change)
  const stats = useMemo(() => ({
    pendingReviewCount: suppliers.filter(s => s.status === 'PENDING_REVIEW' as any).length,
    pendingCount: suppliers.filter(s => s.status === 'PENDING' as any).length,
    paymentPendingCount: suppliers.filter(s => s.paymentStatus === 'PAID_PENDING_APPROVAL' as any).length,
    activeCount: suppliers.filter(s => s.status === 'ACTIVE' as any).length,
    totalCount: suppliers.length,
  }), [suppliers]);

  // ✅ OPTIMIZED: Filter suppliers with useMemo (only recalculate when dependencies change)
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      // Tab filter
      if (activeTab === 'PENDING_REVIEW' && supplier.status !== ('PENDING_REVIEW' as any)) return false;
      if (activeTab === 'PENDING' && supplier.status !== ('PENDING' as any)) return false;
      if (activeTab === 'PAYMENT_PENDING' && supplier.paymentStatus !== ('PAID_PENDING_APPROVAL' as any)) return false;
      if (activeTab === 'ACTIVE' && supplier.status !== ('ACTIVE' as any)) return false;

      // Search filter (case-insensitive)
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
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
  }, [suppliers, activeTab, searchQuery, categoryFilter, paymentMethodFilter]);

  // ✅ SORTING: Sort filtered suppliers
  const sortedSuppliers = useMemo(() => {
    const sorted = [...filteredSuppliers];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.businessName.localeCompare(b.businessName);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          const statusOrder = { PENDING: 1, APPROVED: 2, ACTIVE: 3, REJECTED: 4, SUSPENDED: 5 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredSuppliers, sortBy, sortOrder]);

  // ✅ PAGINATION: Calculate paginated data
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage);
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedSuppliers.slice(startIndex, endIndex);
  }, [sortedSuppliers, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, categoryFilter, paymentMethodFilter]);

  // ✅ IMPROVED: Action handlers with new modal state management
  const handleApproveClick = (supplier: Supplier) => {
    setModalState({ type: 'approve', supplier });
  };

  const handleViewPaymentProof = (supplier: Supplier, payment?: SupplierPayment) => {
    console.log('View payment proof clicked:', { 
      supplier: supplier.businessName, 
      payment: payment,
      hasPaymentProof: !!payment?.paymentProof 
    });
    setModalState({ type: 'payment', supplier, payment });
  };

  const handleInputCashPayment = (supplier: Supplier) => {
    setModalState({ type: 'cash-input', supplier });
  };

  const handleViewDetails = (supplier: Supplier) => {
    // Navigate to supplier detail page (if exists)
    router.push(`/koperasi/super-admin/suppliers/${supplier.id}`);
  };

  const handleEvaluate = (supplier: Supplier) => {
    setModalState({ type: 'evaluate', supplier });
  };

  const closeModal = () => {
    setModalState({ type: 'none' });
    setActionLoading(false);
  };

  // ✅ Bulk Actions Handlers
  const toggleSelectSupplier = (supplierId: string) => {
    const newSelected = new Set(selectedSuppliers);
    if (newSelected.has(supplierId)) {
      newSelected.delete(supplierId);
    } else {
      newSelected.add(supplierId);
    }
    setSelectedSuppliers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedSuppliers.size === paginatedSuppliers.length) {
      setSelectedSuppliers(new Set());
    } else {
      setSelectedSuppliers(new Set(paginatedSuppliers.map(s => s.id)));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction || selectedSuppliers.size === 0) return;

    setActionLoading(true);
    try {
      const promises = Array.from(selectedSuppliers).map(async (supplierId) => {
        const res = await fetch(`/api/admin/suppliers/${supplierId}/${bulkAction}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        return res.json();
      });

      await Promise.all(promises);
      
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Bulk Action Completed!</p>
          <p className="text-xs">{selectedSuppliers.size} supplier(s) {bulkAction === 'approve' ? 'approved' : 'rejected'}</p>
        </div>,
        { duration: 3000 }
      );
      
      setSelectedSuppliers(new Set());
      setShowBulkConfirm(false);
      setBulkAction(null);
      fetchSuppliers();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to complete bulk action');
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Export Handlers
  const handleExport = async (format: 'csv' | 'excel', scope: 'current' | 'filtered' | 'all') => {
    setExportLoading(true);
    try {
      let dataToExport: Supplier[] = [];
      
      if (scope === 'current') {
        dataToExport = paginatedSuppliers;
      } else if (scope === 'filtered') {
        dataToExport = filteredSuppliers;
      } else {
        dataToExport = suppliers;
      }

      const exportData = dataToExport.map(s => ({
        'Supplier Code': s.code,
        'Business Name': s.businessName,
        'Owner Name': s.ownerName,
        'Phone': s.phone,
        'Email': s.email || '-',
        'Status': s.status,
        'Payment Status': s.paymentStatus,
        'Category': s.productCategory,
        'Payment Method': s.preferredPaymentMethod,
        'Created At': new Date(s.createdAt).toLocaleDateString('id-ID'),
      }));

      if (format === 'csv') {
        // CSV Export
        const headers = Object.keys(exportData[0] || {}).join(',');
        const rows = exportData.map(row => Object.values(row).join(',')).join('\\n');
        const csv = `${headers}\\n${rows}`;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `suppliers-${scope}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      } else {
        // Excel Export (would need library like xlsx)
        toast.info('Excel export requires additional library. Exporting as CSV instead.');
        const headers = Object.keys(exportData[0] || {}).join(',');
        const rows = exportData.map(row => Object.values(row).join(',')).join('\\n');
        const csv = `${headers}\\n${rows}`;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `suppliers-${scope}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }

      toast.success(`Exported ${exportData.length} supplier(s) successfully!`);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  // ✅ IMPROVED: Handle simulate supplier with better error handling and retry
  const handleSimulateSupplier = async (retryCount = 0) => {
    if (!confirm('Buat supplier simulasi untuk testing?')) return;

    setSimulateLoading(true);
    try {
      const res = await fetch('/api/admin/suppliers/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        toast.success(
          <div className="space-y-1">
            <p className="font-semibold">Test Supplier Created!</p>
            <p className="text-xs">{data.message || 'Successfully created test supplier'}</p>
          </div>,
          { duration: 3000 }
        );
        fetchSuppliers(); // Refresh
      } else {
        throw new Error(data.error || 'Failed to create test supplier');
      }
    } catch (error) {
      console.error('Simulate error:', error);
      
      // Retry mechanism (max 1 retry for POST operations)
      if (retryCount < 1) {
        toast.error('Failed to create supplier. Retrying...', { duration: 2000 });
        setTimeout(() => handleSimulateSupplier(retryCount + 1), 1000);
      } else {
        toast.error(
          <div className="space-y-1">
            <p className="font-semibold">Failed to create test supplier</p>
            <p className="text-xs">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>,
          { duration: 4000 }
        );
      }
    } finally {
      setSimulateLoading(false);
    }
  };

  // ✅ Handle cleanup simulation suppliers
  const handleCleanupSimulation = async () => {
    const simulationCount = suppliers.filter(s => s.code.startsWith('SIM-')).length;
    
    if (simulationCount === 0) {
      toast.error('Tidak ada supplier simulasi yang perlu dihapus');
      return;
    }

    if (!confirm(`Hapus ${simulationCount} supplier simulasi?\n\nSupplier dengan kode SIM-* akan dihapus beserta semua data terkait.`)) {
      return;
    }

    setCleanupLoading(true);
    try {
      const res = await fetch('/api/admin/suppliers/simulate/cleanup', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Berhasil menghapus supplier simulasi');
        fetchSuppliers(); // Refresh
      } else {
        throw new Error(data.error || 'Failed to cleanup');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus supplier simulasi');
    } finally {
      setCleanupLoading(false);
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage supplier approvals and payment verification</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowExportDialog(true)}
            variant="outline"
            size="md"
            disabled={suppliers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => handleSimulateSupplier()}
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
          <Button
            onClick={handleCleanupSimulation}
            disabled={cleanupLoading || !suppliers.some(s => s.code.startsWith('SIM-'))}
            variant="danger"
          >
            {cleanupLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Simulasi
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ✅ Bulk Actions Bar */}
      {selectedSuppliers.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {selectedSuppliers.size} supplier(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleBulkAction('approve')}
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Approve Selected
                </Button>
                <Button
                  onClick={() => handleBulkAction('reject')}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Selected
                </Button>
                <Button
                  onClick={() => setSelectedSuppliers(new Set())}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          /* ✅ LOADING STATE: Skeleton Stats */
          <>
            {[...Array(4)].map((_, idx) => (
              <Card key={idx} className="border-l-4 border-l-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
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
          </>
        )}
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
          onClick={() => setActiveTab('PENDING_REVIEW')}
          variant={activeTab === 'PENDING_REVIEW' ? 'primary' : 'outline'}
          className="whitespace-nowrap"
        >
          📝 Pending Review ({stats.pendingReviewCount})
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
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search supplier (name, code, email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-full md:w-48 border-gray-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent align="start" className="max-w-[250px]">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat as string}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentMethodFilter} onValueChange={(value) => setPaymentMethodFilter(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-full md:w-48 border-gray-300">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent align="start" className="max-w-[200px]">
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By Dropdown */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [by, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
            setSortBy(by);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-full md:w-40 border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="status-asc">Status (Pending First)</SelectItem>
              <SelectItem value="status-desc">Status (Active First)</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters Button */}
          {(searchQuery || categoryFilter || paymentMethodFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter(undefined);
                setPaymentMethodFilter(undefined);
              }}
              className="whitespace-nowrap"
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Active Filters Indicator */}
        {(searchQuery || categoryFilter || paymentMethodFilter) && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Active filters:</span>
            </div>
            
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-600" 
                  onClick={() => setSearchQuery('')}
                />
              </Badge>
            )}
            
            {categoryFilter && (
              <Badge variant="secondary" className="gap-1">
                {categoryFilter}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-600" 
                  onClick={() => setCategoryFilter(undefined)}
                />
              </Badge>
            )}
            
            {paymentMethodFilter && (
              <Badge variant="secondary" className="gap-1">
                {paymentMethodFilter}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-600" 
                  onClick={() => setPaymentMethodFilter(undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Suppliers List */}
      <div className="space-y-3">
        {loading ? (
          /* ✅ LOADING STATE: Skeleton Cards */
          <>
            {[...Array(itemsPerPage)].map((_, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            {/* Professional Icon */}
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            
            {/* Heading */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || categoryFilter || paymentMethodFilter 
                ? 'No suppliers found' 
                : 'No suppliers yet'}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || categoryFilter || paymentMethodFilter 
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'Get started by adding your first supplier to the system. Suppliers can be added manually or you can use test data.'}
            </p>
            
            {/* Call to Action */}
            {!searchQuery && !categoryFilter && !paymentMethodFilter && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  onClick={() => handleSimulateSupplier()}
                  disabled={simulateLoading}
                  variant="primary"
                  size="lg"
                >
                  {simulateLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Test Supplier
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">or create manually in production</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Suppliers Count Info & Select All */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2"
                >
                  {selectedSuppliers.size === paginatedSuppliers.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Select All</span>
                </Button>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredSuppliers.length)}</span> of{' '}
                  <span className="font-semibold">{filteredSuppliers.length}</span> suppliers
                </p>
              </div>
              
              {/* Items per page selector */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Show:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Supplier Cards */}
            {paginatedSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onApproveClick={handleApproveClick}
                onViewPaymentProof={handleViewPaymentProof}
                onInputCashPayment={handleInputCashPayment}
                onViewDetails={handleViewDetails}
                onEvaluate={handleEvaluate}
                showCheckbox={true}
                isSelected={selectedSuppliers.has(supplier.id)}
                onToggleSelect={toggleSelectSupplier}
              />
            ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pb-4">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>

              {/* Page Numbers - Hide on mobile, show on tablet+ */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              {/* Page indicator on mobile */}
              <div className="sm:hidden text-sm text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            </div>
          )}
        </>
        )}
      </div>

      {/* ✅ IMPROVED: Modals with discriminated union state */}
      {modalState.type === 'approve' && (
        <ApproveSupplierModal
          isOpen={true}
          onClose={closeModal}
          supplier={modalState.supplier}
          onSuccess={() => {
            fetchSuppliers();
            closeModal();
            toast.success(
              <div className="space-y-1">
                <p className="font-semibold">Supplier Approved!</p>
                <p className="text-xs">{modalState.supplier.businessName} has been approved successfully</p>
              </div>,
              { duration: 3000 }
            );
          }}
        />
      )}

      {modalState.type === 'payment' && modalState.payment && (
        <PaymentProofModal
          isOpen={true}
          onClose={closeModal}
          payment={modalState.payment as any}
          supplier={modalState.supplier}
          onSuccess={() => {
            fetchSuppliers();
            closeModal();
            toast.success(
              <div className="space-y-1">
                <p className="font-semibold">Payment Verified!</p>
                <p className="text-xs">Payment for {modalState.supplier.businessName} has been processed</p>
              </div>,
              { duration: 3000 }
            );
          }}
        />
      )}

      {modalState.type === 'evaluate' && (
        <EvaluateSupplierModal
          isOpen={true}
          onClose={closeModal}
          supplier={modalState.supplier}
          onSuccess={() => {
            fetchSuppliers();
            closeModal();
            toast.success(
              <div className="space-y-1">
                <p className="font-semibold">Evaluation Saved!</p>
                <p className="text-xs">Supplier evaluation has been updated</p>
              </div>,
              { duration: 3000 }
            );
          }}
        />
      )}

      {modalState.type === 'cash-input' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cash Payment Input</h3>
              <p className="text-gray-600 mb-4">
                Redirect to cash payment page for {modalState.supplier.businessName}?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    router.push(`/koperasi/kasir/payments/cash?supplierId=${modalState.supplier.id}&supplierName=${encodeURIComponent(modalState.supplier.businessName)}`);
                    closeModal();
                  }}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ✅ Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Export Suppliers</h3>
                <Button variant="outline" size="sm" onClick={() => setShowExportDialog(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Choose export format and data scope
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">Export Format</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start h-auto py-4"
                      onClick={() => handleExport('csv', 'filtered')}
                      disabled={exportLoading}
                    >
                      <FileText className="w-5 h-5 mr-3 text-green-600" />
                      <div className="text-left">
                        <div className="font-semibold">CSV</div>
                        <div className="text-xs text-gray-500">Excel compatible</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto py-4"
                      onClick={() => handleExport('excel', 'filtered')}
                      disabled={exportLoading}
                    >
                      <FileSpreadsheet className="w-5 h-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-semibold">Excel</div>
                        <div className="text-xs text-gray-500">Native format</div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">Data Scope</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleExport('csv', 'current')}
                      disabled={exportLoading}
                    >
                      <span>Current Page ({paginatedSuppliers.length} items)</span>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleExport('csv', 'filtered')}
                      disabled={exportLoading}
                    >
                      <span>Filtered Results ({filteredSuppliers.length} items)</span>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleExport('csv', 'all')}
                      disabled={exportLoading}
                    >
                      <span>All Suppliers ({suppliers.length} items)</span>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {exportLoading && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-900">Preparing export...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ✅ Bulk Action Confirmation Modal */}
      {showBulkConfirm && bulkAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-full ${bulkAction === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {bulkAction === 'approve' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {bulkAction === 'approve' ? 'Approve' : 'Reject'} Multiple Suppliers
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to {bulkAction} <span className="font-semibold">{selectedSuppliers.size}</span> supplier(s)?
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBulkConfirm(false);
                    setBulkAction(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant={bulkAction === 'approve' ? 'primary' : 'danger'}
                  onClick={confirmBulkAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm {bulkAction === 'approve' ? 'Approval' : 'Rejection'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
