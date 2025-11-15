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
      BRONZE: { color: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '⬡' },
      SILVER: { color: 'bg-gray-50 text-gray-700 border border-gray-200', icon: '⬡' },
      GOLD: { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', icon: '⬡' },
      PLATINUM: { color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: '⬡' },
    };
    const badge = badges[tier] || badges.BRONZE;
    return (
      <Badge className={`${badge.color} px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] lg:text-xs font-semibold`}>
        {badge.icon} {tier}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <Card className="p-8 text-center max-w-md shadow-lg border border-gray-200">
          <p className="text-red-600 mb-4 font-medium">
            Data member tidak ditemukan
          </p>
          <Button onClick={() => router.push('/login')} className="bg-[#0055FF] hover:bg-[#003DB3]">
            Kembali ke Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <MemberNavigation />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Header */}
        <Card className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-5 lg:p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0055FF] to-[#003DB3] flex items-center justify-center shadow-lg shadow-blue-500/20 border-2 border-white">
                <span className="text-white text-base sm:text-lg lg:text-xl font-bold">
                  {memberData.name?.charAt(0).toUpperCase() || 'M'}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">
                {memberData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="text-gray-400 text-[10px] sm:text-xs">No. Anggota:</span>
                  <span className="font-semibold text-gray-900 text-[10px] sm:text-xs">{memberData.nomorAnggota}</span>
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-gray-400 text-[10px] sm:text-xs">Unit:</span>
                  <span className="font-semibold text-gray-900 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none">{memberData.unitKerja}</span>
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                {getTierBadge(memberData.tier)}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Simpanan - Hero Card */}
          <Card className="p-4 sm:p-6 bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#0055FF] stroke-[2px]" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-medium mb-2 sm:mb-3">Total Simpanan</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
              {formatCurrency(memberData.totalSimpanan)}
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">Pokok</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">{formatCurrency(memberData.simpananPokok)}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">Wajib</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">{formatCurrency(memberData.simpananWajib)}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">Sukarela</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">{formatCurrency(memberData.simpananSukarela)}</p>
              </div>
            </div>
          </Card>

          {/* Total Pinjaman - Hero Card */}
          <Card className="p-4 sm:p-6 bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#0055FF] stroke-[2px]" />
              </div>
              <Badge className="bg-blue-50 text-[#0055FF] border-none text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1">
                {memberData.activeLoans} Aktif
              </Badge>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-medium mb-2 sm:mb-3">Total Pinjaman</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
              {formatCurrency(memberData.totalLoanAmount)}
            </h2>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${memberData.activeLoans > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
              <p className="text-xs sm:text-sm text-gray-600">
                Status: <span className="font-semibold text-gray-900">{memberData.activeLoans > 0 ? 'Ada Angsuran' : 'Lunas'}</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Points & Tier */}
          <Card className="p-4 sm:p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 stroke-[2px]" />
              {getTierBadge(memberData.tier)}
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Points Reward</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {memberData.points.toLocaleString()} pts
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              ≈ {formatCurrency((memberData.points / 100) * 1000)}
            </p>
          </Card>

          {/* Total Belanja */}
          <Card className="p-4 sm:p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 stroke-[2px]" />
              <Badge className="bg-gray-100 text-gray-700 border-none text-[10px] sm:text-xs font-semibold">
                {memberData.recentTransactions}x
              </Badge>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium mb-2">Total Belanja</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {formatCurrency(memberData.totalSpent)}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Bulan ini: {memberData.recentTransactions} transaksi
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/member/simpanan')}
              className="group bg-white border-2 border-gray-200 hover:border-[#0055FF] rounded-xl sm:rounded-2xl p-3 sm:p-6 flex flex-col items-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-blue-100 transition-colors">
                <Wallet className="w-5 h-5 sm:w-7 sm:h-7 text-[#0055FF] stroke-[2px]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900">Simpanan</span>
            </button>
            
            <button
              onClick={() => router.push('/member/pinjaman')}
              className="group bg-white border-2 border-gray-200 hover:border-[#0055FF] rounded-xl sm:rounded-2xl p-3 sm:p-6 flex flex-col items-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-blue-100 transition-colors">
                <CreditCard className="w-5 h-5 sm:w-7 sm:h-7 text-[#0055FF] stroke-[2px]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900">Pinjaman</span>
            </button>
            
            <button
              onClick={() => router.push('/member/transaksi')}
              className="group bg-white border-2 border-gray-200 hover:border-[#0055FF] rounded-xl sm:rounded-2xl p-3 sm:p-6 flex flex-col items-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-blue-100 transition-colors">
                <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-[#0055FF] stroke-[2px]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900">Transaksi</span>
            </button>
            
            <button
              onClick={() => router.push('/member/profile')}
              className="group bg-white border-2 border-gray-200 hover:border-[#0055FF] rounded-xl sm:rounded-2xl p-3 sm:p-6 flex flex-col items-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-blue-100 transition-colors">
                <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-[#0055FF] stroke-[2px]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900">Profil</span>
            </button>
          </div>
        </Card>

        {/* Info Banner */}
        <Card className="p-3 sm:p-5 lg:p-6 bg-emerald-50 border border-emerald-100 shadow-sm">
          <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600 stroke-[2px]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-emerald-900 mb-0.5 sm:mb-1 lg:mb-1.5 text-xs sm:text-sm lg:text-base">
                Member Koperasi Aktif
              </h4>
              <p className="text-[10px] sm:text-xs lg:text-sm text-emerald-700 leading-relaxed">
                Bergabung sejak <strong>{new Date(memberData.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. 
                Nikmati semua benefit simpanan, pinjaman, dan reward points.
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold text-[10px] sm:text-xs">
                Verified
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
