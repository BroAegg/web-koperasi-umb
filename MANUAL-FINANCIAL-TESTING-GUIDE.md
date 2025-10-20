# 🧪 MANUAL FINANCIAL MODULE TESTING GUIDE

**Tester**: Aegner (Frontend Lead)  
**Date**: 20 Oktober 2025  
**Module**: Financial Dashboard & Inventory  
**Status**: 🔄 TESTING IN PROGRESS

---

## 📋 TEST ENVIRONMENT

- **URL**: http://localhost:3001
- **Dev Server**: Running on port 3001
- **Browser**: VS Code Simple Browser
- **Database**: koperasi_dev (PostgreSQL)
- **Test Account**: admin@koperasi.com / admin123

---

## 🎯 TEST OBJECTIVES

1. ✅ Verify financial period filters working correctly
2. ✅ Validate financial metrics calculations (Omzet, Profit, Items Sold)
3. ✅ Test stock movement flows (IN/OUT)
4. ✅ Confirm financial data updates in real-time
5. ✅ Check data accuracy against database

---

## 🧪 TEST CASES

### **TEST SECTION 1: LOGIN & DASHBOARD ACCESS**

#### Test 1.1: Admin Login
**Steps**:
1. Navigate to http://localhost:3001/login
2. Enter email: `admin@koperasi.com`
3. Enter password: `admin123`
4. Click "Login" button

**Expected Result**:
- ✅ Login successful
- ✅ Redirected to `/koperasi/dashboard`
- ✅ Dashboard loads with financial cards
- ✅ No console errors

**Actual Result**: ⏳ PENDING

**Status**: ⏳ NOT TESTED

**Screenshots**: 

**Notes**: 

---

#### Test 1.2: Dashboard Components Load
**Steps**:
1. After login, observe dashboard components
2. Check all cards visible
3. Check navigation working

**Expected Result**:
- ✅ Financial cards (Omzet, Keuntungan, Produk Terjual) visible
- ✅ Period filter dropdown working
- ✅ Sidebar navigation accessible
- ✅ Loading states handled properly

**Actual Result**: ⏳ PENDING

**Status**: ⏳ NOT TESTED

**Notes**: 

---

### **TEST SECTION 2: FINANCIAL PERIOD FILTERS**

#### Test 2.1: "Hari Ini" Filter
**Steps**:
1. Navigate to Dashboard
2. Click period filter dropdown
3. Select "Hari Ini"
4. Wait for data to load

**Expected Result**:
- ✅ Filter updates to "Hari Ini"
- ✅ Financial metrics recalculate
- ✅ Shows today's transactions only (00:00 - 23:59)
- ✅ Loading indicator appears briefly
- ✅ No errors in console

**Actual Result**: ⏳ PENDING

**Data to Record**:
- Total Omzet: Rp __________
- Keuntungan Bersih: Rp __________
- Produk Terjual: ________ item

**Status**: ⏳ NOT TESTED

**Notes**: 

---

#### Test 2.2: "7 Hari" Filter
**Steps**:
1. Click period filter dropdown
2. Select "7 Hari"
3. Wait for data to load

**Expected Result**:
- ✅ Filter updates to "7 Hari"
- ✅ Shows last 7 days transactions
- ✅ Metrics higher than "Hari Ini" (cumulative)

**Actual Result**: ⏳ PENDING

**Data to Record**:
- Total Omzet: Rp __________
- Keuntungan Bersih: Rp __________
- Produk Terjual: ________ item

**Status**: ⏳ NOT TESTED

**Notes**: 

---

#### Test 2.3: "1 Bulan" Filter
**Steps**:
1. Click period filter dropdown
2. Select "1 Bulan"
3. Wait for data to load

**Expected Result**:
- ✅ Filter updates to "1 Bulan"
- ✅ Shows last 30 days transactions
- ✅ Metrics continue to increase

**Actual Result**: ⏳ PENDING

