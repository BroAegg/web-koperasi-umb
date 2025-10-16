// Hook for fetching stock movements data

import { useState, useEffect } from 'react';
import { StockMovement, DailySummary } from '@/types/inventory';
import { useNotification } from '@/lib/notification-context';

export function useStockMovements(selectedDate: string) {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    totalIn: 0,
    totalOut: 0,
    totalMovements: 0,
  });
  const { error } = useNotification();

  const fetchStockMovements = async () => {
    try {
      const res = await fetch(`/api/stock-movements?date=${selectedDate}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setStockMovements(data.data || []);
      }
    } catch (err) {
      error('Error', 'Gagal memuat riwayat stok');
    }
  };

  const fetchDailySummary = async () => {
    try {
      const res = await fetch(`/api/stock-movements/summary?date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        setDailySummary({
          totalIn: data.data.totalIn || 0,
          totalOut: data.data.totalOut || 0,
          totalMovements: data.data.totalMovements || 0,
        });
      }
    } catch (err) {
      error('Error', 'Gagal memuat ringkasan stok');
    }
  };

  useEffect(() => {
    fetchStockMovements();
    fetchDailySummary();
  }, [selectedDate]);

  return {
    stockMovements,
    dailySummary,
    refetchStockMovements: fetchStockMovements,
    refetchDailySummary: fetchDailySummary,
  };
}
