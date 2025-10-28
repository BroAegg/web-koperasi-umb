# 🏪 Web Koperasi Universitas Muhammadiyah Bandung# 🏗️ Web Koperasi UM Bandung - Full Rebuild Project



Modern web application untuk manajemen koperasi dengan fitur POS, inventory, consignment payments, dan analytics dashboard yang komprehensif.> **Status:** 🚧 **UNDER RECONSTRUCTION** - Building from ground up with modern architecture  

> **Start Date:** October 26, 2025  

## ✨ Features> **Target Launch:** November 30, 2025



- 🛒 **POS System** - Point of Sale dengan receipt printing dan real-time inventory updatesSistem Informasi Koperasi Universitas Muhammadiyah Bandung - Dibangun ulang dengan arsitektur modern, type-safe, dan maintainable.

- 📦 **Inventory Management** - Stock tracking, supplier management, dan automatic reorder alerts

- 💰 **Consignment Payments** - Automated supplier payment system dengan verification workflow---

- 📊 **Analytics Dashboard** - Sales trends, best sellers, peak hours, dan customer analytics

- 👥 **User Management** - Role-based access control (Super Admin, Admin, Supplier)## 📊 Project Status

- 📱 **Mobile Responsive** - Optimized untuk semua device sizes

- 🔒 **Secure Authentication** - JWT-based dengan NextAuth.js| Aspect | Status |

- 🌐 **Multi-language Ready** - Prepared untuk internationalization|--------|--------|

- 📈 **Real-time Updates** - Live data synchronization| **Planning** | ✅ Complete |

- 🎨 **Modern UI/UX** - Clean design dengan Tailwind CSS| **Tech Stack** | ✅ Decided |

| **Week 1** | ⏳ Starting Oct 26 |

## 🚀 Quick Start| **Week 2-4** | 🔜 Feature Migration |

| **Week 5-6** | 🔜 Testing & Docs |

### Option 1: Docker (Recommended)| **Week 7** | 🔜 Deployment |



```bash---

# Clone repository

git clone https://github.com/BroAegg/web-koperasi-umb.git## 🎯 Why Rebuild?

cd web-koperasi-umb

Previous version faced recurring issues:

# Start with Docker Compose- 🔴 Database schema mismatches (field name errors)

docker-compose up --build -d- 🔴 API inconsistencies (403/500 errors)

- ⚠️ Scattered state management

# Access application- ⚠️ 92 documentation files (chaos!)

open http://localhost:3000- ⚠️ No automated testing



# View logs**Solution:** Fresh start with modern best practices.

docker-compose logs -f app

```📖 **Read Full Analysis:** [PROJECT-REBUILD-ANALYSIS.md](./PROJECT-REBUILD-ANALYSIS.md)



### Option 2: Manual Installation---



```bash## 🚀 New Tech Stack

# Install dependencies

npm install### Frontend

- **Framework:** Next.js 15 (App Router) + React 19

# Setup environment- **Styling:** Tailwind CSS 4

cp .env.production.ready .env- **UI Components:** shadcn/ui (Radix UI + Tailwind)

# Edit .env with your database credentials- **State Management:** Zustand (global state)

- **Data Fetching:** TanStack Query (via tRPC)

# Setup database- **Forms:** React Hook Form + Zod validation

mysql -u root -p < complete-database-setup.sql

### Backend

# Generate Prisma client- **API Layer:** tRPC (end-to-end type safety)

npx prisma generate- **Database:** PostgreSQL + Prisma ORM (with proper migrations)

- **Authentication:** NextAuth.js v5

# Build application- **Validation:** Zod schemas

npm run build

### DevOps & Testing

# Start production server- **Unit Tests:** Vitest

npm start- **E2E Tests:** Playwright

```- **CI/CD:** GitHub Actions

- **Containerization:** Docker

### Option 3: Development Mode- **Deployment:** Vercel/Railway



```bash---

# Install dependencies

npm install## 📋 Prerequisites



# Setup environment- **Node.js:** >= 20.0.0

cp .env.production.ready .env- **npm:** >= 10.0.0

- **PostgreSQL:** >= 16.0

# Run development server- **Git:** Latest version

npm run dev

---

# Open http://localhost:3000

```## 🛠️ Quick Start (Coming Soon)



## 🔐 Default Login```bash

# Clone repository

| Role | Email | Password |git clone https://github.com/BroAegg/Web_Koperasi_UMBandung.git

|------|-------|----------|cd Web_Koperasi_UMBandung

| Super Admin | admin@mekarmukti.id | admin123 |

| Admin | admin@koperasi.com | admin123 |# Install dependencies

| Supplier | supplier@example.com | supplier123 |npm install



## 🏗️ Tech Stack# Setup environment

cp .env.example .env.local

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS# Edit .env.local with your database credentials

- **Backend:** Next.js API Routes, Prisma ORM

- **Database:** MySQL 8.0# Setup database

- **Authentication:** NextAuth.js with JWTnpx prisma migrate dev

