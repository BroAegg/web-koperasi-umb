'use client';

import { useState, useEffect } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { ShoppingCart, Receipt, TrendingDown } from 'lucide-react';

export default function FinancialPage() {
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

  // Early return if not authorized
  useEffect(() => {
    if (!authLoading && !authorized) {
      window.location.href = '/login';
    }
  }, [authLoading, authorized]);

  useEffect(() => {
    if (authorized) {
      fetchTransactions();
      fetchFinancialSummary();
    }
  }, [financialPeriod, selectedDate, authorized]); // Trigger on period or date change

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
      const token = localStorage.getItem('token');
      if (!token) {
        error('Sesi Berakhir', 'Silakan login kembali');
        window.location.href = '/login';
        return;
      }

      // Use period API instead of date-specific API to follow dropdown period
      const response = await fetch(`/api/financial/period?period=${financialPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
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

  const fetchFinancialSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use period API to get summary data that respects the selected period
      const summaryResponse = await fetch(`/api/financial/period?period=${financialPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!summaryResponse.ok) {
        throw new Error(`API error: ${summaryResponse.status}`);
      }

      const summaryResult = await summaryResponse.json();
      
      if (summaryResult.success) {
        // Also fetch cumulative balance from summary API (all-time balance)
        const balanceResponse = await fetch(`/api/financial/summary?date=${selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const balanceResult = await balanceResponse.json();
        
        // Use period API data for income/expense (respects period selection)
        // But use summary API for cumulativeBalance (all-time)
        setDailySummary({
          date: selectedDate,
          totalIncome: summaryResult.data.totalRevenue || 0, // From period API
          totalExpense: summaryResult.data.totalExpense || 0, // From period API
          netIncome: (summaryResult.data.totalRevenue || 0) - (summaryResult.data.totalExpense || 0),
          transactionCount: summaryResult.data.transactions?.length || 0,
          cumulativeBalance: balanceResult.data?.cumulativeBalance || 0, // All-time balance
          breakdown: balanceResult.data?.breakdown || { kasToko: 0, simpanan: 0, pinjaman: 0, titipan: 0 },
          breakdownDetails: balanceResult.data?.breakdownDetails, // Detailed breakdown for tooltips
          topCashIn: balanceResult.data?.topCashIn || [],
          topCashOut: balanceResult.data?.topCashOut || [],
          updatedAt: balanceResult.data?.updatedAt || new Date().toISOString(),
          toko: { revenue: 0, cogs: 0, profit: 0 },
          consignment: { grossRevenue: 0, cogs: 0, profit: 0, feeTotal: 0 },
        });
      }
    } catch (err) {
      console.error('Error fetching financial summary:', err);
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
      const token = localStorage.getItem('token');
      if (!token) {
        error('Sesi Berakhir', 'Silakan login kembali');
        window.location.href = '/login';
        return;
      }

      const url = editingTransaction 
        ? `/api/financial/transactions/${editingTransaction}`
        : '/api/financial/transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
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
        fetchFinancialSummary();
        
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
        const token = localStorage.getItem('token');
        if (!token) {
          error('Sesi Berakhir', 'Silakan login kembali');
          window.location.href = '/login';
          return;
        }

        const response = await fetch(`/api/financial/transactions/${transactionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          success('Transaksi Dihapus', 'Transaksi berhasil dihapus');
          fetchTransactions();
          fetchFinancialSummary();
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pusat Keuangan Koperasi</h1>
          <p className="text-gray-600 mt-1">Dashboard keuangan menyeluruh dari semua sumber dana</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Laporan
          </Button>
        </div>
      </div>

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

      {/* Transaksi Terkini - Repositioned for better visibility */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Transaksi Terkini</h3>
                <p className="text-sm text-gray-600">5 transaksi terakhir periode ini</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Scroll to full table below
                document.getElementById('full-transaction-table')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionTable
            transactions={filteredTransactions.slice(0, 5)}
            loading={loading}
            onView={handleViewTransaction}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onShowAddModal={() => setShowAddModal(true)}
          />
        </CardContent>
      </Card>

      {/* Financial Chart - Net Cash Flow by Day */}
      <FinancialChart 
        period={financialPeriod}
        transactions={transactions}
        dailySummary={dailySummary}
      />

      {/* Full Transactions Table */}
      <Card id="full-transaction-table" className="scroll-mt-6">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-500 rounded-lg">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Semua Transaksi</h3>
              <p className="text-sm text-gray-600">Riwayat lengkap transaksi keuangan</p>
            </div>
          </div>
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

      {/* Floating Action Button - Bottom Right */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 z-50 group"
        aria-label="Catat Transaksi"
      >
        {/* FAB with gradient and shadow */}
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
          
          {/* Main FAB button */}
          <div className="relative flex items-center gap-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 active:scale-95">
            {/* Icon circle */}
            <div className="p-5">
              <Plus className="w-7 h-7" strokeWidth={3} />
            </div>
            
            {/* Expandable label */}
            <div className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-300 ease-out">
              <span className="font-bold text-base whitespace-nowrap pr-5">
                Catat Pemasukan/Pengeluaran
              </span>
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
        </div>
      </button>

    </div>
  );
}
