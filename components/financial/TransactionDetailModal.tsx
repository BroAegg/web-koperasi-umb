// Transaction Detail Modal Component
// Shows full transaction details including product items for SALE transactions

import { Button } from '@/components/ui/button';
import { X, Package, Calendar, CreditCard, FileText, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import {
  getTransactionTypeLabel,
  getPaymentMethodLabel,
  getTransactionTypeColor,
  getTransactionTypeIcon
} from '@/lib/financial-helpers';
import type { Transaction } from '@/types/financial';

interface TransactionDetailModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionDetailModal({
  isOpen,
  transaction,
  onClose
}: TransactionDetailModalProps) {
  
  if (!isOpen || !transaction) return null;
  
  const hasItems = transaction.items && transaction.items.length > 0;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-b ${getTransactionTypeColor(transaction.type)} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              {getTransactionTypeIcon(transaction.type)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Detail Transaksi</h2>
              <p className="text-white/80 text-sm">{getTransactionTypeLabel(transaction.type)}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 border-white/30"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Tanggal & Waktu</span>
              </div>
              <p className="font-semibold text-gray-900">
                {formatDate(new Date(transaction.date))} • {formatTime(new Date(transaction.createdAt))}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <CreditCard className="w-4 h-4" />
                <span>Metode Pembayaran</span>
              </div>
              <p className="font-semibold text-gray-900">
                {getPaymentMethodLabel(transaction.paymentMethod)}
              </p>
            </div>
          </div>
          
          {/* Amount */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
            <p className={`text-3xl font-bold ${
              transaction.type === 'SALE' || transaction.type === 'INCOME' 
                ? 'text-emerald-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          
          {/* Description */}
          {transaction.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <FileText className="w-4 h-4" />
                <span>Deskripsi</span>
              </div>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {transaction.description}
              </p>
            </div>
          )}
          
          {/* Reference Number */}
          {transaction.reference && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Referensi</p>
              <p className="font-mono text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                {transaction.reference}
              </p>
            </div>
          )}
          
          {/* Product Items (Only for SALE transactions) */}
          {hasItems && transaction.items && (
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                <Package className="w-5 h-5" />
                <span>Daftar Produk ({transaction.items.length} item)</span>
              </div>
              
              <div className="space-y-2">
                {transaction.items.map((item, index) => {
                  const productName = item.product?.name || item.productName || 'Produk';
                  const unitPrice = item.totalPrice / item.quantity;
                  
                  return (
                    <div 
                      key={item.id || index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ShoppingCart className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{productName}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}x @ {formatCurrency(unitPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Subtotal */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-700">Subtotal Produk</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    (transaction.items || []).reduce((sum, item) => sum + item.totalPrice, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <Button onClick={onClose} variant="primary">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
