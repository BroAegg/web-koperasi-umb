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
  netCashFlow: number; // Net = Income - Expense
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
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ FinancialChart: No auth token found - user not logged in');
        setChartData([]);
        setLoading(false);
        return;
      }

      console.log('📊 FinancialChart: Fetching chart data for period:', period);

      const response = await fetch(`/api/financial/period?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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
        const income = dataMap[key]?.income || 0;
        const expense = dataMap[key]?.expense || 0;
        result.push({
          label: key,
          income,
          expense,
          netCashFlow: income - expense,
        });
      }
      console.log('📊 FinancialChart: Hourly data (7AM-5PM):', result);
      return result;
    }
    
    const result = Object.entries(dataMap)
      .map(([label, data]) => ({
        label,
        income: data.income,
        expense: data.expense,
        netCashFlow: data.income - data.expense,
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

  // Calculate max absolute value for net cash flow (to handle both positive and negative)
  const maxAbsValue = Math.max(
    ...chartData.map(d => Math.abs(d.netCashFlow)),
    1
  );

  // Calculate baseline (zero line) - center it in the chart
  const baselineY = 250; // Middle of 500px height chart
  const scaleY = 200 / maxAbsValue; // Scale to fit in ±200px from baseline

  // Generate smooth path points for net cash flow
  const netCashFlowPoints = chartData.map((point, index) => ({
    x: 80 + (index * (680 / Math.max(chartData.length - 1, 1))),
    y: baselineY - (point.netCashFlow * scaleY), // Negative flow goes up, positive goes down
  }));

  const netCashFlowPath = createSmoothPath(netCashFlowPoints, 0.4);
  
  // Create area path (from baseline to line)
  const areaPath = netCashFlowPath + 
    ` L ${netCashFlowPoints[netCashFlowPoints.length - 1].x},${baselineY}` +
    ` L ${netCashFlowPoints[0].x},${baselineY}` +
    ' Z';

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
              <h3 className="text-2xl font-bold text-gray-900">Net Cash Flow</h3>
              <p className="text-sm text-gray-600 font-medium">{getPeriodLabel()}</p>
            </div>
          </div>
          
          {/* Enhanced Metrics Cards */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Net Cash Flow Card */}
            <div className={`px-4 py-3 rounded-xl shadow-md border-2 ${netProfit >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {netProfit >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Net Cash Flow</p>
                  <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
                  </p>
                  <p className="text-xs text-gray-500">Periode ini</p>
                </div>
              </div>
            </div>

            {/* Total Transactions Card */}
            <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Total Transaksi</p>
                  <p className="text-lg font-bold text-blue-600">{chartData.length} Periode</p>
                  <p className="text-xs text-gray-500">{salesCount} penjualan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700 font-medium">
              Surplus (Positif)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700 font-medium">
              Defisit (Negatif)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-400"></div>
            <span className="text-sm text-gray-700 font-medium">
              Baseline (Zero)
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
              {/* Positive cash flow gradient (green) */}
              <linearGradient id="positiveFlowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              {/* Negative cash flow gradient (red) */}
              <linearGradient id="negativeFlowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
              
              {/* Glow filter for line */}
              <filter id="glow-netflow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid Lines - centered around baseline */}
            <g className="grid-lines" opacity="0.6">
              {[-2, -1, 0, 1, 2].map(i => {
                const y = baselineY - (i * 80); // Grid every 80px
                const value = i * (maxAbsValue / 2);
                return (
                  <g key={i}>
                    <line 
                      x1="80" y1={y} x2="780" y2={y} 
                      stroke={i === 0 ? "#9ca3af" : "#e5e7eb"} 
                      strokeWidth={i === 0 ? "2" : "1"} 
                      strokeDasharray={i === 0 ? "0" : "6,4"} 
                    />
                    <text 
                      x="70" y={y + 5} 
                      textAnchor="end" 
                      className={`text-xs font-medium ${i === 0 ? 'fill-gray-700' : 'fill-gray-500'}`}
                    >
                      {formatCurrency(value)}
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

            {/* Net Cash Flow Area - Dynamic gradient based on positive/negative */}
            {chartData.length > 1 && (
              <>
                {/* Split area into positive and negative parts */}
                {chartData.map((point, index) => {
                  if (index === chartData.length - 1) return null;
                  
                  const x1 = netCashFlowPoints[index].x;
                  const y1 = netCashFlowPoints[index].y;
                  const x2 = netCashFlowPoints[index + 1].x;
                  const y2 = netCashFlowPoints[index + 1].y;
                  
                  // Determine if this segment is positive or negative
                  const isPositive = point.netCashFlow >= 0 && chartData[index + 1].netCashFlow >= 0;
                  const isNegative = point.netCashFlow <= 0 && chartData[index + 1].netCashFlow <= 0;
                  
                  if (isPositive || isNegative) {
                    const areaSegment = `M ${x1},${y1} L ${x2},${y2} L ${x2},${baselineY} L ${x1},${baselineY} Z`;
                    return (
                      <path
                        key={`area-${index}`}
                        d={areaSegment}
                        fill={isPositive ? 'url(#positiveFlowGradient)' : 'url(#negativeFlowGradient)'}
                        opacity="0.7"
                      />
                    );
                  }
                  return null;
                })}
              </>
            )}

            {/* Net Cash Flow Line - Smooth Curve with dynamic color */}
            <path
              d={netCashFlowPath}
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#glow-netflow)"
              className="transition-all duration-300"
            />

            {/* Data Points - Net Cash Flow */}
            {chartData.map((point, index) => {
              const x = netCashFlowPoints[index].x;
              const y = netCashFlowPoints[index].y;
              const isHovered = hoveredPoint?.index === index;
              const isPositive = point.netCashFlow >= 0;
              
              return (
                <g key={`netflow-${index}`}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isHovered ? 9 : 6}
                    fill={isPositive ? "#10b981" : "#ef4444"} 
                    stroke="white" 
                    strokeWidth="3"
                    className="transition-all duration-200 cursor-pointer drop-shadow-lg"
                    onMouseEnter={() => setHoveredPoint({ index, type: 'income' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 75}
                        y={y < baselineY ? y - 75 : y + 15}
                        width="150"
                        height="60"
                        fill="white"
                        stroke={isPositive ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        rx="8"
                        className="drop-shadow-xl"
                      />
                      <text 
                        x={x} 
                        y={y < baselineY ? y - 55 : y + 35} 
                        textAnchor="middle" 
                        className="text-xs fill-gray-600 font-medium"
                      >
                        {point.label}
                      </text>
                      <text 
                        x={x} 
                        y={y < baselineY ? y - 38 : y + 52} 
                        textAnchor="middle" 
                        className={`text-sm font-bold ${isPositive ? 'fill-green-600' : 'fill-red-600'}`}
                      >
                        {isPositive ? '+' : ''}{formatCurrency(point.netCashFlow)}
                      </text>
                      <text 
                        x={x} 
                        y={y < baselineY ? y - 22 : y + 68} 
                        textAnchor="middle" 
                        className="text-xs fill-gray-500"
                      >
                        {isPositive ? 'Surplus' : 'Defisit'}
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
