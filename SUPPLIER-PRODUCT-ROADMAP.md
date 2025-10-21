# 🛣️ SUPPLIER PRODUCT MANAGEMENT ROADMAP

**Objective:** Implement proper supplier product flow with dynamic max products limit (2-3 products per supplier, configurable by super admin)

**Date Started:** 21 Oktober 2025  
**Status:** 🟡 In Progress - Phase 1

---

## 📊 BUSINESS RULES

### **Core Constraints:**
- ✅ Supplier maksimal 2-3 produk (configurable by super admin via settings)
- ✅ Produk baru status `INACTIVE` → perlu approval super admin
- ✅ Supplier cuma bisa manage produk miliknya sendiri
- ✅ UI card-based (bukan table) karena max 3 produk

### **Product Status Flow:**
```
SUPPLIER REQUEST → INACTIVE (Pending Approval)
                     ↓
         SUPER ADMIN REVIEW
                ↙       ↘
           APPROVE    REJECT
              ↓           ↓
          ACTIVE      DELETED
            ↓
     LIVE DI BSM MART
```

---

## 🎯 PHASE 1: FIX CURRENT BUGS & BASIC SETUP

**Priority:** 🔥 CRITICAL  
**Estimated Time:** 2-3 hours

### **Tasks:**

#### **1.1 Add System Settings for Max Products** ⏳
- [ ] Add `supplier_max_products` to system settings table
- [ ] Create API `/api/settings/supplier-config` (GET/PUT)
- [ ] Default value: 3 products
- [ ] Super admin can change via settings page

**Files:**
- `prisma/migrations/add_supplier_settings.sql` (new)
- `app/api/settings/supplier-config/route.ts` (new)

---

#### **1.2 Fix Supplier Products Page - Remove Dummy Data** ⏳
**File:** `app/koperasi/supplier/products/page.tsx`

**Changes:**
- [x] Remove hardcoded dummy data (lines ~30-40)
- [ ] Fetch from API `/api/supplier/products`
- [ ] Handle loading state
- [ ] Handle empty state (no products yet)
- [ ] Show error messages

**API Integration:**
```typescript
useEffect(() => {
  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/supplier/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (result.success) {
      setProducts(result.data); // Should be empty array for new supplier
    }
  };
  fetchProducts();
}, []);
```

---

#### **1.3 Add Max Products Constraint Check** ⏳
**File:** `app/koperasi/supplier/products/page.tsx`

**Changes:**
- [ ] Fetch max products limit from settings API
- [ ] Add state: `maxProducts` (from API)
- [ ] Disable "Add Product" button if `products.length >= maxProducts`
- [ ] Show slot counter: "2/3 produk"

**UI Component:**
```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center space-x-2">
    <Package className="w-5 h-5 text-blue-600" />
    <span className="text-sm text-gray-600">
      Produk Anda: <strong>{products.length}/{maxProducts}</strong> slot terisi
    </span>
  </div>
  
  <Button 
    onClick={openModal}
    disabled={products.length >= maxProducts}
  >
    <Plus className="w-4 h-4 mr-2" />
    Request Produk Baru
    {products.length >= maxProducts && " (Slot Penuh)"}
  </Button>
</div>
```

---

#### **1.4 Change UI: Table → Card Grid** ⏳
**File:** `app/koperasi/supplier/products/page.tsx`

**Before:** Table with pagination (lines ~200-350)
**After:** Card grid (max 3 cards)

