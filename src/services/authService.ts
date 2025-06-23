import { graphqlClient, TOKEN_AUTH, VERIFY_TOKEN, REFRESH_TOKEN, UPDATE_ACCOUNT, VIEW_ME, setAuthToken, clearAuthToken } from '@/lib/graphql';
import { User } from '@/interfaces/interface';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UpdateAccountInput {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export interface UpdateAccountResponse {
  success: boolean;
  errors?: string[];
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface TokenMetadata {
  token: string;
  refreshToken: string;
  issuedAt: number; // timestamp when token was issued
  expiresAt: number; // timestamp when token expires
  storedAt: number; // timestamp when token was stored locally
  tokenType: 'access' | 'refresh'; // type of token for better management
}

export interface SecureTokenConfig {
  accessTokenExpiry: number; // 5-15 minutes for access tokens
  refreshTokenExpiry: number; // 7-30 days for refresh tokens
  useHttpOnlyCookies: boolean; // whether to use HttpOnly cookies for refresh tokens
  proactiveRefreshBuffer: number; // time before expiry to refresh (2 minutes default)
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  errors?: string[];
}

// GraphQL response types
interface TokenAuthResponse {
  tokenAuth: {
    token: string;
    success: boolean;
    refreshToken: string;
    errors: string[] | null;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
      phone: string;
      address: string;
      isSuperuser: boolean;
      isStaff: boolean;
    };
  };
}

interface VerifyTokenResponse {
  verifyToken: {
    success: boolean;
    errors: string[] | null;
    payload: {
      username: string;
      exp: number;
      origIat: number;
    };
  };
}

interface RefreshTokenResponse {
  refreshToken: {
    token: string;
    success: boolean;
    errors: string[] | null;
  };
}

interface UpdateAccountGraphQLResponse {
  updateAccount: {
    success: boolean;
    errors: string[] | null;
  };
}

class AuthService {
  private readonly TOKEN_KEY = 'pos_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'pos_refresh_token';
  private readonly USER_KEY = 'pos_user_data';
  private readonly TOKEN_METADATA_KEY = 'pos_token_metadata';
  
  // Security configuration for token management (on-demand refresh only)
  private readonly tokenConfig: SecureTokenConfig = {
    accessTokenExpiry: 15 * 60 * 1000, // 15 minutes
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    useHttpOnlyCookies: false, // Will be enabled when backend supports it
    proactiveRefreshBuffer: 0, // No proactive refresh - only on-demand
  };

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const variables: Record<string, unknown> = {
        username: credentials.username,
        password: credentials.password
      };
      const response = await graphqlClient.request(TOKEN_AUTH, variables) as TokenAuthResponse;
      const { tokenAuth } = response;

      if (tokenAuth.success && tokenAuth.token) {
        console.log("userId:", tokenAuth.user.id);
        
        const user: User = {
          id: parseInt(tokenAuth.user.id.replace(/\D/g, '')) || 1, // Extract numeric ID from GraphQL ID
          name: `${tokenAuth.user.firstName} ${tokenAuth.user.lastName}`.trim() || tokenAuth.user.username,
          email: tokenAuth.user.email,
          username: tokenAuth.user.username,
          phone: tokenAuth.user.phone || '',
          address: tokenAuth.user.address || '',
          is_staff: tokenAuth.user.isStaff,
          is_superuser: tokenAuth.user.isSuperuser,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        const tokens: AuthTokens = {
          token: tokenAuth.token,
          refreshToken: tokenAuth.refreshToken,
        };

        // Store tokens and user data with metadata
        this.storeTokensWithMetadata(tokens);
        this.storeUser(user);
        
        // Set authorization header for future requests
        setAuthToken(tokens.token);

        return {
          success: true,
          user,
          tokens,
        };
      } else {
        return {
          success: false,
          errors: tokenAuth.errors || ['Login failed'],
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        errors: ['Network error or server unavailable'],
      };
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await graphqlClient.request(VERIFY_TOKEN, { token }) as VerifyTokenResponse;
      const { verifyToken } = response;

      if (verifyToken.success) {
        // Since verifyToken doesn't return user info, get it from stored data
        const storedUser = this.getStoredUser();
        if (storedUser) {
          return { valid: true, user: storedUser };
        } else {
          // If no stored user, token is valid but we need to fetch user info separately
          // For now, we'll return valid: true without user info
          return { valid: true };
        }
      }

      return { valid: false };
    } catch (error: unknown) {
      console.error('Token verification error:', error);
      
      // Check if it's a JWT expiration error
      if (error && typeof error === 'object' && 'response' in error) {
        const graphqlError = error as { response?: { errors?: Array<{ message?: string }> } };
        if (graphqlError.response?.errors?.[0]?.message?.includes('expired') || 
            graphqlError.response?.errors?.[0]?.message?.includes('Signature has expired')) {
          console.log('Token has expired, will attempt refresh...');
        }
      }
      
      return { valid: false };
    }
  }

  async refreshAuthToken(): Promise<{ success: boolean; token?: string }> {
    const refreshToken = this.getRefreshTokenSecurely();
    if (!refreshToken) {
      console.warn('No refresh token available for refresh');
      return { success: false };
    }

    try {
      const response = await graphqlClient.request(REFRESH_TOKEN, { refreshToken }) as RefreshTokenResponse;
      const { refreshToken: refreshResponse } = response;

      if (refreshResponse.success && refreshResponse.token) {
        // Update stored access token with metadata
        const newTokens: AuthTokens = {
          token: refreshResponse.token,
          refreshToken: refreshToken, // Keep the same refresh token
        };
        this.storeTokensWithMetadata(newTokens);
        
        setAuthToken(refreshResponse.token);

        console.log('Access token refreshed successfully');
        return { success: true, token: refreshResponse.token };
      } else {
        console.error('Token refresh failed:', refreshResponse.errors);
        return { success: false };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // If refresh fails, it might be due to expired refresh token
      // Clear all stored auth data and force re-login
      if (error && typeof error === 'object' && 'response' in error) {
        const graphqlError = error as { response?: { errors?: Array<{ message?: string }> } };
        const errorMessage = graphqlError.response?.errors?.[0]?.message?.toLowerCase() || '';
        
        if (errorMessage.includes('refresh token') && 
            (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
          console.log('Refresh token expired, clearing all auth data');
          this.logout();
        }
      }
      
      return { success: false };
    }
  }

  /**
   * Check if stored token is valid and not expired
   */
  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Add 30 second buffer to account for network delays
      return expirationTime > (currentTime + 30000);
    } catch (error) {
      console.warn('Error parsing token:', error);
      return false;
    }
  }

  /**
   * Extract token expiry timestamp from JWT
   */
  private getTokenExpiryTimestamp(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.warn('Error extracting token expiry:', error);
      return null;
    }
  }

  /**
   * Extract token issued at timestamp from JWT
   */
  private getTokenIssuedAtTimestamp(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.iat ? payload.iat * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.warn('Error extracting token issued at:', error);
      return null;
    }
  }

  /**
   * Store tokens with metadata timestamps
   */
  private storeTokensWithMetadata(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const expiresAt = this.getTokenExpiryTimestamp(tokens.token);
    const issuedAt = this.getTokenIssuedAtTimestamp(tokens.token);
    
    const metadata: TokenMetadata = {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      issuedAt: issuedAt || now,
      expiresAt: expiresAt || (now + 15 * 60 * 1000), // Default to 15 minutes for access tokens
      storedAt: now,
      tokenType: 'access', // Access tokens are stored in memory/localStorage
    };
    
    // Store access token in memory/localStorage (short-lived)
    localStorage.setItem(this.TOKEN_KEY, tokens.token);
    
    // Store refresh token securely (will be moved to HttpOnly cookies later)
    this.storeRefreshTokenSecurely(tokens.refreshToken);
    
    // Store metadata
    localStorage.setItem(this.TOKEN_METADATA_KEY, JSON.stringify(metadata));
  }

  /**
   * Get stored token metadata
   */
  getTokenMetadata(): TokenMetadata | null {
    if (typeof window === 'undefined') return null;
    const metadataStr = localStorage.getItem(this.TOKEN_METADATA_KEY);
    if (metadataStr) {
      try {
        return JSON.parse(metadataStr);
      } catch (error) {
        console.error('Error parsing token metadata:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Store refresh token securely
   * For now using localStorage, but this should be moved to HttpOnly cookies
   */
  private storeRefreshTokenSecurely(refreshToken: string): void {
    if (typeof window === 'undefined') return;
    
    if (this.tokenConfig.useHttpOnlyCookies) {
      // TODO: Implement HttpOnly cookie storage when backend supports it
      console.log('HttpOnly cookie storage not yet implemented, using localStorage');
    }
    
    // For now, store in localStorage with additional security metadata
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(`${this.REFRESH_TOKEN_KEY}_stored_at`, Date.now().toString());
  }

  /**
   * Get refresh token securely
   */
  private getRefreshTokenSecurely(): string | null {
    if (typeof window === 'undefined') return null;
    
    if (this.tokenConfig.useHttpOnlyCookies) {
      // TODO: Get from HttpOnly cookies when backend supports it
      return null;
    }
    
    const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const storedAt = localStorage.getItem(`${this.REFRESH_TOKEN_KEY}_stored_at`);
    
    if (token && storedAt) {
      const storedTimestamp = parseInt(storedAt);
      const now = Date.now();
      
      // Check if refresh token has expired (7 days)
      if (now - storedTimestamp > this.tokenConfig.refreshTokenExpiry) {
        console.log('Refresh token has expired, clearing stored data');
        this.clearRefreshToken();
        return null;
      }
      
      return token;
    }
    
    return null;
  }

  /**
   * Clear refresh token securely
   */
  private clearRefreshToken(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(`${this.REFRESH_TOKEN_KEY}_stored_at`);
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_METADATA_KEY);
    
    // Clear refresh token securely
    this.clearRefreshToken();
    
    // Clear authorization header
    clearAuthToken();
  }

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    // Use the secure method instead
    return this.getRefreshTokenSecurely();
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  }

  private storeTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private storeUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  async initializeAuth(): Promise<User | null> {
    if (typeof window === 'undefined') return null;

    const token = this.getStoredToken();
    if (!token) {
      console.log('No stored token found');
      return null;
    }

    // Check if token is still valid before using it
    if (!this.isTokenValid(token)) {
      console.log('Stored token is expired, attempting refresh...');
      
      // Try to refresh the token
      const refreshResult = await this.refreshAuthToken();
      if (!refreshResult.success) {
        console.log('Token refresh failed, clearing stored data');
        this.logout();
        return null;
      }
      
      // Use the new token
      const newToken = refreshResult.token;
      if (newToken) {
        setAuthToken(newToken);
      }
    } else {
      // Set the valid token for API requests
      setAuthToken(token);
    }

    // Get stored user data
    const storedUser = this.getStoredUser();
    if (storedUser) {
      console.log('User restored from stored data:', storedUser.username);
      return storedUser;
    }

    // If no stored user but we have a valid token, try to verify and get user info
    try {
      const verification = await this.verifyToken(token);
      if (verification.valid && verification.user) {
        return verification.user;
      }
    } catch (error) {
      console.warn('Token verification failed during initialization:', error);
    }

    // If everything fails, clear stored data
    this.logout();
    return null;
  }

  async updateAccount(updateData: UpdateAccountInput): Promise<UpdateAccountResponse> {
    try {
      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([value]) => value !== undefined && value !== '')
      );

      const response = await graphqlClient.request(UPDATE_ACCOUNT, filteredData) as UpdateAccountGraphQLResponse;
      const { updateAccount } = response;

      if (updateAccount.success) {
        // If update is successful, fetch fresh user data from server
        try {
          interface ViewMeResponse {
            viewMe: {
              firstName: string;
              lastName: string;
              phone: string;
              address: string;
              email: string;
              username: string;
            };
          }

          const profileResponse = await graphqlClient.request(VIEW_ME) as ViewMeResponse;
          const storedUser = this.getStoredUser();
          
          if (storedUser) {
            // Update stored user with fresh data from server
            const updatedUser: User = {
              ...storedUser,
              name: `${profileResponse.viewMe.firstName} ${profileResponse.viewMe.lastName}`.trim(),
              email: profileResponse.viewMe.email,
              phone: profileResponse.viewMe.phone,
              address: profileResponse.viewMe.address,
            };
            
            this.storeUser(updatedUser);
          }
        } catch (fetchError) {
          console.warn('Failed to fetch updated profile data:', fetchError);
          // Continue with success even if profile fetch fails
        }

        return {
          success: true,
        };
      } else {
        return {
          success: false,
          errors: updateAccount.errors || ['Update failed'],
        };
      }
    } catch (error) {
      console.error('Update account error:', error);
      return {
        success: false,
        errors: ['Network error or server unavailable'],
      };
    }
  }
}

export const authService = new AuthService();
