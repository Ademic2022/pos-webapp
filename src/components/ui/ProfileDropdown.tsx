"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  Package,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  FileText,
} from "lucide-react";

interface ProfileDropdownProps {
  userName?: string;
  userInitials?: string;
  userEmail?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userName = "Store Employee",
  userInitials = "SE",
  userEmail = "employee@store.com",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
    // For now, just close the dropdown
    setIsOpen(false);
    // You can add actual logout functionality here
    // e.g., clear local storage, redirect to login, etc.
  };

  const menuItems = [
    {
      icon: User,
      label: "My Profile",
      href: "/profile",
      description: "View and edit your profile",
    },
    {
      icon: Settings,
      label: "Account Settings",
      href: "/settings",
      description: "Manage your account preferences",
    },
    {
      icon: Package,
      label: "Inventory Settings",
      href: "/inventory/settings",
      description: "Configure inventory management",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications",
      description: "Manage notification preferences",
    },
    {
      icon: FileText,
      label: "Reports",
      href: "/reports",
      description: "View sales and analytics reports",
    },
    {
      icon: Shield,
      label: "Security",
      href: "/security",
      description: "Security and privacy settings",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-orange-700">
            {userInitials}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-orange-700">
                  {userInitials}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              className="flex items-start w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium m-0 p-0">Sign Out</p>
                <p className="text-xs text-red-400">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
