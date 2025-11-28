# 📋 MVP Features Specification

## Overview

MVP fokus pada **3 Core Modules**:
1. **POS (Point of Sale)** - Transaksi jual beli
2. **Supplier System** - Pendaftaran & pengelolaan supplier
3. **Consignment** - Sistem titipan & pembagian hasil

---

## 🛒 Module 1: POS (Point of Sale)

### 1.1 Dashboard Kasir

**URL**: `/kasir`

**Features**:
- Quick stats: Total penjualan hari ini, jumlah transaksi
- Low stock alerts
- Recent transactions
- Quick access to POS

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│  🏪 POS Koperasi                          [Kasir: Ahmad]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 💰 Rp 2.5jt │  │ 🧾 45 Trans │  │ ⚠️ 5 Low   │          │
│  │ Hari Ini    │  │ Transaksi   │  │ Stock      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  [🛒 Mulai Transaksi Baru]                                  │
│                                                              │
│  ── Transaksi Terakhir ──────────────────────────           │
│  │ INV-001 │ 14:30 │ Rp 45.000 │ Cash    │ ✅ │            │
│  │ INV-002 │ 14:25 │ Rp 32.000 │ Transfer│ ✅ │            │
│  │ INV-003 │ 14:20 │ Rp 18.500 │ Cash    │ ✅ │            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.2 POS Interface

**URL**: `/kasir/pos`

**Features**:
- Product search by name/SKU/barcode
- Category filter
- Add to cart
- Quantity adjustment
- Remove item
- Payment processing (Cash/Transfer)
- Print receipt
- Consignment product identification

**Wireframe**:
```
┌────────────────────────────────────────────────────────────────────┐
│  🛒 Point of Sale                                    [X] Tutup     │
├─────────────────────────────────┬──────────────────────────────────┤
│                                 │                                  │
│  🔍 [Cari produk...        ]    │     KERANJANG                   │
│                                 │  ─────────────────────────────   │
│  ── Kategori ──                 │                                  │
│  [Semua] [Makanan] [Minuman]    │  ┌────────────────────────────┐ │
│  [Snack] [ATK]                  │  │ Indomie Goreng      x2     │ │
│                                 │  │ Rp 3.500 → Rp 7.000   [-]  │ │
│  ── Produk ──                   │  ├────────────────────────────┤ │
│  ┌──────┐ ┌──────┐ ┌──────┐    │  │ Aqua 600ml (🏷️)     x1    │ │
│  │ 🍜   │ │ 🥤   │ │ 🍿   │    │  │ Rp 4.000 → Rp 4.000   [-]  │ │
│  │Mie   │ │Aqua  │ │Chiki │    │  ├────────────────────────────┤ │
│  │3.500 │ │4.000 │ │5.000 │    │  │ Chitato            x1     │ │
│  │[+]   │ │[+]   │ │[+]   │    │  │ Rp 12.000 → Rp 12.000 [-]  │ │
│  └──────┘ └──────┘ └──────┘    │  └────────────────────────────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐    │                                  │
│  │ 📝   │ │ 🧴   │ │ 🔋   │    │  Subtotal:        Rp 23.000     │
│  │Pulpen│ │Sabun │ │Batre │    │  ─────────────────────────────   │
│  │2.000 │ │8.500 │ │15.00 │    │  TOTAL:          Rp 23.000     │
│  │[+]   │ │[+]   │ │[+]   │    │                                  │
│  └──────┘ └──────┘ └──────┘    │  ─────────────────────────────   │
│                                 │  Bayar: [________________]       │
│  [< Prev] Page 1 of 5 [Next >] │  Kembalian: Rp 0                 │
│                                 │                                  │
│                                 │  [💵 Cash] [📱 Transfer]        │
│                                 │                                  │
│                                 │  [🧾 BAYAR & CETAK STRUK]       │
└─────────────────────────────────┴──────────────────────────────────┘

🏷️ = Produk Konsinyasi/Titipan
```

---

### 1.3 Transaction Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Search    │────▶│  Add Cart   │────▶│  Checkout   │
│   Product   │     │  (qty)      │     │  Payment    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
              ┌───────────┐            ┌───────────────┐          ┌───────────┐
              │  Create   │            │  Update Stock │          │ Consignment│
              │Transaction│            │  (decrease)   │          │   Sales   │
              └───────────┘            └───────────────┘          └───────────┘
                    │                                                     │
                    ▼                                                     ▼
              ┌───────────┐                                      ┌───────────┐
              │  Print    │                                      │Calculate  │
              │  Receipt  │                                      │Supplier   │
              └───────────┘                                      │Share      │
                                                                 └───────────┘
