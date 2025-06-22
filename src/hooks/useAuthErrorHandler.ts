/**
 * React Hook for Authentication Error Handling
 * 
 * This hook provides utilities for handling authentication errors
 * and token refresh in React components.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientError } from 'graphql-request';
import { authService } from '@/services/authService';
import { enhancedGraphqlClient } from '@/lib/enhancedGraphqlClient';

interface AuthErrorHandlerOptions {
  redirectOnAuthFailure?: boolean;
  onAuthError?: (error: Error) => void;
  onTokenRefreshed?: (newToken: string) => void;
}

export function useAuthErrorHandler(options: AuthErrorHandlerOptions = {}) {
  const router = useRouter();
  const {
    redirectOnAuthFailure = true,
    onAuthError,
    onTokenRefreshed,
  } = options;

  /**
   * Handle authentication errors
   */
  const handleAuthError = useCallback((error: unknown) => {
    console.error('Authentication error:', error);
    
    // Call custom error handler if provided
    if (onAuthError && error instanceof Error) {
      onAuthError(error);
    }

    // Check if this is a token expiration error that couldn't be resolved
    const isAuthError = (error instanceof Error && error.message?.includes('Authentication failed')) ||
                       (error instanceof Error && error.message?.includes('Unable to refresh token')) ||
                       (error instanceof ClientError && error.response?.errors?.[0]?.extensions?.code === 'UNAUTHENTICATED');

    if (isAuthError && redirectOnAuthFailure) {
      // Clear any stored auth data
      authService.logout();
      
      // Redirect to login page
      router.push('/signin?error=session_expired');
    }
  }, [onAuthError, redirectOnAuthFailure, router]);

  /**
   * Execute a GraphQL request with enhanced error handling
   */
  const executeRequest = useCallback(async <T = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> => {
    try {
      const result = await enhancedGraphqlClient.request<T>(query, variables);
      return result;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, [handleAuthError]);

  /**
   * Check if the user is currently authenticated
   */
  const isAuthenticated = useCallback(async (): Promise<boolean> => {
    return await enhancedGraphqlClient.isAuthenticated();
  }, []);

  /**
   * Manually trigger a token refresh
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const result = await authService.refreshAuthToken();
      
      if (result.success && result.token) {
        if (onTokenRefreshed) {
          onTokenRefreshed(result.token);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      handleAuthError(error);
      return false;
    }
  }, [handleAuthError, onTokenRefreshed]);

  return {
    executeRequest,
    handleAuthError,
    isAuthenticated,
    refreshToken,
  };
}

/**
 * Hook for components that need to handle authentication state changes
 */
export function useAuthState() {
  const { isAuthenticated, handleAuthError } = useAuthErrorHandler();
  const [authStatus, setAuthStatus] = useState<boolean>(false);

  // Update auth status on mount and whenever needed
  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = await isAuthenticated();
      setAuthStatus(authenticated);
    };
    
    checkAuthStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    // Set up a periodic check for token validity (every 5 minutes)
    const interval = setInterval(async () => {
      const authenticated = await isAuthenticated();
      setAuthStatus(authenticated);
      
      if (authenticated) {
        try {
          // Try to verify the current token
          const token = authService.getStoredToken();
          if (token) {
            await authService.verifyToken(token);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          console.log('Token verification failed during periodic check');
          // The enhanced client will handle the refresh automatically
          // if the token is expired but refresh token is still valid
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    isAuthenticated: authStatus,
    handleAuthError,
  };
}
