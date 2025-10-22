'use client';

import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { Search, Filter, Download, Printer, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ReceiptModal from '@/components/transactions/ReceiptModal';

export default function TransactionsPage() {
  const { transactions, summary, pagination, loading, error, fetchTransactions } = useTransactions();
  
  // Filter state
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Receipt modal state
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handleViewReceipt = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
    // Print will be triggered by user clicking print button in modal
  };

  // Load transactions on mount and when filters change
  useEffect(() => {
    fetchTransactions({
      search,
      dateFrom,
      dateTo,
      paymentMethods: selectedPaymentMethods,
      page: currentPage,
      limit: 50,
    });
  }, [currentPage]);

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page
    fetchTransactions({
      search,
      dateFrom,
      dateTo,
      paymentMethods: selectedPaymentMethods,
      page: 1,
      limit: 50,
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedPaymentMethods([]);
    setCurrentPage(1);
    fetchTransactions({
      page: 1,
      limit: 50,
    });
  };

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
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
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

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <Button onClick={handleApplyFilters} className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Terapkan Filter
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Pendapatan</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.totalRevenue)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalTransactions} transaksi
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Pembayaran Cash</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary.paymentBreakdown.CASH || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Pembayaran Transfer</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(summary.paymentBreakdown.TRANSFER || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Rata-rata Transaksi</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.averageTransaction)}
                </div>
              </CardContent>
            </Card>
          </div>
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
                <Button onClick={handleApplyFilters}>Coba Lagi</Button>
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
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
                              <button
                                onClick={() => handlePrintReceipt(transaction)}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Print Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
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
