# 🧪 Testing Guide - Stock Management & Sales Flow

## ✅ Fixed Issues

### 1. **Stock Movement OUT now creates Transaction**
- ✅ When you create "Stock OUT" movement, it automatically creates a Sale Transaction
- ✅ Transaction includes COGS (Cost of Goods Sold) tracking
- ✅ Dashboard cards (Total Penjualan, Keuntungan Bersih) will update correctly

### 2. **API Compatibility with Enhanced Schema**
- ✅ All API routes use `movementType` (not `type`)
- ✅ Product `buyPrice` is nullable for consignment products
- ✅ Product has `avgCost` for accurate profit calculation
- ✅ Dual ownership model support (TOKO/TITIPAN)

---

## 📝 Manual Testing Checklist

### A. **Test Stock Movement OUT (Sales)**

**Steps:**
1. Go to `/koperasi/inventory`
2. Click "Stock Keluar" button on any product
3. Enter quantity (e.g., 5 pcs)
4. Add note (optional): "Test penjualan manual"
5. Submit

**Expected Results:**
- ✅ Toast success: "Stock keluar berhasil dicatat dan transaksi penjualan tercatat"
- ✅ Product stock decreased by 5
- ✅ Stock movement recorded with `movementType: SALE_OUT`
- ✅ Transaction created with type `SALE`, status `COMPLETED`
- ✅ TransactionItem created with COGS and gross profit

**Verify in Dashboard:**
1. Go to `/koperasi/dashboard`
2. Check "Penjualan Hari Ini" card → should increase
3. Check "Total Transaksi" → should increment
4. Product should show "Terjual" count increased

---

### B. **Test Stock Movement IN**

**Steps:**
1. Go to `/koperasi/inventory`
2. Click "Stock Masuk" button on any product
3. Enter quantity (e.g., 10 pcs)
4. Add note: "Restock barang"
5. Submit

**Expected Results:**
- ✅ Toast success: "Stock masuk berhasil dicatat"
- ✅ Product stock increased by 10
- ✅ Stock movement recorded with `movementType: PURCHASE_IN` (for TOKO) or `CONSIGNMENT_IN` (for TITIPAN)
- ❌ NO Transaction created (IN movement is not a sale)

---

### C. **Test Product CRUD**

#### **Create Product (Store-Owned)**
**Steps:**
1. Go to `/koperasi/inventory`
2. Click "Tambah Produk"
3. Fill form:
   - Name: "Test Produk Toko"
   - Category: Select any
   - Buy Price: 10000
   - Sell Price: 15000
   - Stock: 20
   - Ownership Type: TOKO (default)
   - Stock Cycle: MINGGUAN (default)
4. Submit

**Expected Results:**
- ✅ Product created with `ownershipType: TOKO`
- ✅ `buyPrice`: 10000, `avgCost`: 10000
- ✅ Initial stock movement with `movementType: PURCHASE_IN`

#### **Create Product (Consignment)**
**Steps:**
1. Fill form:
   - Name: "Test Produk Titipan"
   - Category: Select any
   - Buy Price: (leave empty or 0)
   - Sell Price: 8000
   - Stock: 15
2. Submit

**Expected Results:**
- ✅ Product created with `ownershipType: TITIPAN` (if frontend supports)
- ✅ `buyPrice`: null, `avgCost`: null
- ✅ Initial stock movement with `movementType: CONSIGNMENT_IN`

#### **Update Product**
**Steps:**
1. Click "Edit" on any product
2. Change sell price from 15000 to 18000
3. Submit

**Expected Results:**
- ✅ Product updated successfully
- ✅ New price reflected immediately

#### **Delete Product**
**Steps:**
1. Click "Delete" on a product WITHOUT stock movements
2. Confirm deletion

**Expected Results:**
- ✅ Product deleted successfully

**Edge Case:**
1. Try deleting product WITH stock movements
**Expected:**
- ❌ Error: "Tidak dapat menghapus produk yang memiliki riwayat stock movement"

---

### D. **Test Dashboard Cards**

**Before Testing:**
1. Note current values:
   - Total Anggota: X
   - Total Produk: Y
   - Penjualan Hari Ini: Rp Z
   - Stok Rendah: W

**After Stock OUT (Sales):**
1. Create 2-3 stock OUT movements
2. Refresh dashboard
3. Verify:
   - ✅ "Penjualan Hari Ini" increased by (quantity × sellPrice)
   - ✅ "Total Produk" unchanged
   - ✅ "Stok Rendah" may change if product goes below threshold

---

## 🐛 Known Issues to Test

### Issue 1: "Terjual Hari Ini" not updating
**Root Cause:** Stock OUT now creates Transaction ✅ FIXED
**Test:**
1. Create stock OUT
2. Check product table → "Terjual" column should increase
3. If not, check GET /api/products response

### Issue 2: Dashboard revenue not updating
**Root Cause:** Dashboard uses Transaction.totalAmount ✅ SHOULD BE FIXED
**Test:**
1. Create stock OUT (this creates Transaction)
2. Refresh dashboard
3. "Penjualan Hari Ini" should show updated revenue

### Issue 3: Profit calculation wrong
**Root Cause:** Using `avgCost` instead of `buyPrice` ✅ FIXED
**Test:**
1. Check product profit in table
2. Formula: `profit = sellPrice - (avgCost || buyPrice || 0)`
3. Verify correct calculation

---

## 📊 Database Verification

After testing, run verification script:

```bash
npx tsx verify-db.ts
```

**Check:**
- ✅ Total transactions increased
- ✅ Transaction items created
- ✅ Stock movements with correct `movementType`
- ✅ Stock movements with `referenceType: SALE` and `referenceId`

---

## 🔍 Debugging SQL Queries

### Check Today's Transactions
```sql
SELECT * FROM transactions 
WHERE type = 'SALE' 
AND created_at >= CURRENT_DATE 
ORDER BY created_at DESC;
```

### Check Transaction Items with COGS
```sql
SELECT 
  ti.id,
  t.type,
  p.name as product_name,
  ti.quantity,
  ti.unit_price,
  ti.total_price,
  ti.cogs_per_unit,
  ti.total_cogs,
  ti.gross_profit
FROM transaction_items ti
JOIN transactions t ON ti.transaction_id = t.id
JOIN products p ON ti.product_id = p.id
WHERE t.type = 'SALE'
ORDER BY ti.created_at DESC
LIMIT 10;
```

### Check Stock Movements with References
```sql
SELECT 
  sm.id,
  sm.movement_type,
  sm.quantity,
  sm.reference_type,
  sm.reference_id,
  p.name as product_name
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE sm.reference_type IS NOT NULL
ORDER BY sm.created_at DESC;
```

---

## ✅ Test Completion Checklist

- [ ] Stock OUT creates Transaction with COGS
- [ ] Dashboard "Penjualan Hari Ini" updates after Stock OUT
- [ ] Product "Terjual" column shows correct count
- [ ] Stock IN does NOT create Transaction
- [ ] Create product (store-owned) works
- [ ] Create product (consignment) works
- [ ] Update product works
- [ ] Delete product works (with validation)
- [ ] Profit calculation correct
- [ ] All API endpoints return 200/201 (no 500 errors)

---

## 🚀 Next Steps After Testing

1. **If all tests pass:** Commit changes with detailed message
2. **If issues found:** Document in IMPLEMENTATION-TRACKING.md
3. **Consider Phase 2:** Move to proper `/api/sales` endpoint for better separation of concerns

---

**Date:** October 15, 2025
**Phase:** 1 (Database Architecture) - Testing & Validation
**Status:** Ready for manual testing
