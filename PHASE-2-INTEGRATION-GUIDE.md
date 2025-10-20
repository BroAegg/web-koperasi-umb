# 🔧 PHASE 2: DATA ISOLATION - INTEGRATION GUIDE

**Phase:** 2.4 - Integration & Implementation  
**Date:** 21 Oktober 2025  
**Status:** 🟢 In Progress

---

## 📋 **WHAT WE BUILT**

### **Modular Architecture:**
```
contexts/
  └── DeveloperContext.tsx     → Global dev session state
lib/
  ├── prisma-middleware.ts      → Data isolation helpers
  └── developer-helpers.ts      → Activity logging & utilities
app/
  └── layout.tsx                → Root with DeveloperProvider
```

---

## 🚀 **HOW TO USE IN API ROUTES**

### **Method 1: Automatic Session Management (Recommended)**

```typescript
// app/api/pos/transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { withDeveloperSession, addProductionData } from "@/lib/prisma-middleware";
import { createActivityLog } from "@/lib/developer-helpers";

export async function POST(req: NextRequest) {
  return withDeveloperSession(req, async () => {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "");
    const user = await getUserFromToken(token);

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { items, totalAmount, paymentMethod, amountPaid } = body;

    // Create transaction with automatic isProduction flag
    const transaction = await prisma.transactions.create({
      data: addProductionData({
        userId: user.id,
        totalAmount,
        paymentMethod,
        amountPaid,
        status: "COMPLETED",
        // isProduction automatically added based on developer session
      }),
    });

    // Create transaction items
    for (const item of items) {
      await prisma.transaction_items.create({
        data: addProductionData({
          transactionId: transaction.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        }),
      });
    }

    // Log activity
    await createActivityLog({
      userId: user.id,
      userRole: user.role,
      action: 'CREATE',
      module: 'POS',
      description: `Created transaction ${transaction.id}`,
      metadata: { transactionId: transaction.id, totalAmount },
    });

    return NextResponse.json({ success: true, data: transaction });
  });
}
```

### **Method 2: Manual Session Management**

```typescript
// For more control
import { setDeveloperSession, extractDeveloperSession, addProductionFilter } from "@/lib/prisma-middleware";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.substring(7); // Remove 'Bearer '
    
    // Set session manually
    const session = extractDeveloperSession(token);
    if (session) {
      setDeveloperSession(session);
    }

    // Query with automatic filtering
    const where = addProductionFilter({ userId: user.id });
    const transactions = await prisma.transactions.findMany({ where });

    return NextResponse.json({ success: true, data: transactions });
  } finally {
    // Always clear session after use
    clearDeveloperSession();
  }
}
```

---

## 🎨 **HOW TO USE IN COMPONENTS**

### **Access Developer State:**

```typescript
'use client';

import { useDeveloper } from '@/contexts/DeveloperContext';

export function MyComponent() {
  const { isProduction, activeRole, isDeveloper } = useDeveloper();

  return (
    <div>
      {!isProduction && (
        <div className="bg-yellow-100 p-2">
          ⚠️ DEVELOPMENT MODE - Test data only
        </div>
      )}
      
      <p>Current role: {activeRole}</p>
      <p>Environment: {isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}</p>
      
      {isDeveloper && (
        <button>Developer Tools</button>
      )}
    </div>
  );
}
```

### **Protect Developer-Only Components:**

```typescript
import { withDeveloperCheck } from '@/contexts/DeveloperContext';

function DeveloperOnlyComponent() {
  return <div>Only developers can see this</div>;
}

export default withDeveloperCheck(DeveloperOnlyComponent);
```

---

## 📝 **HELPER FUNCTIONS REFERENCE**

### **Prisma Middleware (`lib/prisma-middleware.ts`):**

| Function | Purpose | Usage |
|----------|---------|-------|
| `withDeveloperSession(req, callback)` | Wrap API routes for automatic session management | Recommended for all API routes |
| `setDeveloperSession(session)` | Manually set developer session | For custom session management |
| `addProductionFilter(where)` | Add isProduction to WHERE clause | For read queries (findMany, findFirst) |
| `addProductionData(data)` | Add isProduction to data object | For create/update operations |
| `extractDeveloperSession(token)` | Get session from JWT | Extract from Authorization header |
| `getProductionFlag()` | Get current isProduction value | For raw SQL queries |

### **Developer Helpers (`lib/developer-helpers.ts`):**

| Function | Purpose | Usage |
|----------|---------|-------|
| `createActivityLog(params)` | Log user activities | Track all important actions |
| `getActivityLogs(params)` | Fetch activity logs | Activity viewer pages |
| `getActivityLogStats(params)` | Get activity statistics | Dashboard analytics |
| `isDeveloperMode(token)` | Check if user is developer | Permission checks |
| `getEnvironmentMode(token)` | Get PROD/DEV mode | Display environment badge |
| `cleanDevelopmentData()` | Delete all dev data | ⚠️ Dangerous - use with caution |
| `getDataStatistics()` | Get dev vs prod counts | Data management dashboard |

