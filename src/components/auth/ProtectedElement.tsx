"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedElementProps } from "@/interfaces/interface";

const ProtectedElement: React.FC<ProtectedElementProps> = ({
  children,
  requireSuperuser = false,
  requireStaff = false,
  requiredPermission,
  fallback,
  hideIfNoAccess = true,
}) => {
  const { user, isSuperuser, isStaff, checkPermission } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return hideIfNoAccess ? null : fallback || null;
  }

  // Check superuser requirement
  if (requireSuperuser && !isSuperuser) {
    return hideIfNoAccess ? null : fallback || null;
  }

  // Check staff requirement
  if (requireStaff && !isStaff && !isSuperuser) {
    return hideIfNoAccess ? null : fallback || null;
  }

  // Check specific permission requirement
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return hideIfNoAccess ? null : fallback || null;
  }

  return <>{children}</>;
};

export default ProtectedElement;
