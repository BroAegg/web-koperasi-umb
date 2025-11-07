/**
 * Enhanced Financial Export Utilities
 * 
 * Export financial reports with profit calculations and advanced filtering
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { calculateProfitData, enrichTransactionsWithProfit } from './profit-calculator';

export interface FinancialReportData {
  title: string;
  period: string;
  dateRange?: {
    from: string;
    to: string;
  };
  summary: {
    totalRevenue: number;
    totalExpense: number;
    grossProfit: number;
    netProfit: number;
    transactionCount: number;
  };
  transactions: Array<{
    date: string;
    type: string;
    description: string;
    category: string;
    amount: number;
    paymentMethod: string;
    profit?: number;
    margin?: number;
  }>;
  breakdown?: {
    byPaymentMethod?: Record<string, number>;
    byCategory?: Record<string, number>;
    byDate?: Array<{ date: string; amount: number; profit?: number }>;
  };
}

/**
 * Export comprehensive financial report to PDF
 */
export function exportEnhancedFinancialPDF(data: FinancialReportData) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KOPERASI UM BANDUNG', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(14);
  doc.text(data.title, 105, yPosition, { align: 'center' });
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (data.dateRange) {
    doc.text(
      `Periode: ${data.dateRange.from} s/d ${data.dateRange.to}`,
      105,
      yPosition,
      { align: 'center' }
    );
  } else {
    doc.text(data.period, 105, yPosition, { align: 'center' });
  }

  yPosition += 15;

  // Summary Box
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(14, yPosition, 182, 50, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  yPosition += 8;
  doc.text('RINGKASAN KEUANGAN', 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const col1X = 20;
  const col2X = 110;
  
  doc.text('Total Pendapatan:', col1X, yPosition);
  doc.text(`Rp ${data.summary.totalRevenue.toLocaleString('id-ID')}`, col2X, yPosition);
  
  yPosition += 7;
  doc.text('Total Pengeluaran:', col1X, yPosition);
  doc.text(`Rp ${data.summary.totalExpense.toLocaleString('id-ID')}`, col2X, yPosition);
  
  yPosition += 7;
  doc.text('Laba Kotor:', col1X, yPosition);
  doc.text(`Rp ${data.summary.grossProfit.toLocaleString('id-ID')}`, col2X, yPosition);
  
  yPosition += 7;
  doc.text('Laba Bersih:', col1X, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rp ${data.summary.netProfit.toLocaleString('id-ID')}`, col2X, yPosition);
  
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Total Transaksi:', col1X, yPosition);
  doc.text(`${data.summary.transactionCount} transaksi`, col2X, yPosition);

  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Transactions Table
  if (data.transactions.length > 0) {
    const tableData = data.transactions.map((trans) => [
      trans.date,
      trans.type,
      trans.description,
      trans.category,
      `Rp ${trans.amount.toLocaleString('id-ID')}`,
      trans.profit ? `Rp ${trans.profit.toLocaleString('id-ID')}` : '-',
      trans.margin ? `${trans.margin.toFixed(1)}%` : '-',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Tanggal', 'Tipe', 'Deskripsi', 'Kategori', 'Jumlah', 'Profit', 'Margin']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 28, halign: 'right' },
        5: { cellWidth: 28, halign: 'right' },
        6: { cellWidth: 18, halign: 'center' },
      },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Dicetak: ${new Date().toLocaleString('id-ID')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save
  const filename = data.dateRange
    ? `laporan-keuangan-${data.dateRange.from}-${data.dateRange.to}.pdf`
    : `laporan-keuangan-${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
}

/**
 * Export comprehensive financial report to Excel
 */
export function exportEnhancedFinancialExcel(data: FinancialReportData) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['LAPORAN KEUANGAN'],
    ['Koperasi UM Bandung'],
    [''],
    ['Periode', data.dateRange ? `${data.dateRange.from} s/d ${data.dateRange.to}` : data.period],
    [''],
    ['RINGKASAN'],
    ['Total Pendapatan', data.summary.totalRevenue],
    ['Total Pengeluaran', data.summary.totalExpense],
    ['Laba Kotor', data.summary.grossProfit],
    ['Laba Bersih', data.summary.netProfit],
    ['Margin Laba Kotor', data.summary.grossProfit / data.summary.totalRevenue * 100],
    ['Margin Laba Bersih', data.summary.netProfit / data.summary.totalRevenue * 100],
    ['Total Transaksi', data.summary.transactionCount],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  // Transactions Sheet
  const transData = data.transactions.map((trans) => ({
    'Tanggal': trans.date,
    'Tipe': trans.type,
    'Deskripsi': trans.description,
    'Kategori': trans.category,
    'Metode Pembayaran': trans.paymentMethod,
    'Jumlah': trans.amount,
    'Profit': trans.profit || 0,
    'Margin (%)': trans.margin ? trans.margin.toFixed(2) : '0.00',
  }));

  const transSheet = XLSX.utils.json_to_sheet(transData);
  transSheet['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 30 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, transSheet, 'Detail Transaksi');

  // Payment Method Breakdown Sheet (if available)
  if (data.breakdown?.byPaymentMethod) {
    const paymentData = Object.entries(data.breakdown.byPaymentMethod).map(([method, amount]) => ({
      'Metode Pembayaran': method,
      'Total': amount,
      'Persentase': ((amount / data.summary.totalRevenue) * 100).toFixed(2) + '%',
    }));

    const paymentSheet = XLSX.utils.json_to_sheet(paymentData);
    paymentSheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Per Metode Pembayaran');
  }

  // Category Breakdown Sheet (if available)
  if (data.breakdown?.byCategory) {
    const categoryData = Object.entries(data.breakdown.byCategory).map(([category, amount]) => ({
      'Kategori': category,
      'Total': amount,
      'Persentase': ((amount / data.summary.totalRevenue) * 100).toFixed(2) + '%',
    }));

    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    categorySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Per Kategori');
  }

  // Save
  const filename = data.dateRange
    ? `laporan-keuangan-${data.dateRange.from}-${data.dateRange.to}.xlsx`
    : `laporan-keuangan-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  XLSX.writeFile(workbook, filename);
}

/**
 * Export profit & loss statement to PDF
 */
export function exportProfitLossPDF(data: {
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
}) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN LABA RUGI', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Koperasi UM Bandung', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.period, 105, 37, { align: 'center' });

  // P&L Statement
  let y = 55;
  const leftMargin = 20;
  const rightMargin = 190;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PENDAPATAN', leftMargin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Pendapatan Penjualan', leftMargin + 5, y);
  doc.text(`Rp ${data.revenue.toLocaleString('id-ID')}`, rightMargin, y, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('HARGA POKOK PENJUALAN', leftMargin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.text('Harga Pokok Penjualan', leftMargin + 5, y);
  doc.text(`(Rp ${data.cogs.toLocaleString('id-ID')})`, rightMargin, y, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.line(leftMargin, y, rightMargin, y);
  y += 7;
  doc.text('LABA KOTOR', leftMargin, y);
  doc.text(`Rp ${data.grossProfit.toLocaleString('id-ID')}`, rightMargin, y, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.text('BEBAN OPERASIONAL', leftMargin, y);
  y += 7;
  doc.text('Total Beban Operasional', leftMargin + 5, y);
  doc.text(`(Rp ${data.operatingExpenses.toLocaleString('id-ID')})`, rightMargin, y, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.line(leftMargin, y, rightMargin, y);
  y += 7;
  doc.setFontSize(12);
  doc.text('LABA BERSIH', leftMargin, y);
  doc.text(`Rp ${data.netProfit.toLocaleString('id-ID')}`, rightMargin, y, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Dicetak: ${new Date().toLocaleString('id-ID')}`,
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );

  doc.save(`laba-rugi-${new Date().toISOString().split('T')[0]}.pdf`);
}
