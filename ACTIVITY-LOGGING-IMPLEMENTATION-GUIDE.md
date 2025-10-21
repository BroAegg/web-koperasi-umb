# 📝 ACTIVITY LOGGING IMPLEMENTATION GUIDE
**For:** Aegner (Frontend/Full-Stack)  
**Date:** 21 Oktober 2025  
**Status:** 🟡 Partially Complete - Need to implement logging for remaining API routes  
**Priority:** 🔥 HIGH - All user actions must be tracked

---

## 🎯 **OBJECTIVE**

**Implement activity logging for ALL API routes below DEVELOPER role.**

All actions from these roles MUST be logged:
- ✅ SUPER_ADMIN
- ✅ ADMIN
- ✅ SUPPLIER
- ✅ USER (MEMBER)

**Developer role:** Only log when in PRODUCTION mode (handled automatically by `createActivityLog`)

---

## 📊 **CURRENT STATUS**

### ✅ **COMPLETED (by Reyvan):**

| API Route | Status | Action Types |
|-----------|--------|--------------|
| `/api/products` (POST) | ✅ DONE | CREATE |
| `/api/products/[id]` (PUT) | ✅ DONE | UPDATE |
| `/api/products/[id]` (DELETE) | ✅ DONE | DELETE |
| `/api/stock-movements` (POST) | ✅ DONE | STOCK_IN, STOCK_OUT, STOCK_ADJUSTMENT |
| `/api/pos/transaction` (POST) | ✅ DONE | POS_SALE |

### ⏳ **PENDING (Your Tasks):**

| API Route | Priority | Action Types | Estimated Time |
|-----------|----------|--------------|----------------|
| `/api/financial/transactions` (POST) | 🔥 HIGH | CREATE | 10 mins |
| `/api/financial/transactions/[id]` (PUT) | 🔥 HIGH | UPDATE | 5 mins |
| `/api/financial/transactions/[id]` (DELETE) | 🔥 HIGH | DELETE | 5 mins |
| `/api/members` (POST) | 🟡 MEDIUM | CREATE | 10 mins |
| `/api/members/[id]` (PUT) | 🟡 MEDIUM | UPDATE | 5 mins |
| `/api/members/[id]` (DELETE) | 🟡 MEDIUM | DELETE | 5 mins |
| `/api/broadcasts` (POST) | 🟢 LOW | CREATE | 10 mins |
| `/api/broadcasts/[id]` (PUT) | 🟢 LOW | UPDATE | 5 mins |
| `/api/broadcasts/[id]` (DELETE) | 🟢 LOW | DELETE | 5 mins |
| `/api/suppliers` (Approval actions) | 🟡 MEDIUM | APPROVE, REJECT, VERIFY | 15 mins |
| `/api/auth/login` | 🟢 LOW | LOGIN | 5 mins |
| `/api/auth/logout` (if exists) | 🟢 LOW | LOGOUT | 5 mins |

**Total Estimated:** ~1.5 hours

---

## 🛠️ **IMPLEMENTATION PATTERN**

### **Standard Pattern (Use This!):**

Reyvan sudah buat helper function yang mudah banget dipake:

```typescript
import { logFromRequest } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    // Your existing logic here...
    const result = await prisma.someModel.create({ ... });

    // ✅ ADD LOGGING HERE (after successful operation)
    await logFromRequest(
      request,
      'CREATE',           // Action type
      'MODULE_NAME',      // Module (e.g., 'FINANCIAL', 'MEMBER', 'BROADCAST')
      'Description of what happened',  // Human-readable description
      { 
        // Optional metadata (include relevant IDs and data)
        id: result.id,
        name: result.name,
        amount: result.amount,
        // ... any other relevant data
      }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // ... error handling
  }
}
```

### **Key Points:**
1. ✅ **Import** `logFromRequest` from `@/lib/activity-logger`
2. ✅ **Call AFTER** successful operation (inside try block, before return)
3. ✅ **Use `.catch()`** to prevent logging failures from breaking the API
4. ✅ **Include metadata** yang relevant (IDs, names, amounts, etc)
5. ✅ **Non-blocking** - Logging happens asynchronously

