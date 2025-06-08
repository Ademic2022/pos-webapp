"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Settings, User, Bell, Shield, Palette } from "lucide-react";
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
                  <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                  <p className="text-sm text-orange-600">
                    Manage your account preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Main Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="p-6 border-b border-orange-100">
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-orange-600" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Settings Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Configure your account and application preferences
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settingsSections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <Link
                        key={index}
                        href={section.href}
                        className="block p-6 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
                              <Icon className="w-6 h-6 text-orange-600" />
                            </div>
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
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="p-6 border-b border-orange-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Quick Settings
                </h2>
                <p className="text-sm text-gray-600">
                  Frequently accessed settings and toggles
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive email updates about your account
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">SMS Alerts</p>
                    <p className="text-sm text-gray-600">
                      Get important alerts via text message
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage;
