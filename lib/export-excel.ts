/**
 * Excel Export Utilities
 * 
 * Generate Excel spreadsheets for transactions, reports, and data export
 */

import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  date: Date | string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  cashierName?: string;
  customerName?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

interface Product {
  name: string;
  sku?: string;
  category: string;
  stock: number;
  buyPrice?: number;
  sellPrice: number;
  threshold: number;
}

interface StockMovement {
  date: Date | string;
  productName: string;
  type: string;
  quantity: number;
  notes?: string;
}

/**
 * Export transactions to Excel
 */
export function exportTransactionsExcel(transactions: Transaction[], filename?: string) {
  // Prepare data for Excel
  const data = transactions.map((trans, index) => ({
    'No': index + 1,
    'Tanggal': new Date(trans.date).toLocaleDateString('id-ID'),
    'Jam': new Date(trans.date).toLocaleTimeString('id-ID'),
    'ID Transaksi': trans.id.substring(0, 8).toUpperCase(),
    'Kasir': trans.cashierName || 'N/A',
    'Customer': trans.customerName || 'Walk-in',
    'Total': trans.totalAmount,
    'Metode Pembayaran': trans.paymentMethod,
    'Status': trans.status,
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 10 }, // Jam
    { wch: 12 }, // ID
    { wch: 15 }, // Kasir
    { wch: 15 }, // Customer
    { wch: 15 }, // Total
    { wch: 12 }, // Metode
    { wch: 12 }, // Status
  ];

  // Format currency column
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 6 }); // Column G (Total)
    if (worksheet[cellRef]) {
      worksheet[cellRef].z = '"Rp "#,##0';
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');

  // Add summary sheet
  const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const summary = [
    ['RINGKASAN TRANSAKSI'],
    [''],
    ['Total Transaksi', transactions.length],
    ['Total Penjualan', totalAmount],
    ['Rata-rata/Transaksi', Math.round(totalAmount / transactions.length)],
    [''],
    ['Metode Pembayaran'],
    ['CASH', transactions.filter(t => t.paymentMethod === 'CASH').length],
    ['TRANSFER', transactions.filter(t => t.paymentMethod === 'TRANSFER').length],
    ['QRIS', transactions.filter(t => t.paymentMethod === 'QRIS').length],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  // Save file
  const fname = filename || `transaksi-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fname);
}

/**
 * Export transaction details (with items) to Excel
 */
export function exportTransactionDetailExcel(transaction: Transaction) {
  const workbook = XLSX.utils.book_new();

  // Transaction Info Sheet
  const info = [
    ['KOPERASI UM BANDUNG'],
    ['DETAIL TRANSAKSI'],
    [''],
    ['ID Transaksi', transaction.id.substring(0, 8).toUpperCase()],
    ['Tanggal', new Date(transaction.date).toLocaleDateString('id-ID')],
    ['Jam', new Date(transaction.date).toLocaleTimeString('id-ID')],
    ['Kasir', transaction.cashierName || 'N/A'],
    ['Customer', transaction.customerName || 'Walk-in'],
    ['Metode Pembayaran', transaction.paymentMethod],
    ['Status', transaction.status],
    [''],
    ['DETAIL BARANG'],
  ];

  const infoSheet = XLSX.utils.aoa_to_sheet(info);
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

  // Items Sheet
  if (transaction.items && transaction.items.length > 0) {
    const itemsData = transaction.items.map((item, index) => ({
      'No': index + 1,
      'Nama Barang': item.name,
      'Jumlah': item.quantity,
      'Harga Satuan': item.unitPrice,
      'Subtotal': item.subtotal,
    }));

    const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
    itemsSheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Barang');

    // Add total row
    const lastRow = itemsData.length + 2;
    XLSX.utils.sheet_add_aoa(itemsSheet, [
      ['', '', '', 'TOTAL:', transaction.totalAmount]
    ], { origin: `A${lastRow}` });
  }

  // Save
  XLSX.writeFile(workbook, `transaksi-detail-${transaction.id.substring(0, 8)}.xlsx`);
}

/**
 * Export products inventory to Excel
 */
export function exportProductsExcel(products: Product[]) {
  const data = products.map((product, index) => ({
    'No': index + 1,
    'Nama Produk': product.name,
    'SKU': product.sku || '-',
    'Kategori': product.category,
    'Stok': product.stock,
    'Harga Beli': product.buyPrice || 0,
    'Harga Jual': product.sellPrice,
    'Threshold': product.threshold,
    'Status': product.stock <= product.threshold ? 'Low Stock' : 'Normal',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Produk');

  // Add summary
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.sellPrice), 0);
  const lowStockCount = products.filter(p => p.stock <= p.threshold).length;

  const summary = [
    ['RINGKASAN INVENTORI'],
    [''],
    ['Total Produk', products.length],
    ['Produk Low Stock', lowStockCount],
    ['Total Nilai Stok', totalValue],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  XLSX.writeFile(workbook, `inventori-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export stock movements to Excel
 */
export function exportStockMovementsExcel(movements: StockMovement[]) {
  const data = movements.map((movement, index) => ({
    'No': index + 1,
    'Tanggal': new Date(movement.date).toLocaleDateString('id-ID'),
    'Jam': new Date(movement.date).toLocaleTimeString('id-ID'),
    'Produk': movement.productName,
    'Tipe': movement.type,
    'Jumlah': movement.quantity,
    'Catatan': movement.notes || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 10 },
    { wch: 25 },
    { wch: 12 },
    { wch: 10 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Movements');

  // Summary by type
  const stockIn = movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0);
  const stockOut = movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0);
  const adjustments = movements.filter(m => m.type === 'ADJUSTMENT').length;

  const summary = [
    ['RINGKASAN PERGERAKAN STOK'],
    [''],
    ['Total Stock IN', stockIn],
    ['Total Stock OUT', stockOut],
    ['Total Adjustment', adjustments],
    ['Net Change', stockIn - stockOut],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  XLSX.writeFile(workbook, `stock-movements-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export financial report to Excel
 */
export function exportFinancialReportExcel(data: {
  period: string;
  transactions: Transaction[];
  summary: {
    totalSales: number;
    totalTransactions: number;
    cashSales: number;
    transferSales: number;
    qrisSales: number;
  };
}) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summary = [
    ['LAPORAN KEUANGAN'],
    ['Koperasi UM Bandung'],
    [''],
    ['Periode', data.period],
    [''],
    ['RINGKASAN'],
    ['Total Penjualan', data.summary.totalSales],
    ['Total Transaksi', data.summary.totalTransactions],
    ['Rata-rata/Transaksi', Math.round(data.summary.totalSales / data.summary.totalTransactions)],
    [''],
    ['PEMBAYARAN'],
    ['CASH', data.summary.cashSales],
    ['TRANSFER', data.summary.transferSales],
    ['QRIS', data.summary.qrisSales],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  // Transactions Sheet
  const transData = data.transactions.map((trans, index) => ({
    'No': index + 1,
    'Tanggal': new Date(trans.date).toLocaleDateString('id-ID'),
    'ID': trans.id.substring(0, 8).toUpperCase(),
    'Total': trans.totalAmount,
    'Metode': trans.paymentMethod,
    'Status': trans.status,
  }));

  const transSheet = XLSX.utils.json_to_sheet(transData);
  transSheet['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(workbook, transSheet, 'Detail Transaksi');

  XLSX.writeFile(workbook, `laporan-keuangan-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export template for product import
 */
export function exportProductImportTemplate() {
  const template = [
    ['name', 'sku', 'category', 'buyPrice', 'sellPrice', 'stock', 'threshold', 'unit'],
    ['Indomie Goreng', 'IDM001', 'Makanan', '2500', '3000', '100', '10', 'pcs'],
    ['Aqua 600ml', 'AQA001', 'Minuman', '2000', '3000', '50', '20', 'btl'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(template);
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  XLSX.writeFile(workbook, 'product-import-template.xlsx');
}
