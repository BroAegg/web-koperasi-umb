# 🐛 Bug Analysis & Fix Plan - Financial Logic Issues

**Date:** October 17, 2025  
**Priority:** HIGH (Deadline: November 1, 2025)  
**Status:** IN PROGRESS

---

## 🔍 Issue #1: TOKO Stock Sales Incorrectly Counted as Expenses

### **Problem Statement:**
Ketika stok TOKO terjual (STOCK_OUT), harga beli produk ter-record sebagai PENGELUARAN di halaman Financial. Seharusnya:
- **TOKO products**: Modal sudah dibayar saat PURCHASE → SALE hanya revenue (tidak ada expense)
- **TITIPAN products**: Belum bayar modal → SALE ada revenue DAN expense (bayar ke pemilik titipan)

### **Current Behavior (WRONG):**
```
1. User beli produk TOKO (PURCHASE)
   → Transaction type: PURCHASE
   → Amount: Rp 100,000
   → Financial Summary: EXPENSE +100,000 ✅ BENAR

2. User jual produk TOKO (SALE)
   → Transaction type: SALE
   → Revenue: Rp 150,000
   → COGS: Rp 100,000
   → Financial Summary: 
      - INCOME: +150,000 ✅ BENAR
      - EXPENSE: +100,000 ❌ SALAH! (double counting!)
```

**Result:** Modal dihitung 2x (saat PURCHASE dan saat SALE COGS) → Profit jadi negatif!

### **Expected Behavior (CORRECT):**
```
TOKO Product Flow:
1. PURCHASE → EXPENSE +100,000 (modal keluar)
2. SALE → INCOME +150,000 ONLY (no expense, modal sudah bayar)
   Profit = 150,000 - 100,000 = 50,000 ✅

TITIPAN Product Flow:
1. PURCHASE (terima barang) → NO expense (bukan modal kita)
2. SALE → INCOME +150,000 AND EXPENSE +100,000 (bayar pemilik)
   Profit = 150,000 - 100,000 = 50,000 (margin koperasi) ✅
```

---

## 📋 Root Cause Analysis

### **File:** `app/api/stock-movements/route.ts` (Lines 186-225)

**Problem Code:**
```typescript
// When stock OUT (SALE), creates transaction
if (type.toUpperCase() === 'OUT') {
  const saleQuantity = parseInt(quantity);
  const unitPrice = productDetails.sellPrice;
  const totalAmount = Number(unitPrice) * saleQuantity;
  const cogsPerUnit = productDetails.avgCost || productDetails.buyPrice || unitPrice;
  const totalCogs = Number(cogsPerUnit) * saleQuantity; // ❌ PROBLEM HERE!
  
  transaction = await tx.transaction.create({
    data: {
      type: 'SALE', // ✅ Correct
      totalAmount, // Revenue ✅
      // ... but COGS is recorded in TransactionItem
    },
  });
  
  // TransactionItem includes COGS
  await tx.transactionItem.create({
    data: {
      // ...
      cogsPerUnit, // ❌ This COGS is being counted as EXPENSE!
      totalCogs,   // ❌ Double expense for TOKO products!
    },
  });
}
```

**Issue:** The `totalCogs` is being used somewhere in Financial summary to add to EXPENSE.

---

### **File:** `app/api/financial/summary/route.ts` (Lines 38-45)

**Problem Code:**
```typescript
transactions.forEach(transaction => {
  const amount = Number(transaction.totalAmount);
  
  if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
    totalIncome += amount; // ✅ Correct
  } else if (transaction.type === 'PURCHASE' || transaction.type === 'EXPENSE') {
    totalExpense += amount; // ❌ Problem: PURCHASE always counted as expense!
  }
});
```

**Issue:** ALL PURCHASE transactions count as expense, but:
- TOKO PURCHASE: ✅ Should count (modal kita)
- TITIPAN PURCHASE: ❌ Should NOT count (bukan modal kita)

---

## 🔧 Solution Design

### **Fix #1: Financial Summary Logic**

Update `app/api/financial/summary/route.ts` to handle ownership-aware expense calculation:

```typescript
// ❌ OLD (Wrong):
transactions.forEach(transaction => {
  if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
    totalIncome += amount;
  } else if (transaction.type === 'PURCHASE' || transaction.type === 'EXPENSE') {
    totalExpense += amount; // All PURCHASE = expense (WRONG!)
  }
});

// ✅ NEW (Correct):
// Need to fetch transaction items with product ownership info
const transactionsWithItems = await prisma.transaction.findMany({
  where: { ... },
  include: {
    items: {
      include: {
        product: {
          select: {
            ownershipType: true,
            isConsignment: true,
          }
        }
      }
    }
  }
});

transactionsWithItems.forEach(transaction => {
  const amount = Number(transaction.totalAmount);
  
  if (transaction.type === 'SALE') {
    // SALE: Revenue always counted
    totalIncome += amount;
    
    // SALE: Expense only for TITIPAN (payment to owner)
    if (transaction.items && transaction.items.length > 0) {
      transaction.items.forEach(item => {
        const isTitipan = item.product?.ownershipType === 'TITIPAN' || 
                         item.product?.isConsignment;
        if (isTitipan) {
          totalExpense += Number(item.totalCogs || 0); // Pay to consignor
        }
        // TOKO: No expense on SALE (already paid on PURCHASE)
      });
    }
  } else if (transaction.type === 'INCOME') {
    totalIncome += amount;
  } else if (transaction.type === 'PURCHASE') {
    // PURCHASE: Expense only for TOKO (our capital)
    if (transaction.items && transaction.items.length > 0) {
      transaction.items.forEach(item => {
        const isToko = item.product?.ownershipType === 'TOKO' || 
                       !item.product?.isConsignment;
        if (isToko) {
          totalExpense += Number(item.totalPrice || amount); // Our capital
        }
        // TITIPAN: No expense on PURCHASE (not our money)
      });
    } else {
      // Fallback: if no items, count as expense (backward compatibility)
      totalExpense += amount;
    }
  } else if (transaction.type === 'EXPENSE') {
    totalExpense += amount; // Manual expense always counted
  }
});
```

