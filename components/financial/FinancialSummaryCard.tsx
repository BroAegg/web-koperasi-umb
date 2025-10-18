// Financial Summary Card Component
// Main summary card with period selector and key financial metrics

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Info, Calendar, ChevronDown } from 'lucide-react';
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
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false);
      }
    };
    
    if (showPeriodDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodDropdown]);
  
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

  const handlePeriodSelect = (period: FinancialPeriod) => {
    onPeriodChange(period);
    onCustomDateToggle(false);
    setShowPeriodDropdown(false);
    
    if (period === 'today') {
      onDateChange(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
    onCustomDateToggle(true);
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
            
            {/* Period Selector Button with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-white shadow-sm hover:bg-blue-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700">
                  {getPeriodLabel()}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showPeriodDropdown && (
                <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                  <button
                    onClick={() => handlePeriodSelect('today')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === 'today' && !isCustomDate ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('7days')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '7days' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    7 Hari
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('1month')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '1month' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    1 Bulan
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('3months')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '3months' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    3 Bulan
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('6months')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '6months' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    6 Bulan
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('1year')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '1year' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    1 Tahun
                  </button>
                </div>
              )}
            </div>
            
            {/* Calendar Button */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Pilih tanggal"
              />
              <button 
                className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-gray-600 hover:bg-blue-50 transition-colors shadow-sm"
                title="Pilih tanggal"
              >
                <Calendar className="h-3.5 w-3.5" />
              </button>
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
                  {summary.netIncome > 0 ? (
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
                  ) : (
                    <div className="text-gray-400 text-center py-2">Belum ada keuntungan</div>
                  )}
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
