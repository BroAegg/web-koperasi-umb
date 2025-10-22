'use client';

import { useState, useEffect } from 'react';
import { useQuickHistory } from '@/hooks/useQuickHistory';
import { formatCurrency } from '@/lib/utils';
import { ChevronDown, ChevronUp, Printer, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReceiptModal from '@/components/transactions/ReceiptModal';

interface QuickTransactionHistoryProps {
  onReprint?: (transactionId: string) => void;
  refreshTrigger?: number; // Real-time refresh trigger
}

export default function QuickTransactionHistory({ onReprint, refreshTrigger }: QuickTransactionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { transactions, loading, error, refetch } = useQuickHistory();
  const router = useRouter();

  // Receipt modal state
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Real-time refresh when new transaction completed
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const handleViewAll = () => {
    router.push('/koperasi/transactions');
  };

  return (
    <div className="mt-6 border-t pt-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Transaksi Hari Ini</h3>
          {!loading && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {transactions.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Memuat transaksi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Coba Lagi
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Belum ada transaksi hari ini</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            #{transaction.receiptId}
                          </span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            {transaction.paymentMethod}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {transaction.customerName} · {transaction.itemCount} items · {formatTime(transaction.createdAt)}
                        </div>
                        <div className="mt-1 font-semibold text-gray-900">
                          {formatCurrency(transaction.totalAmount)}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePrint(transaction)}
                        className="ml-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <button
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Lihat Semua Transaksi</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
