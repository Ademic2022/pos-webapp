"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Edit,
  ArrowLeft,
  Shield,
  Bell,
  Key,
} from "lucide-react";
import Link from "next/link";

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Store",
    lastName: "Employee",
    email: "employee@store.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, Commerce City, CA 90210",
    role: "Store Manager",
    department: "Sales & Operations",
    employeeId: "EMP001",
    joinDate: "2023-01-15",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save to an API
    console.log("Saving profile data:", profileData);
    setIsEditing(false);
    // Add success notification here
  };

  const handleCancel = () => {
    // Reset to original data if needed
    setIsEditing(false);
  };

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
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-orange-600">
                  Manage your account information
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-orange-700">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-orange-200 hover:bg-orange-50 transition-colors">
                    <Camera className="w-4 h-4 text-orange-600" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-lg text-orange-600">{profileData.role}</p>
                <p className="text-sm text-gray-500">
                  {profileData.department}
                </p>
                <p className="text-sm text-gray-500">
                  Employee ID: {profileData.employeeId}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <h2 className="text-lg font-medium text-gray-900">
                Profile Information
              </h2>
              <p className="text-sm text-gray-600">
                Update your personal information and contact details.
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                      <User className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-900">
                        {profileData.firstName}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                      <User className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-900">
                        {profileData.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-900">{profileData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-900">{profileData.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <div className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-orange-500 mt-1" />
                    <span className="text-gray-900">{profileData.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <h2 className="text-lg font-medium text-gray-900">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-600">
                Manage your account settings and preferences.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/security"
                  className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                  <Shield className="w-5 h-5 text-orange-600 mr-3 group-hover:text-orange-700" />
                  <div>
                    <p className="font-medium text-gray-900">Security</p>
                    <p className="text-sm text-gray-500">Password & 2FA</p>
                  </div>
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                  <Bell className="w-5 h-5 text-orange-600 mr-3 group-hover:text-orange-700" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-500">Email & SMS alerts</p>
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                  <Key className="w-5 h-5 text-orange-600 mr-3 group-hover:text-orange-700" />
                  <div>
                    <p className="font-medium text-gray-900">Preferences</p>
                    <p className="text-sm text-gray-500">App settings</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <h2 className="text-lg font-medium text-gray-900">
                Employment Information
              </h2>
              <p className="text-sm text-gray-600">
                Your role and department details.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profileData.role}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profileData.department}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profileData.employeeId}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(profileData.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
