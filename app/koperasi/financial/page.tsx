'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading, CardSkeleton } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
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
  X
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'INCOME';
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

  useEffect(() => {
    fetchTransactions();
    fetchDailySummary();
  }, [selectedDate]);

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
    // You can implement a detailed transaction view modal here
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
        return '💵';
      case 'TRANSFER':
        return '🏦';
      case 'CREDIT':
        return '💳';
      default:
        return '💰';
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Tanggal:</label>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Input
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                className="w-64"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary Cards */}
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pemasukan</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    {formatCurrency(dailySummary.totalIncome)}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pengeluaran</p>
                  <h3 className="text-2xl font-bold text-red-600">
                    {formatCurrency(dailySummary.totalExpense)}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Keuntungan Bersih</p>
                  <h3 className={`text-2xl font-bold ${
                    dailySummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(dailySummary.netIncome)}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${
                  dailySummary.netIncome >= 0 ? 'bg-blue-50' : 'bg-red-50'
                }`}>
                  <DollarSign className={`w-6 h-6 ${
                    dailySummary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dailySummary.transactionCount}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <Receipt className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Transaksi {formatDate(new Date(selectedDate))} ({filteredTransactions.length})
          </h3>
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
                Tambah Transaksi Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe & Deskripsi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode Bayar</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                          {getTransactionTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type === 'SALE' ? 'Penjualan' :
                             transaction.type === 'INCOME' ? 'Pemasukan' :
                             transaction.type === 'PURCHASE' ? 'Pembelian' : 'Pengeluaran'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{transaction.category || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${
                        transaction.type === 'SALE' || transaction.type === 'INCOME' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'SALE' || transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                        <span className="text-gray-600">
                          {transaction.paymentMethod === 'CASH' ? 'Tunai' :
                           transaction.paymentMethod === 'TRANSFER' ? 'Transfer' : 'Kredit'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600 text-sm">
                        {new Date(transaction.createdAt).toLocaleTimeString('id-ID')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-blue-600 hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-amber-600 hover:bg-amber-50"
                          title="Edit Transaksi"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingTransaction ? 'Update Transaksi' : 'Tambah Transaksi Baru'}
              </h3>
              <Button variant="outline" onClick={() => {
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
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-6">
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
                    <option value="SALE">Penjualan</option>
                    <option value="INCOME">Pemasukan Lain</option>
                    <option value="PURCHASE">Pembelian</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah *
                  </label>
                  <Input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
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
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <Input
                    type="text"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    placeholder="Kategori transaksi"
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
                    Referensi
                  </label>
                  <Input
                    type="text"
                    value={newTransaction.reference}
                    onChange={(e) => setNewTransaction({ ...newTransaction, reference: e.target.value })}
                    placeholder="No. invoice, kode, dll"
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
      )}
    </div>
  );
}