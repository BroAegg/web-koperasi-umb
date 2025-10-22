# 🤖 COPILOT AGENT INSTRUCTIONS - Web Koperasi UMB Rebuild

**Target:** GitHub Copilot atau AI Assistant yang akan membantu rebuild project  
**Version:** 1.0  
**Last Updated:** 22 Oktober 2025

---

## 🎯 PROJECT CONTEXT

Anda adalah AI assistant yang akan membantu rebuild **Web Koperasi Universitas Muhammadiyah Bandung** dari scratch. Project lama memiliki masalah arsitektur yang serius (database schema chaos, API inconsistency, state management issues). Kita melakukan full rebuild dengan tech stack modern.

### Key Files You MUST Read First:
1. **PROJECT-REBUILD-ANALYSIS.md** - Lengkap analysis masalah lama & solusi rebuild
2. **ISSUES-TRACKER.md** - Tempat track semua issues yang ditemukan
3. **README.md** - Overview project & getting started

---

## 📋 YOUR MISSION

### Primary Objective:
Build a **clean**, **type-safe**, **maintainable** web application untuk manajemen koperasi dengan fitur:
- Financial management (transaksi, laporan keuangan)
- Point of Sale (POS) system
- Inventory management
- Member management
- Supplier management
- Multi-role access (Developer, Super Admin, Admin, Kasir, Staff, Supplier)
- Activity logging untuk audit trail

### Success Criteria:
- ✅ Zero TypeScript errors (strict mode)
- ✅ 100% type-safe API (tRPC)
- ✅ All forms validated with Zod
- ✅ 80%+ test coverage
- ✅ Responsive UI (mobile-first)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Performance: LCP < 2s, FID < 100ms

---

## 🏗️ TECH STACK (MANDATORY)

```typescript
// Frontend
✅ Next.js 15 (App Router)
✅ React 19
✅ TypeScript (strict mode)
✅ Tailwind CSS 4
✅ shadcn/ui (component library)
✅ Zustand (global state)
✅ TanStack Query (via tRPC)
✅ React Hook Form + Zod

// Backend
✅ Next.js API Routes
✅ tRPC v11 (type-safe API)
✅ Prisma ORM (with proper migrations)
✅ PostgreSQL 16
✅ NextAuth.js v5 (authentication)

// Testing
✅ Vitest (unit tests)
✅ Playwright (E2E tests)
✅ Testing Library (component tests)

// DevOps
✅ GitHub Actions (CI/CD)
✅ Docker (containerization)
✅ ESLint + Prettier (code quality)
✅ Husky (pre-commit hooks)
```

**DO NOT USE:**
- ❌ Redux/MobX (use Zustand)
- ❌ REST API (use tRPC)
- ❌ Class components (use functional + hooks)
- ❌ CSS Modules (use Tailwind)
- ❌ Any/unknown types (always type properly)

---

## 📁 FOLDER STRUCTURE (MUST FOLLOW)

