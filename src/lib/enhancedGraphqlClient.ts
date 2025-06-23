/**
 * Enhanced GraphQL Client with JWT Token Management
 * 
 * This module provides a simplified GraphQL client with basic JWT token handling.
 * Features:
 * - Automatic authorization header management
 * - Token storage and retrieval
 * - Basic authentication status checking
 */

import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'http://127.0.0.1:8000/graphql/';

// Simple GraphQL client instance
const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple wrapper with request method
export const enhancedGraphqlClient = {
  async request<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return client.request<T>(query, variables);
  },
  
  setAuthToken(token: string) {
    client.setHeader('Authorization', `Bearer ${token}`);
  },
  
  clearAuthToken() {
    client.setHeader('Authorization', '');
  },
  
  async isAuthenticated(): Promise<boolean> {
    // Simple check - if we're in browser environment and have a token
    if (typeof window === 'undefined') return false;
    
    try {
      const token = localStorage.getItem('pos_auth_token');
      return !!token;
    } catch {
      return false;
    }
  }
};

// Backward compatibility exports
export const setAuthToken = (token: string) => enhancedGraphqlClient.setAuthToken(token);
export const clearAuthToken = () => enhancedGraphqlClient.clearAuthToken();
