/**
 * Custom hook for managing dashboard data
 * Provides live data integration with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStats } from '@/types/types';
import { dashboardStat } from '@/data/stock'; // Fallback data

interface UseDashboardDataResult {
  dashboardStats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useDashboardData(): UseDashboardDataResult {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(dashboardStat); // Start with fallback
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dashboardService.getDashboardStats();

      if (response.success && response.data) {
        setDashboardStats(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.errors?.join(', ') || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
      
      // Keep using fallback data on error
      setDashboardStats(dashboardStat);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardStats,
    isLoading,
    error,
    refetch,
    lastUpdated,
  };
}
