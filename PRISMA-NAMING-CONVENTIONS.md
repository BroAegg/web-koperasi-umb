# 🔧 Prisma Naming Conventions - Team Guide

**CRITICAL: Read this before working with Prisma queries!**

---

## ⚠️ THE PROBLEM

Our Prisma schema uses **snake_case plural** naming for models and relations:
```prisma
model products {
  id String @id
  categories categories @relation(...)  // Relation field name
  suppliers suppliers? @relation(...)   // Relation field name
  stock_movements stock_movements[]     // Relation field name
  transaction_items transaction_items[] // Relation field name
}
```

**BUT** TypeScript might show autocomplete suggesting camelCase singular names like:
- ❌ `prisma.product` (TypeScript suggests this)
- ❌ `include: { category: true }` (TypeScript suggests this)

**ACTUAL Prisma Client generated names are:**
- ✅ `prisma.products` (plural snake_case)
- ✅ `include: { categories: true }` (exact match to schema)

---

## ✅ CORRECT USAGE

### Model Names (findMany, findUnique, create, etc)
```typescript
// ✅ CORRECT - Use exact model name from schema
await prisma.products.findMany()
await prisma.users.findUnique()
await prisma.transactions.create()
await prisma.supplier_profiles.findFirst()
await prisma.stock_movements.update()
await prisma.transaction_items.delete()

// ❌ WRONG - TypeScript may suggest these but they DON'T EXIST at runtime
await prisma.product.findMany()        // ERROR!
await prisma.user.findUnique()         // ERROR!
await prisma.transaction.create()      // ERROR!
await prisma.supplierProfile.findFirst() // ERROR!
```

### Relation Names (include, select)
```typescript
// ✅ CORRECT - Use exact relation field name from schema
await prisma.products.findMany({
  include: {
    categories: true,          // Match schema: "categories categories"
    suppliers: true,           // Match schema: "suppliers suppliers?"
    stock_movements: true,     // Match schema: "stock_movements stock_movements[]"
    transaction_items: true,   // Match schema: "transaction_items transaction_items[]"
  }
})

// ❌ WRONG - Will throw runtime error
await prisma.products.findMany({
  include: {
    category: true,      // ERROR: "Unknown field `category`"
    supplier: true,      // ERROR: "Unknown field `supplier`"
    stockMovements: true, // ERROR: "Unknown field `stockMovements`"
  }
})
```

### Connect Relations (create, update)
```typescript
// ✅ CORRECT
await prisma.products.create({
  data: {
    name: "Product",
    categories: { connect: { id: categoryId } },  // Match schema relation name
    suppliers: { connect: { id: supplierId } },   // Match schema relation name
  }
})

// ❌ WRONG
await prisma.products.create({
  data: {
    name: "Product",
    category: { connect: { id: categoryId } },  // ERROR!
    supplier: { connect: { id: supplierId } },  // ERROR!
  }
})
```

---

## 🎯 QUICK REFERENCE TABLE

| Schema Model Name | Prisma Client Usage | Include Relation Names |
|-------------------|---------------------|------------------------|
| `products` | `prisma.products` | `categories`, `suppliers`, `stock_movements`, `transaction_items` |
| `users` | `prisma.users` | `members`, `supplier_profiles` |
| `transactions` | `prisma.transactions` | `transaction_items`, `members` |
| `supplier_profiles` | `prisma.supplier_profiles` | `users`, `suppliers` |
| `stock_movements` | `prisma.stock_movements` | `products` |
| `transaction_items` | `prisma.transaction_items` | `products`, `transactions` |
| `categories` | `prisma.categories` | `products` |
| `suppliers` | `prisma.suppliers` | `products`, `supplier_profiles` |
| `members` | `prisma.members` | `users`, `transactions`, `loans`, `savings` |

---

## 🔍 HOW TO CHECK CORRECT NAMES

### Method 1: Check Schema Directly
```bash
# Open prisma/schema.prisma and find the model
model products {
  categories categories @relation(...)  # This is the relation field name to use
}
```

### Method 2: Check Generated Client
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log(Object.keys(p).filter(k => !k.startsWith('_') && !k.startsWith('$')));"
```

### Method 3: Check TypeScript Types (after prisma generate)
```bash
# Look in node_modules/.prisma/client/index.d.ts
# Search for "export type ProductInclude" to see available relation names
```

---

## 🐛 WHY TYPESCRIPT SHOWS WRONG SUGGESTIONS?

**TypeScript Language Server caching issue!**

When you:
1. Run `npx prisma generate`
2. TypeScript server is already running
3. It doesn't reload the new types immediately

**Solutions:**
1. **VS Code**: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. **Restart dev server**: Stop `npm run dev` and start again
3. **Hard reload**: Close VS Code, delete `node_modules/.prisma`, run `npx prisma generate`, reopen VS Code

---

## ✅ CHECKLIST FOR NEW TEAM MEMBERS

Before writing any Prisma query:

- [ ] Check schema for exact model name (e.g., `products` not `Product`)
- [ ] Check schema for exact relation field names (e.g., `categories` not `category`)
- [ ] Use snake_case plural exactly as defined in schema
- [ ] Ignore TypeScript red squiggles if you're using correct schema names
- [ ] Test in browser - runtime is source of truth, not TypeScript errors
- [ ] If changing schema, run `npx prisma generate` then restart TS server

---

## 🚨 COMMON ERRORS & FIXES

### Error: "Property 'product' does not exist. Did you mean 'products'?"
**Cause**: Using singular when schema has plural  
**Fix**: Use `prisma.products` not `prisma.product`

### Error: "Unknown field `category` for include statement"
**Cause**: Using singular relation name  
**Fix**: Check schema - if it says `categories categories`, use `categories` in include

### Error: "Cannot read properties of undefined (reading 'findMany')"
**Cause**: Model name doesn't exist in generated client  
**Fix**: Run `node -e "..."` command above to see available models

---

## 📝 WHEN EDITING SCHEMA

**If you want cleaner naming** (not recommended mid-project):

```prisma
// Option A: Rename in schema + add @@map
model Product {  // PascalCase singular
  id String @id
  category Category @relation(...)  // camelCase singular
  
  @@map("products")  // Maps to existing table
}

// Then run:
// 1. npx prisma generate
// 2. Restart TS server
// 3. Update all queries to use new names
```

**Current approach** (use schema names as-is):
- ✅ Faster (no migration needed)
- ✅ No breaking changes
- ⚠️ Must remember to use snake_case plural

---

**Last Updated**: Day 14 (October 18, 2025)  
**Status**: Active - All team members must follow  
**Questions?** Ask before coding to avoid "workspace works for me but not for others" issues!
