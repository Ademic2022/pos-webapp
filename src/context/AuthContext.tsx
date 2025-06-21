"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, AuthContextType } from "@/interfaces/interface";
import { PermissionType } from "@/types/types";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication on app load
    const initializeAuth = async () => {
      try {
        const userData = await authService.initializeAuth();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    router.push("/signin");
  }, [router]);

  const checkPermission = useCallback(
    (permission: PermissionType): boolean => {
      if (!user) return false;

      // Superusers have access to everything
      if (user.is_superuser) return true;

      // Staff permissions (more restrictive)
      if (user.is_staff) {
        const staffPermissions: PermissionType[] = [
          "VIEW_REPORTS",
          "EDIT_CUSTOMER_DETAILS",
          "PROCESS_RETURNS",
          "MANAGE_STOCK",
          "NEW_SALE",
          "SECURITY_SETTINGS",
        ];
        return staffPermissions.includes(permission);
      }

      // Regular users have very limited permissions
      const regularUserPermissions: PermissionType[] = [
        "VIEW_REPORTS", // Basic reports only
      ];
      return regularUserPermissions.includes(permission);
    },
    [user]
  );

  const isAuthenticated = !!user;
  const isSuperuser = user?.is_superuser || false;
  const isStaff = user?.is_staff || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSuperuser,
        isStaff,
        login,
        logout,
        checkPermission,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { PermissionType };
