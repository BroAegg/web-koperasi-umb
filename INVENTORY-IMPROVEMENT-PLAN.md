# 📦 INVENTORY LOGIC IMPROVEMENT PLAN

**Date**: October 21, 2025  
**Scope**: Admin Portal - Inventory Pages  
**Current Status**: Page exists but needs logic improvements

---

## 📊 **CURRENT STATE ANALYSIS**

### ✅ **What Exists**:
1. ✅ Main inventory page (`/koperasi/inventory/page.tsx`) - 1593 lines
2. ✅ API Endpoints:
   - `/api/products` (GET, POST, PUT, DELETE)
   - `/api/categories` (GET, POST)
   - `/api/suppliers` (GET, POST)
   - `/api/stock-movements` (GET, POST)
   - `/api/stock-movements/summary` (GET)
3. ✅ Components:
   - FinancialMetricsCard
   - ProductModal
   - StockModal
   - FilterModal
4. ✅ Types defined (`types/inventory.ts`)
5. ✅ Custom hooks (`hooks/useInventoryData.ts`)

### ⚠️ **Potential Issues**:
1. ⚠️ Very large single file (1593 lines) - needs modularization
2. ⚠️ Authorization might need checking
3. ⚠️ Error handling might be incomplete
4. ⚠️ Loading states might need improvement
5. ⚠️ No pagination for products (only stock movements)
6. ⚠️ No bulk operations
7. ⚠️ No export functionality (mentioned but might not work)

---

## 🎯 **IMPROVEMENT GOALS**

### **Phase 1: Authorization & Error Handling** 🔒
- [ ] Add proper authorization checks (ADMIN, SUPER_ADMIN only)
- [ ] Improve error messages and user feedback
- [ ] Add loading skeletons
- [ ] Add retry mechanisms for failed requests

### **Phase 2: API Logic Improvements** 🔧
- [ ] Verify all API endpoints have proper authentication
- [ ] Add missing endpoints if needed
- [ ] Improve data validation
- [ ] Add transaction support for critical operations

### **Phase 3: UX Enhancements** ✨
- [ ] Add product pagination
- [ ] Add bulk operations (delete, update stock)
- [ ] Implement export to CSV/Excel
- [ ] Add advanced filters
- [ ] Add sorting options

### **Phase 4: Code Organization** 📁
- [ ] Split large file into smaller modules
- [ ] Extract business logic to separate functions
- [ ] Create reusable hooks
- [ ] Improve component structure

---

## 🔍 **DETAILED ANALYSIS**

### **1. Current Page Structure**:
```
/koperasi/inventory/page.tsx (1593 lines)
├── Imports & Types (50 lines)
├── State Management (100 lines)
├── useEffect Hooks (50 lines)
├── Fetch Functions (400 lines)
├── Form Handlers (300 lines)
├── Helper Functions (200 lines)
├── Render Logic (493 lines)
└── Modal Components (inline, large)
```

### **2. API Endpoints Used**:
```typescript
// Products
GET    /api/products                    ✅
POST   /api/products                    ✅
PUT    /api/products/[id]              ✅
DELETE /api/products/[id]              ✅

// Categories
GET    /api/categories                  ✅

// Suppliers
GET    /api/suppliers                   ✅

// Stock Movements
GET    /api/stock-movements            ✅
POST   /api/stock-movements            ✅
GET    /api/stock-movements/summary    ✅

// Financial
GET    /api/financial/period           ✅
```

### **3. Features Checklist**:
| Feature | Status | Notes |
|---------|--------|-------|
| View Products | ✅ Working | Good |
| Add Product | ✅ Working | Need auth check |
| Edit Product | ✅ Working | Need auth check |
| Delete Product | ✅ Working | Need confirmation |
| Stock In/Out | ✅ Working | Good |
| Categories | ✅ Working | Read-only |
| Suppliers | ✅ Working | Read-only |
| Search | ✅ Working | Good |
| Filter | ✅ Working | Advanced filters needed |
| Export | ⚠️ Mentioned | Needs implementation |
| Pagination | ⚠️ Partial | Only for stock movements |
| Bulk Ops | ❌ Missing | Needs implementation |

---

## 📝 **ACTION ITEMS**

### **CRITICAL (Must Fix Now)**:

