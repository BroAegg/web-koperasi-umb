"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateSelector } from '@/components/ui/date-selector';
import { useNotification } from '@/lib/notification-context';
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
  Edit,
  Trash2,
  BarChart3,
  X,
  Hash,
  DollarSign,
  Receipt,
  PiggyBank,
  Calendar
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
  unit: string;
  soldToday: number;
  totalSold: number;
  profit: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface StockMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  note: string;
  date: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    unit: string;
  };
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [financialPeriod, setFinancialPeriod] = useState<'today' | '7days' | '1month' | '3months' | '6months' | '1year'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceError, setPriceError] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [dailySummary, setDailySummary] = useState({
    totalIn: 0,
    totalOut: 0,
    totalMovements: 0,
  });
  const [stockFormData, setStockFormData] = useState({
    type: 'IN' as 'IN' | 'OUT',
    quantity: '',
    note: '',
  });

  // Global notifications
  const { success, error, warning } = useNotification();

  // Form state for new/edit product
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
    fetchStockMovements();
    fetchDailySummary();
  }, [selectedDate]);

  const fetchStockMovements = async () => {
    try {
      const response = await fetch(`/api/stock-movements?date=${selectedDate}&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        setStockMovements(result.data);
      } else {
        console.error('Failed to fetch stock movements:', result.error);
      }
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await fetch(`/api/stock-movements/summary?date=${selectedDate}`);
      const result = await response.json();
      
      if (result.success) {
        setDailySummary(result.data);
      } else {
        console.error('Failed to fetch daily summary:', result.error);
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  };

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

  // Validate prices
  const validatePrices = (buyPrice: string, sellPrice: string) => {
    const buyPriceNum = parseFloat(buyPrice) || 0;
    const sellPriceNum = parseFloat(sellPrice) || 0;
    
    if (buyPrice && sellPrice && sellPriceNum <= buyPriceNum) {
      setPriceError('Harga jual harus lebih tinggi dari harga beli');
      return false;
    } else {
      setPriceError('');
      return true;
    }
  };

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockFormData.quantity || !selectedProduct) {
      warning('Form Tidak Lengkap', 'Jumlah wajib diisi');
      return;
    }

    const quantity = parseInt(stockFormData.quantity);
    if (quantity <= 0) {
      warning('Jumlah Tidak Valid', 'Jumlah harus lebih dari 0');
      return;
    }

    // Check stock for OUT movements
    if (stockFormData.type === 'OUT' && quantity > selectedProduct.stock) {
      warning('Stok Tidak Cukup', `Stok tersedia: ${selectedProduct.stock} ${selectedProduct.unit || 'pcs'}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: stockFormData.type,
          quantity,
          note: stockFormData.note,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setStockFormData({ type: 'IN', quantity: '', note: '' });
        setShowStockModal(false);
        setSelectedProduct(null);
        
        // Refresh data
        fetchProducts();
        fetchStockMovements();
        fetchDailySummary();
        
        success('Stock Movement Berhasil', result.message);
      } else {
        error('Gagal Menyimpan', result.error || 'Terjadi kesalahan saat menyimpan stock movement');
      }
    } catch (err) {
      console.error('Error creating stock movement:', err);
      error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.categoryId || !newProduct.buyPrice || !newProduct.sellPrice) {
      warning('Form Tidak Lengkap', 'Nama, kategori, harga beli, dan harga jual wajib diisi');
      return;
    }

    // Validate price comparison
    if (!validatePrices(newProduct.buyPrice, newProduct.sellPrice)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
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
        setEditingProduct(null);
        fetchProducts(); // Refresh list
        
        const action = editingProduct ? 'diperbarui' : 'ditambahkan';
        success(`Produk Berhasil ${action.charAt(0).toUpperCase() + action.slice(1)}`, 
               `${newProduct.name} telah ${action}`);
      } else {
        const action = editingProduct ? 'memperbarui' : 'menambahkan';
        error(`Gagal ${action.charAt(0).toUpperCase() + action.slice(1)} Produk`, 
              result.error || `Terjadi kesalahan saat ${action} produk`);
      }
    } catch (err) {
      console.error('Error saving product:', err);
      error('Kesalahan Server', 'Terjadi kesalahan pada server, silakan coba lagi');
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
    setPriceError('');
  };

  // Product Actions Handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: '', // Product interface doesn't have description, set empty
      categoryId: product.category.id,
      sku: '', // Product interface doesn't have sku, set empty
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock.toString(),
      threshold: product.threshold.toString(),
      unit: product.unit,
    });
    setShowAddModal(true);
  };

  const handleStockUpdate = (product: Product) => {
    setSelectedProduct(product);
    setStockFormData({ type: 'IN', quantity: '', note: '' });
    setShowStockModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        success('Produk Dihapus', 'Produk berhasil dihapus');
        fetchProducts(); // Refresh the product list
      } else {
        error('Gagal Menghapus', data.error || 'Gagal menghapus produk');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      error('Kesalahan Server', 'Terjadi kesalahan saat menghapus produk');
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "semua" || product.category.name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.stock - a.stock); // Sort by stock: highest to lowest

  const lowStockProducts = products.filter(p => p.stock <= p.threshold);
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stock), 0);
  const todayProfit = products.reduce((sum, p) => sum + (p.profit * p.soldToday), 0);
  
  // Financial metrics calculations
  const totalSoldToday = products.reduce((sum, p) => sum + p.soldToday, 0);
  const consignmentPayments = products.reduce((sum, p) => sum + (p.buyPrice * p.stock * 0.3), 0); // Assuming 30% consignment
  const totalRevenue = products.reduce((sum, p) => sum + (p.sellPrice * p.soldToday), 0);
  const totalProfit = products.reduce((sum, p) => sum + ((p.sellPrice - p.buyPrice) * p.soldToday), 0);

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

      {/* Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onRangeChange={setSelectedRange}
        activeRange={selectedRange}
        showControls={true}
      />

      {/* Statistics Cards with Visual Hierarchy */}
      <div className="space-y-4 sm:space-y-6">
        {/* DOMINANT: Financial Metrics Card */}
        <Card className="border border-blue-200 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="border-b border-blue-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Omzet & Keuntungan</h3>
                  <p className="text-xs text-gray-600">Analisis performa finansial</p>
                </div>
              </div>
              
              {/* Period Dropdown & Calendar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium hidden sm:inline">Periode:</span>
                <div className="flex items-center rounded-lg border border-blue-200 bg-white shadow-sm overflow-hidden">
                  <select
                    value={financialPeriod}
                    onChange={(e) => setFinancialPeriod(e.target.value as any)}
                    className="px-3 py-1.5 text-xs font-medium bg-white border-none outline-none appearance-none cursor-pointer text-gray-700"
                  >
                    <option value="today">Hari Ini</option>
                    <option value="7days">7 Hari</option>
                    <option value="1month">1 Bulan</option>
                    <option value="3months">3 Bulan</option>
                    <option value="6months">6 Bulan</option>
                    <option value="1year">1 Tahun</option>
                  </select>
                  <button className="px-2.5 py-1.5 border-l border-blue-100 text-gray-600 hover:bg-blue-50 transition-colors">
                    <Calendar className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Period Display */}
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {financialPeriod === 'today' ? 'Hari Ini' :
                 financialPeriod === '7days' ? '7 Hari Terakhir' :
                 financialPeriod === '1month' ? '30 Hari Terakhir' :
                 financialPeriod === '3months' ? '3 Bulan Terakhir' :
                 financialPeriod === '6months' ? '6 Bulan Terakhir' :
                 '1 Tahun Terakhir'}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Omzet */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Total Omzet</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +12% dari periode sebelumnya
                  </span>
                </div>
              </div>
              
              {/* Keuntungan Bersih */}
              <div className="space-y-2 border-l border-blue-100 pl-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Keuntungan Bersih</span>
                  <PiggyBank className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalProfit)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Profit Margin:</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              {/* Produk Terjual */}
              <div className="space-y-2 border-l border-blue-100 pl-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Produk Terjual</span>
                  <Hash className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalSoldToday}</p>
                <p className="text-xs text-gray-500">
                  Item terjual periode ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECONDARY: Other Metrics - 3 Cards in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Produk */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Package className="w-6 h-6 text-blue-700" />
                </div>
                <div className="text-sm font-medium px-2 py-1 rounded-full text-blue-700 bg-blue-100">
                  {totalProducts} Items
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Produk</h3>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {lowStockProducts.length} produk stok rendah
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Nilai Stok */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-emerald-50">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-sm font-medium px-2 py-1 rounded-full text-emerald-700 bg-emerald-100">
                  Asset
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Nilai Stok</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStockValue)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Total aset inventory
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pembayaran Konsinyasi */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm font-medium px-2 py-1 rounded-full text-purple-700 bg-purple-100">
                  Konsinyasi
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Pembayaran Konsinyasi</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(consignmentPayments)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Total stock movement: {dailySummary.totalMovements}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
                            {/* View Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProduct(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            
                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50"
                              title="Edit Produk"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            
                            {/* Stock Update Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockUpdate(product)}
                              className="p-1.5 text-green-600 hover:bg-green-50"
                              title="Update Stok"
                            >
                              <Package className="w-3 h-3" />
                            </Button>
                            
                            {/* Delete Button */}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1.5"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3 h-3" />
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
          {/* Recent Stock Movements */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate">Stock Movement</h3>
                <Button variant="outline" size="sm" className="shrink-0 text-xs px-2 py-1 h-6 whitespace-nowrap">
                  <BarChart3 className="w-3 h-3" />
                  <span className="ml-1 hidden xl:inline">Lihat Semua</span>
                </Button>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {new Date(selectedDate).toLocaleDateString('id-ID', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {stockMovements.length > 0 ? (
                stockMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-full shrink-0 ${
                        movement.type === 'IN' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {movement.type === 'IN' ? (
                          <Plus className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate" title={movement.product.name}>
                          {movement.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movement.type === 'IN' ? 'Masuk' : 'Keluar'} {movement.quantity} {movement.product.unit}
                        </p>
                        {movement.note && (
                          <p className="text-xs text-gray-400 mt-1 truncate" title={movement.note}>
                            {movement.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(movement.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada stock movement</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Low Stock Alert */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="truncate">Stok Rendah</span>
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">Semua stok dalam kondisi baik</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate" title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">Sisa: {product.stock} unit</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs shrink-0 px-2 py-1 h-auto whitespace-nowrap"
                      >
                        Restock
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingProduct ? 'Update Produk' : 'Tambah Produk Baru'}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {editingProduct ? 'Perbarui informasi produk inventori' : 'Tambahkan produk baru ke inventori koperasi'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Produk *
                    </label>
                    <Input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="Masukkan nama produk"
                      leftIcon={<Package className="w-4 h-4 text-gray-400" />}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi <span className="text-gray-500 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Deskripsi produk..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU <span className="text-gray-500 font-normal">(Opsional)</span>
                    </label>
                    <Input
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      placeholder="SKU produk"
                      leftIcon={<Hash className="w-4 h-4 text-gray-400" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Satuan
                    </label>
                    <select
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pcs">Pcs</option>
                      <option value="kg">Kg</option>
                      <option value="liter">Liter</option>
                      <option value="pack">Pack</option>
                      <option value="box">Box</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Beli *
                    </label>
                    <Input
                      type="number"
                      value={newProduct.buyPrice}
                      onChange={(e) => {
                        const newBuyPrice = e.target.value;
                        setNewProduct({...newProduct, buyPrice: newBuyPrice});
                        validatePrices(newBuyPrice, newProduct.sellPrice);
                      }}
                      placeholder="Masukkan harga beli"
                      leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Jual *
                    </label>
                    <Input
                      type="number"
                      value={newProduct.sellPrice}
                      onChange={(e) => {
                        const newSellPrice = e.target.value;
                        setNewProduct({...newProduct, sellPrice: newSellPrice});
                        validatePrices(newProduct.buyPrice, newSellPrice);
                      }}
                      placeholder="Masukkan harga jual"
                      leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                      className={priceError ? 'border-red-300 focus:ring-red-500' : ''}
                      required
                    />
                    {priceError && (
                      <p className="text-red-500 text-xs mt-1">{priceError}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Awal
                    </label>
                    <Input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="Masukkan stok awal"
                      leftIcon={<Package className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Stok
                    </label>
                    <Input
                      type="number"
                      value={newProduct.threshold}
                      onChange={(e) => setNewProduct({...newProduct, threshold: e.target.value})}
                      placeholder="Minimum stok alert"
                      leftIcon={<AlertTriangle className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                      resetProductForm();
                    }}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !!priceError}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      'Menyimpan...'
                    ) : (
                      <>
                        {editingProduct ? (
                          <Edit className="w-4 h-4 mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {editingProduct ? 'Update Produk' : 'Tambah Produk'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Update Stok Produk</h3>
                  <p className="text-green-100 text-sm mt-1">Kelola stok masuk dan keluar produk</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedProduct(null);
                    setStockFormData({ type: 'IN', quantity: '', note: '' });
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">
                      Stok saat ini: {selectedProduct.stock} {selectedProduct.unit}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleStockMovement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Movement *
                  </label>
                  <select
                    value={stockFormData.type}
                    onChange={(e) => setStockFormData({ ...stockFormData, type: e.target.value as 'IN' | 'OUT' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="IN">Stock Masuk</option>
                    <option value="OUT">Stock Keluar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah {stockFormData.type === 'IN' ? 'Masuk' : 'Keluar'} *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={stockFormData.quantity}
                      onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                      placeholder="0"
                      min="1"
                      required
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {selectedProduct.unit}
                    </span>
                  </div>
                  {stockFormData.type === 'OUT' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Maksimal: {selectedProduct.stock} {selectedProduct.unit}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan <span className="text-gray-500 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    value={stockFormData.note}
                    onChange={(e) => setStockFormData({ ...stockFormData, note: e.target.value })}
                    placeholder="Tambahkan catatan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowStockModal(false);
                      setSelectedProduct(null);
                      setStockFormData({ type: 'IN', quantity: '', note: '' });
                    }}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 ${
                      stockFormData.type === 'IN' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? (
                      'Menyimpan...'
                    ) : (
                      <>
                        {stockFormData.type === 'IN' ? (
                          <Plus className="w-4 h-4 mr-2" />
                        ) : (
                          <Minus className="w-4 h-4 mr-2" />
                        )}
                        {stockFormData.type === 'IN' ? 'Tambah Stock' : 'Kurangi Stock'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && !showStockModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Detail Produk</h3>
                  <p className="text-blue-100 text-sm mt-1">Informasi lengkap produk inventori</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Informasi Produk</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Nama Produk</label>
                      <p className="font-medium">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Kategori</label>
                      <p className="font-medium">{selectedProduct.category.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Satuan</label>
                      <p className="font-medium">{selectedProduct.unit}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Informasi Harga</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Harga Beli</label>
                      <p className="font-medium">{formatCurrency(selectedProduct.buyPrice)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Harga Jual</label>
                      <p className="font-medium">{formatCurrency(selectedProduct.sellPrice)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Keuntungan per Unit</label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedProduct.sellPrice - selectedProduct.buyPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Informasi Stok</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Stok Saat Ini</label>
                      <p className={`font-medium ${
                        selectedProduct.stock <= selectedProduct.threshold 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {selectedProduct.stock} {selectedProduct.unit}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Minimum Stok</label>
                      <p className="font-medium">{selectedProduct.threshold} {selectedProduct.unit}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Statistik Penjualan</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Terjual Hari Ini</label>
                      <p className="font-medium">{selectedProduct.soldToday} {selectedProduct.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Total Terjual</label>
                      <p className="font-medium">{selectedProduct.totalSold} {selectedProduct.unit}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(null);
                      handleEditProduct(selectedProduct);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Produk
                  </Button>
                  <Button
                    onClick={() => {
                      handleStockUpdate(selectedProduct);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Update Stok
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}