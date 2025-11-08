'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatDate, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';
import { useNotification } from '@/lib/notification-context';
import { useAuth } from '@/lib/use-auth';
import { getCategoryFromType } from '@/lib/financial-helpers';
import { TransactionFilters } from '@/components/financial/TransactionFilters';
import { FinancialSummaryCard } from '@/components/financial/FinancialSummaryCard';
import { TransactionTable } from '@/components/financial/TransactionTable';
import { TransactionModal } from '@/components/financial/TransactionModal';
import { FinancialChart } from '@/components/financial/FinancialChart';
import { TransactionDetailModal } from '@/components/financial/TransactionDetailModal';
import type { 
  Transaction,
  NewTransaction,
  DailySummary,
  FinancialPeriod
} from '@/types/financial';
import { 
  DollarSign,
  Plus,
  Download,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { ShoppingCart, Receipt, TrendingDown } from 'lucide-react';
import { exportEnhancedFinancialPDF, exportEnhancedFinancialExcel } from '@/lib/financial-export';
import { calculateProfitData, enrichTransactionsWithProfit } from '@/lib/profit-calculator';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function FinancialPage() {
  const router = useRouter();
  
  // Authorization check - Only SUPER_ADMIN and ADMIN can access
  const { user, loading: authLoading, authorized } = useAuth(['SUPER_ADMIN', 'ADMIN']);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>('today');
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  
  // Date range for custom reports
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { success, error, warning, confirm, info } = useNotification();

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

  // Effect untuk menginisialisasi formatted amount ketika editing
  useEffect(() => {
    if (newTransaction.amount) {
      setFormattedAmount(formatCurrencyInput(newTransaction.amount));
    } else {
      setFormattedAmount('');
    }
  }, [newTransaction.amount]);

  // Debug: Log auth state
  useEffect(() => {
    console.log('[Financial Page] Auth State:', {
      authLoading,
      authorized,
      user: user ? { email: user.email, role: user.role } : null
    });
  }, [authLoading, authorized, user]);

  // Redirect if not authorized - COMPLETELY DISABLED
  useEffect(() => {
    if (!authLoading && !authorized) {
      console.log('[Financial Page] ⚠️ NOT AUTHORIZED - BUT NO REDIRECT!');
    }
  }, [authLoading, authorized, router, user]);

  useEffect(() => {
    if (authorized) {
      fetchTransactions();
      fetchDailySummary();
    }
  }, [financialPeriod, authorized]);

  // Auth checks - show loading/unauthorized states
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
            <p className="text-gray-700">Anda tidak memiliki akses ke halaman ini.</p>
          </div>
        </div>
      </div>
    );
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // REMOVED OLD AUTH - Now using NextAuth session cookies
      // const token = localStorage.getItem('token');
      // if (!token) {
      //   error('Sesi Berakhir', 'Silakan login kembali');
      //   window.location.href = '/login';
      //   return;
      // }

      // Use period API instead of date-specific API to follow dropdown period
      const response = await fetch(`/api/financial/period?period=${financialPeriod}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Extract transactions from period API response
        const periodTransactions = result.data.transactions || [];
        
        // Map to Transaction format expected by TransactionTable
        const mappedTransactions = periodTransactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: Number(t.totalAmount),
          description: t.note || getDefaultDescription(t.type),
          category: getCategoryFromType(t.type),
          paymentMethod: t.paymentMethod || 'CASH',
          reference: t.id.slice(0, 8),
          date: t.date,
          createdAt: t.createdAt,
          items: [], // Items not needed in table view
        }));
        
        setTransactions(mappedTransactions);
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

  // Helper function to get default description based on transaction type
  const getDefaultDescription = (type: string): string => {
    switch (type) {
      case 'SALE': return 'Penjualan';
      case 'PURCHASE': return 'Pembelian';
      case 'INCOME': return 'Pemasukan';
      case 'EXPENSE': return 'Pengeluaran';
      default: return 'Transaksi';
    }
  };

  const fetchDailySummary = async () => {
    try {
      // REMOVED OLD AUTH - Now using NextAuth session cookies

      // Use current financialPeriod instead of hardcoded 'today'
      const response = await fetch(`/api/financial/period?period=${financialPeriod}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Map period API response to dailySummary format
        setDailySummary({
          date: selectedDate,
          totalIncome: result.data.totalRevenue,
          totalExpense: result.data.totalExpense, // ✅ FIXED: Use actual expense (not COGS)
          netIncome: result.data.totalProfit,
          transactionCount: result.data.totalSoldItems,
          toko: result.data.toko || { revenue: 0, cogs: 0, profit: 0 },
          consignment: result.data.consignment || { grossRevenue: 0, cogs: 0, profit: 0 },
        });
      }
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    }
  };

  // Handler for TransactionModal component
  const handleTransactionSubmit = async (data: NewTransaction) => {
    if (!data.type || !data.amount || !data.description) {
      warning('Form Tidak Lengkap', 'Tipe, jumlah, dan deskripsi wajib diisi');
      return;
    }

    const amount = parseFloat(data.amount);
    if (amount <= 0) {
      warning('Jumlah Tidak Valid', 'Jumlah harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // REMOVED OLD AUTH - Now using NextAuth session cookies

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
          ...data,
          amount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setNewTransaction({
          type: 'INCOME',
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

  const handleTransactionModalClose = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
    setNewTransaction({
      type: 'INCOME',
      amount: '',
      description: '',
      category: '',
      paymentMethod: 'CASH',
      reference: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = await confirm({
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        // REMOVED OLD AUTH - Now using NextAuth session cookies

        const response = await fetch(`/api/financial/transactions/${transactionId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

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
    // Open detail modal to show products
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === '' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Export handlers
  const handleExportPDF = async () => {
    if (!dailySummary) {
      error('Data Kosong', 'Tidak ada data untuk diexport');
      return;
    }

    setIsExporting(true);
    try {
      // Enrich transactions with profit data
      const enrichedTransactions = enrichTransactionsWithProfit(filteredTransactions);
      
      // Calculate profit summary
      const profitData = calculateProfitData(filteredTransactions);
      
      // Prepare export data
      const exportData = {
        title: 'Laporan Keuangan Lengkap',
        period: showDatePicker
          ? `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`
          : financialPeriod === 'today' ? 'Hari Ini' : 
            financialPeriod === '7days' ? '7 Hari Terakhir' : 
            financialPeriod === '1month' ? '1 Bulan Terakhir' : '3 Bulan Terakhir',
        dateRange: showDatePicker ? {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0],
        } : undefined,
        summary: {
          totalRevenue: dailySummary.totalIncome,
          totalExpense: dailySummary.totalExpense,
          grossProfit: profitData.grossProfit,
          netProfit: profitData.netProfit,
          transactionCount: dailySummary.transactionCount,
        },
        transactions: enrichedTransactions.map(t => ({
          date: new Date(t.date).toLocaleDateString('id-ID'),
          type: t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
          description: t.description,
          category: t.category,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          profit: t.profit,
          margin: t.margin,
        })),
      };

      exportEnhancedFinancialPDF(exportData);
      success('Export PDF Berhasil', 'Laporan keuangan berhasil diexport');
    } catch (err) {
      console.error('PDF export error:', err);
      error('Export Gagal', 'Terjadi kesalahan saat export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!dailySummary) {
      error('Data Kosong', 'Tidak ada data untuk diexport');
      return;
    }

    setIsExporting(true);
    try {
      const enrichedTransactions = enrichTransactionsWithProfit(filteredTransactions);
      const profitData = calculateProfitData(filteredTransactions);
      
      const exportData = {
        title: 'Laporan Keuangan Lengkap',
        period: showDatePicker
          ? `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`
          : financialPeriod === 'today' ? 'Hari Ini' : 
            financialPeriod === '7days' ? '7 Hari Terakhir' : 
            financialPeriod === '1month' ? '1 Bulan Terakhir' : '3 Bulan Terakhir',
        dateRange: showDatePicker ? {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0],
        } : undefined,
        summary: {
          totalRevenue: dailySummary.totalIncome,
          totalExpense: dailySummary.totalExpense,
          grossProfit: profitData.grossProfit,
          netProfit: profitData.netProfit,
          transactionCount: dailySummary.transactionCount,
        },
        transactions: enrichedTransactions.map(t => ({
          date: new Date(t.date).toLocaleDateString('id-ID'),
          type: t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
          description: t.description,
          category: t.category,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          profit: t.profit,
          margin: t.margin,
        })),
      };

      exportEnhancedFinancialExcel(exportData);
      success('Export Excel Berhasil', 'Laporan keuangan berhasil diexport');
    } catch (err) {
      console.error('Excel export error:', err);
      error('Export Gagal', 'Terjadi kesalahan saat export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading while checking authorization
  if (authLoading) {
    return <Loading />;
  }

  // Show loading while fetching data
  if (loading && authorized) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pencatatan Keuangan</h1>
          <p className="text-gray-600 mt-1">Kelola transaksi dan laporan keuangan harian</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Date Range Picker */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </Button>
          
          {/* Export Buttons */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting || !dailySummary}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting || !dailySummary}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </Button>
          
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Catat Pemasukan/Pengeluaran
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      {showDatePicker && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  dateFormat="dd/MM/yyyy"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  dateFormat="dd/MM/yyyy"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button 
                  size="sm"
                  onClick={() => {
                    // Apply custom date range filter
                    setFinancialPeriod('today'); // Reset to trigger fetch
                    fetchTransactions();
                    success('Filter Diterapkan', 'Menampilkan data sesuai rentang tanggal');
                  }}
                >
                  Terapkan
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDatePicker(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary Card - Full Width */}
      {dailySummary && (
        <FinancialSummaryCard
          summary={dailySummary}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          financialPeriod={financialPeriod}
          onPeriodChange={setFinancialPeriod}
          isCustomDate={isCustomDate}
          onCustomDateToggle={setIsCustomDate}
        />
      )}

      {/* Financial Chart - HERO SECTION (Enlarged & Prominent) */}
      <FinancialChart 
        period={financialPeriod}
        transactions={transactions}
        dailySummary={dailySummary}
      />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <TransactionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            totalCount={filteredTransactions.length}
          />
        </CardHeader>
        <CardContent>
          <TransactionTable
            transactions={filteredTransactions}
            loading={loading}
            onView={handleViewTransaction}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onShowAddModal={() => setShowAddModal(true)}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={showAddModal}
        transaction={editingTransaction ? transactions.find(t => t.id === editingTransaction) : null}
        onClose={handleTransactionModalClose}
        onSubmit={handleTransactionSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={showDetailModal}
        transaction={selectedTransaction}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
      />

    </div>
  );
}
