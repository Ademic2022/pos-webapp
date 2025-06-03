"use client";
import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  Download,
  ArrowLeft,
  Eye,
  AlertCircle,
  CheckCircle,
  Package,
  TrendingUp,
  X,
  User,
  Building,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { CustomerFilter } from "@/types/types";
import { Customer } from "@/interfaces/interface";
import { customers as users, customerTransactions } from "@/data/customers";

const CustomerManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<CustomerFilter>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showTransactionHistory, setShowTransactionHistory] =
    useState<boolean>(false);

  // Sample customer data
  const [customers, setCustomers] = useState<Customer[]>(users);

  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "retail",
    creditLimit: 5000,
    notes: "",
  });

  console.log(showEditModal);

  // Filter customers based on search and filter criteria
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = (() => {
      switch (selectedFilter) {
        case "wholesale":
          return customer.type === "wholesale";
        case "retail":
          return customer.type === "retail";
        case "debt":
          return customer.balance < 0;
        case "active":
          return customer.status === "active";
        case "inactive":
          return customer.status === "inactive";
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  // Calculate summary statistics
  const customerStats = {
    total: customers.length,
    wholesale: customers.filter((c) => c.type === "wholesale").length,
    retail: customers.filter((c) => c.type === "retail").length,
    withDebt: customers.filter((c) => c.balance < 0).length,
    totalDebt: customers.reduce(
      (sum, c) => sum + Math.abs(Math.min(0, c.balance)),
      0
    ),
    totalRevenue: customers.reduce((sum, c) => sum + c.totalPurchases, 0),
  };

  const handleAddCustomer = () => {
    const customer: Customer = {
      id: Math.max(...customers.map((c) => c.id)) + 1,
      name: newCustomer.name || "",
      phone: newCustomer.phone || "",
      email: newCustomer.email || "",
      address: newCustomer.address || "",
      type: newCustomer.type || "retail",
      balance: 0,
      creditLimit: newCustomer.creditLimit || 5000,
      totalPurchases: 0,
      lastPurchase: "",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      notes: newCustomer.notes || "",
    };

    setCustomers([...customers, customer]);
    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "retail",
      creditLimit: 5000,
      notes: "",
    });
    setShowAddModal(false);
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
      setSelectedCustomer(null);
      setShowDeleteModal(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div className="flex items-center space-x-3">
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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Customer</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerStats.total}
                </p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {customerStats.wholesale} wholesale, {customerStats.retail}{" "}
                  retail
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Outstanding Debt</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{customerStats.totalDebt.toLocaleString()}
                </p>
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {customerStats.withDebt} customers
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock Alert</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerStats.totalRevenue}L
                </p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Lifetime value
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter((c) => c.status === "active").length}
                </p>
                <p className="text-sm text-orange-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {(
                    (customers.filter((c) => c.status === "active").length /
                      customerStats.total) *
                    100
                  ).toFixed(1)}
                  % active rate
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "all",
                  "wholesale",
                  "retail",
                  "debt",
                  "active",
                  "inactive",
                ] as CustomerFilter[]
              ).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter === "debt" && customerStats.withDebt > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {customerStats.withDebt}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    Type
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
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
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
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {customer.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          customer.type === "wholesale"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {customer.type}
                      </span>
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
                            setSelectedCustomer(customer);
                            setShowTransactionHistory(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Transaction History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Customer
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="customer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type *
                  </label>
                  <select
                    value={newCustomer.type}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        type: e.target.value as "wholesale" | "retail",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Customer address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={newCustomer.creditLimit}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        creditLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes about the customer"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name || !newCustomer.phone}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionHistory && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transaction History
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowTransactionHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Summary */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">
                    Current Balance
                  </div>
                  <div
                    className={`text-lg font-bold ${getBalanceColor(
                      selectedCustomer.balance
                    )}`}
                  >
                    ₦{Math.abs(selectedCustomer.balance).toLocaleString()}
                    {selectedCustomer.balance < 0 && (
                      <span className="text-sm ml-1">(debt)</span>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">
                    Total Purchases
                  </div>
                  <div className="text-lg font-bold text-green-900">
                    ₦{selectedCustomer.totalPurchases.toLocaleString()}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600 mb-1">
                    Credit Limit
                  </div>
                  <div className="text-lg font-bold text-orange-900">
                    ₦{selectedCustomer.creditLimit.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Transaction List */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Recent Transactions
                </h4>
                {customerTransactions[selectedCustomer.id]?.length ? (
                  customerTransactions[selectedCustomer.id].map(
                    (transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.type === "sale"
                                ? "bg-blue-100"
                                : transaction.type === "payment"
                                ? "bg-green-100"
                                : "bg-orange-100"
                            }`}
                          >
                            {transaction.type === "sale" ? (
                              <Package className="w-4 h-4 text-blue-600" />
                            ) : transaction.type === "payment" ? (
                              <DollarSign className="w-4 h-4 text-green-600" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.description}
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.date} • {transaction.id}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-medium ${
                              transaction.type === "payment"
                                ? "text-green-600"
                                : "text-gray-900"
                            }`}
                          >
                            {transaction.type === "payment" ? "+" : ""}₦
                            {transaction.amount.toLocaleString()}
                          </div>
                          <div
                            className={`text-sm ${getBalanceColor(
                              transaction.balance
                            )}`}
                          >
                            Balance: ₦
                            {Math.abs(transaction.balance).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Customer
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <strong>{selectedCustomer.name}</strong>? All transaction
                history will be permanently removed.
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;
