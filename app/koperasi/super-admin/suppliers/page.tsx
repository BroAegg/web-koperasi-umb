"use client";

import { useState } from 'react';
import { useSupplierData } from '@/hooks/useSupplierData';
import { calculateSupplierStats } from '@/lib/supplier-helpers';
import { Supplier, SupplierFilter } from '@/types/supplier';

// Modular Components
import { 
  PendingStatsCard, 
  PaymentPendingStatsCard, 
  ActiveStatsCard, 
  TotalStatsCard 
} from '@/components/supplier/SupplierStatsCard';
import SupplierFilterBar from '@/components/supplier/SupplierFilterBar';
import SupplierCard from '@/components/supplier/SupplierCard';
import RejectSupplierModal from '@/components/supplier/RejectSupplierModal';
import EmptySupplierState from '@/components/supplier/EmptySupplierState';

export default function SuperAdminSuppliersPage() {
  const [filter, setFilter] = useState<SupplierFilter>('pending');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Use custom hook for all supplier data operations
  const {
    suppliers,
    loading,
    error,
    filterSuppliers,
    approveSupplier,
    rejectSupplier,
    verifyPayment
  } = useSupplierData();

  // Calculate stats using helper
  const stats = calculateSupplierStats(suppliers);
  const filteredSuppliers = filterSuppliers(filter);

  // Action handlers
  const handleApproveSupplier = async (supplierId: string) => {
    if (!confirm('Approve supplier ini? Pastikan payment sudah diverifikasi.')) return;
    
    setActionLoading(true);
    const result = await approveSupplier(supplierId);
    alert(result.message);
    setActionLoading(false);
  };

  const handleRejectSupplier = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    setSelectedSupplier(supplier);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!selectedSupplier) return;
    
    setActionLoading(true);
    const result = await rejectSupplier(selectedSupplier.id, reason);
    alert(result.message);
    setActionLoading(false);
    
    if (result.success) {
      setShowRejectModal(false);
      setSelectedSupplier(null);
    }
  };

  const handleVerifyPayment = async (supplierId: string, approve: boolean) => {
    const action = approve ? 'approve' : 'reject';
    if (!confirm(`${approve ? 'Approve' : 'Reject'} pembayaran ini?`)) return;

    setActionLoading(true);
    const result = await verifyPayment(supplierId, approve);
    alert(result.message);
    setActionLoading(false);
  };


  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Supplier</h1>
        <p className="text-gray-600 mt-2">Kelola persetujuan dan verifikasi pembayaran supplier</p>
      </div>

      {/* Stats Cards - Using Modular Components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PendingStatsCard value={stats.pendingCount} />
        <PaymentPendingStatsCard value={stats.paymentPendingCount} />
        <ActiveStatsCard value={stats.activeCount} />
        <TotalStatsCard value={stats.totalCount} />
      </div>

      {/* Filter Bar - Using Modular Component */}
      <SupplierFilterBar
        activeFilter={filter}
        onFilterChange={setFilter}
        pendingCount={stats.pendingCount}
        paymentPendingCount={stats.paymentPendingCount}
        activeCount={stats.activeCount}
        totalCount={stats.totalCount}
      />

      {/* Suppliers List - Using Modular Components */}
      <div className="space-y-4">
        {filteredSuppliers.length === 0 ? (
          <EmptySupplierState />
        ) : (
          filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onApprove={handleApproveSupplier}
              onReject={handleRejectSupplier}
              onVerifyPayment={handleVerifyPayment}
              actionLoading={actionLoading}
            />
          ))
        )}
      </div>

      {/* Reject Modal - Using Modular Component */}
      <RejectSupplierModal
        isOpen={showRejectModal}
        supplierName={selectedSupplier?.businessName || ''}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleRejectSubmit}
        isSubmitting={actionLoading}
      />
    </div>
  );
}
