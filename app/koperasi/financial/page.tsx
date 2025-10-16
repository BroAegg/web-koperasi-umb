'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading, CardSkeleton } from '@/components/ui/loading';
import { DateSelector } from '@/components/ui/date-selector';
import { formatCurrency, formatDate, formatTime, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';
import { useNotification } from '@/lib/notification-context';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Receipt,
  CreditCard,
  X,
  FileText,
  Tag,
  Hash,
  Wallet,
  Building2
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'SALE' | 'PURCHASE' | 'RETURN' | 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CREDIT';
  reference?: string;
  date: string;
  createdAt: string;
  items?: TransactionItem[];
}

interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    unit: string;
  };
}

interface NewTransaction {
  type: string;
  amount: string;
  description: string;
  category: string;
  paymentMethod: string;
  reference: string;
  date: string;
}

interface DailySummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
}

export default function FinancialPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialPeriod, setFinancialPeriod] = useState<'today' | '7days' | '1month' | '3months' | '6months' | '1year'>('today');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  
  const { success, error, warning, confirm } = useNotification();

  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    type: 'SALE',
    amount: '',
    description: '',
    category: '',
    paymentMethod: 'CASH',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  // State untuk formatted amount display
  const [formattedAmount, setFormattedAmount] = useState('');

  // Handler untuk amount input dengan formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCurrencyInput(value);
    const numericValue = parseCurrencyInput(value);
    
    setFormattedAmount(formatted);
    setNewTransaction(prev => ({ ...prev, amount: numericValue }));
  };

  useEffect(() => {
    fetchTransactions();
    fetchDailySummary();
  }, [selectedDate]);

  // Effect untuk menginisialisasi formatted amount ketika editing
  useEffect(() => {
    if (newTransaction.amount) {
      setFormattedAmount(formatCurrencyInput(newTransaction.amount));
    } else {
      setFormattedAmount('');
    }
  }, [newTransaction.amount]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financial/transactions?date=${selectedDate}`);
      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.data);
      } else {
        error('Gagal Memuat Data', result.error || 'Terjadi kesalahan saat memuat data transaksi');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await fetch(`/api/financial/summary?date=${selectedDate}`);
      const result = await response.json();
      
      if (result.success) {
        setDailySummary(result.data);
      }
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTransaction.type || !newTransaction.amount || !newTransaction.description) {
      warning('Form Tidak Lengkap', 'Tipe, jumlah, dan deskripsi wajib diisi');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (amount <= 0) {
      warning('Jumlah Tidak Valid', 'Jumlah harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = editingTransaction 
        ? `/api/financial/transactions/${editingTransaction}`
        : '/api/financial/transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTransaction,
          amount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setNewTransaction({
          type: 'SALE',
          amount: '',
          description: '',
          category: '',
          paymentMethod: 'CASH',
          reference: '',
          date: new Date().toISOString().split('T')[0],
        });
        setEditingTransaction(null);
        setShowAddModal(false);
        
        // Refresh data
        fetchTransactions();
        fetchDailySummary();
        
        const successMessage = editingTransaction 
          ? 'Transaksi berhasil diupdate'
          : 'Transaksi berhasil dicatat';
        success(editingTransaction ? 'Update Berhasil' : 'Transaksi Berhasil', result.message || successMessage);
      } else {
        error('Gagal Menyimpan', result.error || 'Terjadi kesalahan saat menyimpan transaksi');
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = await confirm({
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/financial/transactions/${transactionId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          success('Transaksi Dihapus', 'Transaksi berhasil dihapus');
          fetchTransactions();
          fetchDailySummary();
        } else {
          error('Gagal Menghapus', result.error || 'Terjadi kesalahan saat menghapus transaksi');
        }
      } catch (err) {
        console.error('Error deleting transaction:', err);
        error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
      }
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    // Future enhancement: Show detailed view with connections to inventory/member
    success('Detail Transaksi', `Transaksi: ${transaction.description || 'Tanpa catatan'}\nJumlah: ${formatCurrency(transaction.amount)}\nTanggal: ${formatDate(new Date(transaction.date))}`);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // Populate the form with existing transaction data for editing
    setNewTransaction({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      category: getCategoryFromType(transaction.type),
      paymentMethod: transaction.paymentMethod,
      reference: transaction.reference || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setEditingTransaction(transaction.id);
    setShowAddModal(true);
  };

  const getCategoryFromType = (type: string) => {
    switch (type) {
      case 'SALE': return 'Penjualan';
      case 'PURCHASE': return 'Pembelian';
      case 'INCOME': return 'Pemasukan';
      case 'EXPENSE': return 'Pengeluaran';
      default: return 'Lainnya';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'SALE':
      case 'INCOME':
        return 'text-green-600 bg-green-50';
      case 'PURCHASE':
      case 'EXPENSE':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return <ShoppingCart className="w-4 h-4" />;
      case 'INCOME':
        return <TrendingUp className="w-4 h-4" />;
      case 'PURCHASE':
        return <Receipt className="w-4 h-4" />;
      case 'EXPENSE':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Wallet className="w-4 h-4 text-green-500" />;
      case 'TRANSFER':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'CREDIT':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === '' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pencatatan Keuangan</h1>
          <p className="text-gray-600 mt-1">Kelola transaksi dan laporan keuangan harian</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Catat Pemasukan/Pengeluaran
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards with Visual Hierarchy */}
      {dailySummary && (
        <div className="space-y-4 sm:space-y-6">
          {/* DOMINANT: Financial Summary Card */}
          <Card className="border border-blue-200 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="border-b border-blue-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Ringkasan Keuangan</h3>
                    <p className="text-xs text-gray-600">Analisis performa keuangan harian</p>
                  </div>
                </div>
                
                {/* Period Dropdown & Calendar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium hidden sm:inline">Periode:</span>
                  <div className="flex items-center rounded-lg border border-blue-200 bg-white shadow-sm overflow-hidden">
                    <select
                      value={financialPeriod}
                      onChange={(e) => setFinancialPeriod(e.target.value as any)}
                      className="px-3 py-1.5 text-xs font-medium bg-white border-none outline-none appearance-none cursor-pointer text-gray-700"
                    >
                      <option value="today">Hari Ini</option>
                      <option value="7days">7 Hari</option>
                      <option value="1month">1 Bulan</option>
                      <option value="3months">3 Bulan</option>
                      <option value="6months">6 Bulan</option>
                      <option value="1year">1 Tahun</option>
                    </select>
                    
                    {/* Calendar Date Input - Hidden behind icon */}
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setFinancialPeriod('today'); // Reset to today when manual date is selected
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Pilih tanggal"
                      />
                      <button 
                        type="button"
                        className="px-2.5 py-1.5 border-l border-blue-100 text-gray-600 hover:bg-blue-50 transition-colors"
                        title="Pilih tanggal"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Period Display - Show custom date or period label */}
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const isCustomDate = selectedDate !== today;
                    
                    if (isCustomDate) {
                      return formatDate(new Date(selectedDate));
                    }
                    
                    return financialPeriod === 'today' ? 'Hari Ini' :
                           financialPeriod === '7days' ? '7 Hari Terakhir' :
                           financialPeriod === '1month' ? '30 Hari Terakhir' :
                           financialPeriod === '3months' ? '3 Bulan Terakhir' :
                           financialPeriod === '6months' ? '6 Bulan Terakhir' :
                           '1 Tahun Terakhir';
                  })()}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Pemasukan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Total Pemasukan</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{formatCurrency(dailySummary.totalIncome)}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +15% dari periode sebelumnya
                    </span>
                  </div>
                </div>
                
                {/* Total Pengeluaran */}
                <div className="space-y-2 border-l border-blue-100 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Total Pengeluaran</span>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(dailySummary.totalExpense)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Efisiensi:</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {dailySummary.totalIncome > 0 ? ((1 - dailySummary.totalExpense / dailySummary.totalIncome) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                
                {/* Keuntungan Bersih */}
                <div className="space-y-2 border-l border-blue-100 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Keuntungan Bersih</span>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className={`text-3xl font-bold ${
                    dailySummary.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(dailySummary.netIncome)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dailySummary.transactionCount} transaksi periode ini
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECONDARY: Other Metrics - 3 Cards in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Transaksi Penjualan */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium px-2 py-1 rounded-full text-green-700 bg-green-100">
                    Sales
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Transaksi Penjualan</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.filter(t => t.type === 'SALE').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(transactions.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Metode Pembayaran */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium px-2 py-1 rounded-full text-blue-700 bg-blue-100">
                    Payment
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Pembayaran Cash</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.filter(t => t.paymentMethod === 'CASH').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    dari {dailySummary.transactionCount} total transaksi
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rata-rata Transaksi */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <Receipt className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium px-2 py-1 rounded-full text-purple-700 bg-purple-100">
                    Average
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Rata-rata Transaksi</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dailySummary.transactionCount > 0 ? dailySummary.totalIncome / dailySummary.transactionCount : 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    per transaksi hari ini
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Transaksi {formatDate(new Date(selectedDate))} ({filteredTransactions.length})
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Semua Tipe</option>
                <option value="SALE">Penjualan</option>
                <option value="PURCHASE">Pembelian</option>
                <option value="RETURN">Retur</option>
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada transaksi pada tanggal ini</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Catat Pemasukan/Pengeluaran Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Tipe & Deskripsi</TableHead>
                    <TableHead className="font-semibold text-gray-900">Kategori</TableHead>
                    <TableHead className="font-semibold text-gray-900">Jumlah</TableHead>
                    <TableHead className="font-semibold text-gray-900">Metode Bayar</TableHead>
                    <TableHead className="font-semibold text-gray-900">Waktu</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                            {getTransactionTypeIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                {transaction.type === 'SALE' ? 'Penjualan' :
                                 transaction.type === 'INCOME' ? 'Pemasukan' :
                                 transaction.type === 'PURCHASE' ? 'Pembelian' : 
                                 transaction.type === 'EXPENSE' ? 'Pengeluaran' : 'Retur'}
                              </span>
                              {/* Source indicator badge */}
                              {['SALE', 'PURCHASE', 'RETURN'].includes(transaction.type) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                  Otomatis
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-700 font-medium">{transaction.category || '-'}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`font-bold text-base ${
                          transaction.type === 'SALE' || transaction.type === 'INCOME' 
                            ? 'text-emerald-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'SALE' || transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="text-gray-700 font-medium">
                            {transaction.paymentMethod === 'CASH' ? 'Tunai' :
                             transaction.paymentMethod === 'TRANSFER' ? 'Transfer' : 'Kredit'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-600 text-sm font-medium">
                          {formatTime(transaction.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                            className="text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Only show edit/delete for INCOME and EXPENSE (manual transactions) */}
                          {['INCOME', 'EXPENSE'].includes(transaction.type) ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                                className="text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                                title="Edit Transaksi"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="hover:bg-red-600 hover:text-white transition-colors"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-md">
                              Dari Inventory
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingTransaction ? 'Update Pemasukan/Pengeluaran' : 'Catat Pemasukan/Pengeluaran'}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {editingTransaction ? 'Perbarui data pemasukan atau pengeluaran' : 'Catat pemasukan lain (bunga, denda) atau pengeluaran (gaji, listrik, ATK)'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTransaction(null);
                    // Reset form
                    setNewTransaction({
                      type: 'SALE',
                      amount: '',
                      description: '',
                      category: '',
                      paymentMethod: 'CASH',
                      reference: '',
                      date: new Date().toISOString().split('T')[0],
                    });
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

            <form onSubmit={handleAddTransaction} className="space-y-6">
              {/* Info Message */}
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Info:</strong> Transaksi <strong>Penjualan & Pembelian</strong> tercatat otomatis dari halaman Inventory. 
                  Di sini Anda hanya bisa mencatat <strong>Pemasukan Lain</strong> (bunga, denda, biaya admin) dan <strong>Pengeluaran</strong> (gaji, listrik, ATK).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Transaksi *
                  </label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="INCOME">Pemasukan Lain</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah *
                  </label>
                  <Input
                    type="text"
                    value={formattedAmount}
                    onChange={handleAmountChange}
                    placeholder="Masukkan nominal"
                    leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi *
                </label>
                <Input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Deskripsi transaksi"
                  leftIcon={<FileText className="w-4 h-4 text-gray-400" />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-gray-500 font-normal">(Opsional)</span>
                  </label>
                  <Input
                    type="text"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    placeholder="Contoh: Alat Tulis, Makanan, ATK..."
                    leftIcon={<Tag className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <select
                    value={newTransaction.paymentMethod}
                    onChange={(e) => setNewTransaction({ ...newTransaction, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CASH">Tunai</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="CREDIT">Kredit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referensi <span className="text-gray-500 font-normal">(Opsional)</span>
                  </label>
                  <Input
                    type="text"
                    value={newTransaction.reference}
                    onChange={(e) => setNewTransaction({ ...newTransaction, reference: e.target.value })}
                    placeholder="No. invoice, struk, kode transaksi..."
                    leftIcon={<Hash className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTransaction(null);
                    // Reset form
                    setNewTransaction({
                      type: 'SALE',
                      amount: '',
                      description: '',
                      category: '',
                      paymentMethod: 'CASH',
                      reference: '',
                      date: new Date().toISOString().split('T')[0],
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loading className="w-4 h-4 mr-2" />
                      {editingTransaction ? 'Mengupdate...' : 'Menyimpan...'}
                    </>
                  ) : (
                    <>
                      {editingTransaction ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Transaksi
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Simpan Transaksi
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}