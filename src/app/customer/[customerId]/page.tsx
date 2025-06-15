"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Eye,
  Plus,
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Receipt,
  Edit3,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CustomerTransaction, Customer } from "@/interfaces/interface";
import {
  customers as customerData,
  customerTransactions,
} from "@/data/customers";
import { StatsCard } from "@/components/cards/statCard";
import { usePageLoading } from "@/hooks/usePageLoading";
import EditCustomerModal from "@/components/modals/editCustomerModal";
import ProtectedElement from "@/components/auth/ProtectedElement";

interface TransactionFilters {
  dateRange: "all" | "week" | "month" | "quarter" | "year";
  type: "all" | "sale" | "payment" | "credit" | "return";
  amountRange: "all" | "0-1000" | "1000-5000" | "5000-10000" | "10000+";
}

interface SortOptions {
  field: "date" | "amount" | "type";
  direction: "asc" | "desc";
}

const CustomerDetailPage = () => {
  usePageLoading({
    text: "Loading customer details",
    minDuration: 600,
  });

  const params = useParams();
  const customerId = params.customerId as string;

  // Find customer data
  const customer = customerData.find((c) => c.id.toString() === customerId);

  // Memoize transactions to fix dependency warnings
  const transactions = useMemo(() => {
    return customerTransactions[parseInt(customerId)] || [];
  }, [customerId]);

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: "all",
    type: "all",
    amountRange: "all",
  });
  const [sortBy, setSortBy] = useState<SortOptions>({
    field: "date",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<CustomerTransaction | null>(null);

  // Modal state management
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [customerData_, setCustomerData_] = useState<Customer | null>(
    customer || null
  );

  // Use the managed customer data or fallback to original
  const currentCustomer = customerData_ || customer;

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filters.type === "all" || transaction.type === filters.type;

      const matchesAmountRange = (() => {
        const amount = transaction.amount;
        switch (filters.amountRange) {
          case "0-1000":
            return amount <= 1000;
          case "1000-5000":
            return amount > 1000 && amount <= 5000;
          case "5000-10000":
            return amount > 5000 && amount <= 10000;
          case "10000+":
            return amount > 10000;
          default:
            return true;
        }
      })();

      const matchesDateRange = (() => {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const daysDiff = Math.floor(
          (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.dateRange) {
          case "week":
            return daysDiff <= 7;
          case "month":
            return daysDiff <= 30;
          case "quarter":
            return daysDiff <= 90;
          case "year":
            return daysDiff <= 365;
          default:
            return true;
        }
      })();

      return (
        matchesSearch && matchesType && matchesAmountRange && matchesDateRange
      );
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
  }, [transactions, searchTerm, filters, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    startIndex,
    endIndex
  );

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy]);

  // Customer statistics
  const customerStats = useMemo(() => {
    const salesTransactions = transactions.filter((t) => t.type === "sale");
    const paymentTransactions = transactions.filter(
      (t) => t.type === "payment"
    );

    return {
      totalTransactions: transactions.length,
      totalSales: salesTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalPayments: paymentTransactions.reduce((sum, t) => sum + t.amount, 0),
      averageTransaction:
        transactions.length > 0
          ? transactions.reduce((sum, t) => sum + t.amount, 0) /
            transactions.length
          : 0,
      lastTransaction:
        transactions.length > 0
          ? Math.max(...transactions.map((t) => new Date(t.date).getTime()))
          : null,
    };
  }, [transactions]);

  // Handler functions for modal
  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveCustomer = async (updatedCustomer: Customer) => {
    try {
      // Simulate API call - in real app, this would be an API request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local customer data state
      setCustomerData_(updatedCustomer);

      // Close modal
      setShowEditModal(false);

      // In a real application, you would also:
      // 1. Make an API call to update the customer in the backend
      // 2. Show a success notification
      // 3. Potentially refresh the customer data from the server

      console.log("Customer updated successfully:", updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      // In a real app, show error notification
    }
  };

  // Early return after all hooks are declared
  if (!currentCustomer) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <AlertCircle className="w-8 h-8 text-red-600" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-gray-900 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Customer Not Found
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            The customer you&apos;re looking for doesn&apos;t exist.
          </motion.p>
          <Link href="/customers">
            <motion.button
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Customers
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <Package className="w-4 h-4" />;
      case "payment":
        return <DollarSign className="w-4 h-4" />;
      case "credit":
        return <CreditCard className="w-4 h-4" />;
      case "return":
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "sale":
        return "text-blue-600 bg-blue-100";
      case "payment":
        return "text-green-600 bg-green-100";
      case "credit":
        return "text-orange-600 bg-orange-100";
      case "return":
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

  const handleSort = (field: SortOptions["field"]) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const exportTransactions = () => {
    // Implementation for exporting transactions
    console.log("Exporting transactions...");
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating Background Elements */}
      <motion.div
        className="fixed top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-xl"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed bottom-20 right-10 w-24 h-24 bg-amber-300 rounded-full opacity-30 blur-lg"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex justify-between items-center py-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/customers">
                <motion.button
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </motion.button>
              </Link>

              <nav className="flex items-center space-x-2 text-sm">
                <Link
                  href="/customers"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Customers
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">
                  {currentCustomer.name}
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
          </motion.div>
        </div>
      </motion.header>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Customer Profile Section */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-orange-100 mb-8 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {currentCustomer.type === "wholesale" ? (
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
                    {currentCustomer.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-orange-100">
                    <span className="text-sm font-medium capitalize">
                      {currentCustomer.type} Customer
                    </span>
                    <motion.span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentCustomer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                    >
                      {currentCustomer.status}
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
                  #{currentCustomer.id}
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="p-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                      {currentCustomer.phone}
                    </span>
                  </motion.div>
                  {currentCustomer.email && (
                    <motion.div
                      className="flex items-center space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {currentCustomer.email}
                      </span>
                    </motion.div>
                  )}
                  {currentCustomer.address && (
                    <motion.div
                      className="flex items-start space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-900">
                        {currentCustomer.address}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Account Information */}
              <motion.div
                className="space-y-4"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="font-semibold text-gray-900 mb-3">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Current Balance
                    </span>
                    <span
                      className={`font-medium ${getBalanceColor(
                        currentCustomer.balance
                      )}`}
                    >
                      ₦{Math.abs(currentCustomer.balance).toLocaleString()}
                      {currentCustomer.balance < 0 && (
                        <span className="text-xs ml-1">(debt)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Credit Limit</span>
                    <span className="font-medium text-gray-900">
                      ₦{currentCustomer.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Available Credit
                    </span>
                    <span className="font-medium text-orange-600">
                      ₦
                      {(
                        currentCustomer.creditLimit +
                        Math.min(0, currentCustomer.balance)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Purchase History */}
              <motion.div
                className="space-y-4"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="font-semibold text-gray-900 mb-3">
                  Purchase History
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Total Purchases
                    </span>
                    <span className="font-medium text-gray-900">
                      ₦{currentCustomer.totalPurchases.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Purchase</span>
                    <span className="text-sm text-gray-900">
                      {currentCustomer.lastPurchase || "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {new Date(currentCustomer.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="space-y-4"
                initial={{ x: -30, opacity: 0 }}
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
                  {currentCustomer.balance < 0 && (
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
        </motion.div>

        {/* Transaction Statistics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {[
            {
              component: (
                <StatsCard
                  title="Total Transactions"
                  value={customerStats.totalTransactions}
                  icon={Receipt}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  change={{
                    value: `${transactions.length} transactions`,
                    icon: Eye,
                    textColor: "text-gray-600",
                  }}
                />
              ),
            },
            {
              component: (
                <StatsCard
                  title="Total Sales"
                  value={`₦${customerStats.totalSales.toLocaleString()}`}
                  change={{
                    value: `${
                      transactions.filter((t) => t.type === "sale").length
                    } transactions`,
                    icon: TrendingUp,
                    textColor: "text-blue-600",
                  }}
                  icon={Package}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                />
              ),
            },
            {
              component: (
                <StatsCard
                  title="Total Payments"
                  value={`₦${customerStats.totalPayments.toLocaleString()}`}
                  change={{
                    value: `${
                      transactions.filter((t) => t.type === "payment").length
                    } payments`,
                    icon: CheckCircle,
                    textColor: "text-green-600",
                  }}
                  icon={DollarSign}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                />
              ),
            },
            {
              component: (
                <StatsCard
                  title="Average Transaction"
                  value={`₦${customerStats.averageTransaction.toLocaleString()}`}
                  change={{
                    value: customerStats.lastTransaction
                      ? `Last: ${new Date(
                          customerStats.lastTransaction
                        ).toLocaleDateString()}`
                      : "No transactions",
                    icon: Calendar,
                    textColor: "text-orange-600",
                  }}
                  icon={TrendingUp}
                  iconBg="bg-orange-100"
                  iconColor="text-orange-600"
                />
              ),            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              {item.component}
            </motion.div>
          ))}
        </motion.div>

        {/* Transaction History Section */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{
            y: -2,
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Section Header */}
          <motion.div
            className="px-6 py-4 border-b border-gray-100"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between">
              <motion.h2
                className="text-xl font-semibold text-gray-900"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                Transaction History
              </motion.h2>
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    showFilters
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </motion.button>
                <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                  <motion.button
                    onClick={exportTransactions}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </motion.button>
                </ProtectedElement>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="px-6 py-4 border-b border-gray-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <motion.div
                className="flex-1 relative"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions by description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </motion.div>

              {/* Quick Filters */}
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                {(["all", "sale", "payment", "credit"] as const).map(
                  (type, index) => (
                    <motion.button
                      key={type}
                      onClick={() => setFilters((prev) => ({ ...prev, type }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.type === type
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                      }`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </motion.button>
                  )
                )}
              </motion.div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            dateRange: e.target
                              .value as TransactionFilters["dateRange"],
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      >
                        <option value="all">All Time</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Range
                      </label>
                      <select
                        value={filters.amountRange}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            amountRange: e.target
                              .value as TransactionFilters["amountRange"],
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      >
                        <option value="all">All Amounts</option>
                        <option value="0-1000">₦0 - ₦1,000</option>
                        <option value="1000-5000">₦1,000 - ₦5,000</option>
                        <option value="5000-10000">₦5,000 - ₦10,000</option>
                        <option value="10000+">₦10,000+</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <motion.button
                        onClick={() => {
                          setFilters({
                            dateRange: "all",
                            type: "all",
                            amountRange: "all",
                          });
                          setSearchTerm("");
                        }}
                        className="w-full px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Reset Filters
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Summary */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredAndSortedTransactions.length)} of{" "}
                {filteredAndSortedTransactions.length} transactions
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
          </div>

          {/* Transaction Table */}
          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <table className="w-full">
              <motion.thead
                className="bg-gray-50"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
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
              </motion.thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: "rgba(249, 250, 251, 1)",
                        }}
                      >
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.id}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <motion.span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                              transaction.type
                            )}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {getTransactionTypeIcon(transaction.type)}
                            <span className="ml-1 capitalize">
                              {transaction.type}
                            </span>
                          </motion.span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 font-medium">
                            {transaction.description}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div
                            className={`text-sm font-bold ${
                              transaction.type === "payment"
                                ? "text-green-600"
                                : "text-gray-900"
                            }`}
                          >
                            {transaction.type === "payment" ? "+" : ""}₦
                            {transaction.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div
                            className={`text-sm font-medium ${getBalanceColor(
                              transaction.balance
                            )}`}
                          >
                            ₦{Math.abs(transaction.balance).toLocaleString()}
                            {transaction.balance < 0 && (
                              <span className="text-xs ml-1">(debt)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <motion.button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                            title="View Details"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <td colSpan={6} className="py-12 text-center">
                        <motion.div
                          className="text-gray-500"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          </motion.div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No transactions found
                          </h3>
                          <p>Try adjusting your search criteria or filters</p>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="px-6 py-4 border-t border-gray-100 bg-gray-50"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <motion.div
                  className="text-sm text-gray-600"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  Page {currentPage} of {totalPages}
                </motion.div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: currentPage !== 1 ? 1.05 : 1 }}
                    whileTap={{ scale: currentPage !== 1 ? 0.95 : 1 }}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
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
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                currentPage === page
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.2,
                                delay: 0.6 + index * 0.05,
                              }}
                            >
                              {page}
                            </motion.button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <motion.button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{
                      scale: currentPage !== totalPages ? 1.05 : 1,
                    }}
                    whileTap={{ scale: currentPage !== totalPages ? 0.95 : 1 }}
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
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

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="p-6 border-b border-gray-200"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex justify-between items-center">
                  <motion.h2
                    className="text-xl font-bold text-gray-900"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    Transaction Details
                  </motion.h2>
                  <motion.button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <XCircle className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                className="p-6 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {[
                    {
                      label: "Transaction ID",
                      value: selectedTransaction.id,
                      isCode: true,
                    },
                    {
                      label: "Date",
                      value: new Date(
                        selectedTransaction.date
                      ).toLocaleDateString(),
                    },
                    {
                      label: "Type",
                      value: (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                            selectedTransaction.type
                          )}`}
                        >
                          {getTransactionTypeIcon(selectedTransaction.type)}
                          <span className="ml-1 capitalize">
                            {selectedTransaction.type}
                          </span>
                        </span>
                      ),
                    },
                    {
                      label: "Amount",
                      value: (
                        <p
                          className={`font-bold ${
                            selectedTransaction.type === "payment"
                              ? "text-green-600"
                              : "text-gray-900"
                          }`}
                        >
                          {selectedTransaction.type === "payment" ? "+" : ""}₦
                          {selectedTransaction.amount.toLocaleString()}
                        </p>
                      ),
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        {item.label}
                      </h3>
                      {typeof item.value === "string" ? (
                        <p
                          className={`text-gray-900 ${
                            item.isCode ? "font-mono text-sm" : ""
                          }`}
                        >
                          {item.value}
                        </p>
                      ) : (
                        item.value
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-900">
                    {selectedTransaction.description}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Balance After Transaction
                  </h3>
                  <p
                    className={`font-medium ${getBalanceColor(
                      selectedTransaction.balance
                    )}`}
                  >
                    ₦{Math.abs(selectedTransaction.balance).toLocaleString()}
                    {selectedTransaction.balance < 0 && (
                      <span className="text-xs ml-1">(debt)</span>
                    )}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                className="p-6 border-t border-gray-200 flex justify-end space-x-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <motion.button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  Close
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  Print Receipt
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        customer={currentCustomer}
        onSave={handleSaveCustomer}
      />
    </motion.div>
  );
};

export default CustomerDetailPage;
