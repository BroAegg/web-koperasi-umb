# 🔧 QUICK REFERENCE - Supplier Verification System

## 🎯 Status Cheat Sheet

```
PENDING          → Waiting admin approval (blocked screen)
ACTIVE + UNPAID  → Can submit payment (payment form)
ACTIVE + PAID_PENDING_APPROVAL → Waiting payment verification
ACTIVE + PAID_APPROVED → Full access ✅
ACTIVE + PAID_REJECTED → Payment rejected (back to form)
```

## 📡 API Endpoints

### Submit Payment
```bash
POST /api/supplier/monthly-payment
Authorization: Bearer {supplier_token}
Body: { "proofImageUrl": "https://..." }

Response: { 
  "success": true, 
  "paymentStatus": "PAID_PENDING_APPROVAL" 
}
```

### Verify Payment
```bash
POST /api/admin/verify-payment
Authorization: Bearer {admin_token}
Body: { "supplierId": "sup-xxx", "approve": true }

Response: { 
  "success": true, 
  "paymentStatus": "PAID_APPROVED" 
}
```

## 🗄️ Database Quick Check

```javascript
// Check supplier status
const supplier = await prisma.suppliers.findUnique({
  where: { email: "test@demo.com" },
  include: { 
    supplier_payments: { 
      orderBy: { createdAt: 'desc' }, 
      take: 1 
    } 
  }
});

console.log(supplier.status);        // PENDING, ACTIVE, REJECTED
console.log(supplier.paymentStatus); // UNPAID, PAID_PENDING_APPROVAL, etc.
```

## 🔄 Manual Status Change (For Testing)

```javascript
// Approve supplier
await prisma.suppliers.update({
  where: { id: 'sup-xxx' },
  data: { status: 'ACTIVE', approvedAt: new Date() }
});

// Approve payment
await prisma.supplier_payments.update({
  where: { id: 'spay-xxx' },
  data: { status: 'VERIFIED', verifiedAt: new Date() }
});

await prisma.suppliers.update({
  where: { id: 'sup-xxx' },
  data: { paymentStatus: 'PAID_APPROVED' }
});
```

## 🧪 Testing Commands

```bash
# Full workflow test
node test-supplier-workflow.js

# Check all suppliers
node check-supplier-status.js

# Run dev server
npm run dev
```

## 🎨 UI Components Map

```
app/koperasi/supplier/page.tsx
  └─ PENDING → Animated hourglass + "Menunggu Persetujuan"
  └─ ACTIVE + UNPAID → Payment form (BCA account + upload)
  └─ ACTIVE + PAID_APPROVED → Full dashboard

app/koperasi/super-admin/suppliers/page.tsx
  └─ Tab: "Pending Approval" (Approve/Reject buttons)
  └─ Tab: "Waiting Payment" (View Proof + Approve/Reject)
  └─ Tab: "Active Suppliers"

components/supplier/SupplierCard.tsx
  └─ Show payment badge if PAID_PENDING_APPROVAL
  └─ Eye icon for viewing proof
  └─ Approve/Reject buttons (super admin only)
```

## 🔑 Test Credentials

```
Super Admin:
  http://localhost:3000/koperasi
  Email: superadmin@koperasi.com
  Password: superadmin123

Existing Suppliers:
  - test.supplier.{timestamp}@demo.com / supplier123 (from automated test)
  - supplier@gehuabadi.com / supplier123 (demo data)
```

## 🐛 Common Issues & Fixes

### Issue: "Unauthorized" error
```javascript
// Fix: Check localStorage token
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? 'EXISTS' : 'MISSING');
```

### Issue: Payment status not updating
```javascript
// Fix: Check enum values
// ❌ Wrong: status: 'APPROVED'
// ✅ Correct: status: 'VERIFIED'

// ❌ Wrong: paymentStatus: 'PENDING'
// ✅ Correct: paymentStatus: 'PAID_PENDING_APPROVAL'
```

### Issue: Field not found error
```javascript
// Fix: Use correct field names
// ❌ Wrong: companyName, proofImageUrl
// ✅ Correct: businessName, paymentProof
```

## 📊 Status Enum Values

```typescript
SupplierStatus:
  - PENDING
  - ACTIVE
  - REJECTED

PaymentStatus:
  - UNPAID
  - PARTIAL
  - PAID
  - PAID_PENDING_APPROVAL
  - PAID_APPROVED
  - PAID_REJECTED

PaymentVerificationStatus:
  - PENDING
  - VERIFIED
  - REJECTED
```

## 🚀 Quick Deploy Checklist

- [ ] Set JWT_SECRET in .env
- [ ] Configure database connection
- [ ] Set up file upload (S3/Cloudinary)
- [ ] Test all 4 stages manually
- [ ] Run automated test script
- [ ] Check error handling
- [ ] Verify role permissions
- [ ] Enable email notifications (optional)

---

**For detailed documentation, see:** `SUPPLIER-VERIFICATION-COMPLETE.md`
