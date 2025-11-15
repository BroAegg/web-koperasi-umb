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
      PENDING: { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'Menunggu', icon: Clock },
      APPROVED: { color: 'bg-green-50 text-green-700 border border-green-200', label: 'Disetujui', icon: CheckCircle },
      ACTIVE: { color: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Aktif', icon: CheckCircle },
      COMPLETED: { color: 'bg-gray-50 text-gray-700 border border-gray-200', label: 'Lunas', icon: CheckCircle },
      REJECTED: { color: 'bg-red-50 text-red-700 border border-red-200', label: 'Ditolak', icon: AlertCircle },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    
    return (
      <Badge className={`${badge.color} text-[10px] sm:text-xs flex items-center gap-1 font-semibold px-2 py-0.5`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data pinjaman...</p>
        </div>
      </div>
    );
  }

  if (!loanData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <Card className="p-8 text-center max-w-md shadow-lg border border-gray-200">
          <p className="text-red-600 mb-4 font-medium">Data pinjaman tidak ditemukan</p>
          <Button onClick={() => router.push('/member/dashboard')} className="bg-[#0055FF] hover:bg-[#003DB3]">
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <MemberNavigation />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/member/dashboard')}
            className="mb-3 sm:mb-4 text-gray-600 hover:text-gray-900 border-gray-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Pinjaman Koperasi
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Kelola pinjaman dan ajukan pinjaman baru
              </p>
            </div>
            {loanData.canApplyNew && (
              <Button
                onClick={() => setShowApplyForm(true)}
                className="bg-[#0055FF] hover:bg-[#003DB3] text-white text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajukan Pinjaman
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#0055FF] stroke-[2px]" />
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Total Pinjaman</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(loanData.totalLoanAmount)}
            </h2>
          </Card>

          <Card className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 stroke-[2px]" />
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Sisa Pinjaman</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(loanData.totalRemaining)}
            </h2>
          </Card>

          <Card className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 stroke-[2px]" />
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Pinjaman Aktif</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {loanData.activeLoans.length}
            </h2>
          </Card>
        </div>

        {/* Apply Form Modal */}
        {showApplyForm && (
          <Card className="p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 border-2 border-[#0055FF] shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                Ajukan Pinjaman Baru
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowApplyForm(false)}
                className="text-gray-500 hover:text-gray-700 border-gray-200 w-8 h-8 p-0 rounded-lg"
              >
                ✕
              </Button>
            </div>
            <form onSubmit={handleApplyLoan} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
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
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all"
                  placeholder="Contoh: 5000000"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Minimum Rp 500.000, maksimum Rp 50.000.000</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tenor (Bulan)
                </label>
                <select
                  value={formData.tenor}
                  onChange={(e) => setFormData({ ...formData, tenor: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all"
                >
                  <option value="6">6 Bulan</option>
                  <option value="12">12 Bulan</option>
                  <option value="18">18 Bulan</option>
                  <option value="24">24 Bulan</option>
                  <option value="36">36 Bulan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tujuan Pinjaman
                </label>
                <textarea
                  required
                  minLength={10}
                  maxLength={500}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent resize-none transition-all"
                  rows={3}
                  placeholder="Jelaskan tujuan penggunaan dana pinjaman..."
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#0055FF] hover:bg-[#003DB3] text-white text-sm"
                >
                  {submitting ? 'Mengirim...' : 'Ajukan Pinjaman'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Batal
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Active Loans */}
        {loanData.activeLoans.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Pinjaman Aktif
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {loanData.activeLoans.map((loan) => (
                <Card key={loan.id} className="p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="text-base sm:text-lg font-bold text-gray-900">
                          {formatCurrency(loan.amount)}
                        </h4>
                        {getStatusBadge(loan.status)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        <strong>Tujuan:</strong> {loan.purpose}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <strong>Tenor:</strong> {loan.tenor} bulan | 
                        <strong className="ml-2">Bunga:</strong> {loan.interestRate}%
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Sisa</p>
                      <p className="text-lg sm:text-xl font-bold text-orange-600">
                        {formatCurrency(loan.remaining)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 sm:pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-gray-500 mb-1 text-[10px] sm:text-xs">Angsuran/Bulan</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(loan.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-[10px] sm:text-xs">Terbayar</p>
                        <p className="font-semibold text-emerald-600">
                          {loan.paidMonths}/{loan.tenor} bulan
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-[10px] sm:text-xs">Mulai</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(loan.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-[10px] sm:text-xs">Jatuh Tempo</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(loan.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 sm:mt-4">
                    <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1.5">
                      <span>Progress Pembayaran</span>
                      <span className="font-semibold">{Math.round((loan.paidMonths / loan.tenor) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
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
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Riwayat Pinjaman Lunas
            </h3>
            <div className="space-y-3">
              {loanData.completedLoans.map((loan) => (
                <Card key={loan.id} className="p-4 sm:p-5 bg-gray-50 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm sm:text-base text-gray-900">
                          {formatCurrency(loan.amount)}
                        </span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{loan.purpose}</p>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">
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
          <Card className="p-8 sm:p-12 text-center shadow-sm border border-gray-200">
            <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500 mb-4">Belum ada riwayat pinjaman</p>
            {loanData.canApplyNew && (
              <Button
                onClick={() => setShowApplyForm(true)}
                className="bg-[#0055FF] hover:bg-[#003DB3] text-white rounded-xl h-10 sm:h-11 px-4 sm:px-5 text-sm sm:text-base font-semibold transition-all duration-300"
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