```
web-koperasi-umb/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes (login, signup)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/              # Authenticated routes
│   │   │   ├── layout.tsx            # Dashboard layout (sidebar, header)
│   │   │   ├── page.tsx              # Redirect to role dashboard
│   │   │   ├── developer/            # Developer role
│   │   │   ├── super-admin/          # Super Admin role
│   │   │   ├── admin/                # Admin role
│   │   │   ├── kasir/                # Kasir role
│   │   │   ├── staff/                # Staff role
│   │   │   └── supplier/             # Supplier role
│   │   ├── api/                      # tRPC API handler
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   │
│   ├── server/                       # Backend logic
│   │   ├── routers/                  # tRPC routers
│   │   │   ├── auth.ts
│   │   │   ├── financial.ts
│   │   │   ├── inventory.ts
│   │   │   ├── pos.ts
│   │   │   ├── members.ts
│   │   │   ├── suppliers.ts
│   │   │   └── activity-logs.ts
│   │   ├── middleware/               # Middleware (auth, permissions)
│   │   ├── services/                 # Business logic
│   │   ├── context.ts                # tRPC context
│   │   └── index.ts                  # Root router
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── db.ts                     # Prisma client
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── trpc/                     # tRPC client
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── validations/              # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── financial.ts
│   │   │   ├── inventory.ts
│   │   │   └── ...
│   │   └── utils/                    # Helper functions
│   │       ├── currency.ts
│   │       ├── date.ts
│   │       └── format.ts
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── shared/                   # Shared components
│   │   │   ├── data-table.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── currency-input.tsx
│   │   │   └── loading-spinner.tsx
│   │   └── features/                 # Feature-specific components
│   │       ├── financial/
│   │       │   ├── summary-card.tsx
│   │       │   ├── metrics-cards.tsx
│   │       │   ├── chart.tsx
│   │       │   └── transaction-table.tsx
│   │       ├── inventory/
│   │       ├── pos/
│   │       ├── members/
│   │       └── suppliers/
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-current-user.ts
│   │   ├── use-permissions.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── app-store.ts
│   │   ├── pos-store.ts
│   │   └── notification-store.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── index.ts
│   │   ├── models.ts                 # Prisma model types
│   │   └── api.ts                    # API types
│   │
│   └── styles/                       # Additional styles
│       └── globals.css
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration files
│   └── seed.ts                       # Database seed
│
├── tests/
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # E2E tests
│
├── public/                           # Static assets
│   ├── images/
│   └── fonts/
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── COPILOT-INSTRUCTIONS.md           # This file
├── ISSUES-TRACKER.md                 # Issue tracking
├── PROJECT-REBUILD-ANALYSIS.md       # Analysis doc
└── README.md                         # Main readme
```

---

## 🎨 UI/UX DESIGN REFERENCE (KIBLAT)

### Design yang Harus Dipertahankan dari Project Lama:

1. **Super Admin Dashboard** (src: `app/koperasi/super-admin-dashboard/page.tsx`)
   - Clean card-based layout
   - Stats cards dengan icons (Lucide React)
   - Color scheme: Blue/Green/Purple gradient
   - Responsive grid layout

2. **Developer Dashboard** (src: `app/koperasi/developer-dashboard/page.tsx`)
   - System metrics cards
   - Activity logs table
   - Clean typography dengan Inter font
   - Dark mode toggle ready

3. **Financial Page** (src: `app/koperasi/financial/page.tsx`)
   - Saldo Tersedia card (vertical layout, centered)
   - 3 Metrics cards (Transaksi, Pembayaran, Rata-rata)
   - Line chart dengan Recharts
   - Transaction table dengan pagination
   - Period selector (Hari Ini, 7 Hari, 1 Bulan, 3 Bulan, 1 Tahun)

4. **Component Design Patterns:**
   ```typescript
   // Card component pattern
   <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
     <CardHeader>
       <div className="flex items-center justify-between">
         <Icon className="h-8 w-8 text-white" />
         <Badge>Status</Badge>
       </div>
     </CardHeader>
     <CardContent>
       <h3 className="text-4xl font-bold text-white">
         {formatCurrency(amount)}
       </h3>
     </CardContent>
   </Card>
   ```

5. **Color Palette:**
   ```css
   /* Primary */
   --primary: Blue (500-600)
   --secondary: Green (500-600)
   --accent: Purple (500-600)
   
   /* Status Colors */
   --success: Green 500
   --warning: Yellow 500
   --error: Red 500
   --info: Blue 500
   
   /* Neutrals */
   --background: White / Gray 50
   --foreground: Gray 900
   --muted: Gray 100
   --border: Gray 200
   ```

---

## 🔐 ROLE-BASED ARCHITECTURE

### Role Hierarchy (Top to Bottom):
```
DEVELOPER (dev mode only, full access)
  └─ SUPER_ADMIN (production + dev, full access)
      ├─ ADMIN (koperasi operations)
      │   ├─ KASIR (point of sale)
      │   └─ STAFF (inventory, members)
      └─ SUPPLIER (external partners, limited access)
```

### Permission Matrix:

| Module | View | Create | Edit | Delete | Export |
|--------|------|--------|------|--------|--------|
| **Dashboard** |
| Super Admin Dashboard | SUPER_ADMIN, DEVELOPER | - | - | - | - |
| Admin Dashboard | ADMIN, SUPER_ADMIN, DEVELOPER | - | - | - | - |
| **Financial** |
| View Transactions | ADMIN, SUPER_ADMIN, DEVELOPER | - | - | - | - |
| Create Transaction | ADMIN, SUPER_ADMIN, DEVELOPER | ✅ | - | - | - |
| Edit Transaction | SUPER_ADMIN, DEVELOPER | - | ✅ | - | - |
| Delete Transaction | SUPER_ADMIN, DEVELOPER | - | - | ✅ | - |
| Export Reports | ADMIN, SUPER_ADMIN, DEVELOPER | - | - | - | ✅ |
| **POS** |
| View Products | KASIR, ADMIN, SUPER_ADMIN | - | - | - | - |
| Create Transaction | KASIR, ADMIN, SUPER_ADMIN | ✅ | - | - | - |
| Refund | ADMIN, SUPER_ADMIN | - | ✅ | - | - |
| **Inventory** |
| View Products | STAFF, ADMIN, SUPER_ADMIN | - | - | - | - |
| Create Product | STAFF, ADMIN, SUPER_ADMIN | ✅ | - | - | - |
| Edit Product | ADMIN, SUPER_ADMIN | - | ✅ | - | - |
| Delete Product | SUPER_ADMIN | - | - | ✅ | - |
| **Members** |
| View Members | STAFF, ADMIN, SUPER_ADMIN | - | - | - | - |
| Create Member | STAFF, ADMIN, SUPER_ADMIN | ✅ | - | - | - |
| Edit Member | ADMIN, SUPER_ADMIN | - | ✅ | - | - |
| **Suppliers** |
| View Suppliers | ADMIN, SUPER_ADMIN | - | - | - | - |
| Approve Supplier | SUPER_ADMIN | ✅ | - | - | - |
| Supplier Dashboard | SUPPLIER | ✅ | - | - | - | - |
| **Activity Logs** |
| View All Logs | DEVELOPER | - | - | - | - |
| View Own Logs | SUPER_ADMIN | - | - | - | - |

### Implementation Pattern:

```typescript
// src/server/middleware/permissions.ts
import { TRPCError } from '@trpc/server';
import type { Role } from '@prisma/client';

export const permissions = {
  financial: {
    view: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'],
    create: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'],
    edit: ['DEVELOPER', 'SUPER_ADMIN'],
    delete: ['DEVELOPER', 'SUPER_ADMIN'],
    export: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'],
  },
  pos: {
    view: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'KASIR'],
    transaction: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'KASIR'],
    refund: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'],
  },
  inventory: {
    view: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'STAFF'],
    create: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'STAFF'],
    edit: ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'],
    delete: ['DEVELOPER', 'SUPER_ADMIN'],
  },
  // ... etc
} as const;

export function requirePermission(
  userRole: Role,
  module: keyof typeof permissions,
  action: string
) {
  const allowed = permissions[module][action as keyof typeof permissions[typeof module]];
  
  if (!allowed || !allowed.includes(userRole)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Role ${userRole} tidak memiliki akses untuk ${action} di modul ${module}`,
    });
  }
}

// Usage in tRPC procedure
export const financialRouter = router({
  createTransaction: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user.role, 'financial', 'create');
      // ... rest of logic
    }),
});
```

---

## 📊 DATABASE SCHEMA RULES

### MANDATORY Conventions:

1. **Table Names:** `snake_case` (lowercase, plural)
   ```prisma
   model users { }       // ✅ Correct
   model user { }        // ❌ Wrong (singular)
   model Users { }       // ❌ Wrong (PascalCase)
   ```

2. **Column Names:** `snake_case`
   ```prisma
   model users {
     created_at DateTime  // ✅ Correct
     createdAt DateTime   // ❌ Wrong (camelCase)
   }
   ```

3. **Relation Names:** `camelCase`
   ```prisma
   model users {
     transactions transactions[]  // ✅ Correct
     Transactions transactions[]  // ❌ Wrong (PascalCase)
   }
   ```

4. **Primary Keys:** Always `id` with `@id @default(cuid())`
   ```prisma
   model users {
     id String @id @default(cuid())  // ✅ Correct
     uuid String @id                  // ❌ Wrong (non-standard name)
   }
   ```

5. **Timestamps:** Always include
   ```prisma
   model users {
     created_at DateTime  @default(now())
     updated_at DateTime  @updatedAt
     deleted_at DateTime? // For soft deletes
   }
   ```

6. **Enums:** Define in schema, PascalCase
   ```prisma
   enum Role {
     DEVELOPER
     SUPER_ADMIN
     ADMIN
     KASIR
     STAFF
     SUPPLIER
   }
   ```

7. **Indexes:** Add for frequently queried fields
   ```prisma
   model users {
     email String @unique
     role  Role
     
     @@index([email])
     @@index([role, is_active])
   }
   ```

### Migration Rules:

```bash
# Create migration (development)
npx prisma migrate dev --name descriptive_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset

# NEVER use in production:
npx prisma db push  # ❌ Destructive, no migration history
```

---

## 🔒 SECURITY RULES

### ALWAYS:
1. ✅ Validate all inputs with Zod
2. ✅ Sanitize user inputs (prevent XSS)
3. ✅ Use parameterized queries (Prisma does this)
4. ✅ Hash passwords with bcrypt (min 10 rounds)
5. ✅ Use HTTPS only in production
6. ✅ Implement rate limiting
7. ✅ Log all admin actions (activity_logs table)
8. ✅ Use environment variables for secrets
9. ✅ Validate JWT tokens properly
10. ✅ Implement CSRF protection

### NEVER:
1. ❌ Trust user input without validation
2. ❌ Store passwords in plain text
3. ❌ Expose sensitive data in error messages
4. ❌ Log passwords or tokens
5. ❌ Use weak JWT secrets
6. ❌ Skip authentication middleware
7. ❌ Allow SQL injection (use Prisma ORM)
8. ❌ Use `any` type for user data
9. ❌ Store API keys in code
10. ❌ Disable TypeScript strict mode

---

## 📝 CODING STANDARDS

### TypeScript:
```typescript
// ✅ CORRECT
interface User {
  id: string;
  email: string;
  role: Role;
}

function getUserById(id: string): Promise<User | null> {
  return db.users.findUnique({ where: { id } });
}

// ❌ WRONG
function getUserById(id: any): any {
  return db.users.findUnique({ where: { id } });
}
```

### React Components:
```typescript
// ✅ CORRECT - Functional component with TypeScript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900'
      )}
    >
      {children}
    </button>
  );
}

// ❌ WRONG - No types, inline styles
export function Button(props) {
  return (
    <button onClick={props.onClick} style={{ padding: '8px' }}>
      {props.children}
    </button>
  );
}
```

### tRPC Procedures:
```typescript
// ✅ CORRECT - Proper validation, error handling, types
export const financialRouter = router({
  createTransaction: protectedProcedure
    .input(
      z.object({
        type: z.enum(['CASH_IN', 'CASH_OUT', 'TRANSFER']),
        amount: z.number().positive().max(999999999),
        description: z.string().min(3).max(255),
        category: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.user.role, 'financial', 'create');
      
      const transaction = await ctx.db.transactions.create({
        data: {
          ...input,
          created_by_id: ctx.user.id,
        },
      });
      
      await logActivity({
        userId: ctx.user.id,
        userRole: ctx.user.role,
        action: 'CREATE',
        module: 'FINANCIAL',
        description: `Created transaction: ${input.description}`,
      });
      
      return transaction;
    }),
});

// ❌ WRONG - No validation, no error handling
export const financialRouter = router({
  createTransaction: publicProcedure
    .mutation(async ({ ctx, input }: any) => {
      return ctx.db.transactions.create({ data: input });
    }),
});
```

### Error Handling:
```typescript
// ✅ CORRECT - Specific error types, helpful messages
try {
  const user = await db.users.findUniqueOrThrow({
    where: { id: userId },
  });
  return user;
} catch (error) {
  if (error instanceof Prisma.NotFoundError) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User tidak ditemukan',
    });
  }
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Terjadi kesalahan saat mengambil data user',
  });
}

