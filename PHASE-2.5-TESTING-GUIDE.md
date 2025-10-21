# 🧪 PHASE 2.5: END-TO-END TESTING GUIDE

**Phase:** 2.5 - Comprehensive Data Isolation Testing  
**Date:** 21 Oktober 2025  
**Status:** ⏳ IN PROGRESS  
**Tester:** Reyvan & Aegner

---

## 📋 **TESTING OBJECTIVES**

Verify bahwa:
1. ✅ Data isolation works correctly (DEV vs PROD)
2. ✅ POS transactions separated by environment
3. ✅ Activity logging captures all actions
4. ✅ Role switching works seamlessly
5. ✅ Developer badge displays correctly

---

## 🚀 **PRE-TESTING SETUP**

### **Step 1: Start Dev Server**

```powershell
cd "D:\Me\portfolio\Sisinfo\web-koperasi\web-koperasi-umb"
npm run dev
```

Server should run at: `http://localhost:3000`

### **Step 2: Verify Database Connection**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'transaction_items', 'stock_movements', 'activity_logs');

-- Should show all 4 tables
```

### **Step 3: Login as Developer**

```
URL: http://localhost:3000/login
Email: reyvan.dev@koperasi-umb.com
Password: DevSecure2025!@#
```

**Expected Result:**
- ✅ Redirect to `/koperasi/developer-dashboard`
- ✅ See blue badge: `[● Role: DEVELOPER] [🟢 DEV]`
- ✅ Sidebar shows "Developer Tools" category

---

## 🧪 **TEST CASE 1: Developer Badge Visibility**

**Objective:** Verify badge displays correctly across pages

**Steps:**
1. After login, check top-right corner
2. Navigate to Dashboard
3. Navigate to POS Kasir
4. Navigate to Inventory
5. Navigate back to Developer Dashboard

**Expected Results:**
- ✅ Badge always visible (fixed position)
- ✅ Shows: `[● Role: DEVELOPER]` (blue)
- ✅ Shows: `[🟢 DEV]` (green) - default mode
- ✅ Badge doesn't interfere with content
- ✅ Badge doesn't overlap sidebar

**Screenshot Checklist:**
- [ ] Badge visible on Dashboard
- [ ] Badge visible on POS page
- [ ] Badge doesn't block any UI elements

---

## 🧪 **TEST CASE 2: Role Switching**

**Objective:** Verify role switching updates badge correctly

**Steps:**
1. Go to Developer Dashboard
2. Click "Switch to Admin" button
3. Observe badge change
4. Navigate to POS Kasir
5. Check if Developer Tools still in sidebar
6. Return to Developer Dashboard
7. Click "Return to Developer"

**Expected Results:**
- ✅ Badge updates to: `[● Role: ADMIN]` (blue)
- ✅ Environment badge stays: `[🟢 DEV]` (green)
- ✅ Developer Tools category still visible in sidebar
- ✅ Can still access Developer Dashboard
- ✅ Can switch back to DEVELOPER role
- ✅ No page reload needed

**Verification:**
Open browser DevTools Console, check localStorage:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Developer Session:', payload.developerSession);
// Should show:
// {
//   actualRole: "DEVELOPER",
//   activeRole: "ADMIN",  // Changed!
//   isProduction: false,
//   switchedAt: "2025-10-21T..."
// }
```

---

## 🧪 **TEST CASE 3: Environment Toggle (DEV → PROD)**

**Objective:** Verify environment toggle updates badge and session

**Steps:**
1. From Developer Dashboard (in DEV mode)
2. Verify badge shows: `[🟢 DEV]` (green)
3. Click "Switch to Production Mode" button
4. Wait for response
5. Observe badge change

**Expected Results:**
- ✅ Badge updates to: `[🔴 PROD]` (red)
- ✅ Role badge stays same: `[● Role: DEVELOPER]`
- ✅ localStorage token updated
- ✅ Activity log created

