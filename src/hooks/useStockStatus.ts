/**
 * Custom hook for real-time stock status monitoring
 * Provides live stock data with automatic status calculation
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { getFillDetails } from '@/utils/utils';

interface UseStockStatusResult {
  totalAvailableStock: number;
  stockLevel: 'low' | 'medium' | 'high';
  totalDrums: number;
  totalKegs: number;
  remainingKegs: number;
  remainingLitres: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useStockStatus(): UseStockStatusResult {
  const [totalAvailableStock, setTotalAvailableStock] = useState(6000); // Default fallback
  const [stockLevel, setStockLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Calculate fill details based on current stock
  const {
    totalDrums,
    totalKegs,
    remainingKegs,
    remainingLitres,
  } = getFillDetails({
    cumulativeStock: totalAvailableStock,
    remainingStock: totalAvailableStock,
    soldStock: 0, // We don't have sold stock data in this context
    stockUtilizationPercentage: 0, // We don't have utilization data in this context
  });

  const fetchStockStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dashboardService.getStockStatus();

      if (response.success && response.status && response.totalStock !== undefined) {
        setStockLevel(response.status);
        setTotalAvailableStock(response.totalStock);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.errors?.join(', ') || 'Failed to fetch stock status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Stock status fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchStockStatus();
  }, [fetchStockStatus]);

  const refetch = useCallback(async () => {
    await fetchStockStatus();
  }, [fetchStockStatus]);

  return {
    totalAvailableStock,
    stockLevel,
    totalDrums,
    totalKegs,
    remainingKegs,
    remainingLitres,
    isLoading,
    error,
    refetch,
    lastUpdated,
  };
}
