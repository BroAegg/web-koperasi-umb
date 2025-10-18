# 📚 PANDUAN PENGGUNA - Sistem Koperasi UMB

**Versi**: 1.0  
**Tanggal**: 19 Oktober 2025  
**Untuk**: Semua Pengguna Sistem

---

## 🎯 DAFTAR ISI

1. [Pengenalan Sistem](#pengenalan-sistem)
2. [Cara Login](#cara-login)
3. [Dashboard Super Admin](#dashboard-super-admin)
4. [Dashboard Admin](#dashboard-admin)
5. [Dashboard Supplier](#dashboard-supplier)
6. [Manajemen Inventori](#manajemen-inventori)
7. [Manajemen Keuangan](#manajemen-keuangan)
8. [Manajemen Member](#manajemen-member)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## 📖 PENGENALAN SISTEM

### Apa itu Sistem Koperasi UMB?

Sistem Koperasi UMB adalah aplikasi web untuk mengelola:
- **Inventori** (stok barang, produk)
- **Keuangan** (transaksi, laporan)
- **Keanggotaan** (data member)
- **Supplier** (vendor/pemasok)
- **Point of Sale (POS)** - Kasir

### Siapa yang Menggunakan Sistem Ini?

1. **Super Admin**: Mengelola supplier, sistem, dan monitoring keseluruhan
2. **Admin**: Mengelola inventori, transaksi, member sehari-hari
3. **Supplier**: Melihat status pesanan dan pembayaran
4. **Kasir**: Melakukan transaksi penjualan (POS)

---

## 🔐 CARA LOGIN

### Langkah-langkah Login:

1. **Buka Browser**
   - Chrome, Firefox, atau Edge
   - Buka: `http://[alamat-server]/login`
   - Contoh: `http://localhost:3000/login` (jika lokal)

2. **Masukkan Email & Password**
   ```
   Email: [email-anda]@umb.ac.id
   Password: [password-anda]
   ```

3. **Klik "Login"**
   - Tunggu beberapa detik
   - Sistem akan redirect ke dashboard sesuai role Anda

### Default Login (Pertama Kali):

**Super Admin**:
```
Email: superadmin@umb.ac.id
Password: Password123!
```

**Admin**:
```
Email: admin@umb.ac.id
Password: Password123!
```

**Supplier**:
```
Email: supplier@example.com
Password: Password123!
```

⚠️ **PENTING**: Ganti password setelah login pertama kali!

### Lupa Password?

1. Hubungi Admin sistem
2. Admin akan reset password Anda
3. Login dengan password baru
4. Segera ganti password di menu Pengaturan

---

## 👔 DASHBOARD SUPER ADMIN

### Apa yang Bisa Dilihat?

Dashboard Super Admin menampilkan:

1. **4 Kartu Statistik Utama**:
   - **Total Supplier**: Jumlah semua supplier
   - **Pending Approval**: Supplier menunggu persetujuan
   - **Payment Pending**: Supplier yang pembayarannya pending
   - **Total Produk**: Semua produk di sistem

2. **Tabel Supplier Terbaru**:
   - Nama bisnis supplier
   - Status (Active/Pending/Rejected)
   - Status pembayaran
   - Tanggal registrasi

3. **Statistik Sistem**:
   - Total Member
   - Total Produk
   - Stok Rendah
   - Revenue Bulan Ini

### Fitur-fitur Super Admin:

#### 1. Kelola Supplier
**Cara mengakses**:
- Klik tombol "Kelola Supplier" di Quick Actions
- Atau menu "Supplier" di sidebar

**Yang bisa dilakukan**:
- ✅ Approve/reject supplier baru
- ✅ Lihat detail supplier
- ✅ Verifikasi pembayaran supplier
- ✅ Edit informasi supplier
- ✅ Nonaktifkan supplier

**Langkah approve supplier**:
1. Buka "Kelola Supplier"
2. Cari supplier dengan status "Pending"
3. Klik tombol "Detail"
4. Review informasi supplier:
   - Nama bisnis
   - Kategori produk
   - Kontak
   - Bukti pembayaran (jika ada)
5. Klik "Approve" untuk setujui
6. Atau klik "Reject" untuk tolak (beri alasan)

#### 2. Monitoring Sistem
**Dashboard menampilkan**:
- Aktivitas terbaru
- Performa supplier
- Revenue tracking
- Alert stok rendah

#### 3. Laporan Bulanan
**Cara akses**:
- Klik "Laporan Bulanan" di header
- Pilih periode (bulan/tahun)
- Download PDF atau Excel

**Laporan mencakup**:
- Total penjualan
- Revenue per supplier
- Produk terlaris
- Member teraktif
- Financial summary

---

## 💼 DASHBOARD ADMIN

### Apa yang Bisa Dilihat?

Dashboard Admin menampilkan:

1. **4 Kartu Statistik**:
   - **Total Anggota**: Jumlah member
   - **Total Produk**: Produk aktif
   - **Stok Rendah**: Produk yang perlu restock
   - **Penjualan Hari Ini**: Revenue hari ini

2. **Aktivitas Terbaru**:
   - Member baru terdaftar
   - Produk baru ditambahkan
   - Transaksi terbaru

3. **Peringatan Stok**:
   - Produk dengan stok rendah
   - Produk yang hampir habis
   - Rekomendasi restock

### Fitur-fitur Admin:

#### 1. Daftar Anggota (Member)
**Cara akses**: Klik "Daftar Anggota" di Quick Actions

**Yang bisa dilakukan**:
- ✅ Tambah member baru
- ✅ Edit data member
- ✅ Lihat history transaksi member
- ✅ Kelola simpanan member
- ✅ Cetak kartu member

**Langkah tambah member**:
1. Klik "Tambah Member"
2. Isi form:
   - Nama lengkap
   - Nomor anggota (auto-generate)
   - Email
   - Telepon
   - Alamat
   - Simpanan pokok (wajib)
   - Simpanan wajib
3. Klik "Simpan"
4. Member langsung terdaftar

#### 2. Tambah Produk
**Cara akses**: Klik "Tambah Produk" di Quick Actions

**Yang bisa dilakukan**:
- ✅ Input produk baru
- ✅ Set harga jual & beli
- ✅ Tentukan kategori
- ✅ Pilih supplier
- ✅ Set stok awal
- ✅ Upload foto produk (opsional)

**Langkah tambah produk**:
1. Klik "Tambah Produk"
2. Isi informasi dasar:
   - Nama produk
   - Kategori (dropdown)
   - Supplier (dropdown)
3. Isi harga:
   - Harga beli (dari supplier)
   - Harga jual (ke customer)
   - Margin profit otomatis terhitung
4. Isi stok:
   - Stok awal
   - Minimum stok (untuk alert)
5. Pilih jenis kepemilikan:
   - **Toko**: Barang milik koperasi
   - **Titipan**: Barang konsinyasi
6. Pilih siklus stok:
   - **Harian**: Reset setiap hari (gorengan, dll)
   - **Mingguan**: Restock mingguan (keripik, dll)
   - **Dua Mingguan**: Restock 2 minggu (beras, dll)
7. Klik "Simpan"

#### 3. Laporan Keuangan
**Cara akses**: Klik "Laporan" di Quick Actions

**Jenis laporan**:
- **Harian**: Transaksi hari ini
- **Mingguan**: 7 hari terakhir
- **Bulanan**: Bulan berjalan
- **Custom**: Pilih range tanggal

**Yang ditampilkan**:
- Total omzet
- Total keuntungan
- Produk terjual
- Top 10 produk terlaris
- Chart penjualan

**Export laporan**:
- Klik tombol "Export"
- Pilih format: PDF atau Excel
- Laporan otomatis terdownload

#### 4. Transaksi/Kasir
**Cara akses**: Klik "Transaksi" di Quick Actions

**Mode kasir**:
1. Scan barcode produk (jika ada scanner)
2. Atau ketik nama produk di search
3. Pilih produk dari list
4. Atur quantity
5. Produk masuk ke keranjang
6. Ulangi untuk produk lain
7. Lihat total di summary
8. Pilih metode pembayaran:
   - Tunai (Cash)
   - Kartu Debit/Kredit
   - Transfer Bank
9. Input jumlah bayar
10. Sistem hitung kembalian
11. Klik "Proses Transaksi"
12. Cetak struk (opsional)

---

## 🏪 DASHBOARD SUPPLIER

### Apa yang Bisa Dilihat?

Dashboard Supplier menampilkan:

1. **4 Kartu Statistik**:
   - **Total Orders**: Pesanan yang masuk
   - **Pending Orders**: Pesanan pending
   - **Total Revenue**: Pendapatan
   - **Monthly Fee**: Biaya bulanan

2. **Payment Status**:
   - Next payment due (tanggal jatuh tempo)
   - Last payment date
   - Payment history

3. **Quick Actions**:
   - View Orders (lihat pesanan)
   - My Products (produk saya)
   - Edit Profile
   - Make Payment

### Fitur-fitur Supplier:

#### 1. View Orders
**Melihat pesanan dari koperasi**:
- Order ID
- Tanggal order
- Produk yang dipesan
- Quantity
- Total amount
- Status (Pending/Confirmed/Delivered)

**Update status**:
- Klik order
- Ubah status:
  - **Pending** → **Confirmed** (setelah terima order)
  - **Confirmed** → **Delivered** (setelah kirim)

#### 2. My Products
**Kelola produk yang Anda supply**:
- Lihat list produk
- Update harga (jika ada kesepakatan baru)
- Update ketersediaan
- Add new product (jika disetujui)

#### 3. Make Payment
**Bayar fee bulanan**:
1. Klik "Make Payment"
2. Lihat detail:
   - Amount due (Rp 25,000)
   - Due date
   - Payment method
3. Upload bukti transfer
4. Klik "Submit"
5. Wait for admin approval
6. Status berubah jadi "Paid Pending Approval"
7. Setelah diapprove → "Paid Approved"

---

## 📦 MANAJEMEN INVENTORI

### Menu Inventori

**Cara akses**: Sidebar → "Inventori"

### Fitur-fitur:

#### 1. List Produk
**Melihat semua produk**:
- Tabel dengan kolom:
  - Nama produk
  - Kategori
  - Supplier
  - Harga beli
  - Harga jual
  - Stok saat ini
  - Jenis kepemilikan (Toko/Titipan)
  - Siklus stok
  - Status (Active/Inactive)

**Filter produk**:
- By kategori (dropdown)
- By jenis (Toko/Titipan)
- By siklus (Harian/Mingguan/Dua Mingguan)
- Search by nama

**Pagination**:
- 10 items per halaman
- Navigasi: Previous/Next
- Jump to page

#### 2. Stock Movement
**Catat keluar-masuk barang**:

**Stock IN (Barang Masuk)**:
1. Klik "Stock IN"
2. Pilih produk (dropdown)
3. Input quantity
4. Input harga beli (jika berubah)
5. Pilih supplier
6. Catatan (opsional)
7. Klik "Submit"
8. Stok otomatis bertambah

**Stock OUT (Barang Keluar)**:
1. Klik "Stock OUT"
2. Pilih produk
3. Input quantity
4. Alasan (Penjualan/Retur/Rusak/Lainnya)
5. Catatan
6. Klik "Submit"
7. Stok otomatis berkurang
8. Jika alasan = Penjualan → otomatis create transaction

#### 3. Low Stock Alert
**Melihat produk yang perlu restock**:
- Filter: "Sembunyikan Habis"
- Produk dengan badge:
  - **Rendah** (kuning): Stok < min stock
  - **Kritis** (merah): Stok < 50% min stock
  - **Habis** (abu): Stok = 0

**Action**:
- Klik "Restock Now"
- Auto-open Stock IN form
- Produk sudah terpilih
- Tinggal input quantity

#### 4. Categories
**Kelola kategori produk**:
- Tambah kategori baru
- Edit nama kategori
- Delete kategori (jika tidak ada produk)

**Langkah tambah kategori**:
1. Klik "Add Category"
2. Input nama (contoh: "Sembako")
3. Deskripsi (opsional)
4. Klik "Save"

---

## 💰 MANAJEMEN KEUANGAN

### Menu Financial

**Cara akses**: Sidebar → "Financial"

### Fitur-fitur:

#### 1. Dashboard Keuangan
**Kartu metrics**:
- Total Omzet (Revenue)
- Total Keuntungan (Profit)
- Produk Terjual
- Margin Profit (%)

**Filter period**:
- Hari ini
- 7 hari terakhir
- 1 bulan
- 3 bulan
- 6 bulan
- 1 tahun
- Custom range

#### 2. Transaction History
**Lihat semua transaksi**:
- Transaction ID
- Tanggal & waktu
- Member (jika ada)
- Total amount
- Payment method
- Status (Completed/Pending/Cancelled)

**Filter**:
- By date range
- By payment method
- By status
- Search by transaction ID

**Detail transaksi**:
- Klik transaction row
- Lihat:
  - List items (produk yang dibeli)
  - Quantity masing-masing
  - Harga satuan
  - Subtotal
  - Total
  - Payment method
  - Cashier (user yang input)

#### 3. Financial Reports
**Generate laporan**:
1. Pilih type:
   - Daily Report
   - Weekly Report
   - Monthly Report
   - Custom Range
2. Pilih tanggal (untuk custom)
3. Klik "Generate"
4. Laporan tampil:
   - Summary metrics
   - Chart penjualan
   - Top products
   - Payment method breakdown
5. Export:
   - PDF (untuk print)
   - Excel (untuk analisis)

#### 4. Pembayaran Konsinyasi
**Track pembayaran ke consignor**:
- List consignor (supplier titipan)
- Total qty terjual
- Fee percentage
- Amount payable
- Last payment date
- Next payment due

**Proses pembayaran**:
1. Klik "Process Payment"
2. Review details
3. Upload bukti transfer
4. Klik "Submit"
5. Status: Paid
6. Generate payment receipt

---

## 👥 MANAJEMEN MEMBER

### Menu Membership

**Cara akses**: Sidebar → "Membership"

### Fitur-fitur:

#### 1. Member List
**Lihat semua member**:
- Nomor anggota
- Nama lengkap
- Email
- Telepon
- Status (Active/Inactive)
- Simpanan pokok
- Simpanan wajib
- Simpanan sukarela
- Total simpanan

**Action buttons**:
- View Detail
- Edit
- Cetak Kartu
- Transaksi History

#### 2. Add New Member
**Form fields**:
- **Personal Info**:
  - Nama lengkap *
  - Email *
  - Telepon *
  - Alamat *
  - Tanggal lahir
  - Jenis kelamin
- **Membership Info**:
  - Nomor anggota (auto)
  - Tanggal bergabung (auto)
  - Status (default: Active)
- **Simpanan**:
  - Simpanan Pokok * (Rp 100,000)
  - Simpanan Wajib (bulanan)
  - Simpanan Sukarela (opsional)

#### 3. Member Detail
**Informasi lengkap**:
- Tab 1: **Profile**
  - Data pribadi
  - Edit button
- Tab 2: **Simpanan**
  - Total simpanan
  - History setoran
  - Download statement
- Tab 3: **Transaksi**
  - Riwayat belanja
  - Total spending
  - Last transaction
- Tab 4: **Pinjaman** (future)
  - Status pinjaman
  - Angsuran

#### 4. Member Card
**Cetak kartu member**:
1. Klik "Cetak Kartu"
2. Preview kartu:
   - Foto member (jika ada)
   - Nomor anggota
   - Nama
   - Barcode/QR
3. Klik "Print"
4. Kartu tercetak (ukuran kartu ATM)

---

## 🔧 TROUBLESHOOTING

### Masalah Umum & Solusi:

#### 1. **Tidak Bisa Login**

**Symptoms**:
- Email/password salah
- Tombol login tidak merespon
- Error message muncul

**Solutions**:
```
✅ Cek email & password (case-sensitive)
✅ Pastikan caps lock OFF
✅ Clear browser cache: Ctrl + Shift + Delete
✅ Coba browser lain (Chrome/Firefox)
✅ Hubungi admin untuk reset password
```

#### 2. **Dashboard Blank/Putih**

**Symptoms**:
- Setelah login, halaman kosong
- Hanya loading terus

**Solutions**:
```
✅ Buka Console (F12)
✅ Lihat error message (warna merah)
✅ Clear localStorage:
   - Buka Console
   - Ketik: localStorage.clear()
   - Enter
   - Hard refresh: Ctrl + Shift + R
✅ Logout & login lagi
✅ Screenshot error & lapor ke admin
```

#### 3. **Data Tidak Muncul**

**Symptoms**:
- Dashboard kosong
- Tabel tidak ada data
- Angka semua 0

**Solutions**:
```
✅ Pastikan ada data di database
✅ Klik tombol "Muat Ulang" (jika ada)
✅ Refresh halaman: F5
✅ Logout & login lagi
✅ Cek koneksi internet
✅ Lapor ke admin jika persisten
```

#### 4. **Error Saat Input Data**

**Symptoms**:
- Form tidak bisa submit
- Error message: "Gagal menyimpan"
- Data tidak tersimpan

**Solutions**:
```
✅ Cek semua field wajib (*) sudah diisi
✅ Cek format input (email, angka, dll)
✅ Cek koneksi internet
✅ Coba lagi dalam 5 menit
✅ Screenshot error & lapor admin
```

#### 5. **Lambat/Lemot**

**Symptoms**:
- Halaman loading lama
- Tombol tidak responsif
- Timeout error

**Solutions**:
```
✅ Cek koneksi internet
✅ Close tab/aplikasi lain
✅ Clear browser cache
✅ Restart browser
✅ Gunakan Chrome (rekomendasi)
✅ Hubungi admin jika server down
```

#### 6. **Sesi Berakhir Terus**

**Symptoms**:
- Auto logout
- "Sesi berakhir" message
- Harus login terus-menerus

**Solutions**:
```
✅ Jangan tutup browser saat kerja
✅ Jangan buka multiple tabs
✅ Clear cookies & cache
✅ Pastikan "Remember me" dicentang
✅ Hubungi admin untuk extend session
```

---

## ❓ FAQ (Frequently Asked Questions)

### Umum:

**Q: Apa browser yang direkomendasikan?**  
A: Google Chrome versi terbaru. Firefox dan Edge juga didukung.

**Q: Bisa akses dari HP?**  
A: Ya, sistem mobile responsive. Bisa akses dari smartphone/tablet.

**Q: Ada aplikasi mobile?**  
A: Belum. Saat ini hanya web app. Rencana ada mobile app di 2026.

**Q: Data aman?**  
A: Ya. Semua data di-encrypt. Backup otomatis setiap hari.

### Login & Akses:

**Q: Lupa password, gimana?**  
A: Hubungi admin untuk reset. Nanti dapat email password baru.

**Q: Bisa ganti password sendiri?**  
A: Ya, di menu Pengaturan → Change Password.

**Q: Satu akun bisa login di banyak device?**  
A: Bisa, tapi hanya 1 session aktif. Login di device baru = logout otomatis di device lama.

### Data & Transaksi:

**Q: Bisa edit transaksi yang sudah selesai?**  
A: Tidak. Transaksi completed tidak bisa diedit (untuk audit trail). Bisa void transaksi & buat baru.

**Q: Kalau salah input stok, gimana?**  
A: Bisa adjustment. Menu Inventori → Stock Movement → Adjustment.

**Q: Data member bisa di-export?**  
A: Ya. Member List → tombol Export → pilih Excel/CSV.

### Laporan:

**Q: Bisa cetak laporan?**  
A: Ya. Generate laporan → Export PDF → Print.

**Q: Laporan bisa kirim email otomatis?**  
A: Belum. Fitur email otomatis masih development.

**Q: History transaksi berapa lama disimpan?**  
A: Permanen. Semua data tersimpan untuk audit.

### Technical:

**Q: Koneksi internet wajib?**  
A: Ya. Sistem berbasis cloud, butuh internet untuk akses.

**Q: Offline mode ada?**  
A: Belum. Planned untuk versi 2.0 (2026).

**Q: Bisa integrasi dengan sistem lain?**  
A: Ya, via API. Hubungi developer untuk dokumentasi API.

---

## 📞 BANTUAN & SUPPORT

### Kontak Tim Support:

**Admin Sistem**:
- Email: admin@koperasi-umb.ac.id
- WhatsApp: +62 xxx-xxxx-xxxx
- Jam kerja: Senin-Jumat, 08:00-17:00 WIB

**Developer/IT**:
- Email: it@koperasi-umb.ac.id
- GitHub Issues: [link]
- Response time: 1-2 hari kerja

### Sebelum Hubungi Support:

**Siapkan informasi**:
1. Screenshot error (jika ada)
2. Browser & versi (contoh: Chrome 118)
3. Device (PC/laptop/HP)
4. Langkah yang sudah dicoba
5. Waktu kejadian error

**Format laporan**:
```
Subject: [Error] Nama masalah

Deskripsi:
- Apa yang terjadi:
- Kapan kejadian:
- Sudah coba apa:
- Screenshot: [attach]

User:
- Email login:
- Role: (Admin/Supplier)
- Browser: Chrome 118
```

---

## 📝 CATATAN AKHIR

### Update & Maintenance:

- **Update sistem**: Setiap hari Minggu, 02:00-05:00 WIB
- **Backup data**: Otomatis setiap hari, 00:00 WIB
- **Downtime**: Minimal, notif via email jika ada

### Tips Penggunaan:

1. ✅ Selalu logout setelah selesai
2. ✅ Jangan share password
3. ✅ Ganti password berkala (3 bulan)
4. ✅ Bookmark halaman untuk akses cepat
5. ✅ Clear cache jika lambat
6. ✅ Gunakan Chrome untuk performa terbaik
7. ✅ Backup data penting secara manual juga
8. ✅ Laporkan bug/error untuk perbaikan

---

**Versi Dokumen**: 1.0  
**Terakhir Diupdate**: 19 Oktober 2025  
**Penulis**: Tim Developer Koperasi UMB  
**Feedback**: Kirim ke admin@koperasi-umb.ac.id

---

🎉 **SELAMAT MENGGUNAKAN SISTEM KOPERASI UMB!** 🎉
