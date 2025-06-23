"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Download,
  Plus,
  Package,
  AlertCircle,
  ChevronDown,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CustomerTransaction, Customer } from "@/interfaces/interface";
import { usePageLoading } from "@/hooks/usePageLoading";
import EditCustomerModal from "@/components/modals/editCustomerModal";
import ProtectedElement from "@/components/auth/ProtectedElement";
import { customerService } from "@/services/customerService";

interface SortOptions {
  field: "date" | "amount" | "type";
  direction: "asc" | "desc";
}

const CustomerDetailPage = () => {
  const router = useRouter();

  usePageLoading({
    text: "Loading customer details",
    minDuration: 600,
  });

  const params = useParams();
  const customerId = params.customerId as string;

  // State management
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOptions>({
    field: "date",
    direction: "desc",
  });
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Modal state management
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Load customer data on component mount
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the centralized JWT request method to get customer data
        const response = await customerService.getCustomer(customerId);

        if (response.success && response.customer) {
          setCustomer(response.customer);
          // TODO: Load customer transactions from API when transactions endpoint is available
          setTransactions([]); // For now, empty array since we don't have transactions API yet
        } else {
          setError(response.errors?.[0] || "Customer not found");
        }
      } catch (error) {
        console.error("Failed to load customer:", error);
        if (
          error instanceof Error &&
          error.message?.includes("Unable to refresh token")
        ) {
          // This will be handled by JWT context - user will be redirected
          return;
        }
        setError("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [customerId]);

  // Modal handlers
  const handleSaveCustomer = async (updatedCustomer: Customer) => {
    try {
      const response = await customerService.updateCustomer({
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        type: updatedCustomer.type,
        creditLimit: updatedCustomer.creditLimit,
        notes: updatedCustomer.notes,
      });

      if (response.success && response.customer) {
        setCustomer(response.customer);
        setShowEditModal(false);
      } else {
        throw new Error(response.errors?.[0] || "Failed to update customer");
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      // Error handling is done by the enhanced GraphQL client
    }
  };

  const handleOpenEditModal = () => setShowEditModal(true);
  const handleCloseEditModal = () => setShowEditModal(false);

  // Utility functions
  const getBalanceColor = (balance: number) => {
    if (balance < 0) return "text-red-600";
    if (balance > 0) return "text-green-600";
    return "text-gray-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSort = (field: SortOptions["field"]) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const exportTransactions = () => {
    console.log("Exporting transactions...");
    // Implementation for exporting transactions
  };

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }

      return sortBy.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchTerm, sortBy]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Customer Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The requested customer could not be found."}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header
        className="bg-gradient-to-r from-orange-600 to-amber-600 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.back()}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-5 h-5 text-orange-600" />
              </motion.button>

              <nav className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => router.back()}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Back
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">
                  {customer.name}
                </span>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <ProtectedElement requiredPermission="EDIT_CUSTOMER_DETAILS">
                <motion.button
                  onClick={handleOpenEditModal}
                  className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit3 className="w-5 h-5" />
                </motion.button>
              </ProtectedElement>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Customer Profile Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-orange-100 mb-8 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Customer Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {customer.type === "wholesale" ? (
                    <Building className="w-8 h-8 text-white" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </motion.div>
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {customer.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-orange-100">
                    <span className="text-sm font-medium capitalize">
                      {customer.type} Customer
                    </span>
                    <motion.span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        customer.status
                      )}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                    >
                      {customer.status}
                    </motion.span>
                  </div>
                </motion.div>
              </div>
              <motion.div
                className="text-right"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="text-white/80 text-sm">Customer ID</div>
                <div className="text-white font-mono text-lg">
                  #{customer.id}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Customer Details */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {/* Contact Information */}
            <motion.div
              className="space-y-4"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Contact Information
              </h3>
              <div className="space-y-3">
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {customer.phone}
                  </span>
                </motion.div>
                {customer.email && (
                  <motion.div
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {customer.email}
                    </span>
                  </motion.div>
                )}
                {customer.address && (
                  <motion.div
                    className="flex items-start space-x-3"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-900">
                      {customer.address}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Account Information */}
            <motion.div
              className="space-y-4"
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Account Information
              </h3>
              <div className="space-y-3">
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="text-gray-600">Credit Limit</div>
                    <div className="font-medium">
                      ₦{customer.creditLimit.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="text-gray-600">Current Balance</div>
                    <div
                      className={`font-medium ${getBalanceColor(
                        customer.balance
                      )}`}
                    >
                      ₦{Math.abs(customer.balance).toLocaleString()}
                      {customer.balance < 0 && " (debt)"}
                      {customer.balance > 0 && " (credit)"}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Purchase History */}
            <motion.div
              className="space-y-4"
              initial={{ x: 15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Purchase History
              </h3>
              <div className="space-y-3">
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="text-gray-600">Total Purchases</div>
                    <div className="font-medium">
                      ₦{customer.totalPurchases.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="text-gray-600">Last Purchase</div>
                    <div className="font-medium">
                      {customer.lastPurchase || "Never"}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="space-y-4"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link href="/sales">
                  <motion.button
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 my-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Sale</span>
                  </motion.button>
                </Link>
                {customer.balance < 0 && (
                  <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                    <motion.button
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Record Payment</span>
                    </motion.button>
                  </ProtectedElement>
                )}
                <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                  <motion.button
                    onClick={exportTransactions}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </motion.button>
                </ProtectedElement>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Transactions Section */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-orange-100"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Transaction History
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedTransactions.length} transactions found
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-500">
                This customer hasn&apos;t made any transactions yet.
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full lg:w-80"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </motion.button>

                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6">
                        <motion.button
                          onClick={() => handleSort("date")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Date
                          <ChevronDown
                            className={`w-4 h-4 ml-1 transform transition-transform ${
                              sortBy.field === "date"
                                ? sortBy.direction === "asc"
                                  ? "rotate-180"
                                  : "rotate-0"
                                : "opacity-40"
                            }`}
                          />
                        </motion.button>
                      </th>
                      <th className="text-left py-3 px-6">
                        <motion.button
                          onClick={() => handleSort("type")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Type
                          <ChevronDown
                            className={`w-4 h-4 ml-1 transform transition-transform ${
                              sortBy.field === "type"
                                ? sortBy.direction === "asc"
                                  ? "rotate-180"
                                  : "rotate-0"
                                : "opacity-40"
                            }`}
                          />
                        </motion.button>
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">
                        Description
                      </th>
                      <th className="text-right py-3 px-6">
                        <motion.button
                          onClick={() => handleSort("amount")}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 ml-auto"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Amount
                          <ChevronDown
                            className={`w-4 h-4 ml-1 transform transition-transform ${
                              sortBy.field === "amount"
                                ? sortBy.direction === "asc"
                                  ? "rotate-180"
                                  : "rotate-0"
                                : "opacity-40"
                            }`}
                          />
                        </motion.button>
                      </th>
                      <th className="text-right py-3 px-6 font-medium text-gray-700 text-sm">
                        Balance After
                      </th>
                      <th className="text-center py-3 px-6 font-medium text-gray-700 text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
                      >
                        No transactions to display
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        customer={customer}
        onSave={handleSaveCustomer}
      />
    </motion.div>
  );
};

export default CustomerDetailPage;