**Data to Record**:
- Total Omzet: Rp __________
- Keuntungan Bersih: Rp __________
- Produk Terjual: ________ item

**Status**: ⏳ NOT TESTED

**Notes**: 

---

#### Test 2.4: "3 Bulan" Filter
**Steps**:
1. Click period filter dropdown
2. Select "3 Bulan"
3. Wait for data to load

**Expected Result**:
- ✅ Shows last 90 days transactions

**Actual Result**: ⏳ PENDING

**Data to Record**:
- Total Omzet: Rp __________
- Keuntungan Bersih: Rp __________
- Produk Terjual: ________ item

**Status**: ⏳ NOT TESTED

---

#### Test 2.5: "6 Bulan" Filter
**Steps**:
1. Click period filter dropdown
2. Select "6 Bulan"
3. Wait for data to load

**Expected Result**:
- ✅ Shows last 180 days transactions

**Actual Result**: ⏳ PENDING

**Data to Record**:
- Total Omzet: Rp __________
- Keuntungan Bersih: Rp __________
- Produk Terjual: ________ item

**Status**: ⏳ NOT TESTED

---

#### Test 2.6: "1 Tahun" Filter
**Steps**:
1. Click period filter dropdown
2. Select "1 Tahun"
3. Wait for data to load

**Expected Result**:
- ✅ Shows last 365 days transactions
- ✅ Highest cumulative values

**Actual Result**: ⏳ PENDING

**Data to Record**:
- Total Omzet: Rp __________
- Keuntungan Bersih: Rp __________
- Produk Terjual: ________ item

**Status**: ⏳ NOT TESTED

---

### **TEST SECTION 3: FINANCIAL METRICS VALIDATION**

#### Test 3.1: Total Omzet Calculation
**Steps**:
1. Set period to "1 Bulan"
2. Note Total Omzet value
3. Check database for verification:
   ```sql
   SELECT SUM(ti.totalPrice) as total_revenue
   FROM transaction_items ti
   JOIN transactions t ON ti.transactionId = t.id
   WHERE t.createdAt >= NOW() - INTERVAL '30 days'
   AND t.status = 'COMPLETED';
   ```

**Expected Result**:
- ✅ Dashboard value matches database query
- ✅ Value in Rupiah format (Rp X,XXX,XXX)
- ✅ Accurate to the rupiah

**Dashboard Value**: Rp __________
**Database Value**: Rp __________
**Match**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

**Notes**: 

---

#### Test 3.2: Keuntungan Bersih Calculation
**Steps**:
1. Note Keuntungan Bersih value
2. Verify formula: `totalRevenue - totalCOGS`
3. Check database:
   ```sql
   SELECT 
     SUM(ti.totalPrice) as revenue,
     SUM(ti.totalCogs) as cogs,
     SUM(ti.totalPrice) - SUM(ti.totalCogs) as profit
   FROM transaction_items ti
   JOIN transactions t ON ti.transactionId = t.id
   WHERE t.createdAt >= NOW() - INTERVAL '30 days'
   AND t.status = 'COMPLETED';
   ```

**Expected Result**:
- ✅ Profit = Revenue - COGS
- ✅ Accurate calculation
- ✅ Positive value (hopefully!)

**Dashboard Value**: Rp __________
**Database Value**: Rp __________
**Match**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

**Notes**: 

---

#### Test 3.3: Produk Terjual Count
**Steps**:
1. Note Produk Terjual value
2. Verify it's sum of all quantities sold
3. Check database:
   ```sql
   SELECT SUM(ti.quantity) as total_sold
   FROM transaction_items ti
   JOIN transactions t ON ti.transactionId = t.id
   WHERE t.createdAt >= NOW() - INTERVAL '30 days'
   AND t.status = 'COMPLETED';
   ```

**Expected Result**:
- ✅ Count matches database
- ✅ Shows as number (not Rupiah)

**Dashboard Value**: ________ item
**Database Value**: ________ item
**Match**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

---