- **Deployment:** Docker, Docker Composenpx prisma db seed

- **Development:** ESLint, TypeScript, Prettier

- **Icons:** Lucide React# Start development server

- **UI Components:** Custom components with Tailwindnpm run dev

```

## 📊 Database Schema

Visit `http://localhost:3000`

- **Users** - Authentication dan role management

- **Products** - Product catalog dengan categories---

- **Suppliers** - Supplier registration dan management

- **Transactions** - Sales transactions dengan detailed items## 📁 Project Structure (Planned)

- **ConsignmentPayments** - Automated payment calculations

- **StockMovements** - Inventory tracking```

- **Categories** - Product categorizationweb-koperasi-umb/

- **ActivityLogs** - System activity tracking├── src/

│   ├── app/                    # Next.js App Router

## 🔧 Configuration│   │   ├── (auth)/            # Auth pages

│   │   ├── (roles)/           # Role-based pages

### Environment Variables│   │   │   ├── koperasi/      # Admin/Koperasi dashboard

│   │   │   ├── supplier/      # Supplier dashboard

```env│   │   │   └── kasir/         # Kasir dashboard

NODE_ENV=production│   │   └── api/               # API routes (tRPC handlers)

DATABASE_URL="mysql://user:password@localhost:3306/database"│   ├── server/                # tRPC backend

NEXTAUTH_URL="https://yourdomain.com"│   │   ├── routers/           # API routers

NEXTAUTH_SECRET="your-secret-key"│   │   ├── middleware/        # Auth & logging middleware

JWT_SECRET="your-jwt-secret"│   │   └── context.ts         # tRPC context

```│   ├── components/            # React components

│   │   ├── ui/                # shadcn components

### Docker Environment│   │   ├── shared/            # Shared components

│   │   └── features/          # Feature-specific components

```bash│   ├── lib/                   # Utilities

# Build and start│   │   ├── db.ts              # Prisma client

docker-compose up --build -d│   │   ├── auth.ts            # NextAuth config

│   │   └── validations/       # Zod schemas

# Stop services│   ├── hooks/                 # Custom React hooks

docker-compose down│   ├── stores/                # Zustand stores

│   └── types/                 # TypeScript types

# View logs├── prisma/

docker-compose logs -f│   ├── schema.prisma          # Database schema

│   ├── migrations/            # Migration history

# Restart specific service│   └── seed.ts                # Seed data

docker-compose restart app├── tests/

│   ├── unit/                  # Unit tests

# Execute commands in container│   └── e2e/                   # E2E tests

docker-compose exec app npm run prisma:migrate├── docs/                      # Documentation

```│   ├── API.md

│   ├── DATABASE.md

## 🚀 Deployment│   └── DEPLOYMENT.md

└── .github/

### Docker Deployment    └── workflows/             # CI/CD pipelines

```

1. **Clone dan configure:**

   ```bash---

   git clone https://github.com/BroAegg/web-koperasi-umb.git

   cd web-koperasi-umb## 🎯 Planned Features

   cp .env.docker .env

   # Edit .env dengan production values### 👥 Role Management

   ```- **DEVELOPER** (dev mode only)

- **SUPER_ADMIN** (full access + activity logs)

2. **Deploy dengan Docker:**- **ADMIN** (koperasi operations)

   ```bash- **KASIR** (point of sale)

   docker-compose up --build -d- **STAFF** (inventory & members)

   ```- **SUPPLIER** (external partners)



3. **Verify deployment:**### 💰 Financial Module

   ```bash- Daily/Weekly/Monthly summary

   curl http://localhost:3000/api/auth/me- Transaction management

   ```- Real-time balance tracking

- Charts & analytics

### Manual Deployment- Export to CSV/PDF



1. **Setup server dengan Node.js 18+**### 🛒 Point of Sale

2. **Clone dan install:**- Fast product search

   ```bash- Multiple payment methods

   git clone https://github.com/BroAegg/web-koperasi-umb.git- Receipt printing

   cd web-koperasi-umb- Transaction history

   npm install --production

   ```### 📦 Inventory

- Product CRUD with categories

3. **Setup database dan environment**- Stock movements tracking

4. **Build dan start:**- Low stock alerts

   ```bash- Bulk import/export

   npm run build

   npm start### 🏢 Supplier Management

   ```- Registration & approval

- Product linkage

### Git Auto-Deployment- Payment tracking

- Performance analytics

Setup automated deployment dengan GitHub webhooks:

---

```bash

# Setup Git hooks## 📚 Documentation

chmod +x setup-git-deployment.sh

./setup-git-deployment.sh- **[PROJECT-REBUILD-ANALYSIS.md](./PROJECT-REBUILD-ANALYSIS.md)** - Full rebuild analysis

- **[ISSUES-TRACKER.md](./ISSUES-TRACKER.md)** - Bug tracking

# Configure GitHub webhook

# URL: https://yourdomain.com/webhook-handler.phpMore docs coming during development.

# Secret: KoperasiUMB2025WebhookSecret!

```---



