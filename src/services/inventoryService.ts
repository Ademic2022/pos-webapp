/**
 * Inventory Service
 * 
 * Handles all inventory-related API calls including:
 * - Product inventory management
 * - Stock delivery tracking
 * - Stock level calculations
 */

import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';
import { PRODUCT_INVENTORY_QUERY, ADD_STOCK_DELIVERY_MUTATION, STOCK_DELIVERIES_QUERY } from "@/lib/graphql"

// TypeScript Interfaces
export interface Product {
  id: string;
  name: string;
  price: number;
  saleType: 'WHOLESALE' | 'RETAIL';
  stock: number;
  unit: string;
  updatedAt: string;
}

export interface StockDelivery {
  id: string;
  deliveredQuantity: number;
  cumulativeStock: number;
  remainingStock: number;
  soldStock: number;
  price: number;
  stockUtilizationPercentage: number;
  previousRemainingStock?: number;
  createdAt?: string;
  updatedAt?: string;
  supplier?: string;
}

export interface ProductInventoryResponse {
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
  latestStockDeliveries: StockDelivery[];
}

export interface StockDeliveriesResponse {
  latestStockDeliveries: StockDelivery[];
}

export interface AddStockDeliveryInput {
  deliveredQuantity: number;
  supplier: string;
  price: number;
}

export interface AddStockDeliveryResponse {
  success: boolean;
  delivery?: StockDelivery;
  errors?: string[];
}

export interface AddStockDeliveryMutationResponse {
  addStockDelivery: {
    message: string;
    success: boolean;
    stockData?: StockDelivery;
  };
}

// Service Implementation
export const inventoryService = {
  /**
   * Get product inventory and latest stock deliveries
   */
  async getProductInventory(): Promise<{
    success: boolean;
    products: Product[];
    latestStockDelivery: StockDelivery | null;
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<ProductInventoryResponse>(
        PRODUCT_INVENTORY_QUERY
      );

      const products = response.products.edges.map(edge => edge.node);
      const latestStockDelivery = response.latestStockDeliveries[0] || null;

      return {
        success: true,
        products,
        latestStockDelivery,
      };
    } catch (error) {
      console.error('Error fetching product inventory:', error);
      return {
        success: false,
        products: [],
        latestStockDelivery: null,
        errors: [error instanceof Error ? error.message : 'Failed to fetch inventory'],
      };
    }
  },

  /**
   * Get stock delivery history
   */
  async getStockDeliveries(limit = 10): Promise<{
    success: boolean;
    deliveries: StockDelivery[];
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<StockDeliveriesResponse>(
        STOCK_DELIVERIES_QUERY,
        { limit }
      );

      return {
        success: true,
        deliveries: response.latestStockDeliveries,
      };
    } catch (error) {
      console.error('Error fetching stock deliveries:', error);
      return {
        success: false,
        deliveries: [],
        errors: [error instanceof Error ? error.message : 'Failed to fetch deliveries'],
      };
    }
  },

  /**
   * Add a new stock delivery
   */
  async addStockDelivery(input: AddStockDeliveryInput): Promise<AddStockDeliveryResponse> {
    try {
      const response = await enhancedGraphqlClient.request<AddStockDeliveryMutationResponse>(
        ADD_STOCK_DELIVERY_MUTATION,
        {
          deliveredQuantity: input.deliveredQuantity,
          supplier: input.supplier,
          price: input.price,
        }
      );

      if (response.addStockDelivery.success && response.addStockDelivery.stockData) {
        return {
          success: true,
          delivery: response.addStockDelivery.stockData,
        };
      } else {
        return {
          success: false,
          errors: [response.addStockDelivery.message || 'Failed to add stock delivery'],
        };
      }
    } catch (error) {
      console.error('Error adding stock delivery:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to add stock delivery'],
      };
    }
  },
};