// ❌ WRONG - Generic catch, no context
try {
  return await db.users.findUnique({ where: { id: userId } });
} catch (error) {
  console.log(error);
  throw error;
}
```

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests (Vitest):
```typescript
// src/lib/utils/currency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('Rp 1.000');
    expect(formatCurrency(1000000)).toBe('Rp 1.000.000');
  });

  it('should format negative numbers correctly', () => {
    expect(formatCurrency(-1000)).toBe('-Rp 1.000');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('Rp 0');
  });
});
```

### E2E Tests (Playwright):
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login as admin successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'admin@umb.ac.id');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard Admin');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toContainText('Email atau password salah');
  });
});
```

### Coverage Requirements:
- ✅ Unit tests: 80%+ coverage
- ✅ Critical paths: 100% coverage (auth, payments, financial)
- ✅ E2E tests: All main user flows

---

## 📚 DOCUMENTATION REQUIREMENTS

### Code Documentation:
```typescript
/**
 * Creates a new financial transaction
 * 
 * @param input - Transaction data (type, amount, description, category)
 * @returns Created transaction object
 * @throws {TRPCError} FORBIDDEN if user lacks permission
 * @throws {TRPCError} BAD_REQUEST if validation fails
 * @throws {TRPCError} INTERNAL_SERVER_ERROR if database operation fails
 * 
 * @example
 * ```ts
 * const transaction = await trpc.financial.createTransaction.mutate({
 *   type: 'CASH_IN',
 *   amount: 50000,
 *   description: 'Penjualan barang',
 *   category: 'SALES',
 * });
 * ```
 */
export const createTransaction = protectedProcedure
  .input(createTransactionSchema)
  .mutation(async ({ ctx, input }) => {
    // Implementation...
  });
```

### Component Documentation:
```typescript
/**
 * Financial summary card displaying available balance for the selected period
 * 
 * @param props.period - Selected time period (today, week, month, etc)
 * @param props.onPeriodChange - Callback when period changes
 * 
 * Features:
 * - Displays total available balance
 * - Shows breakdown by source (Toko, Titipan)
 * - Indicates surplus/deficit status
 * - Transaction count for the period
 * 
 * @example
 * ```tsx
 * <FinancialSummaryCard 
 *   period="today" 
 *   onPeriodChange={(p) => setPeriod(p)} 
 * />
 * ```
 */
export function FinancialSummaryCard({ period, onPeriodChange }: Props) {
  // Implementation...
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

### Code Quality:
- [ ] Zero TypeScript errors
- [ ] All ESLint warnings resolved
- [ ] Code formatted with Prettier
- [ ] No console.log statements
- [ ] No TODO/FIXME comments unresolved

### Testing:
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Manual testing completed
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing

### Security:
- [ ] Environment variables configured
- [ ] No secrets in code
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] CORS configured properly

### Performance:
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size optimized

### Database:
- [ ] Migrations applied
- [ ] Seed data loaded
- [ ] Indexes optimized
- [ ] Backup strategy in place

### Documentation:
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide ready
- [ ] User manual ready

---

## 🐛 DEBUGGING GUIDE

### Common Issues & Solutions:

#### 1. TypeScript Error: "Type X is not assignable to type Y"
```typescript
// ❌ Problem
const user: User = await db.users.findUnique({ where: { id } });
// Error: Type 'User | null' is not assignable to type 'User'

// ✅ Solution
const user = await db.users.findUniqueOrThrow({ where: { id } });
// OR
const user = await db.users.findUnique({ where: { id } });
if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
```

#### 2. tRPC Error: "UNAUTHORIZED"
```typescript
// Check:
1. Is user logged in? (check token in cookies)
2. Is token valid? (check expiry, signature)
3. Is user role allowed? (check permissions)

// Debug with:
console.log('User:', ctx.user);
console.log('Required roles:', permissions.financial.view);
```

#### 3. Prisma Error: "Unknown field 'X'"
```typescript
// Cause: Schema and database out of sync
// Solution:
1. npx prisma db pull  // Pull current DB schema
2. Check prisma/schema.prisma
3. npx prisma generate  // Regenerate client
4. Restart dev server
```

#### 4. React Error: "Hydration mismatch"
```typescript
// Cause: Server HTML != Client HTML
// Common causes:
- Using Date.now() or random values
- localStorage in server components
- Conditional rendering based on window object

