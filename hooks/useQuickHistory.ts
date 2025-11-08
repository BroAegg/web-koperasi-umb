import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface QuickTransaction {
  id: string;
  receiptId: string;
  totalAmount: number;
  paymentMethod: string;
  customerName: string;
  itemCount: number;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

interface UseQuickHistoryReturn {
  transactions: QuickTransaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuickHistory(cashierId?: string): UseQuickHistoryReturn {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<QuickTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuickHistory = useCallback(async () => {
    // Wait for session to be ready
    if (status === 'loading') return;
    
    // Skip fetch if not authenticated
    if (!session) {
      console.log('[Quick History] Not authenticated, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (cashierId) {
        params.append('cashierId', cashierId);
      }
      params.append('limit', '10');

      // No Authorization header needed - NextAuth cookies handle it
      const response = await fetch(`/api/transactions/quick-history?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      if (data.success) {
        setTransactions(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transaction history';
      setError(errorMessage);
      console.error('Error fetching quick history:', err);
    } finally {
      setLoading(false);
    }
  }, [cashierId, session, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchQuickHistory();
    }
  }, [status, fetchQuickHistory]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchQuickHistory,
  };
}
