// Transaction Detail Modal Component - Professional Design
// Shows full transaction details with enhanced UI/UX

import { Button } from '@/components/ui/button';
import { X, Package, Calendar, CreditCard, FileText, ShoppingCart, Hash, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import {
  getTransactionTypeLabel,
  getPaymentMethodLabel,
  getTransactionTypeColor,
  getTransactionTypeIcon,
  getPaymentMethodIcon
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
  const isIncome = transaction.type === 'SALE' || transaction.type === 'INCOME';
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header with Gradient */}
        <div className={`relative p-6 border-b overflow-hidden ${
          isIncome 
            ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500' 
            : 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500'
        }`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
                <div className="text-white">
                  {getTransactionTypeIcon(transaction.type)}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">Detail Transaksi</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-white/40">
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                  <span className="text-white/90 text-sm font-medium">
                    ID: {transaction.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 border-white/40 backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-105"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Enhanced Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-gradient-to-br from-gray-50 to-white">
          {/* Enhanced Amount Card */}
          <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 ${
            isIncome 
              ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200' 
              : 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-red-200'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                {isIncome ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {isIncome ? 'Total Pemasukan' : 'Total Pengeluaran'}
                </p>
              </div>
              <p className={`text-4xl font-black tracking-tight ${
                isIncome ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Transaction Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date Time Card */}
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Tanggal & Waktu</span>
              </div>
              <p className="font-bold text-gray-900 ml-11">
                {formatDate(new Date(transaction.date))}
              </p>
              <p className="text-sm text-gray-600 ml-11">
                {formatTime(new Date(transaction.createdAt))}
              </p>
            </div>
            
            {/* Payment Method Card */}
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Metode Bayar</span>
              </div>
              <div className="flex items-center gap-2 ml-11">
                {getPaymentMethodIcon(transaction.paymentMethod)}
                <p className="font-bold text-gray-900">
                  {getPaymentMethodLabel(transaction.paymentMethod)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Description Card */}
          {transaction.description && (
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-semibold text-gray-900">Deskripsi</span>
              </div>
              <p className="text-gray-700 leading-relaxed ml-11">
                {transaction.description}
              </p>
            </div>
          )}
          
          {/* Reference Number */}
          {transaction.reference && (
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Hash className="w-5 h-5 text-orange-600" />
                </div>
                <span className="font-semibold text-gray-900">Nomor Referensi</span>
              </div>
              <p className="font-mono text-gray-900 bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 ml-11 text-sm font-medium">
                {transaction.reference}
              </p>
            </div>
          )}
          
          {/* Enhanced Product Items */}
          {hasItems && transaction.items && (
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Daftar Produk</span>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {transaction.items.length} Item
                </span>
              </div>
              
              <div className="space-y-3">
                {transaction.items.map((item, index) => {
                  const productName = item.product?.name || item.productName || 'Produk';
                  const unitPrice = item.totalPrice / item.quantity;
                  
                  return (
                    <div 
                      key={item.id || index} 
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">{productName}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md font-medium">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-gray-500">×</span>
                            <span className="text-gray-600 font-medium">
                              {formatCurrency(unitPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Enhanced Subtotal */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-gray-200">
                <span className="font-bold text-gray-700 text-lg">Subtotal Produk</span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(
                    (transaction.items || []).reduce((sum, item) => sum + item.totalPrice, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Footer */}
        <div className="p-5 border-t bg-gradient-to-r from-gray-100 to-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Transaksi dibuat pada {formatDate(new Date(transaction.createdAt))}
          </p>
          <Button 
            onClick={onClose} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
