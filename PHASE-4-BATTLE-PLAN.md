# Phase 4 JSX Replacement Battle Plan

## Current Status (October 16, 2025)
- ✅ Phase 1: Types & Hooks extracted (290 lines)
- ✅ Phase 2: UI Components extracted (630 lines)  
- ✅ Phase 3: Modals & Table extracted (1,000 lines)
- ✅ Phase 4 Partial: Imports & State modernized (175 lines saved)
- ⏳ Phase 4 Final: **JSX Replacement PENDING**

## File Status
- **Original**: `page.tsx` (2,394 lines)
- **Current**: `page.tsx` (2,219 lines after imports cleanup)
- **Backup**: `page.backup.tsx` (safe fallback)
- **Target**: `page.tsx` (~400-500 lines after JSX replacement)

## Replacement Strategy

### Section 1: ProductFilters Component (~200 lines to remove)
**Location**: Lines ~825-930  
**Find**: Search input + hide out-of-stock toggle + filter button + active chips  
**Replace With**:
```tsx
<ProductFilters
  searchTerm={searchTerm}
  hideOutOfStock={hideOutOfStock}
  filters={{
    category: selectedCategory,
    ownership: selectedOwnership,
    cycle: selectedCycle
  }}
  onSearchChange={setSearchTerm}
  onHideOutOfStockToggle={() => setHideOutOfStock(!hideOutOfStock)}
  onFilterClick={() => setShowFilterModal(true)}
  onCategoryRemove={() => setSelectedCategory('semua')}
  onOwnershipRemove={() => setSelectedOwnership('semua')}
  onCycleRemove={() => setSelectedCycle('semua')}
  onClearAll={() => {
    setSelectedCategory('semua');
    setSelectedOwnership('semua');
    setSelectedCycle('semua');
  }}
  activeFiltersCount={
    [selectedCategory !== 'semua', selectedOwnership !== 'semua', selectedCycle !== 'semua']
      .filter(Boolean).length
  }
  filteredCount={filteredProducts.length}
  totalCount={products.length}
/>
```

### Section 2: ProductTable Component (~180 lines to remove)
**Location**: Lines ~940-1104  
**Find**: `<Table>` to `</Table>` with all TableRow/TableCell logic  
**Replace With**:
```tsx
<ProductTable
  products={paginatedProducts}
  hideOutOfStock={hideOutOfStock}
  onView={handleViewProduct}
  onEdit={handleEditProduct}
  onStockUpdate={handleStockUpdate}
  onDelete={handleDeleteProduct}
/>
```

### Section 3: Pagination Component (~60 lines to remove)
**Location**: Lines ~1105-1165  
**Find**: Pagination controls with page numbers & chevrons  
**Replace With**:
```tsx
{totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    startIndex={startIndex}
    endIndex={endIndex}
    totalItems={filteredProducts.length}
  />
)}
```

### Section 4: ProductModal Component (~400 lines to remove)
**Location**: Lines ~1280-1680  
**Find**: Add/Edit Product Modal with full form  
**Replace With**:
```tsx
<ProductModal
  isOpen={showAddModal}
  product={editingProduct}
  categories={categories}
  suppliers={suppliers}
  onClose={() => {
    setShowAddModal(false);
    setEditingProduct(null);
    resetProductForm();
  }}
  onSubmit={handleAddProduct}
  isSubmitting={isSubmitting}
/>
```
**Note**: Need to adapt handleAddProduct to receive ProductFormData

### Section 5: StockModal Component (~200 lines to remove)
**Location**: Lines ~1682-1882  
**Find**: Stock Movement Modal  
**Replace With**:
```tsx
<StockModal
  isOpen={showStockModal}
  product={selectedProduct}
  onClose={() => {
    setShowStockModal(false);
    setSelectedProduct(null);
  }}
  onSubmit={handleStockMovement}
  isSubmitting={isSubmitting}
/>
```
**Note**: Need to adapt handleStockMovement to receive StockFormData

### Section 6: FilterModal Component (~200 lines to remove)
**Location**: Lines ~1884-2084  
**Find**: Filter Modal with category/ownership/cycle selectors  
**Replace With**:
```tsx
<FilterModal
  isOpen={showFilterModal}
  categories={categories}
  selectedCategory={selectedCategory}
  selectedOwnership={selectedOwnership}
  selectedCycle={selectedCycle}
  onCategoryChange={setSelectedCategory}
  onOwnershipChange={setSelectedOwnership}
  onCycleChange={setSelectedCycle}
  onReset={() => {
    setSelectedCategory('semua');
    setSelectedOwnership('semua');
    setSelectedCycle('semua');
  }}
  onClose={() => setShowFilterModal(false)}
/>
```

