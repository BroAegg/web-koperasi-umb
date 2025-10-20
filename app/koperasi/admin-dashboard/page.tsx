'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DashboardLoadingSkeleton } from '@/components/ui/loading-skeleton';
import Link from 'next/link';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Clock,
  ShoppingCart,
  Plus,
  Eye,
  CreditCard
} from 'lucide-react';

interface AdminDashboardStats {
  todayTransactions: number;
  todayRevenue: number;
  lowStockProducts: number;
  totalProducts: number;
  pendingTransactions: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    soldToday: number;
    revenue: number;
  }>;
}

export default function AdminDashboardPage() {
  const { user, loading, authorized } = useAuth(['ADMIN']);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authorized) {
      fetchAdminStats();
    }
  }, [authorized]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin-dashboard');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !authorized) {
    return <DashboardLoadingSkeleton />;
  }

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Kasir</h1>
          <p className="text-gray-600">Selamat datang, {user?.name}</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/koperasi/pos">
            <Button className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Buka Kasir</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.todayTransactions || 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.todayRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Menipis</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(stats?.lowStockProducts || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalProducts || 0)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Aksi Cepat</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/koperasi/pos">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <CreditCard className="w-6 h-6" />
                <span>Mulai Transaksi</span>
              </Button>
            </Link>
            
            <Link href="/koperasi/inventory">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Package className="w-6 h-6" />
                <span>Cek Inventory</span>
              </Button>
            </Link>
            
            <Link href="/koperasi/inventory?lowStock=true">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <AlertTriangle className="w-6 h-6" />
                <span>Stok Menipis</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      {stats?.topSellingProducts && stats.topSellingProducts.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Produk Terlaris Hari Ini</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.soldToday} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}