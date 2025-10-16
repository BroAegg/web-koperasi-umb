import React, { useState } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product, StockFormData } from '@/types/inventory';

interface StockModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (formData: StockFormData) => void;
  isSubmitting: boolean;
}

export default function StockModal({
  isOpen,
  product,
  onClose,
  onSubmit,
  isSubmitting
}: StockModalProps) {
  const [formData, setFormData] = useState<StockFormData>({
    type: 'IN',
    quantity: '',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    onClose();
    setFormData({ type: 'IN', quantity: '', note: '' });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Update Stok Produk</h3>
              <p className="text-green-100 text-sm mt-1">Kelola stok masuk dan keluar produk</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 rounded-full bg-blue-100">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">
                  Stok saat ini: {product.stock} {product.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Movement Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Movement *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'IN' | 'OUT' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="IN">Stock Masuk</option>
                <option value="OUT">Stock Keluar</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah {formData.type === 'IN' ? 'Masuk' : 'Keluar'} *
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  min="1"
                  required
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {product.unit}
                </span>
              </div>
              {formData.type === 'OUT' && (
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal: {product.stock} {product.unit}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan <span className="text-gray-500 font-normal">(Opsional)</span>
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Tambahkan catatan..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 ${
                  formData.type === 'IN' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  'Menyimpan...'
                ) : (
                  <>
                    {formData.type === 'IN' ? (
                      <Plus className="w-4 h-4 mr-2" />
                    ) : (
                      <Minus className="w-4 h-4 mr-2" />
                    )}
                    {formData.type === 'IN' ? 'Tambah Stock' : 'Kurangi Stock'}
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
