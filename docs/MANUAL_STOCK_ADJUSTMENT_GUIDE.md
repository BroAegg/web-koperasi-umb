# 📦 Manual Stock Adjustment Guide

**For**: Super Admin / Admin  
**Feature**: Offline stock management for supplier products  
**Added**: January 2025

---

## 🎯 Purpose

Handle stock adjustments that happen **outside the online restock request system**, such as:
- ✅ Supplier brings items directly to store (offline delivery)
- ✅ Damaged or expired goods need to be removed
- ✅ Stock opname corrections (fixing inventory discrepancies)
- ✅ Emergency manual adjustments

---

## 🔑 Access

**URL**: `/koperasi/super-admin/stock/adjust`  
**Permission**: Super Admin only  
**API Endpoints**:
- `POST /api/admin/stock/adjust` - Create adjustment
- `GET /api/admin/stock/adjust` - View history
- `GET /api/admin/products/search` - Search products

---

## 📋 Step-by-Step Usage

### Scenario 1: Supplier Brings Items In Person

**Example**: CV Makmur Jaya datang ke toko membawa 50 pcs Kopi Arabica

1. **Navigate**: Go to `/koperasi/super-admin/stock/adjust`

2. **Search Product**:
   - Type product name: "Kopi Arabica"
   - OR type supplier name: "CV Makmur"
   - Click Search

3. **Select Product**:
   - Click on the correct product from search results
   - Verify supplier name matches

4. **Add Stock**:
   - Click "Tambah" (Add Stock) button
   - **Current Stock**: Displays existing stock (e.g., 20)
   - **Quantity to Add**: Enter `50`
   - **Projected Stock**: Shows preview (20 + 50 = 70)
   - **Reason**: Select "Penitip datang bawa barang"
   - **Notes** (Optional): Add context like "Delivered by owner at 10:00 AM"

5. **Confirm**:
   - Review projected stock
   - Click "Konfirmasi Penambahan"
   - ✅ Success: Stock updated immediately

6. **Verify**:
   - Scroll to "Riwayat Penyesuaian" (Adjustment History)
   - See the new record with timestamp and reason
   - Check products table: stock now shows 70

---

### Scenario 2: Remove Damaged/Expired Goods

**Example**: 10 pcs Kopi Arabica expired and need to be removed

1. **Navigate & Search**: Same as Scenario 1

2. **Reduce Stock**:
   - Click "Kurangi" (Reduce Stock) button
   - **Current Stock**: 70
   - **Quantity to Reduce**: Enter `10`
   - **Projected Stock**: Shows preview (70 - 10 = 60)
   - **Reason**: Select "Barang rusak/kadaluarsa"
   - **Notes** (Optional): "Exp date: Jan 5, 2025"

3. **Safety Check**:
   - ⚠️ If projected stock would be negative, system prevents submission
   - Shows warning message
   - Must reduce smaller quantity

4. **Confirm**:
   - Click "Konfirmasi Pengurangan"
   - ✅ Success: Stock reduced immediately

5. **Verify**:
   - Check history shows "-10" reduction
   - Final stock: 60

---

## 🛡️ Safety Features

### Validation Rules:
1. ✅ **Product-Supplier Match**: Validates product belongs to specified supplier
2. ✅ **Prevent Negative Stock**: Cannot reduce stock below zero
3. ✅ **Transaction Safety**: Uses database transactions to prevent data corruption
4. ✅ **Audit Trail**: Every adjustment logged in `stock_movements` table

### Error Messages:
- "Product does not belong to this supplier" → Wrong product selected
- "Quantity would result in negative stock" → Reduce by smaller amount
- "Product not found" → Invalid product ID

---

## 📊 Adjustment History

**Location**: Bottom of adjustment page

**Information Displayed**:
- Timestamp (when adjustment was made)
- Type: "+" (add) or "-" (reduce)
- Quantity changed
- Reason selected
- Notes (if provided)
- Admin who made the change
- Balance after adjustment

