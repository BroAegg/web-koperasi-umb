# DASHBOARD TESTING GUIDE

## 🎉 Completed Implementation

Semua dashboard sudah dibuat dengan **REAL API DATA** dan **ROLE-BASED ACCESS CONTROL**.

## ✅ Features Implemented

### 1. Supplier Dashboard (`/koperasi/supplier/dashboard`)
**API Endpoint**: `GET /api/supplier/dashboard`

**Features**:
- ✅ 4 Metric Cards (Total Produk, Total Pesanan, Pendapatan Bulan Ini, Completion Rate)
- ✅ Payment Status Alert (jika belum bayar Rp 25,000)
- ✅ Recent Orders (5 pesanan terbaru)
- ✅ Product Performance (produk supplier)
- ✅ Real-time data dari database
- ✅ Role protection: SUPPLIER only

**Data Sources**:
- `purchases` table untuk order statistics
- `products` table untuk inventory count
- `supplier_payments` table untuk payment status

---

### 2. Super Admin Dashboard (`/koperasi/super-admin`)
**API Endpoint**: `GET /api/super-admin/dashboard`

**Features**:
- ✅ 4 Main Stats (Total Supplier, Total Anggota, Total Produk, Pendapatan Bulan Ini)
- ✅ 3 Pending Action Cards (Supplier Pending, Payment Verification, Stock Verification)
- ✅ Alert untuk tindakan yang diperlukan
- ✅ Recent Suppliers (5 terbaru)
- ✅ Recent Stock Movements (5 terbaru)
- ✅ Role protection: SUPER_ADMIN only

**Data Sources**:
- `supplier_profiles` table untuk supplier stats
- `users` table untuk member count
- `products` table untuk product stats
- `transactions` table untuk revenue
- `stock_movements` table untuk incoming stock
- `supplier_payments` table untuk payment verification

---

### 3. Admin Dashboard (`/koperasi/admin`)
**API Endpoint**: `GET /api/admin/dashboard`

**Features**:
- ✅ 4 Main Metrics (Transaksi Hari Ini, Pendapatan Bulan Ini, Stok Rendah, Anggota Aktif)
- ✅ Low Stock Alert (jika ada produk dengan stok < 10)
- ✅ 7-Day Sales Trend (bar chart)
- ✅ Top 5 Selling Products (bulan ini)
- ✅ Recent Transactions (10 terbaru)
- ✅ Recent Stock Movements (10 terbaru)
- ✅ Low Stock Products detail list
- ✅ Role protection: ADMIN only

**Data Sources**:
- `transactions` table untuk sales data
- `transaction_items` table untuk top products
- `products` table untuk inventory
- `stock_movements` table untuk stock tracking
- `users` table untuk member count

---

## 🔐 Role-Based Access Control

### Implementation
1. **useAuth Hook** (`lib/use-auth.ts`)
   - Automatic token validation
   - Role checking
   - Auto redirect jika tidak authorized
   - Loading state management

2. **Layout Protection**
   - Supplier Layout: hanya role `SUPPLIER`
   - Admin Layout: hanya role `ADMIN`
   - Super Admin tidak punya layout khusus (bisa akses semua)

3. **API Protection**
   - Setiap API check role via `getUserFromToken()`
   - Return 403 jika role tidak sesuai

---

## 🧪 Testing Steps

### Persiapan
1. Pastikan database sudah di-seed dengan data sample
2. Jalankan development server: `npm run dev`
3. Buka browser di `http://localhost:3000`

### Test 1: Supplier Dashboard
```bash
# 1. Login sebagai supplier
# Email: supplier@example.com (sesuaikan dengan data di database)
# Password: [password yang di-seed]

# 2. Setelah login, akan redirect ke /koperasi/supplier/dashboard
# 3. Verify:
   ✓ Dashboard tampil tanpa error
   ✓ 4 metric cards menampilkan angka (bisa 0 jika belum ada data)
   ✓ Ada alert pembayaran (jika paymentStatus != PAID_APPROVED)
   ✓ Recent orders tampil (atau "Belum ada pesanan")
   ✓ Product performance tampil (atau "Belum ada produk")

# 4. Test navigation
   ✓ Klik menu "Produk Saya" → should navigate
   ✓ Klik menu "Pesanan" → should navigate
   ✓ Klik "Logout" → redirect ke /login

# 5. Test unauthorized access
   # Coba akses URL: http://localhost:3000/koperasi/admin
   # Expected: Redirect ke /login atau unauthorized error
```

### Test 2: Super Admin Dashboard
```bash
# 1. Login sebagai super admin
# Email: superadmin@example.com
# Password: [password yang di-seed]

# 2. Navigate ke /koperasi/super-admin
# 3. Verify:
   ✓ Dashboard tampil tanpa error
   ✓ 4 main stats menampilkan angka
   ✓ 3 pending action cards tampil
   ✓ Alert tampil jika ada pending actions
   ✓ Recent suppliers list tampil
   ✓ Recent stock movements tampil

# 4. Test actions
   ✓ Klik "Kelola Supplier" → navigate ke /koperasi/super-admin/suppliers
   ✓ Klik pending cards → navigate ke suppliers page

# 5. Test data accuracy
   # Buka Prisma Studio: npx prisma studio
   # Compare data di dashboard vs database
```

