# 🔧 DEVELOPER MODE IMPLEMENTATION TRACKING
## Role Switching, Environment Isolation, Activity Logging System

**Project:** Web Koperasi UMB - Developer Tools  
**Start Date:** 20 Oktober 2025  
**Team:** Reyvan (Backend) & Aegner (Frontend/UX)  
**Status:** 🟢 Phase 1 - In Progress

---

## 📋 **PROJECT OVERVIEW**

### **Business Requirements:**
Developer role untuk Reyvan & Aegner yang bisa:
1. ✅ **Switch Role** - Ganti role (ADMIN/SUPER_ADMIN/SUPPLIER/MEMBER) tanpa login/logout
2. ✅ **Environment Toggle** - Development vs Production mode untuk data isolation
3. ✅ **Activity Logging** - Tracking semua aktivitas Production (kecuali Developer mode)
4. ✅ **Data Isolation** - Development data tidak ganggu Production data

### **Technical Approach:**
- **Data Isolation Strategy:** Database Flag (`is_production: Boolean`)
- **Logging Strategy:** Comprehensive activity log dengan metadata JSON
- **Security:** Developer role restricted, production mode warnings
- **Architecture:** Middleware-based logging + session-based role switching

---

## 🎯 **IMPLEMENTATION PHASES**

### **Phase 1: Core Foundation** (Day 1 - Target: 20 Okt 2025) ⏳
**Duration:** 3-4 hours  
**Priority:** CRITICAL - Foundation untuk semua features

#### **1.1 Database Schema Updates** ⏳
**Status:** Not Started  
**Estimated:** 45 minutes

**Tasks:**
- [ ] Update Prisma schema:
  ```prisma
  // Add DEVELOPER to UserRole enum
  enum UserRole {
    USER
    ADMIN
    SUPER_ADMIN
    SUPPLIER
    DEVELOPER  // ← New role
  }
  
  // Add is_production flag to transaction tables
  model transactions {
    // ... existing fields
    is_production Boolean @default(true)  // ← New field
  }
  
  model transaction_items {
    // ... existing fields  
    is_production Boolean @default(true)  // ← New field
  }
  
  model stock_movements {
    // ... existing fields
    is_production Boolean @default(true)  // ← New field
  }
  
  model consignment_sales {
    // ... existing fields
    is_production Boolean @default(true)  // ← New field
  }
  
  model financial {
    // ... existing fields
    is_production Boolean @default(true)  // ← New field
  }
  
  // New model: Activity Log
  model activity_logs {
    id            Int      @id @default(autoincrement())
    userId        Int
    user          users    @relation(fields: [userId], references: [id], onDelete: Cascade)
    userRole      UserRole  // Role saat aktivitas dilakukan
    action        String    // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc
    module        String    // POS, INVENTORY, MEMBER, FINANCIAL, etc
    description   String    @db.Text
    metadata      Json?     // Additional data (productId, amount, etc)
    ipAddress     String?
    userAgent     String?
    is_production Boolean   @default(true)  // Filter dev vs prod
    createdAt     DateTime  @default(now())
    
    @@index([userId])
    @@index([userRole])
    @@index([module])
    @@index([action])
    @@index([is_production])
    @@index([createdAt])
    @@map("activity_logs")
  }
  ```

- [ ] Generate Prisma migration:
  ```bash
  npx prisma migrate dev --name add_developer_role_and_activity_logging
  ```

- [ ] Update Prisma Client:
  ```bash
  npx prisma generate
  ```

**Code Reference:**
- File: `prisma/schema.prisma`
- Models affected: 6 (users, transactions, transaction_items, stock_movements, consignment_sales, financial)
- New model: `activity_logs`

---

#### **1.2 Create Developer User Accounts** ⏳
**Status:** Not Started  
**Estimated:** 15 minutes

