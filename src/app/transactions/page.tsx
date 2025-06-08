"use client";
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
  Banknote,
  AlertCircle,
  CheckCircle,
  XCircle,
  Droplets,
  RotateCcw,
  Package,
} from "lucide-react";
import { usePageLoading } from "@/hooks/usePageLoading";

// Type definitions
interface Transaction {
  id: string;
  type: "sale" | "payment" | "credit" | "return";
  customerName: string;
  customerType: "wholesale" | "retail";
  date: string;
  time: string;
  items: TransactionItem[];
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "overdue";
  paymentMethod: "cash" | "transfer" | "credit";
  salesPerson: string;
  reference: string;
}

interface TransactionItem {
  type: "drum" | "keg";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface FilterOptions {
  dateRange: "today" | "week" | "month" | "custom" | "all";
  transactionType: "all" | "sale" | "payment" | "credit" | "return";
  customerType: "all" | "wholesale" | "retail";
  paymentStatus: "all" | "paid" | "pending" | "overdue";
  paymentMethod: "all" | "cash" | "transfer" | "credit";
}

interface SortOptions {
  field: "date" | "amount" | "customer" | "status";
  direction: "asc" | "desc";
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: "TXN-2025-001234",
    type: "sale",
    customerName: "Adebayo Motors",
    customerType: "wholesale",
    date: "2025-06-05",
    time: "14:30",
    items: [{ type: "drum", quantity: 2, unitPrice: 9000, totalPrice: 18000 }],
    totalAmount: 18000,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    salesPerson: "John Doe",
    reference: "REF-ADM-001",
  },
  {
    id: "TXN-2025-001233",
    type: "sale",
    customerName: "Mrs. Fatima",
    customerType: "retail",
    date: "2025-06-05",
    time: "13:15",
    items: [{ type: "keg", quantity: 3, unitPrice: 1500, totalPrice: 4500 }],
    totalAmount: 4500,
    paymentStatus: "paid",
    paymentMethod: "cash",
    salesPerson: "Jane Smith",
    reference: "REF-FAT-003",
  },
  {
    id: "RET-2025-001001",
    type: "return",
    customerName: "Kemi's Store",
    customerType: "retail",
    date: "2025-06-05",
    time: "11:45",
    items: [{ type: "keg", quantity: 2, unitPrice: 1500, totalPrice: 3000 }],
    totalAmount: 3000,
    paymentStatus: "paid",
    paymentMethod: "cash",
    salesPerson: "John Doe",
    reference: "RET-KEM-001",
  },
  {
    id: "TXN-2025-001232",
    type: "sale",
    customerName: "Kemi's Store",
    customerType: "retail",
    date: "2025-06-05",
    time: "11:45",
    items: [{ type: "keg", quantity: 5, unitPrice: 1500, totalPrice: 7500 }],
    totalAmount: 7500,
    paymentStatus: "overdue",
    paymentMethod: "credit",
    salesPerson: "John Doe",
    reference: "REF-KEM-008",
  },
  {
    id: "PMT-2025-001001",
    type: "payment",
    customerName: "Taiwo Enterprises",
    customerType: "wholesale",
    date: "2025-06-04",
    time: "16:20",
    items: [],
    totalAmount: 15000,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    salesPerson: "Jane Smith",
    reference: "PMT-TAI-001",
  },
  {
    id: "TXN-2025-001231",
    type: "sale",
    customerName: "Taiwo Enterprises",
    customerType: "wholesale",
    date: "2025-06-04",
    time: "16:20",
    items: [{ type: "drum", quantity: 3, unitPrice: 9000, totalPrice: 27000 }],
    totalAmount: 27000,
    paymentStatus: "pending",
    paymentMethod: "credit",
    salesPerson: "Jane Smith",
    reference: "REF-TAI-012",
  },
  {
    id: "RET-2025-001002",
    type: "return",
    customerName: "Adebayo Motors",
    customerType: "wholesale",
    date: "2025-06-04",
    time: "10:30",
    items: [{ type: "drum", quantity: 1, unitPrice: 9000, totalPrice: 9000 }],
    totalAmount: 9000,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    salesPerson: "John Doe",
    reference: "RET-ADM-001",
  },
  {
    id: "TXN-2025-001230",
    type: "sale",
    customerName: "Blessing Oil Depot",
    customerType: "wholesale",
    date: "2025-06-04",
    time: "10:30",
    items: [
      { type: "drum", quantity: 1, unitPrice: 9000, totalPrice: 9000 },
      { type: "keg", quantity: 2, unitPrice: 1500, totalPrice: 3000 },
    ],
    totalAmount: 12000,
    paymentStatus: "paid",
    paymentMethod: "cash",
    salesPerson: "John Doe",
    reference: "REF-BLE-005",
  },
  {
    id: "TXN-2025-001229",
    type: "sale",
    customerName: "Mama Tinu",
    customerType: "retail",
    date: "2025-06-03",
    time: "15:45",
    items: [{ type: "keg", quantity: 1, unitPrice: 1500, totalPrice: 1500 }],
    totalAmount: 1500,
    paymentStatus: "paid",
    paymentMethod: "cash",
    salesPerson: "Jane Smith",
    reference: "REF-TIN-001",
  },
];

