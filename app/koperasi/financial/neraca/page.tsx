'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { DashboardLoadingSkeleton } from '@/components/ui/loading-skeleton';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building,
  Wallet,
  CreditCard,
  Package,
  Landmark,
  Car,
  Home,
  Users,
  DollarSign,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';

interface BalanceSheetData {
  period: {
    month: number;
    year: number;
    label: string;
  };
  aktiva: {
    lancar: {
      kas: number;
      bank: number;
      piutang: number;
      persediaan: number;
      subtotal: number;
    };
    tetap: {
      peralatan: number;
      kendaraan: number;
      gedung: number;
      subtotal: number;
    };
    total: number;
  };
  pasiva: {
    liabilitasLancar: {
      hutangKonsinyasi: number;
      simpananSukarela: number;
      hutangDagang: number;
      hutangGaji: number;
      hutangLainnya: number;
      subtotal: number;
    };
    liabilitasJangkaPanjang: {
      simpananPokok: number;
      simpananWajib: number;
      subtotal: number;
    };
    ekuitas: {
      modalAwal: number;
      sisaHasilUsaha: number;
      labaRugiDitahan: number;
      subtotal: number;
    };
    total: number;
  };
  isBalanced: boolean;
  difference: number;
}

export default function NeracaPage() {
  const { user, loading, authorized } = useAuth(['SUPER_ADMIN']);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (authorized) {
      fetchBalanceSheet();
    }
  }, [authorized, selectedMonth, selectedYear]);

  const fetchBalanceSheet = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/financial/balance-sheet?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBalanceSheet(data);
      }
    } catch (error) {
      console.error('Failed to fetch balance sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !authorized) {
    return <DashboardLoadingSkeleton />;
  }

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (!balanceSheet) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Gagal Memuat Neraca
          </h3>
          <p className="text-slate-600">
            Terjadi kesalahan saat mengambil data neraca
          </p>
        </div>
      </div>
    );
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Neraca Keuangan
              </h1>
              <p className="text-slate-600 text-sm">
                Balance Sheet - Laporan Posisi Keuangan
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Periode:</span>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button onClick={fetchBalanceSheet} size="sm">
              Tampilkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balance Check Indicator */}
      {/* Show different colors based on financial health:
          - Green: Aktiva = Pasiva (Perfect balance)
          - Blue: Aktiva > Pasiva (Positive equity - HEALTHY!)
          - Red: Aktiva < Pasiva (Negative equity - DANGER!) */}
      <Card className={`shadow-md border-2 ${
        balanceSheet.isBalanced 
          ? 'border-green-500 bg-green-50' 
          : balanceSheet.difference > 0 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-red-500 bg-red-50'
      }`}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {balanceSheet.isBalanced ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Neraca Balance Sempurna
                  </p>
                  <p className="text-sm text-green-700">
                    Total Aktiva = Total Pasiva + Ekuitas
                  </p>
                </div>
              </>
            ) : balanceSheet.difference > 0 ? (
              <>
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">
                    Ekuitas Positif (Sehat)
                  </p>
                  <p className="text-sm text-blue-700">
                    Aktiva lebih besar Rp {formatCurrency(balanceSheet.difference)} dari Pasiva
                    <br />
                    <span className="text-xs italic">Ini bagus! Koperasi punya kekayaan bersih positif.</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    ⚠️ Ekuitas Negatif (Bahaya!)
                  </p>
                  <p className="text-sm text-red-700">
                    Pasiva lebih besar Rp {formatCurrency(Math.abs(balanceSheet.difference))} dari Aktiva
                    <br />
                    <span className="text-xs italic">Hutang melebihi aset - risiko insolvency!</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Balance Sheet - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AKTIVA (Left Side) */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-blue-900">AKTIVA (ASET)</h2>
                <p className="text-sm text-blue-700">Assets</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Aktiva Lancar */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-slate-600" />
                Aktiva Lancar (Current Assets)
              </h3>
              <div className="space-y-3 ml-7">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Kas
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.aktiva.lancar.kas)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-slate-500" />
                    Bank
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.aktiva.lancar.bank)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    Piutang Usaha
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.aktiva.lancar.piutang)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    Persediaan Barang
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.aktiva.lancar.persediaan)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 font-semibold text-blue-900 bg-blue-50 px-3 py-2 rounded-lg">
                  <span>Subtotal Aktiva Lancar</span>
                  <span>{formatCurrency(balanceSheet.aktiva.lancar.subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Aktiva Tetap */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-slate-600" />
                Aktiva Tetap (Fixed Assets)
              </h3>
              <div className="space-y-3 ml-7">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    Peralatan
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.aktiva.tetap.peralatan)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Car className="h-4 w-4 text-slate-500" />
                    Kendaraan
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.aktiva.tetap.kendaraan)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Home className="h-4 w-4 text-slate-500" />
                    Gedung
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.aktiva.tetap.gedung)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 font-semibold text-blue-900 bg-blue-50 px-3 py-2 rounded-lg">
                  <span>Subtotal Aktiva Tetap</span>
                  <span>{formatCurrency(balanceSheet.aktiva.tetap.subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Total Aktiva */}
            <div className="border-t-4 border-blue-600 pt-4 mt-6">
              <div className="flex items-center justify-between text-xl font-bold text-blue-900 bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-3 rounded-lg shadow-sm">
                <span>TOTAL AKTIVA</span>
                <span>{formatCurrency(balanceSheet.aktiva.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PASIVA (Right Side) */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-6 w-6 text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-green-900">PASIVA</h2>
                <p className="text-sm text-green-700">Liabilities & Equity</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Liabilitas Lancar */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-slate-600" />
                Liabilitas Lancar (Current Liabilities)
              </h3>
              <div className="space-y-3 ml-7">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    Hutang Konsinyasi
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.liabilitasLancar.hutangKonsinyasi)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    Simpanan Sukarela
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.liabilitasLancar.simpananSukarela)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    Hutang Dagang
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.liabilitasLancar.hutangDagang)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    Hutang Gaji
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.liabilitasLancar.hutangGaji)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Hutang Lainnya
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.liabilitasLancar.hutangLainnya)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 font-semibold text-orange-900 bg-orange-50 px-3 py-2 rounded-lg">
                  <span>Subtotal Liabilitas Lancar</span>
                  <span>{formatCurrency(balanceSheet.pasiva.liabilitasLancar.subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Liabilitas Jangka Panjang */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-slate-600" />
                Liabilitas Jangka Panjang (Long-term Liabilities)
              </h3>
              <div className="space-y-3 ml-7">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Simpanan Pokok
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.liabilitasJangkaPanjang.simpananPokok)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Simpanan Wajib
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.liabilitasJangkaPanjang.simpananWajib)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 font-semibold text-purple-900 bg-purple-50 px-3 py-2 rounded-lg">
                  <span>Subtotal Liabilitas Jangka Panjang</span>
                  <span>{formatCurrency(balanceSheet.pasiva.liabilitasJangkaPanjang.subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Ekuitas */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-slate-600" />
                Ekuitas (Equity)
              </h3>
              <div className="space-y-3 ml-7">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Modal Awal
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.ekuitas.modalAwal)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    Sisa Hasil Usaha
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.ekuitas.sisaHasilUsaha)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    Laba Rugi Ditahan
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(balanceSheet.pasiva.ekuitas.labaRugiDitahan)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 font-semibold text-green-900 bg-green-50 px-3 py-2 rounded-lg">
                  <span>Subtotal Ekuitas</span>
                  <span>{formatCurrency(balanceSheet.pasiva.ekuitas.subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Total Pasiva */}
            <div className="border-t-4 border-green-600 pt-4 mt-6">
              <div className="flex items-center justify-between text-xl font-bold text-green-900 bg-gradient-to-r from-green-100 to-green-50 px-4 py-3 rounded-lg shadow-sm">
                <span>TOTAL PASIVA</span>
                <span>{formatCurrency(balanceSheet.pasiva.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Ratios */}
      <Card className="shadow-md">
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            Rasio Keuangan
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Ratio */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-slate-600 mb-1">Current Ratio</p>
              <p className="text-2xl font-bold text-blue-900">
                {balanceSheet.pasiva.liabilitas.subtotal > 0
                  ? (balanceSheet.aktiva.lancar.subtotal / balanceSheet.pasiva.liabilitas.subtotal).toFixed(2) + 'x'
                  : 'N/Ax'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Aktiva Lancar / Liabilitas</p>
              {balanceSheet.pasiva.liabilitas.subtotal === 0 && (
                <p className="text-xs text-blue-600 mt-2 italic">Tidak ada liabilitas jangka pendek</p>
              )}
            </div>
            
            {/* Debt to Equity Ratio */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-slate-600 mb-1">Debt to Equity Ratio</p>
              <p className="text-2xl font-bold text-green-900">
                {balanceSheet.pasiva.ekuitas.subtotal > 0
                  ? (balanceSheet.pasiva.liabilitas.subtotal / balanceSheet.pasiva.ekuitas.subtotal).toFixed(2) + 'x'
                  : '0.00x'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Liabilitas / Ekuitas</p>
              {balanceSheet.pasiva.liabilitas.subtotal === 0 && (
                <p className="text-xs text-green-600 mt-2 italic">✓ Tidak ada hutang</p>
              )}
            </div>
            
            {/* Equity Ratio */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-slate-600 mb-1">Equity Ratio</p>
              <p className="text-2xl font-bold text-purple-900">
                {balanceSheet.aktiva.total > 0
                  ? ((balanceSheet.pasiva.ekuitas.subtotal / balanceSheet.aktiva.total) * 100).toFixed(1) + '%'
                  : '0.0%'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Ekuitas / Total Aktiva</p>
              {balanceSheet.pasiva.ekuitas.subtotal === balanceSheet.aktiva.total && (
                <p className="text-xs text-purple-600 mt-2 italic">✓ 100% equity funded</p>
              )}
            </div>
          </div>
          
          {/* Ratio Analysis */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">📊 Analisis Rasio:</p>
            <ul className="text-xs text-slate-600 space-y-1">
              {balanceSheet.pasiva.liabilitas.subtotal === 0 ? (
                <li>• <strong>Current Ratio N/A</strong>: Koperasi tidak memiliki liabilitas jangka pendek (kondisi sangat baik)</li>
              ) : balanceSheet.aktiva.lancar.subtotal / balanceSheet.pasiva.liabilitas.subtotal >= 2 ? (
                <li>• <strong>Current Ratio Sangat Baik</strong>: Aktiva lancar {(balanceSheet.aktiva.lancar.subtotal / balanceSheet.pasiva.liabilitas.subtotal).toFixed(2)}x lebih besar dari liabilitas</li>
              ) : balanceSheet.aktiva.lancar.subtotal / balanceSheet.pasiva.liabilitas.subtotal >= 1 ? (
                <li>• <strong>Current Ratio Baik</strong>: Aktiva lancar cukup untuk menutup liabilitas jangka pendek</li>
              ) : (
                <li>• <strong>Current Ratio Rendah</strong>: Perlu perhatian - liabilitas lebih besar dari aktiva lancar</li>
              )}
              
              {balanceSheet.pasiva.liabilitas.subtotal === 0 ? (
                <li>• <strong>Debt to Equity 0.00x</strong>: Koperasi dibiayai 100% dari ekuitas tanpa hutang (sangat konservatif)</li>
              ) : balanceSheet.pasiva.liabilitas.subtotal / balanceSheet.pasiva.ekuitas.subtotal <= 0.5 ? (
                <li>• <strong>Debt to Equity Rendah</strong>: Struktur modal sangat konservatif dengan hutang minimal</li>
              ) : balanceSheet.pasiva.liabilitas.subtotal / balanceSheet.pasiva.ekuitas.subtotal <= 1 ? (
                <li>• <strong>Debt to Equity Sehat</strong>: Rasio hutang terhadap ekuitas masih dalam batas aman</li>
              ) : (
                <li>• <strong>Debt to Equity Tinggi</strong>: Hutang lebih besar dari ekuitas - perlu evaluasi</li>
              )}
              
              {balanceSheet.pasiva.ekuitas.subtotal === balanceSheet.aktiva.total ? (
                <li>• <strong>Equity Ratio 100%</strong>: Semua aset dibiayai dari ekuitas sendiri (sangat kuat)</li>
              ) : (balanceSheet.pasiva.ekuitas.subtotal / balanceSheet.aktiva.total) >= 0.7 ? (
                <li>• <strong>Equity Ratio Sangat Baik</strong>: Lebih dari 70% aset dibiayai ekuitas</li>
              ) : (balanceSheet.pasiva.ekuitas.subtotal / balanceSheet.aktiva.total) >= 0.5 ? (
                <li>• <strong>Equity Ratio Baik</strong>: Mayoritas aset dibiayai dari ekuitas</li>
              ) : (
                <li>• <strong>Equity Ratio Rendah</strong>: Perlu meningkatkan modal atau mengurangi hutang</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
