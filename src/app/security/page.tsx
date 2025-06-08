"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
  AlertTriangle,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const SecurityPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = () => {
    console.log("Changing password...");
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <ProtectedRoute requiredPermission="MANAGE_USERS">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Security Settings
                  </h1>
                  <p className="text-sm text-orange-600">
                    Manage your account security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Security Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="p-6 border-b border-orange-100">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Security Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Monitor your account security status
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          Password Strong
                        </p>
                        <p className="text-sm text-green-700">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">
                          2FA Disabled
                        </p>
                        <p className="text-sm text-yellow-700">
                          Enable for better security
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          Account Secure
                        </p>
                        <p className="text-sm text-green-700">
                          No suspicious activity
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="p-6 border-b border-orange-100">
                <div className="flex items-center space-x-3">
                  <Key className="w-6 h-6 text-orange-600" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Change Password
                    </h2>
                    <p className="text-sm text-gray-600">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="p-6 border-b border-orange-100">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6 text-orange-600" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg mb-6">
                  <div>
                    <p className="font-medium text-gray-900">Enable 2FA</p>
                    <p className="text-sm text-gray-600">
                      {twoFactorEnabled
                        ? "Two-factor authentication is enabled"
                        : "Secure your account with two-factor authentication"}
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={twoFactorEnabled}
                    onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  />
                </div>

                {twoFactorEnabled && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">
                            2FA Enabled
                          </p>
                          <p className="text-sm text-green-700">
                            Your account is protected with two-factor
                            authentication
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                        View Backup Codes
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                        Reset 2FA
                      </button>
                    </div>
                  </div>
                )}

                {!twoFactorEnabled && (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">
                            Enable 2FA for Better Security
                          </p>
                          <p className="text-sm text-yellow-700">
                            Protect your account from unauthorized access
                          </p>
                        </div>
                      </div>
                    </div>

                    <button className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors">
                      Set Up 2FA
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Login Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="p-6 border-b border-orange-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Login Activity
                </h2>
                <p className="text-sm text-gray-600">
                  Monitor recent access to your account
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Current Session
                      </p>
                      <p className="text-sm text-gray-600">
                        Chrome on macOS • Lagos, Nigeria
                      </p>
                      <p className="text-xs text-gray-500">Today, 9:30 AM</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Previous Session
                      </p>
                      <p className="text-sm text-gray-600">
                        Safari on iPhone • Lagos, Nigeria
                      </p>
                      <p className="text-xs text-gray-500">
                        Yesterday, 6:45 PM
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      Report
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Previous Session
                      </p>
                      <p className="text-sm text-gray-600">
                        Chrome on Windows • Abuja, Nigeria
                      </p>
                      <p className="text-xs text-gray-500">
                        3 days ago, 2:15 PM
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SecurityPage;