**Tasks:**
- [ ] Create seed script `prisma/seed-developers.ts`:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import bcrypt from 'bcryptjs';
  
  const prisma = new PrismaClient();
  
  async function main() {
    console.log('🔧 Creating Developer Accounts...');
    
    // Hash password yang kuat
    const hashedPassword = await bcrypt.hash('DevSecure2025!@#', 10);
    
    // Reyvan (Backend Lead)
    const reyvan = await prisma.users.upsert({
      where: { email: 'reyvan.dev@koperasi-umb.com' },
      update: {},
      create: {
        name: 'Reyvan Developer',
        email: 'reyvan.dev@koperasi-umb.com',
        password: hashedPassword,
        role: 'DEVELOPER',
        phone: '081234567890',
        address: 'Developer Access',
        active: true,
      },
    });
    console.log('✅ Created:', reyvan.email);
    
    // Aegner (Frontend Lead)
    const aegner = await prisma.users.upsert({
      where: { email: 'aegner.dev@koperasi-umb.com' },
      update: {},
      create: {
        name: 'Aegner Developer',
        email: 'aegner.dev@koperasi-umb.com',
        password: hashedPassword,
        role: 'DEVELOPER',
        phone: '081234567891',
        address: 'Developer Access',
        active: true,
      },
    });
    console.log('✅ Created:', aegner.email);
    
    console.log('\n📝 Developer Credentials:');
    console.log('Email: reyvan.dev@koperasi-umb.com | aegner.dev@koperasi-umb.com');
    console.log('Password: DevSecure2025!@#');
    console.log('⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');
  }
  
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  ```

- [ ] Execute seed:
  ```bash
  npx tsx prisma/seed-developers.ts
  ```

- [ ] Verify accounts created:
  ```bash
  node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.users.findMany({where:{role:'DEVELOPER'}}).then(d=>console.log(d))"
  ```

**Code Reference:**
- File: `prisma/seed-developers.ts`
- Accounts: 2 (Reyvan + Aegner)
- Default password: `DevSecure2025!@#` (MUST CHANGE!)

---

#### **1.3 Developer Session Management** ⏳
**Status:** Not Started  
**Estimated:** 1 hour

**Tasks:**
- [ ] Create session type `lib/types/developer.ts`:
  ```typescript
  export interface DeveloperSession {
    actualRole: 'DEVELOPER';  // True role
    activeRole: UserRole;      // Currently active role
    isProduction: boolean;     // Environment mode
    switchedAt: Date;          // When role was switched
  }
  
  export interface SessionUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    developerSession?: DeveloperSession;  // Only for DEVELOPER users
  }
  ```

- [ ] Update NextAuth configuration `app/api/auth/[...nextauth]/route.ts`:
  ```typescript
  import { PrismaClient, UserRole } from '@prisma/client';
  
  // Add to JWT callback
  async jwt({ token, user, trigger, session }) {
    if (user) {
      token.id = user.id;
      token.name = user.name;
      token.email = user.email;
      token.role = user.role;
      
      // Initialize developer session
      if (user.role === 'DEVELOPER') {
        token.developerSession = {
          actualRole: 'DEVELOPER',
          activeRole: user.role,
          isProduction: false,  // Default to DEV mode
          switchedAt: new Date(),
        };
      }
    }
    
    // Handle developer role switching
    if (trigger === 'update' && session?.developerSession) {
      token.developerSession = session.developerSession;
    }
    
    return token;
  },
  
  // Add to session callback
  async session({ session, token }) {
    session.user = {
      id: token.id as number,
      name: token.name as string,
      email: token.email as string,
      role: token.developerSession?.activeRole || token.role as UserRole,
      developerSession: token.developerSession as DeveloperSession | undefined,
    };
    return session;
  }
  ```

- [ ] Create role switch API `app/api/developer/switch-role/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { getServerSession } from 'next-auth';
  import { authOptions } from '@/app/api/auth/[...nextauth]/route';
  
  export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    // Check if user is DEVELOPER
    if (session?.user?.developerSession?.actualRole !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only developers can switch roles' },
        { status: 403 }
      );
    }
    
    const { targetRole } = await req.json();
    
    // Validate target role
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER'];
    if (!allowedRoles.includes(targetRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Update session (handled by NextAuth update trigger)
    return NextResponse.json({
      success: true,
      activeRole: targetRole,
      message: `Switched to ${targetRole} role`,
    });
  }
  ```