---

## 🔄 **MIGRATION CHECKLIST**

### **API Routes to Update:**

- [ ] `/api/pos/transaction` - POS transactions
  - Add `withDeveloperSession` wrapper
  - Use `addProductionData` for creates
  - Add activity logging

- [ ] `/api/inventory/stock-movement` - Stock movements
  - Add `addProductionFilter` for queries
  - Use `addProductionData` for creates

- [ ] `/api/consignment/sales` - Consignment sales
  - Wrap with `withDeveloperSession`
  - Add activity logging

- [ ] `/api/financial/*` - Financial operations
  - Add data isolation
  - Log all financial activities

### **Components to Update:**

- [ ] POS Page - Add environment indicator
- [ ] Inventory Page - Show dev/prod data counts
- [ ] Dashboard - Display environment mode
- [ ] Transaction Lists - Filter by environment

---

## 🧪 **TESTING PLAN**

### **Test Case 1: Create Transaction in DEV Mode**

**Steps:**
1. Login as developer
2. Switch environment to DEVELOPMENT
3. Go to POS
4. Create a test transaction
5. Check database: `isProduction` should be `false`

**SQL Verification:**
```sql
SELECT id, total_amount, is_production 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected:**
- Latest transaction has `is_production = false`
- Activity log created with action = CREATE, module = POS

---

### **Test Case 2: Query Filtering**

**Steps:**
1. Create 2 transactions in DEV mode
2. Create 2 transactions in PROD mode
3. Switch between DEV/PROD
4. Check transaction list on dashboard

**Expected:**
- In DEV mode: Only see 2 dev transactions
- In PROD mode: Only see 2 prod transactions
- No cross-contamination

---

### **Test Case 3: Stock Movement Isolation**

**Steps:**
1. In DEV mode: Move 10 units of Product A
2. Switch to PROD mode
3. Check Product A stock

**Expected:**
- Stock unchanged in PROD (dev movement not applied)
- Stock movements table has separate entries with different `isProduction` flags

---

### **Test Case 4: Activity Logging**

**Steps:**
1. Perform 5 different actions (create transaction, update inventory, etc.)
2. Go to Activity Logs page
3. Filter by module/action

**Expected:**
- All actions logged with correct metadata
- Can filter and search logs
- Timestamps accurate

---

### **Test Case 5: Clean Development Data**

**Steps:**
1. Create 10 dev transactions
2. Call `cleanDevelopmentData()` API
3. Check database

**Expected:**
- All dev data deleted (is_production = false)
- Prod data untouched (is_production = true)
- Return count of deleted records

---

## ⚠️ **IMPORTANT NOTES**

### **1. Prisma v6 Limitations:**
- No built-in middleware support
- Must use manual helpers (`addProductionFilter`, `addProductionData`)
- Cannot auto-inject filters transparently

### **2. Raw SQL Queries:**
For `$queryRaw`, use `getProductionFlag()`:
```typescript
const isProduction = getProductionFlag();
const result = await prisma.$queryRaw`
  SELECT * FROM transactions 
  WHERE is_production = ${isProduction}
`;
```

### **3. Activity Logging:**
- Always log developer actions to PRODUCTION (for audit trail)
- Log user actions based on current environment
- Include metadata for debugging

### **4. Data Consistency:**
- ALWAYS use helpers in new code
- Update existing APIs gradually
- Test each update thoroughly

---

## 📊 **PROGRESS TRACKING**

### **Phase 2 Status:**

- ✅ **2.1**: Developer Context Provider
- ✅ **2.2**: Prisma Middleware/Helpers
- ✅ **2.3**: Developer Utilities
- 🔄 **2.4**: Integration (IN PROGRESS)
  - ✅ Root layout wrapped with DeveloperProvider
  - ⏳ Update API routes with `withDeveloperSession`
  - ⏳ Add environment indicators to UI
  - ⏳ Test data isolation
- ⏳ **2.5**: Real-world testing

---

## 🎯 **NEXT STEPS**

1. **Update POS API** - Add data isolation to transaction creation
2. **Update Inventory API** - Add to stock movements
3. **Add Environment Badges** - Show DEV/PROD indicator in UI
4. **Create Test Data** - Generate sample dev transactions
5. **Test Complete Flow** - End-to-end testing
6. **Document Results** - Update tracking document

---

**Target Completion:** 21 Oktober 2025, 04:00 WIB  
**Estimated Time Remaining:** 1-1.5 hours

---

**Document Created:** 21 Oktober 2025, 02:45 WIB  
**Last Updated:** 21 Oktober 2025, 02:45 WIB
