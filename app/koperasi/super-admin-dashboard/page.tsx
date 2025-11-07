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
  Settings,
  FileText
} from 'lucide-react';

interface SuperAdminDashboardStats {
  suppliers: {
    total: number;
    pending: number;
    active: number;
    paymentPending: number;
  };
  members: {
    total: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  financial: {
    monthlyRevenue: number;
  };
  pending: {
    stockVerification: number;
    supplierApprovals: number;
    paymentVerification: number;
  };
}

interface BalanceSheetSummary {
  totalAktiva: number;
  totalPasiva: number;
  totalEkuitas: number;
  isBalanced: boolean;
}

export default function SuperAdminDashboardPage() {
  const { user, loading, authorized } = useAuth(['SUPER_ADMIN']);
  const [stats, setStats] = useState<SuperAdminDashboardStats | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authorized) {
      fetchSuperAdminStats();
      fetchBalanceSheetSummary();
    }
  }, [authorized]);

  const fetchBalanceSheetSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/financial/balance-sheet', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBalanceSheet({
          totalAktiva: data.aktiva.total,
          totalPasiva: data.pasiva.total,
          totalEkuitas: data.pasiva.ekuitas.subtotal,
          isBalanced: data.isBalanced
        });
      }
    } catch (error) {
      console.error('Error fetching balance sheet summary:', error);
    }
  };

  const fetchSuperAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/super-admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('API Error:', result.error);
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
                  {formatNumber(stats?.members?.total || 0)}
                </p>
                <p className="text-xs text-green-600">
                  Aktif
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
                  {formatCurrency(stats?.financial?.monthlyRevenue || 0)}
                </p>
                <p className="text-xs text-gray-600">
                  Pendapatan bulan ini
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
                <p className="text-sm font-medium text-gray-600">Pending Items</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(
                    (stats?.pending?.stockVerification || 0) + 
                    (stats?.pending?.supplierApprovals || 0) + 
                    (stats?.pending?.paymentVerification || 0)
                  )}
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
                  {formatNumber(
                    (stats?.products?.lowStock || 0) + 
                    (stats?.pending?.supplierApprovals || 0)
                  )}
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
              <span className="font-bold text-gray-900">{formatNumber(stats?.products?.total || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">Supplier Aktif</span>
              </div>
              <span className="font-bold text-gray-900">{formatNumber(stats?.suppliers?.total || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Pending Approvals</span>
              </div>
              <span className="font-bold text-gray-900">{formatNumber(stats?.pending?.supplierApprovals || 0)}</span>
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
                99.9%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Performance</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">
                95%
              </span>
            </div>
            
            {(stats?.products?.lowStock || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Stok Menipis</span>
                </div>
                <span className="text-sm text-orange-600 font-medium">
                  {stats?.products?.lowStock || 0} produk
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Neraca Summary */}
      {balanceSheet && (
        <Card className={`shadow-md border-2 ${balanceSheet.isBalanced ? 'border-green-500' : 'border-orange-500'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Ringkasan Neraca</h3>
                  <p className="text-sm text-slate-600">Balance Sheet Summary</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {balanceSheet.isBalanced ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <span className={`text-sm font-medium ${balanceSheet.isBalanced ? 'text-green-600' : 'text-orange-600'}`}>
                  {balanceSheet.isBalanced ? 'Balance' : 'Unbalanced'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Aktiva
                </p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(balanceSheet.totalAktiva)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Ekuitas
                </p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(balanceSheet.totalEkuitas)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total Pasiva
                </p>
                <p className="text-xl font-bold text-purple-900">
                  {formatCurrency(balanceSheet.totalPasiva)}
                </p>
              </div>
            </div>
            <Link href="/koperasi/financial/neraca">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Lihat Detail Neraca Lengkap
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

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