---

## 🎯 Implementation Plan

### **Phase 1: Fix Financial Summary** (30 mins)

**File:** `app/api/financial/summary/route.ts`

1. Update query to include transaction items + product ownership
2. Implement ownership-aware expense logic
3. Test with sample data:
   - TOKO PURCHASE: Should add to expense ✅
   - TOKO SALE: Should add to income only (no expense) ✅
   - TITIPAN PURCHASE: Should NOT add to expense ✅
   - TITIPAN SALE: Should add to income AND expense (COGS) ✅

### **Phase 2: Fix Period Summary** (15 mins)

**File:** `app/api/financial/period/route.ts`

- Already has correct logic (lines 113-137)
- Just verify it's working correctly
- May need minor adjustments

### **Phase 3: Testing** (15 mins)

**Test Cases:**
1. Create TOKO product (Rp 100k buy, Rp 150k sell)
2. PURCHASE 10 items → Check Financial: Expense should be +1,000,000
3. SALE 5 items → Check Financial: Income +750,000, Expense should stay 1,000,000 (not 1,500,000!)
4. Create TITIPAN product (Rp 80k buy, Rp 120k sell)
5. PURCHASE 10 items → Check Financial: Expense should stay same (not increase)
6. SALE 5 items → Check Financial: Income +600,000, Expense +400,000 (payment to owner)

---

## 🐛 Issue #2: Form Fields Not Resetting

### **Problem Statement:**
After adding product/transaction, when user opens the modal again, the form still shows previous data instead of empty/default values.

### **Affected Components:**

1. **ProductModal** (Add Product) ❌
   - Should reset to empty form after successful add
   
2. **TransactionModal** (Add Transaction) ❌
   - Should reset to empty form after successful add
   
3. **StockModal** (Stock Update) ❌
   - Should reset to empty form each time opened
   
4. **ProductModal** (Update Product) ✅
   - Should pre-fill with selected product data (CORRECT)

### **Root Cause:**

**File:** `app/koperasi/inventory/page.tsx`

Problem: Form state not being reset after modal closes or after successful submission.

**Current Flow (WRONG):**
```typescript
// 1. User adds product → formData filled
// 2. Modal closes
// 3. formData NOT reset
// 4. User opens Add Product again
// 5. Modal shows previous formData ❌
```

**Expected Flow (CORRECT):**
```typescript
// 1. User adds product → formData filled
// 2. Modal closes
// 3. formData RESET to initial state ✅
// 4. User opens Add Product again
// 5. Modal shows empty form ✅
```

---

## 🔧 Solution for Form Reset

### **Fix #1: ProductModal Reset**

**File:** `components/inventory/ProductModal.tsx`

**Current Issue:**
```typescript
// Component receives product prop
// If product is null → ADD mode
// But formData persists from previous ADD operation!
```

**Solution:**
```typescript
// Add useEffect to reset formData when modal closes
useEffect(() => {
  if (!isOpen) {
    // Reset form data when modal is not open
    setFormData({
      name: '',
      category: '',
      unit: '',
      stock: '',
      minStock: '',
      buyPrice: '',
      sellPrice: '',
      ownershipType: 'TOKO',
      stockCycle: 'HARIAN',
      supplierId: '',
      supplierName: '',
      supplierContact: ''
    });
  }
}, [isOpen]);
```

### **Fix #2: TransactionModal Reset**

**File:** `components/financial/TransactionModal.tsx`

Same fix - reset formData when `isOpen` changes to false.

### **Fix #3: StockModal Reset**

**File:** `components/inventory/StockModal.tsx`

Same pattern - reset formData when modal closes.

---

## ✅ Implementation Checklist

### **Issue #1: Financial Logic**
- [ ] Update `app/api/financial/summary/route.ts` with ownership-aware logic
- [ ] Test TOKO product flow (PURCHASE → SALE)
- [ ] Test TITIPAN product flow (PURCHASE → SALE)
- [ ] Verify profit calculations are correct
- [ ] Check period summary endpoint

### **Issue #2: Form Reset**
- [ ] Add reset logic to ProductModal (onClose)
- [ ] Add reset logic to TransactionModal (onClose)
- [ ] Add reset logic to StockModal (onClose)
- [ ] Test: Add product → Close → Open again (should be empty)
- [ ] Test: Add transaction → Close → Open again (should be empty)
- [ ] Verify: Update product still pre-fills correctly

---

## 🎯 Priority & Timing

**Issue #1 (Financial Logic):** 🔥 CRITICAL  
- Impact: Wrong profit calculations, business decisions affected
- Time: 1 hour (fix + test)
- Priority: **FIX IMMEDIATELY**

**Issue #2 (Form Reset):** 🟡 IMPORTANT  
- Impact: Poor UX, user confusion
- Time: 30 minutes (fix + test)
- Priority: **FIX AFTER ISSUE #1**

**Total Estimated Time:** 1.5 hours

---

**Status:** Ready to implement! 🚀  
**Next:** Execute fixes in order (Financial logic first, then form reset)
