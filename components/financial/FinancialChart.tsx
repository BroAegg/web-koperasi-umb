// Financial Chart Component - Line Chart
// Dynamic chart that follows period dropdown selection

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, FinancialPeriod, DailySummary } from '@/types/financial';

interface FinancialChartProps {
  period: FinancialPeriod;
  transactions?: Transaction[];
  dailySummary?: DailySummary | null;
}

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

export function FinancialChart({ period, transactions: propTransactions, dailySummary }: FinancialChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Calculate metrics from transactions
  const salesTransactions = propTransactions?.filter(t => t.type === 'SALE') || [];
  const totalSalesAmount = salesTransactions.reduce((sum, t) => sum + t.amount, 0);
  const salesCount = salesTransactions.length;

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
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Grafik Keuangan</h3>
              <p className="text-sm text-gray-600">{getPeriodLabel()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Memuat data grafik...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-400 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Grafik Keuangan</h3>
              <p className="text-sm text-gray-600">{getPeriodLabel()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">Tidak ada data transaksi</p>
              <p className="text-gray-400">untuk periode ini</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Grafik Keuangan</h3>
              <p className="text-sm text-gray-600">{getPeriodLabel()}</p>
            </div>
          </div>
          
          {/* Integrated Metrics - Sales Card Only */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-2 bg-green-50 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Transaksi Penjualan</p>
                <p className="text-lg font-bold text-gray-900">{salesCount}</p>
                <p className="text-xs text-green-600">{formatCurrency(totalSalesAmount)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">Pemasukan: <span className="font-semibold">{formatCurrency(totalIncome)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Pengeluaran: <span className="font-semibold">{formatCurrency(totalExpense)}</span></span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[500px] relative">{/* ⬅️ INCREASED FROM 400px to 500px */}
          <svg className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            <g className="grid-lines">
              {[0, 1, 2, 3, 4, 5].map(i => {
                const y = 50 + (i * 75);
                return (
                  <g key={i}>
                    <line x1="60" y1={y} x2="780" y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="50" y={y + 5} textAnchor="end" className="text-xs fill-gray-500">
                      {formatCurrency(maxValue * (1 - i * 0.2))}
                    </text>
                  </g>
                );
              })}
            </g>
            <g className="x-axis-labels">
              {chartData.map((point, index) => {
                const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
                return (
                  <text key={index} x={x} y="480" textAnchor="middle" className="text-xs fill-gray-600">
                    {point.label}
                  </text>
                );
              })}
            </g>
            <polyline
              points={chartData.map((point, index) => {
                const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
                const y = 430 - ((point.income / maxValue) * 370);
                return `${x},${y}`;
              }).join(' ')}
              fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            />
            <polyline
              points={chartData.map((point, index) => {
                const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
                const y = 430 - ((point.expense / maxValue) * 370);
                return `${x},${y}`;
              }).join(' ')}
              fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            />
            {chartData.map((point, index) => {
              const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
              const y = 430 - ((point.income / maxValue) * 370);
              return (
                <g key={`income-${index}`}>
                  <circle cx={x} cy={y} r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                  <title>{`${point.label}: ${formatCurrency(point.income)}`}</title>
                </g>
              );
            })}
            {chartData.map((point, index) => {
              const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
              const y = 430 - ((point.expense / maxValue) * 370);
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
