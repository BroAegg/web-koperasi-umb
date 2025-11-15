"use client";

import MemberNavigation from '@/components/member/MemberNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ArrowLeft,
    Award,
    Calendar,
    Download,
    Search,
    ShoppingBag,
    ShoppingCart
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  pointsEarned: number;
  itemCount: number;
  paymentMethod: string;
}

interface TransactionData {
  transactions: Transaction[];
  totalSpent: number;
  totalPoints: number;
  totalTransactions: number;
}

export default function TransaksiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchTransactionData();
    }
  }, [status, session, router]);

  const fetchTransactionData = async () => {
    try {
      const response = await fetch('/api/member/transaksi');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      if (data.success) {
        setTransactionData(data.data);
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    } finally {
      setLoading(false);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = transactionData?.transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (dateFilter === 'all') return matchesSearch;
    
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return matchesSearch && transactionDate.toDateString() === now.toDateString();
    }
    
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && transactionDate >= weekAgo;
    }
    
    if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return matchesSearch && transactionDate >= monthAgo;
    }
    
    return matchesSearch;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFBFC' }}>
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4" style={{ borderColor: '#0055FF', borderTopColor: 'transparent' }}></div>
          <p className="text-sm sm:text-base text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFBFC' }}>
        <Card className="p-6 sm:p-8 text-center max-w-md shadow-sm border border-gray-200">
          <p className="text-sm sm:text-base text-red-600 mb-4">Data transaksi tidak ditemukan</p>
          <Button 
            onClick={() => router.push('/member/dashboard')}
            className="bg-[#0055FF] hover:bg-[#003DB3] text-white rounded-xl h-10 sm:h-11 px-4 sm:px-5 text-sm sm:text-base font-semibold"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      <MemberNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/member/dashboard')}
            className="mb-3 sm:mb-4 text-gray-600 hover:text-gray-900 border-gray-300 rounded-xl h-9 sm:h-10 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Kembali
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
            Riwayat Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Pantau belanja dan poin yang Anda dapatkan
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E6F0FF' }}>
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#0055FF' }} />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Total Belanja</p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {formatCurrency(transactionData.totalSpent)}
            </h2>
          </Card>

          <Card className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Total Poin</p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {transactionData.totalPoints.toLocaleString()}
            </h2>
          </Card>

          <Card className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Transaksi</p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {transactionData.totalTransactions}
            </h2>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nomor invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 sm:h-11 pl-10 pr-4 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={dateFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setDateFilter('all')}
                className={`rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  dateFilter === 'all' 
                    ? 'bg-[#0055FF] hover:bg-[#003DB3] text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Semua
              </Button>
              <Button
                variant={dateFilter === 'today' ? 'primary' : 'outline'}
                onClick={() => setDateFilter('today')}
                className={`rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  dateFilter === 'today' 
                    ? 'bg-[#0055FF] hover:bg-[#003DB3] text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hari Ini
              </Button>
              <Button
                variant={dateFilter === 'week' ? 'primary' : 'outline'}
                onClick={() => setDateFilter('week')}
                className={`rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  dateFilter === 'week' 
                    ? 'bg-[#0055FF] hover:bg-[#003DB3] text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                7 Hari
              </Button>
              <Button
                variant={dateFilter === 'month' ? 'primary' : 'outline'}
                onClick={() => setDateFilter('month')}
                className={`rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  dateFilter === 'month' 
                    ? 'bg-[#0055FF] hover:bg-[#003DB3] text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                30 Hari
              </Button>
            </div>
          </div>
        </Card>

        {/* Transaction List */}
        <Card className="p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Daftar Transaksi
            </h3>
            <Button
              variant="outline"
              className="rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Export
            </Button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500">
                {searchTerm || dateFilter !== 'all' 
                  ? 'Tidak ada transaksi yang cocok' 
                  : 'Belum ada riwayat transaksi'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E6F0FF' }}>
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#0055FF' }} />
                      </div>
                      <span className="font-bold text-sm sm:text-base text-gray-900">
                        {transaction.invoiceNumber}
                      </span>
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] sm:text-xs">
                        +{transaction.pointsEarned} poin
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 ml-10 sm:ml-11">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatDate(transaction.date)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{transaction.itemCount} item</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-[10px] sm:text-xs bg-gray-200 px-2 py-0.5 rounded">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 text-left sm:text-right ml-10 sm:ml-0">
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      {formatCurrency(transaction.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTransactions.length > 0 && (
            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
              Menampilkan {filteredTransactions.length} dari {transactionData.transactions.length} transaksi
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
