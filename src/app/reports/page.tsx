"use client";
import React, { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  ArrowLeft,
  DollarSign,
  Package,
  Users,
  Clock,
  Eye,
  Droplets,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ReportFilters } from "@/interfaces/interface";
import { salesData } from "@/data/sales";
import { StatsCard } from "@/components/cards/statCard";
import { usePageLoading } from "@/hooks/usePageLoading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedElement from "@/components/auth/ProtectedElement";

const SalesReportPage = () => {
  const router = useRouter();

  usePageLoading({
    text: "Loading reports",
    minDuration: 750,
  });

  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "customers"
  >("overview");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );

  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: "month",
    customerType: "all",
    paymentMethod: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalSales = salesData.reduce((sum, sale) => sum + sale.total, 0);
    const totalPaid = salesData.reduce((sum, sale) => sum + sale.amountPaid, 0);
    const totalOutstanding = salesData.reduce(
      (sum, sale) => sum + sale.balance,
      0
    );
    const totalTransactions = salesData.length;
    const totalDiscounts = salesData.reduce(
      (sum, sale) => sum + sale.discount,
      0
    );

    const wholesaleRevenue = salesData
      .filter((sale) => sale.customerType === "wholesale")
      .reduce((sum, sale) => sum + sale.total, 0);

    const retailRevenue = salesData
      .filter((sale) => sale.customerType === "retail")
      .reduce((sum, sale) => sum + sale.total, 0);

    return {
      totalSales,
      totalPaid,
      totalOutstanding,
      totalTransactions,
      totalDiscounts,
      wholesaleRevenue,
      retailRevenue,
      averageTransaction: totalSales / totalTransactions || 0,
    };
  };

  const summary = calculateSummary();

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "partial":
        return "text-yellow-600 bg-yellow-100";
      case "pending":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPaymentMethodIcon = (method: string): JSX.Element => {
    switch (method) {
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "transfer":
        return <CreditCard className="w-4 h-4" />;
      case "credit":
        return <AlertCircle className="w-4 h-4" />;
      case "part_payment":
        return <Clock className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <ProtectedRoute requiredPermission="VIEW_REPORTS">
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
                  <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </button>
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
                    <BarChart3 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Sales Reports
                    </h1>
                    <p className="text-xs text-orange-600">
                      Analytics & Insights
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
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </motion.button>
                <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                  <motion.button
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                  </motion.button>
                </ProtectedElement>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 mb-8"
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <motion.h3
                  className="text-lg font-semibold text-gray-900 mb-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  Filter Reports
                </motion.h3>
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: e.target
                            .value as ReportFilters["dateRange"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Type
                    </label>
                    <select
                      value={filters.customerType}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          customerType: e.target
                            .value as ReportFilters["customerType"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Customers</option>
                      <option value="wholesale">Wholesale Only</option>
                      <option value="retail">Retail Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={filters.paymentMethod}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          paymentMethod: e.target
                            .value as ReportFilters["paymentMethod"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Methods</option>
                      <option value="cash">Cash Only</option>
                      <option value="transfer">Transfer Only</option>
                      <option value="credit">Credit Only</option>
                      <option value="part_payment">Part Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          status: e.target.value as ReportFilters["status"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial Payment</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Total Sales"
                value={`₦${summary.totalSales.toLocaleString()}`}
                change={{
                  value: "+8.2% from last month",
                  icon: TrendingUp,
                  textColor: "text-green-600",
                }}
                icon={DollarSign}
                iconBg="bg-green-100"
                iconColor="text-green-600"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Total Transactions"
                value={summary.totalTransactions}
                change={{
                  value: "+12 from yesterday",
                  icon: TrendingUp,
                  textColor: "text-blue-600",
                }}
                icon={Package}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Outstanding Debt"
                value={`₦${summary.totalOutstanding.toLocaleString()}`}
                change={{
                  value: "3 customers",
                  icon: TrendingDown,
                  textColor: "text-red-600",
                }}
                icon={AlertCircle}
                iconBg="bg-red-100"
                iconColor="text-red-600"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Average Sale"
                value={`₦${summary.averageTransaction.toLocaleString()}`}
                change={{
                  value: "Per transaction",
                  icon: TrendingUp,
                  textColor: "text-orange-600",
                }}
                icon={BarChart3}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
              />
            </motion.div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{
              y: -2,
              boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
            }}
          >
            <motion.div
              className="border-b border-gray-200"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <nav className="flex space-x-8 px-6">
                <motion.button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Overview
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("transactions")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "transactions"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Transactions
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("customers")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "customers"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Customer Analysis
                </motion.button>
              </nav>
            </motion.div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="grid lg:grid-cols-2 gap-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* Sales Breakdown */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sales Breakdown
                    </h3>
                    <motion.div
                      className="space-y-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <motion.div
                        className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-gray-900">
                            Wholesale Sales
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₦{summary.wholesaleRevenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {(
                              (summary.wholesaleRevenue / summary.totalSales) *
                              100
                            ).toFixed(1)}
                            % of total
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between p-4 bg-amber-50 rounded-lg"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <Droplets className="w-5 h-5 text-amber-600" />
                          <span className="font-medium text-gray-900">
                            Retail Sales
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₦{summary.retailRevenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {(
                              (summary.retailRevenue / summary.totalSales) *
                              100
                            ).toFixed(1)}
                            % of total
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">
                            Total Discounts Given
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₦{summary.totalDiscounts.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Customer savings
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Payment Methods */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Payment Methods
                    </h3>
                    <motion.div
                      className="space-y-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {["cash", "transfer", "credit", "part_payment"].map(
                        (method, index) => {
                          const methodSales = salesData.filter(
                            (sale) => sale.paymentMethod === method
                          );
                          const methodTotal = methodSales.reduce(
                            (sum, sale) => sum + sale.total,
                            0
                          );
                          const percentage = (
                            (methodTotal / summary.totalSales) *
                            100
                          ).toFixed(1);

                          return (
                            <motion.div
                              key={method}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                delay: 0.5 + index * 0.1,
                                duration: 0.4,
                              }}
                              whileHover={{ scale: 1.02, x: 5 }}
                            >
                              <div className="flex items-center space-x-3">
                                {getPaymentMethodIcon(method)}
                                <span className="font-medium text-gray-900 capitalize">
                                  {method.replace("_", " ")}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  ₦{methodTotal.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {percentage}%
                                </div>
                              </div>
                            </motion.div>
                          );
                        }
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="overflow-x-auto"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.table
                    className="w-full"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Transaction ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Payment
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((sale, index) => (
                        <React.Fragment key={sale.id}>
                          <motion.tr
                            className="border-b border-gray-100 hover:bg-gray-50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.4 + index * 0.05,
                              duration: 0.4,
                            }}
                            whileHover={{
                              backgroundColor: "rgba(249, 250, 251, 1)",
                              x: 5,
                            }}
                          >
                            <td className="py-3 px-4 font-mono text-sm">
                              {sale.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {sale.date}
                                </div>
                                <div className="text-gray-600">{sale.time}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {sale.customer}
                                </div>
                                <div className="text-gray-600 capitalize">
                                  {sale.customerType}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  sale.customerType === "wholesale"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {sale.customerType}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  ₦{sale.total.toLocaleString()}
                                </div>
                                {sale.discount > 0 && (
                                  <div className="text-green-600">
                                    -₦{sale.discount.toLocaleString()} discount
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-1 text-sm">
                                {getPaymentMethodIcon(sale.paymentMethod)}
                                <span className="capitalize">
                                  {sale.paymentMethod.replace("_", " ")}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  sale.status
                                )}`}
                              >
                                {sale.status}
                              </span>
                              {sale.balance > 0 && (
                                <div className="text-xs text-red-600 mt-1">
                                  ₦{sale.balance.toLocaleString()} remaining
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <motion.button
                                onClick={() =>
                                  setSelectedTransaction(
                                    selectedTransaction === sale.id
                                      ? null
                                      : sale.id
                                  )
                                }
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                            </td>
                          </motion.tr>
                          <AnimatePresence>
                            {selectedTransaction === sale.id && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <td
                                  colSpan={8}
                                  className="py-4 px-4 bg-orange-50 border-b"
                                >
                                  <motion.div
                                    className="space-y-2"
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                  >
                                    <h4 className="font-medium text-gray-900">
                                      Transaction Details
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                          Items Purchased
                                        </h5>
                                        {sale.items.map((item, index) => (
                                          <motion.div
                                            key={index}
                                            className="text-sm text-gray-600"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{
                                              delay: 0.2 + index * 0.05,
                                              duration: 0.3,
                                            }}
                                          >
                                            {item.name} x {item.quantity} = ₦
                                            {item.total.toLocaleString()}
                                          </motion.div>
                                        ))}
                                      </div>
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                          Payment Summary
                                        </h5>
                                        <motion.div
                                          className="text-sm text-gray-600 space-y-1"
                                          initial={{ x: 10, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{
                                            delay: 0.3,
                                            duration: 0.3,
                                          }}
                                        >
                                          <div>
                                            Subtotal: ₦
                                            {sale.subtotal.toLocaleString()}
                                          </div>
                                          {sale.discount > 0 && (
                                            <div>
                                              Discount: -₦
                                              {sale.discount.toLocaleString()}
                                            </div>
                                          )}
                                          <div>
                                            Total: ₦
                                            {sale.total.toLocaleString()}
                                          </div>
                                          <div>
                                            Amount Paid: ₦
                                            {sale.amountPaid.toLocaleString()}
                                          </div>
                                          {sale.balance > 0 && (
                                            <div className="text-red-600">
                                              Balance: ₦
                                              {sale.balance.toLocaleString()}
                                            </div>
                                          )}
                                        </motion.div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </motion.table>
                </motion.div>
              </motion.div>
            )}

            {/* Customer Analysis Tab */}
            {activeTab === "customers" && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="grid lg:grid-cols-2 gap-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* Top Customers */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Customers (by Revenue)
                    </h3>
                    <motion.div
                      className="space-y-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {Array.from(
                        new Set(salesData.map((sale) => sale.customer))
                      )
                        .map((customer) => {
                          const customerSales = salesData.filter(
                            (sale) => sale.customer === customer
                          );
                          const totalRevenue = customerSales.reduce(
                            (sum, sale) => sum + sale.total,
                            0
                          );
                          const totalTransactions = customerSales.length;
                          const customerType = customerSales[0]?.customerType;

                          return {
                            name: customer,
                            revenue: totalRevenue,
                            transactions: totalTransactions,
                            type: customerType,
                          };
                        })
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map((customer, index) => (
                          <motion.div
                            key={customer.name}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              duration: 0.4,
                            }}
                            whileHover={{ scale: 1.02, x: 5 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-orange-700">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-600 capitalize">
                                  {customer.type} customer
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">
                                ₦{customer.revenue.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                {customer.transactions} transactions
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>
                  </motion.div>

                  {/* Customer Debt Analysis */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Outstanding Debts
                    </h3>
                    <motion.div
                      className="space-y-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {salesData
                        .filter((sale) => sale.balance > 0)
                        .sort((a, b) => b.balance - a.balance)
                        .map((sale, index) => (
                          <motion.div
                            key={sale.id}
                            className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              duration: 0.4,
                            }}
                            whileHover={{ scale: 1.02, x: -5 }}
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {sale.customer}
                              </div>
                              <div className="text-sm text-gray-600">
                                Transaction: {sale.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {sale.date} at {sale.time}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-red-600">
                                ₦{sale.balance.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                Paid: ₦{sale.amountPaid.toLocaleString()} / ₦
                                {sale.total.toLocaleString()}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                      {salesData.filter((sale) => sale.balance > 0).length ===
                        0 && (
                        <motion.div
                          className="text-center py-8 text-gray-500"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                          <p>No outstanding debts!</p>
                          <p className="text-sm">
                            All customers are up to date with payments
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Customer Performance Metrics */}
                <motion.div
                  className="mt-8"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <motion.h3
                    className="text-lg font-semibold text-gray-900 mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    Customer Performance Metrics
                  </motion.h3>
                  <motion.div
                    className="grid md:grid-cols-3 gap-6"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <motion.div
                      className="bg-blue-50 rounded-lg p-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="text-lg font-bold text-blue-900">
                            {
                              Array.from(
                                new Set(salesData.map((sale) => sale.customer))
                              ).length
                            }
                          </div>
                          <div className="text-sm text-blue-700">
                            Total Customers
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-green-50 rounded-lg p-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.0, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="w-6 h-6 text-green-600" />
                        <div>
                          <div className="text-lg font-bold text-green-900">
                            {
                              Array.from(
                                new Set(
                                  salesData
                                    .filter(
                                      (sale) =>
                                        sale.customerType === "wholesale"
                                    )
                                    .map((sale) => sale.customer)
                                )
                              ).length
                            }
                          </div>
                          <div className="text-sm text-green-700">
                            Wholesale Customers
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-yellow-50 rounded-lg p-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Droplets className="w-6 h-6 text-yellow-600" />
                        <div>
                          <div className="text-lg font-bold text-yellow-900">
                            {
                              Array.from(
                                new Set(
                                  salesData
                                    .filter(
                                      (sale) => sale.customerType === "retail"
                                    )
                                    .map((sale) => sale.customer)
                                )
                              ).length
                            }
                          </div>
                          <div className="text-sm text-yellow-700">
                            Retail Customers
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="mt-8 grid md:grid-cols-3 gap-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900 mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.4 }}
              >
                Quick Actions
              </motion.h3>
              <motion.div
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.4 }}
              >
                <motion.button
                  className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-700">
                      Export to Excel
                    </span>
                  </div>
                </motion.button>
                <motion.button
                  className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      Generate PDF Report
                    </span>
                  </div>
                </motion.button>
                <motion.button
                  className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      Send Customer Statements
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900 mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.4 }}
              >
                Key Insights
              </motion.h3>
              <motion.div
                className="space-y-3 text-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                <motion.div
                  className="p-3 bg-green-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-green-800">
                    Best Performing Day
                  </div>
                  <div className="text-green-600">
                    June 1st with ₦34,500 in sales
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-blue-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-blue-800">Top Product</div>
                  <div className="text-blue-600">
                    Wholesale Drums (6 units sold)
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-orange-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-orange-800">
                    Payment Preference
                  </div>
                  <div className="text-orange-600">
                    60% customers prefer cash payments
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900 mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                Recommendations
              </motion.h3>
              <motion.div
                className="space-y-3 text-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.4 }}
              >
                <motion.div
                  className="p-3 bg-yellow-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-yellow-800">
                    Follow Up Required
                  </div>
                  <div className="text-yellow-600">
                    3 customers have overdue payments
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-purple-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-purple-800">
                    Inventory Alert
                  </div>
                  <div className="text-purple-600">
                    Retail stock running low this week
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-indigo-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-indigo-800">
                    Growth Opportunity
                  </div>
                  <div className="text-indigo-600">
                    Wholesale sales up 15% this month
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default SalesReportPage;
