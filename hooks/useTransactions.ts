import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  paymentMethods?: string[];
  search?: string;
  page: number;
  limit: number;
}

interface Transaction {
  id: string;
  receiptId: string;
  type: string; // Add transaction type
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

interface TransactionSummary {
  totalRevenue: number;
  totalTransactions: number;
  paymentBreakdown: Record<string, number>;
  averageTransaction: number;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  summary: TransactionSummary | null;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  fetchTransactions: (filters: TransactionFilters) => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (filters: TransactionFilters) => {
    // Wait for session to be ready
    if (status === 'loading') return;
    
    // Skip fetch if not authenticated
    if (!session) {
      console.log('[useTransactions] Not authenticated, skipping fetch');
      setError('Please login to view transactions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.paymentMethods && filters.paymentMethods.length > 0) {
        params.append('paymentMethods', filters.paymentMethods.join(','));
      }
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      // No Authorization header needed - NextAuth cookies handle it
      const response = await fetch(`/api/transactions?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      if (data.success) {
        setTransactions(data.data.transactions);
        setSummary(data.data.summary);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  return {
    transactions,
    summary,
    pagination,
    loading,
    error,
    fetchTransactions,
  };
}
