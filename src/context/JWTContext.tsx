/**
 * JWT Authentication Context with Centralized Token Management
 *
 * This context provides centralized JWT token management with automatic refresh
 * for the entire application. It wraps the enhanced GraphQL client and provides
 * a consistent interface for all components.
 */

"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { enhancedGraphqlClient } from "@/lib/enhancedGraphqlClient";

interface JWTContextType {
  /**
   * Make a GraphQL request with automatic token refresh
   */
  request: <T = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ) => Promise<T>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => Promise<boolean>;

  /**
   * Set authentication token
   */
  setAuthToken: (token: string) => void;

  /**
   * Clear authentication token
   */
  clearAuthToken: () => void;

  /**
   * Current authentication state
   */
  authState: {
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  };

  /**
   * Manually trigger token refresh
   */
  refreshToken: () => Promise<boolean>;
}

const JWTContext = createContext<JWTContextType | undefined>(undefined);

interface JWTProviderProps {
  children: ReactNode;
}

/**
 * JWT Provider component that wraps the app with centralized token management
 */
export function JWTProvider({ children }: JWTProviderProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    error: null as string | null,
  });

  /**
   * Initialize authentication state and setup periodic token checks
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      try {
        const authService = await import("@/services/authService").then(
          (m) => m.authService
        );

        // Try to restore user from stored tokens
        const user = await authService.initializeAuth();

        if (user) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, [router]);

  /**
   * Enhanced request method with centralized error handling
   */
  const request = useCallback(
    async <T = unknown,>(
      query: string,
      variables?: Record<string, unknown>
    ): Promise<T> => {
      try {
        // Clear any previous errors
        setAuthState((prev) => ({ ...prev, error: null }));

        // Make request through enhanced client
        const result = await enhancedGraphqlClient.request<T>(query, variables);

        // Update auth state if request was successful
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          error: null,
        }));

        return result;
      } catch (error) {
        console.error("JWT Context - Request error:", error);

        // Handle authentication errors
        if (error instanceof Error) {
          if (
            error.message?.includes("401") ||
            error.message?.includes("Unauthorized") ||
            error.message?.includes("signature has expired")
          ) {
            console.log(
              "JWT Context - Authentication error, redirecting to login"
            );

            setAuthState({
              isLoading: false,
              isAuthenticated: false,
              error: "Session expired. Please sign in again.",
            });

            // Clear stored tokens
            enhancedGraphqlClient.clearAuthToken();
            if (typeof window !== "undefined") {
              localStorage.removeItem("pos_auth_token");
              localStorage.removeItem("pos_refresh_token");
            }

            // Redirect to login
            router.push("/signin?error=session_expired");
            throw new Error("Session expired. Please sign in again.");
          }
        }

        // Re-throw the error for component-level handling
        throw error;
      }
    },
    [router]
  );

  /**
   * Check authentication status
   */
  const isAuthenticated = useCallback(async (): Promise<boolean> => {
    try {
      const authenticated = await enhancedGraphqlClient.isAuthenticated();
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: authenticated,
      }));
      return authenticated;
    } catch (error) {
      console.warn("Error checking authentication:", error);
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
      }));
      return false;
    }
  }, []);

  /**
   * Set authentication token
   */
  const setAuthToken = useCallback((token: string) => {
    enhancedGraphqlClient.setAuthToken(token);
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: true,
      error: null,
    }));
  }, []);

  /**
   * Clear authentication token
   */
  const clearAuthToken = useCallback(() => {
    enhancedGraphqlClient.clearAuthToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("pos_auth_token");
      localStorage.removeItem("pos_refresh_token");
    }
    setAuthState({
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  /**
   * Manually trigger token refresh
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      // Simple check - try to make a basic request to test connectivity
      await enhancedGraphqlClient.request("{ __typename }");

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error("Manual token refresh failed:", error);
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        error: "Session expired. Please sign in again.",
      });

      // Redirect to login
      router.push("/signin?error=session_expired");
      return false;
    }
  }, [router]);

  const contextValue: JWTContextType = {
    request,
    isAuthenticated,
    setAuthToken,
    clearAuthToken,
    authState,
    refreshToken,
  };

  return (
    <JWTContext.Provider value={contextValue}>{children}</JWTContext.Provider>
  );
}

/**
 * Hook to use JWT context
 */
export function useJWT(): JWTContextType {
  const context = useContext(JWTContext);
  if (context === undefined) {
    throw new Error("useJWT must be used within a JWTProvider");
  }
  return context;
}

/**
 * Hook for components that need GraphQL requests with automatic token refresh
 */
export function useGraphQLRequest() {
  const { request } = useJWT();
  return { request };
}

/**
 * Hook for authentication state management
 */
export function useAuthState() {
  const { authState, isAuthenticated, refreshToken } = useJWT();
  return { authState, isAuthenticated, refreshToken };
}
