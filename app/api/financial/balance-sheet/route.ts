import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface BalanceSheetData {
  period: {
    month: number;
    year: number;
    label: string;
  };
  aktiva: {
    lancar: {
      kasBank: number; // Kas dan Setara Kas (gabungan kas + bank)
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

function decimalToNumber(value: Decimal | number | null): number {
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.toString());
}

export async function GET(request: NextRequest) {
  try {
    // Use NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // === AKTIVA LANCAR ===
    
    // 1. KAS DAN SETARA KAS (Cash and Cash Equivalents)
    // Menggabungkan kas tunai dan saldo bank sesuai standar akuntansi koperasi
    
    // KAS TUNAI - SALE transactions with CASH = Income
    const cashIncome = await prisma.transactions.aggregate({
      where: { 
        type: 'SALE',
        paymentMethod: 'CASH', 
        status: 'COMPLETED',
        date: { lte: endDate } 
      },
      _sum: { totalAmount: true }
    });
    
    // KAS TUNAI - PURCHASE transactions with CASH = Expense
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

    // BANK - SALE transactions with TRANSFER = Income
    const bankIncome = await prisma.transactions.aggregate({
      where: {
        type: 'SALE',
        paymentMethod: 'TRANSFER',
        status: 'COMPLETED',
        date: { lte: endDate }
      },
      _sum: { totalAmount: true }
    });
    
    // BANK - PURCHASE transactions with TRANSFER = Expense
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
    
    // GABUNGAN KAS DAN BANK (sesuai standar koperasi)
    const kasBank = kas + bank;

    // 2. PIUTANG (Accounts Receivable)
    const piutang = 0; // TODO: Implement if you track customer credit

    // 3. PERSEDIAAN GUDANG (Inventory Stock Value)
    // IMPORTANT: Only count TOKO products (owned by koperasi)
    // TITIPAN products are consignment goods, NOT owned by koperasi
    const allProducts = await prisma.products.findMany({
      where: { stock: { gt: 0 } }
    });
    
    const persediaan = allProducts.reduce((sum: number, p) => {
      // Only count TOKO products or products without ownershipType (legacy)
      const isToko = p.ownershipType === 'TOKO' || !p.ownershipType;
      if (!isToko) return sum; // Skip TITIPAN products
      
      return sum + (decimalToNumber(p.buyPrice) * (p.stock || 0));
    }, 0);

    // 4. AKTIVA TETAP (Fixed Assets)
    const peralatan = 0; // Equipment - TODO: Add if tracked
    const kendaraan = 0; // Vehicles - TODO: Add if tracked
    const gedung = 0; // Buildings - TODO: Add if tracked

    const aktivaLancarSubtotal = kasBank + piutang + persediaan;
    const aktivaTetapSubtotal = peralatan + kendaraan + gedung;
    const totalAktiva = aktivaLancarSubtotal + aktivaTetapSubtotal;

    // === LIABILITAS JANGKA PENDEK (Current Liabilities) ===
    
    // 1. HUTANG KONSINYASI (Consignment Payables)
    // Money owed to consignors for sold goods that haven't been settled yet
    const unpaidConsignmentSales = await prisma.consignment_sales.findMany({
      where: { 
        isSettled: false,
        saleDate: { lte: endDate }
      }
    });
    const hutangKonsinyasi = unpaidConsignmentSales.reduce((sum: number, sale) => {
      return sum + decimalToNumber(sale.netToConsignor);
    }, 0);

    // 2. SIMPANAN ANGGOTA (Member Savings - Current Liability)
    // Simpanan Sukarela can be withdrawn anytime = short-term liability
    const simpananAnggota = await prisma.members.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { 
        simpananSukarela: true 
      }
    });
    const simpananSukarela = decimalToNumber(simpananAnggota._sum.simpananSukarela);

    // 3. HUTANG DAGANG (Trade Payables) - Other unpaid invoices
    const hutangDagang = 0; // TODO: Implement if tracking supplier invoices

    // 4. HUTANG GAJI (Salary Payables)
    const hutangGaji = 0; // TODO: Implement if tracking unpaid salaries
    
    // 5. HUTANG LAINNYA (Other Payables)
    const hutangLainnya = 0;

    const totalLiabilitasLancar = hutangKonsinyasi + simpananSukarela + hutangDagang + hutangGaji + hutangLainnya;

    // === LIABILITAS JANGKA PANJANG (Long-term Liabilities) ===
    
    // 1. SIMPANAN POKOK & WAJIB (Member Mandatory Savings)
    // These are long-term as they can only be withdrawn when member exits
    const simpananPokokWajib = await prisma.members.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { 
        simpananPokok: true,
        simpananWajib: true 
      }
    });
    const simpananPokok = decimalToNumber(simpananPokokWajib._sum.simpananPokok);
    const simpananWajib = decimalToNumber(simpananPokokWajib._sum.simpananWajib);
    const totalSimpananPokokWajib = simpananPokok + simpananWajib;

    const totalLiabilitasJangkaPanjang = totalSimpananPokokWajib;
    const totalLiabilitas = totalLiabilitasLancar + totalLiabilitasJangkaPanjang;

    // === EKUITAS (Equity) ===
    // Proper accounting: AKTIVA = LIABILITAS + EKUITAS
    // Ekuitas = Modal Disetor (FIXED) + Laba Ditahan + SHU Tahun Berjalan
    
    // 1. MODAL AWAL (Initial Capital) - FIXED VALUE from transaction
    // Look for transaction with note containing "Modal awal koperasi"
    // This represents initial capital injection from members
    const modalAwalTransaction = await prisma.transactions.findFirst({
      where: {
        type: 'SALE',
        note: { contains: 'Modal awal koperasi' },
        status: 'COMPLETED'
      },
      orderBy: { date: 'asc' }
    });
    
    const modalAwal = modalAwalTransaction 
      ? decimalToNumber(modalAwalTransaction.totalAmount) 
      : 0; // If no modal awal transaction, default to 0
    
    // 2. SISA HASIL USAHA (Current Period Profit/Loss)
    // Calculate from SALE income minus PURCHASE/EXPENSE for current period
    const periodSales = await prisma.transactions.aggregate({
      where: { 
        type: 'SALE',
        status: 'COMPLETED', 
        date: { gte: startDate, lte: endDate },
        NOT: { note: { contains: 'Modal awal koperasi' } } // Exclude modal awal
      },
      _sum: { totalAmount: true }
    });
    
    const periodExpenses = await prisma.transactions.aggregate({
      where: { 
        OR: [
          { type: 'PURCHASE' },
          { type: 'EXPENSE' }
        ],
        status: 'COMPLETED',
        date: { gte: startDate, lte: endDate } 
      },
      _sum: { totalAmount: true }
    });
    
    const sisaHasilUsaha = decimalToNumber(periodSales._sum.totalAmount) - decimalToNumber(periodExpenses._sum.totalAmount);

    // 3. LABA RUGI DITAHAN (Retained Earnings from previous periods)
    // Calculate cumulative profit before this period (excluding modal awal)
    const previousPeriodEnd = new Date(year, month - 1, 0, 23, 59, 59);
    
    const prevSales = await prisma.transactions.aggregate({
      where: { 
        type: 'SALE',
        status: 'COMPLETED', 
        date: { lte: previousPeriodEnd },
        NOT: { note: { contains: 'Modal awal koperasi' } } // Exclude modal awal
      },
      _sum: { totalAmount: true }
    });
    
    const prevExpenses = await prisma.transactions.aggregate({
      where: { 
        OR: [
          { type: 'PURCHASE' },
          { type: 'EXPENSE' }
        ],
        status: 'COMPLETED',
        date: { lte: previousPeriodEnd } 
      },
      _sum: { totalAmount: true }
    });
    
    const labaRugiDitahan = decimalToNumber(prevSales._sum.totalAmount) - decimalToNumber(prevExpenses._sum.totalAmount);

    // Calculate Total Ekuitas
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
          kasBank: Math.round(kasBank),
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
        liabilitasLancar: {
          hutangKonsinyasi: Math.round(hutangKonsinyasi),
          simpananSukarela: Math.round(simpananSukarela),
          hutangDagang: Math.round(hutangDagang),
          hutangGaji: Math.round(hutangGaji),
          hutangLainnya: Math.round(hutangLainnya),
          subtotal: Math.round(totalLiabilitasLancar)
        },
        liabilitasJangkaPanjang: {
          simpananPokok: Math.round(simpananPokok),
          simpananWajib: Math.round(simpananWajib),
          subtotal: Math.round(totalLiabilitasJangkaPanjang)
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
