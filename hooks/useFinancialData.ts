// Hook for fetching financial period data

import { useState, useEffect } from 'react';
import { FinancialData, FinancialPeriod } from '@/types/inventory';
import { useNotification } from '@/lib/notification-context';

export function useFinancialData(financialPeriod: FinancialPeriod, selectedDate: string, isCustomDate: boolean) {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    totalProfit: 0,
    totalSoldItems: 0,
    toko: { revenue: 0, cogs: 0, profit: 0 },
    consignment: { grossRevenue: 0, cogs: 0, profit: 0, feeTotal: 0 },
  });
  const { error } = useNotification();

  const fetchFinancialData = async () => {
    try {
      const params = new URLSearchParams({
        period: financialPeriod,
        ...(isCustomDate && { date: selectedDate }),
      });
      
      const res = await fetch(`/api/financial/period?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setFinancialData({
          totalRevenue: data.data.totalRevenue || 0,
          totalProfit: data.data.totalProfit || 0,
          totalSoldItems: data.data.totalSoldItems || 0,
          toko: data.data.toko || { revenue: 0, cogs: 0, profit: 0 },
          consignment: data.data.consignment || { grossRevenue: 0, cogs: 0, profit: 0, feeTotal: 0 },
        });
      }
    } catch (err) {
      error('Error', 'Gagal memuat data keuangan');
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [financialPeriod, selectedDate]);

  return {
    financialData,
    refetchFinancialData: fetchFinancialData,
  };
}
