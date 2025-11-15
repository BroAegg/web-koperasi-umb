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
      POKOK: { color: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Pokok' },
      WAJIB: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Wajib' },
      SUKARELA: { color: 'bg-purple-50 text-purple-700 border border-purple-200', label: 'Sukarela' },
    };
    const badge = badges[type] || badges.POKOK;
    return (
      <Badge className={`${badge.color} text-[10px] sm:text-xs font-semibold px-2 py-0.5`}>
        {badge.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data simpanan...</p>
        </div>
      </div>
    );
  }

  if (!simpananData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <Card className="p-8 text-center max-w-md shadow-lg border border-gray-200">
          <p className="text-red-600 mb-4 font-medium">
            Data simpanan tidak ditemukan
          </p>
          <Button onClick={() => router.push('/member/dashboard')} className="bg-[#0055FF] hover:bg-[#003DB3]">
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <MemberNavigation />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/member/dashboard')}
            className="mb-3 sm:mb-4 text-gray-600 hover:text-gray-900 border-gray-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Simpanan Koperasi
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Kelola dan pantau simpanan pokok, wajib, dan sukarela Anda
          </p>
        </div>

        {/* Simpanan Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Total Simpanan */}
          <Card className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#0055FF] stroke-[2px]" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-medium mb-2">Total Simpanan</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(simpananData.totalSimpanan)}
            </h2>
          </Card>

          {/* Simpanan Pokok */}
          <Card className="p-4 sm:p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 stroke-[2px]" />
              {getTypeBadge('POKOK')}
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Simpanan Pokok</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 tracking-tight">
              {formatCurrency(simpananData.simpananPokok)}
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-500">Wajib saat daftar</p>
          </Card>

          {/* Simpanan Wajib */}
          <Card className="p-4 sm:p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 stroke-[2px]" />
              {getTypeBadge('WAJIB')}
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Simpanan Wajib</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 tracking-tight">
              {formatCurrency(simpananData.simpananWajib)}
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-500">Rutin per bulan</p>
          </Card>

          {/* Simpanan Sukarela */}
          <Card className="p-4 sm:p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 stroke-[2px]" />
              {getTypeBadge('SUKARELA')}
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Simpanan Sukarela</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 tracking-tight">
              {formatCurrency(simpananData.simpananSukarela)}
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-500">Kapan saja</p>
          </Card>
        </div>

        {/* History Section */}
        <Card className="p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Riwayat Transaksi
            </h3>
            <Button
              variant="outline"
              className="border-[#0055FF] text-[#0055FF] hover:bg-blue-50 text-sm w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {simpananData.history.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <PiggyBank className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500">Belum ada riwayat transaksi simpanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Keterangan
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {simpananData.history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {getTypeBadge(item.type)}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                          {item.description}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-emerald-600 text-right">
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
        <Card className="p-4 sm:p-5 lg:p-6 bg-blue-50 border border-blue-100 shadow-sm">
          <h4 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">ℹ</span>
            </div>
            Informasi Simpanan
          </h4>
          <ul className="text-xs sm:text-sm text-blue-700 space-y-1.5 sm:space-y-2">
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
