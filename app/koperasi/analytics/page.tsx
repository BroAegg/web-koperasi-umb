'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/use-auth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Award,
  Clock,
  Calendar,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

interface DashboardData {
  salesTrends: {
    totalRevenue: number;
    totalProfit: number;
    totalTransactions: number;
    growthRate: number;
  };
  bestSellers: {
    totalProducts: number;
    totalQuantitySold: number;
  };
  peakHours: {
    peakHour: { hour: number; label: string; transactionCount: number };
    peakDay: { day: string; transactionCount: number };
  };
  customers: {
    totalCustomers: number;
    averageSpent: number;
  };
}

export default function AnalyticsDashboardPage() {
  const { user, loading: authLoading, authorized } = useAuth(['SUPER_ADMIN', 'ADMIN']);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!authLoading && authorized) {
      fetchDashboardData();
    }
  }, [authLoading, authorized]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [salesRes, bestSellersRes, peakHoursRes, customersRes] = await Promise.all([
        fetch('/api/analytics/sales-trends?days=30'),
        fetch('/api/analytics/best-sellers?period=30days&limit=5'),
        fetch('/api/analytics/peak-hours?days=30'),
        fetch('/api/analytics/customers?period=30days&limit=10'),
      ]);

      const [sales, bestSellers, peakHours, customers] = await Promise.all([
        salesRes.json(),
        bestSellersRes.json(),
        peakHoursRes.json(),
        customersRes.json(),
      ]);

      if (sales.success && bestSellers.success && peakHours.success && customers.success) {
        setData({
          salesTrends: sales.data.summary,
          bestSellers: bestSellers.data.summary,
          peakHours: peakHours.data.insights,
          customers: customers.data.summary,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Unauthorized Access</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 text-sm">Ringkasan lengkap performa koperasi</p>
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Key Metrics Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.salesTrends.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {data.salesTrends.growthRate >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-xs font-semibold ${
                    data.salesTrends.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.salesTrends.growthRate > 0 ? '+' : ''}{data.salesTrends.growthRate}%
                  </span>
                  <span className="text-xs text-gray-500">vs periode sebelumnya</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Profit</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.salesTrends.totalProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Margin: {data.salesTrends.totalRevenue > 0 
                    ? ((data.salesTrends.totalProfit / data.salesTrends.totalRevenue) * 100).toFixed(1)
                    : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Transaksi</span>
                  <ShoppingCart className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.salesTrends.totalTransactions}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Avg: {formatCurrency(
                    data.salesTrends.totalRevenue / data.salesTrends.totalTransactions || 0
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pelanggan</span>
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.customers.totalCustomers}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Avg: {formatCurrency(data.customers.averageSpent)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Jam Tersibuk</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900 mb-1">
                      {data.peakHours.peakHour.label}
                    </p>
                    <p className="text-sm text-blue-700">
                      {data.peakHours.peakHour.transactionCount} transaksi
                    </p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Hari Teramai</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-900 mb-1">
                      {data.peakHours.peakDay.day}
                    </p>
                    <p className="text-sm text-purple-700">
                      {data.peakHours.peakDay.transactionCount} transaksi
                    </p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">Produk Terjual</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900 mb-1">
                      {data.bestSellers.totalQuantitySold}
                    </p>
                    <p className="text-sm text-green-700">
                      {data.bestSellers.totalProducts} produk berbeda
                    </p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <Award className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/koperasi/analytics/best-sellers">
              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-semibold text-gray-700">Produk Terlaris</span>
                      </div>
                      <p className="text-xs text-gray-500">Top performing products</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/koperasi/analytics/sales-trends">
              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Sales Trends</span>
                      </div>
                      <p className="text-xs text-gray-500">Grafik penjualan harian</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/koperasi/analytics/peak-hours">
              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-700">Peak Hours</span>
                      </div>
                      <p className="text-xs text-gray-500">Analisis waktu tersibuk</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/koperasi/analytics/customers">
              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-semibold text-gray-700">Customers</span>
                      </div>
                      <p className="text-xs text-gray-500">Top customers & insights</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              📊 Data periode: 30 hari terakhir | Last updated: {new Date().toLocaleString('id-ID')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
