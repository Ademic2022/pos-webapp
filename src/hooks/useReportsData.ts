/**
 * Custom hook for reports page data management
 * Provides live sales data with advanced filtering capabilities
 * Uses Django sales_stats query for comprehensive statistics
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sale } from '@/services/salesService';
import { reportsService } from '@/services/reportsService';
import { ReportFilters, SalesStats, CustomerCreditConnection } from '@/interfaces/interface';
import { decodeGraphQLId } from '@/utils/graphqlUtils';

interface UseReportsDataResult {
  // Data
  sales: Sale[];
  statistics: SalesStats | null;
  summary: {
    totalSales: number;
    totalPaid: number;
    totalOutstanding: number;
    totalTransactions: number;
    totalDiscounts: number;
    wholesaleRevenue: number;
    retailRevenue: number;
    averageTransaction: number;
  };

  // Customer Analysis Data
  topCustomers: Array<{
    name: string;
    id: string;
    revenue: number;
    transactions: number;
    saleType: string;
  }>;
  outstandingDebts: CustomerCreditConnection | null;

  // Loading states
  isLoading: boolean;
  isLoadingTransactions: boolean;
  isLoadingCustomerAnalysis: boolean;
  transactionsFetched: boolean;
  error: string | null;

  // Pagination
  hasNextPage: boolean;
  loadMore: () => Promise<void>;

  // Actions
  refetch: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchCustomerAnalysis: () => Promise<void>;
  applyFilters: (filters: ReportFilters) => Promise<void>;
}

export function useReportsData(): UseReportsDataResult {
  const [sales, setSales] = useState<Sale[]>([]);
  const [statistics, setStatistics] = useState<SalesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [transactionsFetched, setTransactionsFetched] = useState(false);

  // Customer Analysis State
  const [topCustomers, setTopCustomers] = useState<Array<{
    name: string;
    id: string;
    revenue: number;
    transactions: number;
    saleType: string;
  }>>([]);
  const [outstandingDebts, setOutstandingDebts] = useState<CustomerCreditConnection | null>(null);
  const [isLoadingCustomerAnalysis, setIsLoadingCustomerAnalysis] = useState(false);

  // Use refs to prevent duplicate calls without affecting useCallback dependencies
  const isLoadingTransactionsRef = useRef(false);
  const isLoadingCustomerAnalysisRef = useRef(false);

  const [currentFilters, setCurrentFilters] = useState<ReportFilters>({
    dateRange: "month",
    customerType: "all",
    paymentMethod: "all",
    status: "all",
    startDate: "",
    endDate: "",
    amountMin: undefined,
    amountMax: undefined,
    customerId: "",
    sortBy: "date",
    sortDirection: "desc",
  });

  // Fetch statistics only (for overview tab)
  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await reportsService.getSalesStats(currentFilters);

      if (response.success && response.statistics) {
        setStatistics(response.statistics);
      } else {
        throw new Error(response.errors?.join(', ') || 'Failed to fetch statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Statistics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters]);

  // Fetch transactions (for transactions tab)
  const fetchTransactions = useCallback(async (resetData = true, afterCursor?: string) => {
    // Prevent duplicate calls when already loading (use ref for stable check)
    if (resetData && isLoadingTransactionsRef.current) {
      return;
    }

    try {
      if (resetData) {
        isLoadingTransactionsRef.current = true;
        setIsLoadingTransactions(true);
        setError(null);
      }

      const pagination = {
        first: 50,
        after: afterCursor,
      };

      const response = await reportsService.getSalesTransactions(currentFilters, pagination);

      if (response.success && response.sales) {
        if (resetData) {
          setSales(response.sales);
          setTransactionsFetched(true);
        } else {
          setSales(prev => [...prev, ...response.sales!]);
        }

        setHasNextPage(response.hasNextPage || false);
        setCursor(response.cursor || null);
      } else {
        throw new Error(response.errors?.join(', ') || 'Failed to fetch transactions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Transactions fetch error:', err);
    } finally {
      isLoadingTransactionsRef.current = false;
      setIsLoadingTransactions(false);
    }
  }, [currentFilters]);

  // Apply client-side filtering/sorting for local sales data
  const { filteredSales, summary } = useMemo(() => {
    let filteredSales = [...sales];

    // Apply client-side customer filter (in addition to server-side filter)
    if (currentFilters.customerId && currentFilters.customerId !== '') {
      if (currentFilters.customerId === 'walk-in') {
        filteredSales = filteredSales.filter(sale => !sale.customer?.id);
      } else {
        // Compare with decoded customer ID
        const decodedFilterId = decodeGraphQLId(currentFilters.customerId);
        filteredSales = filteredSales.filter(sale =>
          sale.customer?.id && decodeGraphQLId(sale.customer.id) === decodedFilterId
        );
      }
    }    // Apply client-side sorting
    if (currentFilters.sortBy) {
      filteredSales.sort((a, b) => {
        let comparison = 0;

        switch (currentFilters.sortBy) {
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'amount':
            comparison = a.total - b.total;
            break;
          case 'customer':
            comparison = (a.customer?.name || '').localeCompare(b.customer?.name || '');
            break;
          case 'status':
            const statusA = a.amountDue === 0 ? 'paid' : a.amountDue < a.total ? 'partial' : 'pending';
            const statusB = b.amountDue === 0 ? 'paid' : b.amountDue < b.total ? 'partial' : 'pending';
            comparison = statusA.localeCompare(statusB);
            break;
        }

        return currentFilters.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Use statistics from server if available, otherwise calculate from filtered sales
    let summary;
    if (statistics) {
      summary = {
        totalSales: statistics.totalSales,
        totalPaid: statistics.totalSales - statistics.customerDebtIncurred.value,
        totalOutstanding: statistics.customerDebtIncurred.value,
        totalTransactions: statistics.totalTransactions,
        totalDiscounts: statistics.totalDiscounts,
        wholesaleRevenue: statistics.wholesaleSales,
        retailRevenue: statistics.retailSales,
        averageTransaction: statistics.averageSaleValue,
      };
    } else {
      // Fallback calculation from client data
      const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalPaid = filteredSales.reduce((sum, sale) => sum + (sale.total - sale.amountDue), 0);
      const totalOutstanding = filteredSales.reduce((sum, sale) => sum + sale.amountDue, 0);
      const totalTransactions = filteredSales.length;
      const totalDiscounts = filteredSales.reduce((sum, sale) => sum + (sale.discount || 0), 0);

      const wholesaleRevenue = filteredSales
        .filter(sale => sale.saleType === 'WHOLESALE')
        .reduce((sum, sale) => sum + sale.total, 0);

      const retailRevenue = filteredSales
        .filter(sale => sale.saleType === 'RETAIL')
        .reduce((sum, sale) => sum + sale.total, 0);

      summary = {
        totalSales,
        totalPaid,
        totalOutstanding,
        totalTransactions,
        totalDiscounts,
        wholesaleRevenue,
        retailRevenue,
        averageTransaction: totalSales / totalTransactions || 0,
      };
    }

    console.log('Filtered sales:', filteredSales.length, 'transactions');
    console.log('=== END USEMEMO FILTERING DEBUG ===');

    return { filteredSales, summary };
  }, [sales, statistics, currentFilters]);

  // Apply filters
  const applyFilters = useCallback(async (filters: ReportFilters) => {
    setCurrentFilters(filters);

    // Reset all tab data states when filters change to ensure fresh data
    setTransactionsFetched(false);
    setSales([]);
    setCursor(null);
    setHasNextPage(false);

    // Reset customer analysis data
    setTopCustomers([]);
    setOutstandingDebts(null);
  }, []);  // Load more data (pagination for transactions)
  const loadMore = useCallback(async () => {
    if (hasNextPage && cursor && !isLoadingTransactionsRef.current) {
      await fetchTransactions(false, cursor);
    }
  }, [hasNextPage, cursor, fetchTransactions]);

  // Fetch customer analysis data
  const fetchCustomerAnalysis = useCallback(async () => {
    // Prevent duplicate calls when already loading (use ref for stable check)
    if (isLoadingCustomerAnalysisRef.current) {
      return;
    }

    try {
      isLoadingCustomerAnalysisRef.current = true;
      setIsLoadingCustomerAnalysis(true);
      setError(null);

      const response = await reportsService.getCustomerAnalysis(currentFilters);

      if (response.success) {
        setTopCustomers(response.topCustomers || []);
        setOutstandingDebts(response.outstandingDebts || null);
      } else {
        throw new Error(response.errors?.join(', ') || 'Failed to fetch customer analysis');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Customer analysis fetch error:', err);
    } finally {
      isLoadingCustomerAnalysisRef.current = false;
      setIsLoadingCustomerAnalysis(false);
    }
  }, [currentFilters]);

  // Refetch statistics data
  const refetch = useCallback(async () => {
    await fetchStatistics();
    // Also refetch transactions if they were previously fetched
    if (transactionsFetched) {
      await fetchTransactions(true);
    }
  }, [fetchStatistics, fetchTransactions, transactionsFetched]);

  // Initial statistics fetch and refetch when filters change
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    sales: filteredSales,
    statistics,
    summary,
    topCustomers,
    outstandingDebts,
    isLoading,
    isLoadingTransactions,
    isLoadingCustomerAnalysis,
    transactionsFetched,
    error,
    hasNextPage,
    loadMore,
    refetch,
    fetchTransactions: () => fetchTransactions(true),
    fetchCustomerAnalysis,
    applyFilters,
  };
}
