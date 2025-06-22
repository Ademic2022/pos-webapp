"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Phone,
  DollarSign,
  Download,
  ArrowLeft,
  Eye,
  AlertCircle,
  CheckCircle,
  Package,
  TrendingUp,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { CustomerFilter } from "@/types/types";
import { Customer } from "@/interfaces/interface";
import AddCustomerModal from "@/components/modals/addCustomerModal";
import { StatsCard } from "@/components/cards/statCard";
import { usePageLoading, useAsyncLoading } from "@/hooks/usePageLoading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedElement from "@/components/auth/ProtectedElement";
import {
  customerService,
  CustomerFilters,
  CustomerStats,
} from "@/services/customerService";

const CustomerManagementPage = () => {
  const { withLoading } = useAsyncLoading();

  // Remove the manual auth error handler - let enhanced GraphQL client handle everything
  // const { handleAuthError } = useAuthErrorHandler({...});

  usePageLoading({
    text: "Loading customers",
    minDuration: 600,
  });

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<CustomerFilter>("all");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // New customer form state for modal
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "retail",
    creditLimit: 5000,
    notes: "",
  });

  // Create a ref to avoid dependency issues
  // const handleAuthErrorRef = useRef(handleAuthError);

  // Update ref when handleAuthError changes
  // useEffect(() => {
  //   handleAuthErrorRef.current = handleAuthError;
  // }, [handleAuthError]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: CustomerFilters = {};

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      switch (selectedFilter) {
        case "debt":
          filters.hasBalance = true;
          break;
        case "active":
          filters.status = "active";
          break;
        case "inactive":
          filters.status = "inactive";
          break;
      }

      const response = await customerService.getCustomers(filters, 100, 0);

      if (response.success && response.customers) {
        setCustomers(response.customers);
      } else {
        setError(response.errors?.[0] || "Failed to load customers");
      }
    } catch (error) {
      console.error("Failed to load customers:", error);

      // Enhanced GraphQL client handles auth errors automatically
      // Only show user-friendly messages for final failures
      if (
        error instanceof Error &&
        error.message?.includes("Unable to refresh token")
      ) {
        setError("Session expired. Please sign in again.");
      } else if (
        error instanceof Error &&
        !error.message?.includes("Authentication")
      ) {
        setError("Failed to load customers. Please try again.");
      }
      // For recoverable auth errors, don't show anything - enhanced client will handle
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedFilter]);

  const loadCustomerStats = useCallback(async () => {
    try {
      const response = await customerService.getCustomerStats();

      if (response.success && response.stats) {
        setCustomerStats(response.stats);
      }
    } catch (error) {
      console.error("Failed to load customer stats:", error);
      // Enhanced GraphQL client handles auth errors automatically
    }
  }, []);

  // Load customers and stats on component mount
  useEffect(() => {
    loadCustomers();
    loadCustomerStats();
  }, [loadCustomers, loadCustomerStats]); // Include dependencies

  // Reload customers when search or filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadCustomers();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedFilter, loadCustomers]); // Include loadCustomers dependency

  const handleAddCustomer = async () => {
    await withLoading(async () => {
      try {
        const response = await customerService.createCustomer({
          name: newCustomer.name || "",
          phone: newCustomer.phone || "",
          email: newCustomer.email || "",
          address: newCustomer.address || "",
          type: (newCustomer.type as "retail" | "wholesale") || "retail",
          creditLimit: newCustomer.creditLimit || 0,
          notes: newCustomer.notes || "",
        });

        if (response.success) {
          setShowAddModal(false);
          // Reset form
          setNewCustomer({
            name: "",
            phone: "",
            email: "",
            address: "",
            type: "retail",
            creditLimit: 5000,
            notes: "",
          });
          await loadCustomers(); // Reload customers
          await loadCustomerStats(); // Reload stats
        } else {
          throw new Error(response.errors?.[0] || "Failed to create customer");
        }
      } catch (error) {
        // Enhanced GraphQL client handles auth errors automatically
        throw error; // Re-throw to let withLoading handle the error display
      }
    }, "Creating customer");
  };

  // Filter customers for pagination (client-side filtering for now)
  const filteredCustomers = customers;

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  // Calculate summary statistics from current displayed customers (for fallback)
  const localStats = {
    total: customers.length,
    withDebt: customers.filter((c) => c.balance < 0).length, // Negative balance = debt
    totalDebt: customers.reduce(
      (sum, c) => sum + Math.abs(Math.min(0, c.balance)), // Negative balance = debt (absolute value)
      0
    ),
    totalRevenue: customers.reduce((sum, c) => sum + c.totalPurchases, 0),
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-yellow-600 bg-yellow-100";
      case "blocked":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getBalanceColor = (balance: number): string => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <ProtectedRoute requiredPermission="EDIT_CUSTOMER_DETAILS">
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
          className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50"
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </motion.button>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Customer Management
                    </h1>
                    <p className="text-xs text-orange-600">
                      Manage Customer Relationships
                    </p>
                  </div>
                </motion.div>
              </div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <ProtectedElement requiredPermission="EDIT_CUSTOMER_DETAILS">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.div>
                    <span className="text-sm font-medium">Add Customer</span>
                  </motion.button>
                </ProtectedElement>
                <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Download className="w-4 h-4" />
                    </motion.div>
                    <span className="text-sm font-medium">Export</span>
                  </motion.button>
                </ProtectedElement>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Summary Cards */}
          <motion.div
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatsCard
              title="Total Customers"
              value={customerStats?.totalCustomers || localStats.total}
              icon={Users}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatsCard
              title="Outstanding Balance"
              value={`₦${(
                customerStats?.totalOutstandingBalance || localStats.totalDebt
              ).toLocaleString()}`}
              change={{
                value: `${
                  customerStats?.activeCustomers || localStats.total
                } active`,
                icon: AlertCircle,
                textColor: "text-green-600",
              }}
              icon={DollarSign}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />

            <StatsCard
              title="Credit Issued"
              value={`₦${(
                customerStats?.totalCreditIssued || 0
              ).toLocaleString()}`}
              change={{
                value: `${customerStats?.wholesaleCustomers || 0} wholesale`,
                icon: TrendingUp,
                textColor: "text-green-600",
              }}
              icon={Package}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />

            <StatsCard
              title="Active Customers"
              value={
                customerStats?.activeCustomers ||
                customers.filter((c) => c.status === "active").length
              }
              change={{
                value: `${
                  customerStats?.retailCustomers || 0
                } retail customers`,
                icon: CheckCircle,
                textColor: "text-orange-600",
              }}
              icon={CheckCircle}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="flex-1 relative"
              >
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {(searchTerm || selectedFilter !== "all") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-3 text-xs text-gray-500"
                  >
                    {filteredCustomers.length} found
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex flex-wrap gap-2"
              >
                {(
                  ["all", "debt", "active", "inactive"] as CustomerFilter[]
                ).map((filter, index) => (
                  <motion.button
                    key={filter}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedFilter === filter
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === "debt" &&
                      (customerStats?.totalOutstandingBalance ||
                        localStats.withDebt) > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.5 + index * 0.1 }}
                          className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5"
                        >
                          {localStats.withDebt}
                        </motion.span>
                      )}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error loading customers</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg border border-orange-100 p-8 text-center mb-6"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading customers...</p>
              </div>
            </motion.div>
          )}

          {/* Customer List */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <motion.thead
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.7 }}
                  className="bg-gray-50"
                >
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Contact
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Balance
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Total Purchases
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Last Purchase
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </motion.thead>
                <tbody>
                  {paginatedCustomers.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <motion.div
                          className="flex flex-col items-center justify-center space-y-6"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.2,
                              type: "spring",
                              stiffness: 300,
                            }}
                          >
                            <Users className="w-10 h-10 text-gray-400" />
                          </motion.div>
                          <div className="text-center max-w-md mx-auto">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                              No customers found
                            </h3>
                            <p className="text-gray-500 mb-6 text-base">
                              {searchTerm || selectedFilter !== "all"
                                ? "Try adjusting your search or filters to find what you're looking for"
                                : "Get started by adding your first customer to begin managing relationships"}
                            </p>
                            {!searchTerm && selectedFilter === "all" && (
                              <ProtectedElement requiredPermission="EDIT_CUSTOMER_DETAILS">
                                <motion.button
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowAddModal(true)}
                                  className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-lg hover:shadow-xl transition-all"
                                >
                                  <Plus className="w-5 h-5" />
                                  <span>Add First Customer</span>
                                </motion.button>
                              </ProtectedElement>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              {customer.type === "wholesale" ? (
                                <Building className="w-5 h-5 text-orange-600" />
                              ) : (
                                <User className="w-5 h-5 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {customer.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="flex items-center space-x-1 mb-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">
                                {customer.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div
                            className={`font-medium ${getBalanceColor(
                              customer.balance
                            )}`}
                          >
                            ₦{Math.abs(customer.balance).toLocaleString()}
                            {customer.balance < 0 && (
                              <span className="text-xs ml-1">(debt)</span>
                            )}
                            {customer.balance > 0 && (
                              <span className="text-xs ml-1">(credit)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Limit: ₦{customer.creditLimit.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            ₦{customer.totalPurchases.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {customer.lastPurchase || "Never"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              customer.status
                            )}`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                router.push(`/customer/${customer.id}`);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Transaction History"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredCustomers.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="px-6 py-4 border-t border-gray-100 bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Results Summary */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredCustomers.length)} of{" "}
                      {filteredCustomers.length} customers
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </motion.button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and 2 pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 2
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsis =
                            index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <span className="px-2 py-1 text-gray-500">
                                  ...
                                </span>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                  currentPage === page
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </motion.button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Add Customer Modal */}
        <AddCustomerModal
          show={showAddModal}
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCustomer}
          validationError=""
        />
      </motion.div>
    </ProtectedRoute>
  );
};

export default CustomerManagementPage;