### Test 3: Admin Dashboard
```bash
# 1. Login sebagai admin
# Email: admin@example.com
# Password: [password yang di-seed]

# 2. Navigate ke /koperasi/admin
# 3. Verify:
   ✓ Dashboard tampil tanpa error
   ✓ 4 main metrics tampil
   ✓ Low stock alert tampil (jika ada produk stok < 10)
   ✓ 7-day sales trend chart tampil
   ✓ Top 5 products tampil
   ✓ Recent transactions tampil
   ✓ Recent stock movements table tampil
   ✓ Low stock products detail list tampil

# 4. Test responsive design
   # Resize browser window
   ✓ Cards should stack on mobile
   ✓ Tables should be scrollable
   ✓ Sidebar should collapse on mobile

# 5. Test performance
   # Open DevTools Network tab
   ✓ Dashboard API should load < 1 second
   ✓ No console errors
```

### Test 4: Role-Based Access Control
```bash
# Test Scenario 1: Supplier tries to access Admin
1. Login as supplier
2. Navigate to: http://localhost:3000/koperasi/admin
3. Expected: Redirect to /login or show unauthorized

# Test Scenario 2: Admin tries to access Supplier
1. Login as admin
2. Navigate to: http://localhost:3000/koperasi/supplier/dashboard
3. Expected: Redirect to /login or show unauthorized

# Test Scenario 3: Unauthenticated access
1. Logout (clear localStorage)
2. Navigate to any dashboard URL
3. Expected: Redirect to /login

# Test Scenario 4: Token expiration
1. Login as any role
2. Wait for token to expire (7 days by default)
3. Or manually modify token in localStorage
4. Refresh page
5. Expected: Auto logout and redirect to /login
```

---

## 🐛 Debugging

### Dashboard tidak load / error
1. Check browser console untuk error messages
2. Check Network tab untuk API response
3. Verify token exists: `localStorage.getItem('token')`
4. Check API endpoint response di Postman/Thunder Client

### Data tidak tampil / 0 semua
1. Cek database apakah ada data:
   ```bash
   npx prisma studio
   ```
2. Verify relationships di schema.prisma
3. Check API query di file route.ts

### Role checking tidak bekerja
1. Verify role di database users table
2. Check token payload: decode JWT di jwt.io
3. Verify useAuth hook diimport dengan benar
4. Check API endpoint role validation

---

## 📊 Expected Data Flow

### Supplier Dashboard
```
User Login → JWT Token → localStorage
↓
Page Load → useAuth(["SUPPLIER"]) → Verify Token & Role
↓
Fetch /api/supplier/dashboard → Extract Token from Header
↓
getUserFromToken() → Get User from DB → Check Role
↓
If SUPPLIER → Query purchases, products, supplier_payments
↓
Return aggregated data → Display in UI
```

### Admin Dashboard
```
User Login → JWT Token → localStorage
↓
Page Load → useAuth(["ADMIN"]) → Verify Token & Role
↓
Fetch /api/admin/dashboard → Extract Token from Header
↓
getUserFromToken() → Get User from DB → Check Role
↓
If ADMIN → Query transactions, products, transaction_items, stock_movements
↓
Aggregate stats (today, monthly, top products, trends)
↓
Return data → Display in UI with charts & tables
```

---

## 🚀 Next Steps (Optional Enhancements)

1. **Add Charts Library** (e.g., Recharts, Chart.js)
   - Line chart untuk revenue trends
   - Bar chart untuk sales comparison
   - Pie chart untuk category distribution

2. **Add Real-time Updates** (e.g., Socket.io, Pusher)
   - Live transaction notifications
   - Stock movement alerts
   - New order notifications

3. **Add Export Features**
   - Export dashboard data to PDF
   - Export reports to Excel
   - Print-friendly dashboard view

4. **Add Filters & Date Range**
   - Custom date range selector
   - Filter by category, supplier, etc.
   - Compare periods (this month vs last month)

5. **Add More Metrics**
   - Customer retention rate
   - Average order value
   - Profit margins
   - Inventory turnover ratio

---

## ✅ Completion Checklist

- [x] Supplier Dashboard API created
- [x] Supplier Dashboard Page created
- [x] Super Admin Dashboard API created
- [x] Super Admin Dashboard Page created
- [x] Admin Dashboard API created
- [x] Admin Dashboard Page created
- [x] Role-based access control implemented
- [x] useAuth hook integrated in layouts
- [x] All TypeScript errors fixed
- [x] No console errors
- [ ] Tested with real database data
- [ ] Verified on different browsers
- [ ] Tested responsive design
- [ ] Performance optimization done

---

## 📝 Notes

1. **Payment System**: Supplier must upload payment proof of Rp 25,000 before dashboard shows full features
2. **Stock Threshold**: Products with stock < 10 are considered "low stock"
3. **Completion Rate**: Calculated as (completedOrders / totalOrders) * 100
4. **Recent Activities**: Limited to 5-10 items for performance
5. **JWT Expiration**: Default 7 days, can be configured in .env

---

Semua fitur sudah COMPLETE dan ready untuk testing! 🎉
