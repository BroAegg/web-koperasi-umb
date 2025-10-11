# Sistem Koperasi UMB - Web Application

Aplikasi web lengkap untuk mengelola sistem informasi koperasi Universitas Mercu Buana. Dibangun dengan Next.js 15, TypeScript, Prisma ORM, dan Tailwind CSS sebagai full-stack solution.

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.4 dengan App Router
- **Language**: TypeScript
- **Database**: Prisma ORM dengan PostgreSQL/SQLite
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **Development**: ESLint, PostCSS
- **Backend**: Next.js API Routes dengan middleware

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL Database (atau SQLite untuk development)

## 🛠️ Installation

1. Clone repository:
```bash
git clone https://github.com/BroAegg/web-koperasi-umb.git
cd web-koperasi-umb
```

2. Install dependencies:
```bash
npm install
```

3. Setup database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

4. Setup environment variables:
```bash
cp .env.example .env.local
# Edit .env.local dengan database connection dan secrets
```

## 🚀 Development

Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 🏭 Production

Build untuk production:
```bash
npm run build
npm run start
```

## 🧪 Code Quality

Lint code:
```bash
npm run lint
npm run lint:fix
```

## 📁 Struktur Project

```
web-koperasi-umb/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   │   ├── broadcasts/    # Broadcast management API
│   │   ├── categories/    # Product categories API
│   │   ├── dashboard/     # Dashboard data API
│   │   ├── financial/     # Financial transactions API
│   │   ├── members/       # Member management API
│   │   ├── products/      # Product management API
│   │   └── stock-movements/ # Inventory movements API
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── signup/        # Registration page
│   ├── koperasi/          # Main application
│   │   ├── dashboard/     # Dashboard overview
│   │   ├── financial/     # Financial management
│   │   ├── inventory/     # Product & stock management
│   │   ├── membership/    # Member management
│   │   └── broadcast/     # Announcements
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Database connection
│   ├── utils.ts          # Helper functions
│   └── notification-context.tsx # Global notifications
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── public/               # Static assets
├── package.json          # Dependencies
├── next.config.ts        # Next.js config
├── tailwind.config.js    # Tailwind config
└── tsconfig.json         # TypeScript config
```

## 📊 Fitur Utama

### 🏠 Dashboard
- Overview statistik koperasi real-time
- Ringkasan finansial harian
- Quick actions untuk akses cepat
- Chart dan analytics (ready for implementation)

### 💰 Financial Management (NEW!)
- **Pencatatan transaksi harian** (SALE, PURCHASE, INCOME, EXPENSE)
- **Dashboard keuangan** dengan summary pemasukan/pengeluaran
- **Auto-formatting mata uang Rupiah** dengan separator ribuan
- **Filter berdasarkan tanggal** untuk tracking harian
- **Payment method tracking** (Cash, Transfer, Credit) dengan color coding
- **CRUD operations** dengan validation dan error handling

### 📦 Inventory Management
- **CRUD produk koperasi** dengan kategori
- **Real-time stock tracking** dengan stock movements
- **Stock IN/OUT operations** dengan modal confirmation
- **Alert untuk stok rendah** (threshold-based)
- **Riwayat pergerakan stok** dengan timestamp
- **Search dan filter** produk berdasarkan kategori

### 👥 Member Management
- **Registrasi anggota baru** dengan validation
- **Manajemen data anggota** (CRUD operations)
- **Member profile** dengan informasi lengkap
- **Search functionality** untuk pencarian cepat
- **Email uniqueness validation**

### 📢 Broadcast System
- **Pengumuman untuk anggota** dengan scheduling
- **Notifikasi management** dengan delivery status
- **Target audience selection**
- **Broadcast history** dan tracking

### 🔐 Authentication & Security
- **Login/Registration pages** dengan validation
- **Session management** (ready for implementation)
- **Form validation** dengan user-friendly error messages
- **API middleware** untuk request validation

## 🎨 UI/UX Features

- **Responsive Design**: Optimized untuk desktop, tablet, dan mobile
- **Modern Interface**: Clean, minimalist, dan intuitive
- **Indonesian Localization**: Format mata uang Rupiah, waktu lokal
- **Consistent Design System**: Reusable components dengan Tailwind CSS
- **Loading States**: Smooth user experience dengan skeleton loading
- **Error Handling**: User-friendly error messages dan validation
- **Global Notifications**: Centered beautiful notifications system
- **Confirmation Dialogs**: Safe operations dengan confirmation modals
- **Icon Consistency**: Lucide React icons untuk tema minimalist
- **Color Coding**: Payment methods dan transaction types dengan warna distinct

## 🔧 Database Architecture

### Entity Relationship:
- **Users** → Authentication dan profil user
- **Members** → Data anggota koperasi  
- **Products** ↔ **Categories** → Manajemen produk dengan kategori
- **Transactions** → Pencatatan keuangan harian
- **StockMovements** ↔ **Products** → Tracking pergerakan stok
- **Broadcasts** → Sistem pengumuman dan komunikasi

### Key Features:
- **Relational design** dengan foreign keys
- **Decimal precision** untuk financial data
- **Timestamps** untuk audit trail
- **Enum types** untuk data consistency
- **Unique constraints** untuk data integrity

## 🚀 Backend API

### API Endpoints:
- `GET/POST /api/members` - Member management
- `GET/POST /api/products` - Product management  
- `GET/POST /api/financial/transactions` - Financial operations
- `GET /api/financial/summary` - Daily financial summary
- `GET/POST /api/stock-movements` - Inventory operations
- `GET/POST /api/broadcasts` - Communication management
- `GET /api/categories` - Product categories
- `GET /api/dashboard` - Dashboard statistics

### Features:
- **RESTful API design** dengan proper HTTP methods
- **TypeScript interfaces** untuk type safety
- **Error handling middleware** dengan consistent responses
- **Validation** di frontend dan backend
- **Date-based filtering** untuk historical data

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Development Team**: UMB Team
- **Repository Owner**: BroAegg

---