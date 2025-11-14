"use client";

import MemberNavigation from '@/components/member/MemberNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    FileText,
    Plus
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LoanData {
  activeLoans: Loan[];
  completedLoans: Loan[];
  totalLoanAmount: number;
  totalRemaining: number;
  canApplyNew: boolean;
}

interface Loan {
  id: string;
  amount: number;
  remaining: number;
  interestRate: number;
  tenor: number;
  monthlyPayment: number;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
  purpose: string;
  startDate: string;
  endDate: string;
  paidMonths: number;
}

export default function PinjamanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    tenor: '12',
    purpose: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchLoanData();
    }
  }, [status, session, router]);

  const fetchLoanData = async () => {
    try {
      const response = await fetch('/api/member/pinjaman');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      if (data.success) {
        setLoanData(data.data);
      }
    } catch (error) {
      console.error('Error fetching loan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/member/pinjaman/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          tenor: parseInt(formData.tenor),
          purpose: formData.purpose,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Pengajuan pinjaman berhasil! Menunggu persetujuan admin.');
        setShowApplyForm(false);
        setFormData({ amount: '', tenor: '12', purpose: '' });
        fetchLoanData();
      } else {
        alert(data.message || 'Gagal mengajukan pinjaman');
      }
    } catch (error) {
      console.error('Error applying loan:', error);
      alert('Terjadi kesalahan saat mengajukan pinjaman');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-500 text-white', label: 'Menunggu', icon: Clock },
      APPROVED: { color: 'bg-green-500 text-white', label: 'Disetujui', icon: CheckCircle },
      ACTIVE: { color: 'bg-blue-500 text-white', label: 'Aktif', icon: CheckCircle },
      COMPLETED: { color: 'bg-gray-500 text-white', label: 'Lunas', icon: CheckCircle },
      REJECTED: { color: 'bg-red-500 text-white', label: 'Ditolak', icon: AlertCircle },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    
    return (
      <Badge className={`${badge.color} text-xs flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pinjaman...</p>
        </div>
      </div>
    );
  }

  if (!loanData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">Data pinjaman tidak ditemukan</p>
          <Button onClick={() => router.push('/member/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/member/dashboard')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Pinjaman Koperasi 💳
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Kelola pinjaman dan ajukan pinjaman baru
              </p>
            </div>
            {loanData.canApplyNew && (
              <Button
                onClick={() => setShowApplyForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajukan Pinjaman
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 mb-3" />
            <p className="text-blue-100 text-xs sm:text-sm mb-1">Total Pinjaman</p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(loanData.totalLoanAmount)}
            </h2>
          </Card>

          <Card className="p-5 sm:p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 mb-3" />
            <p className="text-orange-100 text-xs sm:text-sm mb-1">Sisa Pinjaman</p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(loanData.totalRemaining)}
            </h2>
          </Card>

          <Card className="p-5 sm:p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 mb-3" />
            <p className="text-emerald-100 text-xs sm:text-sm mb-1">Pinjaman Aktif</p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {loanData.activeLoans.length}
            </h2>
          </Card>
        </div>

        {/* Apply Form Modal */}
        {showApplyForm && (
          <Card className="p-6 mb-6 border-2 border-blue-500 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Ajukan Pinjaman Baru
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowApplyForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Pinjaman (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="500000"
                  max="50000000"
                  step="100000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 5000000"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum Rp 500.000, maksimum Rp 50.000.000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenor (Bulan)
                </label>
                <select
                  value={formData.tenor}
                  onChange={(e) => setFormData({ ...formData, tenor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="6">6 Bulan</option>
                  <option value="12">12 Bulan</option>
                  <option value="18">18 Bulan</option>
                  <option value="24">24 Bulan</option>
                  <option value="36">36 Bulan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tujuan Pinjaman
                </label>
                <textarea
                  required
                  minLength={10}
                  maxLength={500}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Jelaskan tujuan penggunaan dana pinjaman..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? 'Mengirim...' : 'Ajukan Pinjaman'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Active Loans */}
        {loanData.activeLoans.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Pinjaman Aktif
            </h3>
            <div className="space-y-4">
              {loanData.activeLoans.map((loan) => (
                <Card key={loan.id} className="p-5 sm:p-6 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {formatCurrency(loan.amount)}
                        </h4>
                        {getStatusBadge(loan.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Tujuan:</strong> {loan.purpose}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Tenor:</strong> {loan.tenor} bulan | 
                        <strong className="ml-2">Bunga:</strong> {loan.interestRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Sisa</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(loan.remaining)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Angsuran/Bulan</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(loan.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Terbayar</p>
                        <p className="font-semibold text-emerald-600">
                          {loan.paidMonths}/{loan.tenor} bulan
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Mulai</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(loan.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Jatuh Tempo</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(loan.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress Pembayaran</span>
                      <span>{Math.round((loan.paidMonths / loan.tenor) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${(loan.paidMonths / loan.tenor) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Loans */}
        {loanData.completedLoans.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Riwayat Pinjaman Lunas
            </h3>
            <div className="space-y-3">
              {loanData.completedLoans.map((loan) => (
                <Card key={loan.id} className="p-4 bg-gray-50 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(loan.amount)}
                        </span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <p className="text-sm text-gray-600">{loan.purpose}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(loan.startDate)} - {formatDate(loan.endDate)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {loanData.activeLoans.length === 0 && loanData.completedLoans.length === 0 && (
          <Card className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Belum ada riwayat pinjaman</p>
            {loanData.canApplyNew && (
              <Button
                onClick={() => setShowApplyForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajukan Pinjaman Pertama
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