**Filter Options**:
- By product (automatically filtered when product selected)
- By supplier (all products of supplier)
- By date range (future enhancement)

---

## 🔍 Database Impact

### Tables Updated:

1. **`products` table**:
   ```sql
   UPDATE products
   SET stock = stock + 50,
       lastRestockAt = NOW()
   WHERE id = 'prod_xxx';
   ```

2. **`stock_movements` table** (audit trail):
   ```sql
   INSERT INTO stock_movements (
     productId,
     movementType,
     quantity,
     balanceAfter,
     note,
     referenceType,
     referenceId,
     createdAt
   ) VALUES (
     'prod_xxx',
     'ADJUSTMENT',
     50,
     70,
     'Penitip datang bawa barang',
     'ADJUSTMENT',
     'prod_xxx',
     NOW()
   );
   ```

### Transaction Guarantee:
Both operations execute atomically - if one fails, both are rolled back.

---

## 🆚 Online vs Offline Stock Management

| Feature | **Online Restock** | **Manual Adjustment** |
|---------|-------------------|----------------------|
| **Who Initiates** | Supplier | Admin |
| **Location** | `/supplier/stock` | `/super-admin/stock/adjust` |
| **Approval** | Required (admin reviews) | Immediate |
| **Use Case** | Supplier requests more stock remotely | Supplier delivers in person, emergency fixes |
| **Workflow** | Request → Pending → Admin Approve → Stock Updated | Search → Adjust → Stock Updated |
| **Audit** | `stock_requests` + `stock_movements` | `stock_movements` only |
| **Status Tracking** | PENDING/APPROVED/REJECTED | N/A (instant) |

**Best Practice**: 
- Use **Online Restock** for planned supplier requests
- Use **Manual Adjustment** for walk-ins, emergencies, and corrections

---

## 📝 Reason Options

### For Adding Stock:
- "Penitip datang bawa barang" (Supplier brought items)
- "Stock opname correction" (Inventory correction - increase)
- "Transfer from other location" (Inter-warehouse transfer)

### For Reducing Stock:
- "Barang rusak/kadaluarsa" (Damaged/expired goods)
- "Stock opname correction" (Inventory correction - decrease)
- "Returned to supplier" (Items returned)

*Custom reasons can be added by modifying the dropdown in the UI component.*

---

## 🧪 Testing Checklist

Before using in production:

- [ ] **Search Functionality**: Test search by product name and supplier name
- [ ] **Add Stock**: Verify stock increases correctly
- [ ] **Reduce Stock**: Verify stock decreases correctly
- [ ] **Negative Stock Prevention**: Try to reduce more than available stock
- [ ] **Wrong Supplier**: Try to adjust product with mismatched supplier
- [ ] **History View**: Confirm all adjustments appear in history
- [ ] **Database Verification**: Check `stock_movements` table has correct records
- [ ] **Transaction Safety**: Simulate error mid-transaction (should rollback)

---

## 🐛 Troubleshooting

### Issue: "Product not found"
- **Cause**: Invalid product ID or product deleted
- **Fix**: Search again and select from results

### Issue: "Product does not belong to this supplier"
- **Cause**: Mismatch between selected product and supplier
- **Fix**: Verify supplier owns the product in database

### Issue: "Cannot reduce stock below zero"
- **Cause**: Trying to reduce more than current stock
- **Fix**: Check current stock, reduce by smaller amount

### Issue: Adjustment not appearing in history
- **Cause**: Page needs refresh
- **Fix**: Click search again to reload history

### Issue: Stock updated but no movement record
- **Cause**: Transaction partially failed (SHOULD NOT HAPPEN)
- **Fix**: Database inconsistency - contact developer immediately

---

## 📞 Support

For questions or issues:
- **Technical**: Contact development team
- **Business Logic**: Contact operations manager
- **Training**: Refer to USER_TRAINING_GUIDE.md

---

**Last Updated**: January 8, 2025  
**Version**: 1.0
