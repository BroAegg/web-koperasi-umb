'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar } from 'lucide-react';

interface DailySales {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  averageTransaction: number;
}

interface SalesTrendsData {
  dailySales: DailySales[];
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalTransactions: number;
    growthRate: number;
    averageDaily: number;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

export default function SalesTrendsPage() {
  const { user, loading: authLoading, authorized } = useAuth(['SUPER_ADMIN', 'ADMIN']);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesTrendsData | null>(null);
  const [days, setDays] = useState('30');

  useEffect(() => {
    if (!authLoading && authorized) {
      fetchSalesTrends();
    }
  }, [authLoading, authorized, days]);

  const fetchSalesTrends = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/analytics/sales-trends?days=${days}`);

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching sales trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales trends...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const summary = data?.summary;
  const dailySales = data?.dailySales || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/koperasi/analytics" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Trends</h1>
            <p className="text-sm text-gray-500">Track your sales performance over time</p>
          </div>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.totalProfit)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.totalTransactions.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Growth Rate</p>
                <p className={`text-2xl font-bold mt-1 ${summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.growthRate >= 0 ? '+' : ''}{summary.growthRate.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${summary.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {summary.growthRate >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
        <div className="h-80 flex items-end justify-between gap-2">
          {dailySales.map((day, index) => {
            const maxRevenue = Math.max(...dailySales.map(d => d.totalRevenue));
            const height = maxRevenue > 0 ? (day.totalRevenue / maxRevenue) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative flex-1 w-full flex items-end">
                  <div 
                    className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${new Date(day.date).toLocaleDateString('id-ID')}: ${formatCurrency(day.totalRevenue)}`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(day.totalRevenue)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {new Date(day.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daily Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Transaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailySales.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(day.date).toLocaleDateString('id-ID', { 
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                    {formatCurrency(day.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                    {formatCurrency(day.totalProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {day.transactionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {formatCurrency(day.averageTransaction)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
