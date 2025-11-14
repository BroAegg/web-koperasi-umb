"use client";

import MemberNavigation from '@/components/member/MemberNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ArrowLeft,
    Calendar,
    Download,
    PiggyBank,
    TrendingUp,
    Wallet
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SimpananData {
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
  totalSimpanan: number;
  history: {
    id: string;
    type: 'POKOK' | 'WAJIB' | 'SUKARELA';
    amount: number;
    date: string;
    description: string;
  }[];
}

export default function SimpananPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [simpananData, setSimpananData] = useState<SimpananData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchSimpananData();
    }
  }, [status, session, router]);

  const fetchSimpananData = async () => {
    try {
      const response = await fetch('/api/member/simpanan');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      if (data.success) {
        setSimpananData(data.data);
      }
    } catch (error) {
      console.error('Error fetching simpanan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      POKOK: { color: 'bg-blue-500 text-white', label: 'Pokok' },
      WAJIB: { color: 'bg-emerald-500 text-white', label: 'Wajib' },
      SUKARELA: { color: 'bg-purple-500 text-white', label: 'Sukarela' },
    };
    const badge = badges[type] || badges.POKOK;
    return (
      <Badge className={`${badge.color} text-xs`}>
        {badge.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data simpanan...</p>
        </div>
      </div>
    );
  }

  if (!simpananData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">
            Data simpanan tidak ditemukan
          </p>
          <Button onClick={() => router.push('/member/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/member/dashboard')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Simpanan Koperasi 💰
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Kelola dan pantau simpanan pokok, wajib, dan sukarela Anda
          </p>
        </div>

        {/* Simpanan Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Simpanan */}
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Wallet className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm mb-1">Total Simpanan</p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(simpananData.totalSimpanan)}
            </h2>
          </Card>

          {/* Simpanan Pokok */}
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <PiggyBank className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
              {getTypeBadge('POKOK')}
            </div>
            <p className="text-blue-100 text-xs sm:text-sm mb-1">Simpanan Pokok</p>
            <h2 className="text-xl sm:text-2xl font-bold">
              {formatCurrency(simpananData.simpananPokok)}
            </h2>
            <p className="text-xs text-blue-100 mt-1">Wajib saat daftar</p>
          </Card>

          {/* Simpanan Wajib */}
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
              {getTypeBadge('WAJIB')}
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm mb-1">Simpanan Wajib</p>
            <h2 className="text-xl sm:text-2xl font-bold">
              {formatCurrency(simpananData.simpananWajib)}
            </h2>
            <p className="text-xs text-emerald-100 mt-1">Rutin per bulan</p>
          </Card>

          {/* Simpanan Sukarela */}
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
              {getTypeBadge('SUKARELA')}
            </div>
            <p className="text-purple-100 text-xs sm:text-sm mb-1">Simpanan Sukarela</p>
            <h2 className="text-xl sm:text-2xl font-bold">
              {formatCurrency(simpananData.simpananSukarela)}
            </h2>
            <p className="text-xs text-purple-100 mt-1">Kapan saja</p>
          </Card>
        </div>

        {/* History Section */}
        <Card className="p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Riwayat Transaksi
            </h3>
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {simpananData.history.length === 0 ? (
            <div className="text-center py-12">
              <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada riwayat transaksi simpanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keterangan
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {simpananData.history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(item.type)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                          {item.description}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mt-6 shadow-md">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
            ℹ️ Informasi Simpanan
          </h4>
          <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
            <li>• <strong>Simpanan Pokok:</strong> Dibayar satu kali saat pendaftaran sebagai anggota koperasi</li>
            <li>• <strong>Simpanan Wajib:</strong> Dibayar rutin setiap bulan sesuai ketentuan koperasi</li>
            <li>• <strong>Simpanan Sukarela:</strong> Dapat ditambah kapan saja sesuai kemampuan anggota</li>
            <li>• Simpanan dapat dicairkan sesuai peraturan koperasi yang berlaku</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
