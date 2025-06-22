import { 
  graphqlClient, 
  GET_CUSTOMERS, 
  GET_CUSTOMER, 
  GET_CUSTOMER_BY_PHONE, 
  GET_CUSTOMER_STATS,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER
} from '@/lib/graphql';
import { Customer } from '@/interfaces/interface';

export interface CustomerFilters {
  search?: string;
  type?: 'retail' | 'wholesale';
  status?: 'active' | 'inactive' | 'blocked';
  hasBalance?: boolean;
  hasCreditLimit?: boolean;
}

export interface CustomerStats {
  totalCustomers: number;
  retailCustomers: number;
  wholesaleCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  blockedCustomers: number;
  totalCreditIssued: number;
  totalOutstandingBalance: number;
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
  
  async getCustomers(
    filters?: CustomerFilters, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<CustomersResponse> {
    try {
      const variables = {
        first: limit,
        after: offset > 0 ? btoa(`cursor${offset}`) : null // Convert offset to cursor
      };

      const response = await graphqlClient.request(GET_CUSTOMERS, variables) as {
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
      const response = await graphqlClient.request(GET_CUSTOMER, { id }) as {
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
      const response = await graphqlClient.request(GET_CUSTOMER_BY_PHONE, { phone }) as {
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
      const response = await graphqlClient.request(GET_CUSTOMER_STATS) as {
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

      const response = await graphqlClient.request(CREATE_CUSTOMER, variables) as {
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
      const variables = {
        input: {
          id: input.id,
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

      const response = await graphqlClient.request(UPDATE_CUSTOMER, variables) as {
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
      const response = await graphqlClient.request(DELETE_CUSTOMER, { id }) as {
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

  private formatCustomer(customer: any): Customer {
    return {
      id: parseInt(customer.id),
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      type: customer.type.toLowerCase() as 'retail' | 'wholesale',
      status: customer.status.toLowerCase() as 'active' | 'inactive' | 'blocked',
      balance: parseFloat(customer.balance) || 0,
      creditLimit: parseFloat(customer.creditLimit) || 0,
      totalPurchases: parseFloat(customer.totalPurchases) || 0,
      lastPurchase: customer.lastPurchase || '',
      joinDate: customer.joinDate || customer.createdAt || '',
      notes: customer.notes || ''
    };
  }
}

export const customerService = new CustomerService();
