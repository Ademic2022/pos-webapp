"use client";
import React, { JSX, useState } from "react";
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
import { ReportFilters } from "@/interfaces/interface";
import { salesData } from "@/data/sales";
import { StatsCard } from "@/components/cards/statCard";
import { usePageLoading } from "@/hooks/usePageLoading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedElement from "@/components/auth/ProtectedElement";

const SalesReportPage = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </button>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Sales Reports
                    </h1>
                    <p className="text-xs text-orange-600">
                      Analytics & Insights
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
                <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </ProtectedElement>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter Reports
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dateRange: e.target.value as ReportFilters["dateRange"],
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
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "transactions"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "customers"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Customer Analysis
                </button>
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="p-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Sales Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sales Breakdown
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
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
                      </div>

                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
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
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
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
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Payment Methods
                    </h3>
                    <div className="space-y-3">
                      {["cash", "transfer", "credit", "part_payment"].map(
                        (method) => {
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
                            <div
                              key={method}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                      {salesData.map((sale) => (
                        <React.Fragment key={sale.id}>
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
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
                              <button
                                onClick={() =>
                                  setSelectedTransaction(
                                    selectedTransaction === sale.id
                                      ? null
                                      : sale.id
                                  )
                                }
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          {selectedTransaction === sale.id && (
                            <tr>
                              <td
                                colSpan={8}
                                className="py-4 px-4 bg-orange-50 border-b"
                              >
                                <div className="space-y-2">
                                  <h4 className="font-medium text-gray-900">
                                    Transaction Details
                                  </h4>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                                        Items Purchased
                                      </h5>
                                      {sale.items.map((item, index) => (
                                        <div
                                          key={index}
                                          className="text-sm text-gray-600"
                                        >
                                          {item.name} x {item.quantity} = ₦
                                          {item.total.toLocaleString()}
                                        </div>
                                      ))}
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                                        Payment Summary
                                      </h5>
                                      <div className="text-sm text-gray-600 space-y-1">
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
                                          Total: ₦{sale.total.toLocaleString()}
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
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customer Analysis Tab */}
            {activeTab === "customers" && (
              <div className="p-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Top Customers */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Customers (by Revenue)
                    </h3>
                    <div className="space-y-3">
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
                          <div
                            key={customer.name}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Customer Debt Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Outstanding Debts
                    </h3>
                    <div className="space-y-3">
                      {salesData
                        .filter((sale) => sale.balance > 0)
                        .sort((a, b) => b.balance - a.balance)
                        .map((sale) => (
                          <div
                            key={sale.id}
                            className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
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
                          </div>
                        ))}

                      {salesData.filter((sale) => sale.balance > 0).length ===
                        0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                          <p>No outstanding debts!</p>
                          <p className="text-sm">
                            All customers are up to date with payments
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Performance Metrics */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customer Performance Metrics
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
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
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
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
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
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
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-700">
                      Export to Excel
                    </span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      Generate PDF Report
                    </span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      Send Customer Statements
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Key Insights
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">
                    Best Performing Day
                  </div>
                  <div className="text-green-600">
                    June 1st with ₦34,500 in sales
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">Top Product</div>
                  <div className="text-blue-600">
                    Wholesale Drums (6 units sold)
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-800">
                    Payment Preference
                  </div>
                  <div className="text-orange-600">
                    60% customers prefer cash payments
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Recommendations
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-yellow-800">
                    Follow Up Required
                  </div>
                  <div className="text-yellow-600">
                    3 customers have overdue payments
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800">
                    Inventory Alert
                  </div>
                  <div className="text-purple-600">
                    Retail stock running low this week
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <div className="font-medium text-indigo-800">
                    Growth Opportunity
                  </div>
                  <div className="text-indigo-600">
                    Wholesale sales up 15% this month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SalesReportPage;
