# 📋 SISTEM DIGITALISASI KOPERASI UM BANDUNG# 📋 SISTEM DIGITALISASI KOPERASI UM BANDUNG



**Unit:** BSM Mart & USPPS BSM  **Unit:** BSM Mart & USPPS BSM  

**Tim:** Digitalisasi Koperasi  **Tim:** Digitalisasi Koperasi  

**Dokumen:** Requirement Analysis & Implementation Tracking  **Dokumen:** Requirement Analysis & Implementation Tracking  

**Update Terakhir:** 20 Oktober 2025, 22:00 WIB**Update Terakhir:** 20 Oktober 2025



------



## 📊 EXECUTIVE SUMMARY## 📊 EXECUTIVE SUMMARY



Daftar sistem/aplikasi yang perlu dibangun untuk Koperasi UM Bandung (unit BSM Mart & USPPS BSM), disertai penjelasan istilah dalam Bahasa Indonesia & Inggris. Daftar sistem/aplikasi yang perlu dibangun untuk Koperasi UM Bandung (unit BSM Mart & USPPS BSM), disertai penjelasan istilah dalam Bahasa Indonesia & Inggris. 



**Fokus:** Apa yang harus dibuat oleh tim digitalisasi, untuk apa, fitur minimal, dan bagaimana saling terhubung.**Fokus:** Apa yang harus dibuat oleh tim digitalisasi, untuk apa, fitur minimal, dan bagaimana saling terhubung.



**Total Sistem:** 17 sistem utama  ---

**Status Saat Ini:** 6 sistem partial implemented, 11 sistem belum dimulai

## 🎯 IMPLEMENTATION STATUS LEGEND

---

- ✅ **IMPLEMENTED** - Sudah selesai dan production-ready

## 🎯 IMPLEMENTATION STATUS LEGEND- 🟡 **PARTIAL** - Sebagian fitur sudah ada, perlu enhancement

- ⏳ **IN PROGRESS** - Sedang dikerjakan

- ✅ **IMPLEMENTED** - Sudah selesai dan production-ready- 📋 **PLANNED** - Sudah direncanakan, belum mulai

- 🟡 **PARTIAL** - Sebagian fitur sudah ada, perlu enhancement- ❌ **NOT STARTED** - Belum ada implementasi sama sekali

- ⏳ **IN PROGRESS** - Sedang dikerjakan

- 📋 **PLANNED** - Sudah direncanakan, belum mulai---

- ❌ **NOT STARTED** - Belum ada implementasi sama sekali

## 1️⃣ SISTEM KASIR & PENJUALAN (POS - Point of Sale)

---

**Status:** 🟡 **PARTIAL** (Basic features ✅, Advanced features ❌)

## 1️⃣ SISTEM KASIR & PENJUALAN (POS - Point of Sale)

### 📌 Tujuan:

**Status:** 🟡 **PARTIAL** (Basic features ✅, Advanced features ❌)Mencatat transaksi ritel di toko, cetak struk, kelola diskon, multi-metode pembayaran.



### 📌 Tujuan:### 📚 Istilah:

Mencatat transaksi ritel di toko, cetak struk, kelola diskon, multi-metode pembayaran.- **POS (Point of Sale)** = Titik Penjualan (aplikasi kasir)

- **Receipt** = Struk belanja

### 📚 Istilah:- **Void** = Pembatalan transaksi

- **POS (Point of Sale)** = Titik Penjualan (aplikasi kasir)- **Refund** = Pengembalian dana

- **Receipt** = Struk belanja- **SKU** = Stock Keeping Unit (kode unik barang)

- **Void** = Pembatalan transaksi

- **Refund** = Pengembalian dana### ✅ Fitur Yang Sudah Ada:

- **SKU** = Stock Keeping Unit (kode unik barang)- [x] Keranjang belanja dengan add/remove produk

- [x] Multi-metode pembayaran (CASH, TRANSFER, CREDIT_CARD)

### ✅ Fitur Yang Sudah Ada:- [x] Diskon per item (percentage & fixed)

- [x] Keranjang belanja dengan add/remove produk- [x] Catatan transaksi (customer name, notes)

- [x] Multi-metode pembayaran (CASH, TRANSFER, CREDIT_CARD)- [x] Kalkulasi otomatis (subtotal, tax, total, change)

- [x] Diskon per item (percentage & fixed)- [x] Stok otomatis berkurang (via stock_movements)

- [x] Catatan transaksi (customer name, notes)- [x] History transaksi lengkap

- [x] Kalkulasi otomatis (subtotal, tax, total, change)- [x] Data isolation (DEV/PROD mode)

- [x] Stok otomatis berkurang (via stock_movements)- [x] Activity logging audit trail

- [x] History transaksi lengkap

- [x] Data isolation (DEV/PROD mode)### ❌ Fitur Yang Belum Ada:

- [x] Activity logging audit trail- [ ] Scan barcode produk

- [ ] Park/recall transaksi (simpan sementara)

### ❌ Fitur Yang Belum Ada:- [ ] Split payment (2+ metode)

- [ ] Scan barcode produk- [ ] Cetak struk thermal printer

- [ ] Park/recall transaksi (simpan sementara)- [ ] Retur/refund transaksi

- [ ] Split payment (2+ metode)- [ ] Void transaksi

- [ ] Cetak struk thermal printer- [ ] Offline mode (PWA)

- [ ] Retur/refund transaksi

- [ ] Void transaksi### 🔗 I/O & Integrasi:

- [ ] Offline mode (PWA)**Input:**

- [ ] Cash drawer integration- ✅ Master produk dari Inventory

- [ ] End of day report (laporan tutup kasir)- ✅ Harga dari products.price



### 🔗 I/O & Integrasi:**Output:**

**Input:**- ✅ Data penjualan → transactions table

- ✅ Master produk dari Inventory- ✅ Stock movements → stock_movements

- ✅ Harga dari products.price- 🟡 Auto-journal → Accounting (belum full)

- 🟡 Price list multi-tier (belum ada)- ❌ Data → Loyalty system

- 🟡 Data → BI Dashboard (partial)

**Output:**

- ✅ Data penjualan → transactions table**Integrasi:**

- ✅ Stock movements → stock_movements- ❌ QRIS/Payment Gateway

- 🟡 Auto-journal → Accounting (belum full)- ❌ Offline POS (PWA)

- ❌ Data → Loyalty system

- 🟡 Data → BI Dashboard (partial)📁 **Files:** `app/koperasi/pos/page.tsx`, `app/api/pos/transaction/route.ts`



**Integrasi:**## 2️⃣ SISTEM MANAJEMEN PERSEDIAAN (Inventory & Stock Management)

- ❌ QRIS/Payment Gateway

- ❌ Offline POS (PWA)**Status:** 🟡 **PARTIAL** (Basic CRUD ✅, Advanced features ❌)



📁 **Files:** `app/koperasi/pos/page.tsx`, `app/api/pos/transaction/route.ts`### 📌 Tujuan:

Mengelola SKU, stok per lokasi, opname, valuasi (FIFO/FEFO).

---

### 📚 Istilah:

## 2️⃣ SISTEM MANAJEMEN PERSEDIAAN (Inventory & Stock Management)- **SKU (Stock Keeping Unit)** = Kode barang unik

- **Stock on hand** = Stok tersedia saat ini

**Status:** 🟡 **PARTIAL** (Basic CRUD ✅, Advanced features ❌)- **Stock opname** = Penghitungan fisik stok

- **FIFO** = First In First Out

### 📌 Tujuan:- **FEFO** = First Expire First Out

Mengelola SKU, stok per lokasi, opname, valuasi (FIFO/FEFO).

### ✅ Fitur Yang Sudah Ada:

### 📚 Istilah:- [x] Master produk (products table)

- **SKU (Stock Keeping Unit)** = Kode barang unik- [x] Kategori produk (categories)

- **Stock on hand** = Stok tersedia saat ini- [x] Stok tracking (stock field)

- **Stock opname** = Penghitungan fisik stok- [x] Stock movements (IN/OUT/ADJUSTMENT)

- **FIFO** = First In First Out- [x] Barcode/SKU field

- **FEFO** = First Expire First Out- [x] Harga pokok (cost) & jual (price)

- **Reorder point** = Titik pemesanan ulang- [x] Status aktif/non-aktif



### ✅ Fitur Yang Sudah Ada:### ❌ Fitur Yang Belum Ada:

- [x] Master produk (products table)- [ ] Multi-lokasi/gudang

