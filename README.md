# 🏗️ Web Koperasi UM Bandung - Full Rebuild Project

> **Status:** 🚧 **UNDER RECONSTRUCTION** - Building from ground up with modern architecture  
> **Start Date:** October 26, 2025  
> **Target Launch:** November 30, 2025

Sistem Informasi Koperasi Universitas Muhammadiyah Bandung - Dibangun ulang dengan arsitektur modern, type-safe, dan maintainable.

---

## 📊 Project Status

| Aspect | Status |
|--------|--------|
| **Planning** | ✅ Complete |
| **Tech Stack** | ✅ Decided |
| **Week 1** | ⏳ Starting Oct 26 |
| **Week 2-4** | 🔜 Feature Migration |
| **Week 5-6** | 🔜 Testing & Docs |
| **Week 7** | 🔜 Deployment |

---

## 🎯 Why Rebuild?

Previous version faced recurring issues:
- 🔴 Database schema mismatches (field name errors)
- 🔴 API inconsistencies (403/500 errors)
- ⚠️ Scattered state management
- ⚠️ 92 documentation files (chaos!)
- ⚠️ No automated testing

**Solution:** Fresh start with modern best practices.

📖 **Read Full Analysis:** [PROJECT-REBUILD-ANALYSIS.md](./PROJECT-REBUILD-ANALYSIS.md)

---

## 🚀 New Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **State Management:** Zustand (global state)
- **Data Fetching:** TanStack Query (via tRPC)
- **Forms:** React Hook Form + Zod validation

### Backend
- **API Layer:** tRPC (end-to-end type safety)
- **Database:** PostgreSQL + Prisma ORM (with proper migrations)
- **Authentication:** NextAuth.js v5
- **Validation:** Zod schemas

### DevOps & Testing
- **Unit Tests:** Vitest
- **E2E Tests:** Playwright
- **CI/CD:** GitHub Actions
- **Containerization:** Docker
- **Deployment:** Vercel/Railway

---

## 📋 Prerequisites

- **Node.js:** >= 20.0.0
- **npm:** >= 10.0.0
- **PostgreSQL:** >= 16.0
- **Git:** Latest version

---

## 🛠️ Quick Start (Coming Soon)

```bash
# Clone repository
git clone https://github.com/BroAegg/Web_Koperasi_UMBandung.git
cd Web_Koperasi_UMBandung

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## 📁 Project Structure (Planned)

```
web-koperasi-umb/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   ├── (roles)/           # Role-based pages
│   │   │   ├── koperasi/      # Admin/Koperasi dashboard
│   │   │   ├── supplier/      # Supplier dashboard
│   │   │   └── kasir/         # Kasir dashboard
│   │   └── api/               # API routes (tRPC handlers)
│   ├── server/                # tRPC backend
│   │   ├── routers/           # API routers
│   │   ├── middleware/        # Auth & logging middleware
│   │   └── context.ts         # tRPC context
│   ├── components/            # React components
│   │   ├── ui/                # shadcn components
│   │   ├── shared/            # Shared components
│   │   └── features/          # Feature-specific components
│   ├── lib/                   # Utilities
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   └── validations/       # Zod schemas
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed.ts                # Seed data
├── tests/
│   ├── unit/                  # Unit tests
│   └── e2e/                   # E2E tests
├── docs/                      # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
└── .github/
    └── workflows/             # CI/CD pipelines
```

---

## 🎯 Planned Features

### 👥 Role Management
- **DEVELOPER** (dev mode only)
- **SUPER_ADMIN** (full access + activity logs)
- **ADMIN** (koperasi operations)
- **KASIR** (point of sale)
- **STAFF** (inventory & members)
- **SUPPLIER** (external partners)

### 💰 Financial Module
- Daily/Weekly/Monthly summary
- Transaction management
- Real-time balance tracking
- Charts & analytics
- Export to CSV/PDF

### 🛒 Point of Sale
- Fast product search
- Multiple payment methods
- Receipt printing
- Transaction history

### 📦 Inventory
- Product CRUD with categories
- Stock movements tracking
- Low stock alerts
- Bulk import/export

### 🏢 Supplier Management
- Registration & approval
- Product linkage
- Payment tracking
- Performance analytics

---

## 📚 Documentation

- **[PROJECT-REBUILD-ANALYSIS.md](./PROJECT-REBUILD-ANALYSIS.md)** - Full rebuild analysis
- **[ISSUES-TRACKER.md](./ISSUES-TRACKER.md)** - Bug tracking

More docs coming during development.

---

## 📅 6-Week Roadmap

| Week | Focus | Status |
|------|-------|--------|
| **Week 1** | Foundation Setup | ⏳ Starting Oct 26 |
| **Week 2** | Financial Module | 🔜 Coming |
| **Week 3** | POS & Inventory | 🔜 Coming |
| **Week 4** | Suppliers & Members | 🔜 Coming |
| **Week 5** | Testing & Polish | 🔜 Coming |
| **Week 6** | Deployment | 🔜 Coming |

---

## 👥 Team

- **Aegner** - Lead Developer
- **Reyvan** - Developer
- **GitHub Copilot** - AI Assistant

---

**Built with ❤️ for UM Bandung Koperasi**
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