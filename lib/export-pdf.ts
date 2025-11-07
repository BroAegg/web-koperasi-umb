/**
 * PDF Export Utilities
 * 
 * Generate PDF documents for transactions, reports, and receipts
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: string;
  date: Date | string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

interface ReportData {
  title: string;
  period: string;
  summary: {
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
  };
  transactions?: Transaction[];
}

/**
 * Export single transaction receipt to PDF
 */
export function exportReceiptPDF(transaction: Transaction) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200], // 80mm thermal paper width
  });

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KOPERASI UM BANDUNG', 40, 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Soekarno Hatta No. 752', 40, 16, { align: 'center' });
  doc.text('Bandung, Jawa Barat', 40, 20, { align: 'center' });
  doc.text('Telp: (022) 7564567', 40, 24, { align: 'center' });
  
  // Separator
  doc.setLineWidth(0.3);
  doc.line(5, 28, 75, 28);
  
  // Transaction Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const transDate = new Date(transaction.date);
  doc.text(`No: ${transaction.id.substring(0, 8).toUpperCase()}`, 5, 33);
  doc.text(`Tanggal: ${transDate.toLocaleDateString('id-ID')}`, 5, 38);
  doc.text(`Jam: ${transDate.toLocaleTimeString('id-ID')}`, 5, 43);
  doc.text(`Kasir: ${transaction.status}`, 5, 48);
  
  // Separator
  doc.line(5, 51, 75, 51);
  
  // Items
  if (transaction.items && transaction.items.length > 0) {
    let yPos = 56;
    doc.setFontSize(8);
    
    transaction.items.forEach((item) => {
      // Item name
      doc.text(item.name, 5, yPos);
      yPos += 4;
      
      // Quantity x Price = Subtotal
      doc.text(`${item.quantity} x Rp ${item.unitPrice.toLocaleString('id-ID')}`, 8, yPos);
      doc.text(`Rp ${item.subtotal.toLocaleString('id-ID')}`, 75, yPos, { align: 'right' });
      yPos += 5;
    });
    
    // Separator
    doc.line(5, yPos, 75, yPos);
    yPos += 5;
    
    // Total
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 5, yPos);
    doc.text(`Rp ${transaction.totalAmount.toLocaleString('id-ID')}`, 75, yPos, { align: 'right' });
    yPos += 6;
    
    // Payment Method
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pembayaran: ${transaction.paymentMethod}`, 5, yPos);
    yPos += 10;
    
    // Footer
    doc.line(5, yPos, 75, yPos);
    yPos += 5;
    doc.text('Terima kasih atas kunjungan Anda!', 40, yPos, { align: 'center' });
    yPos += 4;
    doc.text('Barang yang sudah dibeli', 40, yPos, { align: 'center' });
    yPos += 4;
    doc.text('tidak dapat dikembalikan', 40, yPos, { align: 'center' });
  }
  
  // Save PDF
  doc.save(`receipt-${transaction.id.substring(0, 8)}.pdf`);
}

/**
 * Export transactions list to PDF
 */
export function exportTransactionListPDF(transactions: Transaction[], dateRange?: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KOPERASI UM BANDUNG', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Laporan Transaksi', 105, 25, { align: 'center' });
  
  if (dateRange) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(dateRange, 105, 32, { align: 'center' });
  }
  
  // Table
  autoTable(doc, {
    startY: 40,
    head: [['No', 'Tanggal', 'ID Transaksi', 'Total', 'Pembayaran', 'Status']],
    body: transactions.map((trans, index) => [
      index + 1,
      new Date(trans.date).toLocaleDateString('id-ID'),
      trans.id.substring(0, 8).toUpperCase(),
      `Rp ${trans.totalAmount.toLocaleString('id-ID')}`,
      trans.paymentMethod,
      trans.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Transaksi: ${transactions.length}`, 14, finalY + 10);
  doc.text(`Total Penjualan: Rp ${totalAmount.toLocaleString('id-ID')}`, 14, finalY + 17);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, finalY + 30);
  
  // Save
  doc.save(`transactions-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export financial report to PDF
 */
export function exportFinancialReportPDF(data: ReportData) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KOPERASI UM BANDUNG', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(data.title, 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.period, 105, 32, { align: 'center' });
  
  // Summary Box
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(14, 40, 182, 30, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  doc.text('Ringkasan', 20, 48);
  doc.text(`Total Penjualan: Rp ${data.summary.totalSales.toLocaleString('id-ID')}`, 20, 55);
  doc.text(`Jumlah Transaksi: ${data.summary.totalTransactions}`, 20, 62);
  doc.text(`Rata-rata/Transaksi: Rp ${data.summary.averageTransaction.toLocaleString('id-ID')}`, 20, 69);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Transactions table (if provided)
  if (data.transactions && data.transactions.length > 0) {
    autoTable(doc, {
      startY: 80,
      head: [['No', 'Tanggal', 'ID', 'Total', 'Metode']],
      body: data.transactions.map((trans, index) => [
        index + 1,
        new Date(trans.date).toLocaleDateString('id-ID'),
        trans.id.substring(0, 8).toUpperCase(),
        `Rp ${trans.totalAmount.toLocaleString('id-ID')}`,
        trans.paymentMethod
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
  }
  
  // Footer
  const pageCount = (doc as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
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
  const filename = `laporan-${data.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Export sales summary to PDF with charts (placeholder)
 */
export function exportSalesSummaryPDF(data: {
  period: string;
  totalSales: number;
  totalTransactions: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesByCategory: Array<{ category: string; amount: number }>;
}) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN PENJUALAN', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.period, 105, 22, { align: 'center' });
  
  // Summary
  let yPos = 35;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Penjualan: Rp ${data.totalSales.toLocaleString('id-ID')}`, 14, yPos);
  yPos += 8;
  doc.text(`Total Transaksi: ${data.totalTransactions}`, 14, yPos);
  yPos += 15;
  
  // Top Products
  doc.setFontSize(14);
  doc.text('Produk Terlaris', 14, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Produk', 'Terjual', 'Revenue']],
    body: data.topProducts.map(p => [
      p.name,
      p.quantity,
      `Rp ${p.revenue.toLocaleString('id-ID')}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Sales by Category
  const finalY = (doc as any).lastAutoTable.finalY || yPos;
  yPos = finalY + 15;
  
  doc.setFontSize(14);
  doc.text('Penjualan per Kategori', 14, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Kategori', 'Total Penjualan']],
    body: data.salesByCategory.map(c => [
      c.category,
      `Rp ${c.amount.toLocaleString('id-ID')}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Save
  doc.save(`ringkasan-penjualan-${new Date().toISOString().split('T')[0]}.pdf`);
}
