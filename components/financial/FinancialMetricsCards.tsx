// Financial Metrics Cards Component
// 3 secondary metric cards: Sales, Payment Methods, Average Transaction

import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, CreditCard, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, DailySummary } from '@/types/financial';

interface FinancialMetricsCardsProps {
  transactions: Transaction[];
  dailySummary: DailySummary;
}

export function FinancialMetricsCards({
  transactions,
  dailySummary
}: FinancialMetricsCardsProps) {
  const salesTransactions = transactions.filter(t => t.type === 'SALE');
  const cashTransactions = transactions.filter(t => t.paymentMethod === 'CASH');
  const totalSalesAmount = salesTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = dailySummary.transactionCount > 0 
    ? dailySummary.totalIncome / dailySummary.transactionCount 
    : 0;

  return (
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
              {salesTransactions.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(totalSalesAmount)}
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
              {cashTransactions.length}
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
              {formatCurrency(averageTransaction)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              per transaksi hari ini
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
