/**
 * Sales Hooks
 * 
 * Custom React hooks for sales operations including:
 * - Customer management
 * - Product inventory with live stock data
 * - Sales creation and management
 * - Customer credit operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';
import {
  GET_CUSTOMERS,
  CREATE_CUSTOMER,
  PRODUCT_INVENTORY_QUERY,
  CREATE_SALE_MUTATION,
  ADD_CUSTOMER_CREDIT_MUTATION,
  CUSTOMER_CREDIT_BALANCE_QUERY,
} from '@/lib/graphql';

// TypeScript Interfaces
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  type: 'RETAIL' | 'WHOLESALE';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  balance: number;
  creditLimit: number;
  totalPurchases?: number;
  lastPurchase?: string;
  joinDate?: string;
  notes?: string;
  availableCredit: number;
  isCreditAvailable: boolean;
}

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
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  method: 'CASH' | 'TRANSFER' | 'CREDIT' | 'PART_PAYMENT';
  amount: number;
}

export interface CreateSaleInput {
  customerId?: string;
  saleType: 'RETAIL' | 'WHOLESALE';
  items: SaleItem[];
  payments: Payment[];
  discount?: number;
  creditApplied?: number;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: 'RETAIL' | 'WHOLESALE';
  creditLimit?: number;
  notes?: string;
}

// Additional interfaces for proper typing
export interface Sale {
  id: string;
  saleDate: string;
  total: number;
  customerId: string;
  saleType: 'RETAIL' | 'WHOLESALE';
}

export interface CreditTransaction {
  id: string;
  amount: number;
  transactionDate: string;
  description?: string;
}

// Customer Hook
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const variables: {
        first: number;
        name_Icontains?: string;
      } = {
        first: 100, // Adjust as needed
      };

      if (searchTerm) {
        variables.name_Icontains = searchTerm;
      }

      const response = await enhancedGraphqlClient.request<{
        customers: {
          edges: Array<{ node: Customer }>;
        };
      }>(GET_CUSTOMERS, variables);

      const customerList = response.customers.edges.map(edge => edge.node);
      setCustomers(customerList);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (input: CreateCustomerInput): Promise<{
    success: boolean;
    customer?: Customer;
    errors?: string[];
  }> => {
    try {
      const response = await enhancedGraphqlClient.request<{
        createCustomer: {
          success: boolean;
          customer?: Customer;
          errors?: string[];
        };
      }>(CREATE_CUSTOMER, { input });

      if (response.createCustomer.success && response.createCustomer.customer) {
        // Add new customer to the list
        setCustomers(prev => [...prev, response.createCustomer.customer!]);
      }

      return response.createCustomer;
    } catch (err) {
      console.error('Error creating customer:', err);
      return {
        success: false,
        errors: [err instanceof Error ? err.message : 'Failed to create customer'],
      };
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    createCustomer,
    refetch: fetchCustomers,
  };
};

// Products Hook
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [latestStockDelivery, setLatestStockDelivery] = useState<StockDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await enhancedGraphqlClient.request<{
        products: {
          edges: Array<{ node: Product }>;
        };
        latestStockDeliveries: StockDelivery[];
      }>(PRODUCT_INVENTORY_QUERY);

      const productList = response.products.edges.map(edge => edge.node);
      setProducts(productList);

      const latestStock = response.latestStockDeliveries[0] || null;
      setLatestStockDelivery(latestStock);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Group products by sale type (similar to inventory settings)
  const groupedProducts = useMemo(() => {
    const retail = products.filter(p => p.saleType === 'RETAIL');
    const wholesale = products.filter(p => p.saleType === 'WHOLESALE');
    
    return {
      retail,
      wholesale,
      all: products,
    };
  }, [products]);

  // Calculate total available stock from latest delivery
  const totalAvailableStock = useMemo(() => {
    return latestStockDelivery?.remainingStock || 0;
  }, [latestStockDelivery]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: groupedProducts,
    latestStockDelivery,
    totalAvailableStock,
    isLoading,
    error,
    refetch: fetchProducts,
  };
};

// Sales Hook
export const useSales = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSale = useCallback(async (input: CreateSaleInput): Promise<{
    success: boolean;
    sale?: Sale;
    errors?: string[];
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert string IDs to integers for the GraphQL mutation
      const mutationInput = {
        customerId: parseInt(input.customerId || '0', 10),
        saleType: input.saleType,
        items: input.items.map(item => ({
          productId: parseInt(item.productId, 10),
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()).toFixed(2), // Convert to decimal string
        })),
        payments: input.payments.map(payment => ({
          method: payment.method,
          amount: parseFloat(payment.amount.toString()).toFixed(2), // Convert to decimal string
        })),
        discount: parseFloat((input.discount || 0).toString()).toFixed(2), // Convert to decimal string
        // creditApplied: parseFloat((input.creditApplied || 0).toString()).toFixed(2), // Convert to decimal string
      };

      console.log('GraphQL mutation input:', mutationInput);

      // Fix the mutation call to use the correct parameter structure
      const response = await enhancedGraphqlClient.request<{
        createSale: {
          success: boolean;
          sale?: Sale;
          errors?: string[];
        };
      }>(CREATE_SALE_MUTATION, {
        input: mutationInput
      });

      return response.createSale;
    } catch (err) {
      console.error('Error creating sale:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sale';
      setError(errorMessage);
      
      return {
        success: false,
        errors: [errorMessage],
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createSale,
    isLoading,
    error,
  };
};

// Customer Credit Hook
export const useCustomerCredit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCustomerCreditBalance = useCallback(async (customerId: string): Promise<number> => {
    try {
      const response = await enhancedGraphqlClient.request<{
        customerCreditBalance: number;
      }>(CUSTOMER_CREDIT_BALANCE_QUERY, { customerId });

      return response.customerCreditBalance;
    } catch (err) {
      console.error('Error fetching customer credit balance:', err);
      return 0;
    }
  }, []);

  const addCustomerCredit = useCallback(async (
    customerId: string,
    amount: number,
    description?: string
  ): Promise<{
    success: boolean;
    creditTransaction?: CreditTransaction;
    errors?: string[];
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await enhancedGraphqlClient.request<{
        addCustomerCredit: {
          success: boolean;
          creditTransaction?: CreditTransaction;
          errors?: string[];
        };
      }>(ADD_CUSTOMER_CREDIT_MUTATION, {
        customerId,
        amount,
        description,
      });

      return response.addCustomerCredit;
    } catch (err) {
      console.error('Error adding customer credit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add credit';
      setError(errorMessage);
      
      return {
        success: false,
        errors: [errorMessage],
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCustomerCreditBalance,
    addCustomerCredit,
    isLoading,
    error,
  };
};
