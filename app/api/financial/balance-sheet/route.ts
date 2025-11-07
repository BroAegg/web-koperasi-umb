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

    // Calculate KAS from cash transactions
    const cashTransactions = await prisma.transactions.findMany({
      where: { paymentMethod: 'CASH', createdAt: { lte: endDate } }
    });
    const kas = cashTransactions.reduce((sum: number, t) => sum + decimalToNumber(t.totalAmount), 0);

    // Calculate BANK from non-cash transactions
    const bankTransactions = await prisma.transactions.findMany({
      where: {
        OR: [{ paymentMethod: 'TRANSFER' }, { paymentMethod: 'CREDIT' }],
        createdAt: { lte: endDate }
      }
    });
    const bank = bankTransactions.reduce((sum: number, t) => sum + decimalToNumber(t.totalAmount), 0);

    // Calculate PERSEDIAAN (inventory value)
    const products = await prisma.products.findMany({
      where: { stock: { gt: 0 } }
    });
    const persediaan = products.reduce((sum: number, p) => {
      return sum + (decimalToNumber(p.buyPrice) * (p.stock || 0));
    }, 0);

    const piutang = 0;
    const peralatan = 0;
    const kendaraan = 0;
    const gedung = 0;

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

    // Calculate revenue and costs for current period
    const periodTransactions = await prisma.transactions.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: startDate, lte: endDate } },
      include: { transaction_items: { include: { products: true } } }
    });

    let totalRevenue = 0;
    let totalCost = 0;

    periodTransactions.forEach(t => {
      totalRevenue += decimalToNumber(t.totalAmount);
      t.transaction_items.forEach(item => {
        if (item.products) {
          totalCost += decimalToNumber(item.products.buyPrice) * item.quantity;
        }
      });
    });

    const periodConsignmentPayments = await prisma.consignment_payments.findMany({
      where: { status: 'PAID', createdAt: { gte: startDate, lte: endDate } }
    });
    periodConsignmentPayments.forEach(p => { totalCost += p.amount; });

    const sisaHasilUsaha = totalRevenue - totalCost;

    // Calculate retained earnings
    const previousPeriodEnd = new Date(year, month - 1, 0, 23, 59, 59);
    const previousTransactions = await prisma.transactions.findMany({
      where: { status: 'COMPLETED', createdAt: { lte: previousPeriodEnd } },
      include: { transaction_items: { include: { products: true } } }
    });

    let totalPrevRevenue = 0;
    let totalPrevCost = 0;

    previousTransactions.forEach(t => {
      totalPrevRevenue += decimalToNumber(t.totalAmount);
      t.transaction_items.forEach(item => {
        if (item.products) {
          totalPrevCost += decimalToNumber(item.products.buyPrice) * item.quantity;
        }
      });
    });

    const labaRugiDitahan = totalPrevRevenue - totalPrevCost;

    const modalAwal = 50000000;
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
