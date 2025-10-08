'use client';

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

export default function DashboardPage() {
  // Mock data - nanti akan diganti dengan data dari API
  const stats = [
    { 
      title: "Total Anggota", 
      value: 130, 
      icon: Users, 
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      change: "+5%",
      changeType: "increase"
    },
    { 
      title: "Total Produk", 
      value: 45, 
      icon: Package, 
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "+12%",
      changeType: "increase"
    },
    { 
      title: "Stok Rendah", 
      value: 8, 
      icon: AlertTriangle, 
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      change: "-2",
      changeType: "decrease"
    },
    { 
      title: "Penjualan Hari Ini", 
      value: 2850000, 
      icon: DollarSign, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+18%",
      changeType: "increase",
      format: "currency"
    },
  ];

  const recentActivities = [
    { type: "member", action: "Anggota baru terdaftar", name: "Ahmad Surya", time: "5 menit lalu" },
    { type: "stock", action: "Stok produk ditambahkan", name: "Beras Premium 5kg", time: "15 menit lalu" },
    { type: "transaction", action: "Transaksi penjualan", name: "Rp 125.000", time: "30 menit lalu" },
    { type: "member", action: "Pembayaran simpanan", name: "Siti Aminah", time: "1 jam lalu" },
  ];

  const lowStockProducts = [
    { name: "Gula Pasir 1kg", stock: 5, threshold: 10, status: "critical" },
    { name: "Minyak Goreng 2L", stock: 8, threshold: 15, status: "warning" },
    { name: "Beras Premium 5kg", stock: 12, threshold: 20, status: "warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang di Sistem Koperasi UMB</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Laporan Bulanan
          </Button>
          <Button size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {recentActivities.map((activity, index) => (
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
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-600">
                      Stok: {product.stock} / Min: {product.threshold}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'critical' 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {product.status === 'critical' ? 'Kritis' : 'Rendah'}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