- [ ] Create environment toggle API `app/api/developer/toggle-environment/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { getServerSession } from 'next-auth';
  
  export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.developerSession?.actualRole !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { isProduction } = await req.json();
    
    // Log environment switch
    await prisma.activity_logs.create({
      data: {
        userId: session.user.id,
        userRole: 'DEVELOPER',
        action: 'ENVIRONMENT_SWITCH',
        module: 'DEVELOPER',
        description: `Switched to ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`,
        metadata: { isProduction },
        is_production: true,  // Always log developer actions to production
      },
    });
    
    return NextResponse.json({
      success: true,
      isProduction,
      message: `Switched to ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} environment`,
    });
  }
  ```

**Code Reference:**
- Files: `lib/types/developer.ts`, `app/api/auth/[...nextauth]/route.ts`
- New APIs: `/api/developer/switch-role`, `/api/developer/toggle-environment`

---

#### **1.4 Basic Developer Dashboard** ⏳
**Status:** Not Started  
**Estimated:** 1.5 hours

**Tasks:**
- [ ] Create dashboard page `app/koperasi/developer-dashboard/page.tsx`:
  ```tsx
  'use client';
  
  import { useSession, signOut } from 'next-auth/react';
  import { useState } from 'react';
  import { Card } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  
  export default function DeveloperDashboard() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    
    if (session?.user?.developerSession?.actualRole !== 'DEVELOPER') {
      return <div>Unauthorized</div>;
    }
    
    const { activeRole, isProduction } = session.user.developerSession;
    
    const switchRole = async (targetRole: string) => {
      setLoading(true);
      await fetch('/api/developer/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole }),
      });
      
      // Update session
      await update({
        developerSession: {
          ...session.user.developerSession,
          activeRole: targetRole,
          switchedAt: new Date(),
        },
      });
      setLoading(false);
    };
    
    const toggleEnvironment = async () => {
      setLoading(true);
      const newMode = !isProduction;
      await fetch('/api/developer/toggle-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isProduction: newMode }),
      });
      
      await update({
        developerSession: {
          ...session.user.developerSession,
          isProduction: newMode,
        },
      });
      setLoading(false);
    };
    
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Developer Control Panel</h1>
            <p className="text-gray-600">Reyvan & Aegner Developer Tools</p>
          </div>
          
          {/* Environment Badge */}
          <div className={`px-4 py-2 rounded-full font-semibold ${
            isProduction 
              ? 'bg-red-100 text-red-700 border-2 border-red-500' 
              : 'bg-green-100 text-green-700 border-2 border-green-500'
          }`}>
            {isProduction ? '🔴 PRODUCTION MODE' : '🟢 DEVELOPMENT MODE'}
          </div>
        </div>
        
        {/* Active Role */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currently Active As:</p>
              <p className="text-xl font-bold text-blue-700">{activeRole}</p>
            </div>
            <p className="text-sm text-gray-500">
              Actual Role: DEVELOPER
            </p>
          </div>
        </Card>
        
        {/* Role Switcher */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">🔄 Role Switcher</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['ADMIN', 'SUPER_ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER'].map((role) => (
              <Button
                key={role}
                onClick={() => switchRole(role)}
                disabled={loading || activeRole === role}
                variant={activeRole === role ? 'default' : 'outline'}
                className="w-full"
              >
                {role}
              </Button>
            ))}
          </div>
        </Card>
        
        {/* Environment Toggle */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">🌍 Environment Control</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {isProduction ? 'Production Mode' : 'Development Mode'}
              </p>
              <p className="text-sm text-gray-600">
                {isProduction 
                  ? '⚠️ Data akan tersimpan ke production database' 
                  : '✅ Data aman di development, tidak ganggu production'}
              </p>
            </div>
            <Button
              onClick={toggleEnvironment}
              disabled={loading}
              variant={isProduction ? 'destructive' : 'default'}
            >
              Switch to {isProduction ? 'DEV' : 'PROD'}
            </Button>
          </div>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold">📊 Activity Logs</h3>
            <p className="text-sm text-gray-600">View production activity trail</p>
          </Card>
          
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold">🧹 Data Management</h3>
            <p className="text-sm text-gray-600">Clean, seed, reset database</p>
          </Card>
          
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold">🔍 API Tester</h3>
            <p className="text-sm text-gray-600">Test endpoints & responses</p>
          </Card>
        </div>
      </div>
    );
  }
  ```