---

## 📋 **ACTION TYPES (Consistent Naming)**

Use these exact action names for consistency:

```typescript
// CRUD Operations
'CREATE'              // Creating new record
'UPDATE'              // Updating existing record
'DELETE'              // Deleting record

// Stock Operations
'STOCK_IN'            // Adding stock
'STOCK_OUT'           // Removing stock
'STOCK_ADJUSTMENT'    // Manual stock adjustment

// Financial Operations
'TRANSACTION_CREATE'  // Creating financial transaction
'TRANSACTION_UPDATE'  // Updating financial transaction
'TRANSACTION_DELETE'  // Deleting financial transaction

// Member Operations
'MEMBER_CREATE'       // Creating member
'MEMBER_UPDATE'       // Updating member
'MEMBER_DELETE'       // Deleting member

// Broadcast Operations
'BROADCAST_CREATE'    // Creating broadcast
'BROADCAST_SEND'      // Sending broadcast
'BROADCAST_UPDATE'    // Updating broadcast
'BROADCAST_DELETE'    // Deleting broadcast

// Supplier Operations
'SUPPLIER_APPROVE'    // Approving supplier
'SUPPLIER_REJECT'     // Rejecting supplier
'SUPPLIER_VERIFY'     // Verifying payment

// Auth Operations
'LOGIN'               // User login
'LOGOUT'              // User logout
```

---

## 📦 **MODULE NAMES (Consistent Naming)**

```typescript
'INVENTORY'           // Product & stock operations
'POS'                 // Point of sale transactions
'FINANCIAL'           // Financial transactions
'MEMBER'              // Member management
'BROADCAST'           // Broadcast/announcements
'SUPPLIER'            // Supplier management
'AUTH'                // Authentication
'SETTINGS'            // Settings changes
'DEVELOPER_TOOLS'     // Developer actions
```

---

## 💡 **EXAMPLES BY API ROUTE**

### **1. Financial Transactions API**

**File:** `app/api/financial/transactions/route.ts`

```typescript
import { logFromRequest } from '@/lib/activity-logger';

// POST - Create financial transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, category, description, date } = body;

    const transaction = await prisma.financial.create({
      data: {
        id: randomUUID(),
        type,
        amount,
        category,
        description,
        date: new Date(date),
        // ... other fields
      },
    });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'TRANSACTION_CREATE',
      'FINANCIAL',
      `Created ${type} transaction: ${description} (Rp ${amount.toLocaleString('id-ID')})`,
      { 
        transactionId: transaction.id,
        type,
        amount,
        category,
      }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    // ... error handling
  }
}
```

**File:** `app/api/financial/transactions/[id]/route.ts`

```typescript
// PUT - Update financial transaction
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const transaction = await prisma.financial.update({
      where: { id },
      data: body,
    });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'TRANSACTION_UPDATE',
      'FINANCIAL',
      `Updated financial transaction: ${transaction.description}`,
      { 
        transactionId: id,
        changes: Object.keys(body),
      }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    // ... error handling
  }
}

// DELETE - Delete financial transaction
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const transaction = await prisma.financial.findUnique({ where: { id } });
    await prisma.financial.delete({ where: { id } });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'TRANSACTION_DELETE',
      'FINANCIAL',
      `Deleted financial transaction: ${transaction?.description || id}`,
      { transactionId: id }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    // ... error handling
  }
}
```

---

### **2. Members API**

**File:** `app/api/members/route.ts`

```typescript
// POST - Create member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    const member = await prisma.members.create({
      data: {
        id: randomUUID(),
        name,
        email,
        phone,
        // ... other fields
      },
    });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'MEMBER_CREATE',
      'MEMBER',
      `Created member: ${name}`,
      { 
        memberId: member.id,
        name,
        email,
      }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    // ... error handling
  }
}
```

**File:** `app/api/members/[id]/route.ts`

