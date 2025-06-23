/**
 * JWT Token Error Handling Utilities
 * 
 * This module provides utilities for handling JWT token errors across the application
 */

import { ClientError } from 'graphql-request';

export interface TokenError {
  type: 'expired' | 'invalid' | 'missing' | 'refresh_expired' | 'unknown';
  message: string;
  canRetry: boolean;
}

/**
 * Analyze an error to determine if it's token-related and what type
 */
export function analyzeTokenError(error: unknown): TokenError | null {
  if (!error) {
    return null;
  }

  let errorMessage = '';
  
  // Handle different error types
  if (error instanceof ClientError) {
    errorMessage = error.response?.errors?.[0]?.message?.toLowerCase() || '';
  } else if (error instanceof Error && error.message) {
    errorMessage = error.message.toLowerCase();
  } else if (typeof error === 'string') {
    errorMessage = error.toLowerCase();
  }

  // Check for specific token error patterns
  if (errorMessage.includes('signature has expired') || 
      errorMessage.includes('token has expired')) {
    return {
      type: 'expired',
      message: 'Your session has expired. Attempting to refresh...',
      canRetry: true,
    };
  }

  if (errorMessage.includes('error decoding signature') ||
      errorMessage.includes('token is invalid') ||
      errorMessage.includes('invalid token')) {
    return {
      type: 'invalid',
      message: 'Invalid authentication token. Please sign in again.',
      canRetry: false,
    };
  }

  if (errorMessage.includes('refresh token') && 
      (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
    return {
      type: 'refresh_expired',
      message: 'Session cannot be renewed. Please sign in again.',
      canRetry: false,
    };
  }

  if (errorMessage.includes('authentication failed') ||
      errorMessage.includes('unauthenticated') ||
      errorMessage.includes('unauthorized')) {
    return {
      type: 'missing',
      message: 'Authentication required. Please sign in.',
      canRetry: false,
    };
  }

  // Check for GraphQL authentication errors
  if (error instanceof ClientError) {
    const extensionCode = error.response?.errors?.[0]?.extensions?.code;
    if (extensionCode === 'UNAUTHENTICATED') {
      return {
        type: 'missing',
        message: 'Authentication required. Please sign in.',
        canRetry: false,
      };
    }
  }

  return null;
}

/**
 * Get a user-friendly error message for display
 */
export function getTokenErrorMessage(error: unknown): string {
  const tokenError = analyzeTokenError(error);
  
  if (tokenError) {
    return tokenError.message;
  }

  // Fallback for non-token errors
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if an error indicates that a retry might succeed
 */
export function canRetryAfterError(error: unknown): boolean {
  const tokenError = analyzeTokenError(error);
  return tokenError?.canRetry ?? true; // Default to true for non-token errors
}

/**
 * JWT Token Status Enum
 */
export enum TokenStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  MISSING = 'missing',
  REFRESH_EXPIRED = 'refresh_expired',
}

/**
 * Token validation result
 */
export interface TokenValidation {
  status: TokenStatus;
  message: string;
  shouldRefresh: boolean;
  shouldLogout: boolean;
}

/**
 * Validate token status based on error
 */
export function validateTokenFromError(error: unknown): TokenValidation {
  const tokenError = analyzeTokenError(error);

  if (!tokenError) {
    return {
      status: TokenStatus.VALID,
      message: 'Token is valid',
      shouldRefresh: false,
      shouldLogout: false,
    };
  }

  switch (tokenError.type) {
    case 'expired':
      return {
        status: TokenStatus.EXPIRED,
        message: tokenError.message,
        shouldRefresh: true,
        shouldLogout: false,
      };

    case 'invalid':
      return {
        status: TokenStatus.INVALID,
        message: tokenError.message,
        shouldRefresh: false,
        shouldLogout: true,
      };

    case 'refresh_expired':
      return {
        status: TokenStatus.REFRESH_EXPIRED,
        message: tokenError.message,
        shouldRefresh: false,
        shouldLogout: true,
      };

    case 'missing':
      return {
        status: TokenStatus.MISSING,
        message: tokenError.message,
        shouldRefresh: false,
        shouldLogout: true,
      };

    default:
      return {
        status: TokenStatus.INVALID,
        message: 'Authentication error occurred',
        shouldRefresh: false,
        shouldLogout: true,
      };
  }
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): string {
  if (error instanceof ClientError) {
    return `GraphQL Error: ${JSON.stringify({
      message: error.message,
      errors: error.response?.errors,
      status: error.response?.status,
    }, null, 2)}`;
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack}`;
  }

  return `Unknown Error: ${JSON.stringify(error, null, 2)}`;
}
