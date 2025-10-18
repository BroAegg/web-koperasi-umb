"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  DollarSign,
  AlertCircle,
  Clock,
  UserCheck,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch('/api/super-admin/dashboard', {
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
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600">Panel kontrol utama</p>
        </div>
        <Button
          onClick={() => router.push("/koperasi/super-admin/suppliers")}
          className="bg-blue-600"
        >
          <Users className="w-4 h-4 mr-2" />
          Kelola Supplier
        </Button>
      </div>

      {(data.pending.supplierApprovals > 0 || data.pending.paymentVerification > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-900">Tindakan Diperlukan</h4>
                {data.pending.supplierApprovals > 0 && (
                  <p className="text-sm text-orange-800">
                    • {data.pending.supplierApprovals} supplier menunggu persetujuan
                  </p>
                )}
                {data.pending.paymentVerification > 0 && (
                  <p className="text-sm text-orange-800">
                    • {data.pending.paymentVerification} pembayaran perlu diverifikasi
                  </p>
                )}
                <Button
                  size="sm"
                  className="mt-2 bg-orange-600"
                  onClick={() => router.push('/koperasi/super-admin/suppliers')}
                >
                  Lihat Supplier
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
                <p className="text-blue-100 text-sm">Total Supplier</p>
                <p className="text-3xl font-bold mt-2">{data.suppliers.total}</p>
                <p className="text-blue-100 text-xs">{data.suppliers.active} aktif</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Anggota</p>
                <p className="text-3xl font-bold mt-2">{data.members.total}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Produk</p>
                <p className="text-3xl font-bold mt-2">{data.products.total}</p>
                <p className="text-purple-100 text-xs">{data.products.lowStock} stok rendah</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pendapatan Bulan Ini</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(data.financial.monthlyRevenue)}</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="hover:shadow-lg cursor-pointer"
          onClick={() => router.push('/koperasi/super-admin/suppliers')}
        >
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Supplier Pending</p>
                <p className="text-2xl font-bold">{data.suppliers.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg cursor-pointer"
          onClick={() => router.push('/koperasi/super-admin/suppliers')}
        >
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Verifikasi Pembayaran</p>
                <p className="text-2xl font-bold">{data.suppliers.paymentPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Verifikasi Stok</p>
                <p className="text-2xl font-bold">{data.pending.stockVerification}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Supplier Terbaru</h3>
            {data.recentActivities.suppliers.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Belum ada supplier</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivities.suppliers.map((s: any) => (
                  <div key={s.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{s.businessName}</p>
                      <p className="text-xs text-gray-600">{s.users?.name || '-'}</p>
                    </div>
                    <div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          s.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : s.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.status}
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
            <h3 className="text-lg font-semibold mb-4">Stok Masuk Terbaru</h3>
            {data.recentActivities.stockMovements.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Belum ada pergerakan stok</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivities.stockMovements.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{m.products?.name || '-'}</p>
                      <p className="text-xs text-gray-600">{m.products?.sku || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-green-600">+{m.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
