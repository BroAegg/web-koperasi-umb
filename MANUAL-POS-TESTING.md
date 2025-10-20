# 🧪 MANUAL TESTING GUIDE - POS Payment Bug Fixes

**Date**: October 20, 2025  
**Purpose**: Verify all 3 bugs are fixed

---

## ✅ **PRE-REQUISITES**

1. ✅ Dev server running: `npm run dev`
2. ✅ Browser open: `http://localhost:3000`
3. ✅ Admin credentials ready:
   - Email: `admin@koperasi.com`
   - Password: `admin123`

---

## 🧪 **TEST CASE 1: Full Payment Flow**

### **Steps**:

#### 1. Login sebagai ADMIN
- Go to: `http://localhost:3000/login`
- Enter email: `admin@koperasi.com`
- Enter password: `admin123`
- Click "Login"
- ✅ Should redirect to `/koperasi/dashboard`

#### 2. Navigate to POS
- Click "POS" di sidebar
- OR go to: `http://localhost:3000/koperasi/pos`
- ✅ Page should load without errors

#### 3. Add Products to Cart
- Search for products (cari produk yang ada stock)
- Click "Add to Cart" pada 2-3 products
- ✅ Products should appear in cart on the right
- ✅ Total amount should calculate correctly

#### 4. Open Payment Modal
- Click "Process Payment" button (big green button)
- ✅ Payment modal should open

#### 5. Fill Payment Details
- **Payment Method**: Select "CASH"
- **Amount Paid**: Enter amount >= total (contoh: jika total 50000, masukkan 55000)
- **Customer Name**: Enter "TEST CUSTOMER" (optional)
- ✅ Change amount should calculate automatically

#### 6. Process Payment (THE CRITICAL TEST!)
- Click "Process Payment" button in modal
- ✅ **WATCH CONSOLE** (F12 → Console tab)

### **Expected Results**:

