import React from 'react';
import { Eye, Edit, Package, Trash2, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/inventory';
import { formatCurrency } from '@/lib/inventory-helpers';

interface ProductTableProps {
  products: Product[];
  hideOutOfStock: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onStockUpdate: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductTable({
  products,
  hideOutOfStock,
  onView,
  onEdit,
  onStockUpdate,
  onDelete
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead className="hidden sm:table-cell">Kategori</TableHead>
            <TableHead className="hidden md:table-cell">Harga Beli</TableHead>
            <TableHead className="hidden md:table-cell">Harga Jual</TableHead>
            <TableHead className="hidden lg:table-cell">Margin</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="hidden lg:table-cell">Terjual</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? products.map((product) => (
            <TableRow 
              key={product.id}
              className={product.stock === 0 ? 'bg-gray-50 opacity-60 hover:opacity-80 transition-opacity' : ''}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.name}</span>
                    {product.stock === 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300">
                        HABIS
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Ownership Badge */}
                    {product.ownershipType && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.ownershipType === 'TOKO' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {product.ownershipType === 'TOKO' ? 'Toko' : 'Titipan'}
                      </span>
                    )}
                    {/* Stock Cycle Badge */}
                    {product.stockCycle && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.stockCycle === 'HARIAN' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        product.stockCycle === 'MINGGUAN' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {product.stockCycle === 'HARIAN' ? 'Harian' :
                         product.stockCycle === 'MINGGUAN' ? 'Mingguan' : 'Dua Mingguan'}
                      </span>
                    )}
                  </div>
                  <div className="sm:hidden text-xs text-gray-500 mt-1">
                    {product.category.name} • {formatCurrency(product.sellPrice)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-gray-600">
                {product.category.name}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {product.buyPrice ? formatCurrency(product.buyPrice) : 
                 <span className="text-gray-400 text-sm">-</span>}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatCurrency(product.sellPrice)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {(() => {
                  const cost = product.avgCost || product.buyPrice || 0;
                  const margin = product.sellPrice - cost;
                  const marginPercent = cost > 0 ? ((margin / cost) * 100) : 0;
                  return (
                    <div className="flex flex-col">
                      <span className={`font-medium ${margin > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {formatCurrency(margin)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {marginPercent.toFixed(1)}%
                      </span>
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${
                    product.stock <= product.threshold 
                      ? 'text-red-600' 
                      : product.stock <= product.threshold * 1.5 
                        ? 'text-amber-600' 
                        : 'text-green-600'
                  }`}>
                    {product.stock}
                  </span>
                  {product.stock <= product.threshold && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-gray-600">
                {product.soldToday}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  {/* View Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(product)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50"
                    title="Lihat Detail"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  
                  {/* Edit Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50"
                    title="Edit Produk"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  {/* Stock Update Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStockUpdate(product)}
                    className="p-1.5 text-green-600 hover:bg-green-50"
                    title="Update Stok"
                  >
                    <Package className="w-3 h-3" />
                  </Button>
                  
                  {/* Delete Button */}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(product.id)}
                    className="p-1.5"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium text-gray-600">Tidak ada produk ditemukan</p>
                <p className="text-sm text-gray-500 mt-1">
                  {hideOutOfStock ? 'Semua produk habis atau coba ubah filter' : 'Coba ubah kata kunci pencarian atau filter'}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
