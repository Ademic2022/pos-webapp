/**
 * Customer Credits Hook
 * 
 * Provides functionality to fetch and manage customer credit data
 * with filtering and pagination support
 */

import { useState, useCallback } from 'react';
import { reportsService } from '@/services/reportsService';
import { CustomerCredit, CustomerCreditEdge } from '@/interfaces/interface';

interface UseCustomerCreditsProps {
    transactionType?: 'CREDIT_USED' | 'CREDIT_EARNED' | 'DEBT_INCURRED';
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    autoFetch?: boolean;
}

interface CustomerCreditSummary {
    totalAmount: number;
    totalCount: number;
    customers: Array<{
        customer: {
            id: string;
            name: string;
            type?: string;
        };
        totalAmount: number;
        transactionCount: number;
        latestBalance: number;
        lastTransaction: string;
    }>;
}

export const useCustomerCredits = (props: UseCustomerCreditsProps = {}) => {
    const [credits, setCredits] = useState<CustomerCredit[]>([]);
    const [pageInfo, setPageInfo] = useState({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: '',
    });
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<CustomerCreditSummary | null>(null);

    const fetchCustomerCredits = useCallback(async (
        filters: {
            transactionType?: 'CREDIT_USED' | 'CREDIT_EARNED' | 'DEBT_INCURRED';
            customerId?: string;
            dateFrom?: string;
            dateTo?: string;
            first?: number;
            after?: string;
        } = {}
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = {
                transactionType: filters.transactionType || props.transactionType,
                customerId: filters.customerId || props.customerId,
                dateFrom: filters.dateFrom || props.dateFrom,
                dateTo: filters.dateTo || props.dateTo,
                first: filters.first || 50,
                after: filters.after,
            };

            const response = await reportsService.getCustomerCredits(params);

            if (response.success && response.data) {
                const newCredits = response.data.edges.map((edge: CustomerCreditEdge) => edge.node);

                if (filters.after) {
                    // Append for pagination
                    setCredits(prev => [...prev, ...newCredits]);
                } else {
                    // Replace for new search
                    setCredits(newCredits);
                }

                setPageInfo(response.data.pageInfo);
                setTotalCount(response.data.totalCount || 0);

                // Calculate summary statistics
                const customerMap = new Map();
                newCredits.forEach((credit: CustomerCredit) => {
                    const customerId = credit.customer.id;
                    if (!customerMap.has(customerId)) {
                        customerMap.set(customerId, {
                            customer: credit.customer,
                            totalAmount: 0,
                            transactionCount: 0,
                            latestBalance: credit.balanceAfter,
                            lastTransaction: credit.createdAt,
                        });
                    }

                    const customerData = customerMap.get(customerId);
                    customerData.totalAmount += credit.amount;
                    customerData.transactionCount += 1;

                    // Update latest balance and transaction if this is more recent
                    if (new Date(credit.createdAt) > new Date(customerData.lastTransaction)) {
                        customerData.latestBalance = credit.balanceAfter;
                        customerData.lastTransaction = credit.createdAt;
                    }
                });

                const summaryData: CustomerCreditSummary = {
                    totalAmount: newCredits.reduce((sum: number, credit: CustomerCredit) => sum + credit.amount, 0),
                    totalCount: newCredits.length,
                    customers: Array.from(customerMap.values()).sort((a, b) => b.totalAmount - a.totalAmount),
                };

                setSummary(summaryData);
            } else {
                setError(response.error || 'Failed to fetch customer credits');
                setCredits([]);
                setSummary(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setCredits([]);
            setSummary(null);
        } finally {
            setIsLoading(false);
        }
    }, [props.transactionType, props.customerId, props.dateFrom, props.dateTo]);

    const loadMore = useCallback(async () => {
        if (!pageInfo.hasNextPage || isLoading) return;

        await fetchCustomerCredits({
            after: pageInfo.endCursor,
        });
    }, [pageInfo.hasNextPage, pageInfo.endCursor, isLoading, fetchCustomerCredits]);

    const refresh = useCallback(() => {
        fetchCustomerCredits();
    }, [fetchCustomerCredits]);

    const filterByTransactionType = useCallback((transactionType: 'CREDIT_USED' | 'CREDIT_EARNED' | 'DEBT_INCURRED') => {
        fetchCustomerCredits({ transactionType });
    }, [fetchCustomerCredits]);

    const filterByCustomer = useCallback((customerId: string) => {
        fetchCustomerCredits({ customerId });
    }, [fetchCustomerCredits]);

    const filterByDateRange = useCallback((dateFrom: string, dateTo: string) => {
        fetchCustomerCredits({ dateFrom, dateTo });
    }, [fetchCustomerCredits]);

    return {
        credits,
        pageInfo,
        totalCount,
        isLoading,
        error,
        summary,
        fetchCustomerCredits,
        loadMore,
        refresh,
        filterByTransactionType,
        filterByCustomer,
        filterByDateRange,
        hasNextPage: pageInfo.hasNextPage,
        isEmpty: !isLoading && credits.length === 0,
    };
};

export default useCustomerCredits;
