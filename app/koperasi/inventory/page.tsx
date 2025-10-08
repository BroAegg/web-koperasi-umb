"use client";

import { useState, useEffect } from "react";
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
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  buyPrice: number;
  sellPrice: number;
  stock: number;
  threshold: number;
  soldToday: number;
  totalSold: number;
  profit: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions] = useState<Transaction[]>([]); // Will be implemented later

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    categoryId: '',
    sku: '',
    buyPrice: '',
    sellPrice: '',
    stock: '0',
    threshold: '5',
    unit: 'pcs',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        console.error('Failed to fetch products:', result.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Failed to fetch categories:', result.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.categoryId || !newProduct.buyPrice || !newProduct.sellPrice) {
      alert('Nama, kategori, harga beli, dan harga jual wajib diisi');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        resetProductForm();
        setShowAddModal(false);
        fetchProducts(); // Refresh list
        alert('Produk berhasil ditambahkan!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      description: '',
      categoryId: '',
      sku: '',
      buyPrice: '',
      sellPrice: '',
      stock: '0',
      threshold: '5',
      unit: 'pcs',
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "semua" || product.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.threshold);
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stock), 0);
  const todayProfit = products.reduce((sum, p) => sum + (p.profit * p.soldToday), 0);

  const categoryOptions = ["semua", ...categories.map(c => c.name)];

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
                    {categoryOptions.map(cat => (
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
                              {product.category.name} • {formatCurrency(product.sellPrice)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-600">
                          {product.category.name}
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Tambah Produk Baru</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetProductForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama produk"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi produk (opsional)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SKU produk (opsional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Beli
                    </label>
                    <input
                      type="number"
                      value={newProduct.buyPrice}
                      onChange={(e) => setNewProduct({...newProduct, buyPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Jual
                    </label>
                    <input
                      type="number"
                      value={newProduct.sellPrice}
                      onChange={(e) => setNewProduct({...newProduct, sellPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok Awal
                    </label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min. Stok
                    </label>
                    <input
                      type="number"
                      value={newProduct.threshold}
                      onChange={(e) => setNewProduct({...newProduct, threshold: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satuan
                    </label>
                    <select
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pcs">Pcs</option>
                      <option value="kg">Kg</option>
                      <option value="liter">Liter</option>
                      <option value="pack">Pack</option>
                      <option value="box">Box</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetProductForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}