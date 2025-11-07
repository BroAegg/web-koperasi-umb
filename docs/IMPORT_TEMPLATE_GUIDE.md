# 📥 Excel Import Template - Koperasi UMB

## Template Structure

### Required Columns (Must Match Exactly!)

| Column Name | Type | Required | Max Length | Example | Notes |
|------------|------|----------|------------|---------|-------|
| `name` | Text | ✅ Yes | 200 | "Indomie Goreng" | Product name |
| `barcode` | Text | ❌ No | 50 | "8993333501010" | Must be unique if provided |
| `category` | Text | ✅ Yes | 100 | "Makanan" | Must exist in system |
| `supplier` | Text | ❌ No | 100 | "PT Indofood" | Optional supplier name |
| `buyPrice` | Number | ✅ Yes | - | 2500 | Purchase price (Rp) |
| `sellPrice` | Number | ✅ Yes | - | 3000 | Selling price (Rp) |
| `stock` | Number | ❌ No | - | 100 | Initial stock (default: 0) |
| `minStock` | Number | ❌ No | - | 10 | Minimum stock alert (default: 5) |
| `unit` | Text | ❌ No | 20 | "pcs" | Unit of measure (default: "pcs") |
| `description` | Text | ❌ No | 500 | "Mie instan rasa original" | Product description |

---

## Validation Rules

### 1. Name
- ✅ Required
- ✅ 1-200 characters
- ✅ Must be unique in system
- ❌ Cannot be empty or only spaces

### 2. Barcode
- ❌ Optional
- ✅ If provided, must be unique
- ✅ Max 50 characters
- ⚠️ Recommended for retail products

### 3. Category
- ✅ Required
- ✅ Must match existing category name
- ✅ Case-insensitive matching
- 📋 Available categories:
  - Makanan
  - Minuman
  - Alat Tulis
  - Snack
  - Sembako
  - Personal Care
  - Lainnya

### 4. Supplier
- ❌ Optional
- ✅ Will create if doesn't exist
- ✅ Max 100 characters

### 5. Buy Price
- ✅ Required
- ✅ Must be > 0
- ✅ Number format (no currency symbols)
- ✅ Can have decimals (e.g., 2500.50)

### 6. Sell Price
- ✅ Required
- ✅ Must be > 0
- ✅ Must be >= buyPrice (warning if less)
- ⚠️ System will warn if margin < 10%

### 7. Stock
- ❌ Optional (default: 0)
- ✅ Must be >= 0
- ✅ Integer only
- 💡 Can update later via stock management

### 8. Min Stock
- ❌ Optional (default: 5)
- ✅ Must be >= 0
- ✅ Used for low stock alerts

### 9. Unit
- ❌ Optional (default: "pcs")
- ✅ Common units: pcs, box, pack, kg, liter, bottle
- ✅ Max 20 characters

### 10. Description
- ❌ Optional
- ✅ Max 500 characters
- 💡 Helpful for product details

---

## Sample Data

### Example 1: Complete Product
```csv
name,barcode,category,supplier,buyPrice,sellPrice,stock,minStock,unit,description
Indomie Goreng,8993333501010,Makanan,PT Indofood,2500,3000,100,10,pcs,Mie instan rasa original goreng
```

### Example 2: Minimal Product
```csv
name,barcode,category,supplier,buyPrice,sellPrice,stock,minStock,unit,description
Buku Tulis 38,,Alat Tulis,,3000,5000,,,,Buku tulis 38 lembar
```

### Example 3: Multiple Products
```csv
name,barcode,category,supplier,buyPrice,sellPrice,stock,minStock,unit,description
Aqua 600ml,8993333601011,Minuman,PT Aqua,2000,3000,50,20,botol,Air mineral kemasan 600ml
Teh Botol Sosro,8993333701012,Minuman,PT Sosro,2500,4000,40,15,botol,Teh manis kemasan botol
Pulpen Standard,8993333801013,Alat Tulis,Supplier ATK,1500,3000,30,10,pcs,Pulpen warna biru/hitam
Mie Sedaap Goreng,8993333901014,Makanan,PT Wings,2400,2900,80,15,pcs,Mie instant goreng
Chitato BBQ,8994334001015,Snack,PT Indofood,5000,8000,25,10,pack,Keripik kentang rasa BBQ
```

---

## Import Process

### Step 1: Prepare Excel File
1. Download template: `import-template.xlsx`
2. Fill in your products
3. Save as `.xlsx` or `.csv`
4. Check for validation errors

### Step 2: Upload to System
1. Login as SUPER_ADMIN
2. Go to: Products > Import
3. Click "Upload Excel"
4. Select your file
5. Wait for validation

### Step 3: Review & Confirm
- System shows preview
- Check for errors/warnings
- Fix if needed
- Click "Import All"

### Step 4: Verify
- Check imported count
- View products list
- Verify stock quantities
- Check categories assigned

---

## Common Errors & Solutions

### ❌ "Name is required"
**Solution:** Ensure every row has a product name in column A

### ❌ "Category not found"
**Solution:** Check category spelling. Must match: Makanan, Minuman, Alat Tulis, Snack, Sembako, Personal Care, Lainnya

### ❌ "Duplicate barcode"
**Solution:** Barcode must be unique. Remove duplicates or leave empty

### ❌ "Sell price less than buy price"
**Solution:** Check pricing. Sell price should be higher for profit

### ❌ "Invalid number format"
**Solution:** Use numbers only (no Rp, no commas). Example: 2500 not Rp 2,500

### ⚠️ "Low margin warning"
**Solution:** Profit margin < 10%. Review pricing strategy

---

## Tips for Best Results

### ✅ Before Import:
- [ ] Remove empty rows at the end
- [ ] Check all required columns present
- [ ] Verify no duplicate product names
- [ ] Ensure prices are reasonable
- [ ] Remove any formatting (colors, formulas)

### ✅ Data Quality:
- Use consistent naming (capitalize properly)
- Include barcodes when possible
- Set realistic min stock levels
- Add descriptions for clarity
- Assign correct categories

### ✅ Large Imports:
- Test with 10 products first
- Import in batches of 100-200
- Keep backup of Excel file
- Verify each batch before next

---

## Performance Notes

- **Small Import** (1-50 products): ~5-10 seconds
- **Medium Import** (51-200 products): ~20-30 seconds
- **Large Import** (201-500 products): ~1-2 minutes
- **Very Large** (500+ products): ~2-5 minutes

**Progress bar will show real-time status!**

---

## Download Template

**Method 1: Use Provided Template**
- File: `docs/import-template.xlsx`
- Pre-configured with validation
- Sample data included

**Method 2: System Generated**
- Go to: Products > Import
- Click "Download Template"
- Auto-generated with current categories

---

## Support

**Issues during import?**
- Check this guide first
- Verify Excel format matches exactly
- Test with sample data
- Contact developer if needed

**Need help with categories?**
- See: Category Management
- Can add new categories before import
- Default categories should cover most items

---

## Version History

- **v1.0** (Nov 4, 2025) - Initial template
- Column structure defined
- Validation rules established
- Sample data provided

---

**Ready to import?** 📥  
**Next:** Build Import API & UI 🚀
