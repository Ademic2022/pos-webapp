/**
 * Reports Service
 * 
 * Handles report-related API calls using the Django sales_stats query
 * to provide comprehensive sales statistics for the reports page
 */

import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';
import { SALES_STATS_QUERY, SALES_QUERY, CUSTOMER_CREDITS_QUERY, TOP_CUSTOMERS_QUERY } from '@/lib/graphql';
import { Sale } from '@/services/salesService';
import { SalesStats, ReportFilters, CustomerCreditConnection } from '@/interfaces/interface';
import { decodeGraphQLId, encodeGraphQLId } from '@/utils/graphqlUtils';

// Define GraphQL connection types
interface SalesConnection {
    edges: Array<{
        node: Sale;
    }>;
    pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string;
        endCursor?: string;
    };
}

/**
 * Reports Service
 * Handles sales reporting functionality with Django backend integration
 * Uses separated methods for statistics and transactions for better performance
 */

// Define response types
export interface GetStatsResponse {
    success: boolean;
    error?: string;
    statistics: SalesStats;
}

export interface GetTransactionsResponse {
    success: boolean;
    error?: string;
    transactions: Sale[];
}

export interface ReportsData {
    sales: Sale[];
    statistics: SalesStats;
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
}

export interface ReportsResponse {
    success: boolean;
    data?: ReportsData;
    errors?: string[];
}

