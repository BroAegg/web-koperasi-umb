'use client';

import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { Search, Filter, Download, Printer, Eye, Trash2, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ReceiptModal from '@/components/transactions/ReceiptModal';
import { useAuth } from '@/lib/use-auth';
import { useNotification } from '@/lib/notification-context';
import { useDeveloper } from '@/contexts/DeveloperContext';

// Helper function to get transaction type label
const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'SALE':
      return { label: 'Penjualan POS', color: 'bg-green-100 text-green-700' };
    case 'EXPENSE':
      return { label: 'Pembayaran Titipan', color: 'bg-red-100 text-red-700' };
    case 'PURCHASE':
      return { label: 'Pembelian', color: 'bg-blue-100 text-blue-700' };
    case 'RETURN':
      return { label: 'Retur', color: 'bg-yellow-100 text-yellow-700' };
    case 'INCOME':
      return { label: 'Pemasukan', color: 'bg-purple-100 text-purple-700' };
    default:
      return { label: type, color: 'bg-gray-100 text-gray-700' };
  }
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();
  const { transactions, summary, pagination, loading, error, fetchTransactions } = useTransactions();
  const { isDeveloper: isDeveloperContext } = useDeveloper();
  
  // Filter state
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Receipt modal state
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Check if user is developer (real developer OR in developer context)
  const isDeveloper = user?.role === 'DEVELOPER' || isDeveloperContext;

  const handleViewReceipt = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
    // Print will be triggered by user clicking print button in modal
  };

  const handleDeleteTransaction = async (transactionId: string, receiptId: string) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Hapus transaksi #${receiptId}?\n\nPeringatan: Aksi ini akan menghapus transaksi secara permanen dan tidak dapat dibatalkan.\n\n⚠️ Fitur ini hanya untuk developer testing/cleanup.`
    );
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notifyError('Error', 'Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        success('Transaksi Dihapus', `Receipt #${receiptId} berhasil dihapus`);
        // Refresh transaction list
        fetchTransactions({
          search: debouncedSearch,
          dateFrom,
          dateTo,
          paymentMethods: selectedPaymentMethods,
          page: currentPage,
          limit: 50,
        });
      } else {
        notifyError('Error', result.error || 'Gagal menghapus transaksi');
      }
    } catch (err) {
      console.error('Delete transaction error:', err);
      notifyError('Error', 'Terjadi kesalahan saat menghapus transaksi');
    }
  };

  // Load transactions on mount and when filters change
  useEffect(() => {
    fetchTransactions({
      search: debouncedSearch, // Use debounced search
      dateFrom,
      dateTo,
      paymentMethods: selectedPaymentMethods,
      page: currentPage,
      limit: 50,
    });
  }, [debouncedSearch, dateFrom, dateTo, selectedPaymentMethods, currentPage, fetchTransactions]);

  const handleResetFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedPaymentMethods([]);
    setCurrentPage(1);
  };

  const hasActiveFilters = search || dateFrom || dateTo || selectedPaymentMethods.length > 0;

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">Kelola dan pantau semua transaksi POS</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Transaksi
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari receipt ID atau nama customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method Filters */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Metode Pembayaran:</span>
              <div className="flex gap-2">
                {['CASH', 'TRANSFER'].map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      if (selectedPaymentMethods.includes(method)) {
                        setSelectedPaymentMethods(selectedPaymentMethods.filter((m) => m !== method));
                      } else {
                        setSelectedPaymentMethods([...selectedPaymentMethods, method]);
                      }
                    }}
                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                      selectedPaymentMethods.includes(method)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons - Remove Apply Filter button */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Filter Aktif:</span>
                  {search && <span className="px-2 py-1 bg-blue-100 rounded">Search: "{search}"</span>}
                  {dateFrom && <span className="px-2 py-1 bg-blue-100 rounded">Dari: {dateFrom}</span>}
                  {dateTo && <span className="px-2 py-1 bg-blue-100 rounded">Sampai: {dateTo}</span>}
                  {selectedPaymentMethods.map((method) => (
                    <span key={method} className="px-2 py-1 bg-blue-100 rounded">{method}</span>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Hapus Semua Filter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Header KPI (4 kartu) */}
        {summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Gross Sales */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Gross Sales</div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {formatCurrency(summary.grossSales || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total nilai penjualan POS
                      </div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cash In (Operasional) */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Cash In (Operasional)</div>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        {formatCurrency(summary.cashInOperational || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Pemasukan kas operasional
                      </div>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Out (Operasional) */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Cash Out (Operasional)</div>
                      <div className="text-2xl font-bold text-red-600 mt-1">
                        {formatCurrency(summary.cashOutOperational || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Pengeluaran kas operasional
                      </div>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-8.707l3-3a1 1 0 011.414 1.414L9.414 11H13a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Net Cash Flow (Operasional) */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Net Cash Flow (Operasional)</div>
                      <div className={`text-2xl font-bold mt-1 ${(summary.netCashFlow || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.netCashFlow || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Cash In − Cash Out
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${(summary.netCashFlow || 0) >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      <svg className={`w-5 h-5 ${(summary.netCashFlow || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2V4a2 2 0 012-2h11a2 2 0 00-2-2H4z" clipRule="evenodd"/>
                        <path fillRule="evenodd" d="M15 4H9a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2zm-4.5 7a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pills Metode Pembayaran & Sumber Transaksi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Payment Methods Pills */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summary.paymentBreakdown || {}).map(([method, amount]) => (
                      <button
                        key={method}
                        onClick={() => {
                          // Toggle filter
                          const isSelected = selectedPaymentMethods.includes(method);
                          if (isSelected) {
                            setSelectedPaymentMethods(prev => prev.filter(m => m !== method));
                          } else {
                            setSelectedPaymentMethods(prev => [...prev, method]);
                          }
                          setCurrentPage(1); // Reset pagination
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedPaymentMethods.includes(method)
                            ? 'bg-teal-500 text-white'
                            : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                        }`}
                      >
                        {method} {formatCurrency(Number(amount))}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Sources Pills */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Sumber Transaksi</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summary.sourceBreakdown || {}).map(([type, amount]) => {
                      const typeInfo = getTransactionTypeLabel(type);
                      return (
                        <div
                          key={type}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${typeInfo.color}`}
                        >
                          {typeInfo.label} {formatCurrency(Number(amount))}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat transaksi...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchTransactions({
                  search,
                  dateFrom,
                  dateTo,
                  paymentMethods: selectedPaymentMethods,
                  page: currentPage,
                  limit: 50,
                })}>Coba Lagi</Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
                <p className="text-sm text-gray-400 mt-2">Coba ubah filter pencarian</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Receipt</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer/Supplier</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Aksi{isDeveloper && ' (Dev)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              #{transaction.receiptId}
                            </span>
                            <div className="text-xs text-gray-500">{transaction.itemCount} items</div>
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const typeInfo = getTransactionTypeLabel(transaction.type);
                              return (
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded ${typeInfo.color}`}
                                >
                                  {typeInfo.label}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {transaction.customerName}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(transaction.totalAmount)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                transaction.paymentMethod === 'CASH'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {transaction.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDateTime(transaction.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewReceipt(transaction)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {/* Delete button - ONLY for DEVELOPER role */}
                              {isDeveloper && (
                                <button
                                  onClick={() => handleDeleteTransaction(transaction.id, transaction.receiptId)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus Transaksi (Developer Only)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="p-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} dari {pagination.total} transaksi
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Export Button */}
        {transactions.length > 0 && (
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
