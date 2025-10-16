// Financial Metrics Card Component

'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TrendingUp, PiggyBank, Calendar, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { FinancialData, FinancialPeriod } from '@/types/inventory';

interface FinancialMetricsCardProps {
  financialData: FinancialData;
  financialPeriod: FinancialPeriod;
  selectedDate: string;
  isCustomDate: boolean;
  onPeriodChange: (period: FinancialPeriod) => void;
  onDateChange: (date: string) => void;
  onCustomDateToggle: (isCustom: boolean) => void;
}

export function FinancialMetricsCard({
  financialData,
  financialPeriod,
  selectedDate,
  isCustomDate,
  onPeriodChange,
  onDateChange,
  onCustomDateToggle,
}: FinancialMetricsCardProps) {
  
  const getPeriodDisplay = () => {
    if (isCustomDate) {
      return new Date(selectedDate).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    const periodLabels: Record<FinancialPeriod, string> = {
      'today': 'Hari Ini',
      '7days': '7 Hari',
      '1month': '1 Bulan',
      '3months': '3 Bulan',
      '6months': '6 Bulan',
      '1year': '1 Tahun',
    };
    
    return periodLabels[financialPeriod] || 'Hari Ini';
  };

  const getPeriodLabel = () => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    if (financialPeriod === 'today' && isToday) return 'Hari Ini';
    if (financialPeriod === '7days') return '7 Hari Terakhir';
    if (financialPeriod === '1month') return '30 Hari Terakhir';
    if (financialPeriod === '3months') return '3 Bulan Terakhir';
    if (financialPeriod === '6months') return '6 Bulan Terakhir';
    if (financialPeriod === '1year') return '1 Tahun Terakhir';
    
    return new Date(selectedDate).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="shadow-lg border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Omzet & Keuntungan</h3>
              <p className="text-xs text-gray-600">Analisis performa finansial</p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium hidden sm:inline">Periode:</span>
            <div className="flex items-center rounded-lg border border-blue-200 bg-white shadow-sm overflow-hidden relative">
              <div className="px-3 py-1.5 text-xs font-medium text-gray-700 pointer-events-none">
                {getPeriodDisplay()}
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
              
              {/* Calendar Input */}
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    onDateChange(e.target.value);
                    onCustomDateToggle(true);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button 
                  type="button"
                  className="px-2.5 py-1.5 border-l border-blue-100 text-gray-600 hover:bg-blue-50 transition-colors pointer-events-none"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Period Display Badge */}
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {getPeriodLabel()}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Omzet */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Total Omzet</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(financialData.totalRevenue)}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {financialData.totalSoldItems} produk terjual
              </span>
            </div>
          </div>
          
          {/* Keuntungan Bersih with Hover Tooltip */}
          <div className="space-y-2 border-l border-blue-100 pl-6 relative group">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Keuntungan Bersih</span>
              <PiggyBank className="h-4 w-4 text-green-500" />
              {/* Info Icon with Hover Tooltip */}
              <div className="relative">
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Toko:</span>
                      <span className="font-semibold">{formatCurrency(financialData.toko.profit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Titipan:</span>
                      <span className="font-semibold">{formatCurrency(financialData.consignment.profit)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-700">
                      <span className="font-medium text-emerald-300">Total:</span>
                      <span className="font-bold">{formatCurrency(financialData.totalProfit)}</span>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(financialData.totalProfit)}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Profit Margin:</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {financialData.totalRevenue > 0 ? ((financialData.totalProfit / financialData.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
          
          {/* Produk Terjual */}
          <div className="space-y-2 border-l border-blue-100 pl-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Produk Terjual</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{financialData.totalSoldItems}</p>
            <div className="text-xs text-gray-500">
              Rata-rata: {formatCurrency(financialData.totalSoldItems > 0 ? financialData.totalRevenue / financialData.totalSoldItems : 0)}/item
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