- [x] Kategori produk (categories)- [ ] Batch & expiry date tracking

- [x] Stok tracking (stock field)- [ ] Minimum stock & reorder point alert

- [x] Stock movements (IN/OUT/ADJUSTMENT)- [ ] Stock opname (physical vs system)

- [x] Barcode/SKU field- [ ] Transfer antar gudang dengan approval

- [x] Harga pokok (cost) & jual (price)- [ ] FIFO/FEFO costing

- [x] Status aktif/non-aktif- [ ] Penyesuaian stok approval flow

- [ ] Stok reserved

### ❌ Fitur Yang Belum Ada:- [ ] Bundling/BOM products

- [ ] Multi-lokasi/gudang

- [ ] Batch & expiry date tracking### 🔗 I/O & Integrasi:

- [ ] Minimum stock & reorder point alert**Input:**

- [ ] Stock opname (physical vs system)- ✅ Stok berkurang dari POS otomatis

- [ ] Transfer antar gudang dengan approval- 🟡 Penerimaan dari Purchasing (belum ada)

- [ ] FIFO/FEFO costing calculation

- [ ] Penyesuaian stok approval flow**Output:**

- [ ] Stok reserved (untuk order pending)- ✅ Kartu stok (stock_movements)

- [ ] Bundling/kit products (BOM - Bill of Materials)- 🟡 Nilai persediaan → Accounting (manual)

- ❌ Alert stok menipis

### 🔗 I/O & Integrasi:

**Input:**📁 **Files:** `app/koperasi/inventory/page.tsx`, `app/api/products/route.ts`

- ✅ Stok berkurang dari POS otomatis

- 🟡 Penerimaan dari Purchasing/GR (belum ada)## 3️⃣ SISTEM PEMBELIAN & PEMASOK (Purchasing & Supplier)

- ❌ Transfer masuk dari gudang lain

**Status:** 🟡 **PARTIAL** (Supplier data ✅, PO/GR ❌)

**Output:**

- ✅ Kartu stok (stock_movements table)### 📌 Tujuan:

- 🟡 Nilai persediaan → Accounting (manual)Kelola Purchase Order (PO), penerimaan barang (GR), invoice pemasok, retur, konsinyasi.

- ❌ Alert stok menipis (notification)

- ✅ Data produk → POS (real-time)### 📚 Istilah:

- **PO (Purchase Order)** = Pesanan pembelian

📁 **Files:** `app/koperasi/inventory/page.tsx`, `app/api/products/route.ts`, `app/api/categories/route.ts`- **GR (Goods Receipt)** = Penerimaan barang

- **Consignment** = Titip jual/konsinyasi

---- **AP (Accounts Payable)** = Hutang dagang



## 3️⃣ SISTEM PEMBELIAN & PEMASOK (Purchasing & Supplier)### ✅ Fitur Yang Sudah Ada:

- [x] Master supplier (suppliers table)

**Status:** 🟡 **PARTIAL** (Supplier data ✅, PO/GR ❌)- [x] Supplier info lengkap

- [x] Supplier login untuk konsinyasi

### 📌 Tujuan:- [x] Supplier products tracking

Kelola Purchase Order (PO), penerimaan barang (GR), invoice pemasok, retur, konsinyasi.- [x] Consignment sales tracking



### 📚 Istilah:### ❌ Fitur Yang Belum Ada:

- **PO (Purchase Order)** = Pesanan pembelian- [ ] Purchase Order (PO) creation

- **GR (Goods Receipt)** = Penerimaan barang- [ ] PO approval workflow

- **Consignment** = Titip jual/konsinyasi- [ ] Goods Receipt (GR) dari PO

- **AP (Accounts Payable)** = Hutang dagang- [ ] GR → update HPP otomatis

- **HPP/COGS** = Harga Pokok Penjualan- [ ] Retur pembelian

- [ ] Payment terms (NET 30/60)

### ✅ Fitur Yang Sudah Ada:- [ ] Supplier invoice matching

- [x] Master supplier (suppliers table)- [ ] Hutang dagang tracking

- [x] Supplier info lengkap (name, contact, email, phone)- [ ] Supplier performance report

- [x] Supplier login untuk konsinyasi

- [x] Supplier products tracking### 🔗 I/O & Integrasi:

- [x] Consignment sales tracking**Output:**

- ❌ Update stok & HPP dari GR

### ❌ Fitur Yang Belum Ada:- ❌ Hutang dagang → Accounting

- [ ] Purchase Order (PO) creation & approval- 🟡 Consignment sales → Supplier dashboard

- [ ] PO tracking (status: draft, submitted, approved, received)

- [ ] Goods Receipt (GR) dari PO📁 **Files:** `app/koperasi/supplier/page.tsx`, `app/api/suppliers/route.ts`  

- [ ] GR → update HPP otomatis❌ **MISSING:** `purchase_orders`, `goods_receipts` tables

- [ ] Retur pembelian (return to supplier)

- [ ] Payment terms (NET 30, NET 60, COD)---

- [ ] Supplier invoice matching dengan PO/GR

- [ ] Hutang dagang tracking## 4️⃣ SISTEM HARGA & PROMOSI (Pricing & Promotion Engine)

- [ ] Supplier performance report

- [ ] Konsinyasi settlement otomatis**Status:** ❌ **NOT STARTED**



### 🔗 I/O & Integrasi:### 📌 Tujuan:

**Input:**Menetapkan price list, aturan promo fleksibel, voucher/kupon.

- ❌ PO approval workflow

- ❌ Delivery note dari supplier### 📚 Istilah:

- **Price list** = Daftar harga multi-tier

**Output:**- **Markdown** = Diskon

- ❌ Update stok & HPP dari GR- **Bundle** = Paket produk

- ❌ Hutang dagang → Accounting- **Flash sale** = Promo kilat waktu terbatas

- 🟡 Consignment sales → Supplier dashboard (partial)

### ❌ Fitur Yang Dibutuhkan:

📁 **Files:** `app/koperasi/supplier/page.tsx`, `app/api/suppliers/route.ts`, `app/api/consignment-sales/route.ts`  - [ ] Multi price list (anggota/umum)

❌ **MISSING:** `purchase_orders`, `po_items`, `goods_receipts` tables- [ ] Aturan promo (buy X get Y, % discount, nominal)

- [ ] Happy hour pricing (diskon jam tertentu)

---- [ ] Kuota promo (limited quantity)

- [ ] Periode promo (start & end date)

## 4️⃣ SISTEM HARGA & PROMOSI (Pricing & Promotion Engine)- [ ] Voucher/kupon unik (single use)

- [ ] Simulasi promo (test sebelum aktif)

**Status:** ❌ **NOT STARTED**- [ ] Promo stacking rules



### 📌 Tujuan:### 🔗 I/O & Integrasi:

Menetapkan price list, aturan promo fleksibel, voucher/kupon.**Output:**

- ❌ Push harga & promo rules ke POS

### 📚 Istilah:- ❌ Kalkulasi promo real-time saat transaksi

- **Price list** = Daftar harga multi-tier (member/non-member)

- **Markdown** = Diskon📁 **Files to Create:** `app/koperasi/pricing/page.tsx`, `app/api/promotions/route.ts`  

- **Bundle** = Paket produk❌ **MISSING:** `price_lists`, `promotions`, `vouchers` tables

- **Flash sale** = Promo kilat waktu terbatas

- **Happy hour** = Promo jam tertentu---



### ❌ Fitur Yang Dibutuhkan:## 5️⃣ SISTEM ANGGOTA & LOYALTI (Membership & Loyalty)

- [ ] Multi price list (anggota vs umum)

- [ ] Aturan promo (buy X get Y, % discount, nominal discount)**Status:** 🟡 **PARTIAL** (Members data ✅, Loyalty system ❌)

- [ ] Bundle pricing (paket hemat)

- [ ] Happy hour (diskon waktu tertentu)### 📌 Tujuan:

- [ ] Kuota promo (limited quantity)Mengelola profil anggota, poin loyalitas, tier membership, kupon targeted.

- [ ] Periode promo (start & end date)

- [ ] Voucher/kupon unik (single use)### 📚 Istilah:

- [ ] Simulasi promo (test sebelum aktif)- **Loyalty points** = Poin loyalitas

- [ ] Promo stacking rules (boleh/tidak kombinasi)- **Tier** = Level keanggotaan (Silver, Gold, Platinum)

- **Redemption** = Penukaran poin