**New UI:**
```tsx
{/* Replace table with card grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {products.map(product => (
    <Card key={product.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Package className="w-16 h-16 text-gray-400" />
          )}
        </div>
        
        {/* Product Info */}
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
        
        {/* Status Badge */}
        <StatusBadge status={product.status} className="mb-4" />
        
        {/* Price & Stock */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">Harga Jual</p>
            <p className="font-bold text-lg text-blue-600">{formatCurrency(product.sellPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Stok</p>
            <p className="font-bold text-lg">{product.stock} {product.unit}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleToggleStatus(product)}
            disabled={product.status !== 'ACTIVE'}
          >
            <Power className="w-4 h-4 mr-1" />
            {product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
  
  {/* Add Product Card (if slots available) */}
  {products.length < maxProducts && (
    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors">
      <CardContent 
        className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]"
        onClick={openModal}
      >
        <Plus className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">Request Produk Baru</p>
        <p className="text-sm text-gray-400 mt-2">
          {maxProducts - products.length} slot tersisa
        </p>
      </CardContent>
    </Card>
  )}
</div>
```

---

#### **1.5 Improve Status Badge Component** ⏳
**File:** `components/supplier/StatusBadge.tsx` (check if exists)

**Statuses:**
- 🟡 `INACTIVE` = "Menunggu Approval"
- 🟢 `ACTIVE` = "Tersedia di BSM Mart"
- 🔴 `REJECTED` = "Ditolak"

```tsx
export function StatusBadge({ status }: { status: string }) {
  const config = {
    INACTIVE: {
      label: 'Menunggu Approval',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    ACTIVE: {
      label: 'Tersedia di BSM Mart',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    REJECTED: {
      label: 'Ditolak',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };
  
  const { label, icon: Icon, className } = config[status] || config.INACTIVE;
  
  return (
    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}
```

---

#### **1.6 Remove Pagination (Not Needed)** ⏳
**File:** `app/koperasi/supplier/products/page.tsx`

**Changes:**
- [ ] Remove `currentPage` state
- [ ] Remove `itemsPerPage` logic
- [ ] Remove `<Pagination>` component
- [ ] Show all products (max 3 anyway)

---

### **Phase 1 Completion Criteria:**
- [x] Settings API for max products exists
- [ ] Supplier products page fetches from real API
- [ ] Empty state shows properly for new suppliers
- [ ] Max products constraint enforced in UI
- [ ] Slot counter displays correctly
- [ ] UI changed from table to card grid
- [ ] Status badges work properly
- [ ] No pagination (not needed for max 3 products)

**Testing Checklist:**
- [ ] New supplier sees empty state
- [ ] Supplier can request 1st product
- [ ] Supplier can request 2nd product
- [ ] Supplier can request 3rd product (if max = 3)
- [ ] Button disabled when max reached
- [ ] Cards display properly on mobile/tablet/desktop

---

## 🎯 PHASE 2: REQUEST PRODUCT FLOW

**Priority:** 🔥 HIGH  
**Estimated Time:** 3-4 hours  
**Status:** ⏳ Pending Phase 1

### **Tasks:**

#### **2.1 Create Request Product Modal** ⏳
**File:** `app/koperasi/supplier/products/page.tsx`

**Modal Component:**
```tsx
<Modal isOpen={showModal} onClose={closeModal}>
  <div className="max-w-2xl">
    <h2 className="text-2xl font-bold mb-6">Request Produk Baru</h2>
    
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <div className="space-y-4">
        <Input label="Nama Produk" required />
        <Select label="Kategori" options={categories} required />
        <TextArea label="Deskripsi" rows={3} />
        <Input label="Harga Jual" type="number" prefix="Rp" required />
        <Input label="Stok Awal" type="number" suffix="pcs" required />
        <Select label="Unit" options={['pcs', 'kg', 'liter', 'box']} />
        <Select label="Siklus Stok" options={['Harian', 'Mingguan', 'Bulanan']} />
        
        {/* Image Upload */}
        <FileUpload 
          label="Foto Produk" 
          accept="image/*"
          preview={imagePreview}
          onChange={handleImageUpload}
        />
      </div>
      
      <div className="flex space-x-3 mt-6">
        <Button type="button" variant="outline" onClick={closeModal}>
          Batalkan
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Mengirim...' : 'Request Produk'}
        </Button>
      </div>
    </form>
  </div>
</Modal>
```

---

#### **2.2 Handle Form Submission** ⏳

