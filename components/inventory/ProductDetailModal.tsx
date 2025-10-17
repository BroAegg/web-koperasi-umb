import React from 'react';
import { X, Edit, Package, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onStockUpdate: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onEdit,
  onStockUpdate
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Detail Produk</h3>
              <p className="text-blue-100 text-sm mt-1">Informasi lengkap produk inventori</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Informasi Produk</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nama Produk</label>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Kategori</label>
                  <p className="font-medium">{product.category.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Satuan</label>
                  <p className="font-medium">{product.unit}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Jenis Kepemilikan</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                      product.ownershipType === 'TOKO' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {product.ownershipType === 'TOKO' ? 'Toko' : 'Titipan'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Siklus Stok</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                      product.stockCycle === 'HARIAN' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      product.stockCycle === 'MINGGUAN' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}>
                      {product.stockCycle === 'HARIAN' ? 'Harian' :
                       product.stockCycle === 'MINGGUAN' ? 'Mingguan' : 'Dua Mingguan'}
                    </span>
                  </div>
                </div>
                {/* Supplier Info */}
                {(product.supplier || product.supplierContact) && (
                  <div>
                    <label className="text-sm text-gray-600">Supplier</label>
                    <p className="font-medium">{product.supplier?.name || '-'}</p>
                    {product.supplierContact && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {product.supplierContact}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Informasi Harga</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Harga Beli</label>
                  <p className="font-medium">
                    {product.buyPrice ? formatCurrency(product.buyPrice) : 
                     <span className="text-gray-400">Tidak ada (Konsinyasi)</span>}
                  </p>
                </div>
                {product.avgCost && (
                  <div>
                    <label className="text-sm text-gray-600">Rata-rata Biaya (avgCost)</label>
                    <p className="font-medium text-blue-600">{formatCurrency(product.avgCost)}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">Harga Jual</label>
                  <p className="font-medium">{formatCurrency(product.sellPrice)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Keuntungan per Unit</label>
                  <p className="font-medium text-green-600">
                    {formatCurrency(product.sellPrice - (product.avgCost || product.buyPrice || 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Informasi Stok</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Stok Saat Ini</label>
                  <p className={`font-medium ${
                    product.stock <= product.threshold 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {product.stock} {product.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Minimum Stok</label>
                  <p className="font-medium">{product.threshold} {product.unit}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Statistik Penjualan</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Terjual Hari Ini</label>
                  <p className="font-medium">{product.soldToday} {product.unit}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Total Terjual</label>
                  <p className="font-medium">{product.totalSold} {product.unit}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Produk
              </Button>
              <Button
                onClick={() => {
                  onStockUpdate(product);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Package className="w-4 h-4 mr-2" />
                Update Stok
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
