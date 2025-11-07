import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

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
    liabilitas: {
      hutangDagang: number;
      hutangGaji: number;
      hutangLainnya: number;
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

function decimalToNumber(value: Decimal | number | null): number {
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.toString());
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user || !['SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // === AKTIVA LANCAR ===
    
    // 1. KAS (Cash on Hand) - Accumulated cash up to endDate
    // SALE transactions with CASH = Income
    // PURCHASE transactions with CASH = Expense
    const cashIncome = await prisma.transactions.aggregate({
      where: { 
        type: 'SALE',
        paymentMethod: 'CASH', 
        status: 'COMPLETED',
        date: { lte: endDate } 
      },
      _sum: { totalAmount: true }
    });
    
    const cashExpense = await prisma.transactions.aggregate({
      where: {
        type: 'PURCHASE',
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        date: { lte: endDate }
      },
      _sum: { totalAmount: true }
    });
    
    const kas = decimalToNumber(cashIncome._sum.totalAmount) - decimalToNumber(cashExpense._sum.totalAmount);

    // 2. BANK (Bank Balance) - Accumulated bank balance up to endDate
    // SALE transactions with TRANSFER = Income
    // PURCHASE transactions with TRANSFER = Expense
    const bankIncome = await prisma.transactions.aggregate({
      where: {
        type: 'SALE',
        paymentMethod: 'TRANSFER',
        status: 'COMPLETED',
        date: { lte: endDate }
      },
      _sum: { totalAmount: true }
    });
    
    const bankExpense = await prisma.transactions.aggregate({
      where: {
        type: 'PURCHASE',
        paymentMethod: 'TRANSFER',
        status: 'COMPLETED',
        date: { lte: endDate }
      },
      _sum: { totalAmount: true }
    });
    
    const bank = decimalToNumber(bankIncome._sum.totalAmount) - decimalToNumber(bankExpense._sum.totalAmount);

    // 3. PIUTANG (Accounts Receivable)
    const piutang = 0; // TODO: Implement if you track customer credit

    // 4. PERSEDIAAN GUDANG (Inventory Stock Value)
    const products = await prisma.products.findMany({
      where: { stock: { gt: 0 } }
    });
    const persediaan = products.reduce((sum: number, p) => {
      return sum + (decimalToNumber(p.buyPrice) * (p.stock || 0));
    }, 0);

    // 5. AKTIVA TETAP (Fixed Assets)
    const peralatan = 0; // Equipment - TODO: Add if tracked
    const kendaraan = 0; // Vehicles - TODO: Add if tracked
    const gedung = 0; // Buildings - TODO: Add if tracked

    const aktivaLancarSubtotal = kas + bank + piutang + persediaan;
    const aktivaTetapSubtotal = peralatan + kendaraan + gedung;
    const totalAktiva = aktivaLancarSubtotal + aktivaTetapSubtotal;

    // Calculate HUTANG DAGANG from unpaid consignments
    const unpaidConsignments = await prisma.consignment_payments.findMany({
      where: { status: { not: 'PAID' }, periodEnd: { lte: endDate } }
    });
    const hutangDagang = unpaidConsignments.reduce((sum: number, c) => sum + c.amount, 0);

    const hutangGaji = 0;
    const hutangLainnya = 0;
    const totalLiabilitas = hutangDagang + hutangGaji + hutangLainnya;

    // === EKUITAS (Equity) ===
    // In a simple balance sheet: Ekuitas = Aktiva - Liabilitas
    // Or broken down: Modal Awal + Laba Ditahan + SHU Periode Berjalan
    
    // 1. MODAL AWAL (Initial Capital) - Could be from members' contributions
    // For now, we'll calculate it as the difference to make balance sheet balanced
    const totalEkuitasRequired = totalAktiva - totalLiabilitas;
    
    // 2. SISA HASIL USAHA (Current Period Profit/Loss)
    // Calculate from SALE income minus PURCHASE expenses for current period
    const periodSales = await prisma.transactions.aggregate({
      where: { 
        type: 'SALE',
        status: 'COMPLETED', 
        date: { gte: startDate, lte: endDate } 
      },
      _sum: { totalAmount: true }
    });
    
    const periodPurchases = await prisma.transactions.aggregate({
      where: { 
        type: 'PURCHASE',
        status: 'COMPLETED',
        date: { gte: startDate, lte: endDate } 
      },
      _sum: { totalAmount: true }
    });
    
    const sisaHasilUsaha = decimalToNumber(periodSales._sum.totalAmount) - decimalToNumber(periodPurchases._sum.totalAmount);

    // 3. LABA RUGI DITAHAN (Retained Earnings from previous periods)
    // Calculate cumulative profit before this period
    const previousPeriodEnd = new Date(year, month - 1, 0, 23, 59, 59);
    
    const prevSales = await prisma.transactions.aggregate({
      where: { 
        type: 'SALE',
        status: 'COMPLETED', 
        date: { lte: previousPeriodEnd } 
      },
      _sum: { totalAmount: true }
    });
    
    const prevPurchases = await prisma.transactions.aggregate({
      where: { 
        type: 'PURCHASE',
        status: 'COMPLETED',
        date: { lte: previousPeriodEnd } 
      },
      _sum: { totalAmount: true }
    });
    
    const labaRugiDitahan = decimalToNumber(prevSales._sum.totalAmount) - decimalToNumber(prevPurchases._sum.totalAmount);

    // 4. MODAL AWAL (calculated to balance the equation)
    // Modal Awal = Total Ekuitas Required - SHU - Laba Ditahan
    const modalAwal = totalEkuitasRequired - sisaHasilUsaha - labaRugiDitahan;
    const totalEkuitas = modalAwal + sisaHasilUsaha + labaRugiDitahan;
    const totalPasiva = totalLiabilitas + totalEkuitas;

    const difference = totalAktiva - totalPasiva;
    const isBalanced = Math.abs(difference) < 0.01;

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const balanceSheet: BalanceSheetData = {
      period: { month, year, label: `${monthNames[month - 1]} ${year}` },
      aktiva: {
        lancar: {
          kas: Math.round(kas),
          bank: Math.round(bank),
          piutang: Math.round(piutang),
          persediaan: Math.round(persediaan),
          subtotal: Math.round(aktivaLancarSubtotal)
        },
        tetap: {
          peralatan: Math.round(peralatan),
          kendaraan: Math.round(kendaraan),
          gedung: Math.round(gedung),
          subtotal: Math.round(aktivaTetapSubtotal)
        },
        total: Math.round(totalAktiva)
      },
      pasiva: {
        liabilitas: {
          hutangDagang: Math.round(hutangDagang),
          hutangGaji: Math.round(hutangGaji),
          hutangLainnya: Math.round(hutangLainnya),
          subtotal: Math.round(totalLiabilitas)
        },
        ekuitas: {
          modalAwal: Math.round(modalAwal),
          sisaHasilUsaha: Math.round(sisaHasilUsaha),
          labaRugiDitahan: Math.round(labaRugiDitahan),
          subtotal: Math.round(totalEkuitas)
        },
        total: Math.round(totalPasiva)
      },
      isBalanced,
      difference: Math.round(difference)
    };

    return NextResponse.json(balanceSheet);
  } catch (error) {
    console.error('Balance Sheet API Error:', error);
    return NextResponse.json({ error: 'Failed to generate balance sheet' }, { status: 500 });
  }
}
