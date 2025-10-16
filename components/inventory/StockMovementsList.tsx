// Stock Movements List Component

'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Minus, BarChart3 } from 'lucide-react';
import { StockMovement } from '@/types/inventory';

interface StockMovementsListProps {
  movements: StockMovement[];
  selectedDate: string;
  onViewAll: () => void;
  maxDisplay?: number;
}

export function StockMovementsList({
  movements,
  selectedDate,
  onViewAll,
  maxDisplay = 5,
}: StockMovementsListProps) {
  
  const displayMovements = movements.slice(0, maxDisplay);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900 truncate">Stock Movement</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            className="shrink-0 text-xs px-2 py-1 h-6 whitespace-nowrap"
          >
            <BarChart3 className="w-3 h-3" />
            <span className="ml-1 hidden xl:inline">Lihat Semua</span>
          </Button>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {new Date(selectedDate).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayMovements.length > 0 ? (
          displayMovements.map((movement) => {
            // Detect IN/OUT from movementType
            const isIncoming = movement.movementType?.includes('_IN') || 
                              (movement.quantity > 0 && movement.movementType !== 'SALE_OUT');
            
            return (
              <div 
                key={movement.id} 
                className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Icon Badge */}
                  <div className={`p-2 rounded-full shrink-0 ${
                    isIncoming
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {isIncoming ? (
                      <Plus className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                  </div>
                  
                  {/* Movement Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate" title={movement.product.name}>
                      {movement.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isIncoming ? 'Masuk' : 'Keluar'} {Math.abs(movement.quantity)} {movement.product.unit}
                    </p>
                    {movement.note && (
                      <p className="text-xs text-gray-400 mt-1 truncate" title={movement.note}>
                        {movement.note}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Date */}
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(movement.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
              </div>
            );
          })
        ) : (
          // Empty State
          <div className="text-center py-8 text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada stock movement</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