```

---

### 1.4 Receipt Format

```
================================================
             KOPERASI UMB
        Jl. Soekarno-Hatta No.123
           Bandung, Jawa Barat
================================================
No: INV-20251128-0001
Tanggal: 28 Nov 2025 14:30:25
Kasir: Ahmad

------------------------------------------------
Produk                  Qty    Harga      Total
------------------------------------------------
Indomie Goreng           2    3.500      7.000
Aqua 600ml               1    4.000      4.000
Chitato                  1   12.000     12.000
------------------------------------------------
                       SUBTOTAL:       23.000
                       TOTAL:          23.000
------------------------------------------------
Bayar (Cash):                          25.000
Kembalian:                              2.000
================================================
     Terima kasih atas kunjungan Anda!
         Barang yang sudah dibeli
          tidak dapat dikembalikan
================================================
```

---

### 1.5 Data Requirements

**Input**:
- Product selection (search/click)
- Quantity per item
- Payment method
- Payment amount

**Output**:
- Transaction record
- Transaction items
- Stock movement (SALE_OUT)
- Consignment sales (if applicable)
- Printed receipt

---

## 👤 Module 2: Supplier System

### 2.1 Supplier Registration

**URL**: `/supplier/register`

**Features**:
- Self-registration form
- Business info input
- Sample product submission
- Wait for approval

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│              🏪 DAFTAR SEBAGAI SUPPLIER                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ── Informasi Bisnis ──                                     │
│  Nama Usaha:    [_______________________________]           │
│  Nama Pemilik:  [_______________________________]           │
│  Email:         [_______________________________]           │
│  No. HP:        [_______________________________]           │
│  Alamat:        [_______________________________]           │
│                 [_______________________________]           │
│  Deskripsi:     [_______________________________]           │
│                 [_______________________________]           │
│  Kategori Produk: [Pilih kategori...          ▼]           │
│                                                              │
│  ── Contoh Produk ──                                        │
│  (Submit minimal 1 produk untuk review)                     │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ Nama Produk:  [________________________]     │           │
│  │ Harga:        [____________] / pcs           │           │
│  │ Stok Awal:    [____]                         │           │
│  │ Foto: [📷 Upload]                            │           │
│  │ Deskripsi:    [________________________]     │           │
│  └──────────────────────────────────────────────┘           │
│  [+ Tambah Produk Lain]                                     │
│                                                              │
│  ☑ Saya setuju dengan syarat dan ketentuan                  │
│                                                              │
│  [📝 DAFTAR SEKARANG]                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2 Supplier Dashboard

**URL**: `/supplier/dashboard`

**Features**:
- Sales summary
- Product performance
- Payment status
- Stock requests

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│  🏪 Dashboard Supplier              [Toko Makmur Jaya]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ── Status Akun ──                                          │
│  ┌─────────────────────────────────────────────────┐        │
│  │ ✅ Status: AKTIF                                │        │
│  │ 📅 Berlaku sampai: 28 Des 2025                  │        │
│  │ 💰 Fee Bulanan: Rp 25.000 (LUNAS)              │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  ── Penjualan Bulan Ini ──                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 💰 Rp 1.2jt │  │ 📦 45 Unit  │  │ 🧾 28 Trans │          │
│  │ Total       │  │ Terjual     │  │ Transaksi   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ── Produk Saya ──                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Produk          │ Stock │ Terjual │ Pending │ Status │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Keripik Singkong│   25  │    15   │    0    │ ✅ Aktif│   │
│  │ Kue Bolu        │    5  │    20   │    0    │ ⚠️ Low  │   │
│  │ Roti Manis      │   30  │     8   │    2    │ ✅ Aktif│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [📦 Ajukan Produk Baru]  [🔄 Request Restock]              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.3 Supplier Product Submission

**URL**: `/supplier/products/submit`

**Flow**:
```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    Submit     │────▶│  Admin Review │────▶│   Approved    │
│    Product    │     │  (evaluate)   │     │   Product     │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        │              ┌──────┴──────┐              │
        │              │             │              │
        │              ▼             ▼              ▼
        │        ┌─────────┐   ┌─────────┐   ┌───────────┐
        │        │ Approve │   │ Reject  │   │  Add to   │
        │        │         │   │ (reason)│   │  Catalog  │
        │        └─────────┘   └─────────┘   └───────────┘
        │                           │
        │                           ▼
        │                    ┌─────────────┐
        └───────────────────▶│  Resubmit   │
                             │  (fix & try)│
                             └─────────────┘
