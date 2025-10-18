"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => d.success && setData(d.data))
      .finally(() => setLoading(false));
  }, [router]);

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amt);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p>Error loading dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Panel operasional koperasi</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/koperasi/inventory")}
            className="bg-blue-600"
          >
            <Package className="w-4 h-4 mr-2" />
            Kelola Stok
          </Button>
        </div>
      </div>

      {data.inventory.lowStockCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-900">Peringatan Stok</h4>
                <p className="text-sm text-red-800">
                  {data.inventory.lowStockCount} produk dengan stok rendah perlu diisi ulang
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-red-600"
                  onClick={() => router.push('/koperasi/inventory')}
                >
                  Lihat Produk
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-blue-100 text-sm">Transaksi Hari Ini</p>
                <p className="text-3xl font-bold mt-2">{data.today.transactions}</p>
                <p className="text-blue-100 text-xs">{formatCurrency(data.today.revenue)}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-green-100 text-sm">Pendapatan Bulan Ini</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(data.monthly.revenue)}</p>
                <p className="text-green-100 text-xs">{data.monthly.transactions} transaksi</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-orange-100 text-sm">Stok Rendah</p>
                <p className="text-3xl font-bold mt-2">{data.inventory.lowStockCount}</p>
                <p className="text-orange-100 text-xs">Perlu restok</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-purple-100 text-sm">Anggota Aktif</p>
                <p className="text-3xl font-bold mt-2">{data.members.active}</p>
                <p className="text-purple-100 text-xs">Total member</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Penjualan 7 Hari Terakhir</h3>
            <div className="space-y-2">
              {data.trends.daily.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{day.date}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((day.sales / Math.max(...data.trends.daily.map((d: any) => d.sales))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(day.sales)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
            {data.topProducts.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Belum ada penjualan</p>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.quantitySold} terjual</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-green-600">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/koperasi/financial')}
              >
                Lihat Semua
              </Button>
            </div>
            {data.recentActivities.transactions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Belum ada transaksi</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivities.transactions.slice(0, 5).map((transaction: any) => (
                  <div key={transaction.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{transaction.type}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(transaction.totalAmount)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stok Rendah</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/koperasi/inventory')}
              >
                Lihat Semua
              </Button>
            </div>
            {data.inventory.lowStockProducts.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Semua stok aman</p>
            ) : (
              <div className="space-y-3">
                {data.inventory.lowStockProducts.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-red-600">Stok: {product.stock}</p>
                      <p className="text-xs text-gray-600">Min: {product.threshold || 5}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pergerakan Stok Terbaru</h3>
          {data.recentActivities.stockMovements.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Belum ada pergerakan stok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Produk</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">SKU</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Tipe</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Jumlah</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivities.stockMovements.slice(0, 8).map((movement: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm">{movement.products?.name || '-'}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">{movement.products?.sku || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {movement.movementType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-semibold ${movement.movementType.includes('IN') ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.movementType.includes('IN') ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-gray-600">
                        {new Date(movement.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