// Solution: Use useEffect or dynamic imports
const Component = dynamic(() => import('./Component'), { ssr: false });
```

---

## 📞 COMMUNICATION PROTOCOL

### When to ask for help:
1. 🔴 **Critical bug** (app crashes, data loss): Ask immediately
2. ⚠️ **Blocked** (can't proceed): Ask within 30 minutes
3. 🟡 **Unsure** (design decision): Ask during daily sync
4. 🟢 **Nice to have** (optimization): Document and discuss later

### How to ask for help:
```markdown
## Issue: [Short title]

**Severity:** 🔴/⚠️/🟡/🟢
**Module:** Financial/POS/Inventory/etc
**File:** src/path/to/file.ts:123

### Problem
[Clear description of what's wrong]

### What I tried
1. Tried solution A → Result X
2. Tried solution B → Result Y

### Error message
```
[Paste full error stack trace]
```

### Expected behavior
[What should happen]

### Environment
- Node: 20.x
- Next: 15.5.4
- Database: PostgreSQL 16
```

### Use ISSUES-TRACKER.md
- Document every non-trivial issue
- Update status regularly
- Link to commits when resolved

---

## ✅ MILESTONES & DELIVERABLES

### Week 1: Foundation ✅
- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Database schema defined
- [ ] Authentication working (NextAuth.js)
- [ ] Basic layouts (login, dashboard)
- [ ] tRPC setup complete

### Week 2: Financial Module ✅
- [ ] Financial tRPC router complete
- [ ] Dashboard page with summary card
- [ ] Transaction table with filters
- [ ] Charts (Recharts)
- [ ] Export functionality

### Week 3: POS & Inventory ✅
- [ ] POS system (product search, cart, checkout)
- [ ] Inventory management (CRUD)
- [ ] Stock movements tracking
- [ ] Low stock alerts

### Week 4: Suppliers & Members ✅
- [ ] Supplier registration & approval
- [ ] Supplier dashboard
- [ ] Member management
- [ ] Member transactions (simpan pinjam)

### Week 5: Activity Logging & Reporting ✅
- [ ] Activity logs for all actions
- [ ] Logs viewer (Developer/Super Admin)
- [ ] Comprehensive reports
- [ ] Export to PDF/Excel

### Week 6: Testing & Launch 🚀
- [ ] Unit tests (80%+ coverage)
- [ ] E2E tests (main flows)
- [ ] Performance optimization
- [ ] Documentation complete
- [ ] Deployment to production

---

## 🎓 LEARNING RESOURCES

If you need to understand these technologies better:

### Core Technologies:
- **Next.js 15:** https://nextjs.org/docs
- **tRPC:** https://trpc.io/docs
- **Prisma:** https://prisma.io/docs
- **NextAuth.js:** https://next-auth.js.org
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com

### Patterns & Best Practices:
- **TypeScript Deep Dive:** https://basarat.gitbook.io/typescript
- **React Patterns:** https://patterns.dev
- **tRPC + Next.js Guide:** https://trpc.io/docs/nextjs

---

## 🎯 REMEMBER

### Golden Rules:
1. **Type Safety First** - Always type properly, never use `any`
2. **Test Before Push** - Run tests locally before committing
3. **Document as You Go** - Don't leave it for later
4. **Ask When Stuck** - Don't waste hours, ask for help
5. **Follow Conventions** - Consistency > personal preference
6. **Security Matters** - Validate inputs, check permissions
7. **Performance Matters** - Optimize early, not later
8. **User Experience Matters** - Loading states, error messages, responsive design

### Success Metrics:
- ✅ Zero runtime errors in production
- ✅ 80%+ test coverage
- ✅ Lighthouse score > 90
- ✅ Response time < 200ms (API)
- ✅ LCP < 2.5s (pages)
- ✅ Happy users (survey > 4.5/5)

---

**Prepared by:** Aegner + GitHub Copilot  
**For:** Future AI Copilot agents working on this project  
**Last Updated:** 22 Oktober 2025  
**Version:** 1.0

**Good luck! Build something amazing! 🚀**
