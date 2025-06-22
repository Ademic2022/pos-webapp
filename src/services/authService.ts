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

        // Store tokens and user data
        this.storeTokens(tokens);
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
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return { success: false };
    }

    try {
      const response = await graphqlClient.request(REFRESH_TOKEN, { refreshToken }) as RefreshTokenResponse;
      const { refreshToken: refreshResponse } = response;

      if (refreshResponse.success && refreshResponse.token) {
        // Update stored token
        localStorage.setItem(this.TOKEN_KEY, refreshResponse.token);
        setAuthToken(refreshResponse.token);

        return { success: true, token: refreshResponse.token };
      }

      return { success: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Clear authorization header
    clearAuthToken();
  }

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
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
    const token = this.getStoredToken();
    if (!token) {
      return null;
    }

    // Set the token for API requests
    setAuthToken(token);

    // Verify the token is still valid
    const verification = await this.verifyToken(token);
    if (verification.valid && verification.user) {
      return verification.user;
    }

    // Try to refresh the token
    const refreshResult = await this.refreshAuthToken();
    if (refreshResult.success && refreshResult.token) {
      const newVerification = await this.verifyToken(refreshResult.token);
      if (newVerification.valid && newVerification.user) {
        return newVerification.user;
      }
    }

    // If both verification and refresh failed, clear stored data
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
