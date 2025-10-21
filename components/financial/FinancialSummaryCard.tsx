// Financial Summary Card Component
// Main summary card with period selector and key financial metrics

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Info, Calendar, ChevronDown, PiggyBank } from 'lucide-react';
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
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-green-50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Saldo Tersedia</h3>
            <p className="text-xs text-gray-600">{getPeriodDisplayLabel()}</p>
          </div>
          
          {/* Period Dropdown & Calendar - Compact */}
          <div className="flex items-center gap-1.5">
            {/* Period Selector Button with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700">
                  {getPeriodLabel()}
                </span>
                <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showPeriodDropdown && (
                <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[120px]">
                  <button
                    onClick={() => handlePeriodSelect('today')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${financialPeriod === 'today' && !isCustomDate ? 'bg-gray-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('7days')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${financialPeriod === '7days' ? 'bg-gray-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    7 Hari
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('1month')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${financialPeriod === '1month' ? 'bg-gray-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    1 Bulan
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('3months')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${financialPeriod === '3months' ? 'bg-gray-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    3 Bulan
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('6months')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${financialPeriod === '6months' ? 'bg-gray-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    6 Bulan
                  </button>
                  <button
                    onClick={() => handlePeriodSelect('1year')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${financialPeriod === '1year' ? 'bg-gray-50 text-blue-700 font-medium' : 'text-gray-700'}`}
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
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                title="Pilih tanggal"
              >
                <Calendar className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Period Display - Removed duplicate */}
        {/*<div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {getPeriodDisplayLabel()}
          </span>
        </div>*/}
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* PRIMARY: Saldo Tersedia - Vertical Layout */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 -left-4 w-24 h-24 bg-emerald-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -right-4 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            {/* Header - Centered */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg mb-3">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Saldo Tersedia</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-600">{summary.transactionCount} transaksi periode ini</p>
              </div>
            </div>
            
            {/* Amount - Large & Centered */}
            <div className="text-center mb-6">
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 bg-clip-text text-transparent mb-1">
                {formatCurrency(summary.netIncome)}
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${summary.netIncome > 0 ? 'bg-emerald-100 text-emerald-700' : summary.netIncome < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                {summary.netIncome > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">Surplus</span>
                  </>
                ) : summary.netIncome < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-semibold">Defisit</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold">Break Even</span>
                )}
              </div>
            </div>
            
            {/* Breakdown - Stacked Vertically */}
            <div className="space-y-3 mb-4">
              {/* Toko */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Toko</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(summary.toko?.profit || 0)}</span>
                </div>
              </div>
              
              {/* Titipan */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Titipan</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(summary.consignment?.profit || 0)}</span>
                </div>
              </div>
            </div>
            
            {/* Footer Info */}
            <div className="text-center pt-3 border-t border-emerald-200">
              <p className="text-xs text-gray-600">Data periode: {getPeriodDisplayLabel()}</p>
            </div>
          </div>
        </div>

        {/* SECONDARY: Enhanced Mutasi Cards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-bold text-gray-800">Mutasi Periode Ini</h4>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mutasi Masuk - Enhanced */}
            <div className="group relative bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-200/50 rounded-xl p-5 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mutasi Masuk</span>
                  <div className="p-2 bg-emerald-100 group-hover:bg-emerald-200 rounded-lg transition-colors">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-3xl font-black text-emerald-600 mb-2">
                  {formatCurrency(summary.totalIncome)}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Cash In periode ini</span>
                </div>
              </div>
            </div>
            
            {/* Mutasi Keluar - Enhanced */}
            <div className="group relative bg-gradient-to-br from-white to-red-50/30 border-2 border-red-200/50 rounded-xl p-5 hover:shadow-xl hover:border-red-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mutasi Keluar</span>
                  <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <p className="text-3xl font-black text-red-600 mb-2">
                  {formatCurrency(summary.totalExpense)}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Cash Out periode ini</span>
                </div>
              </div>
            </div>
            
            {/* Selisih - Enhanced */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200/50 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Selisih</span>
                  <div className={`p-2 rounded-lg transition-colors ${
                    (summary.totalIncome - summary.totalExpense) >= 0 
                      ? 'bg-blue-100 group-hover:bg-blue-200'
                      : 'bg-red-100 group-hover:bg-red-200'
                  }`}>
                    <DollarSign className={`h-4 w-4 ${
                      (summary.totalIncome - summary.totalExpense) >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
                <p className={`text-3xl font-black mb-2 ${
                  (summary.totalIncome - summary.totalExpense) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {(summary.totalIncome - summary.totalExpense) >= 0 ? '+' : ''}
                  {formatCurrency(summary.totalIncome - summary.totalExpense)}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    (summary.totalIncome - summary.totalExpense) >= 0 ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-600">Net Cash Flow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
