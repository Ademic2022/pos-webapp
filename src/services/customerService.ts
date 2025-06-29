import { 
  GET_CUSTOMERS, 
  GET_CUSTOMER, 
  GET_CUSTOMER_BY_PHONE, 
  GET_CUSTOMER_STATS,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER
} from '@/lib/graphql';
import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';
import { Customer } from '@/interfaces/interface';

export interface CustomerFilters {
  search?: string;
  type?: 'retail' | 'wholesale';
  status?: 'active' | 'inactive' | 'blocked';
  hasBalance?: boolean; // For customers with negative balance (debt)
  hasCreditLimit?: boolean;
}

interface GraphQLVariables extends Record<string, unknown> {
  first: number;
  after?: string | null;
  name_Icontains?: string;
  type?: string;
  status?: string;
  balance_Gt?: number;
  balance_Lt?: number;
}

interface RawCustomerData {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  type: string;
  status: string;
  balance: string | number;
  creditLimit: string | number;
  totalPurchases: string | number;
  lastPurchase?: string;
  joinDate?: string;
  createdAt?: string;
  notes?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  retailCustomers: number;
  wholesaleCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  blockedCustomers: number;
  totalCreditIssued: number;
  debt: {
    value: number;
    count: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  type: 'retail' | 'wholesale';
  creditLimit?: number;
  notes?: string;
}

export interface UpdateCustomerInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: 'retail' | 'wholesale';
  status?: 'active' | 'inactive' | 'blocked';
  creditLimit?: number;
  notes?: string;
}

export interface CustomerResponse {
  success: boolean;
  customer?: Customer;
  errors?: string[];
}

export interface CustomersResponse {
  success: boolean;
  customers?: Customer[];
  errors?: string[];
}

export interface CustomerStatsResponse {
  success: boolean;
  stats?: CustomerStats;
  errors?: string[];
}

class CustomerService {
  
  /**
   * Decode Relay Global ID to extract the numeric database ID
   * Relay Global IDs are base64 encoded strings in format: "Type:id"
   */
  private decodeRelayGlobalId(globalId: string): string {
    try {
      // First, decode URL encoding (e.g., %3D back to =)
      const urlDecoded = decodeURIComponent(globalId);
      
      // Then decode base64 string
      const decoded = atob(urlDecoded);
      
      // Extract the numeric ID after the colon (format: "CustomerType:123")
      const parts = decoded.split(':');
      return parts.length === 2 ? parts[1] : globalId;
    } catch {
      // If decoding fails, assume it's already a numeric ID
      console.warn('Failed to decode Relay Global ID, using as-is:', globalId);
      return globalId;
    }
  }
  
  async getCustomers(
    filters?: CustomerFilters, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<CustomersResponse> {
    try {
      const variables: GraphQLVariables = {
        first: limit,
        after: offset > 0 ? btoa(`cursor${offset}`) : null
      };

      // Add filter parameters to variables
      if (filters) {
        if (filters.search) {
          variables.name_Icontains = filters.search;
        }
        if (filters.type) {
          // Convert to uppercase enum value: 'retail' -> 'RETAIL'
          variables.type = filters.type.toUpperCase();
        }
        if (filters.status) {
          // Convert to uppercase enum value: 'active' -> 'ACTIVE'
          variables.status = filters.status.toUpperCase();
        }
        if (filters.hasBalance) {
          variables.balance_Lt = 0; // Filter for customers with negative balance (debt)
        }
      }

      const response = await enhancedGraphqlClient.request(GET_CUSTOMERS, variables) as {
        customers: {
          edges: Array<{
            node: Customer;
          }>;
          pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string;
            endCursor: string;
          };
        };
      };

      return {
        success: true,
        customers: response.customers.edges.map(edge => this.formatCustomer(edge.node))
      };
    } catch (error) {
      console.error('Get customers error:', error);
      return {
        success: false,
        errors: ['Failed to fetch customers']
      };
    }
  }

  async getCustomer(id: string): Promise<CustomerResponse> {
    try {
      // Decode Relay Global ID to get numeric database ID
      const numericId = this.decodeRelayGlobalId(id);
      
      const response = await enhancedGraphqlClient.request(GET_CUSTOMER, { id: numericId }) as {
        customer: Customer;
      };

      if (!response.customer) {
        return {
          success: false,
          errors: ['Customer not found']
        };
      }

      return {
        success: true,
        customer: this.formatCustomer(response.customer)
      };
    } catch (error) {
      console.error('Get customer error:', error);
      return {
        success: false,
        errors: ['Failed to fetch customer']
      };
    }
  }

