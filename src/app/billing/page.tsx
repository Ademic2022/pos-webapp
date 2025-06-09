"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedElement from "@/components/auth/ProtectedElement";

const BillingPage: React.FC = () => {
  const billingHistory = [
    {
      id: "INV-2025-001",
      date: "2025-06-01",
      amount: 299.0,
      status: "Paid",
      description: "Monthly POS System Subscription",
    },
    {
      id: "INV-2025-002",
      date: "2025-05-01",
      amount: 299.0,
      status: "Paid",
      description: "Monthly POS System Subscription",
    },
    {
      id: "INV-2025-003",
      date: "2025-04-01",
      amount: 299.0,
      status: "Paid",
      description: "Monthly POS System Subscription",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <ProtectedRoute requiredPermission="VIEW_FINANCIAL_DATA">
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
                    <CreditCard className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Billing & Payments
                    </h1>
                    <p className="text-xs text-orange-600">
                      Subscription Management
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
          {/* Current Plan Card */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{
              y: -5,
              boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
            }}
          >
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Current Plan
              </h2>
              <p className="text-sm text-gray-500">
                Your subscription details and usage
              </p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Professional Plan
                </h3>
                <p className="text-gray-600">
                  Full POS System with all features
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$299</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  Unlimited
                </div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  Advanced
                </div>
                <div className="text-sm text-gray-600">Analytics</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  Next billing date: July 1, 2025
                </span>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors">
                Manage Plan
              </button>
            </div>
          </motion.div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Payment Method
              </h2>
              <p className="text-sm text-gray-500">
                Manage your billing information
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    •••• •••• •••• 4242
                  </p>
                  <p className="text-sm text-gray-500">Expires 12/27</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                  Default
                </span>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{
              y: -2,
              boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
            }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Billing History
                  </h2>
                  <p className="text-sm text-gray-500">
                    View and download your invoices
                  </p>
                </div>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingHistory.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {invoice.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(invoice.status)}
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                          <button className="flex items-center text-orange-600 hover:text-orange-900 transition-colors">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        </ProtectedElement>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Usage Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Usage Summary
              </h2>
              <p className="text-sm text-gray-500">
                Current month usage statistics
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-blue-700">
                  Transactions Processed
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">$45,230</div>
                <div className="text-sm text-green-700">Total Sales Volume</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">23</div>
                <div className="text-sm text-purple-700">Returns Processed</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default BillingPage;