// Service Implementation
export const reportsService = {
    /**
     * Helper function to format dates safely without timezone issues
     */
    formatDateSafely(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Get sales statistics only (without individual transactions)
     * This is the primary method for the overview tab
     */
    async getSalesStats(filters: ReportFilters): Promise<{
        success: boolean;
        statistics?: SalesStats;
        summary?: {
            totalSales: number;
            totalPaid: number;
            totalOutstanding: number;
            totalTransactions: number;
            totalDiscounts: number;
            wholesaleRevenue: number;
            retailRevenue: number;
            averageTransaction: number;
        };
        errors?: string[];
    }> {
        try {
            const params = this.convertFiltersToStatsParams(filters);

            const response = await enhancedGraphqlClient.request<{ salesStats: SalesStats }>(
                SALES_STATS_QUERY,
                params
            );

            const statistics = response.salesStats;

            // Create summary from statistics
            const summary = {
                totalSales: statistics.totalSales,
                totalPaid: statistics.totalSales - statistics.customerDebtIncurred.value,
                totalOutstanding: statistics.customerDebtIncurred.value,
                totalTransactions: statistics.totalTransactions,
                totalDiscounts: statistics.totalDiscounts,
                wholesaleRevenue: statistics.wholesaleSales,
                retailRevenue: statistics.retailSales,
                averageTransaction: statistics.averageSaleValue,
            };

            return {
                success: true,
                statistics,
                summary,
            };
        } catch (error) {
            console.error('Error fetching sales statistics:', error);
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Failed to fetch sales statistics'],
            };
        }
    },

    /**
     * Get sales transactions only (for the transactions tab)
     */
    async getSalesTransactions(
        filters: ReportFilters,
        pagination: {
            first?: number;
            after?: string;
        } = {}
    ): Promise<{
        success: boolean;
        sales?: Sale[];
        hasNextPage?: boolean;
        cursor?: string | null;
        errors?: string[];
    }> {
        try {
            const salesParams = this.convertFiltersToSalesParams(filters, pagination);

            const salesResponse = await enhancedGraphqlClient.request<{ sales: SalesConnection }>(
                SALES_QUERY,
                salesParams
            );

            const salesData = salesResponse.sales.edges.map(edge => edge.node);
            const hasNextPage = salesResponse.sales.pageInfo.hasNextPage;
            const cursor = salesData.length > 0 ? salesData[salesData.length - 1].id : null;

            return {
                success: true,
                sales: salesData,
                hasNextPage,
                cursor,
            };
        } catch (error) {
            console.error('Error fetching sales transactions:', error);
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Failed to fetch sales transactions'],
            };
        }
    },

    /**
     * Get comprehensive reports data including statistics and sales transactions
     * @deprecated Use getSalesStats() and getSalesTransactions() separately for better performance
     */
    async getReportsData(
        filters: ReportFilters,
        pagination: {
            first?: number;
            after?: string;
        } = {}
    ): Promise<ReportsResponse> {
        try {
            // Convert filters to GraphQL parameters
            const statsParams = this.convertFiltersToStatsParams(filters);
            const salesParams = this.convertFiltersToSalesParams(filters, pagination);

            // Execute both queries in parallel
            const [statsResponse, salesResponse] = await Promise.all([
                enhancedGraphqlClient.request<{ salesStats: SalesStats }>(
                    SALES_STATS_QUERY,
                    statsParams
                ),
                enhancedGraphqlClient.request<{ sales: SalesConnection }>(
                    SALES_QUERY,
                    salesParams
                ),
            ]);

            const statistics = statsResponse.salesStats;
            const salesData = salesResponse.sales.edges.map(edge => edge.node);

            // Create summary object for compatibility with existing code
            const summary = {
                totalSales: statistics.totalSales,
                totalPaid: statistics.totalSales - salesData.reduce((sum, sale) => sum + sale.amountDue, 0),
                totalOutstanding: salesData.reduce((sum, sale) => sum + sale.amountDue, 0),
                totalTransactions: statistics.totalTransactions,
                totalDiscounts: statistics.totalDiscounts,
                wholesaleRevenue: statistics.wholesaleSales,
                retailRevenue: statistics.retailSales,
                averageTransaction: statistics.averageSaleValue,
            };

            return {
                success: true,
                data: {
                    sales: salesData,
                    statistics,
                    summary,
                },
            };
        } catch (error) {
            console.error('Error fetching reports data:', error);
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Failed to fetch reports data'],
            };
        }
    },

    /**
     * Convert ReportFilters to GraphQL parameters for sales_stats query
     */
    convertFiltersToStatsParams(filters: ReportFilters) {
        const params: Record<string, string | number | boolean | Date> = {};

        // Date filtering
        if (filters.dateRange && filters.dateRange !== 'custom') {
            const now = new Date();
            let dateFrom: Date;
            let dateTo: Date | null = null;

            switch (filters.dateRange) {
                case 'today':
                    dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'yesterday':
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    dateFrom = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                    dateTo = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
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

            // Format dates manually to avoid timezone issues
            params.dateFrom = this.formatDateSafely(dateFrom);
            if (dateTo) {
                params.dateTo = this.formatDateSafely(dateTo);
            }
        } else if (filters.dateRange === 'custom') {
            if (filters.startDate) {
                params.dateFrom = filters.startDate;
            }
            if (filters.endDate) {
                params.dateTo = filters.endDate;
            }
        }

        // Customer type filtering (maps to sale_type in Django)
        if (filters.customerType && filters.customerType !== 'all') {
            params.saleType = filters.customerType.toUpperCase();
        }

        // Payment method filtering
        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
            params.paymentMethod = filters.paymentMethod.toUpperCase();
        }

        // Status filtering (outstanding debt)
        if (filters.status === 'pending') {
            params.amountDueGt = 0;
        } else if (filters.status === 'paid') {
            params.amountDueGte = 0;
            params.amountDueGte = 0; // This will be filtered to show only fully paid
        }

        // Customer filtering
        if (filters.customerId && filters.customerId !== "") {
            if (filters.customerId === "walk-in") {
                params.customerIsnull = true;
            } else {
                // Decode GraphQL global ID to get the actual database ID
                const decodedCustomerId = decodeGraphQLId(filters.customerId);
                params.customer = decodedCustomerId;
            }
        }

        // Amount filtering
        if (filters.amountMin !== undefined && filters.amountMin !== null && filters.amountMin !== 0) {
            params.totalGte = filters.amountMin;
        }
        if (filters.amountMax !== undefined && filters.amountMax !== null && filters.amountMax !== 0) {
            params.totalLte = filters.amountMax;
        }

        return params;
    },

    /**
     * Convert ReportFilters to GraphQL parameters for sales query
     */
    convertFiltersToSalesParams(filters: ReportFilters, pagination: { first?: number; after?: string } = {}) {
        const params = this.convertFiltersToStatsParams(filters);

        // Add pagination
        params.first = pagination.first || 50;
        if (pagination.after) {
            params.after = pagination.after;
        }

        // Convert date params for DateTime fields in sales query
        if (params.dateFrom) {
            params.createdAt_Gte = `${params.dateFrom}T00:00:00Z`;
            delete params.dateFrom;
        }
        if (params.dateTo) {
            params.createdAt_Lte = `${params.dateTo}T23:59:59Z`;
            delete params.dateTo;
        }

        if (params.transactionIdIcontains) {
            params.transactionId_Icontains = params.transactionIdIcontains;
            delete params.transactionIdIcontains;
        }

        if (params.totalGte) {
            params.total_Gte = params.totalGte;
            delete params.totalGte;
        }

        if (params.totalLte) {
            params.total_Lte = params.totalLte;
            delete params.totalLte;
        }

        if (params.amountDueGt) {
            params.amountDue_Gt = params.amountDueGt;
            delete params.amountDueGt;
        }

        if (params.amountDueGte) {
            params.amountDue_Gte = params.amountDueGte;
            delete params.amountDueGte;
        }

        if (params.customer) {
            params.customer = encodeGraphQLId('CustomerType', params.customer as string | number);
        }
        // Remove payment method from sales query as it's handled in stats
        delete params.paymentMethod;

        return params;
    },

    /**
     * Fetch customer credits data with filtering
     */
    async getCustomerCredits(params: {
        transactionType?: 'CREDIT_USED' | 'CREDIT_EARNED' | 'DEBT_INCURRED';
        customerId?: string;
        dateFrom?: string;
        dateTo?: string;
        first?: number;
        after?: string;
    }) {
        try {
            const variables = {
                transactionType: params.transactionType,
                customerId: params.customerId, // Match the GraphQL query parameter name
                dateFrom: params.dateFrom ? `${params.dateFrom}T00:00:00Z` : null,
                dateTo: params.dateTo ? `${params.dateTo}T23:59:59Z` : null,
                first: params.first || 10,
                after: params.after,
                orderBy: '-created_at',
            };

            // Clean up null/undefined values
            const cleanVariables = Object.fromEntries(
                Object.entries(variables).filter(([, value]) => value !== null && value !== undefined)
            );

            const response = await enhancedGraphqlClient.request(
                CUSTOMER_CREDITS_QUERY,
                cleanVariables
            ) as { customerCredits: CustomerCreditConnection };

            return {
                success: true,
                data: response.customerCredits,
            };
        } catch (error) {
            console.error('Error fetching customer credits:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch customer credits',
                data: {
                    edges: [],
                    pageInfo: {
                        hasNextPage: false,
                        hasPreviousPage: false,
                        startCursor: '',
                        endCursor: '',
                    },
                    totalCount: 0,
                },
            };
        }
    },

    /**
     * Get customer analysis data including top customers and outstanding debts
     * Combines TOP_CUSTOMERS_QUERY and CUSTOMER_CREDITS_QUERY data
     */
    async getCustomerAnalysis(filters: ReportFilters): Promise<{
        success: boolean;
        topCustomers?: Array<{
            name: string;
            id: string;
            revenue: number;
            transactions: number;
            saleType: string;
        }>;
        outstandingDebts?: CustomerCreditConnection;
        errors?: string[];
    }> {
        try {
            // Convert filters for both queries
            const topCustomersParams = this.convertFiltersToSalesParams(filters, { first: 5 });

            // Convert filters to customer credits params using the same logic as stats conversion
            const baseParams = this.convertFiltersToStatsParams(filters);
            const creditsParams = {
                transactionType: 'DEBT_INCURRED' as const,
                customerId: filters.customerId, // Keep as customerId to match getCustomerCredits function
                dateFrom: baseParams.dateFrom as string,
                dateTo: baseParams.dateTo as string,
                first: 50,
            };

            // Fetch both top customers and outstanding debts in parallel
            const [topCustomersResponse, creditsResponse] = await Promise.all([
                enhancedGraphqlClient.request<{
                    sales: {
                        edges: Array<{
                            node: {
                                total: number;
                                subtotal: number;
                                saleType: string;
                                customer: {
                                    id: string;
                                    name: string;
                                } | null;
                            };
                        }>;
                    };
                }>(TOP_CUSTOMERS_QUERY, topCustomersParams),
                this.getCustomerCredits(creditsParams)
            ]);

            // Process top customers - group by customer and calculate totals
            const customerMap = new Map<string, {
                name: string;
                id: string;
                revenue: number;
                transactions: number;
                saleType: string;
            }>();

            topCustomersResponse.sales.edges.forEach(edge => {
                const sale = edge.node;
                const customerKey = sale.customer?.id || 'walk-in';
                const customerName = sale.customer?.name || 'Walk-in Customer';

                if (!customerMap.has(customerKey)) {
                    customerMap.set(customerKey, {
                        name: customerName,
                        id: customerKey,
                        revenue: 0,
                        transactions: 0,
                        saleType: sale.saleType.toLowerCase(),
                    });
                }

                const customer = customerMap.get(customerKey)!;
                customer.revenue += sale.total;
                customer.transactions += 1;
            });

            // Convert to array and sort by revenue
            const topCustomers = Array.from(customerMap.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            return {
                success: true,
                topCustomers,
                outstandingDebts: creditsResponse.success ? creditsResponse.data : {
                    edges: [],
                    pageInfo: {
                        hasNextPage: false,
                        hasPreviousPage: false,
                        startCursor: '',
                        endCursor: '',
                    },
                    totalCount: 0,
                },
            };

        } catch (error) {
            console.error('Error fetching customer analysis data:', error);
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Failed to fetch customer analysis data'],
            };
        }
    },
};
