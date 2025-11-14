# Supplier System - Schema Update Plan

## 📊 Current Schema Status

### ✅ Already Implemented
- **suppliers table**: Complete with status, payment tracking
- **supplier_payments table**: Payment history and verification
- **SupplierStatus enum**: PENDING, APPROVED, REJECTED, SUSPENDED, ACTIVE
- **PaymentStatus enum**: Comprehensive payment states
- **products.supplierId**: Link products to suppliers

### 🔧 Required Updates

## 1. Grace Period Tracking

**Add to `suppliers` table:**
```prisma
model suppliers {
  // ... existing fields
  
  // Grace period tracking
  paymentGraceDays     Int             @default(7)
  isSuspendedForPayment Boolean        @default(false)
  suspendedAt          DateTime?
  suspensionReason     String?
}
```

## 2. Product Submissions (Approval Workflow)

**New table:**
```prisma
model product_submissions {
  id                String                @id @default(cuid())
  supplierId        String
  name              String
  description       String?
  category          String
  price             Decimal
  stockInitial      Int
  unit              String                @default("pcs")
  image             String?
  status            SubmissionStatus      @default(PENDING_REVIEW)
  submittedAt       DateTime              @default(now())
  reviewedAt        DateTime?
  reviewedBy        String?
  rejectionReason   String?
  approvedProductId String?               @unique
  
  // Relations
  supplier          suppliers             @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  reviewer          users?                @relation(fields: [reviewedBy], references: [id])
  approvedProduct   products?             @relation(fields: [approvedProductId], references: [id])
  
  @@index([supplierId, status])
  @@index([status, submittedAt])
}

enum SubmissionStatus {
  PENDING_REVIEW
  APPROVED
  REJECTED
  RESUBMITTED
}
```

## 3. Profit Sharing

**Add to `products` table:**
```prisma
model products {
  // ... existing fields
  
  // Profit sharing
  profitShareRate      Decimal?  @default(90.00)  // Supplier gets 90%, Koperasi 10%
  isConsignment        Boolean   @default(false)  // true = 95% supplier, 5% koperasi
}
```

## 4. Supplier Product Limit

**Add to `suppliers` table:**
```prisma
model suppliers {
  // ... existing fields
  
  // Product limits
  maxActiveProducts    Int       @default(10)
  currentActiveProducts Int      @default(0)
}
```

## 📅 Payment Logic Implementation

### Auto-Suspend Logic (Cron Job)
```typescript
// Run daily at 00:01
// Check if today > nextPaymentDue + graceDays
// If true and not paid:
//   - Set status = SUSPENDED
//   - Set isSuspendedForPayment = true
//   - Set suspendedAt = now()
//   - Set suspensionReason = "Payment overdue"
```

### Payment Verification Flow
1. Supplier upload bukti transfer → supplier_payments.status = PENDING
2. Admin review → VERIFIED or REJECTED
3. If VERIFIED:
   - Update supplier.lastPaymentDate = now()
   - Calculate nextPaymentDue = startOfNextMonth
   - Set supplier.status = ACTIVE
   - Set isSuspendedForPayment = false
   - Set paymentStatus = PAID_APPROVED

## 🔄 Product Submission Flow

```
Supplier submits product
  ↓
product_submissions.status = PENDING_REVIEW
  ↓
SUPER_ADMIN/ADMIN reviews
  ↓
  ├─ APPROVED → Create record in `products` table
  │             Link: product_submissions.approvedProductId
  │             Increment: suppliers.currentActiveProducts
  │
  └─ REJECTED → Set rejectionReason
                Supplier can edit & resubmit
```

## 🎯 Profit Sharing Calculation

```typescript
// On each sale:
const productPrice = 10000;
const profitShareRate = product.profitShareRate || 90;

const supplierShare = (productPrice * profitShareRate) / 100;  // 9000
const koperasiShare = productPrice - supplierShare;             // 1000

// Save to settlement or consignment_sales
```

## 📋 Migration Steps

1. ✅ Update Prisma schema with new fields/tables
2. ✅ Run `npx prisma migrate dev --name supplier_system_enhancement`
3. ✅ Run `npx prisma generate`
4. ✅ Update seed data for existing suppliers
5. ✅ Implement auto-suspend cron job
6. ✅ Build product submission UI (supplier side)
7. ✅ Build admin approval dashboard
8. ✅ Integrate profit sharing in POS/settlement

## 🚀 Priority Order

1. **Payment Grace Period** (High Priority)
   - Add grace tracking fields
   - Implement auto-suspend logic
   
2. **Product Submissions** (High Priority)
   - Create submission table
   - Build submission form (supplier)
   - Build approval dashboard (admin)
   
3. **Profit Sharing** (Medium Priority)
   - Add profit fields to products
   - Integrate with settlement calculation
   
4. **Product Limits** (Low Priority)
   - Add limit tracking
   - Enforce in UI

---

## ✅ Next Steps

**Immediate Action**: Update `schema.prisma` with the changes above, then run migration.

**Test Data**: Seed CV Makmur Jaya with:
- status = ACTIVE
- nextPaymentDue = 2025-12-01
- isPaymentActive = true
- maxActiveProducts = 10
