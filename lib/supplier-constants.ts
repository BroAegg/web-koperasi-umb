/**
 * Supplier System Constants & Utilities
 * Centralized configuration for consistent UI/UX across all supplier pages
 */

import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Package, 
  Truck, 
  PackageCheck 
} from 'lucide-react';

// ============================================
// STATUS BADGES CONFIGURATION
// ============================================

export const PAYMENT_STATUS = {
  UNPAID: {
    label: 'Belum Bayar',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
  },
  PAID_PENDING_APPROVAL: {
    label: 'Menunggu Verifikasi',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  PAID_APPROVED: {
    label: 'Terverifikasi',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  PAID_REJECTED: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  VERIFIED: {
    label: 'Verified',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
} as const;

export const ORDER_STATUS = {
  pending: {
    label: 'Menunggu',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  processing: {
    label: 'Diproses',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package,
  },
  shipped: {
    label: 'Dikirim',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
  },
  completed: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: PackageCheck,
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
} as const;

export const PRODUCT_STATUS = {
  active: {
    label: 'Aktif',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Nonaktif',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
  },
} as const;

// ============================================
// PRODUCT CATEGORIES
// ============================================

export const PRODUCT_CATEGORIES = [
  'Sembako',
  'Makanan Segar',
  'Minuman',
  'Makanan Instan',
  'Kebersihan',
  'Alat Tulis',
  'Elektronik',
  'Lainnya',
] as const;

// ============================================
// CURRENCY FORMATTER
// ============================================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============================================
// DATE FORMATTER
// ============================================

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// ============================================
// FILE UPLOAD VALIDATION
// ============================================

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
} as const;

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!FILE_UPLOAD.ACCEPTED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'File harus berupa gambar (JPG, PNG, WebP)',
    };
  }
  
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return {
      valid: false,
      error: 'Ukuran file maksimal 5MB',
    };
  }
  
  return { valid: true };
};

// ============================================
// PAGINATION HELPERS
// ============================================

export const getPaginationRange = (currentPage: number, totalPages: number): number[] => {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: number[] = [];
  
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }
  
  if (currentPage - delta > 2) {
    rangeWithDots.push(1, -1);
  } else {
    rangeWithDots.push(1);
  }
  
  rangeWithDots.push(...range);
  
  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push(-1, totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }
  
  return rangeWithDots;
};

// ============================================
// EMPTY STATES MESSAGES
// ============================================

export const EMPTY_STATES = {
  products: {
    title: 'Belum Ada Produk',
    description: 'Mulai tambahkan produk pertama Anda untuk ditampilkan di katalog.',
    action: 'Tambah Produk',
  },
  orders: {
    title: 'Belum Ada Pesanan',
    description: 'Pesanan dari koperasi akan muncul di sini.',
    action: null,
  },
  transactions: {
    title: 'Belum Ada Transaksi',
    description: 'Riwayat transaksi Anda akan ditampilkan di sini.',
    action: null,
  },
  search: {
    title: 'Tidak Ada Hasil',
    description: 'Coba gunakan kata kunci yang berbeda atau hapus filter.',
    action: null,
  },
} as const;

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  products: '/api/supplier/products',
  orders: '/api/supplier/orders',
  transactions: '/api/supplier/transactions',
  dashboard: '/api/supplier/dashboard',
  payment: '/api/supplier/payment',
  uploadPayment: '/api/supplier/upload-payment',
  profile: '/api/supplier/profile',
} as const;

// ============================================
// LOADING SKELETON COUNTS
// ============================================

export const SKELETON_COUNTS = {
  productCards: 8,
  orderRows: 10,
  transactionRows: 10,
  statsCards: 4,
} as const;
