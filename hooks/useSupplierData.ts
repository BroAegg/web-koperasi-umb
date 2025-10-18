import { useState, useEffect, useCallback } from 'react';
import { Supplier, SupplierFilter } from '@/types/supplier';

export function useSupplierData() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      } else {
        setError(data.error || 'Failed to fetch suppliers');
      }
    } catch (err) {
      setError('Error fetching suppliers');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filterSuppliers = useCallback((filter: SupplierFilter) => {
    return suppliers.filter(s => {
      if (filter === 'pending') return s.status === 'PENDING';
      if (filter === 'payment_pending') return s.paymentStatus === 'PAID_PENDING_APPROVAL';
      if (filter === 'active') return s.status === 'ACTIVE';
      return true;
    });
  }, [suppliers]);

  const approveSupplier = useCallback(async (supplierId: string) => {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await fetchSuppliers();
        return { success: true, message: 'Supplier berhasil diapprove!' };
      } else {
        return { success: false, message: data.error || 'Gagal approve supplier' };
      }
    } catch (err) {
      return { success: false, message: 'Error: ' + err };
    }
  }, [fetchSuppliers]);

  const rejectSupplier = useCallback(async (supplierId: string, reason: string) => {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSuppliers();
        return { success: true, message: 'Supplier berhasil ditolak' };
      } else {
        return { success: false, message: data.error || 'Gagal reject supplier' };
      }
    } catch (err) {
      return { success: false, message: 'Error: ' + err };
    }
  }, [fetchSuppliers]);

  const verifyPayment = useCallback(async (supplierId: string, approve: boolean) => {
    const action = approve ? 'approve' : 'reject';
    try {
      const res = await fetch(`/api/suppliers/${supplierId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSuppliers();
        return { success: true, message: `Pembayaran berhasil di-${action}` };
      } else {
        return { success: false, message: data.error || `Gagal ${action} pembayaran` };
      }
    } catch (err) {
      return { success: false, message: 'Error: ' + err };
    }
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    filterSuppliers,
    approveSupplier,
    rejectSupplier,
    verifyPayment
  };
}
