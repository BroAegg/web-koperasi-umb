"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Plus,
  Eye,
  Bell,
  AlertCircle
} from "lucide-react";

// Dummy data untuk testing
const dummyStats = {
  todayOrders: 12,
  weekOrders: 47,
  monthOrders: 156,
  monthRevenue: 15750000,
  pendingOrders: 5,
  totalProducts: 24,
};

const dummyBroadcasts = [
  {
    id: 1,
    title: "Pengumuman Pembayaran Supplier",
    content: "Mohon segera melengkapi data rekening untuk proses pembayaran bulan ini.",
    date: "2025-01-10",
    isRead: false,
  },
  {
    id: 2,
    title: "Jadwal Pengiriman Produk",
    content: "Pengiriman produk untuk bulan Januari akan dilakukan setiap Senin dan Kamis.",
    date: "2025-01-08",
    isRead: true,
  },
];

const dummyWeeklySales = [
  { day: "Sen", sales: 2500000 },
  { day: "Sel", sales: 3200000 },
  { day: "Rab", sales: 1800000 },
  { day: "Kam", sales: 4100000 },
  { day: "Jum", sales: 3600000 },
  { day: "Sab", sales: 2900000 },
  { day: "Min", sales: 1500000 },
];

export default function SupplierDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Simulate loading
    setTimeout(() => {
      setUser({ name: "Warung Makan Barokah", email: "supplier@test.com" });
      setLoading(false);
    }, 500);
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const maxSales = Math.max(...dummyWeeklySales.map(d => d.sales));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Supplier</h1>
          <p className="text-slate-600 mt-1">Selamat datang, {user?.name || "Supplier"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => router.push("/koperasi/supplier/products")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
          <Button 
            onClick={() => router.push("/koperasi/supplier/orders")}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Lihat Pesanan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pesanan Hari Ini */}
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Pesanan Hari Ini</p>
                <p className="text-3xl font-bold mt-2">{dummyStats.todayOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-100">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{dummyStats.weekOrders} minggu ini</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Pendapatan Bulan Ini */}
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Pendapatan Bulan Ini</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(dummyStats.monthRevenue)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-100">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{dummyStats.monthOrders} transaksi</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pesanan Pending */}
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pesanan Menunggu</p>
                <p className="text-3xl font-bold mt-2">{dummyStats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                onClick={() => router.push("/koperasi/supplier/orders")}
                size="sm" 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Lihat Detail
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total Produk */}
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Produk</p>
                <p className="text-3xl font-bold mt-2">{dummyStats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                onClick={() => router.push("/koperasi/supplier/products")}
                size="sm" 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Kelola Produk
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Chart */}
        <Card className="rounded-2xl shadow-md border-0 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Penjualan Mingguan</h3>
                <p className="text-sm text-slate-600">7 hari terakhir</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {dummyWeeklySales.map((item, index) => {
                const percentage = (item.sales / maxSales) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium w-12">{item.day}</span>
                      <span className="text-slate-800 font-semibold">{formatCurrency(item.sales)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Broadcast Notifications */}
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Broadcast</h3>
              </div>
              <Button 
                onClick={() => router.push("/koperasi/supplier/broadcast")}
                variant="outline" 
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                Lihat Semua
              </Button>
            </div>

            <div className="space-y-3">
              {dummyBroadcasts.slice(0, 3).map((broadcast) => (
                <div 
                  key={broadcast.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    broadcast.isRead 
                      ? "bg-slate-50 border-slate-200" 
                      : "bg-blue-50 border-blue-200"
                  }`}
                  onClick={() => router.push("/koperasi/supplier/broadcast")}
                >
                  {!broadcast.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 float-right" />
                  )}
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">
                    {broadcast.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                    {broadcast.content}
                  </p>
                  <p className="text-xs text-slate-500">{broadcast.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Tambah Produk", icon: Plus, href: "/koperasi/supplier/products", color: "blue" },
              { label: "Lihat Pesanan", icon: ShoppingCart, href: "/koperasi/supplier/orders", color: "green" },
              { label: "Transaksi", icon: DollarSign, href: "/koperasi/supplier/transactions", color: "purple" },
              { label: "Broadcast", icon: Bell, href: "/koperasi/supplier/broadcast", color: "orange" },
              { label: "Profil", icon: Package, href: "/koperasi/supplier/profile", color: "indigo" },
              { label: "Produk Saya", icon: Eye, href: "/koperasi/supplier/products", color: "pink" },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className={`p-4 rounded-xl border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-all hover:shadow-md group`}
                >
                  <Icon className={`w-6 h-6 text-${action.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <p className={`text-sm font-medium text-${action.color}-800 text-center`}>
                    {action.label}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
