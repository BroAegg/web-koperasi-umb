'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/use-auth';
import { BestSellersGrid, BestSellersSummary } from '@/components/analytics/BestSellers';
import { TrendingUp, Download, Filter } from 'lucide-react';

interface ProductSalesData {
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  averagePrice: number;
  lastSoldAt: Date;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface BestSellersData {
  products: ProductSalesData[];
  summary: {
    totalProducts: number;
    totalQuantitySold: number;
    totalRevenue: number;
    totalProfit: number;
    period: string;
    startDate: Date;
    endDate: Date;
  };
}

export default function BestSellersPage() {
  const { user, loading: authLoading, authorized } = useAuth(['SUPER_ADMIN', 'ADMIN']);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BestSellersData | null>(null);
  const [period, setPeriod] = useState('7days');
  const [sortBy, setSortBy] = useState('quantity');
  const [limit, setLimit] = useState('10');

  useEffect(() => {
    if (!authLoading && authorized) {
      fetchBestSellers();
    }
  }, [authLoading, authorized, period, sortBy, limit]);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        period,
        sortBy,
        limit,
      });

      const response = await fetch(`/api/analytics/best-sellers?${params}`);

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;

    // Create CSV content
    const headers = [
      'Rank',
      'Product Code',
      'Product Name',
      'Category',
      'Quantity Sold',
      'Revenue',
      'Profit',
      'Transactions',
      'Avg Price',
      'Trend',
      'Trend %',
    ];

    const rows = data.products.map((product, index) => [
      index + 1,
      product.productCode,
      product.productName,
      product.category,
      product.totalQuantitySold,
      product.totalRevenue,
      product.totalProfit,
      product.transactionCount,
      product.averagePrice.toFixed(2),
      product.trend,
      product.trendPercentage,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `best-sellers-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (authLoading) {
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Produk Terlaris
              </h1>
              <p className="text-gray-600 text-sm">
                Analisis produk dengan penjualan terbaik
              </p>
            </div>
          </div>
          <Button onClick={handleExport} disabled={!data || loading}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Periode:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
                <option value="90days">90 Hari Terakhir</option>
                <option value="all">Semua Waktu</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Urutkan:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quantity">Kuantitas Terjual</option>
                <option value="revenue">Total Revenue</option>
                <option value="profit">Total Profit</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tampilkan:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {data && <BestSellersSummary summary={data.summary} />}

      {/* Best Sellers Grid */}
      {data && <BestSellersGrid products={data.products} loading={loading} />}
    </div>
  );
}