**Database Verification:**
```sql
SELECT * FROM activity_logs 
WHERE user_role = 'DEVELOPER' 
AND action = 'ENVIRONMENT_SWITCH'
ORDER BY created_at DESC 
LIMIT 1;

-- Expected:
-- action: ENVIRONMENT_SWITCH
-- module: DEVELOPER_TOOLS
-- description: Switched environment to PRODUCTION
-- metadata: {"isProduction": true}
-- is_production: true (always log to prod)
```

**Screenshot Checklist:**
- [ ] Badge shows `[🔴 PROD]` (red)
- [ ] Activity log entry in database

---

## 🧪 **TEST CASE 4: POS Transaction in DEV Mode**

**Objective:** Verify transactions created in DEV mode have isProduction = false

**Steps:**

### **4.1: Switch to DEV Mode**
1. Go to Developer Dashboard
2. If in PROD mode, click "Switch to Development Mode"
3. Verify badge: `[🟢 DEV]`

### **4.2: Switch to ADMIN Role**
1. Click "Switch to Admin"
2. Verify badge: `[● Role: ADMIN] [🟢 DEV]`

### **4.3: Create POS Transaction**
1. Navigate to POS Kasir (`/koperasi/pos`)
2. Add products to cart:
   - Product: Pulpen (or any available product)
   - Quantity: 2
   - Click "Add to Cart"
3. Enter customer info:
   - Customer Name: "Test Customer DEV"
4. Payment:
   - Payment Method: CASH
   - Amount Paid: (auto-calculated or enter amount)
5. Click "Process Transaction"

**Expected Results:**
- ✅ Transaction success message
- ✅ Cart cleared
- ✅ Stock updated

### **4.4: Database Verification**

```sql
-- Get latest transaction
SELECT id, total_amount, is_production, note, created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 1;

-- Expected:
-- is_production: false  ← IMPORTANT!
-- note: Contains "Test Customer DEV"

-- Get transaction items
SELECT ti.*, p.name as product_name
FROM transaction_items ti
JOIN products p ON p.id = ti.product_id
WHERE ti.transaction_id = '<transaction_id_from_above>'
AND ti.is_production = false;  ← IMPORTANT!

-- Get stock movement
SELECT * FROM stock_movements
WHERE reference_id = '<transaction_id>'
AND is_production = false;  ← IMPORTANT!

-- Get activity log
SELECT * FROM activity_logs
WHERE module = 'POS'
AND action = 'CREATE'
ORDER BY created_at DESC
LIMIT 1;

-- Expected metadata:
-- transactionId, totalAmount, itemCount, paymentMethod, customerName
```

**Verification Checklist:**
- [ ] `transactions.is_production = false` ✅
- [ ] `transaction_items.is_production = false` ✅
- [ ] `stock_movements.is_production = false` ✅
- [ ] `activity_logs` entry exists ✅
- [ ] All 4 records linked by transaction_id ✅

---

## 🧪 **TEST CASE 5: POS Transaction in PROD Mode**

**Objective:** Verify transactions created in PROD mode have isProduction = true

**Steps:**

### **5.1: Switch to PROD Mode**
1. Go to Developer Dashboard
2. Click "Switch to Production Mode"
3. Verify badge: `[🔴 PROD]`

### **5.2: Ensure ADMIN Role**
1. If not ADMIN, click "Switch to Admin"
2. Verify badge: `[● Role: ADMIN] [🔴 PROD]`

### **5.3: Create POS Transaction**
1. Navigate to POS Kasir
2. Add products to cart:
   - Product: Pensil (different product)
   - Quantity: 3
3. Enter customer info:
   - Customer Name: "Test Customer PROD"
4. Payment:
   - Payment Method: CASH
   - Amount Paid: (calculated amount)
5. Click "Process Transaction"

**Expected Results:**
- ✅ Transaction success
- ✅ Cart cleared
- ✅ Stock updated

