'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatDate, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';
import { useNotification } from '@/lib/notification-context';
import { getCategoryFromType } from '@/lib/financial-helpers';
import { TransactionFilters } from '@/components/financial/TransactionFilters';
import { FinancialSummaryCard } from '@/components/financial/FinancialSummaryCard';
import { FinancialMetricsCards } from '@/components/financial/FinancialMetricsCards';
import { TransactionTable } from '@/components/financial/TransactionTable';
import { TransactionModal } from '@/components/financial/TransactionModal';
import type { 
  Transaction,
  NewTransaction,
  DailySummary,
  FinancialPeriod
} from '@/types/financial';
import { 
  DollarSign,
  Plus,
  Download
} from 'lucide-react';

export default function FinancialPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>('today');
  const [isCustomDate, setIsCustomDate] = useState(false);
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
  }, [selectedDate, financialPeriod]);

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
      const response = await fetch(`/api/financial/period?period=today`);
      const result = await response.json();
      
      if (result.success) {
        // Map period API response to dailySummary format
        setDailySummary({
          date: selectedDate,
          totalIncome: result.data.totalRevenue,
          totalExpense: result.data.totalCOGS,
          netIncome: result.data.totalProfit,
          transactionCount: result.data.totalSoldItems,
          toko: result.data.toko || { revenue: 0, cogs: 0, profit: 0 },
          consignment: result.data.consignment || { grossRevenue: 0, cogs: 0, profit: 0, feeTotal: 0 },
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
    // Build detail message
    let detailMsg = `${formatCurrency(transaction.amount)}`;
    if (transaction.description) detailMsg += `\n${transaction.description}`;
    if (transaction.items && transaction.items.length > 0) {
      detailMsg += '\n\nProduk:';
      transaction.items.forEach(item => {
        const productName = item.product?.name || item.productName || 'Produk';
        detailMsg += `\n• ${productName} (${item.quantity}x) - ${formatCurrency(item.totalPrice)}`;
      });
    }
    
    success('Detail Transaksi', detailMsg);
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
          <FinancialSummaryCard
            summary={dailySummary}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            financialPeriod={financialPeriod}
            onPeriodChange={setFinancialPeriod}
            isCustomDate={isCustomDate}
            onCustomDateToggle={setIsCustomDate}
          />

          {/* SECONDARY: Other Metrics - 3 Cards in a Row */}
          <FinancialMetricsCards
            transactions={transactions}
            dailySummary={dailySummary}
          />
        </div>
      )}

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

    </div>
  );
}