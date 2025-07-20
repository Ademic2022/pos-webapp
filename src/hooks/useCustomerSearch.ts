/**
 * Custom hook for searchable customer selection
 * Handles large datasets with pagination, search, and caching
 */

import { useState, useEffect, useCallback } from 'react';
import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';
import { SEARCH_CUSTOMERS_FOR_FILTER } from '@/lib/graphql';

interface Customer {
    id: string;
    name: string;
    phone?: string;
    type: 'RETAIL' | 'WHOLESALE';
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

interface CustomerSearchResult {
    customers: Customer[];
    hasNextPage: boolean;
    isLoading: boolean;
    error: string | null;
    searchTerm: string;
    loadMore: () => Promise<void>;
    search: (term: string) => void;
    clear: () => void;
}

// Cache for search results
const searchCache = new Map<string, {
    customers: Customer[];
    hasNextPage: boolean;
    cursor?: string;
    timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCustomerSearch(): CustomerSearchResult {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Generate cache key
    const getCacheKey = useCallback((term: string, afterCursor?: string) => {
        return `${term.toLowerCase().trim()}:${afterCursor || 'start'}`;
    }, []);

    // Check if cache is valid
    const isValidCache = useCallback((cacheEntry: {
        customers: Customer[];
        hasNextPage: boolean;
        cursor?: string;
        timestamp: number;
    }) => {
        return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
    }, []);

    // Fetch customers from API
    const fetchCustomers = useCallback(async (
        searchQuery: string = '',
        afterCursor?: string,
        append = false
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const cacheKey = getCacheKey(searchQuery, afterCursor);
            const cachedResult = searchCache.get(cacheKey);

            // Use cache if valid
            if (cachedResult && isValidCache(cachedResult) && !append) {
                setCustomers(cachedResult.customers);
                setHasNextPage(cachedResult.hasNextPage);
                setCursor(cachedResult.cursor || null);
                setIsLoading(false);
                return;
            }

            const variables: {
                first: number;
                after?: string;
                name_Icontains?: string;
                status: string;
            } = {
                first: 20,
                after: afterCursor,
                status: 'ACTIVE',
            };

            // Add search term if provided
            if (searchQuery.trim()) {
                variables.name_Icontains = searchQuery.trim();
            }

            const response = await enhancedGraphqlClient.request<{
                customers: {
                    edges: Array<{ node: Customer }>;
                    pageInfo: {
                        hasNextPage: boolean;
                        endCursor: string;
                    };
                };
            }>(SEARCH_CUSTOMERS_FOR_FILTER, variables);

            const newCustomers = response.customers.edges.map(edge => edge.node);
            const newHasNextPage = response.customers.pageInfo.hasNextPage;
            const newCursor = response.customers.pageInfo.endCursor;

            // Update state
            if (append) {
                setCustomers(prev => [...prev, ...newCustomers]);
            } else {
                setCustomers(newCustomers);
            }

            setHasNextPage(newHasNextPage);
            setCursor(newCursor);

            // Cache the results
            searchCache.set(cacheKey, {
                customers: append ? [...customers, ...newCustomers] : newCustomers,
                hasNextPage: newHasNextPage,
                cursor: newCursor,
                timestamp: Date.now(),
            });

        } catch (err) {
            console.error('Error fetching customers:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch customers');
        } finally {
            setIsLoading(false);
        }
    }, [getCacheKey, isValidCache, customers]);

    // Debounced search function
    const search = useCallback((term: string) => {
        setSearchTerm(term);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const newTimeout = setTimeout(() => {
            setCursor(null);
            fetchCustomers(term);
        }, 600); // 600ms delay

        setSearchTimeout(newTimeout);
    }, [searchTimeout, fetchCustomers]);

    // Load more customers (pagination)
    const loadMore = useCallback(async () => {
        if (hasNextPage && cursor && !isLoading) {
            await fetchCustomers(searchTerm, cursor, true);
        }
    }, [hasNextPage, cursor, isLoading, searchTerm, fetchCustomers]);

    // Clear search results
    const clear = useCallback(() => {
        setCustomers([]);
        setSearchTerm('');
        setHasNextPage(false);
        setCursor(null);
        setError(null);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
            setSearchTimeout(null);
        }
    }, [searchTimeout]);

    // Initial load of customers (first 20, no search)
    useEffect(() => {
        fetchCustomers('');
    }, [fetchCustomers]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    return {
        customers,
        hasNextPage,
        isLoading,
        error,
        searchTerm,
        loadMore,
        search,
        clear,
    };
}