#### ✅ **SUCCESS INDICATORS**:
- ✅ **NO 403 error** (Bug #1 fixed - Auth header working)
- ✅ **NO 500 error about "subtotal"** (Bug #2 fixed - Field name correct)
- ✅ **NO 500 error about "isProduction"** (Bug #3 fixed - No double injection)
- ✅ Modal closes
- ✅ Success message appears
- ✅ Cart is cleared
- ✅ Receipt/confirmation shown

#### ❌ **FAILURE INDICATORS**:
- ❌ Console shows: `POST /api/pos/transaction 403` → Bug #1 NOT FIXED
- ❌ Console shows: `500` with "subtotal" error → Bug #2 NOT FIXED
- ❌ Console shows: `500` with "isProduction" or "Unknown argument" → Bug #3 NOT FIXED
- ❌ Alert: "Payment failed"
- ❌ Modal stays open

---

## 🧪 **TEST CASE 2: Verify Database Updates**

### **After Successful Payment**:

#### 1. Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for success response
- ✅ Should show transaction ID

#### 2. Check Database (Manual)

Open your database client (e.g., Prisma Studio):
```bash
npx prisma studio
```

Then check:

**A. Transactions Table**:
```sql
SELECT * FROM transactions 
ORDER BY createdAt DESC 
LIMIT 1;
```
✅ Should see new transaction with:
- `type = 'SALE'`
- `status = 'COMPLETED'`
- `paymentMethod = 'CASH'`
- `totalAmount` = your payment amount

**B. Transaction Items Table**:
```sql
SELECT * FROM transaction_items 
WHERE transactionId = 'your-transaction-id'
ORDER BY createdAt DESC;
```
✅ Should see items with:
- `totalPrice` field populated (NOT subtotal!)
- Correct `quantity` and `unitPrice`

**C. Products Table** (Stock should decrease):
```sql
SELECT id, name, stock 
FROM products 
WHERE id IN (
  SELECT productId FROM transaction_items 
  WHERE transactionId = 'your-transaction-id'
);
```
✅ Stock should be DECREASED by quantity sold

**D. Stock Movements Table**:
```sql
SELECT * FROM stock_movements 
WHERE referenceId = 'your-transaction-id' 
  AND referenceType = 'TRANSACTION'
ORDER BY occurredAt DESC;
```
✅ Should see movements with:
- `movementType = 'SALE_OUT'`
- `quantity` = negative number (outgoing)

---

## 🧪 **TEST CASE 3: Error Scenarios**

### **A. Test Session Expired**:
1. Login and go to POS
2. Open DevTools Console (F12)
3. Run: `localStorage.removeItem('token')`
4. Try to process payment
5. ✅ Should show: "Session expired. Please login again."
6. ✅ Should redirect to `/login`

### **B. Test Insufficient Stock**:
1. Find a product with stock = 1
2. Add it to cart with quantity = 5
3. Try to process payment
4. ✅ Should show error: "Insufficient stock for [product]"
5. ✅ NO transaction created

### **C. Test Insufficient Payment**:
1. Add products (total = 50,000)
2. Enter amount paid = 40,000
3. Try to process payment
4. ✅ Should show error: "Insufficient payment amount"
5. ✅ Payment button disabled or error message

---

## 📊 **VERIFICATION CHECKLIST**

### **Bug #1: 403 Forbidden** ✅
- [ ] Login as ADMIN successful
- [ ] Can access POS page
- [ ] Can add products to cart
- [ ] Payment request includes Authorization header
- [ ] NO 403 error in console

### **Bug #2: 500 Schema Mismatch** ✅
- [ ] Payment processes without "subtotal" error
- [ ] Database `transaction_items.totalPrice` populated correctly
- [ ] NO 500 error about missing/unknown fields

### **Bug #3: 500 Double Injection** ✅
- [ ] Payment processes without "isProduction" error
- [ ] NO 500 error about "Unknown argument"
- [ ] NO error about duplicate fields

### **Overall Functionality** ✅
- [ ] Payment completes successfully
- [ ] Receipt/confirmation shown
- [ ] Cart cleared
- [ ] Transaction created in database
- [ ] Transaction items created
- [ ] Stock decreased correctly
- [ ] Stock movements recorded
- [ ] Activity log created (if applicable)

---

## 🎯 **QUICK TEST (5 MINUTES)**

1. ✅ Login as ADMIN
2. ✅ Go to POS
3. ✅ Add 2-3 products
4. ✅ Click "Process Payment"
5. ✅ Enter payment details
6. ✅ Click "Process Payment"
7. ✅ **CHECK CONSOLE** - Should be NO errors!
8. ✅ **CHECK RESULT** - Payment should succeed!

---

## 📝 **WHAT TO REPORT**

### **If ALL TESTS PASS** ✅:
```
✅ SEMUA BUG SUDAH TERATASI!
✅ Payment berhasil tanpa error
✅ Database ter-update dengan benar
✅ POS sudah siap digunakan untuk production
```

### **If ANY TEST FAILS** ❌:
Report the following:
1. Which step failed?
2. What error message appeared?
3. Console logs (copy from browser)
4. Screenshot if possible

---

## 🚀 **BROWSER CONSOLE TEST (ADVANCED)**

Jika ingin test via console browser:

### **1. Open Browser Console** (F12)

### **2. Login and Get Token**:
```javascript
// Login
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@koperasi.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(d => {
  console.log('Login success:', d);
  localStorage.setItem('token', d.token);
  console.log('Token saved to localStorage');
});
```

### **3. Test POS Transaction**:
```javascript
// Get token
const token = localStorage.getItem('token');

// Test transaction (ganti productId dengan ID yang valid)
fetch('http://localhost:3000/api/pos/transaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // ✅ Bug #1 fix
  },
  body: JSON.stringify({
    items: [
      {
        productId: 'your-product-id-here', // Ganti dengan ID produk yang ada
        quantity: 1,
        unitPrice: 10000,
        subtotal: 10000 // Frontend field name (will be mapped to totalPrice)
      }
    ],
    totalAmount: 10000,
    paymentMethod: 'CASH',
    amountPaid: 15000,
    customerName: 'Console Test Customer',
    change: 5000
  })
})
.then(r => r.json())
.then(d => {
  console.log('Transaction result:', d);
  if (d.success) {
    console.log('✅ PAYMENT SUCCESS!');
    console.log('Transaction ID:', d.data.transactionId);
  } else {
    console.log('❌ PAYMENT FAILED:', d.error);
  }
});
```

---

## 🎓 **TIPS**

1. **Always check browser console** (F12) - Errors akan muncul di sini
2. **Use Prisma Studio** untuk verify database: `npx prisma studio`
3. **Test multiple times** - Pastikan consistent
4. **Test different scenarios** - CASH vs TRANSFER, different amounts
5. **Check stock updates** - Pastikan inventory berkurang

---

**Ready to Test**: ✅ YES  
**Estimated Time**: 5-10 minutes  
**Difficulty**: Easy (just follow steps)

**SILAKAN MULAI TESTING!** 🚀