### **5.4: Database Verification**

```sql
-- Get latest PROD transaction
SELECT id, total_amount, is_production, note, created_at
FROM transactions
WHERE is_production = true
ORDER BY created_at DESC
LIMIT 1;

-- Expected:
-- is_production: true  ← IMPORTANT!
-- note: Contains "Test Customer PROD"

-- Verify transaction items
SELECT * FROM transaction_items
WHERE transaction_id = '<transaction_id>'
AND is_production = true;  ← IMPORTANT!

-- Verify stock movement
SELECT * FROM stock_movements
WHERE reference_id = '<transaction_id>'
AND is_production = true;  ← IMPORTANT!
```

**Verification Checklist:**
- [ ] `transactions.is_production = true` ✅
- [ ] `transaction_items.is_production = true` ✅
- [ ] `stock_movements.is_production = true` ✅
- [ ] Activity log created ✅

---

## 🧪 **TEST CASE 6: Data Isolation Verification**

**Objective:** Verify DEV and PROD data are completely isolated

**Steps:**

### **6.1: Count Total Records**

```sql
-- Count all transactions by environment
SELECT 
  is_production,
  COUNT(*) as count,
  SUM(total_amount) as total_sales
FROM transactions
GROUP BY is_production;

-- Expected output:
-- is_production | count | total_sales
-- false         | 1     | <amount from DEV transaction>
-- true          | 1     | <amount from PROD transaction>
```

### **6.2: Verify Transaction Items**

```sql
SELECT 
  is_production,
  COUNT(*) as count
FROM transaction_items
GROUP BY is_production;

-- Should show:
-- false: X items (from DEV transaction)
-- true: Y items (from PROD transaction)
```

### **6.3: Verify Stock Movements**

```sql
SELECT 
  is_production,
  COUNT(*) as count
FROM stock_movements
GROUP BY is_production;

-- Should show separate counts
```

### **6.4: Switch Between Environments**

**In DEV Mode:**
1. Go to POS page
2. Check recent transactions list
3. Should ONLY see "Test Customer DEV" transaction

**In PROD Mode:**
1. Switch to PROD
2. Go to POS page
3. Should ONLY see "Test Customer PROD" transaction

**Expected:**
- ✅ DEV mode shows only DEV transactions
- ✅ PROD mode shows only PROD transactions
- ✅ Complete data isolation

---

## 🧪 **TEST CASE 7: Activity Logging**

**Objective:** Verify all actions are logged correctly

**Steps:**

### **7.1: Check All Logs**

```sql
SELECT 
  user_role,
  action,
  module,
  description,
  created_at
FROM activity_logs
ORDER BY created_at DESC
LIMIT 10;

-- Should show:
-- 1. LOGIN (from initial login)
-- 2. ROLE_SWITCH (if switched roles)
-- 3. ENVIRONMENT_SWITCH (when toggled DEV/PROD)
-- 4. CREATE (POS transaction in DEV)
-- 5. ENVIRONMENT_SWITCH (DEV → PROD)
-- 6. CREATE (POS transaction in PROD)
```

### **7.2: Verify Metadata**

```sql
SELECT 
  description,
  metadata,
  is_production
FROM activity_logs
WHERE module = 'POS'
AND action = 'CREATE'
ORDER BY created_at DESC;

-- Check metadata contains:
-- transactionId, totalAmount, itemCount, paymentMethod, customerName
```

**Verification Checklist:**
- [ ] All environment switches logged ✅
- [ ] All POS transactions logged ✅
- [ ] Metadata complete and accurate ✅
- [ ] Developer actions logged to PROD ✅

---

## 🧪 **TEST CASE 8: Stock Impact**

**Objective:** Verify stock changes are isolated by environment

**Steps:**

### **8.1: Check Product Stock**

```sql
-- Get product used in both transactions
SELECT id, name, sku, stock
FROM products
WHERE name IN ('Pulpen', 'Pensil')
OR sku IN ('<sku_from_test>');

-- Record current stock values
```