### 🔗 I/O & Integrasi:- **Cohort** = Kelompok anggota berdasarkan karakteristik

**Output:**

- ❌ Push harga & promo rules ke POS### ✅ Fitur Yang Sudah Ada:

- ❌ Kalkulasi promo real-time saat transaksi- [x] Master members (members table)

- [x] Member info (name, email, phone, student_id)

📁 **Files to Create:** `app/koperasi/pricing/page.tsx`, `app/api/price-lists/route.ts`, `app/api/promotions/route.ts`  - [x] Member login & authentication

❌ **MISSING:** `price_lists`, `promotions`, `promotion_rules`, `vouchers` tables- [x] Member type (MAHASISWA, DOSEN, TENDIK, UMUM)



---### ❌ Fitur Yang Belum Ada:

- [ ] Loyalty points accumulation per transaksi

## 5️⃣ SISTEM ANGGOTA & LOYALTI (Membership & Loyalty)- [ ] Point redemption (tukar poin)

- [ ] Tiering system (auto upgrade)

**Status:** 🟡 **PARTIAL** (Members data ✅, Loyalty system ❌)- [ ] Member birthday campaign

- [ ] Member deposit (syariah-compliant)

### 📌 Tujuan:- [ ] Targeted coupons based on segment

Mengelola profil anggota, poin loyalitas, tier membership, kupon targeted.- [ ] Member referral program

- [ ] Member activity history

### 📚 Istilah:

- **Loyalty points** = Poin loyalitas### 🔗 I/O & Integrasi:

- **Tier** = Level keanggotaan (Silver, Gold, Platinum)**Input:**

- **Redemption** = Penukaran poin- ❌ Transaksi POS → Hitung poin

- **Cohort** = Kelompok anggota berdasarkan waktu/perilaku

**Output:**

### ✅ Fitur Yang Sudah Ada:- ❌ Member benefits → POS (apply discount)

- [x] Master members (members table)- ❌ Segmentation → CRM (broadcast)

- [x] Member info (name, email, phone, student_id)

- [x] Member login & authentication📁 **Files:** Database `members` table ✅ exists  

- [x] Member type (MAHASISWA, DOSEN, TENDIK, UMUM)❌ **MISSING:** `loyalty_points`, `loyalty_transactions`, `member_tiers`, `vouchers` tables



### ❌ Fitur Yang Belum Ada:---

- [ ] Loyalty points accumulation per transaksi

- [ ] Point redemption (tukar poin dengan produk/diskon)## 6️⃣ SISTEM PEMBAYARAN & QRIS (Payments Gateway Adapter)

- [ ] Tiering system (automatic upgrade based on spending)

- [ ] Member birthday campaign**Status:** ❌ **NOT STARTED**

- [ ] Member deposit (saldo anggota - optional, syariah-compliant)

- [ ] Targeted coupons berdasarkan segment### 📌 Tujuan:

- [ ] Member referral programIntegrasi pembayaran non-tunai (QRIS, e-wallet, kartu debit/kredit).

- [ ] Member activity history

### 📚 Istilah:

### 🔗 I/O & Integrasi:- **Payment gateway** = Gerbang pembayaran

**Input:**- **Settlement** = Penyelesaian dana (transfer dari gateway ke merchant)

- ❌ Transaksi POS → Hitung poin- **MDR (Merchant Discount Rate)** = Biaya layanan (% per transaksi)

- **QRIS** = Quick Response Code Indonesian Standard

**Output:**

- ❌ Member benefits → POS (apply discount/voucher)### ❌ Fitur Yang Dibutuhkan:

- ❌ Segmentation → CRM (broadcast targeting)- [ ] Generate QRIS code per transaksi

- [ ] Check payment status

📁 **Files:** Database `members` table ✅ exists  - [ ] Rekonsiliasi settlement harian

❌ **MISSING:** `loyalty_points`, `loyalty_transactions`, `member_tiers`, `vouchers` tables- [ ] Refund/void pembayaran

- [ ] Catat MDR ke COA biaya

---- [ ] Multi-gateway support



## 6️⃣ SISTEM PEMBAYARAN & QRIS (Payments Gateway Adapter)### 🔗 I/O & Integrasi:

- ❌ POS (frontline payment)

**Status:** ❌ **NOT STARTED**- ❌ Accounting (auto-journal settlement)



### 📌 Tujuan:📁 **Files to Create:** `app/api/payments/qris/route.ts`  

Integrasi pembayaran non-tunai (QRIS, e-wallet, kartu debit/kredit).❌ **MISSING:** `payment_transactions`, `settlements` tables



### 📚 Istilah:---

- **Payment gateway** = Gerbang pembayaran

- **Settlement** = Penyelesaian dana (transfer dari gateway ke merchant)## 7️⃣ SISTEM AKUNTANSI KOPERASI (Accounting & Tax)

- **MDR (Merchant Discount Rate)** = Biaya layanan (% per transaksi)

- **QRIS** = Quick Response Code Indonesian Standard**Status:** 🟡 **PARTIAL** (Manual entry ✅, Auto-journal ❌)

- **Callback/Webhook** = Notifikasi status pembayaran

### 📌

### ❌ Fitur Yang Dibutuhkan:Tujuan: Jurnal otomatis dari transaksi operasi, laporan keuangan segmen BSM Mart/USPPS. Istilah:

- [ ] Generate QRIS code per transaksiCOA (Chart of Accounts) = Bagan akun, Ledger = Buku besar, Trial balance = Neraca saldo Fitur minimum: COA koperasi, auto-journal (penjualan, COGS, persediaan, retur, settlement, penyesuaian), Neraca, Laba-Rugi, Arus Kas, locking periode. Integrasi: konsumsi event dari POS, Inventory, Purchasing, USPPS.

- [ ] Check payment status (pending/success/failed)

- [ ] Rekonsiliasi settlement harian8) Sistem Inti USPPS Syariah (Sharia Microfinance Core)

- [ ] Refund/void pembayaranTujuan: Mengelola produk pembiayaan & simpanan sesuai syariah. Istilah:

- [ ] Catat MDR ke COA biayaMurabahah (jual beli dengan margin), Ijarah (sewa), Qardh (pinjaman kebajikan)

- [ ] Multi-gateway support (Midtrans, Xendit, dll)Installment = Angsuran, DPD (Days Past Due) = Hari tunggakan, NPF = Non-Performing Financing Fitur minimum: pencatatan akad, jadwal angsuran, posting marjin/ujrah, pelunasan/penalti ta’zir (dialokasikan sesuai fatwa), restruktur, simpanan anggota (jika ada bagi hasil). Integrasi: Accounting (skema jurnal syariah), CRM/Notifikasi (pengingat jatuh tempo).

- [ ] Payment retry mechanism

- [ ] Payment expiry handling9) Sistem Penilaian Risiko & KYC (Risk, Scoring & KYC)

Tujuan: Verifikasi dasar anggota dan penilaian kelayakan pembiayaan. Istilah:

### 🔗 I/O & Integrasi:KYC (Know Your Customer) = Kenali nasabah; Credit scoring = Skor kelayakan Fitur minimum: unggah KTP/selfie, validasi dasar, parameter skor sederhana (pendapatan, histori, kedisiplinan bayar), limit, alur persetujuan 2-eyes/4-eyes, audit trail.

**Integration:**

- ❌ POS (frontline payment)10) Sistem Omnichannel & Katalog Online (Headless Commerce)

- ❌ Accounting (auto-journal settlement & MDR)Tujuan: Jual online (klik-ambil/pengantaran), tampilkan stok real-time, hub marketplace. Istilah:

Headless API = API tanpa front-end terikat, Click & collect = Pesan online, ambil di toko Fitur minimum: katalog & stok per outlet, keranjang, checkout, status order, ongkir radius. Integrasi: POS (sinkron harga/produk), Inventory (stok), Payment (jika bayar online).

📁 **Files to Create:** `app/api/payments/qris/route.ts`, `app/api/payments/callback/route.ts`, `lib/payment-gateway-adapter.ts`  

❌ **MISSING:** `payment_transactions`, `settlements` tables11) Sistem Gudang & Pemenuhan (Warehouse & Fulfillment)

Tujuan: Kendali stok pusat & toko, perpindahan, FEFO/expiry. Istilah:

---FEFO (First-Expire, First-Out) = Kadaluarsa terdahulu keluar lebih dulu Fitur minimum: multi-gudang, transfer/approval, picking-packing, expiry alert, log pergerakan.