```typescript
// PUT - Update member
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const member = await prisma.members.update({
      where: { id },
      data: body,
    });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'MEMBER_UPDATE',
      'MEMBER',
      `Updated member: ${member.name}`,
      { memberId: id, changes: Object.keys(body) }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    // ... error handling
  }
}

// DELETE - Delete member
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const member = await prisma.members.findUnique({ where: { id } });
    await prisma.members.delete({ where: { id } });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'MEMBER_DELETE',
      'MEMBER',
      `Deleted member: ${member?.name || id}`,
      { memberId: id }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    // ... error handling
  }
}
```

---

### **3. Broadcasts API**

**File:** `app/api/broadcasts/route.ts`

```typescript
// POST - Create broadcast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, target } = body;

    const broadcast = await prisma.broadcasts.create({
      data: {
        id: randomUUID(),
        title,
        message,
        target,
        status: 'DRAFT',
        // ... other fields
      },
    });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'BROADCAST_CREATE',
      'BROADCAST',
      `Created broadcast: ${title}`,
      { 
        broadcastId: broadcast.id,
        title,
        target,
      }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: broadcast });
  } catch (error) {
    // ... error handling
  }
}
```

---

### **4. Supplier Approval Actions**

**File:** `app/api/suppliers/[id]/approve/route.ts`

```typescript
// POST - Approve supplier
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const supplier = await prisma.supplier_profiles.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'SUPPLIER_APPROVE',
      'SUPPLIER',
      `Approved supplier: ${supplier.businessName}`,
      { supplierId: id, businessName: supplier.businessName }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    // ... error handling
  }
}
```

**File:** `app/api/suppliers/[id]/reject/route.ts`

```typescript
// POST - Reject supplier
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { reason } = await request.json();

    const supplier = await prisma.supplier_profiles.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });

    // ✅ ADD THIS
    await logFromRequest(
      request,
      'SUPPLIER_REJECT',
      'SUPPLIER',
      `Rejected supplier: ${supplier.businessName}`,
      { supplierId: id, businessName: supplier.businessName, reason }
    ).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    // ... error handling
  }
}
```

---

### **5. Login API**

**File:** `app/api/auth/login/route.ts`

```typescript
import { logActivity } from '@/lib/activity-logger';
import { extractRequestMetadata } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ... authentication logic
    const user = await prisma.users.findUnique({ where: { email } });
    
    if (!user || !await comparePassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, role: user.role });

    // ✅ ADD THIS (after successful login)
    const { ipAddress, userAgent } = extractRequestMetadata(request);
    await logActivity({
      userId: user.id,
      userRole: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User logged in: ${user.name}`,
      metadata: { email: user.email },
      ipAddress,
      userAgent,
    }).catch(err => console.error('[Activity Logger] Failed:', err));

    return NextResponse.json({ success: true, token, user });
  } catch (error) {
    // ... error handling
  }
}
```

---

## 🚨 **SPECIAL CASES**

### **Case 1: API tanpa Authorization header (Login)**

Untuk login, gunakan `logActivity` directly karena belum ada token:

```typescript
import { logActivity, extractRequestMetadata } from '@/lib/activity-logger';

const { ipAddress, userAgent } = extractRequestMetadata(request);
await logActivity({
  userId: user.id,
  userRole: user.role,
  action: 'LOGIN',
  module: 'AUTH',
  description: `User logged in: ${user.name}`,
  metadata: { email },
  ipAddress,
  userAgent,
});
```

### **Case 2: Batch Operations**

Kalau ada batch create/update/delete, log sekali aja dengan count:

```typescript
const deletedCount = await prisma.products.deleteMany({ ... });