- [ ] Update sidebar `app/koperasi/layout.tsx` untuk developer menu:
  ```tsx
  // Add to navigation items
  const getDeveloperMenu = () => {
    if (session?.user?.developerSession?.actualRole !== 'DEVELOPER') return [];
    
    return [
      {
        title: 'Developer Tools',
        items: [
          { name: 'Developer Dashboard', href: '/koperasi/developer-dashboard', icon: '🔧' },
          { name: 'Activity Logs', href: '/koperasi/developer/activity-logs', icon: '📊' },
          { name: 'Data Management', href: '/koperasi/developer/data-management', icon: '🧹' },
          { name: 'API Tester', href: '/koperasi/developer/api-tester', icon: '🔍' },
        ],
      },
    ];
  };
  ```

**Code Reference:**
- File: `app/koperasi/developer-dashboard/page.tsx`
- Components: Role switcher, Environment toggle, Quick actions
- Updated: `app/koperasi/layout.tsx` (sidebar)

---

### **✅ PHASE 1 COMPLETION CHECKLIST**

Before moving to Phase 2, verify:
- [ ] Prisma migration executed successfully
- [ ] 2 developer accounts created (Reyvan + Aegner)
- [ ] Login as developer works
- [ ] Developer dashboard accessible
- [ ] Role switching works (switch & refresh page)
- [ ] Environment toggle works (badge updates)
- [ ] No TypeScript errors
- [ ] Git commit with message: "feat: Phase 1 - Developer role foundation"

**Expected Duration:** 3-4 hours  
**Actual Duration:** _[To be filled]_

---

## 🔄 **PHASE 2: DATA ISOLATION** (Day 1-2)
**Status:** ⏳ Pending Phase 1  
**Priority:** CRITICAL

### **2.1 Query Filtering Middleware** 
**Status:** Not Started  
**Estimated:** 2 hours

**Strategy:**
- Intercept all Prisma queries
- Auto-inject `is_production` filter based on session
- Global middleware untuk consistency

**Tasks:**
- [ ] Create Prisma middleware `lib/prisma-middleware.ts`:
  ```typescript
  import { Prisma } from '@prisma/client';
  
  export function createProductionFilter(isProduction: boolean) {
    return (params: Prisma.MiddlewareParams, next: any) => {
      // Models yang perlu filtering
      const filteredModels = [
        'transactions',
        'transaction_items',
        'stock_movements',
        'consignment_sales',
        'financial',
      ];
      
      if (filteredModels.includes(params.model || '')) {
        // Add is_production filter to all queries
        if (params.action === 'findMany' || params.action === 'findFirst') {
          params.args.where = {
            ...params.args.where,
            is_production: isProduction,
          };
        }
        
        // Add is_production to create/update operations
        if (params.action === 'create' || params.action === 'createMany') {
          if (params.args.data) {
            if (Array.isArray(params.args.data)) {
              params.args.data = params.args.data.map((item: any) => ({
                ...item,
                is_production: isProduction,
              }));
            } else {
              params.args.data = {
                ...params.args.data,
                is_production: isProduction,
              };
            }
          }
        }
      }
      
      return next(params);
    };
  }
  ```

- [ ] Update API route helpers untuk inject middleware
- [ ] Test queries dengan DEV mode (hanya show dev data)
- [ ] Test queries dengan PROD mode (hanya show prod data)

**Code Reference:**
- File: `lib/prisma-middleware.ts`
- Applied to: All transaction-related queries

---