### **8.2: Verify Stock Decreased**

After both transactions, product stock should be:
- DEV transaction: Stock decreased by 2 (Pulpen)
- PROD transaction: Stock decreased by 3 (Pensil)

**Important:** Stock updates are NOT isolated by environment!
Products table doesn't have `isProduction` flag, so stock changes affect all environments.

**This is intentional** - stock is global, but transaction records are isolated.

---

## 📊 **TESTING SUMMARY TEMPLATE**

Copy this and fill in your results:

```markdown
## PHASE 2.5 TESTING RESULTS

**Date:** [Your Date]
**Tester:** [Your Name]
**Duration:** [Time Spent]

### Test Results:
- [ ] TEST 1: Developer Badge - PASS / FAIL
- [ ] TEST 2: Role Switching - PASS / FAIL
- [ ] TEST 3: Environment Toggle - PASS / FAIL
- [ ] TEST 4: POS Transaction DEV - PASS / FAIL
- [ ] TEST 5: POS Transaction PROD - PASS / FAIL
- [ ] TEST 6: Data Isolation - PASS / FAIL
- [ ] TEST 7: Activity Logging - PASS / FAIL
- [ ] TEST 8: Stock Impact - PASS / FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Database Verification:
```sql
-- DEV transactions count
SELECT COUNT(*) FROM transactions WHERE is_production = false;
-- Result: 

-- PROD transactions count
SELECT COUNT(*) FROM transactions WHERE is_production = true;
-- Result: 

-- Activity logs count
SELECT COUNT(*) FROM activity_logs WHERE module = 'POS';
-- Result: 
```

### Screenshots:
[Attach screenshots of badge, transactions, database queries]

### Conclusion:
✅ READY FOR PRODUCTION / ⚠️ NEEDS FIXES
```

---

## ✅ **SUCCESS CRITERIA**

Phase 2.5 considered **COMPLETE** when:

1. ✅ All 8 test cases PASS
2. ✅ DEV transactions have `is_production = false`
3. ✅ PROD transactions have `is_production = true`
4. ✅ Data completely isolated (queries filtered correctly)
5. ✅ Activity logs capture all actions
6. ✅ Developer badge works across all pages
7. ✅ Role switching seamless
8. ✅ No console errors
9. ✅ No TypeScript errors
10. ✅ Documentation complete

---

## 🐛 **COMMON ISSUES & FIXES**

### **Issue 1: isProduction always true**
**Cause:** withDeveloperSession not wrapping API route  
**Fix:** Check `app/api/pos/transaction/route.ts` has `return withDeveloperSession(req, async () => { ... })`

### **Issue 2: Badge not showing**
**Cause:** DeveloperContext not initialized  
**Fix:** Check `app/layout.tsx` has `<DeveloperProvider>` wrapper

### **Issue 3: Role switch not working**
**Cause:** Token not updated in localStorage  
**Fix:** Check `/api/developer/switch-role` returns new token

### **Issue 4: Activity logs not created**
**Cause:** createActivityLog not called  
**Fix:** Add `await createActivityLog({...})` after transaction success

---

## 🎯 **NEXT STEPS AFTER TESTING**

If all tests PASS:
1. ✅ Mark Phase 2.5 as COMPLETE
2. ✅ Document test results
3. ✅ Update DEVELOPER-MODE-TRACKING.md
4. 🚀 **Proceed to Phase 3: Activity Logs Viewer UI**

If tests FAIL:
1. 🐛 Document all issues found
2. 🔧 Fix issues one by one
3. 🔄 Re-run failed tests
4. ✅ Only proceed when all PASS

---

**Ready to start testing bro?** Follow this guide step by step, jangan skip! 🧪

**Estimated Time:** 30-45 minutes untuk complete testing

**Target Completion:** 21 Oktober 2025, 04:00 WIB
