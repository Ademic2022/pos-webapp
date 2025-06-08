'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, User, Bell, Shield, Palette } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const settingsSections = [
    {
      icon: User,
      title: 'Account Settings',
      description: 'Manage your personal information and account details',
      href: '/profile'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure email, SMS, and in-app notifications',
      href: '/notifications'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Password, two-factor authentication, and privacy settings',
      href: '/security'
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Theme, language, and display preferences',
      href: '/appearance'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link
                key={index}
                href={section.href}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-orange-200 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
