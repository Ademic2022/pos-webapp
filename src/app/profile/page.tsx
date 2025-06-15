"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </motion.div>
              </Link>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-orange-600">
                  Manage your account information
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center space-x-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700"
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Save className="w-4 h-4" />
                      </motion.div>
                      <span>Save Changes</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="not-editing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.div>
                    <span>Edit Profile</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="space-y-8">
          {/* Profile Header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-orange-100 p-6"
          >
            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center"
                >
                  <span className="text-2xl font-semibold text-orange-700">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </span>
                </motion.div>
                <AnimatePresence>
                  {isEditing && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-orange-200 hover:bg-orange-50"
                    >
                      <Camera className="w-4 h-4 text-orange-600" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
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
              </motion.div>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg border border-orange-100"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-6 border-b border-orange-100"
            >
              <h2 className="text-lg font-medium text-gray-900">
                Profile Information
              </h2>
              <p className="text-sm text-gray-600">
                Update your personal information and contact details.
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.input
                        key="first-name-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <motion.div
                        key="first-name-display"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg"
                      >
                        <User className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-900">
                          {profileData.firstName}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.input
                        key="last-name-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <motion.div
                        key="last-name-display"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg"
                      >
                        <User className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-900">
                          {profileData.lastName}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.input
                      key="email-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <motion.div
                      key="email-display"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg"
                    >
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-900">{profileData.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.input
                      key="phone-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <motion.div
                      key="phone-display"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg"
                    >
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-900">{profileData.phone}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.textarea
                      key="address-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      value={profileData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <motion.div
                      key="address-display"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg"
                    >
                      <MapPin className="w-4 h-4 text-orange-500 mt-1" />
                      <span className="text-gray-900">
                        {profileData.address}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="bg-white rounded-xl shadow-lg border border-orange-100"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="p-6 border-b border-orange-100"
            >
              <h2 className="text-lg font-medium text-gray-900">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-600">
                Manage your account settings and preferences.
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.7 }}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Link
                    href="/security"
                    className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 group"
                  >
                    <motion.div whileHover={{ rotate: 10 }} className="mr-3">
                      <Shield className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900">Security</p>
                      <p className="text-sm text-gray-500">Password & 2FA</p>
                    </div>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.9 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Link
                    href="/notifications"
                    className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 group"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mr-3"
                    >
                      <Bell className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-sm text-gray-500">
                        Email & SMS alerts
                      </p>
                    </div>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.0 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Link
                    href="/settings"
                    className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 group"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                      className="mr-3"
                    >
                      <Key className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900">Preferences</p>
                      <p className="text-sm text-gray-500">App settings</p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Employment Information */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.1 }}
            className="bg-white rounded-xl shadow-lg border border-orange-100"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="p-6 border-b border-orange-100"
            >
              <h2 className="text-lg font-medium text-gray-900">
                Employment Information
              </h2>
              <p className="text-sm text-gray-600">
                Your role and department details.
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.3 }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-orange-50 rounded-lg"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profileData.role}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-orange-50 rounded-lg"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profileData.department}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.6 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-orange-50 rounded-lg"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profileData.employeeId}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.7 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-orange-50 rounded-lg"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(profileData.joinDate).toLocaleDateString()}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
