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
import { motion, AnimatePresence } from "framer-motion";

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
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/">
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </button>
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
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    delay: 2,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  <User className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    User Profile
                  </h1>
                  <p className="text-xs text-orange-600">
                    Manage Account Settings
                  </p>
                </div>
              </motion.div>
            </div>
            <motion.div
              className="flex items-center space-x-4"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {!isEditing ? (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit Profile</span>
                </motion.button>
              ) : (
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Profile Card */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
          }}
        >
          {/* Cover & Avatar Section */}
          <motion.div
            className="relative h-32 bg-gradient-to-r from-orange-500 to-amber-600"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <motion.div
              className="absolute -bottom-16 left-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
            >
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                <motion.button
                  className="absolute bottom-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Profile Content */}
          <motion.div
            className="pt-20 p-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <motion.div
                className="space-y-4"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>

                {/* Form fields with animations */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {profileData.firstName}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.lastName}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.email}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.phone}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.address}</p>
                  )}
                </motion.div>
              </motion.div>

              {/* Work Information */}
              <motion.div
                className="space-y-4"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Work Information
                </h3>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <p className="text-gray-900 py-2">{profileData.role}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <p className="text-gray-900 py-2">{profileData.department}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <p className="text-gray-900 py-2">{profileData.employeeId}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Join Date
                  </label>
                  <p className="text-gray-900 py-2">
                    {new Date(profileData.joinDate).toLocaleDateString()}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mt-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <motion.div
              className="flex items-center space-x-3 mb-4"
              whileHover={{ x: 5 }}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Security</h3>
            </motion.div>
            <p className="text-gray-600 text-sm mb-4">
              Manage your account security settings
            </p>
            <Link href="/security">
              <motion.button
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Security Settings →
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.5 }}
          >
            <motion.div
              className="flex items-center space-x-3 mb-4"
              whileHover={{ x: 5 }}
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </motion.div>
            <p className="text-gray-600 text-sm mb-4">
              Configure your notification preferences
            </p>
            <Link href="/notifications">
              <motion.button
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Notification Settings →
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <motion.div
              className="flex items-center space-x-3 mb-4"
              whileHover={{ x: 5 }}
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Privacy</h3>
            </motion.div>
            <p className="text-gray-600 text-sm mb-4">
              Control your privacy and data settings
            </p>
            <motion.button
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Privacy Settings →
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
