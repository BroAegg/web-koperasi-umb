import React from 'react';
import { X, Plus, Minus, BarChart3, Package, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, StockMovement, DailySummary } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';
import { calculateProfitMetrics } from '@/lib/inventory-helpers';

interface AllMovementsModalProps {
  isOpen: boolean;
  selectedDate: string;
  stockMovements: StockMovement[];
  dailySummary: DailySummary;
  products: Product[];
  onClose: () => void;
  onDeleteAll: () => void;
  onRefresh: () => void;
}

export default function AllMovementsModal({
  isOpen,
  selectedDate,
  stockMovements,
  dailySummary,
  products,
  onClose,
  onDeleteAll,
  onRefresh
}: AllMovementsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Semua Stock Movement</h3>
              <p className="text-green-100 text-sm mt-1">
                {new Date(selectedDate).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stockMovements.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDeleteAll}
                  className="bg-red-500/20 border-red-300 text-white hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus Semua
                </Button>
              )}
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
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Stock Masuk</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{dailySummary.totalIn}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <Minus className="w-4 h-4" />
                <span className="text-sm font-medium">Stock Keluar</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{dailySummary.totalOut}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Total Movement</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{dailySummary.totalMovements}</p>
            </div>
          </div>

          {/* Movement List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">Riwayat Movement</h4>
            {stockMovements.length > 0 ? (
              stockMovements.map((movement) => {
                // Find product details from products list for profit calculation
                const product = products.find(p => p.id === movement.productId);
                const costPrice = product?.avgCost || product?.buyPrice || 0;
                const sellPrice = product?.sellPrice || 0;
                const { profitPerUnit, profitMargin, totalProfit } = calculateProfitMetrics(sellPrice, costPrice, movement.quantity);
                
                return (
                  <div key={movement.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className={`p-3 rounded-full shrink-0 ${
                      movement.type === 'IN' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {movement.type === 'IN' ? (
                        <Plus className="w-5 h-5" />
                      ) : (
                        <Minus className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{movement.product.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-600">
                              <span className={`font-medium ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                {movement.type === 'IN' ? '+' : '-'}{Math.abs(movement.quantity)}
                              </span>
                              {' '}{movement.product.unit}
                            </p>
                            {product && movement.type === 'OUT' && profitPerUnit > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {formatCurrency(totalProfit)} ({profitMargin.toFixed(1)}%)
                                </span>
                              </div>
                            )}
                          </div>
                          {movement.note && (
                            <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{movement.note}&rdquo;</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-500">
                            {new Date(movement.createdAt).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Belum ada stock movement</p>
                <p className="text-sm mt-1">Movement akan muncul setelah ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
