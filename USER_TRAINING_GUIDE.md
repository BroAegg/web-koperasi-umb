# 📚 User Training Guide - Sistem Koperasi UMB

**Panduan Lengkap untuk Kasir, Admin, dan Supplier**

---

## 🎯 Daftar Isi

1. [Login & Akses Sistem](#1-login--akses-sistem)
2. [Dashboard Kasir](#2-dashboard-kasir)
3. [Point of Sale (POS)](#3-point-of-sale-pos)
4. [Manajemen Produk](#4-manajemen-produk)
5. [Manajemen Kategori](#5-manajemen-kategori)
6. [Stock Movement](#6-stock-movement)
7. [Membership & Points](#7-membership--points)
8. [Laporan Keuangan](#8-laporan-keuangan)
9. [Settlement Konsinyasi](#9-settlement-konsinyasi)
10. [Manajemen Supplier](#10-manajemen-supplier)
11. [Tips & Troubleshooting](#11-tips--troubleshooting)

---

## 1. Login & Akses Sistem

### 🔐 Cara Login

1. **Buka browser** (Chrome/Firefox/Edge)
2. **Ketik alamat**: `https://koperasi.umb.ac.id`
3. **Masukkan kredensial:**
   - Email: `admin@umb.ac.id`
   - Password: (password yang diberikan admin)
4. **Klik "Login"**

### 👤 Jenis User

| Role | Akses | Fungsi Utama |
|------|-------|-------------|
| **Super Admin** | Full access | Kelola semua sistem, approve supplier |
| **Admin/Kasir** | POS, Inventory, Reports | Transaksi, stok, laporan |
| **Supplier** | Portal supplier | Lihat produk & transaksi sendiri |
| **Developer** | System tools | Maintenance & debugging |

### 🔒 Ganti Password (Wajib!)

1. Klik **icon user** di pojok kanan atas
2. Pilih **"Change Password"**
3. Masukkan:
   - Current Password: (password lama)
   - New Password: (password baru - min 8 karakter)
   - Confirm Password: (ulangi password baru)
4. Klik **"Save"**

---

## 2. Dashboard Kasir

### 📊 Tampilan Dashboard

Setelah login, Anda akan melihat:

**Kartu Statistik:**
- 💰 **Total Penjualan Hari Ini**
- 📦 **Total Produk**
- 🏷️ **Kategori**
- ⚠️ **Low Stock Alerts**

**Grafik & Data:**
- Grafik penjualan (7 hari terakhir)
- Top 5 produk terlaris
- Transaksi terbaru

### 🔍 Quick Actions

- **New Sale** → Mulai transaksi POS
- **View Products** → Lihat/edit produk
- **Stock Movement** → Tambah/kurangi stok
- **Reports** → Lihat laporan

---

## 3. Point of Sale (POS)

### 🛒 Cara Melakukan Transaksi

#### Step 1: Buka POS
1. Dari dashboard, klik **"POS"** di sidebar
2. Atau klik tombol **"New Sale"**

#### Step 2: Cari Produk
**Metode 1 - Search:**
- Ketik nama produk di search box
- Pilih produk dari hasil pencarian
- Produk otomatis masuk ke cart

**Metode 2 - Scan Barcode:**
- Klik field barcode scanner
- Scan barcode produk
- Produk otomatis masuk ke cart

#### Step 3: Atur Quantity
- Klik **+** untuk tambah quantity
- Klik **-** untuk kurangi quantity
- Atau ketik langsung jumlahnya

#### Step 4: Apply Member (Opsional)
Jika ada member:
1. Klik **"Apply Member"**
2. Masukkan nomor HP atau email member
3. Klik **"Search"**
4. Pilih member
5. Member akan dapat poin 1% dari pembelian

#### Step 5: Pilih Payment Method
- **Cash** (Tunai)
- **Transfer** (Transfer Bank)
- **QRIS**

#### Step 6: Masukkan Jumlah Bayar
- Ketik nominal uang yang diterima
- Sistem otomatis hitung kembalian
- Jika ada poin member, bisa redeem: 100 poin = Rp 1,000

#### Step 7: Complete Transaction
1. Klik **"Complete Transaction"**
2. Struk otomatis muncul
3. Klik **"Print Receipt"** untuk cetak
4. Atau klik **"New Sale"** untuk transaksi baru

### 🎟️ Membership Features

**Earn Points:**
- Otomatis dapat 1% dari total belanja
- Contoh: Belanja Rp 100,000 = 1,000 poin

**Redeem Points:**
- 100 poin = Rp 1,000 diskon
- Maksimal redeem 50% dari total belanja
- Masukkan jumlah poin di field "Redeem Points"

---

## 4. Manajemen Produk

### ➕ Tambah Produk Baru

1. **Klik "Products"** di sidebar
2. **Klik "Add New Product"**
3. **Isi form:**
   - **Nama Produk** (wajib)
   - **SKU** (kode unik - opsional)
   - **Barcode** (untuk scanner - opsional)
   - **Kategori** (pilih dari dropdown)
   - **Harga Beli** (modal)
   - **Harga Jual** (harga jual ke customer)
   - **Stok** (jumlah awal)
   - **Minimum Stok** (alert jika stok di bawah ini)
   - **Supplier** (pilih jika konsinyasi)
   - **Status** (Active/Inactive)
4. **Klik "Save"**

### ✏️ Edit Produk

1. Dari halaman Products, klik **icon pensil** di produk
2. Update data yang perlu diubah
3. Klik **"Save"**

### 🗑️ Hapus Produk

1. Klik **icon trash** di produk
2. Konfirmasi penghapusan
3. **Note:** Produk yang sudah ada transaksi tidak bisa dihapus

### 🔍 Filter & Search

**Filter:**
- **By Category** → Pilih kategori di dropdown
- **Low Stock Only** → Centang checkbox
- **Status** → Active/Inactive/All

**Search:**
- Ketik nama/SKU/barcode di search box
- Hasil otomatis muncul

### 📊 Info Stok

**Indikator Warna:**
- 🟢 **Hijau** → Stok aman (> minimum)
- 🟡 **Kuning** → Stok mendekati minimum
- 🔴 **Merah** → Stok di bawah minimum (perlu restock!)

---

## 5. Manajemen Kategori

### ➕ Tambah Kategori

1. **Klik "Categories"** di sidebar
2. **Klik "Add Category"**
3. **Isi form:**
   - **Nama Kategori** (e.g., "Makanan", "Minuman")
   - **Icon** (pilih emoji icon)
   - **Order** (urutan tampilan - 1 = paling atas)
   - **Status** (Active/Inactive)
4. **Klik "Save"**

### 🎨 Pilih Icon

- Klik field **"Select Icon"**
- Pilih dari 30+ emoji icon
- Icon akan muncul di POS & dashboard

### ✏️ Edit/Hapus Kategori

- **Edit:** Klik icon pensil, ubah data, save
- **Hapus:** Klik icon trash
- **Note:** Kategori dengan produk tidak bisa dihapus

---

## 6. Stock Movement

### 📈 Tambah Stok (Stock IN)

1. **Klik "Stock Movements"** di sidebar
2. **Klik "Record Movement"**
3. **Pilih:**
   - **Type:** Stock IN
   - **Product:** Pilih produk
   - **Quantity:** Jumlah stok masuk
   - **Note:** Alasan (e.g., "Pembelian dari supplier")
4. **Klik "Save"**
5. Stok produk otomatis bertambah

### 📉 Kurangi Stok (Stock OUT)

1. Sama seperti Stock IN
2. **Type:** Stock OUT
3. **Note:** Alasan (e.g., "Produk rusak/kadaluarsa")
4. Stok otomatis berkurang

### ⚖️ Adjustment

Untuk koreksi stok:
1. **Type:** Adjustment
2. **Quantity:** Bisa positif (+) atau negatif (-)
3. **Note:** Jelaskan alasan adjustment

### 📊 Lihat History

**Filter:**
- **Period:** Today, 7 days, 1 month, 3 months, 6 months, 1 year
- **Product:** Pilih produk tertentu
- **Type:** IN/OUT/ADJUSTMENT

**Export:**
- Klik **"Export"** untuk download Excel

---

## 7. Membership & Points

### ➕ Daftarkan Member Baru

1. **Klik "Members"** di sidebar
2. **Klik "Add Member"**
3. **Isi form:**
   - **Nama Lengkap**
   - **Email** (opsional)
   - **No. HP** (wajib - untuk lookup di POS)
   - **Alamat** (opsional)
4. **Klik "Save"**
5. Member otomatis dapat Member ID

### 👥 Cari Member

**Di POS:**
- Klik "Apply Member"
- Ketik no HP atau email
- Pilih member dari hasil

**Di Dashboard:**
- Buka "Members"
- Search by nama/HP/email

### 🎁 Points System

**Earning:**
- 1% dari total pembelian
- Contoh: Beli Rp 50,000 = 500 poin

**Redemption:**
- 100 poin = Rp 1,000
- Maksimal 50% dari total belanja
- Di POS, masukkan jumlah poin di field "Redeem Points"

**View Points:**
- Member bisa login ke member portal
- Lihat poin balance & history

---

## 8. Laporan Keuangan

### 📊 Cara Akses Laporan

1. **Klik "Financial Reports"** di sidebar
2. **Pilih Period:**
   - Today
   - This Week
   - This Month
   - This Year
   - Custom (pilih tanggal manual)

### 💰 Summary Cards

**Revenue** → Total penjualan  
**COGS** → Total modal (buy price × quantity)  
**Profit** → Keuntungan (Revenue - COGS)  
**Transactions** → Jumlah transaksi

### 📈 Transaction List

**Filter:**
- **Type:** SALE, PURCHASE, RETURN
- **Status:** COMPLETED, VOID
- **Date Range:** Custom date picker

**Export:**
- **PDF:** Klik "Export PDF" → Laporan format PDF
- **Excel:** Klik "Export Excel" → Spreadsheet lengkap

### 📉 Grafik

- Grafik penjualan per hari
- Trend profit bulanan
- Top products by revenue

---

## 9. Settlement Konsinyasi

### 💸 Cara Hitung Settlement Supplier

1. **Klik "Consignment"** di sidebar
2. **Klik "Settlements"**
3. **Pilih Period:**
   - Current Month (bulan berjalan)
   - Previous Month (bulan lalu)

### 📋 Supplier List

Lihat semua supplier dengan:
- **Products Sold** → Jumlah produk terjual
- **Quantity Sold** → Total quantity
- **Pending Payment** → Uang yang harus dibayar

**Formula:**
```
Supplier Payment = (Buy Price × Quantity) - Commission (15%)
```

### 📄 Settlement Detail

**Klik "View Details"** pada supplier untuk lihat:

1. **Supplier Info:**
   - Nama, email, phone
   - Settlement period

2. **Summary Stats:**
   - Total Products Sold
   - Total Quantity
   - Commission (15%)
   - Supplier Payment

3. **Product Breakdown Table:**
   - Per-product calculation
   - Buy price, quantity, commission, supplier amount

4. **Payment Summary:**
   - Total amount
   - Previous payments (jika ada)
   - Remaining balance

### 💳 Record Payment

1. Dari settlement detail, klik **"Record Payment"**
2. **Isi form:**
   - **Amount:** Nominal yang dibayar
   - **Payment Method:** Transfer/Cash/Cheque
   - **Bank Name:** (jika transfer)
   - **Account Number:** (jika transfer)
   - **Note:** Catatan (opsional)
3. **Klik "Record Payment"**
4. Payment masuk ke history

### 📜 Payment History

- Lihat semua pembayaran ke supplier
- Tanggal, jumlah, metode
- Status: PAID/PENDING

---

## 10. Manajemen Supplier

### ➕ Registrasi Supplier Baru

**Supplier mengisi form di:**
`https://koperasi.umb.ac.id/supplier/register`

**Form berisi:**
- Nama Bisnis
- Nama Pemilik
- Email & Phone
- Alamat
- Upload KTP/SIUP

### ✅ Approval Supplier (Admin)

1. **Login sebagai Super Admin**
2. **Klik "Suppliers"** → **"Pending Requests"**
3. **Review data supplier**
4. **Action:**
   - **Approve:** Supplier bisa akses portal
   - **Reject:** Berikan alasan penolakan

### 🔐 Portal Supplier

Supplier bisa login di:
`https://koperasi.umb.ac.id/login`

**Fitur supplier:**
- Lihat produk konsinyasi mereka
- Lihat transaksi penjualan
- Lihat settlement & payment
- Upload payment proof (iuran bulanan)

### 💵 Monthly Fee

- Supplier bayar Rp 25,000/bulan
- Upload bukti transfer di portal
- Admin verify payment

---

## 11. Tips & Troubleshooting

### ✅ Best Practices

**Daily Tasks:**
- [ ] Check low stock products (pagi)
- [ ] Process transactions via POS
- [ ] Record stock movements
- [ ] Review daily sales (sore)

**Weekly Tasks:**
- [ ] Review financial reports
- [ ] Process supplier settlements
- [ ] Backup database (otomatis)
- [ ] Check member registrations

**Monthly Tasks:**
- [ ] Generate monthly reports
- [ ] Pay supplier settlements
- [ ] Verify supplier monthly fees
- [ ] Review inventory accuracy

### 🐛 Common Issues

**Issue: Login gagal**
- ✅ Cek email & password benar
- ✅ Password case-sensitive
- ✅ Reset password jika lupa

**Issue: Produk tidak muncul di POS**
- ✅ Cek status produk = Active
- ✅ Cek stok > 0
- ✅ Refresh halaman (F5)

**Issue: Stok tidak update**
- ✅ Cek stock movement history
- ✅ Pastikan transaksi complete (bukan void)
- ✅ Contact admin

**Issue: Member tidak dapat poin**
- ✅ Pastikan member di-apply di POS
- ✅ Cek transaksi status = COMPLETED
- ✅ Poin muncul 1-2 menit setelah transaksi

**Issue: Print receipt tidak jalan**
- ✅ Cek printer nyala & connected
- ✅ Cek kertas thermal ada
- ✅ Allow browser print popup
- ✅ Gunakan Ctrl+P untuk print manual

### 🔧 Shortcuts

| Action | Shortcut |
|--------|----------|
| Open POS | Alt + P |
| Search Product | / (slash) |
| Clear Cart | Ctrl + Del |
| Complete Transaction | Ctrl + Enter |
| Print Receipt | Ctrl + P |
| Refresh Page | F5 |

### 📞 Bantuan

**Technical Support:**
- Email: support@umb.ac.id
- Phone: 022-1234-5678
- WhatsApp: 0812-3456-7890

**User Guide:**
- Online: https://koperasi.umb.ac.id/docs
- PDF: Download dari dashboard

---

## 📚 Quick Reference Cards

### Kasir POS Cheatsheet

```
1. Scan/Search Product → Add to Cart
2. Adjust Quantity (+/-)
3. Apply Member (optional)
4. Select Payment Method
5. Enter Amount Paid
6. Redeem Points (if member)
7. Complete Transaction
8. Print Receipt
```

### Admin Daily Checklist

```
Morning:
□ Check low stock alerts
□ Review yesterday's sales
□ Process pending supplier requests

During Day:
□ Monitor POS transactions
□ Assist with member registrations
□ Record stock movements

Evening:
□ Generate daily sales report
□ Verify cash drawer balance
□ Plan next day restocks
```

### Supplier Portal Guide

```
Login → https://koperasi.umb.ac.id/login

Features:
✓ View my products
✓ View sales transactions
✓ View settlement calculations
✓ View payment history
✓ Upload monthly fee payment
✓ Update profile
```

---

## 🎓 Training Videos (Optional)

**Video Tutorials:**
1. **Login & Dashboard Tour** (5 min)
2. **POS Transaction Complete Flow** (10 min)
3. **Product & Stock Management** (8 min)
4. **Financial Reports** (7 min)
5. **Supplier Settlement** (12 min)

**Access:** https://koperasi.umb.ac.id/training

---

## ✅ Training Completion Checklist

**Kasir:**
- [ ] Bisa login & ganti password
- [ ] Bisa buat transaksi POS lengkap
- [ ] Bisa apply member & redeem points
- [ ] Bisa print receipt
- [ ] Bisa tambah/edit produk
- [ ] Bisa record stock movement

**Admin:**
- [ ] Semua checklist Kasir ✓
- [ ] Bisa generate financial reports
- [ ] Bisa export reports (PDF/Excel)
- [ ] Bisa approve supplier
- [ ] Bisa hitung settlement konsinyasi
- [ ] Bisa record payment ke supplier

**Super Admin:**
- [ ] Semua checklist Admin ✓
- [ ] Bisa kelola semua user
- [ ] Bisa access developer tools
- [ ] Bisa backup/restore database
- [ ] Bisa monitor system health

---

**Selamat belajar! 🎉**

Jika ada pertanyaan, hubungi tim IT:
- Email: it@umb.ac.id
- Phone: 022-1234-5678

**Sistem Koperasi UMB - Built with ❤️**
