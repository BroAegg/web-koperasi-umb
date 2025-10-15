"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Calendar,
  Phone
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  buyPrice: number | null;
  avgCost: number | null;
  sellPrice: number;
  stock: number;
  threshold: number;
  unit: string;
  soldToday: number;
  totalSold: number;
  profit: number;
  ownershipType?: 'TOKO' | 'TITIPAN';
  stockCycle?: 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN';
  isConsignment?: boolean;
  supplierId?: string | null;
  supplier?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  supplierContact?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
}

interface StockMovement {
  id: string;
  productId: string;
  movementType?: 'PURCHASE_IN' | 'CONSIGNMENT_IN' | 'SALE_OUT' | 'RETURN_IN' | 'RETURN_OUT' | 'EXPIRED_OUT' | 'ADJUSTMENT';
  type: "IN" | "OUT" | "ADJUSTMENT"; // Legacy field
  quantity: number;
  unitCost?: number;
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
  const [selectedOwnership, setSelectedOwnership] = useState<'semua' | 'TOKO' | 'TITIPAN'>('semua');
  const [selectedCycle, setSelectedCycle] = useState<'semua' | 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN'>('semua');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [financialPeriod, setFinancialPeriod] = useState<'today' | '7days' | '1month' | '3months' | '6months' | '1year'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAllMovementsModal, setShowAllMovementsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceError, setPriceError] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
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
    supplierId: '',
    supplierName: '',
    supplierContact: '',
    sku: '',
    buyPrice: '',
    sellPrice: '',
    stock: '0',
    threshold: '5',
    unit: 'pcs',
    ownershipType: 'TOKO' as 'TOKO' | 'TITIPAN',
    stockCycle: 'HARIAN' as 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN',
    isConsignment: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
    fetchStockMovements();
    fetchDailySummary();
  }, [selectedDate]);

  // Price formatting helper
  const formatPriceInput = (value: string) => {
    // Remove non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Format with thousand separator
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parsePriceInput = (value: string) => {
    // Remove dots and convert to number
    return value.replace(/\./g, '');
  };

  // Calculate margin helper
  const calculateMargin = (buyPrice: string, sellPrice: string) => {
    const buy = parseFloat(parsePriceInput(buyPrice)) || 0;
    const sell = parseFloat(parsePriceInput(sellPrice)) || 0;
    const margin = sell - buy;
    const marginPercent = buy > 0 ? ((margin / buy) * 100) : 0;
    return { margin, marginPercent };
  };

  // WhatsApp Restock Helper
  const handleWhatsAppRestock = (product: Product, supplierContact?: string) => {
    if (!supplierContact) {
      warning('Kontak Tidak Tersedia', 'Supplier belum memiliki nomor kontak. Silakan update data supplier terlebih dahulu.');
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = supplierContact.replace(/\D/g, '');
    
    // Check if it's a valid phone number
    if (!cleanPhone || cleanPhone.length < 8) {
      error('Nomor Tidak Valid', 'Nomor kontak supplier tidak valid. Silakan periksa kembali.');
      return;
    }

    // Format Indonesian phone number (add 62 if starts with 0)
    const formattedPhone = cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.substring(1) 
      : cleanPhone.startsWith('62') 
        ? cleanPhone 
        : '62' + cleanPhone;

    // Create WhatsApp message
    const message = encodeURIComponent(
      `Halo, saya dari Koperasi UMB.\n\n` +
      `Kami ingin melakukan restock untuk:\n` +
      `📦 Produk: ${product.name}\n` +
      `📊 Stok saat ini: ${product.stock} ${product.unit}\n` +
      `⚠️ Minimum stok: ${product.threshold} ${product.unit}\n\n` +
      `Mohon informasi ketersediaan dan harga terkini.\n` +
      `Terima kasih.`
    );

    // Open WhatsApp
    const waUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(waUrl, '_blank');
    
    success('WhatsApp Dibuka', `Pesan restock untuk ${product.name} siap dikirim`);
  };

  const fetchStockMovements = async (date?: string) => {
    try {
      const targetDate = date || selectedDate;
      const response = await fetch(`/api/stock-movements?date=${targetDate}&limit=20`);
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

  const fetchDailySummary = async (date?: string) => {
    try {
      const targetDate = date || selectedDate;
      const response = await fetch(`/api/stock-movements/summary?date=${targetDate}`);
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

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const result = await response.json();
      
      if (result.success) {
        setSuppliers(result.data);
      } else {
        console.error('Failed to fetch suppliers:', result.error);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  // Validate prices
  const validatePrices = (buyPrice: string, sellPrice: string) => {
    const buyPriceNum = parseFloat(parsePriceInput(buyPrice)) || 0;
    const sellPriceNum = parseFloat(parsePriceInput(sellPrice)) || 0;
    
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
        
        // Set tanggal ke hari ini dan refresh data
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        
        // Refresh data dengan tanggal hari ini
        fetchProducts();
        fetchStockMovements(today);
        fetchDailySummary(today);
        
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
      
      // Parse formatted prices back to numbers
      const productData = {
        ...newProduct,
        buyPrice: parsePriceInput(newProduct.buyPrice),
        sellPrice: parsePriceInput(newProduct.sellPrice),
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        resetProductForm();
        setShowAddModal(false);
        setEditingProduct(null);
        
        // Set tanggal ke hari ini untuk melihat stock movement baru
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        
        // Refresh data dengan tanggal hari ini
        fetchProducts(); // Refresh product list
        fetchStockMovements(today); // Fetch stock movements untuk hari ini
        fetchDailySummary(today); // Fetch summary untuk hari ini
        
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
      supplierId: '',
      supplierName: '',
      supplierContact: '',
      sku: '',
      buyPrice: '',
      sellPrice: '',
      stock: '', // Empty string untuk placeholder
      threshold: '5',
      unit: 'pcs',
      ownershipType: 'TOKO' as 'TOKO' | 'TITIPAN',
      stockCycle: 'HARIAN' as 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN',
      isConsignment: false,
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
      supplierId: product.supplierId || '',
      supplierName: product.supplier?.name || '',
      supplierContact: product.supplierContact || '',
      sku: '', // Product interface doesn't have sku, set empty
      buyPrice: product.buyPrice ? formatPriceInput(product.buyPrice.toString()) : '',
      sellPrice: formatPriceInput(product.sellPrice.toString()),
      stock: product.stock.toString(),
      threshold: product.threshold.toString(),
      unit: product.unit,
      ownershipType: product.ownershipType || 'TOKO',
      stockCycle: product.stockCycle || 'HARIAN',
      isConsignment: product.isConsignment || false,
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
      const matchesOwnership = selectedOwnership === "semua" || product.ownershipType === selectedOwnership;
      const matchesCycle = selectedCycle === "semua" || product.stockCycle === selectedCycle;
      return matchesSearch && matchesCategory && matchesOwnership && matchesCycle;
    })
    .sort((a, b) => b.stock - a.stock); // Sort by stock: highest to lowest

  const lowStockProducts = products.filter(p => p.stock <= p.threshold);
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + ((p.avgCost || p.buyPrice || 0) * p.stock), 0);
  const todayProfit = products.reduce((sum, p) => sum + (p.profit * p.soldToday), 0);
  
  // Financial metrics calculations
  const totalSoldToday = products.reduce((sum, p) => sum + p.soldToday, 0);
  
  // Consignment Payments: Total nilai produk konsinyasi yang MASUK hari ini (nilai TETAP)
  // Hanya hitung movement IN (quantity > 0), TIDAK terpengaruh oleh produk keluar
  const consignmentInMovements = stockMovements.filter(m => m.movementType === 'CONSIGNMENT_IN' && m.quantity > 0);
  
  const consignmentPayments = consignmentInMovements.reduce((sum, m) => {
    // Gunakan unitCost dari movement, atau fallback ke product
    const unitCost = m.unitCost || 0;
    return sum + (unitCost * Math.abs(m.quantity));
  }, 0);
  
  const totalRevenue = products.reduce((sum, p) => sum + (p.sellPrice * p.soldToday), 0);
  const totalProfit = products.reduce((sum, p) => {
    const cost = p.avgCost || p.buyPrice || 0;
    return sum + ((p.sellPrice - cost) * p.soldToday);
  }, 0);

  const categoryOptions = ["semua", ...categories.map(c => c.name)];

  return (
    <div className="space-y-4">
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

      {/* Statistics Cards with Visual Hierarchy */}
      <div className="space-y-4 sm:space-y-6">
        {/* DOMINANT: Financial Metrics Card */}
        <Card className="border border-blue-200 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="border-b border-blue-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <DollarSign className="w-4 h-4 text-white" />
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
                  
                  {/* Calendar Date Input - Hidden behind icon */}
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setFinancialPeriod('today'); // Reset to today when manual date is selected
                        setSelectedRange(null); // Clear any range selection
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button 
                      type="button"
                      className="px-2.5 py-1.5 border-l border-blue-100 text-gray-600 hover:bg-blue-50 transition-colors pointer-events-none"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
                  <Button
                    variant="outline"
                    onClick={() => setShowFilterModal(true)}
                    className="relative"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Filter
                    {(selectedCategory !== 'semua' || selectedOwnership !== 'semua' || selectedCycle !== 'semua') && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {[selectedCategory !== 'semua', selectedOwnership !== 'semua', selectedCycle !== 'semua'].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Active Filter Chips */}
              {(selectedCategory !== 'semua' || selectedOwnership !== 'semua' || selectedCycle !== 'semua') && (
                <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
                  <span className="text-xs text-gray-500 font-medium">Filter Aktif:</span>
                  
                  {/* Category Chip */}
                  {selectedCategory !== 'semua' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                      <span>Kategori: {selectedCategory}</span>
                      <button
                        onClick={() => setSelectedCategory('semua')}
                        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                        aria-label="Hapus filter kategori"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Ownership Chip */}
                  {selectedOwnership !== 'semua' && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      selectedOwnership === 'TOKO'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      <span>Jenis: {selectedOwnership === 'TOKO' ? 'Toko' : 'Titipan'}</span>
                      <button
                        onClick={() => setSelectedOwnership('semua')}
                        className={`rounded-full p-0.5 transition-colors ${
                          selectedOwnership === 'TOKO' ? 'hover:bg-blue-100' : 'hover:bg-purple-100'
                        }`}
                        aria-label="Hapus filter jenis"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Cycle Chip */}
                  {selectedCycle !== 'semua' && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      selectedCycle === 'HARIAN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      selectedCycle === 'MINGGUAN' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      <span>Siklus: {
                        selectedCycle === 'HARIAN' ? 'Harian' :
                        selectedCycle === 'MINGGUAN' ? 'Mingguan' : 'Dua Mingguan'
                      }</span>
                      <button
                        onClick={() => setSelectedCycle('semua')}
                        className={`rounded-full p-0.5 transition-colors ${
                          selectedCycle === 'HARIAN' ? 'hover:bg-orange-100' :
                          selectedCycle === 'MINGGUAN' ? 'hover:bg-green-100' :
                          'hover:bg-teal-100'
                        }`}
                        aria-label="Hapus filter siklus"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Clear All Filters Button */}
                  <button
                    onClick={() => {
                      setSelectedCategory('semua');
                      setSelectedOwnership('semua');
                      setSelectedCycle('semua');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Hapus Semua
                  </button>
                </div>
              )}
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
                      <TableHead className="hidden lg:table-cell">Margin</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead className="hidden lg:table-cell">Terjual</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-medium">{product.name}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {/* Ownership Badge - Clean, No Emoji */}
                              {product.ownershipType && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  product.ownershipType === 'TOKO' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}>
                                  {product.ownershipType === 'TOKO' ? 'Toko' : 'Titipan'}
                                </span>
                              )}
                              {/* Stock Cycle Badge - Clean, No Emoji */}
                              {product.stockCycle && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  product.stockCycle === 'HARIAN' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                  product.stockCycle === 'MINGGUAN' ? 'bg-green-50 text-green-700 border border-green-200' :
                                  'bg-teal-50 text-teal-700 border border-teal-200'
                                }`}>
                                  {product.stockCycle === 'HARIAN' ? 'Harian' :
                                   product.stockCycle === 'MINGGUAN' ? 'Mingguan' : 'Dua Mingguan'}
                                </span>
                              )}
                            </div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">
                              {product.category.name} • {formatCurrency(product.sellPrice)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-600">
                          {product.category.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.buyPrice ? formatCurrency(product.buyPrice) : 
                           <span className="text-gray-400 text-sm">-</span>}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatCurrency(product.sellPrice)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {(() => {
                            const cost = product.avgCost || product.buyPrice || 0;
                            const margin = product.sellPrice - cost;
                            const marginPercent = cost > 0 ? ((margin / cost) * 100) : 0;
                            return (
                              <div className="flex flex-col">
                                <span className={`font-medium ${margin > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                  {formatCurrency(margin)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {marginPercent.toFixed(1)}%
                                </span>
                              </div>
                            );
                          })()}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAllMovementsModal(true)}
                  className="shrink-0 text-xs px-2 py-1 h-6 whitespace-nowrap"
                >
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
                        onClick={() => handleWhatsAppRestock(product, product.supplierContact)}
                        className="text-xs shrink-0 px-2 py-1 h-auto whitespace-nowrap hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                      >
                        <Phone className="w-3 h-3 mr-1" />
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
                {/* PRIORITY 1: Jenis Kepemilikan - Paling Atas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kepemilikan *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewProduct({...newProduct, ownershipType: 'TOKO', isConsignment: false})}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        newProduct.ownershipType === 'TOKO'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      Toko
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProduct({...newProduct, ownershipType: 'TITIPAN', isConsignment: true})}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        newProduct.ownershipType === 'TITIPAN'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      Titipan
                    </button>
                  </div>
                </div>

                {/* Supplier Autocomplete Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Supplier
                    </label>
                    <Input
                      type="text"
                      value={newProduct.supplierName || ''}
                      onChange={(e) => {
                        setNewProduct({...newProduct, supplierName: e.target.value});
                        setShowSupplierDropdown(true);
                      }}
                      onFocus={() => setShowSupplierDropdown(true)}
                      onBlur={() => {
                        // Delay to allow click on dropdown item
                        setTimeout(() => setShowSupplierDropdown(false), 200);
                      }}
                      placeholder="Ketik nama supplier..."
                      leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                    />
                    {/* Autocomplete Dropdown - Only show when focused AND has input */}
                    {showSupplierDropdown && newProduct.supplierName && newProduct.supplierName.trim() && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {suppliers
                          .filter(s => s.name.toLowerCase().includes(newProduct.supplierName!.toLowerCase()))
                          .map((supplier) => (
                            <button
                              key={supplier.id}
                              type="button"
                              onClick={() => {
                                setNewProduct({
                                  ...newProduct, 
                                  supplierId: supplier.id, 
                                  supplierName: supplier.name,
                                  supplierContact: supplier.phone || supplier.email || ''
                                });
                                setShowSupplierDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-blue-50 flex flex-col gap-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{supplier.name}</span>
                                <span className="text-xs text-gray-500">{supplier.code}</span>
                              </div>
                              {(supplier.phone || supplier.email) && (
                                <span className="text-xs text-gray-400">
                                  {supplier.phone || supplier.email}
                                </span>
                              )}
                            </button>
                          ))}
                        {suppliers.filter(s => s.name.toLowerCase().includes(newProduct.supplierName!.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Supplier tidak ditemukan
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Info Kontak Supplier <span className="text-gray-500 font-normal">(Opsional)</span>
                    </label>
                    <Input
                      type="text"
                      value={newProduct.supplierContact || ''}
                      onChange={(e) => setNewProduct({...newProduct, supplierContact: e.target.value})}
                      placeholder="No. HP / Email (Opsional)"
                      leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                </div>

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
                      type="text"
                      value={newProduct.buyPrice}
                      onChange={(e) => {
                        const formatted = formatPriceInput(e.target.value);
                        setNewProduct({...newProduct, buyPrice: formatted});
                        validatePrices(formatted, newProduct.sellPrice);
                      }}
                      placeholder="0"
                      leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Jual *
                    </label>
                    <Input
                      type="text"
                      value={newProduct.sellPrice}
                      onChange={(e) => {
                        const formatted = formatPriceInput(e.target.value);
                        setNewProduct({...newProduct, sellPrice: formatted});
                        validatePrices(newProduct.buyPrice, formatted);
                      }}
                      placeholder="0"
                      leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                      className={priceError ? 'border-red-300 focus:ring-red-500' : ''}
                      required
                    />
                    {priceError && (
                      <p className="text-red-500 text-xs mt-1">{priceError}</p>
                    )}
                  </div>
                </div>

                {/* Live Margin Display */}
                {newProduct.buyPrice && newProduct.sellPrice && !priceError && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Margin Keuntungan:</span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          Rp {formatPriceInput(calculateMargin(newProduct.buyPrice, newProduct.sellPrice).margin.toString())}
                        </p>
                        <p className="text-xs text-gray-600">
                          {calculateMargin(newProduct.buyPrice, newProduct.sellPrice).marginPercent.toFixed(1)}% profit
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Awal {editingProduct && <span className="text-xs text-gray-500">(Gunakan Update Stok untuk mengubah)</span>}
                    </label>
                    <Input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="0"
                      leftIcon={<Package className="w-4 h-4 text-gray-400" />}
                      disabled={!!editingProduct}
                      className={editingProduct ? "bg-gray-100 cursor-not-allowed" : ""}
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

                {/* Siklus Stok */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Siklus Stok *
                  </label>
                  <select
                    value={newProduct.stockCycle}
                    onChange={(e) => setNewProduct({...newProduct, stockCycle: e.target.value as 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="HARIAN">Harian</option>
                    <option value="MINGGUAN">Mingguan</option>
                    <option value="DUA_MINGGUAN">Dua Mingguan</option>
                  </select>
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

      {/* Filter Modal - Clean & Organized */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Filter Produk</h3>
                  <p className="text-blue-100 text-sm mt-1">Atur filter untuk pencarian produk</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilterModal(false)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Produk
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "semua" ? "Semua Kategori" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ownership Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kepemilikan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedOwnership('semua')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedOwnership === 'semua'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setSelectedOwnership('TOKO')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedOwnership === 'TOKO'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Toko
                  </button>
                  <button
                    onClick={() => setSelectedOwnership('TITIPAN')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedOwnership === 'TITIPAN'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    Titipan
                  </button>
                </div>
              </div>

              {/* Stock Cycle Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Siklus Stok
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCycle('semua')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCycle === 'semua'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setSelectedCycle('HARIAN')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCycle === 'HARIAN'
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setSelectedCycle('MINGGUAN')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCycle === 'MINGGUAN'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    }`}
                  >
                    Mingguan
                  </button>
                  <button
                    onClick={() => setSelectedCycle('DUA_MINGGUAN')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCycle === 'DUA_MINGGUAN'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    Dua Mingguan
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 rounded-b-xl">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('semua');
                  setSelectedOwnership('semua');
                  setSelectedCycle('semua');
                }}
                className="flex-1"
              >
                Reset Filter
              </Button>
              <Button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Terapkan Filter
              </Button>
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
                    <div>
                      <label className="text-sm text-gray-600">Jenis Kepemilikan</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                          selectedProduct.ownershipType === 'TOKO' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {selectedProduct.ownershipType === 'TOKO' ? 'Toko' : 'Titipan'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Siklus Stok</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                          selectedProduct.stockCycle === 'HARIAN' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          selectedProduct.stockCycle === 'MINGGUAN' ? 'bg-green-50 text-green-700 border border-green-200' :
                          'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {selectedProduct.stockCycle === 'HARIAN' ? 'Harian' :
                           selectedProduct.stockCycle === 'MINGGUAN' ? 'Mingguan' : 'Dua Mingguan'}
                        </span>
                      </div>
                    </div>
                    {/* Supplier Info */}
                    {(selectedProduct.supplier || selectedProduct.supplierContact) && (
                      <div>
                        <label className="text-sm text-gray-600">Supplier</label>
                        <p className="font-medium">{selectedProduct.supplier?.name || '-'}</p>
                        {selectedProduct.supplierContact && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {selectedProduct.supplierContact}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Informasi Harga</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Harga Beli</label>
                      <p className="font-medium">
                        {selectedProduct.buyPrice ? formatCurrency(selectedProduct.buyPrice) : 
                         <span className="text-gray-400">Tidak ada (Konsinyasi)</span>}
                      </p>
                    </div>
                    {selectedProduct.avgCost && (
                      <div>
                        <label className="text-sm text-gray-600">Rata-rata Biaya (avgCost)</label>
                        <p className="font-medium text-blue-600">{formatCurrency(selectedProduct.avgCost)}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-gray-600">Harga Jual</label>
                      <p className="font-medium">{formatCurrency(selectedProduct.sellPrice)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Keuntungan per Unit</label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedProduct.sellPrice - (selectedProduct.avgCost || selectedProduct.buyPrice || 0))}
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

      {/* All Stock Movements Modal */}
      {showAllMovementsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Semua Stock Movement</h3>
                  <p className="text-green-100 text-sm mt-1">
                    {new Date(selectedDate).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {stockMovements.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        if (confirm(`⚠️ DEVELOPMENT MODE\n\nHapus ${stockMovements.length} stock movement untuk tanggal ini?\n\nPeringatan: Ini akan menghapus semua riwayat transaksi hari ini!`)) {
                          try {
                            // Bulk delete all stock movements for selected date
                            const response = await fetch(`/api/stock-movements?date=${selectedDate}`, { 
                              method: 'DELETE' 
                            });
                            const result = await response.json();
                            
                            if (result.success) {
                              success('Berhasil Dihapus', result.message);
                              fetchStockMovements();
                              fetchDailySummary();
                              fetchProducts();
                            } else {
                              error('Gagal Menghapus', result.error);
                            }
                          } catch (err) {
                            console.error('Error deleting movements:', err);
                            error('Kesalahan', 'Gagal menghapus stock movements');
                          }
                        }
                      }}
                      className="bg-red-500/20 border-red-300 text-white hover:bg-red-500/30"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus Semua
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAllMovementsModal(false)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Stock Masuk</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dailySummary.totalIn}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <Minus className="w-4 h-4" />
                    <span className="text-sm font-medium">Stock Keluar</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dailySummary.totalOut}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Total Movement</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{dailySummary.totalMovements}</p>
                </div>
              </div>

              {/* Movement List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">Riwayat Movement</h4>
                {stockMovements.length > 0 ? (
                  stockMovements.map((movement) => (
                    <div key={movement.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className={`p-3 rounded-full shrink-0 ${
                        movement.type === 'IN' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {movement.type === 'IN' ? (
                          <Plus className="w-5 h-5" />
                        ) : (
                          <Minus className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{movement.product.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className={`font-medium ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                              </span>
                              {' '}{movement.product.unit}
                            </p>
                            {movement.note && (
                              <p className="text-sm text-gray-500 mt-1">{movement.note}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500">
                              {new Date(movement.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(movement.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Belum ada stock movement</p>
                    <p className="text-sm mt-1">Movement akan muncul setelah ada transaksi</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}