"use client";
import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  Calculator,
  Plus,
  Minus,
  ArrowLeft,
  Search,
  Droplets,
  CreditCard,
  Banknote,
  Receipt,
  Check,
  X,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Customer, Product, CartItem } from "@/interfaces/interface";
import { SaleType, PaymentMethod } from "@/types/types";
import { customers } from "@/data/customers";
import { products } from "@/data/sales";
import { checkStockAvailability } from "@/utils/stockManager";
import { KEG_CAPACITY } from "@/data/constants";
import { dashboardStat } from "@/data/stock";
import TransactionId from "../TransactionId";
import AddCustomerModal from "../modals/addCustomerModal";

const NewSalePage = () => {
  const [saleType, setSaleType] = useState<SaleType>("retail");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"amount" | "percentage">(
    "amount"
  );
  const [partPaymentAmount, setPartPaymentAmount] = useState<number>(0);
  const [partPaymentMethod, setPartPaymentMethod] = useState<
    "cash" | "transfer"
  >("cash");
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);
  const [showAddCustomerModal, setShowAddCustomerModal] =
    useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "retail",
    creditLimit: 5000,
    notes: "",
  });
  const [customerValidationError, setCustomerValidationError] =
    useState<string>("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const totalStockLiters = dashboardStat.stockData.totalAvailableStock;

  const addToCart = (product: Product) => {
    const unitKegs = parseInt(product.unit);

    // Check stock availability for this product
    const { isAvailable, remainingStock } = checkStockAvailability(
      unitKegs,
      totalStockLiters,
      cartItems
    );

    // Don't add if out of stock
    if (!isAvailable || product.stock === 0) {
      return;
    }

    // Check if adding one more unit would exceed available stock
    const existingItem = cartItems.find((item) => item.id === product.id);

    // Calculate how many more units of this product we can add
    // Each unit consumes unitKegs * KEG_CAPACITY liters
    const litersPerUnit = unitKegs * KEG_CAPACITY;
    const maxUnitsCanAdd = Math.floor(remainingStock / litersPerUnit);

    // Don't add if we can't add any more units
    if (maxUnitsCanAdd < 1) {
      return;
    }

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter((item) => item.id !== productId));
      return;
    }

    // Find the product to check stock limits when increasing quantity
    const cartItem = cartItems.find((item) => item.id === productId);
    if (!cartItem) return;

    // Find the original product data
    const product = products[saleType].find((p) => p.id === productId);
    if (!product) return;

    // If increasing quantity, check stock availability
    if (newQuantity > cartItem.quantity) {
      const unitKegs = parseInt(product.unit);

      const { remainingStock } = checkStockAvailability(
        unitKegs,
        totalStockLiters,
        cartItems
      );

      // Calculate how many liters this new quantity would consume
      const litersPerUnit = unitKegs * KEG_CAPACITY;
      const additionalLitersNeeded =
        (newQuantity - cartItem.quantity) * litersPerUnit;

      // Don't allow increasing if it would exceed available stock
      if (additionalLitersNeeded > remainingStock) {
        return;
      }
    }

    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  const calculateDiscount = (): number => {
    const subtotal = calculateSubtotal();
    if (discountType === "percentage") {
      return (subtotal * discountAmount) / 100;
    }
    return discountAmount;
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.max(0, subtotal - discount);
  };

  const calculateRemainingBalance = (): number => {
    const totalToPay =
      selectedCustomer && (getCustomerDebt() > 0 || getCustomerCredit() > 0)
        ? calculateGrandTotal()
        : calculateTotal();

    if (paymentMethod === "part_payment") {
      return Math.max(0, totalToPay - partPaymentAmount);
    }
    return 0;
  };

  const getCustomerDebt = (): number => {
    if (!selectedCustomer || selectedCustomer.balance >= 0) {
      return 0;
    }
    return Math.abs(selectedCustomer.balance);
  };

  const getCustomerCredit = (): number => {
    if (!selectedCustomer || selectedCustomer.balance <= 0) {
      return 0;
    }
    return selectedCustomer.balance;
  };

  const calculateGrandTotal = (): number => {
    const currentTotal = calculateTotal();
    const customerDebt = getCustomerDebt();
    const customerCredit = getCustomerCredit();

    // If customer has debt, add it to current total
    if (customerDebt > 0) {
      return currentTotal + customerDebt;
    }

    // If customer has credit, deduct it from current total
    if (customerCredit > 0) {
      return Math.max(0, currentTotal - customerCredit);
    }

    return currentTotal;
  };

  const calculateRemainingCredit = (): number => {
    if (!selectedCustomer || selectedCustomer.balance <= 0) {
      return 0;
    }

    const currentTotal = calculateTotal();
    const customerCredit = getCustomerCredit();

    // If credit is more than the current total, return the remaining credit
    if (customerCredit > currentTotal) {
      return customerCredit - currentTotal;
    }

    return 0;
  };

  const handleSaleComplete = () => {
    setShowConfirmation(true);
    // Here you would normally save the transaction to your database
    setTimeout(() => {
      setShowConfirmation(false);
      // Reset form
      setCartItems([]);
      setSelectedCustomer(null);
      setPaymentMethod("cash");
      setDiscountAmount(0);
      setDiscountType("amount");
      setPartPaymentAmount(0);
      setPartPaymentMethod("cash");
      setShowDiscountInput(false);
      setCustomerValidationError("");
    }, 3000);
  };

  const handleAddNewCustomer = () => {
    // Clear previous validation errors
    setCustomerValidationError("");

    if (!newCustomer.name || !newCustomer.phone) {
      setCustomerValidationError("Name and phone number are required");
      return;
    }

    // Check if customer with same phone already exists
    const existingCustomer = customers.find(
      (c) => c.phone === newCustomer.phone
    );
    if (existingCustomer) {
      setCustomerValidationError(
        "A customer with this phone number already exists"
      );
      return;
    }

    // Generate a new customer ID (in a real app, this would come from the backend)
    const newId = Math.max(...customers.map((c) => c.id)) + 1;

    const customerToAdd: Customer = {
      id: newId,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email || "",
      address: newCustomer.address || "",
      type: (newCustomer.type as "wholesale" | "retail") || "retail",
      balance: 0,
      creditLimit: newCustomer.creditLimit || 5000,
      totalPurchases: 0,
      lastPurchase: new Date().toISOString().split("T")[0],
      joinDate: new Date().toISOString().split("T")[0],
      status: "active" as const,
      notes: newCustomer.notes || "",
    };

    // In a real app, you would add this to your database
    // For now, we'll just add it to the local customers array
    customers.push(customerToAdd);

    // Select the new customer and close modals
    setSelectedCustomer(customerToAdd);
    setShowAddCustomerModal(false);
    setShowCustomerModal(false);

    // Auto-set sale type based on customer type
    setSaleType(customerToAdd.type === "wholesale" ? "wholesale" : "retail");

    // Reset the form
    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "retail",
      creditLimit: 5000,
      notes: "",
    });
    setCustomerValidationError("");
  };

  // Calculate remaining stock for display
  const calculateRemainingStock = (): number => {
    const usedLiters = cartItems.reduce((total, item) => {
      const itemLiters = parseInt(item.unit) * KEG_CAPACITY * item.quantity;
      return total + itemLiters;
    }, 0);

    return totalStockLiters - usedLiters;
  };

  const remainingStock = calculateRemainingStock();

  // Calculate total kegs in cart for display
  const calculateTotalKegsInCart = (): number => {
    return cartItems.reduce((total, item) => {
      return total + parseInt(item.unit) * item.quantity;
    }, 0);
  };

  const totalKegsInCart = calculateTotalKegsInCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/">
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </button>
                </Link>
              </motion.div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">New Sale</h1>
                  <p className="text-xs text-orange-600">Process Transaction</p>
                </div>
              </div>
            </div>
            <TransactionId />
          </div>
        </div>
      </motion.header>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.div
          className="grid lg:grid-cols-3 gap-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Left Panel - Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Type Toggle */}
            <div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sale Type
              </h2>
              <div className="flex space-x-4">
                <motion.button
                  onClick={() => setSaleType("retail")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    saleType === "retail"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Droplets className="w-5 h-5" />
                    <span className="font-medium">Retail (1-8 Kegs)</span>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setSaleType("wholesale")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    saleType === "wholesale"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Wholesale (9 Kegs/Drum)</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Customer Selection */}
            <div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer
                </h2>
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => {
                      setShowAddCustomerModal(true);
                      setShowCustomerModal(false);
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 text-sm font-medium shadow-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowCustomerModal(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Select Customer
                  </motion.button>
                </div>
              </div>

              {selectedCustomer ? (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <motion.div
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedCustomer.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedCustomer.phone}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-400 hover:text-gray-600"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </motion.div>

                  {selectedCustomer.balance < 0 && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium text-red-800">
                            Outstanding Debt
                          </div>
                          <div className="text-lg font-bold text-red-700">
                            ₦
                            {Math.abs(
                              selectedCustomer.balance
                            ).toLocaleString()}
                          </div>
                          <div className="text-sm text-red-600">
                            This will be added to the current sale total
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {selectedCustomer.balance > 0 && (
                    <motion.div
                      className="bg-green-50 border border-green-200 rounded-lg p-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-800">
                            Available Credit
                          </div>
                          <div className="text-lg font-bold text-green-700">
                            ₦{selectedCustomer.balance.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-600">
                            This will be deducted from the current sale total
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center text-red-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                  >
                    <Users className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  </motion.div>
                  <p className="font-medium">Customer required</p>
                  <p className="text-sm">
                    Please select a customer to complete sale
                  </p>
                </motion.div>
              )}
            </div>

            {/* Product Selection */}
            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <motion.h2
                className="text-xl font-semibold text-gray-900 mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {saleType === "wholesale"
                  ? "Wholesale Products (9 Kegs/Drum)"
                  : `Retail Products (${remainingStock}L remaining, ${totalKegsInCart} kegs in cart)`}
              </motion.h2>

              <motion.div
                className="grid md:grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {products[saleType].map((product, index) => {
                  const unitKegs = parseInt(product.unit);

                  // Check stock availability for this product
                  const { isAvailable, remainingStock } =
                    checkStockAvailability(
                      unitKegs,
                      totalStockLiters,
                      cartItems
                    );

                  // Determine if product is out of stock
                  const isOutOfStock = !isAvailable || product.stock === 0;

                  // Calculate how many units of this product can be added
                  const litersPerUnit = unitKegs * KEG_CAPACITY;
                  const availableProductUnits = Math.floor(
                    remainingStock / litersPerUnit
                  );

                  return (
                    <motion.div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ₦{product.price.toLocaleString()} per {product.unit}{" "}
                            keg{unitKegs !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Available</div>
                          <div
                            className={`font-medium ${
                              isOutOfStock || availableProductUnits < 1
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : `${availableProductUnits} unit${
                                  availableProductUnits !== 1 ? "s" : ""
                                }`}
                          </div>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock || availableProductUnits < 1}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          isOutOfStock || availableProductUnits < 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                        whileHover={
                          isOutOfStock || availableProductUnits < 1
                            ? {}
                            : { scale: 1.05, y: -2 }
                        }
                        whileTap={
                          isOutOfStock || availableProductUnits < 1
                            ? {}
                            : { scale: 0.95 }
                        }
                      >
                        {isOutOfStock || availableProductUnits < 1
                          ? "Out of Stock"
                          : `Add to Cart (${unitKegs} keg${
                              unitKegs !== 1 ? "s" : ""
                            })`}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Panel - Cart & Checkout */}
          <motion.div
            className="space-y-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {/* Cart */}
            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{
                y: -2,
                boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
              }}
            >
              <motion.h2
                className="text-xl font-semibold text-gray-900 mb-4"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                Cart ({totalKegsInCart} kegs)
              </motion.h2>

              {cartItems.length === 0 ? (
                <motion.div
                  className="text-center py-8 text-gray-500"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  </motion.div>
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to get started</p>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  {cartItems.map((item, index) => {
                    const unitKegs = parseInt(item.unit);
                    return (
                      <motion.div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(249, 250, 251, 1)",
                        }}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            ₦{item.price.toLocaleString()} per {unitKegs} keg
                            {unitKegs !== 1 ? "s" : ""}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <div className="text-right ml-3">
                          <div className="font-medium text-gray-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {unitKegs * item.quantity} keg
                            {unitKegs * item.quantity !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>

            {/* Discount Section */}
            {cartItems.length > 0 && (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                // transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{
                  y: -2,
                  boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.h2
                    className="text-xl font-semibold text-gray-900"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    // transition={{ duration: 0.3, delay: 0.9 }}
                  >
                    Discount
                  </motion.h2>
                  <motion.button
                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    // transition={{ duration: 0.3, delay: 1.0 }}
                  >
                    {showDiscountInput ? "Hide" : "Add Discount"}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showDiscountInput && (
                    <motion.div
                      className="space-y-4"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => setDiscountType("amount")}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            discountType === "amount"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Amount (₦)
                        </motion.button>
                        <motion.button
                          onClick={() => setDiscountType("percentage")}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            discountType === "percentage"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Percentage (%)
                        </motion.button>
                      </div>

                      <motion.div className="relative">
                        <input
                          type="number"
                          value={discountAmount || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setDiscountAmount(0);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                setDiscountAmount(Math.max(0, numValue));
                              }
                            }
                          }}
                          placeholder={`Enter ${
                            discountType === "amount" ? "amount" : "percentage"
                          }`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">
                          {discountType === "amount" ? "₦" : "%"}
                        </span>
                      </motion.div>

                      <AnimatePresence>
                        {discountAmount > 0 && (
                          <motion.div
                            className="bg-green-50 border border-green-200 rounded-lg p-3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="text-sm text-green-700">
                              Discount Applied: ₦
                              {calculateDiscount().toLocaleString()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Payment Method */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "cash"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Banknote className="w-5 h-5" />
                      <span className="font-medium">Cash</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("transfer")}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "transfer"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Bank Transfer</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("part_payment")}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "part_payment"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Calculator className="w-5 h-5" />
                      <span className="font-medium">Part Payment</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("credit")}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "credit"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Credit (Pay Later)</span>
                    </div>
                  </button>
                </div>

                {/* Part Payment Input */}
                {paymentMethod === "part_payment" && (
                  <div className="mt-4 space-y-3">
                    {/* Part Payment Method Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Part Payment Method
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPartPaymentMethod("cash")}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            partPaymentMethod === "cash"
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-green-100"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Banknote className="w-4 h-4" />
                            <span>Cash</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setPartPaymentMethod("transfer")}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            partPaymentMethod === "transfer"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-blue-100"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Transfer</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={partPaymentAmount}
                        onChange={(e) =>
                          setPartPaymentAmount(
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        placeholder="Enter part payment amount"
                        max={
                          selectedCustomer &&
                          (getCustomerDebt() > 0 || getCustomerCredit() > 0)
                            ? calculateGrandTotal()
                            : calculateTotal()
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">
                        ₦
                      </span>
                    </div>

                    {partPaymentAmount > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-700">
                            Payment Method:
                          </span>
                          <span className="font-medium text-purple-900 capitalize">
                            {partPaymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-700">Payment:</span>
                          <span className="font-medium text-purple-900">
                            ₦{partPaymentAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-700">Remaining:</span>
                          <span className="font-medium text-purple-900">
                            ₦{calculateRemainingBalance().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Total & Checkout */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      ₦{calculateSubtotal().toLocaleString()}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">
                        Discount (
                        {discountType === "percentage"
                          ? `${discountAmount}%`
                          : `₦${discountAmount.toLocaleString()}`}
                        ):
                      </span>
                      <span className="font-medium text-green-600">
                        -₦{calculateDiscount().toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="font-bold text-gray-900">
                        ₦{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {selectedCustomer && getCustomerDebt() > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-red-700">
                          Customer Outstanding Debt:
                        </span>
                        <span className="font-medium text-red-700">
                          ₦{getCustomerDebt().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t border-red-200 pt-2 mt-2">
                        <span className="text-red-800">
                          Grand Total (including debt):
                        </span>
                        <span className="text-red-800">
                          ₦{calculateGrandTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedCustomer && getCustomerCredit() > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-700">
                          Customer Available Credit:
                        </span>
                        <span className="font-medium text-green-700">
                          ₦{getCustomerCredit().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t border-green-200 pt-2 mt-2">
                        <span className="text-green-800">
                          Amount Due (after credit):
                        </span>
                        <span className="text-green-800">
                          ₦{calculateGrandTotal().toLocaleString()}
                        </span>
                      </div>
                      {calculateRemainingCredit() > 0 && (
                        <div className="flex justify-between items-center text-sm border-t border-green-200 pt-2 mt-2">
                          <span className="text-green-700">
                            Remaining Credit After Sale:
                          </span>
                          <span className="font-medium text-green-700">
                            ₦{calculateRemainingCredit().toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "part_payment" &&
                    partPaymentAmount > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-700">Paying Now:</span>
                          <span className="font-medium text-purple-900">
                            ₦{partPaymentAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-700">
                            Remaining Balance:
                          </span>
                          <span className="font-medium text-red-600">
                            ₦{calculateRemainingBalance().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                  {!selectedCustomer && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Customer must be selected to complete sale
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "part_payment" &&
                    selectedCustomer &&
                    partPaymentAmount === 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Enter part payment amount
                          </span>
                        </div>
                      </div>
                    )}

                  <button
                    onClick={handleSaleComplete}
                    disabled={
                      !selectedCustomer ||
                      (paymentMethod === "part_payment" &&
                        partPaymentAmount === 0)
                    }
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                      !selectedCustomer ||
                      (paymentMethod === "part_payment" &&
                        partPaymentAmount === 0)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 transform hover:scale-105"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Receipt className="w-5 h-5" />
                      <span>
                        {paymentMethod === "part_payment" &&
                        partPaymentAmount > 0
                          ? `Pay ₦${partPaymentAmount.toLocaleString()} Now`
                          : `Complete Sale - ₦${calculateTotal().toLocaleString()}`}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Customer
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerModal(false);
                      setSearchTerm("");
                      // Auto-set sale type based on customer type
                      setSaleType(
                        customer.type === "wholesale" ? "wholesale" : "retail"
                      );
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {customer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {customer.phone}
                    </div>
                    {customer.balance < 0 && (
                      <div className="text-sm text-red-600">
                        Debt: ₦{Math.abs(customer.balance).toLocaleString()}
                      </div>
                    )}
                    {customer.balance > 0 && (
                      <div className="text-sm text-green-600">
                        Credit: ₦{customer.balance.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 capitalize">
                      {customer.type} customer
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No customers found</p>
                  <p className="text-sm mb-4">Try a different search term</p>
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add New Customer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      <AddCustomerModal
        show={showAddCustomerModal}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onClose={() => setShowAddCustomerModal(false)}
        onSubmit={handleAddNewCustomer}
        validationError={customerValidationError}
      />

      {/* Success Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sale Completed!
            </h3>
            <p className="text-gray-600 mb-4">
              {paymentMethod === "part_payment" && partPaymentAmount > 0
                ? `Part payment of ₦${partPaymentAmount.toLocaleString()} via ${partPaymentMethod} processed successfully!`
                : `Transaction processed successfully for ₦${calculateTotal().toLocaleString()}`}
            </p>
            {paymentMethod === "part_payment" &&
              calculateRemainingBalance() > 0 && (
                <p className="text-sm text-red-600 mb-4">
                  Remaining balance: ₦
                  {calculateRemainingBalance().toLocaleString()}
                </p>
              )}
            <div className="text-sm text-gray-500">
              Receipt will be generated automatically
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSalePage;
