# 🚀 Laravel POS Koperasi - Project Overview

## Project: Sistem POS Koperasi dengan Integrasi Supplier & Consignment

### 📋 Scope MVP

| Priority | Module | Status |
|----------|--------|--------|
| P0 | Authentication (Admin, Kasir, Supplier) | MVP |
| P0 | POS (Point of Sale) | MVP |
| P0 | Product & Inventory | MVP |
| P0 | Supplier Management | MVP |
| P0 | Consignment System | MVP |
| P1 | Member/Koperasi | Post-MVP |
| P1 | Loans & Savings | Post-MVP |
| P2 | Broadcasting | Future |
| P2 | Advanced Analytics | Future |

---

## 🎯 Target Deployment

- **Platform**: cPanel (Rumahweb Clientzone)
- **PHP Version**: 8.2+
- **Database**: MySQL 8.0
- **Framework**: Laravel 11.x

---

## 👥 User Roles (MVP)

| Role | Access |
|------|--------|
| **SUPER_ADMIN** | Full access, manage all |
| **ADMIN** | Manage products, suppliers, view reports |
| **KASIR** | POS operations, basic inventory |
| **SUPPLIER** | Submit products, view sales, request restock |

---

## 📦 Core Features MVP

### 1. POS System
- ✅ Product search & barcode scan
- ✅ Cart management
- ✅ Multiple payment methods (Cash, Transfer)
- ✅ Receipt printing
- ✅ Daily sales report
- ✅ Consignment product handling

### 2. Supplier Portal
- ✅ Supplier registration & login
- ✅ Product submission
- ✅ View sales of their products
- ✅ Stock request
- ✅ Payment tracking

### 3. Consignment System
- ✅ Batch tracking (qty in, sold, returned)
- ✅ Fee calculation (percentage/flat/hybrid)
- ✅ Sales attribution to supplier
- ✅ Settlement management
- ✅ Payment proof upload

### 4. Inventory
- ✅ Stock tracking
- ✅ Stock movements history
- ✅ Low stock alerts
- ✅ Purchase orders

---

## 🛠️ Tech Stack

```
Backend:
├── Laravel 11.x
├── PHP 8.2+
├── MySQL 8.0
└── Laravel Sanctum (API Auth)

Frontend:
├── Blade Templates
├── Livewire 3 (Real-time POS)
├── Alpine.js (Interactivity)
└── Tailwind CSS 3.x

Additional:
├── Laravel Excel (Import/Export)
├── Intervention Image (Image processing)
├── Laravel PDF (Receipts)
└── Laravel Backup (DB backup)
```

---

## 📁 Project Structure

```
laravel-pos-koperasi/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   ├── Admin/
│   │   │   ├── Kasir/
│   │   │   └── Supplier/
│   │   ├── Livewire/
│   │   │   ├── Pos/
│   │   │   ├── Inventory/
│   │   │   └── Supplier/
│   │   └── Middleware/
│   ├── Models/
│   ├── Services/
│   └── Enums/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   └── views/
│       ├── layouts/
│       ├── admin/
│       ├── kasir/
│       ├── supplier/
│       └── components/
└── routes/
    ├── web.php
    ├── admin.php
    ├── kasir.php
    └── supplier.php
```

---

## 🗓️ Development Timeline

### Week 1-2: Foundation
- [ ] Laravel setup
- [ ] Database migrations
- [ ] Authentication system
- [ ] Basic layouts & navigation

### Week 3-4: POS Core
- [ ] Product management
- [ ] POS interface (Livewire)
- [ ] Transaction processing
- [ ] Receipt printing

### Week 5-6: Supplier System
- [ ] Supplier registration/login
- [ ] Product submission workflow
- [ ] Approval process
- [ ] Stock requests

### Week 7-8: Consignment
- [ ] Batch tracking
- [ ] Sales attribution
- [ ] Fee calculation
- [ ] Settlement & payments

### Week 9-10: Polish & Deploy
- [ ] Testing
- [ ] cPanel deployment
- [ ] Documentation
- [ ] Training

---

## 📚 Documentation Files

1. `00_PROJECT_OVERVIEW.md` - This file
2. `01_DATABASE_SCHEMA.md` - Complete database design
3. `02_DATABASE_MIGRATIONS.md` - Laravel migration files
4. `03_MVP_FEATURES.md` - Detailed feature specs
5. `04_API_ENDPOINTS.md` - API documentation
6. `05_CPANEL_DEPLOYMENT.md` - Deployment guide
7. `06_DEVELOPMENT_GUIDE.md` - Dev setup & conventions

---

## 🔗 References

- Original Next.js Project: `web-koperasi-umb`
- GitHub: `BroAegg/web-koperasi-umb`
- Current Schema: `prisma/schema.prisma`
