"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
} from "lucide-react";

const NotificationsPage: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [salesAlerts, setSalesAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [returnAlerts, setReturnAlerts] = useState(true);

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
                  Notifications
                </h1>
                <p className="text-sm text-orange-600">
                  Manage your notification preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Notification Methods */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-orange-600" />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Notification Methods
                  </h2>
                  <p className="text-sm text-gray-600">
                    Select your preferred notification channels
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      SMS Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Get alerts via text message
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={smsNotifications}
                  onChange={() => setSmsNotifications(!smsNotifications)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Push Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive push notifications in the app
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                />
              </div>
            </div>
          </div>

          {/* Alert Types */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <h2 className="text-lg font-medium text-gray-900">Alert Types</h2>
              <p className="text-sm text-gray-600">
                Choose which events you want to be notified about
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sales Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified about new sales and transactions
                  </p>
                </div>
                <ToggleSwitch
                  enabled={salesAlerts}
                  onChange={() => setSalesAlerts(!salesAlerts)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Stock Alerts</p>
                  <p className="text-sm text-gray-600">
                    Receive notifications when stock is low or out
                  </p>
                </div>
                <ToggleSwitch
                  enabled={stockAlerts}
                  onChange={() => setStockAlerts(!stockAlerts)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Return Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified about product returns and refunds
                  </p>
                </div>
                <ToggleSwitch
                  enabled={returnAlerts}
                  onChange={() => setReturnAlerts(!returnAlerts)}
                />
              </div>
            </div>
          </div>

          {/* Notification Schedule */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <h2 className="text-lg font-medium text-gray-900">
                Notification Schedule
              </h2>
              <p className="text-sm text-gray-600">
                Set your preferred times for receiving notifications
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    defaultValue="18:00"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option>UTC+01:00 (West Africa Time)</option>
                  <option>UTC+00:00 (Greenwich Mean Time)</option>
                  <option>UTC-05:00 (Eastern Standard Time)</option>
                  <option>UTC-08:00 (Pacific Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Notifications
              </h2>
              <p className="text-sm text-gray-600">
                Your latest notifications and alerts
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Low Stock Alert
                    </p>
                    <p className="text-sm text-gray-600">
                      Groundnut Oil - 15L is running low (5 bottles remaining)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Sales Alert
                    </p>
                    <p className="text-sm text-gray-600">
                      New sale completed: ₦15,000 - Customer: John Doe
                    </p>
                    <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      System Update
                    </p>
                    <p className="text-sm text-gray-600">
                      Your POS system has been updated to version 2.1.0
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Settings */}
          <div className="flex justify-end">
            <button className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
