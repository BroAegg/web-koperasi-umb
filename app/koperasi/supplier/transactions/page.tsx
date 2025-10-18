"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download,
  FileText,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Dummy data transaksi
const dummyTransactions = [
  { 
    id: "TRX-001", 
    orderid: "ORD-004",
    product: "Beras Premium 5kg", 
    quantity: 10, 
    amount: 750000, 
    date: "2025-01-13",
    paymentMethod: "Transfer",
    status: "completed"
  },
  { 
    id: "TRX-002", 
    orderid: "ORD-002",
    product: "Minyak Goreng 2L", 
    quantity: 20, 
    amount: 640000, 
    date: "2025-01-12",
    paymentMethod: "Tunai",
    status: "completed"
  },
  { 
    id: "TRX-003", 
    orderid: "ORD-003",
    product: "Gula Pasir 1kg", 
    quantity: 50, 
    amount: 750000, 
    date: "2025-01-11",
    paymentMethod: "Transfer",
    status: "completed"
  },
  { 
    id: "TRX-004", 
    orderid: "ORD-001",
    product: "Telur Ayam 1kg", 
    quantity: 30, 
    amount: 840000, 
    date: "2025-01-10",
    paymentMethod: "Transfer",
    status: "completed"
  },
  { 
    id: "TRX-005", 
    orderid: "ORD-006",
    product: "Susu UHT 1L", 
    quantity: 40, 
    amount: 720000, 
    date: "2025-01-09",
    paymentMethod: "Tunai",
    status: "completed"
  },
  { 
    id: "TRX-006", 
    orderid: "ORD-005",
    product: "Indomie Goreng 5pcs", 
    quantity: 100, 
    amount: 1400000, 
    date: "2025-01-08",
    paymentMethod: "Transfer",
    status: "completed"
  },
];

const productCategories = ["Semua Produk", "Beras Premium 5kg", "Minyak Goreng 2L", "Gula Pasir 1kg", "Telur Ayam 1kg", "Susu UHT 1L", "Indomie Goreng 5pcs"];

export default function SupplierTransactions() {
  const [transactions, setTransactions] = useState(dummyTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("Semua Produk");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transaksi
  const filteredTransactions = transactions.filter((trx) => {
    const matchesSearch = 
      trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = selectedProduct === "Semua Produk" || trx.product === selectedProduct;
    
    const matchesDate = 
      (!startDate || trx.date >= startDate) &&
      (!endDate || trx.date <= endDate);
    
    return matchesSearch && matchesProduct && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalAmount = filteredTransactions.reduce((sum, trx) => sum + trx.amount, 0);
  const totalQuantity = filteredTransactions.reduce((sum, trx) => sum + trx.quantity, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportExcel = () => {
    alert("Export ke Excel sedang diproses...");
    // Implementasi export Excel di sini
  };

  const handleExportPDF = () => {
    alert("Export ke PDF sedang diproses...");
    // Implementasi export PDF di sini
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Riwayat Transaksi</h1>
          <p className="text-slate-600 mt-1">Transaksi yang sudah selesai</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleExportExcel}
            variant="outline"
            className="rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button 
            onClick={handleExportPDF}
            variant="outline"
            className="rounded-xl"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <p className="text-blue-100 text-sm font-medium">Total Transaksi</p>
            <p className="text-3xl font-bold mt-2">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <p className="text-green-100 text-sm font-medium">Total Pendapatan</p>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <p className="text-purple-100 text-sm font-medium">Total Produk Terjual</p>
            <p className="text-3xl font-bold mt-2">{totalQuantity} unit</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari ID transaksi atau produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-slate-300"
              />
            </div>

            {/* Date Range & Product Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tanggal Akhir
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filter Produk
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="rounded-2xl shadow-md border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID Transaksi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Jumlah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Metode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{trx.id}</p>
                        <p className="text-xs text-slate-500">{trx.orderid}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{trx.date}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{trx.product}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {trx.quantity} unit
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        trx.paymentMethod === "Transfer" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatCurrency(trx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
            </p>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  className={`rounded-lg ${currentPage === page ? "bg-blue-600" : ""}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
