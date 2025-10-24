"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotification } from '@/lib/notification-context';
import { useAuth } from '@/lib/use-auth';
import { formatCurrency } from '@/lib/utils';
import { 
  Package, 
  Plus, 
  Download, 
  BarChart3, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Info,
  Hash,
  Receipt,
  Calendar,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  Edit,
  Trash2,
  Minus,
  User,
  MapPin
} from 'lucide-react';

// Import centralized types
import { 
  Product, 
  Category, 
  Supplier, 
  StockMovement,
  ProductFormData,
  StockFormData,
  FinancialData,
  FinancialPeriod,
  OwnershipFilter,
  StockCycleFilter
} from '@/types/inventory';

// Import extracted components (mix of named and default exports)
import { FinancialMetricsCard } from '@/components/inventory/FinancialMetricsCard';
import { ProductFilters } from '@/components/inventory/ProductFilters';
import { Pagination } from '@/components/inventory/Pagination';
import { StockMovementsList } from '@/components/inventory/StockMovementsList';
import ProductTable from '@/components/inventory/ProductTable';
import ProductModal from '@/components/inventory/ProductModal';
import StockModal from '@/components/inventory/StockModal';
import FilterModal from '@/components/inventory/FilterModal';

export default function InventoryPage() {
  // ✅ AUTHORIZATION CHECK - Admin/Super Admin only
  const { user, loading: authLoading, authorized } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [selectedOwnership, setSelectedOwnership] = useState<OwnershipFilter>('semua');
  const [selectedCycle, setSelectedCycle] = useState<StockCycleFilter>('semua');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>('today');
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAllMovementsModal, setShowAllMovementsModal] = useState(false);
  const [showConsignmentPaymentModal, setShowConsignmentPaymentModal] = useState(false);
  const [showPaymentReviewModal, setShowPaymentReviewModal] = useState(false);
  const [paidSupplierIds, setPaidSupplierIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingPaymentRequests, setPendingPaymentRequests] = useState<any[]>([]);
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<any>(null);
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Loading State
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [dailySummary, setDailySummary] = useState({
    totalIn: 0,
    totalOut: 0,
    totalMovements: 0,
  });
  const [periodFinancialData, setPeriodFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    totalProfit: 0,
    totalSoldItems: 0,
    uniqueProductsSold: 0,
    productBreakdown: [],
    consignmentBreakdown: [], // NEW: Consignment supplier breakdown
    toko: { revenue: 0, cogs: 0, profit: 0 },
    consignment: { grossRevenue: 0, cogs: 0, profit: 0, feeTotal: 0 },
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  // Form State (for modals)
  const [priceError, setPriceError] = useState('');
  const [stockFormData, setStockFormData] = useState<StockFormData>({
    type: 'IN',
    quantity: '',
    note: '',
  });
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    description: '',
    sku: '',
    buyPrice: '',
    sellPrice: '',
    stock: '',
    threshold: '5',
    unit: 'pcs',
    ownershipType: 'TOKO',
    stockCycle: 'HARIAN',
    supplierId: '',
    supplierName: '',
    supplierContact: '',
  });
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedRange, setSelectedRange] = useState<any>(null);

  // Global notifications
  const { success, error, warning } = useNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false);
      }
    };
    
    if (showPeriodDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodDropdown]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
    fetchStockMovements();
    fetchDailySummary();
  }, [financialPeriod]); // Change from selectedDate to financialPeriod

  // Fetch financial data when period or date changes
  useEffect(() => {
    fetchPeriodFinancialData();
    fetchPendingPaymentRequests(); // Fetch pending payment requests
  }, [financialPeriod, selectedDate]);

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
      const token = localStorage.getItem('token');
      
      // Use period API instead of date-specific API to follow dropdown period
      const response = await fetch(`/api/stock-movements?period=${financialPeriod}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setStockMovements(result.data);
      } else {
        error('Gagal Memuat Data', 'Tidak dapat memuat riwayat stock movement');
      }
    } catch (err) {
      error('Kesalahan', 'Terjadi kesalahan saat memuat riwayat stock movement');
    }
  };

  const fetchDailySummary = async (date?: string) => {
    try {
      const targetDate = date || selectedDate;
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stock-movements/summary?date=${targetDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setDailySummary(result.data);
      } else {
        error('Gagal Memuat Data', 'Tidak dapat memuat ringkasan harian');
      }
    } catch (err) {
      error('Kesalahan', 'Terjadi kesalahan saat memuat ringkasan harian');
    }
  };

  const fetchPeriodFinancialData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const isCustomDate = selectedDate !== today;
      
      const url = isCustomDate 
        ? `/api/financial/period?period=today&date=${selectedDate}`
        : `/api/financial/period?period=${financialPeriod}`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setPeriodFinancialData({
          totalRevenue: result.data.totalRevenue,
          totalProfit: result.data.totalProfit,
          totalSoldItems: result.data.totalSoldItems,
          uniqueProductsSold: result.data.uniqueProductsSold || 0,
          productBreakdown: result.data.productBreakdown || [],
          consignmentBreakdown: result.data.consignmentBreakdown || [], // NEW: Consignment breakdown
          toko: result.data.toko || { revenue: 0, cogs: 0, profit: 0 },
          consignment: result.data.consignment || { grossRevenue: 0, cogs: 0, profit: 0, feeTotal: 0 },
        });
        // Initialize paid supplier ids from API so already-paid suppliers show as paid
        try {
          const paidIds = (result.data.consignmentBreakdown || []).filter((s: any) => s.isPaid).map((s: any) => s.supplierId);
          setPaidSupplierIds(paidIds);
        } catch (e) {
          // ignore
        }
      } else {
        error('Gagal Memuat Data', 'Tidak dapat memuat data keuangan periode');
      }
    } catch (err) {
      error('Kesalahan', 'Terjadi kesalahan saat memuat data keuangan');
    }
  };

  const fetchPendingPaymentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/payment-requests?status=PENDING', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setPendingPaymentRequests(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending payment requests', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        error('Gagal Memuat Data', 'Tidak dapat memuat daftar produk');
      }
    } catch (err) {
      error('Kesalahan', 'Terjadi kesalahan saat memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        error('Gagal Memuat Data', 'Tidak dapat memuat daftar kategori');
      }
    } catch (err) {
      error('Kesalahan', 'Terjadi kesalahan saat memuat kategori');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setSuppliers(result.data);
      } else {
        error('Gagal Memuat Data', 'Tidak dapat memuat daftar supplier');
      }
    } catch (err) {
      error('Kesalahan', 'Terjadi kesalahan saat memuat supplier');
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

  // Adapted handler for StockModal component
  const handleStockSubmit = async (formData: StockFormData) => {
    if (!selectedProduct) {
      warning('Produk Tidak Dipilih', 'Silakan pilih produk terlebih dahulu');
      return;
    }

    if (!formData.quantity) {
      warning('Form Tidak Lengkap', 'Jumlah wajib diisi');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      warning('Jumlah Tidak Valid', 'Jumlah harus lebih dari 0');
      return;
    }

    // Check stock for OUT movements
    if (formData.type === 'OUT' && quantity > selectedProduct.stock) {
      warning('Stok Tidak Cukup', `Stok tersedia: ${selectedProduct.stock} ${selectedProduct.unit || 'pcs'}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: formData.type,
          quantity,
          note: formData.note,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Close modal and reset
        setShowStockModal(false);
        setSelectedProduct(null);
        
        // Set tanggal ke hari ini dan refresh data
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        setFinancialPeriod('today'); // Reset period to today untuk melihat transaction baru
        
        // Refresh data dengan tanggal hari ini
        await fetchProducts();
        await fetchStockMovements(today);
        await fetchDailySummary(today);
        await fetchPeriodFinancialData(); // Update omzet & keuntungan
        
        success('Stock Movement Berhasil', result.message);
      } else {
        error('Gagal Menyimpan', result.error || 'Terjadi kesalahan saat menyimpan stock movement');
      }
    } catch (err) {
      error('Kesalahan Server', 'Tidak dapat menyimpan stock movement, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockModalClose = () => {
    setShowStockModal(false);
    setSelectedProduct(null);
  };

  // Adapted handler for ProductModal component
  const handleProductSubmit = async (formData: ProductFormData) => {
    if (!formData.name || !formData.categoryId || !formData.buyPrice || !formData.sellPrice) {
      warning('Form Tidak Lengkap', 'Nama, kategori, harga beli, dan harga jual wajib diisi');
      return;
    }

    // Validate price comparison
    if (!validatePrices(formData.buyPrice, formData.sellPrice)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      // Parse formatted prices back to numbers
      const productData = {
        ...formData,
        buyPrice: parsePriceInput(formData.buyPrice),
        sellPrice: parsePriceInput(formData.sellPrice),
      };
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        // Close modal and reset
        setShowAddModal(false);
        setEditingProduct(null);
        
        // Set tanggal ke hari ini untuk melihat stock movement baru
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        setFinancialPeriod('today'); // Reset period to today untuk melihat transaction baru
        
        // Refresh data dengan tanggal hari ini
        await fetchProducts(); // Refresh product list
        await fetchStockMovements(today); // Fetch stock movements untuk hari ini
        await fetchDailySummary(today); // Fetch summary untuk hari ini
        await fetchPeriodFinancialData(); // Update omzet & keuntungan
        
        const action = editingProduct ? 'diperbarui' : 'ditambahkan';
        success(`Produk Berhasil ${action.charAt(0).toUpperCase() + action.slice(1)}`, 
               `${formData.name} telah ${action}`);
      } else {
        const action = editingProduct ? 'memperbarui' : 'menambahkan';
        error(`Gagal ${action.charAt(0).toUpperCase() + action.slice(1)} Produk`, 
              result.error || `Terjadi kesalahan saat ${action} produk`);
      }
    } catch (err) {
      const action = editingProduct ? 'mengupdate' : 'menambahkan';
      error('Kesalahan Server', `Tidak dapat ${action} produk, silakan coba lagi`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductModalClose = () => {
    setShowAddModal(false);
    setEditingProduct(null);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        success('Produk Dihapus', 'Produk berhasil dihapus');
        fetchProducts(); // Refresh the product list
      } else {
        error('Gagal Menghapus', data.error || 'Gagal menghapus produk');
      }
    } catch (err) {
      error('Kesalahan Server', 'Tidak dapat menghapus produk, silakan coba lagi');
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "semua" || product.category.name === selectedCategory;
      const matchesOwnership = selectedOwnership === "semua" || product.ownershipType === selectedOwnership;
      const matchesCycle = selectedCycle === "semua" || product.stockCycle === selectedCycle;
      const matchesStock = !hideOutOfStock || product.stock > 0; // Hide out of stock filter
      return matchesSearch && matchesCategory && matchesOwnership && matchesCycle && matchesStock;
    })
    .sort((a, b) => b.stock - a.stock); // Sort by stock: highest to lowest

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const lowStockProducts = products.filter(p => p.stock <= p.threshold);
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + ((p.avgCost || p.buyPrice || 0) * p.stock), 0);
  const todayProfit = products.reduce((sum, p) => sum + (p.profit * p.soldToday), 0);
  
  // Financial metrics calculations
  const totalSoldToday = products.reduce((sum, p) => sum + p.soldToday, 0);
  
  // Consignment Payments: Total nilai konsinyasi yang harus dibayar ke consignor 
  // HANYA hitung ketika produk TITIPAN terjual (SALE_OUT movement dengan produk isConsignment/ownershipType=TITIPAN)
  // BUKAN ketika produk masuk (CONSIGNMENT_IN)
  const consignmentSaleMovements = stockMovements.filter(m => 
    m.movementType === 'SALE_OUT' && 
    m.quantity < 0 && // OUT movement = negative quantity
    m.product && 
    (m.product.isConsignment || m.product.ownershipType === 'TITIPAN')
  );
  
  const consignmentPayments = consignmentSaleMovements.reduce((sum, m) => {
    // Gunakan unitCost dari movement (COGS), atau fallback ke avgCost/buyPrice
    const unitCost = m.unitCost || m.product?.avgCost || m.product?.buyPrice || 0;
    return sum + (unitCost * Math.abs(m.quantity));
  }, 0);

  // Pending consignment payments (exclude suppliers already paid in the current period)
  const pendingConsignmentPayments = periodFinancialData.consignmentBreakdown
    ? periodFinancialData.consignmentBreakdown.filter(s => !s.isPaid).reduce((sum, s) => sum + (s.cogs || 0), 0)
    : 0;

  const unpaidConsignmentSuppliersCount = periodFinancialData.consignmentBreakdown
    ? periodFinancialData.consignmentBreakdown.filter(s => !s.isPaid).length
    : 0;
  
  const totalRevenue = products.reduce((sum, p) => sum + (p.sellPrice * p.soldToday), 0);
  const totalProfit = products.reduce((sum, p) => {
    const cost = p.avgCost || p.buyPrice || 0;
    return sum + ((p.sellPrice - cost) * p.soldToday);
  }, 0);

  const categoryOptions = ["semua", ...categories.map(c => c.name)];

  // ✅ LOADING STATE - Show while checking auth
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Memuat data inventory...</p>
        </div>
      </div>
    );
  }

  // ✅ AUTHORIZATION CHECK - Only ADMIN and SUPER_ADMIN allowed
  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-600 text-6xl">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900">Akses Ditolak</h2>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman inventory.
            Hanya Admin dan Super Admin yang dapat mengakses halaman ini.
          </p>
          <Button onClick={() => window.location.href = '/koperasi/dashboard'}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
                
                {/* Period Selector Button with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-white shadow-sm hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {(() => {
                        if (isCustomDate) {
                          return new Date(selectedDate).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          });
                        }
                        if (financialPeriod === 'today') return 'Hari Ini';
                        if (financialPeriod === '7days') return '7 Hari';
                        if (financialPeriod === '1month') return '1 Bulan';
                        if (financialPeriod === '3months') return '3 Bulan';
                        if (financialPeriod === '6months') return '6 Bulan';
                        if (financialPeriod === '1year') return '1 Tahun';
                        return 'Hari Ini';
                      })()}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showPeriodDropdown && (
                    <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                      <button
                        onClick={() => {
                          setFinancialPeriod('today');
                          setIsCustomDate(false);
                          setSelectedDate(new Date().toISOString().split('T')[0]);
                          setShowPeriodDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === 'today' && !isCustomDate ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        Hari Ini
                      </button>
                      <button
                        onClick={() => {
                          setFinancialPeriod('7days');
                          setIsCustomDate(false);
                          setShowPeriodDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '7days' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        7 Hari
                      </button>
                      <button
                        onClick={() => {
                          setFinancialPeriod('1month');
                          setIsCustomDate(false);
                          setShowPeriodDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '1month' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        1 Bulan
                      </button>
                      <button
                        onClick={() => {
                          setFinancialPeriod('3months');
                          setIsCustomDate(false);
                          setShowPeriodDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '3months' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        3 Bulan
                      </button>
                      <button
                        onClick={() => {
                          setFinancialPeriod('6months');
                          setIsCustomDate(false);
                          setShowPeriodDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '6months' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        6 Bulan
                      </button>
                      <button
                        onClick={() => {
                          setFinancialPeriod('1year');
                          setIsCustomDate(false);
                          setShowPeriodDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${financialPeriod === '1year' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        1 Tahun
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Calendar Button */}
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setIsCustomDate(true);
                      setSelectedRange(null);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Pilih tanggal"
                  />
                  <button 
                    className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-gray-600 hover:bg-blue-50 transition-colors shadow-sm"
                    title="Pilih tanggal"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Period Display */}
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  const isToday = selectedDate === today;
                  
                  if (financialPeriod === 'today' && isToday) return 'Hari Ini';
                  if (financialPeriod === '7days') return '7 Hari Terakhir';
                  if (financialPeriod === '1month') return '30 Hari Terakhir';
                  if (financialPeriod === '3months') return '3 Bulan Terakhir';
                  if (financialPeriod === '6months') return '6 Bulan Terakhir';
                  if (financialPeriod === '1year') return '1 Tahun Terakhir';
                  
                  // Custom date selected
                  return new Date(selectedDate).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  });
                })()}
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
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(periodFinancialData.totalRevenue)}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {periodFinancialData.totalSoldItems} produk terjual
                  </span>
                </div>
              </div>
              
              {/* Keuntungan Bersih */}
              <div className="space-y-2 border-l border-blue-100 pl-6 relative group">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Keuntungan Bersih</span>
                  <PiggyBank className="h-4 w-4 text-green-500" />
                  {/* Info Icon with Hover Tooltip */}
                  <div className="relative">
                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                    {/* Tooltip - Shows on Hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                      {periodFinancialData.totalProfit > 0 ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-blue-300">Toko:</span>
                            <span className="font-semibold">{formatCurrency(periodFinancialData.toko.profit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-300">Titipan:</span>
                            <span className="font-semibold">{formatCurrency(periodFinancialData.consignment.profit)}</span>
                          </div>
                          <div className="flex justify-between pt-1.5 border-t border-gray-700">
                            <span className="font-medium text-emerald-300">Total:</span>
                            <span className="font-bold">{formatCurrency(periodFinancialData.totalProfit)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-2">Belum ada keuntungan</div>
                      )}
                      {/* Arrow */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(periodFinancialData.totalProfit)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Profit Margin:</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {periodFinancialData.totalRevenue > 0 ? ((periodFinancialData.totalProfit / periodFinancialData.totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              {/* Produk Terjual */}
              <div className="space-y-2 border-l border-blue-100 pl-6 relative group">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Produk Terjual</span>
                  <Hash className="h-4 w-4 text-blue-500" />
                  {/* Info Icon with Hover Tooltip */}
                  <div className="relative">
                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {periodFinancialData.productBreakdown && periodFinancialData.productBreakdown.length > 0 ? (
                          periodFinancialData.productBreakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-start gap-2">
                              <span className="text-gray-300 flex-1 leading-tight">{item.name}</span>
                              <span className="font-semibold text-blue-400 whitespace-nowrap">{item.quantity} pcs</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-center py-2">Belum ada penjualan</div>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600">{periodFinancialData.totalSoldItems}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Package className="h-3 w-3" />
                  <span>{periodFinancialData.uniqueProductsSold} jenis produk</span>
                </div>
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

          {/* Pembayaran Titipan */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-50 relative">
                  <Receipt className="w-6 h-6 text-purple-600" />
                  {pendingPaymentRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {pendingPaymentRequests.length}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium px-2 py-1 rounded-full text-purple-700 bg-purple-100">
                  Titipan
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Pembayaran Titipan</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(pendingConsignmentPayments)}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {unpaidConsignmentSuppliersCount || 0} Supplier menunggu pembayaran
                </p>
                {pendingPaymentRequests.length > 0 && (
                  <p className="text-xs text-orange-600 font-semibold mb-2">
                    🔔 {pendingPaymentRequests.length} permintaan pembayaran menunggu review
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowConsignmentPaymentModal(true)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    Kelola Pembayaran
                  </Button>
                  {pendingPaymentRequests.length > 0 && (
                    <Button
                      onClick={() => setShowPaymentReviewModal(true)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      Review ({pendingPaymentRequests.length})
                    </Button>
                  )}
                </div>
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
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Daftar Produk</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Menampilkan {filteredProducts.length} dari {products.length} produk
                  </p>
                </div>
                
                {/* Use ProductFilters Component */}
                <ProductFilters
                  searchTerm={searchTerm}
                  onSearchChange={(value) => {
                    setSearchTerm(value);
                    setCurrentPage(1);
                  }}
                  hideOutOfStock={hideOutOfStock}
                  onToggleOutOfStock={() => setHideOutOfStock(!hideOutOfStock)}
                  selectedCategory={selectedCategory}
                  selectedOwnership={selectedOwnership}
                  selectedCycle={selectedCycle}
                  onCategoryChange={setSelectedCategory}
                  onOwnershipChange={setSelectedOwnership}
                  onCycleChange={setSelectedCycle}
                  onShowFilterModal={() => setShowFilterModal(true)}
                  totalProducts={products.length}
                  filteredCount={filteredProducts.length}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Use ProductTable Component */}
              <ProductTable
                products={paginatedProducts}
                hideOutOfStock={hideOutOfStock}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onStockUpdate={handleStockUpdate}
                onDelete={handleDeleteProduct}
              />

              {/* Use Pagination Component */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={filteredProducts.length}
                />
              )}
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
                stockMovements.slice(0, 5).map((movement) => {
                  // Detect IN/OUT from movementType: check if ends with "_IN" or is positive quantity
                  const isIncoming = movement.movementType?.includes('_IN') || 
                                    (movement.quantity > 0 && movement.movementType !== 'SALE_OUT');
                  
                  return (
                  <div key={movement.id} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-full shrink-0 ${
                        isIncoming
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {isIncoming ? (
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
                          {isIncoming ? 'Masuk' : 'Keluar'} {Math.abs(movement.quantity)} {movement.product.unit}
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
                  );
                })
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
      <ProductModal
        isOpen={showAddModal}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        onClose={handleProductModalClose}
        onSubmit={handleProductSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Stock Movement Modal */}
      <StockModal
        isOpen={showStockModal}
        product={selectedProduct}
        onClose={handleStockModalClose}
        onSubmit={handleStockSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedOwnership={selectedOwnership}
        selectedCycle={selectedCycle}
        onCategoryChange={setSelectedCategory}
        onOwnershipChange={setSelectedOwnership}
        onCycleChange={setSelectedCycle}
        onReset={() => {
          setSelectedCategory('semua');
          setSelectedOwnership('semua');
          setSelectedCycle('semua');
        }}
        onClose={() => setShowFilterModal(false)}
      />

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
                         <span className="text-gray-400">Tidak ada (Titipan)</span>}
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
                            const token = localStorage.getItem('token');
                            // Bulk delete all stock movements for selected date
                            const response = await fetch(`/api/stock-movements?date=${selectedDate}`, { 
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                              }
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
                            error('Kesalahan', 'Tidak dapat menghapus stock movements, silakan coba lagi');
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
                  stockMovements.map((movement) => {
                    // Find product details from products list for profit calculation
                    const product = products.find(p => p.id === movement.productId);
                    const costPrice = product?.avgCost || product?.buyPrice || 0;
                    const sellPrice = product?.sellPrice || 0;
                    const profitPerUnit = sellPrice - costPrice;
                    const profitMargin = costPrice > 0 ? (profitPerUnit / costPrice) * 100 : 0;
                    const totalProfit = profitPerUnit * Math.abs(movement.quantity);
                    
                    return (
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
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{movement.product.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-sm text-gray-600">
                                  <span className={`font-medium ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                    {movement.type === 'IN' ? '+' : '-'}{Math.abs(movement.quantity)}
                                  </span>
                                  {' '}{movement.product.unit}
                                </p>
                                {product && movement.type === 'OUT' && profitPerUnit > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">•</span>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 text-emerald-600" />
                                      <span className="text-xs font-semibold text-emerald-600">
                                        {formatCurrency(totalProfit)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({profitMargin.toFixed(1)}% margin)
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {movement.note && (
                                <p className="text-sm text-gray-500 mt-1">{movement.note}</p>
                              )}
                              {product && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span>Harga Beli: {formatCurrency(costPrice)}</span>
                                  <span>•</span>
                                  <span>Harga Jual: {formatCurrency(sellPrice)}</span>
                                  <span>•</span>
                                  <span className="font-medium text-emerald-600">
                                    Laba/unit: {formatCurrency(profitPerUnit)}
                                  </span>
                                </div>
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
                    );
                  })
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

      {/* Consignment Payment Modal */}
      {showConsignmentPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Pembayaran Titipan</h2>
                  <p className="text-purple-100 text-sm">Kelola pembayaran ke supplier titipan</p>
                </div>
                <button
                  onClick={() => setShowConsignmentPaymentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Receipt className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Tagihan</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(consignmentPayments)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Supplier</p>
                      <p className="text-xl font-bold text-gray-900">{periodFinancialData.consignmentBreakdown?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Profit Koperasi</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(
                          periodFinancialData.consignmentBreakdown?.reduce((sum, item) => sum + item.profit, 0) || 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier List */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Tagihan per Supplier</h3>
                
                {periodFinancialData.consignmentBreakdown && periodFinancialData.consignmentBreakdown.length > 0 ? (
                  periodFinancialData.consignmentBreakdown.map((supplier, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{supplier.supplierName}</h4>
                              <p className="text-sm text-gray-500">ID: {supplier.supplierId || supplier.supplierName}</p>
                            </div>
                          </div>
                          
                          {/* Supplier Contact Details */}
                          <div className="mt-3 space-y-1 pl-11">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{supplier.supplierContact || 'Pemilik: Tidak ada data'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{supplier.supplierPhone || 'Telepon: Tidak ada data'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{supplier.supplierAddress || 'Alamat: Tidak ada data'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Status</p>
                          {supplier.isPaid || paidSupplierIds.includes(supplier.supplierId) ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              Lunas
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              Belum Dibayar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Revenue Penjualan</p>
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(supplier.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Harus Dibayar ke Supplier</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(supplier.cogs)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Profit Koperasi</p>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(supplier.profit)}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch('/api/consignment/payments', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                              },
                              body: JSON.stringify({ 
                                supplierIds: [supplier.supplierId], 
                                amounts: { [supplier.supplierId]: supplier.cogs },
                                period: financialPeriod,
                                paymentMethod: 'CASH'
                              }),
                            });
                            const data = await response.json();
                            if (!response.ok || !data.success) throw new Error(data.error || 'Failed');

                            // Optimistic update
                            setPaidSupplierIds(prev => [...prev, supplier.supplierId]);
                            success('Pembayaran Berhasil', `Pembayaran ke ${supplier.supplierName} sebesar ${formatCurrency(supplier.cogs)} berhasil dicatat`);
                            
                            // Refresh financial data to update consignment breakdown
                            await fetchPeriodFinancialData();
                          } catch (err) {
                            console.error('Pay supplier error', err);
                            error('Gagal', 'Pembayaran gagal dicatat, silakan coba lagi');
                          }
                        }}
                        disabled={supplier.isPaid || paidSupplierIds.includes(supplier.supplierId)}
                        className={`w-full ${supplier.isPaid || paidSupplierIds.includes(supplier.supplierId) ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
                      >
                        <DollarSign className="w-5 h-5" />
                        {supplier.isPaid || paidSupplierIds.includes(supplier.supplierId) ? 'Sudah Dibayar' : `Bayar ${formatCurrency(supplier.cogs)}`}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium mb-1">Belum Ada Tagihan</p>
                    <p className="text-sm text-gray-400">Tagihan akan muncul setelah ada penjualan produk titipan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{unpaidConsignmentSuppliersCount}</span> supplier menunggu pembayaran
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConsignmentPaymentModal(false)}
                  variant="outline"
                  className="px-6"
                >
                  Tutup
                </Button>
                        {unpaidConsignmentSuppliersCount > 0 && (
                  <Button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const unpaidSuppliers = (periodFinancialData.consignmentBreakdown || []).filter(s => !s.isPaid);
                        if (unpaidSuppliers.length === 0) {
                          error('Tidak ada tagihan', 'Semua supplier sudah dibayar');
                          return;
                        }

                        const supplierIds = unpaidSuppliers.map(s => s.supplierId);
                        const amounts: Record<string, number> = {};
                        unpaidSuppliers.forEach(s => { amounts[s.supplierId] = s.cogs; });

                        const response = await fetch('/api/consignment/payments', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                          body: JSON.stringify({ 
                            supplierIds, 
                            amounts,
                            period: financialPeriod,
                            paymentMethod: 'CASH'
                          }),
                        });
                        const data = await response.json();
                        if (!response.ok || !data.success) throw new Error(data.error || 'Failed');

                        // Mark all as paid (use supplierId)
                        setPaidSupplierIds(prev => [...prev, ...unpaidSuppliers.map(s => s.supplierId)]);
                        const unpaidTotal = unpaidSuppliers.reduce((sum, s) => sum + s.cogs, 0);
                        success('Pembayaran Semua Berhasil', `Total ${formatCurrency(unpaidTotal)} untuk ${unpaidSuppliers.length} supplier berhasil dicatat`);
                        
                        // Refresh financial data to update consignment breakdown
                        await fetchPeriodFinancialData();
                      } catch (err) {
                        console.error('Pay all error', err);
                        error('Gagal', 'Pembayaran semua gagal dicatat, silakan coba lagi');
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Bayar Semua
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Review Modal (Admin) */}
      {showPaymentReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Review Permintaan Pembayaran</h2>
                  <p className="text-sm text-orange-100">Supplier mengajukan pembayaran dengan bukti transfer</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowPaymentReviewModal(false);
                  setSelectedPaymentRequest(null);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedPaymentRequest ? (
                /* Detail View */
                <div className="space-y-6">
                  <Button
                    onClick={() => setSelectedPaymentRequest(null)}
                    variant="outline"
                    className="mb-4"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Kembali ke Daftar
                  </Button>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Payment Proof Image */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-orange-600" />
                        Bukti Pembayaran
                      </h3>
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        {selectedPaymentRequest.proofImageUrl ? (
                          <img 
                            src={selectedPaymentRequest.proofImageUrl} 
                            alt="Payment Proof"
                            className="w-full h-auto"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-64 text-gray-400">
                            No image uploaded
                          </div>
                        )}
                      </div>
                      <a
                        href={selectedPaymentRequest.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Buka gambar di tab baru →
                      </a>
                    </div>

                    {/* Right: Payment Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Info className="w-5 h-5 text-orange-600" />
                        Detail Permintaan
                      </h3>

                      {/* Supplier Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-semibold mb-2">SUPPLIER</p>
                        <p className="text-lg font-bold text-gray-900">{selectedPaymentRequest.supplier?.businessName || 'N/A'}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>👤 {selectedPaymentRequest.supplier?.ownerName || 'N/A'}</p>
                          <p>📞 {selectedPaymentRequest.supplier?.phone || 'N/A'}</p>
                          <p>📧 {selectedPaymentRequest.supplier?.email || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Payment Amount */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <p className="text-xs text-emerald-600 font-semibold mb-2">JUMLAH PEMBAYARAN</p>
                        <p className="text-3xl font-bold text-emerald-700">{formatCurrency(selectedPaymentRequest.amount)}</p>
                      </div>

                      {/* Period */}
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <p className="text-xs text-purple-600 font-semibold mb-2">PERIODE</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPaymentRequest.period}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(selectedPaymentRequest.periodStart).toLocaleDateString('id-ID')} - {new Date(selectedPaymentRequest.periodEnd).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      {/* Bank Details */}
                      {(selectedPaymentRequest.bankName || selectedPaymentRequest.accountNumber) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-xs text-gray-600 font-semibold mb-2">DETAIL TRANSFER</p>
                          {selectedPaymentRequest.bankName && (
                            <p className="text-sm text-gray-900">🏦 {selectedPaymentRequest.bankName}</p>
                          )}
                          {selectedPaymentRequest.accountNumber && (
                            <p className="text-sm text-gray-900 mt-1">💳 Rek: {selectedPaymentRequest.accountNumber}</p>
                          )}
                        </div>
                      )}

                      {/* Note */}
                      {selectedPaymentRequest.note && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <p className="text-xs text-yellow-700 font-semibold mb-2">CATATAN</p>
                          <p className="text-sm text-gray-700">{selectedPaymentRequest.note}</p>
                        </div>
                      )}

                      {/* Submission Time */}
                      <div className="text-xs text-gray-500">
                        Diajukan pada: {new Date(selectedPaymentRequest.requestedAt || selectedPaymentRequest.createdAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={async () => {
                        const reason = prompt('Alasan penolakan:');
                        if (!reason) return;
                        
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`/api/admin/payment-requests/${selectedPaymentRequest.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({ 
                              action: 'reject',
                              rejectedReason: reason,
                            }),
                          });
                          const data = await response.json();
                          
                          if (data.success) {
                            success('Ditolak', 'Permintaan pembayaran berhasil ditolak');
                            setSelectedPaymentRequest(null);
                            fetchPendingPaymentRequests();
                          } else {
                            error('Gagal', data.error || 'Gagal menolak permintaan');
                          }
                        } catch (err) {
                          error('Kesalahan', 'Terjadi kesalahan saat menolak permintaan');
                        }
                      }}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Tolak Pembayaran
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!confirm('Setujui pembayaran ini? Transaksi akan dibuat otomatis.')) return;
                        
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`/api/admin/payment-requests/${selectedPaymentRequest.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({ action: 'approve' }),
                          });
                          const data = await response.json();
                          
                          if (data.success) {
                            success('Disetujui', 'Pembayaran disetujui dan transaksi telah dibuat');
                            setSelectedPaymentRequest(null);
                            fetchPendingPaymentRequests();
                            fetchPeriodFinancialData();
                          } else {
                            error('Gagal', data.error || 'Gagal menyetujui permintaan');
                          }
                        } catch (err) {
                          error('Kesalahan', 'Terjadi kesalahan saat menyetujui permintaan');
                        }
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Setujui Pembayaran
                    </Button>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Daftar Permintaan Pembayaran ({pendingPaymentRequests.length})
                  </h3>
                  
                  {pendingPaymentRequests.length > 0 ? (
                    pendingPaymentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white border-2 border-orange-200 rounded-xl p-5 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedPaymentRequest(request)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Package className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">{request.supplier?.businessName || 'Unknown Supplier'}</h4>
                                <p className="text-sm text-gray-500">{request.supplier?.ownerName || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500">Jumlah:</span>
                                <span className="ml-1 font-bold text-emerald-600">{formatCurrency(request.amount)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Periode:</span>
                                <span className="ml-1 font-semibold text-gray-900">{request.period}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Diajukan:</span>
                                <span className="ml-1 text-gray-700">{new Date(request.requestedAt || request.createdAt).toLocaleDateString('id-ID')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                              Menunggu Review
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-400 mt-2 ml-auto" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 font-medium mb-1">Tidak Ada Permintaan</p>
                      <p className="text-sm text-gray-400">Semua permintaan pembayaran telah diproses</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!selectedPaymentRequest && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{pendingPaymentRequests.length}</span> permintaan menunggu review
                </p>
                <Button
                  onClick={() => setShowPaymentReviewModal(false)}
                  variant="outline"
                  className="px-6"
                >
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}