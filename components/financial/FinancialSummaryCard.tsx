// Financial Summary Card Component
// Main summary card with period selector and key financial metrics

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Info, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { DailySummary, FinancialPeriod } from '@/types/financial';

interface FinancialSummaryCardProps {
  summary: DailySummary;
  selectedDate: string;
  onDateChange: (date: string) => void;
  financialPeriod: FinancialPeriod;
  onPeriodChange: (period: FinancialPeriod) => void;
  isCustomDate: boolean;
  onCustomDateToggle: (isCustom: boolean) => void;
}

export function FinancialSummaryCard({
  summary,
  selectedDate,
  onDateChange,
  financialPeriod,
  onPeriodChange,
  isCustomDate,
  onCustomDateToggle
}: FinancialSummaryCardProps) {
  
  const getPeriodLabel = () => {
    if (isCustomDate) {
      return new Date(selectedDate).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    switch (financialPeriod) {
      case 'today': return 'Hari Ini';
      case '7days': return '7 Hari';
      case '1month': return '1 Bulan';
      case '3months': return '3 Bulan';
      case '6months': return '6 Bulan';
      case '1year': return '1 Tahun';
      default: return 'Hari Ini';
    }
  };

  const getPeriodDisplayLabel = () => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today && !isCustomDate;
    
    if (!isToday && isCustomDate) {
      return formatDate(new Date(selectedDate));
    }
    
    switch (financialPeriod) {
      case 'today': return 'Hari Ini';
      case '7days': return '7 Hari Terakhir';
      case '1month': return '30 Hari Terakhir';
      case '3months': return '3 Bulan Terakhir';
      case '6months': return '6 Bulan Terakhir';
      case '1year': return '1 Tahun Terakhir';
      default: return 'Hari Ini';
    }
  };

  return (
    <Card className="border border-blue-200 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="border-b border-blue-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ringkasan Keuangan</h3>
              <p className="text-xs text-gray-600">Analisis performa keuangan harian</p>
            </div>
          </div>
          
          {/* Period Dropdown & Calendar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium hidden sm:inline">Periode:</span>
            <div className="flex items-center rounded-lg border border-blue-200 bg-white shadow-sm overflow-hidden relative">
              {/* Display current period or custom date */}
              <div className="px-3 py-1.5 text-xs font-medium text-gray-700 pointer-events-none">
                {getPeriodLabel()}
              </div>
              <select
                value={isCustomDate ? 'custom' : financialPeriod}
                onChange={(e) => {
                  const newPeriod = e.target.value as FinancialPeriod;
                  if (newPeriod === 'custom' as any) return;
                  
                  onPeriodChange(newPeriod);
                  onCustomDateToggle(false);
                  
                  if (newPeriod === 'today') {
                    onDateChange(new Date().toISOString().split('T')[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="today">Hari Ini</option>
                <option value="7days">7 Hari</option>
                <option value="1month">1 Bulan</option>
                <option value="3months">3 Bulan</option>
                <option value="6months">6 Bulan</option>
                <option value="1year">1 Tahun</option>
              </select>
              
              {/* Calendar Date Input */}
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    onDateChange(e.target.value);
                    onCustomDateToggle(true);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Pilih tanggal"
                />
                <button 
                  type="button"
                  className="px-2.5 py-1.5 border-l border-blue-100 text-gray-600 hover:bg-blue-50 transition-colors"
                  title="Pilih tanggal"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Period Display */}
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {getPeriodDisplayLabel()}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Pemasukan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Total Pemasukan</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(summary.totalIncome)}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +15% dari periode sebelumnya
              </span>
            </div>
          </div>
          
          {/* Total Pengeluaran */}
          <div className="space-y-2 border-l border-blue-100 pl-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Total Pengeluaran</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(summary.totalExpense)}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Efisiensi:</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {summary.totalIncome > 0 
                  ? ((1 - summary.totalExpense / summary.totalIncome) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
          
          {/* Keuntungan Bersih */}
          <div className="space-y-2 border-l border-blue-100 pl-6 relative group">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Keuntungan Bersih</span>
              <DollarSign className="h-4 w-4 text-blue-500" />
              {/* Info Icon with Hover Tooltip */}
              <div className="relative">
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Toko:</span>
                      <span className="font-semibold">{formatCurrency(summary.toko?.profit || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Titipan:</span>
                      <span className="font-semibold">{formatCurrency(summary.consignment?.profit || 0)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-700">
                      <span className="font-medium text-emerald-300">Total:</span>
                      <span className="font-bold">{formatCurrency(summary.netIncome)}</span>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <p className={`text-3xl font-bold ${
              summary.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.netIncome)}
            </p>
            <p className="text-xs text-gray-500">
              {summary.transactionCount} transaksi periode ini
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
