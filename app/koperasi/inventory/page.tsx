"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { 
  Package, 
  Plus, 
  Minus, 
  TrendingUp, 
  AlertTriangle, 
  Search,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  threshold: number;
  soldToday: number;
  totalSold: number;
  profit: number;
}

interface Transaction {
  id: number;
  productName: string;
  type: "IN" | "OUT";
  quantity: number;
  date: string;
  note: string;
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState<{show: boolean, product?: Product, type?: 'IN' | 'OUT'}>({show: false});
  
  const [products] = useState<Product[]>([
    { 
      id: 1, 
      name: "Beras Premium 5kg", 
      category: "Sembako",
      buyPrice: 45000, 
      sellPrice: 50000, 
      stock: 25, 
      threshold: 10,
      soldToday: 8,
      totalSold: 156,
      profit: 5000
    },
    { 
      id: 2, 
      name: "Minyak Goreng 2L", 
      category: "Sembako",
      buyPrice: 25000, 
      sellPrice: 28000, 
      stock: 15, 
      threshold: 20,
      soldToday: 12,
      totalSold: 89,
      profit: 3000
    },
    { 
      id: 3, 
      name: "Gula Pasir 1kg", 
      category: "Sembako",
      buyPrice: 12000, 
      sellPrice: 14000, 
      stock: 8, 
      threshold: 15,
      soldToday: 5,
      totalSold: 234,
      profit: 2000
    },
    { 
      id: 4, 
      name: "Kopi Bubuk 200g", 
      category: "Minuman",
      buyPrice: 15000, 
      sellPrice: 18000, 
      stock: 30, 
      threshold: 10,
      soldToday: 3,
      totalSold: 67,
      profit: 3000
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: 1, productName: "Beras Premium 5kg", type: "OUT", quantity: 5, date: "2025-10-08", note: "Penjualan" },
    { id: 2, productName: "Minyak Goreng 2L", type: "IN", quantity: 20, date: "2025-10-08", note: "Restock" },
    { id: 3, productName: "Gula Pasir 1kg", type: "OUT", quantity: 3, date: "2025-10-08", note: "Penjualan" },
  ]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "semua" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.threshold);
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stock), 0);
  const todayProfit = products.reduce((sum, p) => sum + (p.profit * p.soldToday), 0);

  const categories = ["semua", ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventori</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Kelola stok dan produk koperasi</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ekspor Data</span>
            <span className="sm:hidden">Ekspor</span>
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Tambah Produk</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-lg bg-blue-50">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
              </div>
              <div className="text-xs sm:text-sm font-medium px-2 py-1 rounded-full text-blue-700 bg-blue-100">
                {totalProducts} Items
              </div>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Produk</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-lg bg-emerald-50">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div className="text-xs sm:text-sm font-medium px-2 py-1 rounded-full text-emerald-700 bg-emerald-100">
                +15%
              </div>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Nilai Stok</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(totalStockValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-lg bg-amber-50">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div className="text-xs sm:text-sm font-medium px-2 py-1 rounded-full text-amber-700 bg-amber-100">
                {lowStockProducts.length} Items
              </div>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Stok Rendah</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-lg bg-green-50">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="text-xs sm:text-sm font-medium px-2 py-1 rounded-full text-green-700 bg-green-100">
                Hari Ini
              </div>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Keuntungan</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(todayProfit)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Products Table */}
        <div className="xl:col-span-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Daftar Produk</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari produk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === "semua" ? "Semua Kategori" : cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Produk</TableHead>
                      <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                      <TableHead className="hidden md:table-cell">Harga Beli</TableHead>
                      <TableHead className="hidden md:table-cell">Harga Jual</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead className="hidden lg:table-cell">Terjual</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">
                              {product.category} • {formatCurrency(product.sellPrice)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-600">
                          {product.category}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatCurrency(product.buyPrice)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatCurrency(product.sellPrice)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              product.stock <= product.threshold 
                                ? 'text-red-600' 
                                : product.stock <= product.threshold * 1.5 
                                  ? 'text-amber-600' 
                                  : 'text-green-600'
                            }`}>
                              {product.stock}
                            </span>
                            {product.stock <= product.threshold && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600">
                          {product.soldToday}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowStockModal({show: true, product, type: 'IN'})}
                              className="p-2"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowStockModal({show: true, product, type: 'OUT'})}
                              className="p-2"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="p-2"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Recent Transactions & Low Stock Alert */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Stok Rendah
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">Semua stok dalam kondisi baik</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">Sisa: {product.stock} unit</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        Restock
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <h3 className="text-lg font-bold text-gray-900">Transaksi Terbaru</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'IN' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'IN' ? (
                        <Plus className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{transaction.productName}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.type === 'IN' ? 'Masuk' : 'Keluar'} {transaction.quantity} unit
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('id-ID')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}