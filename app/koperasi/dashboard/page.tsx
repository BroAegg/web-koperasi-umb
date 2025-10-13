'use client';

import { useState, useEffect } from 'react';
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
  Eye
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
