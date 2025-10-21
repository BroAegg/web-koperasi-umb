# 🔥 SUPPLIER TABLE MERGE REFACTOR

**Date:** 21 Oktober 2025  
**Objective:** Merge `supplier_profiles` into `suppliers` table - eliminate duplicate data

---

## 📊 CURRENT STATE (BROKEN)

**2 Tables:**
- `supplier_profiles` - Auth, payment, status
- `suppliers` - Products, transactions

**Problems:**
- Different IDs for same supplier
- Email in both tables (duplicate)
- Hard to sync
- APIs fail due to ID mismatch

---

## ✅ TARGET STATE (CLEAN)

**1 Table: `suppliers`**
- All fields merged
- Single source of truth
- Simple queries
- No sync needed

---

## 🛠️ MIGRATION PLAN

### Phase 1: Update Schema ✅
- Add fields to `suppliers`: password, status, paymentStatus, etc.
- Keep supplier_profiles for now (safety)

### Phase 2: Migrate Data ✅
- Copy all data from supplier_profiles to suppliers
- Match by email
- Preserve all relationships

### Phase 3: Update APIs ✅
- Login: Query suppliers instead of supplier_profiles
- Register: Insert to suppliers instead of supplier_profiles
- Profile: Query suppliers
- Products: Already correct

### Phase 4: Cleanup (Later) ⏳
- Drop supplier_profiles table
- Remove old migrations
- Update docs

---

## 🔄 ROLLBACK PLAN

If anything breaks:
1. Revert Prisma schema
2. Run: `npx prisma db push --force-reset`
3. Restore from backup (if needed)
4. Git revert commits

---

## 📝 PROGRESS TRACKING

- [ ] Backup current schema
- [ ] Update Prisma schema
- [ ] Create migration
- [ ] Run migration
- [ ] Update register API
- [ ] Update login API
- [ ] Update profile API
- [ ] Test register flow
- [ ] Test login flow
- [ ] Test dashboard
- [ ] Commit changes

