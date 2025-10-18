'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  PlusCircle,
  Eye,
  Building2,
  Clock,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalProducts: number;
  lowStockProducts: number;
  todayTransactions: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalSimpanan: number;
  lowStockProductsList: any[];
  recentActivities: any[];
}

interface SuperAdminStats {
  totalSuppliers: number;
  pendingSuppliers: number;
  activeSuppliers: number;
  paymentPendingSuppliers: number;
  totalMembers: number;
  totalProducts: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  pendingStockVerification: number;
  recentSuppliers: any[];
}

export default function DashboardPage() {
  const { user } = useAuth(["ADMIN", "SUPER_ADMIN"]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [superAdminStats, setSuperAdminStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        fetchSuperAdminStats();
      } else {
        fetchDashboardStats();
      }
    }
  }, [user]);

  const fetchSuperAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/super-admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (response.ok) {
        setSuperAdminStats(result);
      } else {
        console.error('Failed to fetch super admin stats:', result.error);
      }
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Failed to fetch dashboard stats:', result.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats && !superAdminStats) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          Error loading dashboard data. Please try again.
        </div>
      </div>
    );
  }

  // Super Admin Dashboard
  if (user?.role === 'SUPER_ADMIN' && superAdminStats) {
    const superAdminDashboardStats = [
      { 
        title: "Total Supplier", 
        value: superAdminStats.totalSuppliers, 
        icon: Building2, 
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        subtitle: `${superAdminStats.activeSuppliers} Active`
      },
      { 
        title: "Pending Approval", 
        value: superAdminStats.pendingSuppliers, 
        icon: Clock, 
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        subtitle: "Supplier Baru"
      },
      { 
        title: "Payment Pending", 
        value: superAdminStats.paymentPendingSuppliers, 
        icon: DollarSign, 
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        subtitle: "Verifikasi Pembayaran"
      },
      { 
        title: "Total Produk", 
        value: superAdminStats.totalProducts, 
        icon: Package, 
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        subtitle: `${superAdminStats.lowStockProducts} Stok Rendah`
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Kelola supplier dan monitoring sistem</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              Laporan Bulanan
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {superAdminDashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-900">
                        {formatNumber(stat.value as number)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Suppliers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Supplier Terbaru</h3>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Semua
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {superAdminStats.recentSuppliers?.slice(0, 5).map((supplier: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{supplier.businessName}</p>
                      <p className="text-xs text-gray-600">{new Date(supplier.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : supplier.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {supplier.status}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.paymentStatus === 'PAID_APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : supplier.paymentStatus === 'PAID_PENDING_APPROVAL'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {supplier.paymentStatus === 'PAID_APPROVED' ? '✓ Paid' : 
                         supplier.paymentStatus === 'PAID_PENDING_APPROVAL' ? 'Pending' : 'Unpaid'}
                      </div>
                    </div>
                  </div>
                ))}
                {(!superAdminStats.recentSuppliers || superAdminStats.recentSuppliers.length === 0) && (
                  <p className="text-center text-gray-500 py-4">Belum ada supplier terbaru</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Statistik Sistem</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Total Member</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{formatNumber(superAdminStats.totalMembers)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-900">Total Produk</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{formatNumber(superAdminStats.totalProducts)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-gray-900">Stok Rendah</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600">{formatNumber(superAdminStats.lowStockProducts)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Revenue Bulan Ini</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(superAdminStats.monthlyRevenue || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for Super Admin */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col"
                onClick={() => window.location.href = '/koperasi/super-admin/suppliers'}
              >
                <Building2 className="w-6 h-6 mb-2 text-purple-600" />
                <span className="text-sm">Kelola Supplier</span>
                {superAdminStats.pendingSuppliers > 0 && (
                  <span className="text-xs text-amber-600 mt-1">
                    {superAdminStats.pendingSuppliers} Pending
                  </span>
                )}
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <Users className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-sm">Daftar Member</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <Package className="w-6 h-6 mb-2 text-emerald-600" />
                <span className="text-sm">Kelola Produk</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <TrendingUp className="w-6 h-6 mb-2 text-green-600" />
                <span className="text-sm">Laporan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard (existing code)
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          Error loading dashboard data. Please try again.
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { 
      title: "Total Anggota", 
      value: stats.totalMembers, 
      icon: Users, 
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      change: "+5%",
      changeType: "increase"
    },
    { 
      title: "Total Produk", 
      value: stats.totalProducts, 
      icon: Package, 
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "+12%",
      changeType: "increase"
    },
    { 
      title: "Stok Rendah", 
      value: stats.lowStockProducts, 
      icon: AlertTriangle, 
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      change: "-2",
      changeType: "decrease"
    },
    { 
      title: "Penjualan Hari Ini", 
      value: stats.todayRevenue, 
      icon: DollarSign, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+18%",
      changeType: "increase",
      format: "currency"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Selamat datang di Sistem Koperasi UM BANDUNG</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Laporan Bulanan</span>
            <span className="sm:hidden">Laporan</span>
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <PlusCircle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Transaksi Baru</span>
            <span className="sm:hidden">Transaksi</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stat.format === 'currency' 
                        ? formatCurrency(stat.value as number)
                        : formatNumber(stat.value as number)
                      }
                    </h3>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'member' ? 'bg-blue-500' :
                    activity.type === 'stock' ? 'bg-emerald-500' :
                    'bg-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-sm font-medium text-gray-600">{activity.name}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Peringatan Stok</h3>
              <Button variant="outline" size="sm">
                Kelola Stok
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockProductsList.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-600">
                      Stok: {product.stock} / Min: {product.threshold}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock <= product.threshold / 2
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {product.stock <= product.threshold / 2 ? 'Kritis' : 'Rendah'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Users className="w-6 h-6 mb-2 text-blue-600" />
              <span className="text-sm">Daftar Anggota</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Package className="w-6 h-6 mb-2 text-emerald-600" />
              <span className="text-sm">Tambah Produk</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <TrendingUp className="w-6 h-6 mb-2 text-amber-600" />
              <span className="text-sm">Laporan</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <DollarSign className="w-6 h-6 mb-2 text-green-600" />
              <span className="text-sm">Transaksi</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
