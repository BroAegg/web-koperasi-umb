// Financial Chart Component - Line Chart
// Dynamic chart that follows period dropdown selection

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, FinancialPeriod } from '@/types/financial';

interface FinancialChartProps {
  period: FinancialPeriod;
}

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

export function FinancialChart({ period }: FinancialChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    fetchChartData();
  }, [period]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financial/period?period=${period}`);
      const result = await response.json();
      
      if (result.success && result.data.transactions) {
        const transactions = result.data.transactions;
        setTotalIncome(result.data.totalRevenue || 0);
        setTotalExpense(result.data.totalExpense || 0);
        
        // Aggregate data based on period
        const aggregated = aggregateTransactions(transactions, period);
        setChartData(aggregated);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const aggregateTransactions = (transactions: Transaction[], period: FinancialPeriod): ChartDataPoint[] => {
    if (transactions.length === 0) return [];

    const dataMap: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      let key: string;
      
      switch (period) {
        case 'today':
          key = `${date.getHours().toString().padStart(2, '0')}:00`;
          break;
        
        case '7days':
        case '1month':
          const dayMonth = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          key = dayMonth;
          break;
        
        case '3months':
        case '6months':
          const weekNum = Math.ceil(date.getDate() / 7);
          const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
          key = `${monthName} M${weekNum}`;
          break;
        
        case '1year':
          key = date.toLocaleDateString('id-ID', { month: 'short' });
          break;
        
        default:
          key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }
      
      if (!dataMap[key]) {
        dataMap[key] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'SALE') {
        dataMap[key].income += transaction.amount;
      } else if (transaction.type === 'EXPENSE' || transaction.type === 'PURCHASE') {
        dataMap[key].expense += transaction.amount;
      }
    });
    
    return Object.entries(dataMap)
      .map(([label, data]) => ({
        label,
        income: data.income,
        expense: data.expense
      }));
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Hari Ini';
      case '7days': return '7 Hari Terakhir';
      case '1month': return '1 Bulan Terakhir';
      case '3months': return '3 Bulan Terakhir';
      case '6months': return '6 Bulan Terakhir';
      case '1year': return '1 Tahun Terakhir';
      default: return 'Periode';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold">Grafik Keuangan - {getPeriodLabel()}</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat data grafik...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold">Grafik Keuangan - {getPeriodLabel()}</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada data transaksi</p>
              <p className="text-gray-400 text-sm">untuk periode ini</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold">Grafik Keuangan - {getPeriodLabel()}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Pemasukan: {formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Pengeluaran: {formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] relative">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
            <g className="grid-lines">
              {[0, 1, 2, 3, 4].map(i => {
                const y = 50 + (i * 70);
                return (
                  <g key={i}>
                    <line x1="60" y1={y} x2="780" y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="50" y={y + 5} textAnchor="end" className="text-xs fill-gray-500">
                      {formatCurrency(maxValue * (1 - i * 0.25))}
                    </text>
                  </g>
                );
              })}
            </g>
            <g className="x-axis-labels">
              {chartData.map((point, index) => {
                const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
                return (
                  <text key={index} x={x} y="380" textAnchor="middle" className="text-xs fill-gray-600">
                    {point.label}
                  </text>
                );
              })}
            </g>
            <polyline
              points={chartData.map((point, index) => {
                const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
                const y = 330 - ((point.income / maxValue) * 280);
                return `${x},${y}`;
              }).join(' ')}
              fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            />
            <polyline
              points={chartData.map((point, index) => {
                const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
                const y = 330 - ((point.expense / maxValue) * 280);
                return `${x},${y}`;
              }).join(' ')}
              fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            />
            {chartData.map((point, index) => {
              const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
              const y = 330 - ((point.income / maxValue) * 280);
              return (
                <g key={`income-${index}`}>
                  <circle cx={x} cy={y} r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                  <title>{`${point.label}: ${formatCurrency(point.income)}`}</title>
                </g>
              );
            })}
            {chartData.map((point, index) => {
              const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
              const y = 330 - ((point.expense / maxValue) * 280);
              return (
                <g key={`expense-${index}`}>
                  <circle cx={x} cy={y} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
                  <title>{`${point.label}: ${formatCurrency(point.expense)}`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
