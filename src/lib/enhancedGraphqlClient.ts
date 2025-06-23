/**
 * Enhanced GraphQL Client with Automatic JWT Token Refresh
 * 
 * This module provides seamless JWT token handling for GraphQL requests:
 * 1. Automatically refreshes expired access tokens using refresh tokens
 * 2. Retries failed requests after token refresh
 * 3. Handles authentication errors gracefully
 * 4. Provides centralized error handling for token-related issues
 */

import { GraphQLClient, ClientError } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'http://127.0.0.1:8000/graphql/';

// Lazy loading function to avoid circular dependency
const getAuthService = async () => {
  const { authService } = await import('@/services/authService');
  return authService;
};

// Token refresh mutation
const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      success
      errors
    }
  }
`;

interface RefreshTokenResponse {
  refreshToken: {
    token: string;
    success: boolean;
    errors: string[] | null;
  };
}

interface QueuedRequest<T = unknown> {
  query: string;
  variables?: Record<string, unknown>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

class EnhancedGraphQLClient {
  private client: GraphQLClient;
  private isRefreshing = false;
  private requestQueue: QueuedRequest<unknown>[] = [];

  constructor() {
    this.client = new GraphQLClient(GRAPHQL_ENDPOINT, {
      headers: {
        'Content-Type': 'application/json',
      },
      errorPolicy: 'all',
    });

    // Only initialize with stored token on client side
    if (typeof window !== 'undefined') {
      // Use setTimeout to avoid blocking the constructor
      setTimeout(() => {
        this.initializeWithStoredToken().catch((error) => {
          console.warn('Failed to initialize with stored token:', error);
        });
      }, 0);
    }
  }

  private async initializeWithStoredToken() {
    // Additional check to ensure we're in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const authService = await getAuthService();
      const token = authService.getStoredToken();
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      console.warn('Failed to initialize with stored token:', error);
    }
  }

  public setAuthToken(token: string) {
    this.client.setHeader('Authorization', `Bearer ${token}`);
  }

  public clearAuthToken() {
    this.client.setHeader('Authorization', '');
  }

  /**
   * Check if an error is due to token expiration
   */
  private isTokenExpiredError(error: unknown): boolean {
    if (error instanceof ClientError) {
      const errorMessage = error.response?.errors?.[0]?.message?.toLowerCase() || '';
      return (
        errorMessage.includes('signature has expired') ||
        errorMessage.includes('token has expired') ||
        errorMessage.includes('token is invalid') ||
        errorMessage.includes('error decoding signature') ||
        error.response?.errors?.[0]?.extensions?.code === 'UNAUTHENTICATED'
      );
    }
    return false;
  }

  /**
   * Check if an error indicates the refresh token is also expired
   */
  private isRefreshTokenExpiredError(error: unknown): boolean {
    if (error instanceof ClientError) {
      const errorMessage = error.response?.errors?.[0]?.message?.toLowerCase() || '';
      return (
        errorMessage.includes('refresh token') && 
        (errorMessage.includes('expired') || errorMessage.includes('invalid'))
      );
    }
    return false;
  }

  /**
   * Attempt to refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    // Don't attempt refresh during SSR
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const authService = await getAuthService();
      const refreshToken = authService.getRefreshToken();
      
      if (!refreshToken) {
        console.warn('No refresh token available');
        return null;
      }

      // Create a separate client for refresh requests to avoid infinite loops
      const refreshClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await refreshClient.request(
        REFRESH_TOKEN_MUTATION, 
        { refreshToken }
      ) as RefreshTokenResponse;

      if (response.refreshToken.success && response.refreshToken.token) {
        const newToken = response.refreshToken.token;
        
        // Store the new token (only in browser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('pos_auth_token', newToken);
        }
        
        // Update the client's authorization header
        this.setAuthToken(newToken);
        
        console.log('Access token refreshed successfully');
        return newToken;
      } else {
        console.error('Token refresh failed:', response.refreshToken.errors);
        return null;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // If refresh token is also expired, force logout
      if (this.isRefreshTokenExpiredError(error)) {
        console.log('Refresh token expired, forcing logout');
        try {
          const authService = await getAuthService();
          authService.logout();
        } catch (logoutError) {
          console.warn('Could not perform logout:', logoutError);
        }
        // Redirect to login page (only in browser)
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
      }
      
      return null;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private async processQueue(newToken: string | null) {
    const queue = [...this.requestQueue];
    this.requestQueue = [];

    for (const queuedRequest of queue) {
      try {
        if (newToken) {
          // Retry the request with the new token
          const result = await this.client.request(queuedRequest.query, queuedRequest.variables);
          queuedRequest.resolve(result);
        } else {
          // Token refresh failed, reject all queued requests
          queuedRequest.reject(new Error('Authentication failed: Unable to refresh token'));
        }
      } catch (error) {
        queuedRequest.reject(error instanceof Error ? error : new Error('Unknown error occurred'));
      }
    }
  }

  /**
   * Main request method with automatic token refresh
   */
  public async request<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    try {
      // Try the original request
      const result = await this.client.request<T>(query, variables);
      return result;
    } catch (error) {
      // Check if this is a token expiration error
      if (this.isTokenExpiredError(error)) {
        console.log('Token expired, attempting refresh...');

        // If we're already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            this.requestQueue.push({
              query,
              variables,
              resolve: resolve as (value: unknown) => void,
              reject,
            } as QueuedRequest<unknown>);
          });
        }

        // Set the refreshing flag
        this.isRefreshing = true;

        try {
          // Attempt to refresh the token
          const newToken = await this.refreshAccessToken();

          if (newToken) {
            // Process any queued requests
            await this.processQueue(newToken);

            // Retry the original request
            const result = await this.client.request<T>(query, variables);
            return result;
          } else {
            // Token refresh failed
            await this.processQueue(null);
            throw new Error('Authentication failed: Unable to refresh token');
          }
        } finally {
          this.isRefreshing = false;
        }
      }

      // If it's not a token error, or if we couldn't handle it, re-throw
      throw error;
    }
  }

  /**
   * Get the current authentication status
   */
  public async isAuthenticated(): Promise<boolean> {
    // Return false during SSR
    if (typeof window === 'undefined') return false;
    
    try {
      const authService = await getAuthService();
      const token = authService.getStoredToken();
      return !!token;
    } catch (error) {
      console.warn('Could not check authentication status:', error);
      return false;
    }
  }

  /**
   * Set headers for the GraphQL client
   */
  public setHeader(key: string, value: string) {
    this.client.setHeader(key, value);
  }

  /**
   * Get the underlying GraphQL client for advanced usage
   */
  public getClient(): GraphQLClient {
    return this.client;
  }
}

// Create and export the enhanced client instance
export const enhancedGraphqlClient = new EnhancedGraphQLClient();

// Export types for use in other modules
export type { QueuedRequest, RefreshTokenResponse };

// Backward compatibility exports
export const graphqlClient = enhancedGraphqlClient;
export const setAuthToken = (token: string) => enhancedGraphqlClient.setAuthToken(token);
export const clearAuthToken = () => enhancedGraphqlClient.clearAuthToken();
