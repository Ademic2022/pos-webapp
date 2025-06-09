"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRouteProps } from "@/interfaces/interface";
import { ShieldX, Lock } from "lucide-react";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireSuperuser = false,
  requireStaff = false,
  requiredPermission,
  fallback,
}) => {
  const { user, isSuperuser, isStaff, checkPermission } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access this page.
          </p>
          <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check superuser requirement
  if (requireSuperuser && !isSuperuser) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Superuser Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have sufficient permissions to access this page.
              Only superusers can view this content.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>Current user:</strong> {user.name}
                <br />
                <strong>Role:</strong>{" "}
                {isSuperuser ? "Superuser" : isStaff ? "Staff" : "Regular User"}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  // Check staff requirement
  if (requireStaff && !isStaff && !isSuperuser) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-yellow-100 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Staff Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need staff-level permissions to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  // Check specific permission requirement
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-orange-100 p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Insufficient Permissions
            </h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have the required permission:{" "}
              <strong>{requiredPermission}</strong>
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
