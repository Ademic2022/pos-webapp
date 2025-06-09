"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "@/interfaces/interface";
import { PermissionType } from "@/types/types";
import { loggedInUser } from "@/data/user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize with logged-in user data
    // In a real app, this would check localStorage, cookies, or make an API call
    setUser(loggedInUser);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // In a real app, you'd also store in localStorage or cookies
  };

  const logout = () => {
    setUser(null);
    // In a real app, you'd also clear localStorage or cookies
  };

  const checkPermission = (permission: PermissionType): boolean => {
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
      ];
      return staffPermissions.includes(permission);
    }

    // Regular users have very limited permissions
    const regularUserPermissions: PermissionType[] = [
      "VIEW_REPORTS", // Basic reports only
    ];
    return regularUserPermissions.includes(permission);
  };

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