### **2.2 Production Mode Warnings**
**Status:** Not Started  
**Estimated:** 30 minutes

**Tasks:**
- [ ] Add banner component `components/developer/ProductionWarning.tsx`:
  ```tsx
  'use client';
  
  import { useSession } from 'next-auth/react';
  import { Alert, AlertDescription } from '@/components/ui/alert';
  
  export function ProductionWarning() {
    const { data: session } = useSession();
    
    if (session?.user?.developerSession?.actualRole !== 'DEVELOPER') return null;
    if (!session.user.developerSession.isProduction) return null;
    
    return (
      <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50">
        <AlertDescription className="flex items-center justify-between">
          <span className="font-semibold">
            ⚠️ PRODUCTION MODE ACTIVE - All changes will affect live data!
          </span>
          <span className="text-sm">
            Switch to DEV mode for safe testing
          </span>
        </AlertDescription>
      </Alert>
    );
  }
  ```

- [ ] Add to all critical pages (POS, Inventory, Financial)
- [ ] Confirmation dialog untuk destructive actions di PROD mode

**Code Reference:**
- File: `components/developer/ProductionWarning.tsx`

---

### **2.3 Clean Data Script Enhancement**
**Status:** Not Started (Enhancement of existing `clean-data.js`)  
**Estimated:** 20 minutes

**Tasks:**
- [ ] Update `clean-data.js` untuk support `--dev` flag:
  ```javascript
  const args = process.argv.slice(2);
  const isDevOnly = args.includes('--dev');
  
  async function cleanData() {
    const whereClause = isDevOnly ? { is_production: false } : {};
    
    // Delete with filter
    const transactionItems = await prisma.transaction_items.deleteMany({
      where: whereClause,
    });
    
    // ... rest of cleanup with whereClause
    
    console.log(isDevOnly 
      ? '✅ Cleaned DEVELOPMENT data only' 
      : '⚠️ Cleaned ALL data (including PRODUCTION)');
  }
  ```

- [ ] Test dengan `node clean-data.js --dev` (safe)
- [ ] Test dengan `node clean-data.js` (dengan confirmation prompt)

**Usage:**
```bash
# Clean development data only (safe)
node clean-data.js --dev

# Clean ALL data (requires confirmation)
node clean-data.js

# Check data status
node clean-data.js --status
```

**Code Reference:**
- File: `clean-data.js` (updated)

---

### **✅ PHASE 2 COMPLETION CHECKLIST**
- [ ] Prisma middleware working (tested with dev/prod data)
- [ ] Production warning banner shows correctly
- [ ] Clean data script supports `--dev` flag
- [ ] No data leakage between environments
- [ ] Git commit: "feat: Phase 2 - Data isolation with environment filtering"

**Expected Duration:** 2-3 hours  
**Actual Duration:** _[To be filled]_

---

## 📊 **PHASE 3: ACTIVITY LOGGING** (Day 2-3)
**Status:** ⏳ Pending Phase 2  
**Priority:** HIGH

### **3.1 Logging Middleware**
**Status:** Not Started  
**Estimated:** 2 hours

**Strategy:**
- Intercept API routes
- Auto-log PRODUCTION activities only
- Skip logging for DEVELOPER mode (unless explicitly needed)