## 📝 API Documentation## 📅 6-Week Roadmap



### Authentication| Week | Focus | Status |

- `POST /api/auth/login` - User login|------|-------|--------|

- `POST /api/auth/logout` - User logout| **Week 1** | Foundation Setup | ⏳ Starting Oct 26 |

- `GET /api/auth/me` - Get current user| **Week 2** | Financial Module | 🔜 Coming |

- `PUT /api/auth/profile` - Update user profile| **Week 3** | POS & Inventory | 🔜 Coming |

| **Week 4** | Suppliers & Members | 🔜 Coming |

### POS System| **Week 5** | Testing & Polish | 🔜 Coming |

- `POST /api/pos/transaction` - Create new transaction| **Week 6** | Deployment | 🔜 Coming |

- `GET /api/transactions` - Get transactions list

- `GET /api/transactions/[id]` - Get transaction details---



### Inventory## 👥 Team

- `GET /api/products` - Get products list

- `POST /api/products` - Create new product- **Aegner** - Lead Developer

- `PUT /api/products/[id]` - Update product- **Reyvan** - Developer

- `DELETE /api/products/[id]` - Delete product- **GitHub Copilot** - AI Assistant



### Analytics---

- `GET /api/analytics/sales-trends` - Sales trend data

- `GET /api/analytics/best-sellers` - Best selling products**Built with ❤️ for UM Bandung Koperasi**

- `GET /api/analytics/peak-hours` - Peak hour analysis- **Broadcasts** → Sistem pengumuman dan komunikasi

- `GET /api/analytics/customers` - Customer analytics

### Key Features:

## 📱 Mobile Support- **Relational design** dengan foreign keys

- **Decimal precision** untuk financial data

- **Responsive Design:** Optimized untuk mobile, tablet, dan desktop- **Timestamps** untuk audit trail

- **Touch-friendly:** Large buttons dan swipe gestures- **Enum types** untuk data consistency

- **Offline Ready:** Basic offline functionality untuk POS- **Unique constraints** untuk data integrity

- **Progressive Web App:** Add to home screen support

## 🚀 Backend API

## 🔒 Security Features

### API Endpoints:

- **Authentication:** JWT-based dengan secure tokens- `GET/POST /api/members` - Member management

- **Authorization:** Role-based access control- `GET/POST /api/products` - Product management  

- **Input Validation:** Comprehensive input sanitization- `GET/POST /api/financial/transactions` - Financial operations

- **SQL Injection Protection:** Prisma ORM dengan parameterized queries- `GET /api/financial/summary` - Daily financial summary

- **XSS Protection:** Content Security Policy headers- `GET/POST /api/stock-movements` - Inventory operations

- **Rate Limiting:** API endpoint protection- `GET/POST /api/broadcasts` - Communication management

- `GET /api/categories` - Product categories

## 🛠️ Development- `GET /api/dashboard` - Dashboard statistics



### Commands### Features:

- **RESTful API design** dengan proper HTTP methods

```bash- **TypeScript interfaces** untuk type safety

# Development- **Error handling middleware** dengan consistent responses

npm run dev              # Start development server- **Validation** di frontend dan backend

npm run build           # Build for production- **Date-based filtering** untuk historical data

npm run start           # Start production server

npm run lint            # Run ESLint## 🤝 Contributing

npm run type-check      # TypeScript type checking

1. Fork the project

# Database2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

npx prisma generate     # Generate Prisma client3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

npx prisma migrate dev  # Run database migrations4. Push to the branch (`git push origin feature/AmazingFeature`)

npx prisma studio       # Open Prisma Studio5. Open a Pull Request

npx prisma db seed      # Seed database with sample data

## 📝 License

# Docker

docker-compose up -d    # Start all servicesThis project is licensed under the MIT License.

docker-compose down     # Stop all services

docker-compose logs -f  # View logs## 👥 Team

```

- **Development Team**: UMB Team

### Project Structure- **Repository Owner**: BroAegg



```---
web-koperasi-umb/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── koperasi/          # Main application pages
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities dan helpers
├── prisma/               # Database schema dan migrations
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Docker image definition
└── package.json         # Dependencies dan scripts
```

## 📊 Performance

- **Build Size:** ~102kB first load JS
- **Lighthouse Score:** 95+ performance
- **Core Web Vitals:** Optimized LCP, FID, CLS
- **Database:** Optimized queries dengan proper indexing
- **Caching:** Static generation dan API response caching

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- **Email:** admin@mekarmukti.id
- **Website:** https://mekarmukti.id
- **GitHub Issues:** [Create Issue](https://github.com/BroAegg/web-koperasi-umb/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Prisma Team** - Excellent ORM solution
- **Tailwind CSS** - Beautiful utility-first CSS framework
- **NextAuth.js** - Complete authentication solution
- **Lucide** - Beautiful icon set

---

**Made with ❤️ for Universitas Muhammadiyah Bandung**