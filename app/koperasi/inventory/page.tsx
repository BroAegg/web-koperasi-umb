"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  MapPin,
  FileSpreadsheet,
  History
} from 'lucide-react';
import { exportProductsExcel } from '@/lib/export-excel';

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
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [paidSupplierIds, setPaidSupplierIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // 💼 Business Logic State
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{supplier: any; amount: number} | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CREDIT'>('CASH');
  const [paymentNote, setPaymentNote] = useState('');
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [returnRemaining, setReturnRemaining] = useState(false);
  const [remainingBatches, setRemainingBatches] = useState<{totalQty: number; productCount: number}>({totalQty: 0, productCount: 0});
  
  // 🔄 Payment State Management
  const [paymentLoading, setPaymentLoading] = useState<Record<string, boolean>>({});
  const [optimisticPayments, setOptimisticPayments] = useState<string[]>([]);
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  
  // 🔒 Security & Tracking State
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: string;
    supplierId: string;
    amount: number;
    timestamp: number;
    method: string;
  }>>([]);
  const [consignmentPaymentHistory, setConsignmentPaymentHistory] = useState<Array<{
    id: string;
    supplierName: string;
    amount: number;
    period: string;
    paymentMethod: string;
    createdAt: string;
    note?: string;
    metadata?: any; // Add metadata field for return info
  }>>([]);
  const [recentPaymentAttempts, setRecentPaymentAttempts] = useState<Record<string, number>>({});
  
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

  // 🔧 Helper functions for safe supplier data access
  const getSupplierName = useMemo(() => (supplier: any) => {
    return supplier?.supplierName || supplier?.name || 'Supplier Tidak Dikenal';
  }, []);

  const getSupplierContact = useMemo(() => (supplier: any) => {
    const contact = supplier?.supplierContact || supplier?.contact || supplier?.contactPerson;
    return contact || 'Pemilik: Tidak ada data';
  }, []);

  const getSupplierPhone = useMemo(() => (supplier: any) => {
    const phone = supplier?.supplierPhone || supplier?.phone || supplier?.phoneNumber;
    return phone || 'Telepon: Tidak ada data';
  }, []);

  const getSupplierAddress = useMemo(() => (supplier: any) => {
    const address = supplier?.supplierAddress || supplier?.address;
    return address || 'Alamat: Tidak ada data';
  }, []);

  const getSupplierFinancials = useMemo(() => (supplier: any) => {
    const revenue = typeof supplier?.revenue === 'number' ? supplier.revenue : 0;
    const cogs = typeof supplier?.cogs === 'number' ? supplier.cogs : 0;
    const profit = typeof supplier?.profit === 'number' ? supplier.profit : (revenue - cogs);
    
    return { revenue, cogs, profit };
  }, []);

  const getSupplierId = useMemo(() => (supplier: any) => {
    return supplier?.supplierId || supplier?.id || supplier?.supplierName || 'unknown';
  }, []);

  const isSupplierPaid = useMemo(() => (supplier: any, paidIds: string[]) => {
    const supplierId = supplier?.supplierId || supplier?.id;
    return supplier?.isPaid === true || paidIds.includes(supplierId);
  }, []);

  // ⚡ Memoized formatters for performance
  const safeFormatCurrency = useMemo(() => (amount: any) => {
    const numAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
    return formatCurrency(numAmount);
  }, []);

  // 🔄 Payment State Management Functions (defined early for memoized calculations)
  const isPaymentLoading = (supplierId: string) => {
    return paymentLoading[supplierId] || false;
  };

  const isSupplierPaidWithOptimistic = (supplier: any, paidIds: string[]) => {
    const supplierId = getSupplierId(supplier);
    return (
      isSupplierPaid(supplier, paidIds) || 
      optimisticPayments.includes(supplierId)
    );
  };

  // Memoized calculations
  const totalConsignmentPayments = useMemo(() => {
    return periodFinancialData.consignmentBreakdown?.reduce((sum, supplier) => {
      const { cogs } = getSupplierFinancials(supplier);
      return sum + cogs;
    }, 0) || 0;
  }, [periodFinancialData.consignmentBreakdown]);

  const totalConsignmentProfit = useMemo(() => {
    return periodFinancialData.consignmentBreakdown?.reduce((sum, supplier) => {
      const { profit } = getSupplierFinancials(supplier);
      return sum + profit;
    }, 0) || 0;
  }, [periodFinancialData.consignmentBreakdown]);

  const unpaidSuppliersCount = useMemo(() => {
    return periodFinancialData.consignmentBreakdown?.filter(supplier => 
      !isSupplierPaidWithOptimistic(supplier, paidSupplierIds)
    ).length || 0;
  }, [periodFinancialData.consignmentBreakdown, paidSupplierIds, optimisticPayments]);

  // 🔄 More Payment State Management Functions
  const startPaymentLoading = (supplierId: string) => {
    setPaymentLoading(prev => ({ ...prev, [supplierId]: true }));
    setPaymentErrors(prev => {
      const { [supplierId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const stopPaymentLoading = (supplierId: string) => {
    setPaymentLoading(prev => {
      const { [supplierId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const addOptimisticPayment = (supplierId: string) => {
    setOptimisticPayments(prev => [...prev, supplierId]);
  };

  const confirmPayment = (supplierId: string) => {
    setOptimisticPayments(prev => prev.filter(id => id !== supplierId));
    setPaidSupplierIds(prev => [...prev, supplierId]);
  };

  const rollbackPayment = (supplierId: string, errorMessage: string) => {
    setOptimisticPayments(prev => prev.filter(id => id !== supplierId));
    setPaymentErrors(prev => ({ ...prev, [supplierId]: errorMessage }));
  };

  // � Security Functions
  const isDuplicatePaymentAttempt = (supplierId: string): boolean => {
    const lastAttempt = recentPaymentAttempts[supplierId];
    if (!lastAttempt) return false;
    
    const now = Date.now();
    const cooldownPeriod = 5000; // 5 seconds cooldown
    
    return (now - lastAttempt) < cooldownPeriod;
  };

  const recordPaymentAttempt = (supplierId: string) => {
    setRecentPaymentAttempts(prev => ({ 
      ...prev, 
      [supplierId]: Date.now() 
    }));
  };

  const addToPaymentHistory = (supplierId: string, amount: number, method: string) => {
    const historyEntry = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      supplierId,
      amount,
      timestamp: Date.now(),
      method
    };
    
    setPaymentHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  // Fetch consignment payment history
  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/consignment/payments?limit=100');
      const result = await response.json();
      
      if (result.success && result.data.payments) {
        setConsignmentPaymentHistory(result.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const hasRecentPayment = (supplierId: string): boolean => {
    const recentPayment = paymentHistory.find(p => 
      p.supplierId === supplierId && 
      (Date.now() - p.timestamp) < 300000 // 5 minutes
    );
    return !!recentPayment;
  };

  // �💼 Business Logic Functions
  const validatePaymentAmount = (amount: number): string | null => {
    if (amount <= 0) return 'Jumlah pembayaran harus lebih dari 0';
    if (amount > 100000000) return 'Jumlah pembayaran terlalu besar (maksimal Rp 100 juta)';
    if (!Number.isInteger(amount)) return 'Jumlah pembayaran harus berupa angka bulat';
    return null;
  };

  const validatePaymentMethod = (method: string): boolean => {
    return ['CASH', 'TRANSFER', 'CREDIT'].includes(method);
  };

  const validateSupplierForPayment = (supplier: any): string | null => {
    const supplierId = getSupplierId(supplier);
    const { cogs } = getSupplierFinancials(supplier);
    
    // Security checks
    if (isDuplicatePaymentAttempt(supplierId)) {
      return 'Terlalu banyak percobaan pembayaran. Tunggu 5 detik dan coba lagi.';
    }
    
    if (hasRecentPayment(supplierId)) {
      return 'Pembayaran untuk supplier ini baru saja dilakukan. Periksa riwayat pembayaran.';
    }
    
    // Business logic checks
    if (isSupplierPaidWithOptimistic(supplier, paidSupplierIds)) {
      return 'Supplier sudah dibayar atau sedang dalam proses pembayaran';
    }
    
    if (cogs <= 0) {
      return 'Tidak ada tagihan untuk supplier ini';
    }
    
    const amountError = validatePaymentAmount(cogs);
    if (amountError) return amountError;
    
    return null;
  };

  const openPaymentConfirmation = async (supplier: any) => {
    const validationError = validateSupplierForPayment(supplier);
    if (validationError) {
      error('Tidak Dapat Memproses', validationError);
      return;
    }
    
    const { cogs } = getSupplierFinancials(supplier);
    setPendingPayment({ supplier, amount: cogs });
    setPaymentNote('');
    setReturnRemaining(false);
    
    // Fetch remaining batches count
    try {
      const supplierId = getSupplierId(supplier);
      const response = await fetch(`/api/consignment/batches/remaining?consignorId=${supplierId}`);
      if (response.ok) {
        const data = await response.json();
        setRemainingBatches(data);
      } else {
        setRemainingBatches({totalQty: 0, productCount: 0});
      }
    } catch (err) {
      console.error('Failed to fetch remaining batches:', err);
      setRemainingBatches({totalQty: 0, productCount: 0});
    }
    
    setShowPaymentConfirmModal(true);
  };

  const executePayment = async () => {
    if (!pendingPayment) return;
    
    const { supplier, amount } = pendingPayment;
    const supplierId = getSupplierId(supplier);
    
    try {
      // Record payment attempt for security tracking
      recordPaymentAttempt(supplierId);
      
      startPaymentLoading(supplierId);
      addOptimisticPayment(supplierId);
      setShowPaymentConfirmModal(false);
      
      // NextAuth cookies handle authentication automatically
      const response = await fetch('/api/consignment/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          supplierIds: [supplierId], 
          amounts: { [supplierId]: amount },
          period: financialPeriod,
          paymentMethod: selectedPaymentMethod,
          note: paymentNote.trim() || undefined,
          returnRemaining: returnRemaining // NEW: Include return flag
        }),
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Gagal memproses pembayaran');

      // Record successful payment in history
      addToPaymentHistory(supplierId, amount, selectedPaymentMethod);
      
      confirmPayment(supplierId);
      stopPaymentLoading(supplierId);
      
      const successMsg = returnRemaining 
        ? `Pembayaran ke ${getSupplierName(supplier)} sebesar ${safeFormatCurrency(amount)} berhasil dicatat dan ${remainingBatches.totalQty} pcs sisa barang dikembalikan`
        : `Pembayaran ke ${getSupplierName(supplier)} sebesar ${safeFormatCurrency(amount)} berhasil dicatat`;
      
      success('Pembayaran Berhasil', successMsg);
      
      // Refresh all financial data to update both modal and main inventory page
      await fetchPeriodFinancialData();
      
      // Add payment record to history for tracking
      addToPaymentHistory(supplierId, amount, selectedPaymentMethod);
      
      setPendingPayment(null);
      setReturnRemaining(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pembayaran gagal dicatat, silakan coba lagi';
      rollbackPayment(supplierId, errorMessage);
      stopPaymentLoading(supplierId);
      
      console.error('Pay supplier error', err);
      error('Gagal', errorMessage);
    }
  };

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
  }, [financialPeriod, selectedDate]);

  // Lock body scroll when payment confirmation modal is open
  useEffect(() => {
    if (showPaymentConfirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPaymentConfirmModal]);

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

  // Pending consignment payments (exclude suppliers already paid in the current period + paid suppliers from state)
  const pendingConsignmentPayments = periodFinancialData.consignmentBreakdown
    ? periodFinancialData.consignmentBreakdown
        .filter(s => !isSupplierPaidWithOptimistic(s, paidSupplierIds))
        .reduce((sum, s) => sum + (s.cogs || 0), 0)
    : 0;

  const unpaidConsignmentSuppliersCount = periodFinancialData.consignmentBreakdown
    ? periodFinancialData.consignmentBreakdown.filter(s => !isSupplierPaidWithOptimistic(s, paidSupplierIds)).length
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
                <div className="p-3 rounded-lg bg-purple-50">
                  <Receipt className="w-6 h-6 text-purple-600" />
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowConsignmentPaymentModal(true)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    Kelola Pembayaran
                  </Button>
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
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Export Button */}
                  <Button
                    onClick={async () => {
                      try {
                        // Transform products to match export interface
                        const productsForExport = filteredProducts.map(p => ({
                          name: p.name,
                          sku: p.sku,
                          category: p.category?.name || '-',
                          stock: p.stock,
                          buyPrice: p.buyPrice || undefined,
                          sellPrice: p.sellPrice,
                          threshold: p.threshold,
                        }));
                        await exportProductsExcel(productsForExport);
                        success('Export Berhasil', 'Data produk berhasil diexport ke Excel');
                      } catch (err) {
                        error('Export Gagal', 'Terjadi kesalahan saat export data');
                      }
                    }}
                    disabled={filteredProducts.length === 0}
                    variant="outline"
                    className="flex items-center gap-2 text-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </Button>
                  
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

      {/* Consignment Payment Modal - Responsive */}
      {showConsignmentPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header - Responsive */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24"></div>
              <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate">Pembayaran Titipan</h2>
                  <p className="text-purple-100 text-xs sm:text-sm truncate">Kelola pembayaran ke supplier titipan</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      fetchPaymentHistory();
                      setShowPaymentHistoryModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">History</span>
                  </button>
                  <button
                    onClick={() => setShowConsignmentPaymentModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]">
              {/* Summary Cards - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                      <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Tagihan</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{safeFormatCurrency(pendingConsignmentPayments)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Supplier Belum Dibayar</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{unpaidConsignmentSuppliersCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Profit Koperasi</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {safeFormatCurrency(totalConsignmentProfit)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier List */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Detail Tagihan per Supplier</h3>
                
                {periodFinancialData.consignmentBreakdown && 
                 periodFinancialData.consignmentBreakdown.filter(supplier => !isSupplierPaidWithOptimistic(supplier, paidSupplierIds)).length > 0 ? (
                  periodFinancialData.consignmentBreakdown
                    .filter(supplier => !isSupplierPaidWithOptimistic(supplier, paidSupplierIds)) // Only show unpaid suppliers
                    .map((supplier, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                              <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-lg font-bold text-gray-900 truncate">{getSupplierName(supplier)}</h4>
                              <p className="text-sm text-gray-500 truncate">ID: {getSupplierId(supplier)}</p>
                            </div>
                          </div>
                          
                          {/* Supplier Contact Details - Mobile Responsive */}
                          <div className="mt-3 space-y-1 sm:pl-11">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{getSupplierContact(supplier)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{getSupplierPhone(supplier)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{getSupplierAddress(supplier)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <p className="text-sm text-gray-500 mb-1">Status</p>
                          {isSupplierPaidWithOptimistic(supplier, paidSupplierIds) ? (
                            optimisticPayments.includes(getSupplierId(supplier)) ? (
                              <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 animate-pulse">
                                Sedang Diproses
                              </span>
                            ) : (
                              <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                Lunas
                              </span>
                            )
                          ) : (
                            <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              Belum Dibayar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial Details - Responsive Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="text-center sm:text-left">
                          <p className="text-xs text-gray-500 mb-1">Revenue Penjualan</p>
                          <p className="text-lg font-bold text-emerald-600 truncate">{safeFormatCurrency(getSupplierFinancials(supplier).revenue)}</p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-xs text-gray-500 mb-1">Harus Dibayar ke Supplier</p>
                          <p className="text-lg font-bold text-red-600 truncate">{safeFormatCurrency(getSupplierFinancials(supplier).cogs)}</p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-xs text-gray-500 mb-1">Profit Koperasi</p>
                          <p className="text-lg font-bold text-blue-600 truncate">{safeFormatCurrency(getSupplierFinancials(supplier).profit)}</p>
                        </div>
                      </div>

                      {/* Error Message Display */}
                      {paymentErrors[getSupplierId(supplier)] && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </div>
                            <p className="text-sm text-red-700">{paymentErrors[getSupplierId(supplier)]}</p>
                          </div>
                        </div>
                      )}

                      {/* Action Button with Confirmation */}
                      <button
                        onClick={() => openPaymentConfirmation(supplier)}
                        disabled={isSupplierPaidWithOptimistic(supplier, paidSupplierIds) || isPaymentLoading(getSupplierId(supplier))}
                        className={`w-full ${
                          isSupplierPaidWithOptimistic(supplier, paidSupplierIds) 
                            ? 'bg-emerald-300 cursor-not-allowed' 
                            : isPaymentLoading(getSupplierId(supplier))
                            ? 'bg-purple-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700'
                        } text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base`}
                      >
                        {isPaymentLoading(getSupplierId(supplier)) ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                            <span className="truncate">Memproses...</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            <span className="truncate">
                              {isSupplierPaidWithOptimistic(supplier, paidSupplierIds) 
                                ? (optimisticPayments.includes(getSupplierId(supplier)) ? 'Sedang Diproses...' : 'Sudah Dibayar')
                                : `Bayar ${safeFormatCurrency(getSupplierFinancials(supplier).cogs)}`
                              }
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-4 border-2 border-dashed border-gray-200">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <Receipt className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                      </div>
                      <div className="max-w-sm mx-auto">
                        <p className="text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          {periodFinancialData.consignmentBreakdown && periodFinancialData.consignmentBreakdown.length > 0 
                            ? 'Semua Supplier Sudah Dibayar' 
                            : 'Belum Ada Tagihan'
                          }
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                          {periodFinancialData.consignmentBreakdown && periodFinancialData.consignmentBreakdown.length > 0 
                            ? `Semua ${periodFinancialData.consignmentBreakdown.length} supplier untuk periode ini sudah dibayar lunas.`
                            : `Tagihan akan muncul setelah ada penjualan produk titipan dalam periode `
                          }
                          {periodFinancialData.consignmentBreakdown && periodFinancialData.consignmentBreakdown.length === 0 && (
                            <span className="font-medium text-purple-600">
                              {financialPeriod === 'today' ? 'hari ini' : 
                               financialPeriod === '7days' ? '7 hari terakhir' :
                               financialPeriod === '1month' ? '1 bulan terakhir' : 
                               'periode yang dipilih'}
                            </span>
                          )}
                        </p>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                          <button
                            onClick={() => setShowConsignmentPaymentModal(false)}
                            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Tutup
                          </button>
                          <button
                            onClick={() => {
                              setShowConsignmentPaymentModal(false);
                              // Navigate to POS or add consignment products
                            }}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Buka Kasir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Responsive */}
            <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-600 text-center sm:text-left">
                <span className="font-semibold">{unpaidConsignmentSuppliersCount}</span> supplier menunggu pembayaran
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowConsignmentPaymentModal(false)}
                  variant="outline"
                  className="px-4 sm:px-6 w-full sm:w-auto"
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
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 w-full sm:w-auto"
                  >
                    <DollarSign className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">Bayar Semua</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmModal && pendingPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white rounded-t-2xl">
              <h3 className="text-xl font-bold">Konfirmasi Pembayaran</h3>
              <p className="text-purple-100 text-sm mt-1">Pastikan detail pembayaran sudah benar</p>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Supplier Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{getSupplierName(pendingPayment.supplier)}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>ID: {getSupplierId(pendingPayment.supplier)}</p>
                  <p className="text-lg font-bold text-red-600">
                    Jumlah: {safeFormatCurrency(pendingPayment.amount)}
                  </p>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="CASH">Tunai</option>
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="CREDIT">Kredit</option>
                </select>
              </div>
              
              {/* Payment Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Tambahkan catatan pembayaran..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{paymentNote.length}/500 karakter</p>
              </div>

              {/* Return Remaining Goods Checkbox */}
              {remainingBatches.totalQty > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={returnRemaining}
                      onChange={(e) => setReturnRemaining(e.target.checked)}
                      className="mt-1 w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                        Kembalikan sisa barang titipan
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-amber-700">{remainingBatches.totalQty} pcs</span> dari{' '}
                        <span className="font-medium text-amber-700">{remainingBatches.productCount} produk</span> belum terjual
                      </div>
                      {returnRemaining && (
                        <div className="mt-2 text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded inline-block">
                          ✓ Sisa barang akan dikembalikan ke supplier setelah pembayaran
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentConfirmModal(false);
                  setPendingPayment(null);
                  setPaymentNote('');
                  setReturnRemaining(false);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all hover:scale-105"
              >
                Batal
              </button>
              <button
                onClick={executePayment}
                disabled={!pendingPayment || paymentNote.length > 500}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Konfirmasi Bayar
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">History Pembayaran Titipan</h2>
                    <p className="text-indigo-100 text-sm mt-1">Riwayat semua pembayaran yang telah dilakukan</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentHistoryModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
              {consignmentPaymentHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Belum Ada Riwayat Pembayaran</p>
                  <p className="text-sm">History pembayaran titipan akan muncul di sini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consignmentPaymentHistory.map((payment: {
                    id: string;
                    supplierName: string;
                    amount: number;
                    period: string;
                    paymentMethod: string;
                    createdAt: string;
                    note?: string;
                    metadata?: any;
                  }, index: number) => {
                    const paymentDate = new Date(payment.createdAt);
                    const supplierInfo = periodFinancialData.consignmentBreakdown?.find(
                      s => s.supplierId === payment.supplierName
                    );
                    
                    return (
                      <div 
                        key={payment.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Supplier Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              <h3 className="font-bold text-gray-900 truncate">
                                {supplierInfo?.supplierName || payment.supplierName}
                              </h3>
                            </div>
                            
                            {supplierInfo && (
                              <div className="space-y-1 text-sm text-gray-600 mb-3">
                                {supplierInfo.supplierContact && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{supplierInfo.supplierContact}</span>
                                  </div>
                                )}
                                {supplierInfo.supplierPhone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{supplierInfo.supplierPhone}</span>
                                  </div>
                                )}
                                {supplierInfo.supplierAddress && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">{supplierInfo.supplierAddress}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Payment Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500">Tanggal:</span>
                                <p className="font-medium text-gray-900">
                                  {paymentDate.toLocaleDateString('id-ID', { 
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Waktu:</span>
                                <p className="font-medium text-gray-900">
                                  {paymentDate.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Periode:</span>
                                <p className="font-medium text-gray-900">{payment.period}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Metode:</span>
                                <p className="font-medium text-gray-900">
                                  {payment.paymentMethod === 'CASH' ? 'Tunai' : 
                                   payment.paymentMethod === 'TRANSFER' ? 'Transfer' : 
                                   'Kredit'}
                                </p>
                              </div>
                            </div>

                            {payment.note && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                <span className="font-medium">Catatan: </span>
                                {payment.note}
                              </div>
                            )}

                            {/* Return Info */}
                            {payment.metadata && typeof payment.metadata === 'object' && (payment.metadata as any).hasReturn && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  <span className="font-semibold text-amber-800">Barang Dikembalikan</span>
                                </div>
                                <div className="text-sm text-amber-700">
                                  <p>
                                    <span className="font-bold">{(payment.metadata as any).totalReturnedQty}</span> pcs dari{' '}
                                    <span className="font-bold">{(payment.metadata as any).totalReturnedProducts}</span> produk
                                  </p>
                                  {(payment.metadata as any).returnedBatches && (payment.metadata as any).returnedBatches.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      <p className="text-xs font-medium text-amber-800">Detail:</p>
                                      {(payment.metadata as any).returnedBatches.map((batch: any, idx: number) => (
                                        <div key={idx} className="text-xs bg-amber-100 px-2 py-1 rounded flex justify-between">
                                          <span className="truncate">{batch.productName}</span>
                                          <span className="font-medium ml-2">{batch.qty} pcs</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: Amount */}
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500 mb-1">Jumlah Dibayar</p>
                            <p className="text-2xl font-bold text-emerald-600">
                              Rp {payment.amount.toLocaleString('id-ID')}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                              LUNAS
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total: <span className="font-bold text-gray-900">{consignmentPaymentHistory.length}</span> pembayaran
              </p>
              <button
                onClick={() => setShowPaymentHistoryModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}