```

---

### 2.4 Supplier Status Flow

```
PENDING_REVIEW
      │
      ├──[Reject]──▶ REJECTED
      │
      └──[Approve]──▶ APPROVED_PENDING_PAYMENT
                              │
                              └──[Pay Fee]──▶ PAID_PENDING_APPROVAL
                                                      │
                                    ┌────────────────┴────────────────┐
                                    │                                  │
                              [Verify OK]                        [Reject]
                                    │                                  │
                                    ▼                                  ▼
                                ACTIVE ◀──────────────────── PAID_PENDING_APPROVAL
                                    │                          (fix & retry)
                                    │
                              [Non-payment/
                               Violation]
                                    │
                                    ▼
                               SUSPENDED
```

---

## 📦 Module 3: Consignment System

### 3.1 Consignment Overview

Sistem titipan barang dari supplier/consignor dengan pembagian hasil.

**Fee Types**:
- **PERCENTAGE**: Koperasi ambil X% dari penjualan
- **FLAT**: Koperasi ambil Rp X per unit terjual
- **HYBRID**: Kombinasi keduanya

**Example Calculation**:
```
Produk: Keripik Singkong
Harga Jual: Rp 15.000
Fee Type: PERCENTAGE (10%)

Penjualan: 10 unit
Total Revenue: Rp 150.000
Fee Koperasi: Rp 15.000 (10%)
Net to Supplier: Rp 135.000
```

---

### 3.2 Consignment Batch

**URL**: `/admin/consignment/batches`

**Features**:
- Create new batch (receive stock)
- Track qty: in, sold, returned, expired, remaining
- Batch status management
- Expiry tracking

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────────┐
│  📦 Konsinyasi - Batch Management                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ Terima Batch Baru]                                          │
│                                                                  │
│  ── Batch Aktif ──                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Kode      │ Supplier    │ Produk     │ Masuk│Jual│Sisa│Stat│ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ BTH-001   │ Toko Makmur │ Keripik    │  50  │ 25 │ 25 │ ✅ │ │
│  │ BTH-002   │ Toko Makmur │ Kue Bolu   │  30  │ 28 │  2 │ ⚠️ │ │
│  │ BTH-003   │ UD Sejahtera│ Roti       │  40  │ 10 │ 30 │ ✅ │ │
│  │ BTH-004   │ CV Berkah   │ Pudding    │  20  │ 20 │  0 │ ⬜ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ── New Batch Form ──                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Supplier:   [Pilih supplier...                    ▼]     │   │
│  │ Produk:     [Pilih produk...                      ▼]     │   │
│  │ Qty Masuk:  [________]                                   │   │
│  │ Tipe Fee:   ○ Percentage ○ Flat ○ Hybrid                 │   │
│  │ Fee %:      [____] %                                     │   │
│  │ Fee Flat:   Rp [________]                                │   │
│  │ Expiry:     [__/__/____]                                 │   │
│  │ Note:       [______________________________________]     │   │
│  │                                                          │   │
│  │ [💾 Simpan Batch]                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Sales Attribution

Setiap penjualan produk konsinyasi otomatis tercatat di `consignment_sales`:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  POS: Sale of   │────▶│  Transaction    │────▶│  Consignment    │
│  Consignment    │     │  Item Created   │     │  Sale Created   │
│  Product        │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  Calculate:     │
                                              │  - Fee Amount   │
                                              │  - Net Payable  │
                                              └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  Update Batch:  │
                                              │  - qty_sold++   │
                                              │  - qty_remaining│
                                              └─────────────────┘
```

---

### 3.4 Settlement & Payment

**URL**: `/admin/consignment/settlements`

**Features**:
- Create settlement for period
- View all unsettled sales
- Calculate total payable
- Record payment

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────────┐
│  💰 Settlement Konsinyasi                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ Buat Settlement Baru]                                       │
│                                                                  │
│  ── Settlement Pending ──                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Kode      │ Supplier    │ Periode      │ Total    │ Status │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ STL-001   │ Toko Makmur │ Nov 2025     │ Rp 135rb │ Pending│ │
│  │ STL-002   │ UD Sejahtera│ Nov 2025     │ Rp 280rb │ Pending│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ── Detail Settlement ──                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Settlement: STL-001                                      │   │
│  │ Supplier: Toko Makmur                                    │   │
│  │ Periode: 1 Nov - 30 Nov 2025                            │   │
│  │                                                          │   │
│  │ ── Rincian ──                                            │   │
│  │ Total Penjualan:           Rp 150.000                    │   │
│  │ Fee Koperasi (10%):       -Rp  15.000                    │   │
│  │ ─────────────────────────────────────                    │   │
│  │ TOTAL BAYAR:               Rp 135.000                    │   │
│  │                                                          │   │
│  │ Metode Bayar: ○ Cash ○ Transfer                          │   │
│  │ Bukti: [📷 Upload]                                       │   │
│  │                                                          │   │
│  │ [💰 Proses Pembayaran]                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Supplier Sales View

