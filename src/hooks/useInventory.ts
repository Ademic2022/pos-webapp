/**
 * Inventory Management Hook
 * 
 * Custom hook for managing inventory data, loading states, and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { inventoryService, Product, StockDelivery } from '@/services/inventoryService';
import { getFillDetails } from '@/utils/utils';

interface UseInventoryReturn {
  // Data
  products: Product[];
  latestStockDelivery: StockDelivery | null;
  deliveryHistory: StockDelivery[];
  fillDetails: ReturnType<typeof getFillDetails>;
  
  // Loading states
  isLoading: boolean;
  isLoadingDeliveries: boolean;
  
  // Error states
  error: string | null;
  deliveryError: string | null;
  
  // Actions
  refetchInventory: () => Promise<void>;
  loadDeliveryHistory: (limit?: number) => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [latestStockDelivery, setLatestStockDelivery] = useState<StockDelivery | null>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<StockDelivery[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  /**
   * Fetch inventory data (products + latest stock delivery)
   */
  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await inventoryService.getProductInventory();
      
      if (response.success) {
        setProducts(response.products);
        setLatestStockDelivery(response.latestStockDelivery);
      } else {
        setError(response.errors?.[0] || 'Failed to load inventory');
      }
    } catch (err) {
      console.error('Error in fetchInventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load delivery history
   */
  const loadDeliveryHistory = useCallback(async (limit = 10) => {
    try {
      setIsLoadingDeliveries(true);
      setDeliveryError(null);
      
      const response = await inventoryService.getStockDeliveries(limit);
      
      if (response.success) {
        setDeliveryHistory(response.deliveries);
      } else {
        setDeliveryError(response.errors?.[0] || 'Failed to load delivery history');
      }
    } catch (err) {
      console.error('Error in loadDeliveryHistory:', err);
      setDeliveryError(err instanceof Error ? err.message : 'Failed to load delivery history');
    } finally {
      setIsLoadingDeliveries(false);
    }
  }, []);

  /**
   * Refetch inventory data
   */
  const refetchInventory = useCallback(async () => {
    await fetchInventory();
  }, [fetchInventory]);

  // Calculate fill details based on latest stock delivery
  const fillDetails = getFillDetails(latestStockDelivery);

  // Initial data load
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    // Data
    products,
    latestStockDelivery,
    deliveryHistory,
    fillDetails,
    
    // Loading states
    isLoading,
    isLoadingDeliveries,
    
    // Error states
    error,
    deliveryError,
    
    // Actions
    refetchInventory,
    loadDeliveryHistory,
  };
};