await logFromRequest(
  request,
  'DELETE',
  'INVENTORY',
  `Batch deleted ${deletedCount} products`,
  { count: deletedCount, filter: 'low stock' }
);
```

### **Case 3: Background Jobs**

Kalau ada background jobs (scheduled tasks), use `logActivity` with system user:

```typescript
await logActivity({
  userId: 'SYSTEM',
  userRole: 'ADMIN',
  action: 'CLEANUP',
  module: 'SYSTEM',
  description: 'Automated daily cleanup',
  metadata: { deletedRecords: 50 },
});
```

---

## ✅ **TESTING CHECKLIST**

After implementing logging, test each endpoint:

### **Financial:**
- [ ] Create financial transaction → Check activity log
- [ ] Update financial transaction → Check activity log
- [ ] Delete financial transaction → Check activity log

### **Members:**
- [ ] Create member → Check activity log
- [ ] Update member → Check activity log
- [ ] Delete member → Check activity log

### **Broadcasts:**
- [ ] Create broadcast → Check activity log
- [ ] Update broadcast → Check activity log
- [ ] Delete broadcast → Check activity log

### **Suppliers:**
- [ ] Approve supplier → Check activity log
- [ ] Reject supplier → Check activity log
- [ ] Verify payment → Check activity log

### **Auth:**
- [ ] Login → Check activity log
- [ ] Logout (if exists) → Check activity log

### **Verify:**
- [ ] All logs have correct `action` names
- [ ] All logs have correct `module` names
- [ ] Metadata includes relevant IDs
- [ ] Descriptions are human-readable
- [ ] No TypeScript errors
- [ ] API still works if logging fails

---

## 🐛 **DEBUGGING**

If logging not working:

1. **Check Console Logs:**
   ```
   [Activity Logger] Failed: <error message>
   ```

2. **Check Token:**
   ```typescript
   const authHeader = request.headers.get('authorization');
   console.log('Auth header:', authHeader);
   ```

3. **Check User Extraction:**
   ```typescript
   import { getUserFromToken } from '@/lib/auth';
   const token = authHeader?.replace('Bearer ', '');
   const user = await getUserFromToken(token);
   console.log('User from token:', user);
   ```

4. **Check Database:**
   ```sql
   SELECT * FROM activity_logs 
   ORDER BY "createdAt" DESC 
   LIMIT 10;
   ```

---

## 📊 **PROGRESS TRACKING**

Update this as you complete each API:

### **Financial - 0/3**
- [ ] POST `/api/financial/transactions`
- [ ] PUT `/api/financial/transactions/[id]`
- [ ] DELETE `/api/financial/transactions/[id]`

### **Members - 0/3**
- [ ] POST `/api/members`
- [ ] PUT `/api/members/[id]`
- [ ] DELETE `/api/members/[id]`

### **Broadcasts - 0/3**
- [ ] POST `/api/broadcasts`
- [ ] PUT `/api/broadcasts/[id]`
- [ ] DELETE `/api/broadcasts/[id]`

### **Suppliers - 0/3**
- [ ] POST `/api/suppliers/[id]/approve`
- [ ] POST `/api/suppliers/[id]/reject`
- [ ] POST `/api/suppliers/[id]/verify-payment`

### **Auth - 0/1**
- [ ] POST `/api/auth/login`

**Total Progress: 0/13 (0%)**

---

## 🎯 **COMMIT STRATEGY**

Commit setiap kali complete 1 module:

```bash
git add .
git commit -m "feat: Add activity logging to Financial API (CREATE, UPDATE, DELETE)"
git push origin main
```

```bash
git add .
git commit -m "feat: Add activity logging to Members API (CREATE, UPDATE, DELETE)"
git push origin main
```

etc.

---

## 💬 **QUESTIONS?**

Kalau ada pattern yang beda atau edge case yang tidak covered di guide ini:
1. Check existing implementation di `app/api/products/` dan `app/api/stock-movements/`
2. Ask Reyvan di Discord
3. Document pattern baru di guide ini

---

## 🎉 **WHEN COMPLETE**

Setelah semua API punya logging:
1. ✅ Update progress tracking (13/13 = 100%)
2. ✅ Test manual semua endpoints
3. ✅ Verify di Activity Logs page
4. ✅ Push all commits
5. ✅ Update DEVELOPER-MODE-TRACKING.md Phase 3 status
6. 🎊 Celebrate! Activity logging complete!

---

**Good luck Aegner!** 🚀 
Pattern-nya consistent dan simple, tinggal copy-paste + adjust field names aja.

**Estimated Total Time:** 1-2 hours max untuk semua API.

---

**Last Updated:** 21 Oktober 2025, 16:30 WIB  
**Author:** Reyvan  
**For:** Aegner
