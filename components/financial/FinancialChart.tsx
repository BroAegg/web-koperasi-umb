// Financial Chart Component - Professional Line Chart with Smooth Curves
// Dynamic chart that follows period dropdown selection with beautiful gradients

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3, ShoppingCart, TrendingDown, DollarSign } from 'lucide-react';
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

// Helper function to create smooth SVG path with curves
function createSmoothPath(points: { x: number; y: number }[], tension: number = 0.3): string {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i > 0 ? i - 1 : i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    
    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;
    
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  
  return path;
}

export function FinancialChart({ period, transactions: propTransactions, dailySummary }: FinancialChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; type: 'income' | 'expense' } | null>(null);

  // Calculate metrics from transactions
  const salesTransactions = propTransactions?.filter(t => t.type === 'SALE') || [];
  const totalSalesAmount = salesTransactions.reduce((sum, t) => sum + t.amount, 0);
  const salesCount = salesTransactions.length;
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    fetchChartData();
  }, [period]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      console.log('📊 FinancialChart: Fetching chart data for period:', period);

      const response = await fetch(`/api/financial/period?period=${period}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('📊 FinancialChart: API Response:', {
        success: result.success,
        hasTransactions: !!result.data?.transactions,
        transactionsCount: result.data?.transactions?.length || 0,
        totalRevenue: result.data?.totalRevenue,
        totalExpense: result.data?.totalExpense,
      });

      if (result.success && result.data.transactions) {
        const transactions = result.data.transactions;
        setTotalIncome(result.data.totalRevenue || 0);
        setTotalExpense(result.data.totalExpense || 0);
        
        console.log('📊 FinancialChart: Processing', transactions.length, 'transactions');
        
        // Aggregate data based on period
        const aggregated = aggregateTransactions(transactions, period);
        
        console.log('📊 FinancialChart: Aggregated data points:', aggregated.length);
        console.log('📊 FinancialChart: Chart data:', aggregated);
        
        setChartData(aggregated);
      } else {
        console.warn('⚠️ FinancialChart: No transactions in response');
        setChartData([]);
      }
    } catch (err) {
      console.error('❌ FinancialChart: Error fetching chart data:', err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const aggregateTransactions = (transactions: any[], period: FinancialPeriod): ChartDataPoint[] => {
    if (transactions.length === 0) {
      console.log('⚠️ FinancialChart: No transactions to aggregate');
      return [];
    }

    console.log('📊 FinancialChart: Aggregating transactions:', transactions);

    const dataMap: { [key: string]: { income: number; expense: number } } = {};
    
    // For 'today' period, initialize all hours from 7 AM to 5 PM
    if (period === 'today') {
      for (let hour = 7; hour <= 17; hour++) {
        const key = `${hour.toString().padStart(2, '0')}:00`;
        dataMap[key] = { income: 0, expense: 0 };
      }
    }
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt || transaction.date);
      let key: string;
      
      switch (period) {
        case 'today':
          const hour = date.getHours();
          // Only include transactions between 7 AM and 5 PM
          if (hour >= 7 && hour <= 17) {
            key = `${hour.toString().padStart(2, '0')}:00`;
          } else {
            return; // Skip transactions outside business hours
          }
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
      
      // Use totalAmount from API response (could also be 'amount' for backward compatibility)
      const amount = Number(transaction.totalAmount || transaction.amount || 0);
      
      if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
        dataMap[key].income += amount;
      } else if (transaction.type === 'EXPENSE' || transaction.type === 'PURCHASE') {
        dataMap[key].expense += amount;
      }
    });
    
    // For 'today' period, ensure we return all hours in order
    if (period === 'today') {
      const result: ChartDataPoint[] = [];
      for (let hour = 7; hour <= 17; hour++) {
        const key = `${hour.toString().padStart(2, '0')}:00`;
        result.push({
          label: key,
          income: dataMap[key]?.income || 0,
          expense: dataMap[key]?.expense || 0,
        });
      }
      console.log('📊 FinancialChart: Hourly data (7AM-5PM):', result);
      return result;
    }
    
    const result = Object.entries(dataMap)
      .map(([label, data]) => ({
        label,
        income: data.income,
        expense: data.expense
      }));
    
    console.log('📊 FinancialChart: Aggregation result:', result);
    return result;
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

  // Generate smooth path points
  const incomePoints = chartData.map((point, index) => ({
    x: 80 + (index * (680 / Math.max(chartData.length - 1, 1))),
    y: 430 - ((point.income / maxValue) * 370),
  }));

  const expensePoints = chartData.map((point, index) => ({
    x: 80 + (index * (680 / Math.max(chartData.length - 1, 1))),
    y: 430 - ((point.expense / maxValue) * 370),
  }));

  const incomePath = createSmoothPath(incomePoints, 0.4);
  const expensePath = createSmoothPath(expensePoints, 0.4);

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      {/* Enhanced Header with Metrics */}
      <CardHeader className="border-b bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Grafik Keuangan</h3>
              <p className="text-sm text-gray-600 font-medium">{getPeriodLabel()}</p>
            </div>
          </div>
          
          {/* Enhanced Metrics Cards */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Net Profit Card */}
            <div className={`px-4 py-3 rounded-xl shadow-md border-2 ${netProfit >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Laba Bersih</p>
                  <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                  <p className="text-xs text-gray-500">Margin: {profitMargin}%</p>
                </div>
              </div>
            </div>

            {/* Sales Card */}
            <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Penjualan</p>
                  <p className="text-lg font-bold text-blue-600">{salesCount} Transaksi</p>
                  <p className="text-xs text-gray-500">{formatCurrency(totalSalesAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
            <span className="text-sm text-gray-700 font-medium">
              Pemasukan: <span className="font-bold text-emerald-600">{formatCurrency(totalIncome)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
            <span className="text-sm text-gray-700 font-medium">
              Pengeluaran: <span className="font-bold text-red-600">{formatCurrency(totalExpense)}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Enhanced Chart Area */}
      <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="h-[500px] relative">
          <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            {/* Gradients Definition */}
            <defs>
              <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
              
              {/* Glow filters */}
              <filter id="glow-income">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-expense">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid Lines */}
            <g className="grid-lines" opacity="0.6">
              {[0, 1, 2, 3, 4, 5].map(i => {
                const y = 50 + (i * 75);
                return (
                  <g key={i}>
                    <line 
                      x1="80" y1={y} x2="780" y2={y} 
                      stroke="#e5e7eb" 
                      strokeWidth="1" 
                      strokeDasharray="6,4" 
                    />
                    <text 
                      x="70" y={y + 5} 
                      textAnchor="end" 
                      className="text-xs fill-gray-500 font-medium"
                    >
                      {formatCurrency(maxValue * (1 - i * 0.2))}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* X-Axis Labels */}
            <g className="x-axis-labels">
              {chartData.map((point, index) => {
                const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
                return (
                  <text 
                    key={index} 
                    x={x} 
                    y="475" 
                    textAnchor="middle" 
                    className="text-xs fill-gray-600 font-medium"
                  >
                    {point.label}
                  </text>
                );
              })}
            </g>

            {/* Area fills with gradient */}
            {chartData.length > 1 && (
              <>
                <path
                  d={`${incomePath} L ${incomePoints[incomePoints.length - 1].x},430 L ${incomePoints[0].x},430 Z`}
                  fill="url(#incomeGradient)"
                  opacity="0.6"
                />
                <path
                  d={`${expensePath} L ${expensePoints[expensePoints.length - 1].x},430 L ${expensePoints[0].x},430 Z`}
                  fill="url(#expenseGradient)"
                  opacity="0.6"
                />
              </>
            )}

            {/* Income Line - Smooth Curve */}
            <path
              d={incomePath}
              fill="none" 
              stroke="#10b981" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#glow-income)"
              className="transition-all duration-300"
            />

            {/* Expense Line - Smooth Curve */}
            <path
              d={expensePath}
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#glow-expense)"
              className="transition-all duration-300"
            />

            {/* Data Points - Income */}
            {chartData.map((point, index) => {
              const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
              const y = 430 - ((point.income / maxValue) * 370);
              const isHovered = hoveredPoint?.index === index && hoveredPoint?.type === 'income';
              
              return (
                <g key={`income-${index}`}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isHovered ? 8 : 6}
                    fill="#10b981" 
                    stroke="white" 
                    strokeWidth="3"
                    className="transition-all duration-200 cursor-pointer drop-shadow-lg"
                    onMouseEnter={() => setHoveredPoint({ index, type: 'income' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 60}
                        y={y - 55}
                        width="120"
                        height="45"
                        fill="white"
                        stroke="#10b981"
                        strokeWidth="2"
                        rx="8"
                        className="drop-shadow-xl"
                      />
                      <text x={x} y={y - 35} textAnchor="middle" className="text-xs fill-gray-600 font-medium">
                        {point.label}
                      </text>
                      <text x={x} y={y - 20} textAnchor="middle" className="text-sm fill-emerald-600 font-bold">
                        {formatCurrency(point.income)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Data Points - Expense */}
            {chartData.map((point, index) => {
              const x = 80 + (index * (680 / Math.max(chartData.length - 1, 1)));
              const y = 430 - ((point.expense / maxValue) * 370);
              const isHovered = hoveredPoint?.index === index && hoveredPoint?.type === 'expense';
              
              return (
                <g key={`expense-${index}`}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isHovered ? 8 : 6}
                    fill="#ef4444" 
                    stroke="white" 
                    strokeWidth="3"
                    className="transition-all duration-200 cursor-pointer drop-shadow-lg"
                    onMouseEnter={() => setHoveredPoint({ index, type: 'expense' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 60}
                        y={y - 55}
                        width="120"
                        height="45"
                        fill="white"
                        stroke="#ef4444"
                        strokeWidth="2"
                        rx="8"
                        className="drop-shadow-xl"
                      />
                      <text x={x} y={y - 35} textAnchor="middle" className="text-xs fill-gray-600 font-medium">
                        {point.label}
                      </text>
                      <text x={x} y={y - 20} textAnchor="middle" className="text-sm fill-red-600 font-bold">
                        {formatCurrency(point.expense)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
