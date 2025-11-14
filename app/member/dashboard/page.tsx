"use client";

import MemberNavigation from '@/components/member/MemberNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Award,
    Building2,
    CreditCard,
    ShoppingBag,
    TrendingUp,
    Wallet
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MemberData {
  id: string;
  nomorAnggota: string;
  name: string;
  email: string;
  phone: string | null;
  unitKerja: string;
  gender: string;
  joinDate: string;
  status: string;
  isMemberKoperasi: boolean;
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
  totalSimpanan: number;
  points: number;
  tier: string;
  totalSpent: number;
  activeLoans: number;
  totalLoanAmount: number;
  recentTransactions: number;
}

export default function MemberDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchMemberData();
    }
  }, [status, session, router]);

  const fetchMemberData = async () => {
    try {
      const response = await fetch('/api/member/dashboard');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      if (data.success) {
        setMemberData(data.data);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
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

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      BRONZE: { color: 'bg-amber-700 text-white', icon: '🥉' },
      SILVER: { color: 'bg-gray-400 text-white', icon: '🥈' },
      GOLD: { color: 'bg-yellow-500 text-white', icon: '🥇' },
      PLATINUM: { color: 'bg-purple-600 text-white', icon: '💎' },
    };
    const badge = badges[tier] || badges.BRONZE;
    return (
      <Badge className={`${badge.color} px-3 py-1`}>
        {badge.icon} {tier}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Data member tidak ditemukan
          </p>
          <Button onClick={() => router.push('/login')}>Kembali ke Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <MemberNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Selamat Datang, {memberData.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No. Anggota: <span className="font-semibold">{memberData.nomorAnggota}</span> | 
            Unit: <span className="font-semibold">{memberData.unitKerja}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Simpanan */}
          <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-emerald-100 text-sm mb-1">Total Simpanan</p>
            <h2 className="text-3xl font-bold mb-2">
              {formatCurrency(memberData.totalSimpanan)}
            </h2>
            <div className="flex items-center justify-between text-xs text-emerald-100">
              <span>Pokok: {formatCurrency(memberData.simpananPokok)}</span>
              <span>Wajib: {formatCurrency(memberData.simpananWajib)}</span>
            </div>
          </Card>

          {/* Points & Tier */}
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-10 h-10 opacity-80" />
              {getTierBadge(memberData.tier)}
            </div>
            <p className="text-purple-100 text-sm mb-1">Points Reward</p>
            <h2 className="text-3xl font-bold mb-2">
              {memberData.points.toLocaleString()} pts
            </h2>
            <p className="text-xs text-purple-100">
              Nilai: {formatCurrency((memberData.points / 100) * 1000)}
            </p>
          </Card>

          {/* Active Loans */}
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-10 h-10 opacity-80" />
              <Badge className="bg-white/20 text-white">
                {memberData.activeLoans} Aktif
              </Badge>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Pinjaman</p>
            <h2 className="text-3xl font-bold mb-2">
              {formatCurrency(memberData.totalLoanAmount)}
            </h2>
            <p className="text-xs text-blue-100">
              Status: {memberData.activeLoans > 0 ? 'Ada Angsuran' : 'Lunas'}
            </p>
          </Card>

          {/* Total Belanja */}
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-10 h-10 opacity-80" />
              <Badge className="bg-white/20 text-white">
                {memberData.recentTransactions} Transaksi
              </Badge>
            </div>
            <p className="text-orange-100 text-sm mb-1">Total Belanja</p>
            <h2 className="text-3xl font-bold mb-2">
              {formatCurrency(memberData.totalSpent)}
            </h2>
            <p className="text-xs text-orange-100">
              Transaksi bulan ini: {memberData.recentTransactions}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/member/simpanan')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex flex-col items-center py-6 h-auto"
            >
              <Wallet className="w-6 h-6 mb-2" />
              <span>Simpanan</span>
            </Button>
            <Button
              onClick={() => router.push('/member/pinjaman')}
              className="bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center py-6 h-auto"
            >
              <CreditCard className="w-6 h-6 mb-2" />
              <span>Pinjaman</span>
            </Button>
            <Button
              onClick={() => router.push('/member/transaksi')}
              className="bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center py-6 h-auto"
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span>Transaksi</span>
            </Button>
            <Button
              onClick={() => router.push('/member/profile')}
              className="bg-gray-600 hover:bg-gray-700 text-white flex flex-col items-center py-6 h-auto"
            >
              <Building2 className="w-6 h-6 mb-2" />
              <span>Profil</span>
            </Button>
          </div>
        </Card>

        {/* Info Banner */}
        <Card className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Member Koperasi Aktif
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Anda terdaftar sebagai <strong>Member Koperasi</strong> sejak {new Date(memberData.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. 
                Nikmati semua benefit simpanan, pinjaman, dan reward points!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
