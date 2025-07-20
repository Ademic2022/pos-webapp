/**
 * Reports Service
 * 
 * Handles report-related API calls using the Django sales_stats query
 * to provide comprehensive sales statistics for the reports page
 */

import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';
import { SALES_STATS_QUERY, SALES_QUERY } from '@/lib/graphql';
import { Sale } from '@/services/salesService';
import { SalesStats, ReportFilters } from '@/interfaces/interface';
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
            console.log('Sales Params:', salesParams);


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

            params.dateFrom = dateFrom.toISOString().split('T')[0]; // Format as YYYY-MM-DD
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
            params.createdAtGte = new Date(params.dateFrom as string).toISOString();
            delete params.dateFrom;
        }
        if (params.dateTo) {
            params.createdAtLte = new Date(params.dateTo as string).toISOString();
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
};
