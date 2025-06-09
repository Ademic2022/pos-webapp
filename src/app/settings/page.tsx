"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Settings, User, Bell, Shield, Palette } from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const SettingsPage: React.FC = () => {
  const settingsSections = [
    {
      icon: User,
      title: "Account Settings",
      description: "Manage your personal information and account details",
      href: "/profile",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure email, SMS, and in-app notifications",
      href: "/notifications",
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Password, two-factor authentication, and privacy settings",
      href: "/security",
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Theme, language, and display preferences",
      href: "/appearance",
    },
  ];

  return (
    <ProtectedRoute requiredPermission="MANAGE_USERS">
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
                >
                  <Link
                    href="/"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </Link>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      delay: 2,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Settings
                    </h1>
                    <p className="text-sm text-orange-600">
                      Manage your account preferences
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="space-y-8">
            {/* Main Settings */}
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-orange-100"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{
                y: -5,
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
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{
                      delay: 3,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 6,
                    }}
                  >
                    <Settings className="w-6 h-6 text-orange-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Settings Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Configure your account and application preferences
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="p-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settingsSections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={section.href}
                          className="block p-6 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-colors"
                                whileHover={{ rotate: 15, scale: 1.1 }}
                              >
                                <Icon className="w-6 h-6 text-orange-600" />
                              </motion.div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-900">
                                {section.title}
                              </h3>
                              <p className="text-sm text-gray-600 group-hover:text-orange-700">
                                {section.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Quick Settings */}
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-orange-100"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              whileHover={{
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
              }}
            >
              <motion.div
                className="p-6 border-b border-orange-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <h2 className="text-lg font-medium text-gray-900">
                  Quick Settings
                </h2>
                <p className="text-sm text-gray-600">
                  Frequently accessed settings and toggles
                </p>
              </motion.div>
              <motion.div
                className="p-6 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <motion.div
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive email updates about your account
                    </p>
                  </div>
                  <motion.button
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"
                      whileHover={{ scale: 1.1 }}
                    />
                  </motion.button>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div>
                    <p className="font-medium text-gray-900">SMS Alerts</p>
                    <p className="text-sm text-gray-600">
                      Get important alerts via text message
                    </p>
                  </div>
                  <motion.button
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"
                      whileHover={{ scale: 1.1 }}
                    />
                  </motion.button>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.7, duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <motion.button
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"
                      whileHover={{ scale: 1.1 }}
                    />
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default SettingsPage;
