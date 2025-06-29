/**
 * Sales Service
 * 
 * Handles all sales-related API calls including:
 * - Creating new sales
 * - Managing payments
 * - Customer credit operations
 * - Sales statistics and reports
 */

import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';
import {
  SALES_QUERY,
  SALE_BY_ID_QUERY,
  CREATE_SALE_MUTATION,
  ADD_PAYMENT_MUTATION,
  SALES_STATS_QUERY,
  RECENT_SALES_QUERY,
  CUSTOMER_CREDIT_BALANCE_QUERY,
  ADD_CUSTOMER_CREDIT_MUTATION,
} from '@/lib/graphql';

// TypeScript Interfaces
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export interface SaleItem {
  id?: string;
  product: Product;
  productId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id?: string;
  method: 'CASH' | 'TRANSFER' | 'CREDIT' | 'PART_PAYMENT';
  amount: number;
  createdAt?: string;
}

export interface Sale {
  id: string;
  transactionId: string;
  customer?: Customer;
  saleType: 'RETAIL' | 'WHOLESALE';
  subtotal: number;
  discount: number;
  total: number;
  // creditApplied: number;
  amountDue: number;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
  payments: Payment[];
}

export interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageSaleValue: number;
  retailSales: number;
  wholesaleSales: number;
  cashSales: number;
  creditSales: number;
  totalDiscounts: number;
}

export interface CreateSaleInput {
  customerId?: string;
  saleType: 'RETAIL' | 'WHOLESALE';
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount?: number;
  // creditApplied?: number;
}

export interface CreateSaleResponse {
  success: boolean;
  sale?: Sale;
  errors?: string[];
}

export interface SalesConnection {
  edges: Array<{
    node: Sale;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
}

// Service Implementation
export const salesService = {
  /**
   * Get sales with filtering and pagination
   */
  async getSales(params: {
    first?: number;
    after?: string;
    saleType?: string;
    customerName?: string;
    totalMin?: number;
    totalMax?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<{
    success: boolean;
    data?: SalesConnection;
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<{ sales: SalesConnection }>(
        SALES_QUERY,
        {
          first: params.first || 20,
          ...params,
        }
      );

      return {
        success: true,
        data: response.sales,
      };
    } catch (error) {
      console.error('Error fetching sales:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to fetch sales'],
      };
    }
  },

  /**
   * Get a single sale by ID
   */
  async getSaleById(id: string): Promise<{
    success: boolean;
    sale?: Sale;
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<{ sale: Sale }>(
        SALE_BY_ID_QUERY,
        { id }
      );

      return {
        success: true,
        sale: response.sale,
      };
    } catch (error) {
      console.error('Error fetching sale:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to fetch sale'],
      };
    }
  },

  /**
   * Create a new sale
   */
  async createSale(input: CreateSaleInput, payments?: Payment[]): Promise<CreateSaleResponse> {
    try {
      const response = await enhancedGraphqlClient.request<{
        createSale: {
          success: boolean;
          sale?: Sale;
          errors?: string[];
        };
      }>(CREATE_SALE_MUTATION, {
        saleData: input,
        payments: payments?.map(p => ({
          method: p.method,
          amount: p.amount,
        })),
      });

      return {
        success: response.createSale.success,
        sale: response.createSale.sale,
        errors: response.createSale.errors,
      };
    } catch (error) {
      console.error('Error creating sale:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to create sale'],
      };
    }
  },

  /**
   * Add payment to an existing sale
   */
  async addPayment(saleId: string, method: Payment['method'], amount: number): Promise<{
    success: boolean;
    payment?: Payment;
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<{
        addPayment: {
          success: boolean;
          payment?: Payment;
          errors?: string[];
        };
      }>(ADD_PAYMENT_MUTATION, {
        saleId,
        method,
        amount,
      });

      return {
        success: response.addPayment.success,
        payment: response.addPayment.payment,
        errors: response.addPayment.errors,
      };
    } catch (error) {
      console.error('Error adding payment:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to add payment'],
      };
    }
  },

  /**
   * Get sales statistics
   */
  async getSalesStats(dateFrom?: string, dateTo?: string): Promise<{
    success: boolean;
    stats?: SalesStats;
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<{
        salesStats: SalesStats;
      }>(SALES_STATS_QUERY, {
        dateFrom,
        dateTo,
      });

      return {
        success: true,
        stats: response.salesStats,
      };
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to fetch sales stats'],
      };
    }
  },

  /**
   * Get recent sales for dashboard
   */
  async getRecentSales(limit = 10): Promise<{
    success: boolean;
    sales?: Sale[];
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<{
        recentSales: Sale[];
      }>(RECENT_SALES_QUERY, { limit });

      return {
        success: true,
        sales: response.recentSales,
      };
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to fetch recent sales'],
      };
    }
  },

  /**
   * Get customer credit balance
   */
  async getCustomerCreditBalance(customerId: string): Promise<{
    success: boolean;
    balance?: number;
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<{
        customerCreditBalance: number;
      }>(CUSTOMER_CREDIT_BALANCE_QUERY, { customerId });

      return {
        success: true,
        balance: response.customerCreditBalance,
      };
    } catch (error) {
      console.error('Error fetching customer credit balance:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to fetch credit balance'],
      };
    }
  },

  /**
   * Add credit to customer account
   */
  async addCustomerCredit(customerId: string, amount: number, description?: string): Promise<{
    success: boolean;
    errors?: string[];
  }> {
    try {
      const response = await enhancedGraphqlClient.request<{
        addCustomerCredit: {
          success: boolean;
          errors?: string[];
        };
      }>(ADD_CUSTOMER_CREDIT_MUTATION, {
        customerId,
        amount,
        description,
      });

      return {
        success: response.addCustomerCredit.success,
        errors: response.addCustomerCredit.errors,
      };
    } catch (error) {
      console.error('Error adding customer credit:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to add customer credit'],
      };
    }
  },
};
