'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Package, DollarSign, ShoppingCart, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface BestSellerCardProps {
  product: ProductSalesData;
  rank: number;
}

export function BestSellerCard({ product, rank }: BestSellerCardProps) {
  const getTrendIcon = () => {
    switch (product.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (product.trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRankBadge = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {getRankBadge()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {product.productName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{product.productCode}</span>
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-semibold">
              {product.trendPercentage > 0 ? '+' : ''}{product.trendPercentage}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Terjual</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {product.totalQuantitySold}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {product.transactionCount} transaksi
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Revenue</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(product.totalRevenue)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Profit: {formatCurrency(product.totalProfit)}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
          <span>Harga Rata-rata: {formatCurrency(product.averagePrice)}</span>
          <span>
            Terakhir: {new Date(product.lastSoldAt).toLocaleDateString('id-ID')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface BestSellersGridProps {
  products: ProductSalesData[];
  loading?: boolean;
}

export function BestSellersGrid({ products, loading }: BestSellersGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada data penjualan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
        <BestSellerCard
          key={product.productId}
          product={product}
          rank={index + 1}
        />
      ))}
    </div>
  );
}

interface SummaryStatsProps {
  summary: {
    totalProducts: number;
    totalQuantitySold: number;
    totalRevenue: number;
    totalProfit: number;
    period: string;
  };
}

export function BestSellersSummary({ summary }: SummaryStatsProps) {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7days':
        return '7 Hari Terakhir';
      case '30days':
        return '30 Hari Terakhir';
      case '90days':
        return '90 Hari Terakhir';
      case 'all':
        return 'Semua Waktu';
      default:
        return period;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Produk</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">{getPeriodLabel(summary.period)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Terjual</span>
            <ShoppingCart className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalQuantitySold}
          </p>
          <p className="text-xs text-gray-500 mt-1">Unit</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Pendapatan</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Profit</span>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Keuntungan</p>
        </CardContent>
      </Card>
    </div>
  );
}
