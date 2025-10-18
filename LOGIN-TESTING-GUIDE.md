# 🔐 Panduan Testing Login - Koperasi UMB

## ✅ Login Berhasil Diperbaiki!

Semua masalah login telah diperbaiki:
- ✅ Password sudah di-hash dengan benar menggunakan bcrypt
- ✅ Redirect otomatis ke dashboard sesuai role user
- ✅ Semua 8 test account berfungsi dengan baik

---

## 🚀 Cara Testing Login

### 1. Pastikan Development Server Berjalan
```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

### 2. Buka Halaman Login
```
http://localhost:3000/login
```

---

## 🔑 Akun Testing yang Tersedia

### **Semua akun menggunakan password yang sama:**
```
Password123!
```

### 1️⃣ **Super Admin** 👑
```
Email: superadmin@koperasi.com
Password: Password123!
```
**Setelah login → Redirect ke:** `/koperasi/super-admin`

**Fitur yang bisa diakses:**
- ✅ Dashboard Super Admin dengan statistik supplier
- ✅ Manajemen supplier (approval, rejection)
- ✅ Monitor payment status supplier
- ✅ Full access ke semua fitur

---

### 2️⃣ **Admin** 👔
```
Email: admin@koperasi.com
Password: Password123!
```
**Setelah login → Redirect ke:** `/koperasi/admin`

**Fitur yang bisa diakses:**
- ✅ Dashboard Admin dengan statistik koperasi
- ✅ Manajemen member
- ✅ Manajemen inventory & produk
- ✅ Transaksi & keuangan
- ✅ Broadcast ke member

---

### 3️⃣ **Supplier** 🏪
```
Email: supplier@koperasi.com
Password: Password123!
```
**Setelah login → Redirect ke:** `/koperasi/supplier`

**Fitur yang bisa diakses:**
- ✅ Dashboard Supplier
- ✅ Manajemen produk supplier
- ✅ Order history
- ✅ Upload payment proof
- ✅ View transaction history

---

### 4️⃣ **Member Users** (5 akun) 👥
```
Email: member1@koperasi.com - member5@koperasi.com
Password: Password123!
```
**Setelah login → Redirect ke:** `/koperasi/dashboard`

**Fitur yang bisa diakses:**
- ✅ Dashboard member
- ✅ View simpanan
- ✅ Riwayat transaksi
- ✅ Profile management

**Daftar Member:**
1. `member1@koperasi.com` - Anggota 1 (Unit: Keuangan)
2. `member2@koperasi.com` - Anggota 2 (Unit: HRD)
3. `member3@koperasi.com` - Anggota 3 (Unit: IT)
4. `member4@koperasi.com` - Anggota 4 (Unit: Marketing)
5. `member5@koperasi.com` - Anggota 5 (Unit: Operasional)

---

## 🎯 Langkah-Langkah Testing

### Test 1: Login Super Admin
1. Buka `http://localhost:3000/login`
2. Masukkan email: `superadmin@koperasi.com`
3. Masukkan password: `Password123!`
4. Klik "Login"
5. ✅ **Expected:** Redirect ke `/koperasi/super-admin` dengan dashboard super admin

### Test 2: Login Admin
1. Logout dari super admin
2. Login dengan email: `admin@koperasi.com`
3. Password: `Password123!`
4. ✅ **Expected:** Redirect ke `/koperasi/admin` dengan dashboard admin

### Test 3: Login Supplier
1. Logout dari admin
2. Login dengan email: `supplier@koperasi.com`
3. Password: `Password123!`
4. ✅ **Expected:** Redirect ke `/koperasi/supplier` dengan dashboard supplier

### Test 4: Login Member
1. Logout dari supplier
2. Login dengan email: `member1@koperasi.com`
3. Password: `Password123!`
4. ✅ **Expected:** Redirect ke `/koperasi/dashboard` dengan dashboard member

---

## 🔧 Troubleshooting

### Masalah: "Email tidak terdaftar"
**Solusi:**
```bash
# Re-run seed untuk ensure data ada
npx prisma db seed
```

### Masalah: "Password salah"
**Cek:**
- Pastikan password: `Password123!` (huruf P dan ! penting)
- Case sensitive: P besar, angka 123, tanda seru di akhir

### Masalah: Stuck di halaman login setelah klik Login
**Solusi:**
1. Buka Browser Console (F12)
2. Cek error message
3. Pastikan dev server running di terminal
4. Clear localStorage: `localStorage.clear()`
5. Refresh dan coba login lagi

### Masalah: Redirect ke halaman yang salah
**Expected Redirects:**
- `SUPER_ADMIN` → `/koperasi/super-admin` ✅
- `ADMIN` → `/koperasi/admin` ✅
- `SUPPLIER` → `/koperasi/supplier` ✅
- `USER` → `/koperasi/dashboard` ✅

---

## 🐛 Debugging Tips

### 1. Check Console Logs
Buka Browser DevTools (F12) → Console tab

Login akan menampilkan:
```
Attempting login with: {email: "..."}
Response status: 200
Login response: {success: true, error: null}
Token saved, redirecting...
Redirecting to: /koperasi/...
```

### 2. Check Network Tab
- Buka DevTools → Network tab
- Cek request ke `/api/auth/login`
- Status harus 200 OK
- Response harus berisi token dan user data

### 3. Check LocalStorage
```javascript
// Di browser console
localStorage.getItem('token')
```
Harus return JWT token string

### 4. Check Backend Logs
Di terminal yang running `npm run dev`, akan muncul:
```
Login attempt received
Login request for email: superadmin@koperasi.com
User found: true
Checking password for user: superadmin@koperasi.com
Password correct, generating token for user: superadmin@koperasi.com
Login successful for user: superadmin@koperasi.com
```

---

## 📊 Data Seed yang Dibuat

Setiap kali run `npx prisma db seed`, akan membuat:

### Users:
- 3 core users (superadmin, admin, supplier) dengan password hashed
- 5 member users dengan password hashed

### Categories:
- Sembako
- Minuman
- Makanan Ringan

### Products:
- Beras Premium 5kg
- Minyak Goreng 2L
- Gula Pasir 1kg
- Kopi Bubuk 200g
- Teh Kotak 1L

### Transactions:
- 10 sample transactions
- 5 financial transactions

### Others:
- Stock movements (initial + restock)
- Broadcasts (2 announcements)
- Member profiles dengan simpanan

---

## ✅ Checklist Testing

- [ ] Login Super Admin berhasil → Dashboard super admin muncul
- [ ] Login Admin berhasil → Dashboard admin muncul
- [ ] Login Supplier berhasil → Dashboard supplier muncul
- [ ] Login Member berhasil → Dashboard member muncul
- [ ] Password salah → Error message muncul
- [ ] Email tidak terdaftar → Error message muncul
- [ ] Logout berhasil → Redirect ke login
- [ ] Token tersimpan di localStorage
- [ ] Refresh page tetap login (token valid)

---

## 🎉 Status Perbaikan

### Yang Sudah Diperbaiki:
✅ Password member users sekarang di-hash dengan bcrypt
✅ Login redirect berdasarkan role user
✅ Seed script membuat semua test account dengan benar
✅ API login mengembalikan user role
✅ Frontend login page handle redirect based on role

### File yang Dimodifikasi:
1. `prisma/seed.ts` - Added password hashing for member users
2. `app/(auth)/login/page.tsx` - Added role-based redirect logic

---

**Last Updated:** Oktober 16, 2025
**Status:** ✅ ALL LOGIN ISSUES FIXED!