**URL**: `/supplier/sales`

Supplier bisa lihat detail penjualan produk mereka.

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Penjualan Produk Saya                 [Toko Makmur Jaya]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filter: [Nov 2025 ▼]                                           │
│                                                                  │
│  ── Ringkasan ──                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ 💰 Rp 150rb │  │ 📦 45 Unit  │  │ 🏷️ Rp 15rb │              │
│  │ Total Sales │  │ Terjual     │  │ Fee Koperasi│              │
│  │             │  │             │  │ Bagian Anda:│              │
│  │             │  │             │  │ Rp 135.000  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ── Detail Penjualan ──                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Tanggal    │ Produk     │ Qty │ Harga   │ Fee    │ Net     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 28 Nov     │ Keripik    │  5  │ 75.000  │ 7.500  │ 67.500  │ │
│  │ 27 Nov     │ Keripik    │  3  │ 45.000  │ 4.500  │ 40.500  │ │
│  │ 26 Nov     │ Kue Bolu   │  2  │ 30.000  │ 3.000  │ 27.000  │ │
│  │ ...        │            │     │         │        │         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ── Status Pembayaran ──                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ⏳ Menunggu settlement periode Nov 2025                  │   │
│  │    Estimasi bayar: Rp 135.000                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization

### Role Permissions Matrix

| Feature | Super Admin | Admin | Kasir | Supplier |
|---------|:-----------:|:-----:|:-----:|:--------:|
| **POS** |
| Access POS | ✅ | ✅ | ✅ | ❌ |
| Process transaction | ✅ | ✅ | ✅ | ❌ |
| Void transaction | ✅ | ✅ | ❌ | ❌ |
| View all transactions | ✅ | ✅ | ❌ | ❌ |
| **Products** |
| View products | ✅ | ✅ | ✅ | Own |
| Create product | ✅ | ✅ | ❌ | Submit |
| Edit product | ✅ | ✅ | ❌ | ❌ |
| Delete product | ✅ | ❌ | ❌ | ❌ |
| **Suppliers** |
| View suppliers | ✅ | ✅ | ❌ | Self |
| Approve supplier | ✅ | ✅ | ❌ | ❌ |
| Manage supplier | ✅ | ✅ | ❌ | ❌ |
| **Consignment** |
| Create batch | ✅ | ✅ | ❌ | ❌ |
| View all sales | ✅ | ✅ | ❌ | ❌ |
| View own sales | - | - | - | ✅ |
| Create settlement | ✅ | ✅ | ❌ | ❌ |
| Process payment | ✅ | ✅ | ❌ | ❌ |
| **Reports** |
| Sales report | ✅ | ✅ | ❌ | Own |
| Inventory report | ✅ | ✅ | ❌ | ❌ |
| Supplier report | ✅ | ✅ | ❌ | ❌ |
| **Settings** |
| User management | ✅ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ |

---

## 📱 Page Routes Summary

### Admin Routes (`/admin/*`)
```
/admin/dashboard          - Admin dashboard
/admin/products           - Product management
/admin/products/create    - Add product
/admin/products/{id}/edit - Edit product
/admin/categories         - Category management
/admin/suppliers          - Supplier management
/admin/suppliers/{id}     - Supplier detail
/admin/consignment        - Consignment overview
/admin/consignment/batches- Batch management
/admin/consignment/sales  - Sales list
/admin/settlements        - Settlement management
/admin/reports            - Reports
```

### Kasir Routes (`/kasir/*`)
```
/kasir                    - Kasir dashboard
/kasir/pos                - POS interface
/kasir/transactions       - My transactions today
/kasir/transactions/{id}  - Transaction detail
```

### Supplier Routes (`/supplier/*`)
```
/supplier/register        - Registration (public)
/supplier/login           - Login (public)
/supplier/dashboard       - Supplier dashboard
/supplier/products        - My products
/supplier/products/submit - Submit new product
/supplier/sales           - My sales
/supplier/payments        - Payment history
/supplier/restock         - Stock requests
/supplier/profile         - Profile settings
```

### Public Routes
```
/                         - Landing page
/login                    - User login
```
