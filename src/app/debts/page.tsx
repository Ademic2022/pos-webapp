"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  DollarSign,
  AlertCircle,
  Calendar,
  CheckCircle,
  TrendingUp,
  User,
  Phone,
  Mail,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading } from "@/hooks/usePageLoading";
import { customers } from "@/data/customers";
import { StatsCard } from "@/components/cards/statCard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedElement from "@/components/auth/ProtectedElement";

interface DebtFilterOptions {
  status: "all" | "overdue" | "current" | "paid";
  amount: "all" | "low" | "medium" | "high";
  customer: "all" | "wholesale" | "retail";
}

const DebtManagementPage = () => {
  const router = useRouter();

  usePageLoading({
    text: "Loading debt management",
    minDuration: 600,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DebtFilterOptions>({
    status: "all",
    amount: "all",
    customer: "all",
  });

  // Calculate debt statistics
  const debtStats = useMemo(() => {
    const customersWithDebt = customers.filter(
      (customer) => customer.balance < 0
    );
    const totalDebt = customersWithDebt.reduce(
      (sum, customer) => sum + Math.abs(customer.balance),
      0
    );
    const averageDebt =
      customersWithDebt.length > 0 ? totalDebt / customersWithDebt.length : 0;
    const overdueCustomers = customersWithDebt.filter(
      (customer) => Math.abs(customer.balance) > 10000
    ); // Assuming overdue if debt > 10k

    return {
      totalCustomersWithDebt: customersWithDebt.length,
      totalDebtAmount: totalDebt,
      averageDebtPerCustomer: averageDebt,
      overdueCustomers: overdueCustomers.length,
      customersWithDebt,
    };
  }, []);

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    return debtStats.customersWithDebt.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "overdue" && Math.abs(customer.balance) > 10000) ||
        (filters.status === "current" && Math.abs(customer.balance) <= 10000) ||
        (filters.status === "paid" && customer.balance >= 0);

      const matchesAmount =
        filters.amount === "all" ||
        (filters.amount === "low" && Math.abs(customer.balance) < 5000) ||
        (filters.amount === "medium" &&
          Math.abs(customer.balance) >= 5000 &&
          Math.abs(customer.balance) <= 15000) ||
        (filters.amount === "high" && Math.abs(customer.balance) > 15000);

      const matchesCustomerType =
        filters.customer === "all" || filters.customer === customer.type;

      return (
        matchesSearch && matchesStatus && matchesAmount && matchesCustomerType
      );
    });
  }, [searchTerm, filters, debtStats.customersWithDebt]);

  const getDebtStatusColor = (balance: number) => {
    const debt = Math.abs(balance);
    if (debt > 15000) return "text-red-600 bg-red-100";
    if (debt > 5000) return "text-orange-600 bg-orange-100";
    return "text-yellow-600 bg-yellow-100";
  };

  const getDebtStatus = (balance: number) => {
    const debt = Math.abs(balance);
    if (debt > 15000) return "High Risk";
    if (debt > 5000) return "Medium Risk";
    return "Low Risk";
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
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Debt Management
                  </h1>
                  <p className="text-xs text-orange-600">
                    Customer Credit & Debt Tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ProtectedElement requiredPermission="VIEW_REPORTS">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>
                </ProtectedElement>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <StatsCard
              title="Total Outstanding Debt"
              value={`₦${debtStats.totalDebtAmount.toLocaleString()}`}
              change={{
                value: `${debtStats.totalCustomersWithDebt} customers`,
                icon: AlertCircle,
                textColor: "text-red-600",
              }}
              icon={DollarSign}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />

            <StatsCard
              title="Average Debt"
              value={`₦${Math.round(
                debtStats.averageDebtPerCustomer
              ).toLocaleString()}`}
              change={{
                value: "Per customer",
                icon: BarChart3,
                textColor: "text-orange-600",
              }}
              icon={TrendingUp}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />

            <StatsCard
              title="High Risk Customers"
              value={debtStats.overdueCustomers}
              change={{
                value: "Above ₦10,000 debt",
                icon: AlertCircle,
                textColor: "text-red-600",
              }}
              icon={AlertCircle}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />

            <StatsCard
              title="Collection Rate"
              value="78%"
              change={{
                value: "+5% this month",
                icon: TrendingUp,
                textColor: "text-green-600",
              }}
              icon={CheckCircle}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-4 pt-4 border-t border-gray-200"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            status: e.target
                              .value as DebtFilterOptions["status"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="overdue">Overdue</option>
                        <option value="current">Current</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount Range
                      </label>
                      <select
                        value={filters.amount}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            amount: e.target
                              .value as DebtFilterOptions["amount"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="all">All Amounts</option>
                        <option value="low">Low (&lt; ₦5,000)</option>
                        <option value="medium">
                          Medium (₦5,000 - ₦15,000)
                        </option>
                        <option value="high">High (&gt; ₦15,000)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Type
                      </label>
                      <select
                        value={filters.customer}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            customer: e.target
                              .value as DebtFilterOptions["customer"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="retail">Retail</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Debt Table */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Debt Details
              </h3>
              <p className="text-sm text-gray-600">
                {filteredCustomers.length} customers with outstanding debt
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debt Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Transaction
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.email || customer.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.type === "wholesale"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {customer.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          ₦{Math.abs(customer.balance).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDebtStatusColor(
                            customer.balance
                          )}`}
                        >
                          {getDebtStatus(customer.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date().toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="text-orange-600 hover:text-orange-800 p-1 rounded">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800 p-1 rounded">
                            <CreditCard className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No customers found with debt</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default DebtManagementPage;