**API Call:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const token = localStorage.getItem('token');
    
    // Upload image first (if provided)
    let imageUrl = null;
    if (formData.image) {
      imageUrl = await uploadImage(formData.image);
    }
    
    // Create product request
    const response = await fetch('/api/supplier/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        sellPrice: parseFloat(formData.sellPrice),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        stockCycle: formData.stockCycle,
        imageUrl: imageUrl,
        ownershipType: 'SUPPLIER'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Produk berhasil direquest! Menunggu approval admin.');
      setShowModal(false);
      fetchProducts(); // Refresh list
    } else {
      toast.error(result.error || 'Gagal request produk');
    }
  } catch (error) {
    toast.error('Terjadi kesalahan');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

#### **2.3 Add Image Upload Handler** ⏳

**File:** `lib/image-upload.ts` (new)

```typescript
export async function uploadProductImage(file: File): Promise<string> {
  // Option 1: Upload to cloud storage (Cloudinary, S3, etc)
  // Option 2: Upload to local storage /public/uploads
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/product-image', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result.url;
}
```

---

#### **2.4 Validation & Error Handling** ⏳

**Client-side Validation:**
- [ ] Nama produk: min 3 characters, max 100
- [ ] Harga: min Rp 1.000, max Rp 10.000.000
- [ ] Stok: min 0, max 10.000
- [ ] Image: max 2MB, format jpg/png only

**Server-side Validation:**
- [ ] Check if supplier already has max products
- [ ] Check if product name already exists for this supplier
- [ ] Validate all required fields

---

### **Phase 2 Completion Criteria:**
- [ ] Modal opens/closes properly
- [ ] Form validation works
- [ ] Image upload works
- [ ] API creates product with status INACTIVE
- [ ] Success/error messages display
- [ ] Product list refreshes after submission
- [ ] New product shows with "Menunggu Approval" status

---

## 🎯 PHASE 3: SUPER ADMIN APPROVAL

**Priority:** 🔥 HIGH  
**Estimated Time:** 4-5 hours  
**Status:** ⏳ Pending Phase 2

### **Tasks:**

#### **3.1 Create Pending Products API** ⏳
**File:** `app/api/super-admin/pending-products/route.ts` (new)

```typescript
export async function GET(request: NextRequest) {
  // Get all products with status INACTIVE
  // Include supplier info
  // Order by createdAt DESC
}
```

---

#### **3.2 Create Approve/Reject APIs** ⏳
**Files:**
- `app/api/super-admin/products/[id]/approve/route.ts` (new)
- `app/api/super-admin/products/[id]/reject/route.ts` (new)

```typescript
// Approve: Set status = ACTIVE, isActive = true
// Reject: Set status = REJECTED, add rejectionReason
```

---

#### **3.3 Add Pending Products Tab** ⏳
**File:** `app/koperasi/super-admin/suppliers/page.tsx`

**Add Tab Navigation:**
```tsx
<Tabs defaultValue="suppliers">
  <TabsList>
    <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
    <TabsTrigger value="pending-products">
      Pending Products
      {pendingCount > 0 && (
        <Badge className="ml-2">{pendingCount}</Badge>
      )}
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="suppliers">
    {/* Existing supplier list */}
  </TabsContent>
  
  <TabsContent value="pending-products">
    <PendingProductsList />
  </TabsContent>
</Tabs>
```

---

#### **3.4 Create Pending Products List Component** ⏳
**File:** `components/super-admin/PendingProductsList.tsx` (new)

**UI:**
```tsx
<div className="space-y-4">
  {pendingProducts.map(product => (
    <Card key={product.id}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
            <img src={product.imageUrl} alt={product.name} />
          </div>
          
          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-600">
              Supplier: {product.supplier.name}
            </p>
            <p className="text-sm text-gray-600">
              Kategori: {product.category} | Harga: {formatCurrency(product.sellPrice)}
            </p>
            <p className="text-sm text-gray-600">
              Stok: {product.stock} {product.unit}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Requested: {formatRelativeTime(product.createdAt)}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewDetail(product)}
            >
              Detail
            </Button>
            <Button 
              size="sm"
              onClick={() => handleApprove(product.id)}
            >
              Approve
            </Button>
            <Button 
              variant="destructive"
              size="sm"
              onClick={() => handleReject(product.id)}
            >
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

---

#### **3.5 Add Approval/Rejection Modals** ⏳

**Approve Modal:**
- Confirm approval
- Optional: Add notes for supplier

**Reject Modal:**
- Required: Rejection reason
- Text area for detailed explanation
- Send notification to supplier

---

### **Phase 3 Completion Criteria:**
- [ ] Pending products API works
- [ ] Approve API activates product
- [ ] Reject API marks product as rejected
- [ ] Pending products tab shows count badge
- [ ] List displays all pending products
- [ ] Approve/reject actions work
- [ ] Notifications sent to suppliers

---

## 🎯 PHASE 4: NOTIFICATIONS & POLISH

**Priority:** 🟡 MEDIUM  
**Estimated Time:** 2-3 hours  
**Status:** ⏳ Pending Phase 3

### **Tasks:**

#### **4.1 Email Notifications** ⏳
- [ ] Send email when product approved
- [ ] Send email when product rejected (with reason)

#### **4.2 In-App Notifications** ⏳
- [ ] Bell icon with notification count
- [ ] Notification list modal
- [ ] Mark as read functionality

#### **4.3 Dashboard Stats Update** ⏳
**File:** `app/koperasi/supplier/page.tsx`

- [ ] Show real product count
- [ ] Show pending approval count
- [ ] Show active products count

#### **4.4 Settings Page for Super Admin** ⏳
**File:** `app/koperasi/settings/page.tsx`

- [ ] Add "Supplier Configuration" section
- [ ] Input: Max products per supplier (2-3)
- [ ] Save button with API call

---

## 📊 PROGRESS TRACKING

### **Overall Progress:** 0% (0/4 phases)

| Phase | Status | Progress | Est. Time | Actual Time |
|-------|--------|----------|-----------|-------------|
| Phase 1: Fix Bugs & Basic Setup | ⏳ In Progress | 0/6 | 2-3h | - |
| Phase 2: Request Product Flow | ⏳ Pending | 0/4 | 3-4h | - |
| Phase 3: Super Admin Approval | ⏳ Pending | 0/5 | 4-5h | - |
| Phase 4: Notifications & Polish | ⏳ Pending | 0/4 | 2-3h | - |

**Total Estimated Time:** 11-15 hours  
**Target Completion:** TBD

---

## 🐛 KNOWN ISSUES TO FIX

1. ✅ Supplier products page uses dummy data
2. ✅ No max products constraint
3. ✅ Table UI not suitable for max 3 products
4. ⏳ No approval flow UI for super admin
5. ⏳ No notifications when product approved/rejected
6. ⏳ No image upload functionality
7. ⏳ No settings page for max products config

---

## 📝 NOTES & DECISIONS

### **Design Decisions:**
- **Max Products:** 2-3 (configurable by super admin via settings)
- **UI Style:** Card-based grid (not table) - more visual, better for few items
- **Status Flow:** INACTIVE → ACTIVE (approved) or REJECTED
- **Image Upload:** Required for better product presentation
- **Form Type:** Modal popup (cleaner than full page)

### **Technical Decisions:**
- **API Structure:** RESTful with clear ownership checks
- **Validation:** Both client and server side
- **Image Storage:** TBD (local/cloud)
- **Notifications:** Email + in-app

---

## 🚀 NEXT ACTIONS

1. ✅ Create this roadmap
2. ⏳ Start Phase 1 Task 1.1: Add system settings for max products
3. ⏳ Continue with Task 1.2: Fix supplier products page

---

**Last Updated:** 21 Oktober 2025, 18:00 WIB  
**Updated By:** AI Assistant  
**Reviewed By:** Reyvan
