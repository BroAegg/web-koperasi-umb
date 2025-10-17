import React, { useState } from 'react';
import { X, Plus, Edit, Package, Search, Phone, Hash, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product, Category, Supplier, ProductFormData } from '@/types/inventory';
import { 
  formatPriceInput, 
  parsePrice, 
  validatePrices as validatePriceHelper, 
  calculateMargin 
} from '@/lib/inventory-helpers';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null; // null = add mode, product = edit mode
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => void;
  isSubmitting: boolean;
}

export default function ProductModal({
  isOpen,
  product,
  categories,
  suppliers,
  onClose,
  onSubmit,
  isSubmitting
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    product ? {
      name: product.name,
      categoryId: product.categoryId,
      description: product.description || '',
      sku: product.sku || '',
      unit: product.unit,
      buyPrice: product.buyPrice?.toString() || '',
      sellPrice: product.sellPrice.toString(),
      stock: product.stock.toString(),
      threshold: product.threshold.toString(),
      ownershipType: product.ownershipType || 'TOKO',
      stockCycle: product.stockCycle || 'HARIAN',
      supplierId: product.supplierId || '',
      supplierName: product.supplier?.name || '',
      supplierContact: ''
    } : {
      name: '',
      categoryId: '',
      description: '',
      sku: '',
      unit: 'pcs',
      buyPrice: '',
      sellPrice: '',
      stock: '0',
      threshold: '5',
      ownershipType: 'TOKO',
      stockCycle: 'HARIAN',
      supplierId: '',
      supplierName: '',
      supplierContact: ''
    }
  );

  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [priceError, setPriceError] = useState('');

  const validatePrices = (buyPrice: string, sellPrice: string) => {
    const error = validatePriceHelper(buyPrice, sellPrice);
    setPriceError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (priceError) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                {product ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {product ? 'Ubah informasi produk' : 'Masukkan informasi produk baru'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PRIORITY 1: Jenis Kepemilikan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kepemilikan *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, ownershipType: 'TOKO'})}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    formData.ownershipType === 'TOKO'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  Toko
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, ownershipType: 'TITIPAN'})}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    formData.ownershipType === 'TITIPAN'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  Titipan
                </button>
              </div>
            </div>

            {/* Supplier Autocomplete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Supplier
                </label>
                <Input
                  type="text"
                  value={formData.supplierName || ''}
                  onChange={(e) => {
                    setFormData({...formData, supplierName: e.target.value});
                    setShowSupplierDropdown(true);
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                  placeholder="Ketik nama supplier..."
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                />
                {showSupplierDropdown && formData.supplierName && formData.supplierName.trim() && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suppliers
                      .filter(s => s.name.toLowerCase().includes(formData.supplierName!.toLowerCase()))
                      .map((supplier) => (
                        <button
                          key={supplier.id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData, 
                              supplierId: supplier.id, 
                              supplierName: supplier.name,
                              supplierContact: supplier.phone || supplier.email || ''
                            });
                            setShowSupplierDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{supplier.name}</span>
                            <span className="text-xs text-gray-500">{supplier.code}</span>
                          </div>
                          {(supplier.phone || supplier.email) && (
                            <span className="text-xs text-gray-400">
                              {supplier.phone || supplier.email}
                            </span>
                          )}
                        </button>
                      ))}
                    {suppliers.filter(s => s.name.toLowerCase().includes(formData.supplierName!.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Supplier tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Info Kontak Supplier <span className="text-gray-500 font-normal">(Opsional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.supplierContact || ''}
                  onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                  placeholder="No. HP / Email (Opsional)"
                  leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
                />
              </div>
            </div>

            {/* Product Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Masukkan nama produk"
                  leftIcon={<Package className="w-4 h-4 text-gray-400" />}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi <span className="text-gray-500 font-normal">(Opsional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Deskripsi produk..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* SKU & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU <span className="text-gray-500 font-normal">(Opsional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="SKU produk"
                  leftIcon={<Hash className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satuan
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="liter">Liter</option>
                  <option value="pack">Pack</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Beli *
                </label>
                <Input
                  type="text"
                  value={formData.buyPrice}
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value);
                    setFormData({...formData, buyPrice: formatted});
                    validatePrices(formatted, formData.sellPrice);
                  }}
                  placeholder="0"
                  leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Jual *
                </label>
                <Input
                  type="text"
                  value={formData.sellPrice}
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value);
                    setFormData({...formData, sellPrice: formatted});
                    validatePrices(formData.buyPrice, formatted);
                  }}
                  placeholder="0"
                  leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                  className={priceError ? 'border-red-300 focus:ring-red-500' : ''}
                  required
                />
                {priceError && (
                  <p className="text-red-500 text-xs mt-1">{priceError}</p>
                )}
              </div>
            </div>

            {/* Live Margin Display */}
            {formData.buyPrice && formData.sellPrice && !priceError && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Margin Keuntungan:</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      Rp {formatPriceInput(calculateMargin(formData.buyPrice, formData.sellPrice).margin.toString())}
                    </p>
                    <p className="text-xs text-gray-600">
                      {calculateMargin(formData.buyPrice, formData.sellPrice).marginPercent.toFixed(1)}% profit
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock & Threshold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Awal {product && <span className="text-xs text-gray-500">(Gunakan Update Stok untuk mengubah)</span>}
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="0"
                  leftIcon={<Package className="w-4 h-4 text-gray-400" />}
                  disabled={!!product}
                  className={product ? "bg-gray-100 cursor-not-allowed" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stok
                </label>
                <Input
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                  placeholder="Minimum stok alert"
                  leftIcon={<AlertTriangle className="w-4 h-4 text-gray-400" />}
                />
              </div>
            </div>

            {/* Siklus Stok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Siklus Stok *
              </label>
              <select
                value={formData.stockCycle}
                onChange={(e) => setFormData({...formData, stockCycle: e.target.value as 'HARIAN' | 'MINGGUAN' | 'DUA_MINGGUAN'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="HARIAN">Harian</option>
                <option value="MINGGUAN">Mingguan</option>
                <option value="DUA_MINGGUAN">Dua Mingguan</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !!priceError}
                className="flex-1"
              >
                {isSubmitting ? (
                  'Menyimpan...'
                ) : (
                  <>
                    {product ? (
                      <Edit className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {product ? 'Update Produk' : 'Tambah Produk'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