## 7️⃣ SISTEM AKUNTANSI KOPERASI (Accounting & Tax)12) Sistem PPOB & Layanan Tambahan (PPOB Aggregator Adapter)

Tujuan: Menjual pulsa/data/token/PDAM dlsb. Istilah:

**Status:** 🟡 **PARTIAL** (Manual entry ✅, Auto-journal ❌)Bill inquiry = Cek tagihan, Callback = Notifikasi balik Fitur minimum: inquiry, payment, callback, margin kontrol, anti-duplikasi transaksi. Integrasi: POS/e-commerce untuk alur pembelian.



### 📌 Tujuan:13) Sistem Layanan Pelanggan & Tiket (CRM & Ticketing)

Jurnal otomatis dari transaksi operasi, laporan keuangan segmen BSM Mart/USPPS.Tujuan: Kelola keluhan/saran, SLA, kampanye WA/Email/SMS. Istilah:

Ticket = Tiket keluhan, SLA = Standar waktu layanan, Broadcast = Siaran pesan Fitur minimum: formulir keluhan, penugasan, status, templat jawaban; segmentasi & broadcast berbasis cohort (anggota baru, ulang tahun, telat angsuran).

### 📚 Istilah:

- **COA (Chart of Accounts)** = Bagan akun14) Sistem Pelaporan & BI (Reporting & Business Intelligence)

- **Ledger / General Ledger** = Buku besarTujuan: Dashboard operasional & analitik manajerial. Istilah:

- **Trial balance** = Neraca saldoGMROI (Gross Margin Return on Inventory) = Pengembalian marjin atas persediaan

- **Closing period** = Tutup buku periodeCohort analysis = Analisis kelompok waktu Fitur minimum:

- **P&L (Profit & Loss)** = Laba RugiRitel: penjualan per jam/hari/outlet, top SKU, basket size, GMROI.

- **Balance Sheet** = NeracaUSPPS: outstanding, DPD aging, collection rate, NPF.

Laporan P&L segmen, efektivitas promo, ekspor Excel/CSV. Integrasi: data pipeline harian (ETL/ELT) ke data warehouse kecil.

### ✅ Fitur Yang Sudah Ada:

- [x] Financial dashboard dengan summary15) Sistem Admin, Akses & Audit (Admin Console, RBAC & Audit Trail)

- [x] Income tracking (manual)Tujuan: Hak akses granular & jejak perubahan. Istilah:

- [x] Expense tracking (manual)RBAC (Role-Based Access Control) = Kontrol akses berbasis peran

- [x] Cash flow view (basic)Audit trail = Jejak audit Fitur minimum: peran (Kasir, Gudang, Purchasing, Accounting, USPPS, Manager, Auditor), kebijakan password/SSO, log aktivitas, penguncian periode.

- [x] Financial reports (summary)

16) Pusat Dokumen & Arsip (Document Management)

### ❌ Fitur Yang Belum Ada:Tujuan: Menyimpan dokumen resmi terstruktur & aman. Istilah:

- [ ] COA koperasi (complete chart of accounts)Versioning = Versi dokumen, Watermark = Tanda air Fitur minimum: unggah akad, PO, faktur, bukti transfer; tag/kategori, izin akses, penomoran, pencarian.

- [ ] Auto-journal dari POS (sales, COGS, inventory)

- [ ] Auto-journal dari Purchasing (AP, inventory)17) Layanan Notifikasi (Notification Service)

- [ ] Auto-journal dari USPPS (financing income)Tujuan: Kirim pemberitahuan event-driven. Istilah:

- [ ] General Ledger dengan detail transactionsEvent bus = Pengantara event, Reminder = Pengingat Fitur minimum: template pesan dinamis, kanal WA/Email/SMS/app, jadwal ulang (retry), throttle & log pengiriman. Contoh event: stok menipis, penjualan besar, due date angsuran, settlement gagal, error aplikasi.

- [ ] Trial Balance report

- [ ] Balance Sheet (Neraca)Peran & Tanggung Jawab (ringkas)

- [ ] P&L segmented (BSM Mart vs USPPS)Kasir/Store Crew: POS, retur, penutupan kas.

- [ ] Cash Flow Statement (detailed)Gudang: penerimaan, transfer, opname.

- [ ] Period locking (prevent edit after close)Purchasing: PO, negosiasi, konsinyasi.

- [ ] Tax calculation (PPh, PPN)Accounting: rekonsiliasi, laporan, tutup buku.

- [ ] Audit trail untuk journal entriesUSPPS Officer: akad, pencairan, penagihan.

Customer Care: CRM/tiket, broadcast.

### 🔗 I/O & Integrasi:Manajer: persetujuan, KPI, BI.

**Input:**Auditor: akses baca + audit trail.

- ❌ Events dari POS (sales, returns)

- ❌ Events dari Inventory (stock movements)Integrasi & Alur Data (gambaran)

- ❌ Events dari Purchasing (PO, GR)Master Produk & Harga (Pricing/Inventory) → POS & E-Commerce

- ❌ Events dari USPPS (installments)Penjualan POS → Inventory (kurangi stok) → Accounting (auto-journal) → Loyalty (poin) → BI

PO → GR → Inventory (stok & HPP) → Accounting (AP/Hutang)

**Output:**USPPS (akad/angsuran) → Accounting (posting marjin/ujrah) → Notifikasi (reminder) → BI

- 🟡 Laporan keuangan untuk management (partial)Payments (QRIS) → Accounting (rekon settlement & MDR)



📁 **Files:** `app/koperasi/financial/page.tsx`, `app/api/financial/summary/route.ts`  Contoh Skema Data Minimum (nama tabel inti)

❌ **MISSING:** `chart_of_accounts`, `journal_entries`, `journal_lines`, `periods` tablesRitel: products, product_prices, inventory_stocks, sales, sale_items, suppliers, purchase_orders, po_items, goods_receipts, returns

Keanggotaan: members, loyalty_points, vouchers

---Keuangan: chart_of_accounts, journal_entries, journal_lines, settlements

USPPS: financing_contracts, installments, savings_accounts, savings_transactions

## 8️⃣ SISTEM INTI USPPS SYARIAH (Sharia Microfinance Core)Lainnya: users, roles, permissions, audit_logs, documents, notifications



**Status:** ❌ **NOT STARTED**Contoh Endpoint API (ringkas & praktis)

Inventory

### 📌 Tujuan:GET /api/products?query= — cari produk

Mengelola produk pembiayaan & simpanan sesuai prinsip syariah.POST /api/products — buat/ubah produk

POST /api/stock/adjust — penyesuaian stok

### 📚 Istilah:POST /api/stock/transfer — transfer antar lokasi

- **Murabahah** = Jual beli dengan margin keuntunganPOS Adapter

- **Ijarah** = Sewa/leasing syariahPOST /api/pos/sales — terima transaksi dari POS eksternal

- **Qardh** = Pinjaman kebajikan (tanpa bunga)POST /api/pos/products/push — kirim master produk/harga ke POS

- **Installment / Angsuran** = CicilanPOST /api/pos/webhook — webhook penjualan (jika POS mendukung)

- **DPD (Days Past Due)** = Hari keterlambatanUSPPS

- **NPF (Non-Performing Financing)** = Pembiayaan bermasalahPOST /api/uspps/contracts — buat akad

- **Ta'zir** = Denda keterlambatan (dialokasikan untuk sosial)POST /api/uspps/installments/pay — bayar angsuran

GET /api/uspps/aging — aging & DPD

### ❌ Fitur Yang Dibutuhkan:Accounting

- [ ] Pencatatan akad (contract recording)GET /api/accounting/reports/pl?segment= — Laba-Rugi per segmen

- [ ] Produk pembiayaan (Murabahah, Ijarah, Qardh)POST /api/accounting/close-period — tutup periode

- [ ] Jadwal angsuran calculation

- [ ] Posting margin/ujrah per periodeNon-Fungsional (wajib disiapkan)

- [ ] Pembayaran angsuran trackingKeamanan: JWT + rotasi kunci, enkripsi at-rest & in-transit (HTTPS), masker data sensitif, rate-limit, IP allowlist backoffice.

- [ ] Pelunasan dipercepat (early settlement)Reliabilitas: backup harian, restore drill, monitoring (metrics & logs), alerting.

- [ ] Penalti ta'zir (sesuai fatwa DSN-MUI)Kinerja: antrian (message queue) untuk event POS→Inventory→Accounting; caching (Redis) untuk katalog & price.

