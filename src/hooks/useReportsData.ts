/**
 * Custom hook for reports page data management
 * Provides live sales data with advanced filtering capabilities
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { salesService, Sale } from '@/services/salesService';
import { ReportFilters } from '@/interfaces/interface';

interface UseReportsDataResult {
  // Data
  sales: Sale[];
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
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  
  // Actions
  refetch: () => Promise<void>;
  applyFilters: (filters: ReportFilters) => Promise<void>;
}

export function useReportsData(): UseReportsDataResult {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ReportFilters>({
    dateRange: "month",
    customerType: "all",
    paymentMethod: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });

  // Convert report filters to API parameters
  const convertFiltersToParams = useCallback((filters: ReportFilters) => {
    const params: {
      first?: number;
      after?: string;
      saleType?: string;
      customer?: string;
      transactionId_Icontains?: string;
      total_Gte?: number;
      total_Lte?: number;
      createdAt_Gte?: string;
      createdAt_Lte?: string;
      amountDue_Gt?: number;
      amountDue_Gte?: number;
      amountDue_Lte?: number;
      discount_Gt?: number;
      discount_Gte?: number;
      discount_Lte?: number;
      subtotal_Gte?: number;
      subtotal_Lte?: number;
    } = {
      first: 50, // Load more data for reports
    };

    // Date filtering
    if (filters.dateRange && filters.dateRange !== 'custom') {
      const now = new Date();
      let dateFrom: Date;
      
      switch (filters.dateRange) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1); // default to month
          break;
      }
      
      params.createdAt_Gte = dateFrom.toISOString();
    } else if (filters.dateRange === 'custom') {
      if (filters.startDate) {
        params.createdAt_Gte = new Date(filters.startDate).toISOString();
      }
      if (filters.endDate) {
        params.createdAt_Lte = new Date(filters.endDate).toISOString();
      }
    }

    // Customer type filtering
    if (filters.customerType !== 'all') {
      params.saleType = filters.customerType.toUpperCase();
    }

    // Status filtering (outstanding debt)
    if (filters.status === 'pending') {
      params.amountDue_Gt = 0;
    } else if (filters.status === 'paid') {
      params.amountDue_Gte = 0;
      params.amountDue_Lte = 0;
    }

    // Advanced filters
    if (filters.searchTerm) {
      params.transactionId_Icontains = filters.searchTerm;
    }
    if (filters.amountMin !== undefined && filters.amountMin !== null && filters.amountMin !== 0) {
      params.total_Gte = filters.amountMin;
    }
    if (filters.amountMax !== undefined && filters.amountMax !== null && filters.amountMax !== 0) {
      params.total_Lte = filters.amountMax;
    }
    if (filters.customerId) {
      params.customer = filters.customerId;
    }
    // Note: Sorting will be handled client-side since backend doesn't support orderBy

    return params;
  }, []);

  // Fetch sales data
  const fetchSales = useCallback(async (resetData = true, afterCursor?: string) => {
    try {
      if (resetData) {
        setIsLoading(true);
        setError(null);
      }

      const params = convertFiltersToParams(currentFilters);
      if (afterCursor) {
        params.after = afterCursor;
      }

      const response = await salesService.getSales(params);

      if (response.success && response.data) {
        const newSales = response.data.edges.map(edge => edge.node);
        
        if (resetData) {
          setSales(newSales);
        } else {
          setSales(prev => [...prev, ...newSales]);
        }
        
        setHasNextPage(response.data.pageInfo.hasNextPage);
        setCursor(response.data.pageInfo.endCursor);
      } else {
        throw new Error(response.errors?.join(', ') || 'Failed to fetch sales data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Sales data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, convertFiltersToParams]);

  // Calculate summary statistics and apply client-side filtering/sorting
  const { filteredSales, summary } = useMemo(() => {
    let filteredSales = [...sales];

    // Apply client-side search filter (in addition to server-side filter)
    if (currentFilters.searchTerm) {
      const searchTerm = currentFilters.searchTerm.toLowerCase();
      filteredSales = filteredSales.filter(sale => 
        sale.transactionId.toLowerCase().includes(searchTerm) ||
        sale.customer?.name?.toLowerCase().includes(searchTerm) ||
        sale.customer?.phone?.includes(searchTerm)
      );
    }

    // Apply client-side sorting
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

    // Calculate summary from filtered sales
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

    const summary = {
      totalSales,
      totalPaid,
      totalOutstanding,
      totalTransactions,
      totalDiscounts,
      wholesaleRevenue,
      retailRevenue,
      averageTransaction: totalSales / totalTransactions || 0,
    };

    return { filteredSales, summary };
  }, [sales, currentFilters]);

  // Apply filters
  const applyFilters = useCallback(async (filters: ReportFilters) => {
    setCurrentFilters(filters);
    // fetchSales will be called automatically due to dependency
  }, []);

  // Load more data (pagination)
  const loadMore = useCallback(async () => {
    if (hasNextPage && cursor && !isLoading) {
      await fetchSales(false, cursor);
    }
  }, [hasNextPage, cursor, isLoading, fetchSales]);

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchSales(true);
  }, [fetchSales]);

  // Initial data fetch and refetch when filters change
  useEffect(() => {
    fetchSales(true);
  }, [fetchSales]);

  return {
    sales: filteredSales,
    summary,
    isLoading,
    error,
    hasNextPage,
    loadMore,
    refetch,
    applyFilters,
  };
}