#### 1. Add Authorization Check
```typescript
// Current: No auth check visible
// Need: useAuth hook with role verification

import { useAuth } from '@/lib/use-auth';

export default function InventoryPage() {
  const { user, loading, authorized } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  
  if (loading) return <LoadingSkeleton />;
  if (!authorized) return <Unauthorized />;
  
  // ... rest of component
}
```

#### 2. Add Proper Error Handling
```typescript
// Current: console.error only
// Need: User-friendly notifications

const fetchProducts = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      setProducts(result.data);
    } else {
      throw new Error(result.error || 'Failed to fetch products');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Show user-friendly notification
    showError('Gagal Memuat Data', 'Tidak dapat memuat data produk. Silakan coba lagi.');
  } finally {
    setLoading(false);
  }
};
```

#### 3. Fix Authorization Headers
```typescript
// Current: Some requests might be missing auth headers
// Need: Consistent auth pattern

const makeAuthRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};
```

### **HIGH PRIORITY (Should Add)**:

#### 4. Product Pagination
```typescript
// Add pagination for products list
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [pageSize] = useState(20);

const fetchProducts = async (page = 1) => {
  const response = await fetch(
    `/api/products?page=${page}&limit=${pageSize}&search=${searchTerm}`
  );
  // ... handle response
};
```

#### 5. Bulk Operations
```typescript
// Add bulk delete, bulk stock update
const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

const handleBulkDelete = async () => {
  // Confirm dialog
  if (!confirm(`Delete ${selectedProducts.length} products?`)) return;
  
  // Delete in batch
  await Promise.all(
    selectedProducts.map(id => 
      fetch(`/api/products/${id}`, { method: 'DELETE' })
    )
  );
  
  // Refresh list
  fetchProducts();
};
```

#### 6. Export Functionality
```typescript
// Implement CSV/Excel export
const handleExport = () => {
  const csv = [
    ['Name', 'SKU', 'Category', 'Stock', 'Buy Price', 'Sell Price'],
    ...filteredProducts.map(p => [
      p.name,
      p.sku || '-',
      p.category.name,
      p.stock,
      p.buyPrice,
      p.sellPrice,
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};
```

### **MEDIUM PRIORITY (Nice to Have)**:

#### 7. Loading Skeletons
```typescript
// Replace loading spinner with skeleton
if (loading) {
  return <TableSkeleton rows={10} cols={8} />;
}
```

#### 8. Advanced Filters
```typescript
// Add more filter options
const [filters, setFilters] = useState({
  category: 'all',
  ownership: 'all',
  cycle: 'all',
  priceRange: [0, 1000000],
  stockRange: [0, 1000],
  lowStock: false,
});
```

#### 9. Sorting
```typescript
// Add column sorting
const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
```

---

## 🚀 **IMPLEMENTATION PLAN**

### **Sprint 1: Critical Fixes** (2-3 hours)
1. ✅ Add `useAuth` hook for authorization
2. ✅ Add Authorization headers to all API calls
3. ✅ Improve error handling with notifications
4. ✅ Add loading states
5. ✅ Test all CRUD operations

### **Sprint 2: UX Improvements** (3-4 hours)
1. ✅ Add product pagination
2. ✅ Add bulk operations UI
3. ✅ Implement export functionality
4. ✅ Add confirmation dialogs
5. ✅ Add loading skeletons

### **Sprint 3: Code Organization** (2-3 hours)
1. ✅ Extract API calls to separate file
2. ✅ Create reusable hooks
3. ✅ Split large component
4. ✅ Improve type safety

---

## 📋 **IMMEDIATE NEXT STEPS**

**What should we do first?**

**Option A**: Fix Authorization & Error Handling (CRITICAL)
- Add useAuth hook
- Add auth headers
- Improve error messages

**Option B**: Add Missing Features (HIGH PRIORITY)
- Product pagination
- Bulk operations
- Export functionality

**Option C**: Code Refactoring (MEDIUM PRIORITY)
- Split large file
- Extract business logic
- Create reusable hooks

---

**QUESTION FOR USER**:
Mau fokus ke mana dulu?
1. 🔒 **Security & Auth** (Option A) - Critical
2. ✨ **Features & UX** (Option B) - High Priority
3. 📁 **Code Quality** (Option C) - Medium Priority
4. 🔍 **Analisis dulu** - Review existing code more

**Atau mau saya langsung fix yang critical (Option A)?**
