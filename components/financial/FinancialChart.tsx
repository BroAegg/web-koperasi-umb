// Financial Chart Component with Recharts
// Beautiful chart showing income vs expense trends based on selected period

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { Transaction, FinancialPeriod } from '@/types/financial';

interface FinancialChartProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  period: FinancialPeriod;
}

export function FinancialChart({
  transactions,
  totalIncome,
  totalExpense,
  netIncome,
  period
}: FinancialChartProps) {
  
  // Aggregate transactions based on period
  const aggregateData = () => {
    if (transactions.length === 0) return [];
    
    const dataMap: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      let key: string;
      
      // Determine grouping based on period
      switch (period) {
        case 'today':
          // Group by hour
          key = `${date.getHours().toString().padStart(2, '0')}:00`;
          break;
        case '7days':
          // Group by day (last 7 days)
          key = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          break;
        case '1month':
          // Group by day (last 30 days)
          key = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          break;
        case '3months':
        case '6months':
          // Group by week
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          break;
        case '1year':
          // Group by month
          key = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
          break;
        default:
          key = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      }
      
      if (!dataMap[key]) {
        dataMap[key] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
        dataMap[key].income += transaction.amount;
      } else if (transaction.type === 'PURCHASE' || transaction.type === 'EXPENSE') {
        dataMap[key].expense += transaction.amount;
      }
    });
    
    // Convert to array and sort
    return Object.entries(dataMap)
      .map(([time, data]) => ({
        time,
        pemasukan: data.income,
        pengeluaran: data.expense,
      }))
      .sort((a, b) => {
        // Simple string comparison works for our formatted dates
        if (period === 'today') {
          return a.time.localeCompare(b.time);
        }
        return 0; // Keep insertion order for date-based grouping
      })
      .slice(-20); // Limit to last 20 data points for readability
  };
  
  const chartData = aggregateData();
  
  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Hari Ini';
      case '7days': return '7 Hari Terakhir';
      case '1month': return '30 Hari Terakhir';
      case '3months': return '3 Bulan Terakhir';
      case '6months': return '6 Bulan Terakhir';
      case '1year': return '1 Tahun Terakhir';
      default: return 'Hari Ini';
    }
  };
  
  const getTimeLabel = () => {
    switch (period) {
      case 'today': return 'per jam';
      case '7days':
      case '1month': return 'per hari';
      case '3months':
      case '6months': return 'per minggu';
      case '1year': return 'per bulan';
      default: return 'per hari';
    }
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-700">{entry.name}</span>
              </span>
              <span className="font-bold" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Grafik Keuangan - {getPeriodLabel()}</h3>
            <p className="text-sm text-gray-600">Trend pemasukan & pengeluaran {getTimeLabel()}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Chart */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#d1d5db"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#d1d5db"
                tickLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="pemasukan"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#colorIncome)"
                name="Pemasukan"
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="pengeluaran"
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#colorExpense)"
                name="Pengeluaran"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">Belum ada data transaksi</p>
              <p className="text-gray-400 text-sm mt-1">untuk periode {getPeriodLabel().toLowerCase()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