### Section 7: StockMovementsList Component (~100 lines to remove)
**Location**: Lines ~1168-1240  
**Find**: Recent Stock Movements card content  
**Replace With**:
```tsx
<StockMovementsList
  movements={stockMovements}
  selectedDate={selectedDate}
  onViewAll={() => setShowAllMovementsModal(true)}
  maxDisplay={5}
/>
```

## Handler Adaptations Needed

### 1. handleAddProduct
**Current**: Receives `React.FormEvent`, uses `newProduct` state  
**Need**: Receive `ProductFormData` from ProductModal  
```tsx
const handleProductSubmit = async (formData: ProductFormData) => {
  setIsSubmitting(true);
  try {
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    
    const productData = {
      ...formData,
      buyPrice: parsePriceInput(formData.buyPrice),
      sellPrice: parsePriceInput(formData.sellPrice),
    };
    
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
    // ... rest of logic
  } finally {
    setIsSubmitting(false);
  }
};
```

### 2. handleStockMovement
**Current**: Receives `React.FormEvent`, uses `stockFormData` state  
**Need**: Receive `StockFormData` from StockModal  
```tsx
const handleStockSubmit = async (formData: StockFormData) => {
  if (!selectedProduct) return;
  
  const quantity = parseInt(formData.quantity);
  if (quantity <= 0) {
    warning('Jumlah Tidak Valid', 'Jumlah harus lebih dari 0');
    return;
  }
  
  if (formData.type === 'OUT' && quantity > selectedProduct.stock) {
    warning('Stok Tidak Cukup', `Stok tersedia: ${selectedProduct.stock}`);
    return;
  }
  
  setIsSubmitting(true);
  try {
    const response = await fetch('/api/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        type: formData.type,
        quantity,
        note: formData.note,
      }),
    });
    // ... rest of logic
  } finally {
    setIsSubmitting(false);
  }
};
```

## Expected Results
- **Before**: 2,219 lines
- **After**: ~400-500 lines (82% reduction)
- **Breakdown**:
  - Imports: ~30 lines
  - State declarations: ~50 lines
  - Effects & fetch functions: ~150 lines
  - Helper functions: ~80 lines
  - Filtering & pagination logic: ~40 lines
  - Main JSX return: ~120 lines (mostly component calls)
  - View Product Modal (not extracted): ~100 lines
  - All Movements Modal (not extracted): ~180 lines

## Risk Mitigation
1. ✅ Backup exists (`page.backup.tsx`)
2. Work section by section, test after each
3. Commit after each working section
4. Keep helper functions & handlers intact
5. Don't touch:
   - View Product Modal (lines ~2086-2256)
   - All Movements Modal (lines ~2258-2445)
   - These can be extracted later

## Testing Checklist
After replacement complete:
- [ ] Search products works
- [ ] Filter by category works
- [ ] Filter by ownership works
- [ ] Filter by stock cycle works
- [ ] Hide out-of-stock toggle works
- [ ] Pagination works
- [ ] Add product works
- [ ] Edit product works
- [ ] Delete product works
- [ ] Stock IN works
- [ ] Stock OUT works
- [ ] View product details works
- [ ] Low stock alerts show
- [ ] Recent movements display
- [ ] No TypeScript errors
- [ ] No console errors

## Next Session Plan
1. Restore clean backup
2. Replace Section 1 (ProductFilters)
3. Test & commit
4. Replace Section 2 (ProductTable)  
5. Test & commit
6. Replace Section 3 (Pagination)
7. Test & commit
8. Adapt handleAddProduct & replace Section 4 (ProductModal)
9. Test & commit
10. Adapt handleStockMovement & replace Section 5 (StockModal)
11. Test & commit
12. Replace Section 6 (FilterModal)
13. Test & commit
14. Replace Section 7 (StockMovementsList) if not yet done
15. Final testing
16. Update documentation
17. Celebrate! 🎉

## Commit Strategy
Each section gets its own commit:
- `refactor(inventory): replace ProductFilters with component`
- `refactor(inventory): replace ProductTable with component`
- `refactor(inventory): replace Pagination with component`
- `refactor(inventory): integrate ProductModal component`
- `refactor(inventory): integrate StockModal component`
- `refactor(inventory): integrate FilterModal component`
- `refactor(inventory): phase 4 complete - modularization done`

## Final Metrics to Document
- Lines before: 2,394
- Lines after: ~400-500
- Reduction: ~82%
- Components created: 12
- Total extracted: ~1,950 lines
- Commits: ~10 total
- Time saved in future: Immeasurable 😎