- [ ] Restrukturisasi pembiayaanDevOps: Docker, CI/CD, staging–prod, migrasi skema (Liquibase/Prisma), feature flags.

- [ ] Simpanan anggota (jika ada bagi hasil)Kepatuhan Syariah: parameter marjin, denda ta’zir ke pos non-pendapatan, jejak persetujuan Dewan Pengawas Syariah bila ada.

- [ ] NPF calculation & reporting

- [ ] Aging analysis (DPD tracking)Roadmap Implementasi (prioritas build)

- [ ] Collection reminder automationMVP Ritel: POS adapter, Inventory, Purchasing (PO/GR), Pricing dasar, Accounting auto-journal inti.

Loyalty + Promo + Notifikasi: Membership, voucher/promo engine, reminder stok & kas.

### 🔗 I/O & Integrasi:USPPS Core: akad murabahah/qardh, jadwal angsuran, aging & penagihan, jurnal syariah.

**Output:**BI & Omnichannel: dashboard KPI, katalog online, konektor marketplace, PPOB adaptor, CRM/tiket.

- ❌ Auto-journal syariah → Accounting

- ❌ Collection reminder → CRM/Notifikasi (reminder jatuh tempo)Glosarium Singkat (EN → ID)

- ❌ Compliance tracking sesuai fatwa DSN-MUIPoint of Sale (POS) → Aplikasi kasir/titik penjualan

SKU (Stock Keeping Unit) → Kode unik barang

📁 **Files to Create:** `app/koperasi/uspps/page.tsx`, `app/api/uspps/contracts/route.ts`, `app/api/uspps/installments/route.ts`  Goods Receipt (GR) → Penerimaan barang

❌ **MISSING:** `financing_contracts`, `installments`, `savings_accounts`, `savings_transactions` tablesBill of Materials (BOM) → Resep/komposisi (jika ada produksi)

Settlement → Penyelesaian dana dari gateway

---MDR (Merchant Discount Rate) → Biaya layanan pembayaran

COA (Chart of Accounts) → Bagan akun

## 9️⃣ SISTEM PENILAIAN RISIKO & KYC (Risk, Scoring & KYC)Ledger / General Ledger → Buku besar

FIFO / FEFO → Metode keluar stok / berdasar kadaluarsa

**Status:** ❌ **NOT STARTED**KYC → Verifikasi identitas pelanggan/anggota

RBAC → Kontrol akses berbasis peran

### 📌 Tujuan:ETL/ELT → Ekstrak-Transform-Muat data ke gudang data

Verifikasi anggota dan penilaian kelayakan pembiayaan.Cohort analysis → Analisis perilaku kelompok berdasarkan waktu



### 📚 Istilah:Jika Anda mau, saya bisa turunkan dokumen ini menjadi:

- **KYC (Know Your Customer)** = Kenali nasabah AndaDokumen spesifikasi teknis (per modul, lengkap dengan use case & skenario UAT), atau

- **Credit scoring** = Penilaian kelayakan kreditERD + API contract (YAML OpenAPI) supaya tim langsung bisa mulai coding.
- **Due diligence** = Penelitian menyeluruh
- **4-eyes principle** = Approval 2 orang

### ❌ Fitur Yang Dibutuhkan:
- [ ] Upload KTP/selfie untuk verifikasi
- [ ] Validasi data dasar (NIK, nama, alamat)
- [ ] Credit scoring sederhana (income, history, discipline)
- [ ] Limit calculation based on score
- [ ] Approval workflow (2-eyes/4-eyes)
- [ ] Document checklist per product
- [ ] Audit trail untuk setiap keputusan
- [ ] Blacklist management

📁 **Files to Create:** `app/koperasi/kyc/page.tsx`, `app/api/kyc/verification/route.ts`  
❌ **MISSING:** `kyc_verifications`, `credit_scores`, `approval_logs` tables

---

## 🔟 SISTEM OMNICHANNEL & KATALOG ONLINE (Headless Commerce)

**Status:** ❌ **NOT STARTED**

### 📌 Tujuan:
Jual online (click & collect / delivery), tampilkan stok real-time, hub marketplace.

### 📚 Istilah:
- **Headless API** = API tanpa front-end terikat
- **Click & collect** = Pesan online, ambil di toko
- **Marketplace hub** = Integrasi dengan Tokopedia, Shopee, dll

### ❌ Fitur Yang Dibutuhkan:
- [ ] Katalog online dengan foto & deskripsi
- [ ] Stok real-time per outlet
- [ ] Shopping cart online
- [ ] Checkout flow
- [ ] Order status tracking
- [ ] Ongkir calculation (radius-based)
- [ ] Click & collect option
- [ ] Delivery scheduling
- [ ] Marketplace integration (Tokopedia, Shopee)

### 🔗 I/O & Integrasi:
**Integration:**
- ❌ POS (sync harga/produk)
- ❌ Inventory (stok real-time)
- ❌ Payment Gateway (jika bayar online)

📁 **Files to Create:** `app/public/catalog/page.tsx`, `app/api/public/products/route.ts`, `app/api/orders/route.ts`  
❌ **MISSING:** `online_orders`, `order_items`, `delivery_schedules` tables

---

## 1️⃣1️⃣ SISTEM GUDANG & PEMENUHAN (Warehouse & Fulfillment)

**Status:** ❌ **NOT STARTED**

### 📌 Tujuan:
Kontrol stok pusat & toko, perpindahan barang, FEFO/expiry management.

### 📚 Istilah:
- **FEFO (First-Expire, First-Out)** = Yang kadaluarsa duluan keluar pertama
- **Picking** = Pengambilan barang dari gudang
- **Packing** = Pengemasan barang
- **Bin location** = Lokasi rak penyimpanan

### ❌ Fitur Yang Dibutuhkan:
- [ ] Multi-warehouse management
- [ ] Transfer request antar gudang
- [ ] Transfer approval workflow
- [ ] Picking list generation
- [ ] Packing slip printing
- [ ] Expiry date tracking
- [ ] FEFO alerts (barang mendekati kadaluarsa)
- [ ] Bin location mapping
- [ ] Movement log lengkap

📁 **Files to Create:** `app/koperasi/warehouse/page.tsx`, `app/api/warehouses/route.ts`  
❌ **MISSING:** `warehouses`, `warehouse_stocks`, `transfers` tables

---

## 1️⃣2️⃣ SISTEM PPOB & LAYANAN TAMBAHAN (PPOB Aggregator Adapter)

**Status:** ❌ **NOT STARTED**

### 📌 Tujuan:
Menjual pulsa, paket data, token listrik, PDAM, dll.

### 📚 Istilah:
- **PPOB** = Payment Point Online Bank
- **Bill inquiry** = Cek tagihan
- **Callback** = Notifikasi status transaksi dari aggregator

### ❌ Fitur Yang Dibutuhkan:
- [ ] Bill inquiry (cek tagihan)
- [ ] Payment processing
- [ ] Callback handling dari aggregator
- [ ] Margin control (markup)
- [ ] Anti-duplikasi transaksi
- [ ] Transaction log lengkap
- [ ] Balance monitoring

### 🔗 I/O & Integrasi:
**Integration:**
- ❌ POS/e-commerce untuk alur pembelian

📁 **Files to Create:** `app/api/ppob/route.ts`, `lib/ppob-adapter.ts`  
❌ **MISSING:** `ppob_transactions` table

---

## 1️⃣3️⃣ SISTEM LAYANAN PELANGGAN & TIKET (CRM & Ticketing)

**Status:** ❌ **NOT STARTED**

### 📌 Tujuan:
Kelola keluhan/saran, SLA, kampanye komunikasi WA/Email/SMS.

### 📚 Istilah:
- **Ticket** = Tiket keluhan/permintaan
- **SLA (Service Level Agreement)** = Standar waktu layanan
- **Broadcast** = Kirim pesan massal
- **Cohort** = Kelompok pelanggan berdasarkan karakteristik

### ❌ Fitur Yang Dibutuhkan:
- [ ] Formulir keluhan/saran
- [ ] Ticket assignment ke agent
- [ ] Status tracking (open, in progress, resolved)
- [ ] Template jawaban (canned responses)
- [ ] SLA monitoring
- [ ] Customer segmentation
- [ ] Broadcast WA/Email/SMS
- [ ] Campaign management
- [ ] Cohort targeting (anggota baru, ulang tahun, telat angsuran)

