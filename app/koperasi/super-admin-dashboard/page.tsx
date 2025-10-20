'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DashboardLoadingSkeleton } from '@/components/ui/loading-skeleton';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Building2,
  CheckCircle,
  BarChart3,
  Settings
} from 'lucide-react';

interface SuperAdminDashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalProducts: number;
  lowStockProducts: number;
  todayTransactions: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalSimpanan: number;
  totalSuppliers: number;
  pendingApprovals: number;
  systemHealth: {
    uptime: string;
    performance: number;
  };
}

export default function SuperAdminDashboardPage() {
  const { user, loading, authorized } = useAuth(['SUPER_ADMIN']);
  const [stats, setStats] = useState<SuperAdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authorized) {
      fetchSuperAdminStats();
    }
  }, [authorized]);

  const fetchSuperAdminStats = async () => {
    try {
      const response = await fetch('/api/super-admin/dashboard');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching super admin dashboard:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.name}</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/koperasi/settings">
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalMembers || 0)}
                </p>
                <p className="text-xs text-green-600">
                  {formatNumber(stats?.activeMembers || 0)} aktif
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
                <p className="text-xs text-gray-600">
                  Hari ini: {formatCurrency(stats?.todayRevenue || 0)}
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
                <p className="text-sm font-medium text-gray-600">Total Simpanan</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats?.totalSimpanan || 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perlu Perhatian</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber((stats?.lowStockProducts || 0) + (stats?.pendingApprovals || 0))}
                </p>
                <p className="text-xs text-gray-600">
                  Stok & Approval
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Operations */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Operasional Bisnis</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Total Produk</span>
              </div>
              <span className="font-bold text-gray-900">{formatNumber(stats?.totalProducts || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">Supplier Aktif</span>
              </div>
              <span className="font-bold text-gray-900">{formatNumber(stats?.totalSuppliers || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Transaksi Hari Ini</span>
              </div>
              <span className="font-bold text-gray-900">{formatNumber(stats?.todayTransactions || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Status Sistem</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Sistem Online</span>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {stats?.systemHealth?.uptime || '99.9%'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Performance</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {stats?.systemHealth?.performance || 95}%
              </span>
            </div>
            
            {(stats?.lowStockProducts || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Stok Menipis</span>
                </div>
                <span className="text-sm text-orange-600 font-medium">
                  {stats?.lowStockProducts || 0} produk
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Manajemen Cepat</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/koperasi/financial">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <DollarSign className="w-6 h-6" />
                <span>Keuangan</span>
              </Button>
            </Link>
            
            <Link href="/koperasi/inventory">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Package className="w-6 h-6" />
                <span>Inventory</span>
              </Button>
            </Link>
            
            <Link href="/koperasi/super-admin/suppliers">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Building2 className="w-6 h-6" />
                <span>Suppliers</span>
              </Button>
            </Link>
            
            <Link href="/koperasi/broadcast">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Calendar className="w-6 h-6" />
                <span>Broadcast</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}