  async getCustomerByPhone(phone: string): Promise<CustomerResponse> {
    try {
      const response = await enhancedGraphqlClient.request(GET_CUSTOMER_BY_PHONE, { phone }) as {
        customerByPhone: Customer;
      };

      if (!response.customerByPhone) {
        return {
          success: false,
          errors: ['Customer not found']
        };
      }

      return {
        success: true,
        customer: this.formatCustomer(response.customerByPhone)
      };
    } catch (error) {
      console.error('Get customer by phone error:', error);
      return {
        success: false,
        errors: ['Failed to fetch customer']
      };
    }
  }

  async getCustomerStats(): Promise<CustomerStatsResponse> {
    try {
      const response = await enhancedGraphqlClient.request(GET_CUSTOMER_STATS) as {
        customerStats: CustomerStats;
      };

      return {
        success: true,
        stats: response.customerStats
      };
    } catch (error) {
      console.error('Get customer stats error:', error);
      return {
        success: false,
        errors: ['Failed to fetch customer statistics']
      };
    }
  }

  async createCustomer(input: CreateCustomerInput): Promise<CustomerResponse> {
    try {
      const variables = {
        input: {
          name: input.name,
          email: input.email || null,
          phone: input.phone,
          address: input.address || null,
          type: input.type.toUpperCase(),
          creditLimit: input.creditLimit || 0,
          notes: input.notes || null
        }
      };

      const response = await enhancedGraphqlClient.request(CREATE_CUSTOMER, variables) as {
        createCustomer: {
          success: boolean;
          customer?: Customer;
          errors?: string[];
        };
      };

      if (!response.createCustomer.success) {
        return {
          success: false,
          errors: response.createCustomer.errors || ['Failed to create customer']
        };
      }

      return {
        success: true,
        customer: response.createCustomer.customer ? 
          this.formatCustomer(response.createCustomer.customer) : undefined
      };
    } catch (error) {
      console.error('Create customer error:', error);
      return {
        success: false,
        errors: ['Failed to create customer']
      };
    }
  }

  async updateCustomer(input: UpdateCustomerInput): Promise<CustomerResponse> {
    try {
      // Decode Relay Global ID to get numeric database ID
      const numericId = this.decodeRelayGlobalId(input.id);
      
      const variables = {
        input: {
          id: numericId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          type: input.type?.toUpperCase(),
          status: input.status?.toUpperCase(),
          creditLimit: input.creditLimit,
          notes: input.notes
        }
      };

      const response = await enhancedGraphqlClient.request(UPDATE_CUSTOMER, variables) as {
        updateCustomer: {
          success: boolean;
          customer?: Customer;
          errors?: string[];
        };
      };

      if (!response.updateCustomer.success) {
        return {
          success: false,
          errors: response.updateCustomer.errors || ['Failed to update customer']
        };
      }

      return {
        success: true,
        customer: response.updateCustomer.customer ? 
          this.formatCustomer(response.updateCustomer.customer) : undefined
      };
    } catch (error) {
      console.error('Update customer error:', error);
      return {
        success: false,
        errors: ['Failed to update customer']
      };
    }
  }

  async deleteCustomer(id: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Decode Relay Global ID to get numeric database ID
      const numericId = this.decodeRelayGlobalId(id);
      
      const response = await enhancedGraphqlClient.request(DELETE_CUSTOMER, { id: numericId }) as {
        deleteCustomer: {
          success: boolean;
          errors?: string[];
        };
      };

      if (!response.deleteCustomer.success) {
        return {
          success: false,
          errors: response.deleteCustomer.errors || ['Failed to delete customer']
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Delete customer error:', error);
      return {
        success: false,
        errors: ['Failed to delete customer']
      };
    }
  }

  private formatCustomer(customer: RawCustomerData): Customer {
    return {
      id: customer.id, // Keep as string - no parseInt needed
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      type: customer.type.toLowerCase() as 'retail' | 'wholesale',
      status: customer.status.toLowerCase() as 'active' | 'inactive' | 'blocked',
      balance: typeof customer.balance === 'number' ? customer.balance : parseFloat(customer.balance) || 0,
      creditLimit: typeof customer.creditLimit === 'number' ? customer.creditLimit : parseFloat(customer.creditLimit) || 0,
      totalPurchases: typeof customer.totalPurchases === 'number' ? customer.totalPurchases : parseFloat(customer.totalPurchases) || 0,
      lastPurchase: customer.lastPurchase || '',
      joinDate: customer.joinDate || customer.createdAt || '',
      notes: customer.notes || ''
    };
  }
}

export const customerService = new CustomerService();
