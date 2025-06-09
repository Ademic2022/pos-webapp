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
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      }`}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-md"
        animate={{
          x: enabled ? 24 : 4,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
      />
    </motion.button>
  );

  return (
    <ProtectedRoute requiredPermission="SECURITY_SETTINGS">
      <motion.div
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    href="/"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h1 className="text-xl font-bold text-gray-900">
                    Security Settings
                  </h1>
                  <p className="text-sm text-orange-600">
                    Manage your account security
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="space-y-8">
            {/* Security Overview */}
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-orange-100"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{
                y: -2,
                boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
              }}
            >
              <motion.div
                className="p-6 border-b border-orange-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      delay: 1,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                  >
                    <Shield className="w-6 h-6 text-orange-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Security Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Monitor your account security status
                    </p>
                  </div>
                </div>
              </motion.div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          delay: 2,
                          duration: 1,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <div>
                        <p className="font-medium text-green-900">
                          Password Strong
                        </p>
                        <p className="text-sm text-green-700">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{
                          delay: 2.5,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 4,
                        }}
                      >
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      </motion.div>
                      <div>
                        <p className="font-medium text-yellow-900">
                          2FA Disabled
                        </p>
                        <p className="text-sm text-yellow-700">
                          Enable for better security
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          delay: 3,
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 4,
                        }}
                      >
                        <Lock className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <div>
                        <p className="font-medium text-green-900">
                          Account Secure
                        </p>
                        <p className="text-sm text-green-700">
                          No suspicious activity
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Password Change */}
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-orange-100"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{
                y: -2,
                boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
              }}
            >
              <motion.div
                className="p-6 border-b border-orange-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      delay: 3.5,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 8,
                    }}
                  >
                    <Key className="w-6 h-6 text-orange-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Change Password
                    </h2>
                    <p className="text-sm text-gray-600">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="p-6 space-y-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your current password"
                      whileFocus={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                    <motion.button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence mode="wait">
                        {showCurrentPassword ? (
                          <motion.div
                            key="eyeoff"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EyeOff className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your new password"
                      whileFocus={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence mode="wait">
                        {showNewPassword ? (
                          <motion.div
                            key="eyeoff"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EyeOff className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Confirm your new password"
                      whileFocus={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                    <motion.button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence mode="wait">
                        {showConfirmPassword ? (
                          <motion.div
                            key="eyeoff"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EyeOff className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  className="p-4 bg-orange-50 rounded-lg"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Password Requirements:
                  </h4>
                  <motion.ul
                    className="text-sm text-gray-600 space-y-1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.7, duration: 0.5 }}
                  >
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </motion.ul>
                </motion.div>

                <motion.button
                  onClick={handlePasswordChange}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Update Password
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Two-Factor Authentication */}
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-orange-100"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.5 }}
              whileHover={{
                y: -2,
                boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
              }}
            >
              <motion.div
                className="p-6 border-b border-orange-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      delay: 4,
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 6,
                    }}
                  >
                    <Smartphone className="w-6 h-6 text-orange-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="p-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.1, duration: 0.5 }}
              >
                <motion.div
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg mb-6"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
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
                </motion.div>

                <AnimatePresence mode="wait">
                  {twoFactorEnabled && (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="p-4 bg-green-50 rounded-lg border border-green-200"
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </motion.div>
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
                      </motion.div>

                      <motion.div
                        className="flex space-x-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <motion.button
                          className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Backup Codes
                        </motion.button>
                        <motion.button
                          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Reset 2FA
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {!twoFactorEnabled && (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                          </motion.div>
                          <div>
                            <p className="font-medium text-yellow-900">
                              Enable 2FA for Better Security
                            </p>
                            <p className="text-sm text-yellow-700">
                              Protect your account from unauthorized access
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.button
                        className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Set Up 2FA
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Login Activity */}
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-orange-100"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.5 }}
              whileHover={{
                y: -2,
                boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
              }}
            >
              <motion.div
                className="p-6 border-b border-orange-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              >
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Login Activity
                </h2>
                <p className="text-sm text-gray-600">
                  Monitor recent access to your account
                </p>
              </motion.div>
              <motion.div
                className="p-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.6, duration: 0.5 }}
              >
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.7, duration: 0.5 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Current Session
                      </p>
                      <p className="text-sm text-gray-600">
                        Chrome on macOS • Lagos, Nigeria
                      </p>
                      <p className="text-xs text-gray-500">Today, 9:30 AM</p>
                    </div>
                    <motion.span
                      className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 4,
                      }}
                    >
                      Active
                    </motion.span>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.8, duration: 0.5 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
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
                    <motion.button
                      className="text-sm text-red-600 hover:text-red-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Report
                    </motion.button>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.9, duration: 0.5 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
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
                    <motion.button
                      className="text-sm text-red-600 hover:text-red-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Report
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default SecurityPage;