const TransactionHistoryPage: React.FC = () => {
  usePageLoading({
    text: "Loading transactions",
    minDuration: 650,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    transactionType: "all",
    customerType: "all",
    paymentStatus: "all",
    paymentMethod: "all",
  });
  const [sortBy, setSortBy] = useState<SortOptions>({
    field: "date",
    direction: "desc",
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const itemsPerPage = 10;

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = mockTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTransactionType =
        filters.transactionType === "all" ||
        transaction.type === filters.transactionType;

      const matchesCustomerType =
        filters.customerType === "all" ||
        transaction.customerType === filters.customerType;

      const matchesPaymentStatus =
        filters.paymentStatus === "all" ||
        transaction.paymentStatus === filters.paymentStatus;

      const matchesPaymentMethod =
        filters.paymentMethod === "all" ||
        transaction.paymentMethod === filters.paymentMethod;

      // Date filtering logic would go here
      const matchesDateRange = true; // Simplified for demo

      return (
        matchesSearch &&
        matchesTransactionType &&
        matchesCustomerType &&
        matchesPaymentStatus &&
        matchesPaymentMethod &&
        matchesDateRange
      );
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy.field) {
        case "date":
          comparison =
            new Date(a.date + " " + a.time).getTime() -
            new Date(b.date + " " + b.time).getTime();
          break;
        case "amount":
          comparison = a.totalAmount - b.totalAmount;
          break;
        case "customer":
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case "status":
          comparison = a.paymentStatus.localeCompare(b.paymentStatus);
          break;
      }

      return sortBy.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / itemsPerPage
  );
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPaymentStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string): React.ReactNode => {
    switch (method) {
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "transfer":
        return <CreditCard className="w-4 h-4" />;
      case "credit":
        return <FileText className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionTypeIcon = (type: string): React.ReactNode => {
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
        return <Package className="w-4 h-4" />;
    }
  };

  const getTransactionTypeColor = (type: string): string => {
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

  const handleSort = (field: SortOptions["field"]): void => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const resetFilters = (): void => {
    setFilters({
      dateRange: "all",
      transactionType: "all",
      customerType: "all",
      paymentStatus: "all",
      paymentMethod: "all",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Transaction History
                </h1>
                <p className="text-xs text-orange-600">
                  Complete transaction records
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600">
            View and manage all your business transactions
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer name, transaction ID, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>

            {/* Export */}
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>

          {/* Quick Transaction Type Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2 self-center">
              Quick filters:
            </span>
            {[
              { key: "all", label: "All Types", icon: null },
              { key: "sale", label: "Sales", icon: Package },
              { key: "payment", label: "Payments", icon: DollarSign },
              { key: "credit", label: "Credits", icon: CreditCard },
              { key: "return", label: "Returns", icon: RotateCcw },
            ].map((filter) => {
              const Icon = filter.icon;
              const isActive = filters.transactionType === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      transactionType:
                        filter.key as FilterOptions["transactionType"],
                    }))
                  }
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: e.target.value as FilterOptions["dateRange"],
                      }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={filters.transactionType}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        transactionType: e.target
                          .value as FilterOptions["transactionType"],
                      }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Types</option>
                    <option value="sale">Sales</option>
                    <option value="payment">Payments</option>
                    <option value="credit">Credits</option>
                    <option value="return">Returns</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type
                  </label>
                  <select
                    value={filters.customerType}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        customerType: e.target
                          .value as FilterOptions["customerType"],
                      }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Types</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        paymentStatus: e.target
                          .value as FilterOptions["paymentStatus"],
                      }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        paymentMethod: e.target
                          .value as FilterOptions["paymentMethod"],
                      }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {paginatedTransactions.length} of{" "}
            {filteredAndSortedTransactions.length} transactions
          </p>
          <div className="text-sm text-gray-600">
            Total Value: ₦
            {filteredAndSortedTransactions
              .reduce((sum, t) => sum + t.totalAmount, 0)
              .toLocaleString()}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Date & Time
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("customer")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Customer
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("amount")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Amount
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Status
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.customerName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {transaction.customerType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.items.map((item, index) => (
                          <div key={index}>
                            {item.quantity} {item.type}(s)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm font-bold ${
                          transaction.type === "return"
                            ? "text-red-600"
                            : transaction.type === "payment"
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {transaction.type === "payment"
                          ? "+"
                          : transaction.type === "return"
                          ? "-"
                          : ""}
                        ₦{transaction.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="text-sm text-gray-700 capitalize">
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          transaction.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusIcon(transaction.paymentStatus)}
                        <span className="ml-1 capitalize">
                          {transaction.paymentStatus}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-orange-600 hover:text-orange-800 p-1 rounded"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </h3>
                  <p className="text-gray-900 font-mono">
                    {selectedTransaction.id}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTransactionTypeColor(
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Reference
                  </h3>
                  <p className="text-gray-900">
                    {selectedTransaction.reference}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Date & Time
                  </h3>
                  <p className="text-gray-900">
                    {new Date(selectedTransaction.date).toLocaleDateString()} at{" "}
                    {selectedTransaction.time}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Sales Person
                  </h3>
                  <p className="text-gray-900">
                    {selectedTransaction.salesPerson}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">
                      {selectedTransaction.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium capitalize">
                      {selectedTransaction.customerType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Items Purchased
                </h3>
                <div className="space-y-3">
                  {selectedTransaction.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium capitalize">{item.type}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} unit(s) × ₦
                          {item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ₦{item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Payment Details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p
                      className={`text-xl font-bold ${
                        selectedTransaction.type === "return"
                          ? "text-red-600"
                          : selectedTransaction.type === "payment"
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {selectedTransaction.type === "payment"
                        ? "+"
                        : selectedTransaction.type === "return"
                        ? "-"
                        : ""}
                      ₦{selectedTransaction.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                      <span className="font-medium capitalize">
                        {selectedTransaction.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                        selectedTransaction.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusIcon(selectedTransaction.paymentStatus)}
                      <span className="ml-1 capitalize">
                        {selectedTransaction.paymentStatus}
                      </span>
                    </span>
                  </div>
                </div>
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

export default TransactionHistoryPage;
