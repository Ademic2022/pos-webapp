"use client";
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  ArrowLeft,
  RotateCcw,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  User,
  Receipt,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePageLoading } from "@/hooks/usePageLoading";
import { customers, customerTransactions } from "@/data/customers";
import ReturnModal from "@/components/modals/returnModal";
import ProcessReturnModal from "@/components/modals/processReturnModal";
import { ReturnAnalyticsEngine } from "@/utils/returnAnalytics";

// Local interfaces for analytics
interface AnalyticsSalesData {
  id: string;
  customerId: number;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Return Analytics Dashboard Component
const ReturnAnalyticsDashboard: React.FC<{
  returns: ReturnRequest[];
  salesData: AnalyticsSalesData[];
  dateRange: { start: Date; end: Date };
}> = ({ returns, salesData, dateRange }) => {
  const analytics = ReturnAnalyticsEngine.generateAnalytics(
    returns,
    salesData,
    dateRange
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">Total Returns</div>
          <div className="text-2xl font-bold text-blue-900">
            {analytics.summary.totalReturns}
          </div>
          <div className="text-xs text-blue-600">
            {analytics.summary.pendingReturns} pending
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-red-600 mb-1">Total Refunds</div>
          <div className="text-2xl font-bold text-red-900">
            ₦{analytics.summary.totalRefundAmount.toLocaleString()}
          </div>
          <div className="text-xs text-red-600">
            Avg: ₦{analytics.summary.averageRefundAmount.toLocaleString()}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-orange-600 mb-1">Return Rate</div>
          <div className="text-2xl font-bold text-orange-900">
            {analytics.summary.returnRate.toFixed(1)}%
          </div>
          <div className="text-xs text-orange-600">of total sales</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">Processed</div>
          <div className="text-2xl font-bold text-green-900">
            {analytics.summary.processedReturns}
          </div>
          <div className="text-xs text-green-600">
            {(
              (analytics.summary.processedReturns /
                analytics.summary.totalReturns) *
              100
            ).toFixed(1)}
            % completion
          </div>
        </div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Return Reasons */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Return Reasons
          </h3>
          <div className="space-y-3">
            {analytics.trends.returnsByReason.map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {reason.reason}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${reason.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-sm text-gray-600">
                  {reason.count} ({reason.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Risk Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Returning Customers
          </h3>
          <div className="space-y-3">
            {analytics.customerAnalysis.topReturningCustomers
              .slice(0, 5)
              .map((customer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.customerName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {customer.returnCount} returns
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">
                      ₦{customer.totalRefundAmount.toLocaleString()}
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        customer.riskScore >= 7
                          ? "bg-red-100 text-red-600"
                          : customer.riskScore >= 4
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      Risk: {customer.riskScore}/10
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.recommendations.slice(0, 4).map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                rec.priority === "high"
                  ? "border-red-500 bg-red-50"
                  : rec.priority === "medium"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-green-500 bg-green-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  {rec.title}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === "high"
                      ? "bg-red-100 text-red-600"
                      : rec.priority === "medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
              <p className="text-xs text-gray-500">
                Expected Impact: {rec.expectedImpact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Type definitions for returns
interface ReturnRequest {
  id: string;
  originalTransactionId: string;
  customerId: number;
  customerName: string;
  originalDate: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "processed";
  reason: string;
  returnItems: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalRefundAmount: number;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

interface FilterOptions {
  status: "all" | "pending" | "approved" | "rejected" | "processed";
  dateRange: "today" | "week" | "month" | "all";
  customerType: "all" | "wholesale" | "retail";
}

interface SortOptions {
  field: "date" | "customer" | "amount" | "status";
  direction: "asc" | "desc";
}

// Mock return data (in real app, this would come from API)
const mockReturnRequests: ReturnRequest[] = [
  {
    id: "RET-2025-001",
    originalTransactionId: "TXN001",
    customerId: 1,
    customerName: "Adebayo Motors",
    originalDate: "2025-06-02",
    requestDate: "2025-06-05",
    status: "pending",
    reason: "Quality issue - oil appears cloudy",
    returnItems: [
      {
        name: "Wholesale Drum (9 Kegs)",
        quantity: 1,
        price: 9000,
        total: 9000,
      },
    ],
    totalRefundAmount: 9000,
    notes: "Customer reported cloudy appearance in one drum",
  },
  {
    id: "RET-2025-002",
    originalTransactionId: "TXN002",
    customerId: 2,
    customerName: "Mrs. Fatima Ibrahim",
    originalDate: "2025-06-02",
    requestDate: "2025-06-04",
    status: "approved",
    reason: "Damaged container during transport",
    returnItems: [{ name: "3 Kegs", quantity: 1, price: 4500, total: 4500 }],
    totalRefundAmount: 4500,
    notes: "Container leaked during delivery",
  },
  {
    id: "RET-2025-003",
    originalTransactionId: "TXN003",
    customerId: 3,
    customerName: "Kemi's Store",
    originalDate: "2025-06-02",
    requestDate: "2025-06-03",
    status: "processed",
    reason: "Excess quantity ordered",
    returnItems: [{ name: "5 Kegs", quantity: 2, price: 1500, total: 3000 }],
    totalRefundAmount: 3000,
    processedBy: "Admin",
    processedDate: "2025-06-04",
    notes: "Customer overordered, approved partial return",
  },
];

const ReturnsPage = () => {
  usePageLoading({
    text: "Loading returns...",
    minDuration: 600,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    dateRange: "all",
    customerType: "all",
  });

  const [sortBy, setSortBy] = useState<SortOptions>({
    field: "date",
    direction: "desc",
  });

  // Bulk actions state
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);

  // Filter and sort returns
  const filteredAndSortedReturns = useMemo(() => {
    const filtered = mockReturnRequests.filter((returnRequest) => {
      const matchesSearch =
        returnRequest.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        returnRequest.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnRequest.originalTransactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        returnRequest.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "all" || returnRequest.status === filters.status;

      const customer = customers.find((c) => c.id === returnRequest.customerId);
      const matchesCustomerType =
        filters.customerType === "all" ||
        (customer && customer.type === filters.customerType);

      const matchesDateRange = (() => {
        const requestDate = new Date(returnRequest.requestDate);
        const today = new Date();
        const daysDiff = Math.floor(
          (today.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.dateRange) {
          case "today":
            return daysDiff === 0;
          case "week":
            return daysDiff <= 7;
          case "month":
            return daysDiff <= 30;
          default:
            return true;
        }
      })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCustomerType &&
        matchesDateRange
      );
    });

    // Sort returns
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy.field) {
        case "date":
          comparison =
            new Date(a.requestDate).getTime() -
            new Date(b.requestDate).getTime();
          break;
        case "customer":
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case "amount":
          comparison = a.totalRefundAmount - b.totalRefundAmount;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }

      return sortBy.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, filters, sortBy]);

  // Performance optimization: Memoize summary calculations
  const summaryStats = useMemo(() => {
    const pending = filteredAndSortedReturns.filter(
      (r: ReturnRequest) => r.status === "pending"
    ).length;
    const processed = filteredAndSortedReturns.filter(
      (r: ReturnRequest) => r.status === "processed"
    ).length;
    const totalValue = filteredAndSortedReturns.reduce(
      (sum: number, r: ReturnRequest) => sum + r.totalRefundAmount,
      0
    );

    return {
      total: filteredAndSortedReturns.length,
      pending,
      processed,
      totalValue,
    };
  }, [filteredAndSortedReturns]);

  const handleSort = (field: SortOptions["field"]) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getStatusColor = (status: ReturnRequest["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "approved":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "rejected":
        return "text-red-700 bg-red-100 border-red-200";
      case "processed":
        return "text-green-700 bg-green-100 border-green-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getStatusIcon = (status: ReturnRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "processed":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      dateRange: "all",
      customerType: "all",
    });
    setSearchTerm("");
  };

  const handleNewReturn = () => {
    setShowReturnModal(true);
  };

  const handleProcessReturn = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setShowProcessModal(true);
  };

  const exportReturns = () => {
    // Generate analytics for export
    const mockSalesData = Object.values(customerTransactions)
      .flat()
      .map((tx) => ({
        id: tx.id,
        customerId: parseInt(
          Object.keys(customerTransactions).find((custId) =>
            customerTransactions[parseInt(custId)].some((t) => t.id === tx.id)
          ) || "0"
        ),
        date: tx.date,
        total: tx.amount,
        items: [], // Would need to parse from description in real app
      }));

    const analytics = ReturnAnalyticsEngine.generateAnalytics(
      mockReturnRequests,
      mockSalesData,
      { start: new Date(2025, 0, 1), end: new Date() }
    );

    const csvData = ReturnAnalyticsEngine.exportAnalyticsToCSV(analytics);

    // Create and download CSV file
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `returns-analytics-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleAnalytics = () => {
    setShowAnalytics(true);
  };

  // Bulk actions handlers
  const handleSelectAll = () => {
    if (selectedReturns.length === filteredAndSortedReturns.length) {
      setSelectedReturns([]);
    } else {
      setSelectedReturns(
        filteredAndSortedReturns.map((r: ReturnRequest) => r.id)
      );
    }
  };

  const handleSelectReturn = (returnId: string) => {
    setSelectedReturns((prev) =>
      prev.includes(returnId)
        ? prev.filter((id) => id !== returnId)
        : [...prev, returnId]
    );
  };

  const handleBulkApprove = () => {
    console.log("Bulk approving returns:", selectedReturns);
    setSelectedReturns([]);
    // Implementation would go here
  };

  const handleBulkReject = () => {
    console.log("Bulk rejecting returns:", selectedReturns);
    setSelectedReturns([]);
    // Implementation would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Returns Management
                </h1>
                <p className="text-sm text-gray-600">
                  Process product returns and refunds
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAnalytics}
                className="flex items-center space-x-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button
                onClick={exportReturns}
                className="flex items-center space-x-2 px-4 py-2 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleNewReturn}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Return</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats.total}
                </p>
              </div>
              <RotateCcw className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summaryStats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {summaryStats.processed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₦{summaryStats.totalValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search returns by customer, ID, transaction ID, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value as FilterOptions["status"],
                      }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="processed">Processed</option>
                  </select>
                </div>

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
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-gray-600">
            Showing {filteredAndSortedReturns.length} of{" "}
            {mockReturnRequests.length} returns
          </p>
          <div className="text-sm text-red-600 font-medium">
            Total Refund Value: -₦
            {filteredAndSortedReturns
              .reduce((sum, r) => sum + r.totalRefundAmount, 0)
              .toLocaleString()}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReturns.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-blue-700">
                {selectedReturns.length} return
                {selectedReturns.length > 1 ? "s" : ""} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkApprove}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve All</span>
                </button>
                <button
                  onClick={handleBulkReject}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject All</span>
                </button>
                <button
                  onClick={() => setSelectedReturns([])}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Returns Table */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedReturns.length ===
                          filteredAndSortedReturns.length &&
                        filteredAndSortedReturns.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Request Date
                      <Calendar className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("customer")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Customer
                      <User className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium text-gray-700">
                      Original Transaction
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium text-gray-700">
                      Return Items
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("amount")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Refund Amount
                      <DollarSign className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Status
                      <AlertCircle className="w-4 h-4 ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-700">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedReturns.map((returnRequest) => (
                  <tr key={returnRequest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReturns.includes(returnRequest.id)}
                        onChange={() => handleSelectReturn(returnRequest.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(
                          returnRequest.requestDate
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {returnRequest.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {returnRequest.customerName}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {
                          customers.find(
                            (c) => c.id === returnRequest.customerId
                          )?.type
                        }{" "}
                        customer
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {returnRequest.originalTransactionId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(
                          returnRequest.originalDate
                        ).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {returnRequest.returnItems.map((item, index) => (
                          <div key={index}>
                            {item.quantity} {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-red-600">
                        -₦{returnRequest.totalRefundAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          returnRequest.status
                        )}`}
                      >
                        {getStatusIcon(returnRequest.status)}
                        <span className="ml-1 capitalize">
                          {returnRequest.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedReturn(returnRequest)}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        {returnRequest.status === "pending" && (
                          <button
                            onClick={() => handleProcessReturn(returnRequest)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Process Return"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedReturns.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No returns found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ||
                filters.status !== "all" ||
                filters.dateRange !== "all"
                  ? "Try adjusting your search or filters"
                  : "No return requests have been made yet"}
              </p>
              {!searchTerm &&
                filters.status === "all" &&
                filters.dateRange === "all" && (
                  <button
                    onClick={handleNewReturn}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Create First Return
                  </button>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Return Modal */}
      <ReturnModal
        show={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        customers={customers}
        customerTransactions={customerTransactions}
      />

      {/* Process Return Modal */}
      <ProcessReturnModal
        show={showProcessModal}
        returnRequest={selectedReturn}
        onClose={() => {
          setShowProcessModal(false);
          setSelectedReturn(null);
        }}
        onProcess={() => {
          // Handle return processing
          setShowProcessModal(false);
          setSelectedReturn(null);
        }}
      />

      {/* Return Details Modal */}
      {selectedReturn && !showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Return Details
                </h3>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Return ID
                  </h4>
                  <p className="text-gray-900">{selectedReturn.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Status
                  </h4>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      selectedReturn.status
                    )}`}
                  >
                    {getStatusIcon(selectedReturn.status)}
                    <span className="ml-1 capitalize">
                      {selectedReturn.status}
                    </span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </h4>
                  <p className="text-gray-900">{selectedReturn.customerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Original Transaction
                  </h4>
                  <p className="text-gray-900">
                    {selectedReturn.originalTransactionId}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Request Date
                  </h4>
                  <p className="text-gray-900">
                    {new Date(selectedReturn.requestDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Original Date
                  </h4>
                  <p className="text-gray-900">
                    {new Date(selectedReturn.originalDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Return Reason
                </h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedReturn.reason}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Return Items
                </h4>
                <div className="space-y-2">
                  {selectedReturn.returnItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₦{item.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          ₦{item.price.toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Refund Amount:</span>
                  <span className="text-red-600">
                    -₦{selectedReturn.totalRefundAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedReturn.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedReturn.notes}
                  </p>
                </div>
              )}

              {selectedReturn.processedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Processed By
                    </h4>
                    <p className="text-gray-900">
                      {selectedReturn.processedBy}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Processed Date
                    </h4>
                    <p className="text-gray-900">
                      {selectedReturn.processedDate &&
                        new Date(
                          selectedReturn.processedDate
                        ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedReturn(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedReturn.status === "pending" && (
                <button
                  onClick={() => handleProcessReturn(selectedReturn)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Process Return
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Return Analytics Dashboard
                </h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <ReturnAnalyticsDashboard
                returns={mockReturnRequests}
                salesData={Object.values(customerTransactions)
                  .flat()
                  .map((tx) => ({
                    id: tx.id,
                    customerId: parseInt(
                      Object.keys(customerTransactions).find((custId) =>
                        customerTransactions[parseInt(custId)].some(
                          (t) => t.id === tx.id
                        )
                      ) || "0"
                    ),
                    date: tx.date,
                    total: tx.amount,
                    items: [],
                  }))}
                dateRange={{ start: new Date(2025, 0, 1), end: new Date() }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <ReturnModal
        show={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        customers={customers}
        customerTransactions={customerTransactions}
      />

      {/* Process Return Modal */}
      <ProcessReturnModal
        show={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        returnRequest={selectedReturn}
        onProcess={() => {
          setShowProcessModal(false);
          setSelectedReturn(null);
          // In real app, process the return with decision and notes
        }}
      />
    </div>
  );
};

export default ReturnsPage;
