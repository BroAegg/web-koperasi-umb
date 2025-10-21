// Financial Chart Component with Recharts
// Beautiful line chart showing income vs expense trends

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { Transaction } from '@/types/financial';

interface FinancialChartProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
}

export function FinancialChart({
  transactions,
  totalIncome,
  totalExpense,
  netIncome
}: FinancialChartProps) {
  
  // Aggregate transactions by hour for today
  const aggregateByHour = () => {
    const hourlyData: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.forEach(transaction => {
      const hour = new Date(transaction.createdAt).getHours();
      const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourlyData[hourLabel]) {
        hourlyData[hourLabel] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
        hourlyData[hourLabel].income += transaction.amount;
      } else if (transaction.type === 'PURCHASE' || transaction.type === 'EXPENSE') {
        hourlyData[hourLabel].expense += transaction.amount;
      }
    });
    
    // Convert to array and fill missing hours
    const currentHour = new Date().getHours();
    const chartData = [];
    
    for (let i = 0; i <= currentHour; i++) {
      const hourLabel = `${i.toString().padStart(2, '0')}:00`;
      chartData.push({
        time: hourLabel,
        pemasukan: hourlyData[hourLabel]?.income || 0,
        pengeluaran: hourlyData[hourLabel]?.expense || 0,
      });
    }
    
    return chartData;
  };
  
  const chartData = aggregateByHour();
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                {entry.name}
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
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Grafik Keuangan Hari Ini</h3>
              <p className="text-xs text-gray-500">Trend pemasukan & pengeluaran per jam</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium mb-1">Total Pemasukan</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-700 font-medium mb-1">Total Pengeluaran</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${netIncome >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'} border`}>
            <p className={`text-xs font-medium mb-1 ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              Keuntungan Bersih
            </p>
            <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>
        
        {/* Line Chart */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                  return value;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="pemasukan"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#colorIncome)"
                name="Pemasukan"
              />
              <Area
                type="monotone"
                dataKey="pengeluaran"
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#colorExpense)"
                name="Pengeluaran"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Belum ada data transaksi hari ini</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