**Tasks:**
- [ ] Create logging utility `lib/activity-logger.ts`:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { getServerSession } from 'next-auth';
  
  const prisma = new PrismaClient();
  
  interface LogParams {
    action: string;
    module: string;
    description: string;
    metadata?: any;
    req?: Request;
  }
  
  export async function logActivity(params: LogParams) {
    const session = await getServerSession();
    
    if (!session?.user) return;
    
    // Skip logging if developer in DEV mode
    const isDeveloper = session.user.developerSession?.actualRole === 'DEVELOPER';
    const isDevMode = !session.user.developerSession?.isProduction;
    
    if (isDeveloper && isDevMode) {
      console.log('[DEV] Skipped logging:', params.description);
      return;
    }
    
    // Extract request metadata
    const ipAddress = params.req?.headers.get('x-forwarded-for') || 
                      params.req?.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = params.req?.headers.get('user-agent') || 'unknown';
    
    // Log to database
    await prisma.activity_logs.create({
      data: {
        userId: session.user.id,
        userRole: session.user.role,
        action: params.action,
        module: params.module,
        description: params.description,
        metadata: params.metadata || {},
        ipAddress,
        userAgent,
        is_production: true,  // Always log as production activity
      },
    });
    
    console.log('[PROD] Logged:', params.description);
  }
  ```

- [ ] Create API middleware wrapper `lib/with-logging.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { logActivity } from './activity-logger';
  
  export function withLogging(
    handler: (req: NextRequest) => Promise<NextResponse>,
    config: {
      module: string;
      action: string;
      getDescription: (req: NextRequest) => string;
    }
  ) {
    return async (req: NextRequest) => {
      const result = await handler(req);
      
      // Log after successful operation
      if (result.status >= 200 && result.status < 300) {
        await logActivity({
          action: config.action,
          module: config.module,
          description: config.getDescription(req),
          metadata: { statusCode: result.status },
          req,
        });
      }
      
      return result;
    };
  }
  ```

- [ ] Apply to critical API routes (examples):
  ```typescript
  // app/api/products/route.ts
  export const POST = withLogging(
    async (req) => {
      // ... existing logic
    },
    {
      module: 'INVENTORY',
      action: 'CREATE',
      getDescription: (req) => 'Created new product',
    }
  );
  
  // app/api/stock-movements/route.ts
  export const POST = withLogging(
    async (req) => {
      // ... existing logic
    },
    {
      module: 'INVENTORY',
      action: 'STOCK_MOVEMENT',
      getDescription: (req) => 'Stock movement recorded',
    }
  );
  ```

**Code Reference:**
- Files: `lib/activity-logger.ts`, `lib/with-logging.ts`
- Applied to: All critical API routes

---

### **3.2 Activity Log Viewer UI**
**Status:** Not Started  
**Estimated:** 2.5 hours

**Tasks:**
- [ ] Create activity logs page `app/koperasi/developer/activity-logs/page.tsx`:
  ```tsx
  'use client';
  
  import { useState, useEffect } from 'react';
  import { Card } from '@/components/ui/card';
  import { Input } from '@/components/ui/input';
  import { Select } from '@/components/ui/select';
  
  interface ActivityLog {
    id: number;
    user: { name: string; email: string };
    userRole: string;
    action: string;
    module: string;
    description: string;
    createdAt: Date;
  }
  
  export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filters, setFilters] = useState({
      role: 'ALL',
      module: 'ALL',
      action: 'ALL',
      search: '',
      dateFrom: '',
      dateTo: '',
    });
    
    useEffect(() => {
      fetchLogs();
    }, [filters]);
    
    const fetchLogs = async () => {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/developer/activity-logs?${query}`);
      const data = await res.json();
      setLogs(data.logs);
    };
    
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">📊 Activity Logs (Production)</h1>
        
        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="SUPPLIER">SUPPLIER</option>
              <option value="USER">USER</option>
            </Select>
            
            <Select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            >
              <option value="ALL">All Modules</option>
              <option value="POS">POS</option>
              <option value="INVENTORY">INVENTORY</option>
              <option value="FINANCIAL">FINANCIAL</option>
              <option value="MEMBER">MEMBER</option>
            </Select>
            
            <Input
              type="text"
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </Card>
        
        {/* Logs Table */}
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Module</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium">{log.user.name}</div>
                    <div className="text-xs text-gray-500">{log.user.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-mono">{log.action}</td>
                  <td className="p-3 text-sm">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  }
  ```

- [ ] Create API endpoint `app/api/developer/activity-logs/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { getServerSession } from 'next-auth';
  import { PrismaClient } from '@prisma/client';
  
  const prisma = new PrismaClient();
  
  export async function GET(req: NextRequest) {
    const session = await getServerSession();
    
    // Only developers can view logs
    if (session?.user?.developerSession?.actualRole !== 'DEVELOPER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Parse filters from query params
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const module = searchParams.get('module');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Build where clause
    const where: any = { is_production: true };
    
    if (role && role !== 'ALL') where.userRole = role;
    if (module && module !== 'ALL') where.module = module;
    if (search) where.description = { contains: search, mode: 'insensitive' };
    if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
    if (dateTo) where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
    
    // Fetch logs
    const logs = await prisma.activity_logs.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,  // Limit to latest 100
    });
    
    return NextResponse.json({ logs });
  }
  ```

**Code Reference:**
- Files: `app/koperasi/developer/activity-logs/page.tsx`, `app/api/developer/activity-logs/route.ts`

---

### **✅ PHASE 3 COMPLETION CHECKLIST**
- [ ] Activity logging middleware working
- [ ] Logs created for production activities only
- [ ] Developer DEV mode skips logging
- [ ] Activity logs UI shows data correctly
- [ ] Filters working (role, module, date, search)
- [ ] Git commit: "feat: Phase 3 - Activity logging system"

**Expected Duration:** 4-5 hours  
**Actual Duration:** _[To be filled]_

---

## 🛠️ **PHASE 4: DEVELOPER TOOLS** (Day 3-4 - Optional)
**Status:** ⏳ Pending Phase 3  
**Priority:** MEDIUM (Bonus Features)

### **4.1 Data Management Tools**
- [ ] Enhanced clean-data script with UI
- [ ] Seed data generator
- [ ] Database reset functionality
- [ ] Backup/restore tools

### **4.2 API Tester**
- [ ] Interactive API testing UI
- [ ] Request builder
- [ ] Response viewer
- [ ] Save & replay requests

### **4.3 Database Inspector**
- [ ] View all tables
- [ ] Query builder
- [ ] Export to CSV/JSON
- [ ] Schema visualization

---

## 📊 **PROGRESS TRACKING**

### **Overall Status:**
- **Phase 1:** ⏳ 0% (Not Started)
- **Phase 2:** ⏳ 0% (Pending Phase 1)
- **Phase 3:** ⏳ 0% (Pending Phase 2)
- **Phase 4:** ⏳ 0% (Optional)

### **Time Tracking:**
| Phase | Estimated | Actual | Status |
|-------|-----------|--------|--------|
| Phase 1 | 3-4 hours | - | ⏳ Not Started |
| Phase 2 | 2-3 hours | - | ⏳ Pending |
| Phase 3 | 4-5 hours | - | ⏳ Pending |
| Phase 4 | 4-6 hours | - | ⏳ Optional |
| **Total** | **13-18 hours** | **-** | **⏳ 0%** |

---

## 🎯 **SUCCESS CRITERIA**

### **Must Have (Phase 1-3):**
- ✅ Developer role created & working
- ✅ Role switching without login/logout
- ✅ Environment toggle (DEV/PROD)
- ✅ Data isolation (no cross-contamination)
- ✅ Activity logging for production
- ✅ Activity log viewer with filters

### **Nice to Have (Phase 4):**
- ✅ Data management UI
- ✅ API testing tools
- ✅ Database inspector

---

## 🚨 **KNOWN RISKS & MITIGATION**

### **Risk 1: Data Leakage (DEV → PROD)**
- **Impact:** HIGH - Development data pollutes production
- **Mitigation:** Strict middleware filtering, visual warnings, confirmation dialogs
- **Testing:** Extensive query testing in both modes

### **Risk 2: Session Management Complexity**
- **Impact:** MEDIUM - Role switching might break session
- **Mitigation:** Use NextAuth update trigger, proper session refresh
- **Testing:** Test all role combinations

### **Risk 3: Performance Impact (Logging)**
- **Impact:** LOW - Too many logs slow down system
- **Mitigation:** Async logging, batch inserts, log retention policy
- **Testing:** Load testing with logging enabled

---

## 📝 **CODE CONSISTENCY CHECKLIST**

To prevent errors & maintain consistency:

### **Naming Conventions:**
- ✅ Use `is_production` (snake_case) for database fields
- ✅ Use `isProduction` (camelCase) for TypeScript variables
- ✅ Use `DEVELOPER` (uppercase) for role enum
- ✅ Use `activity_logs` (snake_case) for table name

### **File Structure:**
```
lib/
  ├── types/developer.ts          # Developer session types
  ├── prisma-middleware.ts        # Query filtering
  ├── activity-logger.ts          # Logging utility
  └── with-logging.ts             # API middleware

app/
  ├── api/
  │   └── developer/
  │       ├── switch-role/route.ts
  │       ├── toggle-environment/route.ts
  │       └── activity-logs/route.ts
  └── koperasi/
      ├── developer-dashboard/page.tsx
      └── developer/
          ├── activity-logs/page.tsx
          ├── data-management/page.tsx
          └── api-tester/page.tsx

components/
  └── developer/
      └── ProductionWarning.tsx

prisma/
  ├── schema.prisma               # Updated schema
  └── seed-developers.ts          # Developer accounts seed
```

### **Import Consistency:**
```typescript
// Always use these imports
import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { logActivity } from '@/lib/activity-logger';
```

### **Error Handling Pattern:**
```typescript
try {
  // Operation
  await someOperation();
  
  // Log success
  await logActivity({
    action: 'ACTION_NAME',
    module: 'MODULE_NAME',
    description: 'What happened',
  });
  
  return NextResponse.json({ success: true });
} catch (error) {
  console.error('Error:', error);
  
  // Log error
  await logActivity({
    action: 'ERROR',
    module: 'MODULE_NAME',
    description: `Error: ${error.message}`,
    metadata: { error: error.stack },
  });
  
  return NextResponse.json(
    { error: 'Error message' },
    { status: 500 }
  );
}
```

---

## 🔄 **CHANGE LOG**

### **Version 1.0 - 20 Oktober 2025**
- Initial tracking document created
- All 4 phases planned & documented
- Code structure defined
- Estimated timelines set

---

## 👥 **DEVELOPER TEAM**

**Reyvan (Backend Lead)**
- Email: reyvan.dev@koperasi-umb.com
- Password: DevSecure2025!@# (CHANGE AFTER FIRST LOGIN)
- Responsibilities: Backend logic, API development, database operations

**Aegner (Frontend Lead)**
- Email: aegner.dev@koperasi-umb.com
- Password: DevSecure2025!@# (CHANGE AFTER FIRST LOGIN)
- Responsibilities: UI/UX, Frontend components, Developer dashboard

---

## 📞 **SUPPORT & COMMUNICATION**

**Daily Standup:** Before starting work  
**Phase Review:** After each phase completion  
**Issue Reporting:** Create tracking notes in this document  
**Code Review:** Git-based workflow

---

**Last Updated:** 20 Oktober 2025, 23:15 WIB  
**Next Session:** Phase 1 Kickoff - Database Schema Updates  
**Current Focus:** Foundation setup for developer mode

---

## 🎯 **QUICK START GUIDE**

### **Starting Phase 1:**
1. ✅ Read this tracking document fully
2. ✅ Backup current database
3. ✅ Update `prisma/schema.prisma`
4. ✅ Run migration: `npx prisma migrate dev`
5. ✅ Execute developer seed: `npx tsx prisma/seed-developers.ts`
6. ✅ Test login with developer accounts
7. ✅ Build developer dashboard UI
8. ✅ Test role switching & environment toggle

### **Before Each Coding Session:**
1. ✅ Review current phase tasks
2. ✅ Check code consistency guidelines
3. ✅ Update tracking document with progress
4. ✅ Commit & push after each completed task

### **After Each Phase:**
1. ✅ Complete phase checklist
2. ✅ Update time tracking (estimated vs actual)
3. ✅ Git commit with phase completion message
4. ✅ Review next phase requirements

---

**Status:** 🟢 Ready to Start Phase 1  
**Confidence Level:** HIGH - Clear requirements, well-planned structure  
**Risk Level:** LOW - Isolated feature, won't break existing functionality
