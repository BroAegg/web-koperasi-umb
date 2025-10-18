"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Eye, 
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  AlertCircle,
  Ban
} from 'lucide-react';

interface Supplier {
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
  supplier_payments?: {
    id: string;
    amount: number;
    paymentProof: string;
    verificationStatus: string;
    createdAt: string;
  }[];
}

export default function SuperAdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'payment_pending' | 'active'>('pending');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    if (filter === 'pending') return s.status === 'PENDING';
    if (filter === 'payment_pending') return s.paymentStatus === 'PAID_PENDING_APPROVAL';
    if (filter === 'active') return s.status === 'ACTIVE';
    return true;
  });

  const handleApproveSupplier = async (supplierId: string) => {
    if (!confirm('Approve supplier ini? Pastikan payment sudah diverifikasi.')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/suppliers/${supplierId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('Supplier berhasil diapprove!');
        fetchSuppliers();
      } else {
        alert(data.error || 'Gagal approve supplier');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSupplier = async () => {
    if (!selectedSupplier || !rejectReason.trim()) {
      alert('Mohon isi alasan penolakan');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/suppliers/${selectedSupplier.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Supplier berhasil ditolak');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedSupplier(null);
        fetchSuppliers();
      } else {
        alert(data.error || 'Gagal reject supplier');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyPayment = async (supplierId: string, approve: boolean) => {
    const action = approve ? 'approve' : 'reject';
    if (!confirm(`${approve ? 'Approve' : 'Reject'} pembayaran ini?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/suppliers/${supplierId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Pembayaran berhasil di-${action}`);
        fetchSuppliers();
      } else {
        alert(data.error || `Gagal ${action} pembayaran`);
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      ACTIVE: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Active' },
      SUSPENDED: { color: 'bg-gray-100 text-gray-800', icon: Ban, label: 'Suspended' },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      UNPAID: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Belum Bayar' },
      PAID_PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Menunggu Verifikasi' },
      PAID_APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Bayar Terverifikasi' },
      PAID_REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Bayar Ditolak' },
    };
    const badge = badges[status] || badges.UNPAID;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const pendingCount = suppliers.filter(s => s.status === 'PENDING').length;
  const paymentPendingCount = suppliers.filter(s => s.paymentStatus === 'PAID_PENDING_APPROVAL').length;
  const activeCount = suppliers.filter(s => s.status === 'ACTIVE').length;

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Supplier</h1>
        <p className="text-gray-600 mt-2">Kelola persetujuan dan verifikasi pembayaran supplier</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Payment Pending</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">{paymentPendingCount}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Active Suppliers</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{activeCount}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Suppliers</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{suppliers.length}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Building2 className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              onClick={() => setFilter('pending')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Pending Approval ({pendingCount})
            </Button>
            <Button
              variant={filter === 'payment_pending' ? 'primary' : 'outline'}
              onClick={() => setFilter('payment_pending')}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Payment Pending ({paymentPendingCount})
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'outline'}
              onClick={() => setFilter('active')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Active ({activeCount})
            </Button>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Semua ({suppliers.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <div className="space-y-4">
        {filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada supplier untuk filter ini</p>
            </CardContent>
          </Card>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{supplier.businessName}</h3>
                        <p className="text-sm text-gray-600">Owner: {supplier.ownerName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{supplier.productCategory}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{supplier.address}</span>
                      </div>
                    </div>

                    {supplier.description && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {supplier.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status Supplier</p>
                        {getStatusBadge(supplier.status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status Pembayaran</p>
                        {getPaymentStatusBadge(supplier.paymentStatus)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fee Bulanan</p>
                        <span className="text-sm font-medium text-gray-900">
                          Rp {supplier.monthlyFee.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {supplier.supplier_payments && supplier.supplier_payments.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-yellow-800 mb-2">📄 Bukti Pembayaran Terakhir:</p>
                        <div className="flex items-center gap-2">
                          <a 
                            href={supplier.supplier_payments[0].paymentProof} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Lihat Bukti Transfer
                          </a>
                          <span className="text-xs text-gray-500">
                            | {new Date(supplier.supplier_payments[0].createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {supplier.paymentStatus === 'PAID_PENDING_APPROVAL' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleVerifyPayment(supplier.id, true)}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleVerifyPayment(supplier.id, false)}
                          disabled={actionLoading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject Payment
                        </Button>
                      </>
                    )}

                    {supplier.status === 'PENDING' && supplier.paymentStatus === 'PAID_APPROVED' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleApproveSupplier(supplier.id)}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve Supplier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowRejectModal(true);
                          }}
                          disabled={actionLoading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {supplier.status === 'PENDING' && supplier.paymentStatus !== 'PAID_APPROVED' && (
                      <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
                        Menunggu pembayaran diverifikasi
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tolak Supplier</h3>
              <p className="text-sm text-gray-600 mb-4">
                Supplier: <strong>{selectedSupplier?.businessName}</strong>
              </p>
              <textarea
                className="w-full border rounded-lg p-3 text-sm"
                rows={4}
                placeholder="Masukkan alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedSupplier(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleRejectSupplier}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  Tolak Supplier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