📁 **Files to Create:** `app/koperasi/crm/page.tsx`, `app/api/tickets/route.ts`  
❌ **MISSING:** `tickets`, `ticket_messages`, `campaigns` tables

---

## 1️⃣4️⃣ SISTEM PELAPORAN & BI (Reporting & Business Intelligence)

**Status:** 🟡 **PARTIAL** (Basic dashboard ✅, Advanced analytics ❌)

### 📌 Tujuan:
Dashboard operasional & analitik manajerial.

### 📚 Istilah:
- **GMROI** = Gross Margin Return on Inventory (efisiensi persediaan)
- **Cohort analysis** = Analisis kelompok berdasarkan waktu
- **ETL** = Extract, Transform, Load (proses data warehouse)

### ✅ Fitur Yang Sudah Ada:
- [x] Financial dashboard (basic revenue/expense)
- [x] Transaction history view
- [x] Stock movement reports

### ❌ Fitur Yang Belum Ada:

**Ritel:**
- [ ] Penjualan per jam/hari/outlet
- [ ] Top SKU analysis
- [ ] Basket size (average items per transaction)
- [ ] GMROI calculation

**USPPS:**
- [ ] Outstanding balance
- [ ] DPD aging report
- [ ] Collection rate tracking
- [ ] NPF analysis

**General:**
- [ ] P&L segmented (BSM Mart vs USPPS)
- [ ] Promo effectiveness report
- [ ] Export Excel/CSV
- [ ] Scheduled reports (email automation)
- [ ] Data warehouse (ETL/ELT pipeline)

📁 **Files:** `app/koperasi/dashboard/page.tsx`, `app/koperasi/financial/page.tsx`  
❌ **MISSING:** Advanced BI module, data warehouse setup

---

## 1️⃣5️⃣ SISTEM ADMIN, AKSES & AUDIT (Admin Console, RBAC & Audit Trail)

**Status:** ✅ **IMPLEMENTED** (RBAC lengkap, audit trail ada)

### 📌 Tujuan:
Hak akses granular & jejak perubahan lengkap.

### 📚 Istilah:
- **RBAC (Role-Based Access Control)** = Kontrol akses berbasis peran
- **Audit trail** = Jejak audit (siapa, kapan, apa)
- **SSO (Single Sign-On)** = Login sekali untuk semua sistem

### ✅ Fitur Yang Sudah Ada:
- [x] Role-based access (ADMIN, KASIR, MEMBER, SUPPLIER, DEVELOPER)
- [x] JWT authentication dengan token expiry (7 days)
- [x] Password hashing (bcrypt)
- [x] Role-based routing & guards
- [x] Activity logging lengkap (activity_logs table)
- [x] Developer mode (role switching, DEV/PROD isolation)
- [x] Session management
- [x] Audit trail untuk semua critical actions

### 📋 Fitur Yang Belum Ada:
- [ ] Password policy enforcement (complexity, expiry)
- [ ] SSO integration (Google, Microsoft)
- [ ] 2FA/MFA (Two-Factor Authentication)
- [ ] IP whitelist untuk backoffice
- [ ] Session timeout configurable
- [ ] Password reset flow (email verification)
- [ ] Account lockout after failed attempts
- [ ] Granular permissions (beyond role - per feature/action)

📁 **Files:** `app/(auth)/login/page.tsx`, `app/api/auth/login/route.ts`, `contexts/DeveloperContext.tsx`, `lib/developer-helpers.ts`  
Database: `users`, `activity_logs` tables ✅ complete

---

## 1️⃣6️⃣ PUSAT DOKUMEN & ARSIP (Document Management)

**Status:** ❌ **NOT STARTED**

### 📌 Tujuan:
Menyimpan dokumen resmi terstruktur & aman.

### 📚 Istilah:
- **Versioning** = Versi dokumen (track perubahan)
- **Watermark** = Tanda air (untuk keamanan)
- **OCR** = Optical Character Recognition (ekstrak teks dari scan)

### ❌ Fitur Yang Dibutuhkan:
- [ ] Upload dokumen (akad, PO, faktur, bukti transfer)
- [ ] Tag/kategori management
- [ ] Permission-based access
- [ ] Automatic numbering (nomor dokumen)
- [ ] Full-text search
- [ ] Version control
- [ ] Document expiry tracking
- [ ] Watermark untuk dokumen sensitif
- [ ] OCR untuk scan dokumen

📁 **Files to Create:** `app/koperasi/documents/page.tsx`, `app/api/documents/route.ts`  
❌ **MISSING:** `documents`, `document_versions` tables

---

## 1️⃣7️⃣ LAYANAN NOTIFIKASI (Notification Service)

**Status:** 🟡 **PARTIAL** (Activity logs ✅, Notification delivery ❌)

### 📌 Tujuan:
Kirim pemberitahuan event-driven multi-channel.

### 📚 Istilah:
- **Event bus** = Sistem event-driven architecture
- **Reminder** = Pengingat otomatis
- **Throttling** = Batasi jumlah notifikasi
- **Template** = Template pesan dinamis

### ✅ Fitur Yang Sudah Ada:
- [x] Activity logging untuk tracking events

### ❌ Fitur Yang Belum Ada:
- [ ] Email notification
- [ ] WhatsApp notification (via Fonnte/Wablas)
- [ ] SMS notification
- [ ] Push notification (PWA)
- [ ] Template management (dynamic variables)
- [ ] Scheduled delivery
- [ ] Retry mechanism
- [ ] Throttling (prevent spam)
- [ ] Delivery log & status tracking

**Contoh Event yang Perlu Notifikasi:**
- Stok menipis (alert gudang)
- Penjualan besar (alert manager)
- Due date angsuran (reminder member)
- Settlement gagal (alert accounting)
- Error aplikasi (alert developer)

📁 **Files:** Activity logs exist in `lib/developer-helpers.ts`  
❌ **MISSING:** `notifications`, `notification_templates`, delivery service

---

## 👥 PERAN & TANGGUNG JAWAB

### ✅ **Role Yang Sudah Implemented:**

**1. DEVELOPER**
- Full access ke semua fitur
- Role switching (switch ke ADMIN, KASIR, MEMBER, SUPPLIER)
- DEV/PROD mode toggle (data isolation)
- Activity logs viewer
- Data management tools
- Files: `contexts/DeveloperContext.tsx`, `app/koperasi/developer-dashboard/page.tsx`

**2. ADMIN**
- Full management access
- POS, Inventory, Financial dashboard
- Supplier & member management
- System configuration
- Files: `app/koperasi/layout.tsx` (role-based sidebar filtering)

**3. KASIR (Store Crew)**
- POS operations (create transactions)
- Inventory view (read-only)
- Basic reports
- Files: `app/koperasi/pos/page.tsx`

**4. MEMBER**
- Member portal access
- Transaction history (self)
- Profile management
- Files: `app/koperasi/members/page.tsx` (if exists)

**5. SUPPLIER**
- Supplier portal access
- Consignment sales view
- Product submissions
- Files: `app/koperasi/supplier/page.tsx`

### 📋 **Role Yang Perlu Detail Implementation:**

**6. GUDANG (Warehouse)**
- Penerimaan barang (GR)
- Transfer antar gudang
- Stock opname
- Expiry tracking

**7. PURCHASING**
- PO creation
- Supplier negotiation
- Konsinyasi management

**8. ACCOUNTING**
- Rekonsiliasi bank
- Laporan keuangan
- Tutup buku periode
- Journal entries

**9. USPPS OFFICER**
- Akad creation
- Pencairan dana
- Penagihan angsuran
- Collection

**10. CUSTOMER CARE**
- CRM/tiket handling
- Broadcast messages
- Campaign management

**11. MANAGER**
- Approval workflows (PO, adjustment, etc)
- KPI monitoring
- BI dashboard access
- Reports

**12. AUDITOR**
- Read-only access to all modules
- Audit trail viewer
- Compliance reports
- No edit/delete permissions

---

## 🔄 INTEGRASI & ALUR DATA

### ✅ **Alur Yang Sudah Jalan:**

1. **Master Produk → POS** ✅
   - Products table → POS interface
   - Real-time stock display

2. **POS Transaction → Stock Movements** ✅
   - Create transaction → Auto reduce stock
   - stock_movements table logged

3. **POS Transaction → Activity Logs** ✅
   - Every transaction logged
   - Metadata: transactionId, totalAmount, itemCount

### 🟡 **Alur Yang Partial:**

