"use client";
import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
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
} from "lucide-react";
import Link from "next/link";
import { CustomerFilter } from "@/types/types";
import { Customer } from "@/interfaces/interface";
import { customers as users, customerTransactions } from "@/data/customers";
import PaymentModal from "@/components/modals/paymentModal";
import TransactionHistoryModal from "@/components/modals/transactionHistoryModal";
import DeleteCustomerModal from "@/components/modals/deleteCustomerModal";
import AddCustomerModal from "@/components/modals/addCustomerModal";
import { StatsCard } from "@/components/cards/statCard";

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

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentNote, setPaymentNote] = useState<string>("");

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
    withDebt: customers.filter((c) => c.balance < 0).length,
    totalDebt: customers.reduce(
      (sum, c) => sum + Math.abs(Math.min(0, c.balance)),
      0
    ),
    totalRevenue: customers.reduce((sum, c) => sum + c.totalPurchases, 0),
  };

  const handlePayment = () => {
    if (!selectedCustomer || paymentAmount <= 0) return;

    // Update customer balance
    const updatedCustomers = customers.map((customer) => {
      if (customer.id === selectedCustomer.id) {
        const newBalance = customer.balance + paymentAmount;
        return {
          ...customer,
          balance: newBalance,
          totalPurchases:
            customer.totalPurchases + (paymentAmount > 0 ? paymentAmount : 0),
          lastPurchase: new Date().toISOString().split("T")[0],
        };
      }
      return customer;
    });

    // Create transaction record
    // const newTransaction = {
    //   id: `pay-${Date.now()}`,
    //   date: new Date().toISOString().split("T")[0],
    //   type: "payment",
    //   description: `Payment received (${paymentMethod})`,
    //   amount: paymentAmount,
    //   balance: selectedCustomer.balance + paymentAmount,
    //   note: paymentNote,
    // };

    // Update transactions (assuming you have a state for transactions)
    // const customerId = selectedCustomer.id;
    // const updatedTransactions = {
    //   ...customerTransactions,
    //   [customerId]: [
    //     ...(customerTransactions[customerId] || []),
    //     newTransaction,
    //   ],
    // };

    // Update state
    setCustomers(updatedCustomers);
    // setCustomerTransactions(updatedTransactions);
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setPaymentMethod("cash");
    setPaymentNote("");
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
          <StatsCard
            title="Total Customers"
            value={customerStats.total}
            icon={Users}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />

          <StatsCard
            title="Outstanding Debt"
            value={`₦${customerStats.totalDebt.toLocaleString()}`}
            change={{
              value: `${customerStats.withDebt} customers`,
              icon: AlertCircle,
              textColor: "text-red-600",
            }}
            icon={DollarSign}
            iconBg="bg-red-100"
            iconColor="text-red-600"
          />

          <StatsCard
            title="Stock Alert"
            value={`${customerStats.totalRevenue}L`}
            change={{
              value: "Lifetime value",
              icon: TrendingUp,
              textColor: "text-green-600",
            }}
            icon={Package}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />

          <StatsCard
            title="Active Customers"
            value={customers.filter((c) => c.status === "active").length}
            change={{
              value: `${(
                (customers.filter((c) => c.status === "active").length /
                  customerStats.total) *
                100
              ).toFixed(1)}% active rate`,
              icon: CheckCircle,
              textColor: "text-orange-600",
            }}
            icon={CheckCircle}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
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
              {(["all", "debt", "active", "inactive"] as CustomerFilter[]).map(
                (filter) => (
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
                )
              )}
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
                        {customer.balance < 0 && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
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
      <AddCustomerModal
        show={showAddModal}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCustomer}
        validationError=""
      />

      {/* Debt Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <PaymentModal
          show={showPaymentModal}
          customer={selectedCustomer}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentNote={paymentNote}
          setPaymentNote={setPaymentNote}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePayment}
        />
      )}

      {/* Transaction History Modal */}
      {showTransactionHistory && selectedCustomer && (
        <TransactionHistoryModal
          show={showTransactionHistory}
          customer={selectedCustomer}
          transactions={customerTransactions}
          onClose={() => setShowTransactionHistory(false)}
          onRecordPayment={() => setShowPaymentModal(true)}
          getBalanceColor={getBalanceColor}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <DeleteCustomerModal
          show={showDeleteModal}
          customerName={selectedCustomer.name}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteCustomer}
        />
      )}
    </div>
  );
};

export default CustomerManagementPage;
