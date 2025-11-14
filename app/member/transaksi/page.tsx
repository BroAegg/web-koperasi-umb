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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">Data transaksi tidak ditemukan</p>
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
            variant="ghost"
            onClick={() => router.push('/member/dashboard')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Riwayat Transaksi 🛒
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Pantau belanja dan points yang Anda dapatkan
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 mb-3" />
            <p className="text-orange-100 text-xs sm:text-sm mb-1">Total Belanja</p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(transactionData.totalSpent)}
            </h2>
          </Card>

          <Card className="p-5 sm:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 mb-3" />
            <p className="text-purple-100 text-xs sm:text-sm mb-1">Total Points</p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {transactionData.totalPoints.toLocaleString()} pts
            </h2>
          </Card>

          <Card className="p-5 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 mb-3" />
            <p className="text-blue-100 text-xs sm:text-sm mb-1">Total Transaksi</p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {transactionData.totalTransactions}
            </h2>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-5 sm:p-6 mb-6 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari no. invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setDateFilter('all')}
                className={dateFilter === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                Semua
              </Button>
              <Button
                variant={dateFilter === 'today' ? 'default' : 'outline'}
                onClick={() => setDateFilter('today')}
                className={dateFilter === 'today' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                Hari Ini
              </Button>
              <Button
                variant={dateFilter === 'week' ? 'default' : 'outline'}
                onClick={() => setDateFilter('week')}
                className={dateFilter === 'week' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                7 Hari
              </Button>
              <Button
                variant={dateFilter === 'month' ? 'default' : 'outline'}
                onClick={() => setDateFilter('month')}
                className={dateFilter === 'month' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                30 Hari
              </Button>
            </div>
          </div>
        </Card>

        {/* Transaction List */}
        <Card className="p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Daftar Transaksi
            </h3>
            <Button
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || dateFilter !== 'all' 
                  ? 'Tidak ada transaksi yang cocok' 
                  : 'Belum ada riwayat transaksi'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-gray-900">
                        {transaction.invoiceNumber}
                      </span>
                      <Badge className="bg-purple-500 text-white text-xs">
                        +{transaction.pointsEarned} pts
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(transaction.date)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{transaction.itemCount} item</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(transaction.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTransactions.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Menampilkan {filteredTransactions.length} dari {transactionData.transactions.length} transaksi
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