1. **POS Transaction → Financial Dashboard** 🟡
   - Manual aggregation saat ini
   - Perlu auto-journal untuk real-time

2. **Stock Movements → Accounting** 🟡
   - Belum ada auto-journal
   - Perlu COA & journal_entries setup

### ❌ **Alur Yang Belum Ada:**

1. **Master Harga (Pricing) → POS** ❌
   - Perlu price_lists table
   - Perlu promo engine integration

2. **POS → Loyalty (Poin)** ❌
   - Perlu loyalty_points accumulation
   - Perlu tier calculation

3. **PO/GR → Inventory & Accounting** ❌
   - Perlu purchase_orders, goods_receipts tables
   - Perlu auto-journal untuk AP/Hutang

4. **USPPS → Accounting (Jurnal Syariah)** ❌
   - Perlu financing_contracts, installments tables
   - Perlu COA syariah compliant

5. **Payment Gateway → Accounting (Settlement & MDR)** ❌
   - Perlu payment_transactions table
   - Perlu auto-journal untuk settlement

6. **Notifications → Multi-channel Delivery** ❌
   - Perlu notification service (Email, WA, SMS)
   - Perlu notification_templates table

---

## 🗄️ SKEMA DATABASE

### ✅ **Tabel Yang Sudah Ada:**

**Core:**
- `users` ✅ (authentication, roles)
- `members` ✅ (member data)
- `suppliers` ✅ (supplier data)

**Inventory:**
- `products` ✅ (master produk)
- `categories` ✅ (kategori produk)
- `stock_movements` ✅ (IN/OUT/ADJUSTMENT tracking)

**Transactions:**
- `transactions` ✅ (POS transactions header)
- `transaction_items` ✅ (transaction line items)
- `consignment_sales` ✅ (supplier consignment tracking)

**Audit:**
- `activity_logs` ✅ (complete activity tracking)

**Total:** 10 tables ✅

---

### ❌ **Tabel Yang Belum Ada (Perlu Dibuat):**

**Purchasing:**
- `purchase_orders` ❌ (PO header)
- `po_items` ❌ (PO line items)
- `goods_receipts` ❌ (GR dari PO)

**Pricing & Promo:**
- `price_lists` ❌ (multi-tier pricing)
- `promotions` ❌ (promo campaigns)
- `promotion_rules` ❌ (promo logic)
- `vouchers` ❌ (kupon/voucher)

**Loyalty:**
- `loyalty_points` ❌ (point transactions)
- `loyalty_transactions` ❌ (accumulation/redemption log)
- `member_tiers` ❌ (tier configuration)

**Payment:**
- `payment_transactions` ❌ (payment gateway transactions)
- `settlements` ❌ (daily settlement dari gateway)

**Accounting:**
- `chart_of_accounts` ❌ (COA koperasi)
- `journal_entries` ❌ (journal header)
- `journal_lines` ❌ (journal detail)
- `periods` ❌ (accounting period & closing)

**USPPS:**
- `financing_contracts` ❌ (akad pembiayaan)
- `installments` ❌ (jadwal angsuran)
- `savings_accounts` ❌ (simpanan anggota)
- `savings_transactions` ❌ (transaksi simpanan)

**KYC:**
- `kyc_verifications` ❌ (verifikasi identitas)
- `credit_scores` ❌ (credit scoring)
- `approval_logs` ❌ (approval workflow)

**E-Commerce:**
- `online_orders` ❌ (online orders)
- `order_items` ❌ (order line items)
- `delivery_schedules` ❌ (pengiriman)

**Warehouse:**
- `warehouses` ❌ (multi-warehouse setup)
- `warehouse_stocks` ❌ (stok per warehouse)
- `transfers` ❌ (transfer antar gudang)

**PPOB:**
- `ppob_transactions` ❌ (pulsa, token, PDAM, dll)

**CRM:**
- `tickets` ❌ (customer service tickets)
- `ticket_messages` ❌ (ticket conversation)
- `campaigns` ❌ (marketing campaigns)

**Documents:**
- `documents` ❌ (document management)
- `document_versions` ❌ (version control)

**Notifications:**
- `notifications` ❌ (notification queue)
- `notification_templates` ❌ (message templates)

**Total Missing:** ~40 tables ❌

---

## 🔌 CONTOH ENDPOINT API

### ✅ **Endpoints Yang Sudah Ada:**

**Authentication:**
```
POST /api/auth/login ✅
POST /api/auth/register ✅
```

**Products & Inventory:**
```
GET /api/products ✅
POST /api/products ✅
PUT /api/products/[id] ✅
DELETE /api/products/[id] ✅
GET /api/categories ✅
POST /api/categories ✅
POST /api/stock-movements ✅
```

**POS:**
```
POST /api/pos/transaction ✅ (with data isolation)
```

**Suppliers:**
```
GET /api/suppliers ✅
POST /api/suppliers ✅
GET /api/consignment-sales ✅
```

**Developer:**
```
GET /api/developer/session ✅
POST /api/developer/switch-role ✅
POST /api/developer/toggle-environment ✅
GET /api/developer/activity-logs ✅
GET /api/developer/data-statistics ✅
POST /api/developer/clean-dev-data ✅
```

**Financial:**
```
GET /api/financial/summary ✅
```

---

### ❌ **Endpoints Yang Belum Ada (Perlu Dibuat):**

**Purchasing:**
```
POST /api/purchase-orders ❌
GET /api/purchase-orders ❌
PUT /api/purchase-orders/[id]/approve ❌
POST /api/goods-receipts ❌
GET /api/goods-receipts ❌
```

**Pricing:**
```
GET /api/price-lists ❌
POST /api/price-lists ❌
GET /api/promotions ❌
POST /api/promotions ❌
POST /api/promotions/simulate ❌ (test promo before activate)
```

**Loyalty:**
```
POST /api/loyalty/accumulate ❌
POST /api/loyalty/redeem ❌
GET /api/loyalty/balance ❌
```

**Payments:**
```
POST /api/payments/qris/generate ❌
POST /api/payments/callback ❌ (webhook from gateway)
GET /api/payments/status ❌
POST /api/payments/refund ❌
```

**USPPS:**
```
POST /api/uspps/contracts ❌
GET /api/uspps/contracts ❌
POST /api/uspps/installments/pay ❌
GET /api/uspps/aging ❌
GET /api/uspps/npf-report ❌
```

**Accounting:**
```
GET /api/accounting/reports/pl ❌ (P&L segmented)
GET /api/accounting/reports/balance-sheet ❌
POST /api/accounting/close-period ❌
GET /api/accounting/trial-balance ❌
```

**CRM:**
```
POST /api/tickets ❌
GET /api/tickets ❌
PUT /api/tickets/[id]/assign ❌
POST /api/campaigns/broadcast ❌
```

---

## 🔒 NON-FUNGSIONAL REQUIREMENTS

### ✅ **Yang Sudah Ada:**

**Keamanan:**
- [x] JWT authentication dengan token expiry (7 days)
- [x] Password hashing (bcrypt)
- [x] HTTPS (production deployment)
- [x] Activity logging untuk audit
- [x] Data isolation (DEV/PROD)

**Development:**
- [x] Git version control dengan GitHub
- [x] Environment variables (.env)
- [x] TypeScript strict mode
- [x] ESLint configuration
- [x] Prisma ORM v6.17.1

---

### ❌ **Yang Belum Ada (Perlu Implementasi):**

**Keamanan:**
- [ ] JWT key rotation
- [ ] Data encryption at-rest
- [ ] Rate limiting API endpoints
- [ ] IP allowlist untuk backoffice
- [ ] CORS configuration proper

**Reliabilitas:**
- [ ] Automated backup harian
- [ ] Backup restore drill
- [ ] Application monitoring (metrics & logs)
- [ ] Alerting system (errors, performance)

**Kinerja:**
- [ ] Message queue (event-driven architecture)
- [ ] Redis caching untuk katalog & price
- [ ] Database query optimization
- [ ] CDN untuk static assets

**DevOps:**
- [ ] Docker containerization
- [ ] CI/CD pipeline automated
- [ ] Database migration tools (Prisma migrate production)
- [ ] Feature flags system
- [ ] Load balancing (jika scale)
- [ ] Blue-green deployment

**Kepatuhan Syariah:**
- [ ] Parameter margin murabahah configurable
- [ ] Denda ta'zir dialokasikan ke pos sosial (bukan pendapatan)
- [ ] Approval Dewan Pengawas Syariah untuk produk baru
- [ ] Laporan syariah compliance
- [ ] No interest calculation (strictly margin/profit sharing)

