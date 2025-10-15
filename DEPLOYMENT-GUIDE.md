# Koperasi UMB - Web Management System

## 🎯 Project Overview
Sistem manajemen koperasi digital untuk Universitas Muhammadiyah Bandung dengan fitur lengkap untuk manajemen inventory, transaksi, supplier, dan keuangan.

## 👥 User Roles & Access

### 1. SUPER_ADMIN (Ketua, Sekretaris, Bendahara)
**Akses Login:**
- Email: `superadmin@koperasi.com`
- Password: `Password123!`

**Hak Akses:**
- ✅ Full access ke semua fitur
- ✅ Approve/reject supplier registrations
- ✅ Verify supplier payments
- ✅ View all financial reports
- ✅ Manage all inventory
- ✅ Override all transactions

**Dashboard:** `/koperasi/super-admin`

### 2. ADMIN (Pegawai Koperasi)
**Akses Login:**
- Email: `admin@koperasi.com`
- Password: `Password123!`

**Hak Akses:**
- ✅ Manage inventory (stock in/out)
- ✅ Process transactions & payments
- ✅ View supplier requests
- ✅ Verify supplier orders
- ❌ Cannot approve suppliers (requires super-admin)
- ❌ Cannot access full financial reports

**Dashboard:** `/koperasi/admin`

### 3. SUPPLIER (Pemasok)
**Akses Login:**
- Email: `supplier@koperasi.com`
- Password: `Password123!`

**Hak Akses:**
- ✅ Register as supplier (with Rp25,000/month fee)
- ✅ View own orders & products
- ✅ Upload product catalog
- ✅ Make monthly payments
- ✅ Receive order notifications
- ❌ Cannot access koperasi inventory
- ❌ Cannot view other suppliers

**Dashboard:** `/koperasi/supplier`

### 4. USER (Regular Member)
**Akses Login:**
- Email: `member1@koperasi.com` to `member5@koperasi.com`
- Password: `password123` (not hashed in seed - for demo only)

**Hak Akses:**
- ✅ View own transactions
- ✅ Make purchases
- ✅ View membership info
- ❌ No admin or supplier access

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database
- npm >= 8.0.0

### Installation

1. **Clone repository**
```powershell
git clone https://github.com/BroAegg/web-koperasi-umb.git
cd web-koperasi-umb
```

2. **Install dependencies**
```powershell
npm install
```

3. **Setup environment variables**
Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/koperasi_umb"
JWT_SECRET="your-secure-jwt-secret-here-change-this-in-production"
```

4. **Setup database**
```powershell
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with initial data
npx prisma db seed
```

5. **Run development server**
```powershell
npm run dev
```

Application will be available at: `http://localhost:3000`

## 📁 Project Structure

```
web-koperasi-umb/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── supplier/       # Supplier management
│   │   ├── products/       # Product CRUD
│   │   ├── financial/      # Financial reports
│   │   └── ...
│   └── koperasi/
│       ├── layout.tsx      # Main layout with navigation
│       ├── dashboard/      # General dashboard
│       ├── super-admin/    # Super admin pages
│       ├── admin/          # Admin pages
│       ├── supplier/       # Supplier pages
│       ├── inventory/      # Inventory management
│       ├── financial/      # Financial pages
│       ├── membership/     # Member management
│       └── broadcast/      # Broadcast messages
├── components/
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── auth.ts             # Authentication helpers
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility functions
└── prisma/
    ├── schema.prisma       # Database schema
    ├── seed.ts             # Database seeder
    └── migrations/         # Migration files
```

## 🔐 Authentication & Authorization

### JWT Implementation
- Tokens expire in 7 days
- Stored in localStorage (client-side)
- Sent via `Authorization: Bearer <token>` header
- Protected routes check role in middleware

### Role-Based Access Control (RBAC)
```typescript
// Example usage in API route
import { requireRole } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  const check = await requireRole('SUPER_ADMIN', 'ADMIN')(request);
  if (check && check.status !== 200) {
    return NextResponse.json(check.body, { status: check.status });
  }
  // Proceed with deletion
}
```

## 💳 Supplier Registration Flow

1. **Register** - Supplier creates account and fills profile
   - Business name
   - Product category
   - Contact details
   - Status: `PENDING`

2. **Admin Review** - Admin/Super-admin reviews application
   - Approve → Status: `APPROVED`
   - Reject → Status: `REJECTED` (with reason)

3. **Payment** - Supplier makes monthly payment (Rp25,000)
   - Upload payment proof
   - Admin verifies payment
   - Status: `ACTIVE`

4. **Active** - Supplier can now:
   - Receive orders from koperasi
   - Upload product catalog
   - View order history
   - Make monthly payments

## 📊 Key Features

### Inventory Management
- **Store-Owned Products** (Milik Toko)
  - Direct purchase from suppliers
  - COGS tracking
  - Average cost calculation

- **Consignment Products** (Titipan)
  - Fee-based model (percentage or flat)
  - FIFO batch tracking
  - Settlement management

### Stock Tracking
- Purchase In / Consignment In
- Sale Out
- Return In/Out
- Expired/Waste tracking
- Adjustment (stock opname)

### Financial Management
- Transaction tracking
- Revenue reports
- Profit/loss calculation
- Supplier settlements
- Consignor payments

## 🛠️ Development

### Adding New Features

1. **Update Prisma Schema**
```prisma
model NewFeature {
  id        String   @id @default(cuid())
  // ... fields
  @@map("new_features")
}
```

2. **Generate Migration**
```powershell
npx prisma migrate dev --name add_new_feature
```

3. **Create API Route**
```typescript
// app/api/new-feature/route.ts
export async function GET(request: NextRequest) {
  // Implementation
}
```

4. **Add UI Component**
```typescript
// app/koperasi/new-feature/page.tsx
export default function NewFeaturePage() {
  // Implementation
}
```

### Testing Accounts

All test accounts use password: `Password123!`

| Email | Role | Purpose |
|-------|------|---------|
| superadmin@koperasi.com | SUPER_ADMIN | Full system access |
| admin@koperasi.com | ADMIN | Inventory & transactions |
| supplier@koperasi.com | SUPPLIER | Supplier portal |
| member1-5@koperasi.com | USER | Regular members |

## 📝 TODO / Roadmap

- [ ] Email notifications for supplier approvals
- [ ] WhatsApp integration for broadcasts
- [ ] Mobile app (React Native)
- [ ] Advanced reporting & analytics
- [ ] Multi-location support
- [ ] API rate limiting
- [ ] Audit log viewer
- [ ] Batch operations

## 🤝 Team

- **Developer:** BroAegg & Reyvan
- **Institution:** Universitas Muhammadiyah Bandung
- **Project:** Digitalisasi Koperasi UMB

## 📄 License

MIT License - see LICENSE file for details

## 🔒 Security Notes

⚠️ **Before Production Deployment:**

1. Change all default passwords
2. Set strong JWT_SECRET in environment
3. Enable HTTPS/SSL
4. Implement rate limiting
5. Add CORS restrictions
6. Review and update security headers
7. Enable database backups
8. Use httpOnly cookies instead of localStorage for tokens
9. Implement 2FA for super-admin accounts
10. Add IP whitelisting for admin access

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/BroAegg/web-koperasi-umb/issues
- Email: [Your email]

---

Built with ❤️ for Koperasi Universitas Muhammadiyah Bandung
