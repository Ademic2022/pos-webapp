"use client";
import React, { useState, useMemo } from "react";
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
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CustomerTransaction } from "@/interfaces/interface";
import {
  customers as customerData,
  customerTransactions,
} from "@/data/customers";
import { StatsCard } from "@/components/cards/statCard";
import { usePageLoading } from "@/hooks/usePageLoading";

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

  // Early return after all hooks are declared
  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Customer Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The customer you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/customers">
            <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Back to Customers
            </button>
          </Link>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/customers">
                <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </button>
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
                  {customer.name}
                </span>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors">
                <Edit3 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Profile Section */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {customer.type === "wholesale" ? (
                    <Building className="w-8 h-8 text-white" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {customer.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-orange-100">
                    <span className="text-sm font-medium capitalize">
                      {customer.type} Customer
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">Customer ID</div>
                <div className="text-white font-mono text-lg">
                  #{customer.id}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {customer.phone}
                    </span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {customer.email}
                      </span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-900">
                        {customer.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
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
                        customer.balance
                      )}`}
                    >
                      ₦{Math.abs(customer.balance).toLocaleString()}
                      {customer.balance < 0 && (
                        <span className="text-xs ml-1">(debt)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Credit Limit</span>
                    <span className="font-medium text-gray-900">
                      ₦{customer.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Available Credit
                    </span>
                    <span className="font-medium text-orange-600">
                      ₦
                      {(
                        customer.creditLimit + Math.min(0, customer.balance)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Purchase History
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Total Purchases
                    </span>
                    <span className="font-medium text-gray-900">
                      ₦{customer.totalPurchases.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Purchase</span>
                    <span className="text-sm text-gray-900">
                      {customer.lastPurchase || "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {new Date(customer.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link href="/sales">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 my-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                      <Plus className="w-4 h-4" />
                      <span>New Sale</span>
                    </button>
                  </Link>
                  {customer.balance < 0 && (
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>Record Payment</span>
                    </button>
                  )}
                  <button
                    onClick={exportTransactions}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Transactions"
            value={customerStats.totalTransactions}
            icon={Receipt}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />

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
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Transaction History
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    showFilters
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
                <button
                  onClick={exportTransactions}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions by description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                {(["all", "sale", "payment", "credit"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters((prev) => ({ ...prev, type }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.type === type
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <button
                      onClick={() => {
                        setFilters({
                          dateRange: "all",
                          type: "all",
                          amountRange: "all",
                        });
                        setSearchTerm("");
                      }}
                      className="w-full px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
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
                    </button>
                  </th>
                  <th className="text-left py-3 px-6">
                    <button
                      onClick={() => handleSort("type")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
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
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">
                    Description
                  </th>
                  <th className="text-right py-3 px-6">
                    <button
                      onClick={() => handleSort("amount")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 ml-auto"
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
                    </button>
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
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
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
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                            transaction.type
                          )}`}
                        >
                          {getTransactionTypeIcon(transaction.type)}
                          <span className="ml-1 capitalize">
                            {transaction.type}
                          </span>
                        </span>
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
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No transactions found
                        </h3>
                        <p>Try adjusting your search criteria or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>

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
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                currentPage === page
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Transaction Details
                </h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </h3>
                  <p className="text-gray-900 font-mono text-sm">
                    {selectedTransaction.id}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Date
                  </h3>
                  <p className="text-gray-900">
                    {new Date(selectedTransaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Type
                  </h3>
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
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </h3>
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
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Description
                </h3>
                <p className="text-gray-900">
                  {selectedTransaction.description}
                </p>
              </div>

              <div>
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
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