---

## 🗺️ ROADMAP IMPLEMENTASI

### ✅ **DONE - Phase 1: MVP Ritel (80% Complete)**
- [x] POS adapter basic ✅
- [x] Inventory management ✅
- [x] Stock tracking ✅
- [x] Supplier data management ✅
- [x] Consignment tracking ✅
- [x] Basic financial dashboard ✅
- [x] RBAC & authentication ✅
- [x] Activity logging ✅
- [x] Developer mode (DEV/PROD isolation) ✅

---

### ⏳ **IN PROGRESS - Phase 2: Developer Tools**
- [x] Developer dashboard ✅
- [x] Role switching ✅
- [x] Data isolation (DEV/PROD) ✅
- [ ] Activity logs viewer UI (Phase 3 - planned tonight!) ⏳
- [ ] Data management tools 📋
- [ ] API tester 📋

---

### 📋 **PLANNED - Phase 3: Purchasing & Advanced Inventory**
- [ ] Purchase Order (PO) module
- [ ] Goods Receipt (GR) processing
- [ ] Supplier invoice matching
- [ ] Multi-warehouse management
- [ ] Stock opname
- [ ] FIFO/FEFO costing
- [ ] Batch & expiry tracking

---

### 📋 **PLANNED - Phase 4: Loyalty & Promo**
- [ ] Membership loyalty points
- [ ] Tiering system (Silver, Gold, Platinum)
- [ ] Promotion engine (buy X get Y, % discount, bundle)
- [ ] Voucher/coupon management
- [ ] Targeted campaigns
- [ ] Member birthday automation

---

### 📋 **PLANNED - Phase 5: Accounting Automation**
- [ ] Complete COA setup (koperasi-compliant)
- [ ] Auto-journal dari POS
- [ ] Auto-journal dari Purchasing
- [ ] General Ledger
- [ ] Trial Balance
- [ ] P&L & Balance Sheet (segmented)
- [ ] Period locking
- [ ] Tax calculation (PPh, PPN)

---

### 📋 **PLANNED - Phase 6: USPPS Syariah**
- [ ] Financing products (Murabahah, Ijarah, Qardh)
- [ ] Contract management (akad)
- [ ] Installment scheduling
- [ ] Payment tracking
- [ ] NPF & aging reports
- [ ] Collection automation
- [ ] Syariah compliance reporting

---

### 📋 **PLANNED - Phase 7: Payment Integration**
- [ ] QRIS integration (Midtrans/Xendit)
- [ ] Payment gateway adapter
- [ ] Settlement reconciliation
- [ ] Refund processing
- [ ] MDR tracking → Accounting

---

### 📋 **PLANNED - Phase 8: Omnichannel & BI**
- [ ] Online catalog (headless commerce)
- [ ] E-commerce checkout
- [ ] Click & collect
- [ ] Marketplace integration (Tokopedia, Shopee)
- [ ] Advanced BI dashboard (GMROI, cohort analysis)
- [ ] Data warehouse (ETL/ELT)
- [ ] PPOB integration (pulsa, token, PDAM)
- [ ] CRM & ticketing system

---

## 📚 GLOSARIUM LENGKAP

### **Bahasa Inggris → Bahasa Indonesia:**

| English Term | Indonesian | Keterangan |
|--------------|-----------|-----------|
| Point of Sale (POS) | Aplikasi Kasir | Titik penjualan |
| SKU (Stock Keeping Unit) | Kode Barang Unik | Identitas produk |
| Goods Receipt (GR) | Penerimaan Barang | Dari supplier |
| Purchase Order (PO) | Pesanan Pembelian | Ke supplier |
| Bill of Materials (BOM) | Resep/Komposisi | Untuk produksi |
| Settlement | Penyelesaian Dana | Dari payment gateway |
| MDR (Merchant Discount Rate) | Biaya Layanan Pembayaran | Fee gateway (%) |
| COA (Chart of Accounts) | Bagan Akun | Struktur akuntansi |
| Ledger / General Ledger | Buku Besar | Catatan keuangan |
| FIFO | First In First Out | Keluar pertama yang masuk pertama |
| FEFO | First Expire First Out | Keluar pertama yang kadaluarsa duluan |
| KYC | Know Your Customer | Verifikasi identitas |
| RBAC | Role-Based Access Control | Kontrol akses berdasarkan peran |
| ETL/ELT | Extract-Transform-Load | Proses data warehouse |
| Cohort analysis | Analisis Kelompok | Berdasarkan waktu/perilaku |
| Murabahah | Jual Beli Margin | Pembiayaan syariah |
| Ijarah | Sewa | Leasing syariah |
| Qardh | Pinjaman Kebajikan | Tanpa bunga |
| NPF | Non-Performing Financing | Pembiayaan bermasalah |
| DPD | Days Past Due | Hari tunggakan |
| Ta'zir | Denda Keterlambatan | Untuk sosial (bukan pendapatan) |
| QRIS | Quick Response Indonesian Standard | QR code pembayaran nasional |
| GMROI | Gross Margin Return on Inventory | Efisiensi persediaan |
| Click & collect | Pesan Online, Ambil di Toko | E-commerce model |
| Headless API | API Tanpa Front-end Terikat | Flexible architecture |
| PPOB | Payment Point Online Bank | Pulsa, token, dll |

---

## 🎯 KESIMPULAN & NEXT ACTIONS

### **Status Saat Ini (20 Oktober 2025):**

**✅ Sudah Implemented (6 sistem - 35%):**
1. POS (partial - basic operations)
2. Inventory (partial - CRUD & stock tracking)
3. Purchasing (partial - supplier data only)
4. Loyalty (partial - member data only)
5. Accounting (partial - manual entry)
6. RBAC & Audit (complete!)

**❌ Belum Implemented (11 sistem - 65%):**
1. Pricing & Promotion Engine
2. Payment Gateway & QRIS
3. USPPS Syariah Core
4. KYC & Credit Scoring
5. Omnichannel & E-Commerce
6. Warehouse & Fulfillment
7. PPOB Services
8. CRM & Ticketing
9. BI & Advanced Analytics
10. Document Management
11. Notification Service

---

### **Prioritas Urgent (Next 1-2 Bulan):**

**Priority 1 (Critical for Operations):**
- ✅ Complete Phase 2.5 testing (POS data isolation)
- ⏳ Activity Logs Viewer UI (Phase 3 - tonight!)
- 📋 Purchase Order (PO) module
- 📋 Goods Receipt (GR) integration
- 📋 Accounting auto-journal (POS → COA)

**Priority 2 (Business Growth):**
- 📋 Loyalty points system
- 📋 Promotion engine
- 📋 Payment Gateway/QRIS
- 📋 Multi-warehouse management

**Priority 3 (USPPS Expansion):**
- 📋 USPPS Syariah core (Murabahah, Qardh)
- 📋 KYC & credit scoring
- 📋 Installment tracking
- 📋 NPF monitoring

---

### **Untuk Diskusi dengan Atasan:**

**1. Konfirmasi Prioritas:**
- Apakah fokus ke Ritel dulu (POS, Inventory, Purchasing) atau sekaligus USPPS?
- Timeline target untuk go-live per module?

**2. Resource Planning:**
- Budget untuk Payment Gateway (Midtrans/Xendit)?
- Budget untuk Notification Service (Fonnte/Wablas)?
- Tim developer tambahan needed?

**3. Compliance & Legal:**
- Perlu approval Dewan Pengawas Syariah untuk USPPS module?
- Requirement khusus untuk compliance syariah?

---

## 📝 CATATAN AKHIR

**Dokumen ini akan terus di-update seiring progress development.**

Untuk spesifikasi teknis lebih detail per modul (use case, UAT scenarios, ERD, API contract), silakan request ke tim development.

**GitHub Repository:**  
https://github.com/BroAegg/web-koperasi-umb

**Direct Link Dokumen:**  
https://github.com/BroAegg/web-koperasi-umb/blob/main/SISTEM-DIGITALISASI-KOPERASI-UMB.md

---

**Last Updated:** 20 Oktober 2025, 22:00 WIB  
**Maintained By:** Reyvan & Aegner (Tim Digitalisasi Koperasi UM Bandung)  
**Review By:** Management BSM Mart & USPPS  
**Version:** 2.0 (Complete - All 17 Systems Documented)
