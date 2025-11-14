'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Package, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function SupplierDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'SUPPLIER' && session?.user?.role !== 'DEVELOPER') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'SUPPLIER' && session.user.role !== 'DEVELOPER')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard Supplier
          </h1>
          <p className="text-slate-600 mt-2">
            Selamat datang, {session.user.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Produk</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Produk Terjual</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-slate-900">Rp 0</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending Settlement</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <Card className="shadow-md">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Produk Terbaru
              </h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Belum ada produk konsinyasi</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card className="shadow-md">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Penjualan Terbaru
              </h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Belum ada transaksi penjualan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="shadow-md">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Aksi Cepat
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <Package className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Tambah Produk Baru</p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Lihat Laporan Penjualan</p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <DollarSign className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Riwayat Settlement</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