### **TEST SECTION 4: INVENTORY PAGE TESTING**

#### Test 4.1: Navigate to Inventory
**Steps**:
1. From dashboard, click "Inventori" in sidebar
2. Wait for page to load

**Expected Result**:
- ✅ Redirected to `/koperasi/inventory`
- ✅ Product list loads
- ✅ Financial cards visible at top
- ✅ Period filter available

**Actual Result**: ⏳ PENDING

**Status**: ⏳ NOT TESTED

---

#### Test 4.2: Inventory Financial Cards
**Steps**:
1. On inventory page, observe financial cards
2. Compare with dashboard values (same period)

**Expected Result**:
- ✅ Same values as dashboard (data consistency)
- ✅ Period filter synchronized

**Dashboard Omzet**: Rp __________
**Inventory Omzet**: Rp __________
**Match**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

---

### **TEST SECTION 5: STOCK MOVEMENT FLOWS**

#### Test 5.1: Create Stock IN Movement
**Steps**:
1. On inventory page, find a product (e.g., "Beras Premium")
2. Click "Stok Masuk" (IN) button
3. Enter quantity: `10`
4. Select movement type: `PURCHASE_IN`
5. Click "Simpan"

**Expected Result**:
- ✅ Success toast notification
- ✅ Product stock increases by 10
- ✅ Movement recorded in database
- ✅ Financial cards DO NOT update (purchase doesn't affect revenue)

**Product**: __________________
**Stock Before**: ________ unit
**Stock After**: ________ unit
**Increase**: ________ unit (should be +10)

**Status**: ⏳ NOT TESTED

**Notes**: 

---

#### Test 5.2: Create Stock OUT Movement (Sale)
**Steps**:
1. Find same product
2. Click "Stok Keluar" (OUT) button
3. Enter quantity: `5`
4. Select movement type: `SALE_OUT`
5. Click "Simpan"

**Expected Result**:
- ✅ Success toast notification
- ✅ Product stock decreases by 5
- ✅ Movement recorded in database
- ✅ **Financial cards UPDATE** (sale creates transaction)
- ✅ Total Omzet increases by (5 × sellPrice)
- ✅ Keuntungan Bersih increases by (5 × profit margin)
- ✅ Produk Terjual increases by 5

**Product**: __________________
**Sell Price**: Rp ________ /unit
**Stock Before OUT**: ________ unit
**Stock After OUT**: ________ unit

**Financial Changes**:
- Omzet Before: Rp __________
- Omzet After: Rp __________
- Expected Increase: Rp __________ (5 × sellPrice)
- Actual Increase: Rp __________
- Match: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

**Notes**: 

---

#### Test 5.3: Multiple Stock Movements
**Steps**:
1. Create 3 more stock OUT movements:
   - Product A: OUT 3 units
   - Product B: OUT 2 units
   - Product C: OUT 7 units
2. Check financial metrics update after each

**Expected Result**:
- ✅ Each movement updates metrics immediately
- ✅ Cumulative calculations correct
- ✅ Produk Terjual = 5 + 3 + 2 + 7 = 17 increase

**Total Items Sold (cumulative)**: ________ items
**Expected**: 17 more than before Test 5.2
**Match**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

---

### **TEST SECTION 6: REAL-TIME UPDATES**

#### Test 6.1: Financial Refresh After Movement
**Steps**:
1. Note current financial values
2. Create 1 stock OUT movement
3. Observe financial cards WITHOUT page refresh

**Expected Result**:
- ✅ Financial cards update automatically
- ✅ No page refresh needed
- ✅ Update happens within 1-2 seconds

**Auto-refresh working**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

---

#### Test 6.2: Period Filter Persistence
**Steps**:
1. Set period to "7 Hari"
2. Navigate to Inventory
3. Check if period still "7 Hari"
4. Navigate back to Dashboard
5. Check period again

**Expected Result**:
- ✅ Period persists across navigation
- ✅ OR: Each page has independent period selector

**Period persists**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

---

### **TEST SECTION 7: EDGE CASES**

#### Test 7.1: Empty Period (No Transactions)
**Steps**:
1. Set period to "Hari Ini" (if no sales today)
2. Observe financial cards

**Expected Result**:
- ✅ Shows Rp 0 (not error)
- ✅ Shows "0 item" for Produk Terjual
- ✅ No console errors

**Status**: ⏳ NOT TESTED

---

#### Test 7.2: Very Large Period (1 Tahun)
**Steps**:
1. Set period to "1 Tahun"
2. Check performance

**Expected Result**:
- ✅ Loads within 3 seconds
- ✅ No performance issues
- ✅ Accurate calculations

**Load time**: ________ seconds

**Status**: ⏳ NOT TESTED

---

#### Test 7.3: Stock OUT More Than Available
**Steps**:
1. Find product with low stock (e.g., 2 units)
2. Try to OUT 10 units
3. Click "Simpan"

**Expected Result**:
- ❌ Error message: "Stok tidak cukup"
- ❌ Movement NOT created
- ❌ Stock unchanged
- ✅ User stays on page

**Error shown correctly**: ☐ YES ☐ NO

**Status**: ⏳ NOT TESTED

---

## 📊 TEST RESULTS SUMMARY

### **Test Statistics**:
- Total Test Cases: 20
- ✅ Passed: ____ (___%)
- ❌ Failed: ____ (___%)
- ⏳ Not Tested: ____ (___%)

### **Critical Issues Found**:
1. ________________
2. ________________
3. ________________

### **Minor Issues Found**:
1. ________________
2. ________________

### **Recommendations**:
1. ________________
2. ________________

---

## 🔍 DATABASE VERIFICATION QUERIES

### Check Current Financial Data (1 Month)
```sql
SELECT 
  COUNT(DISTINCT t.id) as total_transactions,
  SUM(ti.quantity) as total_items_sold,
  SUM(ti.totalPrice) as total_revenue,
  SUM(ti.totalCogs) as total_cogs,
  SUM(ti.totalPrice) - SUM(ti.totalCogs) as total_profit,
  ((SUM(ti.totalPrice) - SUM(ti.totalCogs)) / SUM(ti.totalPrice) * 100)::NUMERIC(10,2) as profit_margin_percent
FROM transaction_items ti
JOIN transactions t ON ti.transactionId = t.id
WHERE t.createdAt >= NOW() - INTERVAL '30 days'
AND t.status = 'COMPLETED';
```

### Check Today's Transactions
```sql
SELECT 
  t.id,
  t.createdAt,
  SUM(ti.quantity) as items,
  SUM(ti.totalPrice) as revenue,
  SUM(ti.totalCogs) as cogs,
  SUM(ti.totalPrice) - SUM(ti.totalCogs) as profit
FROM transactions t
JOIN transaction_items ti ON ti.transactionId = t.id
WHERE DATE(t.createdAt) = CURRENT_DATE
AND t.status = 'COMPLETED'
GROUP BY t.id, t.createdAt
ORDER BY t.createdAt DESC;
```

### Check Stock Movements Today
```sql
SELECT 
  sm.id,
  sm.movementType,
  p.name as product_name,
  sm.quantity,
  sm.occurredAt,
  sm.notes
FROM stock_movements sm
JOIN products p ON sm.productId = p.id
WHERE DATE(sm.occurredAt) = CURRENT_DATE
ORDER BY sm.occurredAt DESC;
```

---

## ✅ SIGN-OFF

**Tester**: Aegner  
**Test Date**: ________________  
**Test Duration**: ________ hours  
**Overall Assessment**: ☐ PASS ☐ FAIL ☐ CONDITIONAL PASS  

**Notes**: 

**Ready for Production**: ☐ YES ☐ NO ☐ WITH FIXES

---

**Last Updated**: 20 Oktober 2025, 11:00 WIB  
**Next Review**: After completing all test cases
