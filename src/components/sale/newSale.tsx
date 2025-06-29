"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { motion, AnimatePresence } from "framer-motion";
import { SaleType, PaymentMethod } from "@/types/types";
import { useCustomers, useProducts, useSales } from "@/hooks/useSales";
import { checkStockAvailability } from "@/utils/stockUtils";
import { safeExtractId } from "@/utils/graphqlUtils";
import { KEG_CAPACITY } from "@/data/constants";
import TransactionId from "../TransactionId";
import AddCustomerModal from "../modals/addCustomerModal";

// Import types from hooks instead of interfaces
import type {
  Customer,
  Product,
  CartItem,
  CreateCustomerInput,
} from "@/hooks/useSales";
import { Customer as InterfaceCustomer } from "@/interfaces/interface";

// Type converters for compatibility between frontend and backend types
const convertCustomerInputToModal = (
  input: CreateCustomerInput
): Partial<InterfaceCustomer> => {
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    type: input.type.toLowerCase() as "wholesale" | "retail",
    creditLimit: input.creditLimit,
    notes: input.notes,
  };
};

const convertModalToCustomerInput = (
  modal: Partial<InterfaceCustomer>
): CreateCustomerInput => {
  return {
    name: modal.name || "",
    phone: modal.phone || "",
    email: modal.email,
    address: modal.address,
    type: (modal.type?.toUpperCase() || "RETAIL") as "RETAIL" | "WHOLESALE",
    creditLimit: modal.creditLimit,
    notes: modal.notes,
  };
};

const NewSalePage = () => {
  const router = useRouter();

  // Live data hooks
  const {
    customers,
    isLoading: customersLoading,
    createCustomer,
  } = useCustomers();
  const {
    products,
    totalAvailableStock,
    isLoading: productsLoading,
  } = useProducts();
  const { createSale, isLoading: salesLoading } = useSales();

  // Component state
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
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);
  const [showAddCustomerModal, setShowAddCustomerModal] =
    useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState<CreateCustomerInput>({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "RETAIL",
    creditLimit: 5000,
    notes: "",
  });
  const [customerValidationError, setCustomerValidationError] =
    useState<string>("");

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  // Get products based on sale type
  const currentProducts =
    saleType === "retail" ? products.retail : products.wholesale;

  const addToCart = (product: Product) => {
    const unitKegs = parseInt(product.unit);

    // Check stock availability for this product using live data
    const { isAvailable, remainingStock } = checkStockAvailability(
      unitKegs,
      totalAvailableStock,
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

    // Find the original product data from live products
    const product = currentProducts.find((p) => p.id === productId);
    if (!product) return;

    // If increasing quantity, check stock availability
    if (newQuantity > cartItem.quantity) {
      const unitKegs = parseInt(product.unit);

      const { remainingStock } = checkStockAvailability(
        unitKegs,
        totalAvailableStock,
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
    if (paymentMethod === "part_payment") {
      return Math.max(0, calculateActualAmountOwed(partPaymentAmount));
    }
    return 0;
  };

  const getCustomerDebt = (): number => {
    if (!selectedCustomer || selectedCustomer.balance >= 0) {
      return 0;
    }
    // Ensure the balance is a valid number
    const balance =
      typeof selectedCustomer.balance === "number"
        ? selectedCustomer.balance
        : parseFloat(selectedCustomer.balance) || 0;
    return balance < 0 ? Math.abs(balance) : 0;
  };

  const getCustomerCredit = (): number => {
    if (!selectedCustomer || selectedCustomer.balance <= 0) {
      return 0;
    }
    // Ensure the balance is a valid number
    const balance =
      typeof selectedCustomer.balance === "number"
        ? selectedCustomer.balance
        : parseFloat(selectedCustomer.balance) || 0;
    return balance > 0 ? balance : 0;
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

  // Calculate what customer actually owes after considering their existing credit/debt
  const calculateActualAmountOwed = (paymentReceived: number): number => {
    const currentPurchase = calculateTotal(); // Just the current purchase amount
    const customerCredit = getCustomerCredit(); // Money we owe customer
    const customerDebt = getCustomerDebt(); // Money customer owes us

    // Total amount due = current purchase + existing debt - existing credit
    const totalAmountDue = currentPurchase + customerDebt - customerCredit;

    // Amount still owed = total due - payment received
    return totalAmountDue - paymentReceived;
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

  // Debug: Log data state changes
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Products loaded:", {
        retail: products.retail.length,
        wholesale: products.wholesale.length,
        currentSaleType: saleType,
        totalAvailableStock,
        loading: {
          customersLoading,
          productsLoading,
          salesLoading,
        },
      });
    }
  }, [
    products,
    saleType,
    totalAvailableStock,
    customersLoading,
    productsLoading,
    salesLoading,
  ]);

  // Sale completion function
  const handleSaleComplete = async () => {
    if (!selectedCustomer) {
      setCustomerValidationError(
        "Please select a customer to complete the sale"
      );
      return;
    }

    if (cartItems.length === 0) {
      setCustomerValidationError("Please add items to the cart");
      return;
    }

    // Validate payment amounts based on payment method
    if (paymentMethod === "part_payment" && partPaymentAmount <= 0) {
      setCustomerValidationError("Please enter a valid part payment amount");
      return;
    }

    // Check if customer has enough credit to cover the purchase
    const currentTotal = calculateTotal();
    const customerCredit = getCustomerCredit();
    const customerDebt = getCustomerDebt();
    const actualAmountOwed = currentTotal + customerDebt - customerCredit;

    // Only require payment input if customer doesn't have enough credit to cover the purchase
    const needsPayment = actualAmountOwed > 0;

    if (
      (paymentMethod === "cash" || paymentMethod === "transfer") &&
      needsPayment &&
      paymentAmount <= 0
    ) {
      setCustomerValidationError(
        `Please enter the amount ${
          paymentMethod === "cash" ? "received" : "paid"
        }`
      );
      return;
    }

    try {
      const subtotal = calculateSubtotal();
      const discount = calculateDiscount();
      const total = subtotal - discount;

      // Determine the actual payment amount based on method and customer credit
      let actualPaymentAmount = total;
      if (paymentMethod === "part_payment") {
        actualPaymentAmount = partPaymentAmount;
      } else if (paymentMethod === "cash" || paymentMethod === "transfer") {
        // If customer has enough credit to cover the purchase, no additional payment needed
        if (!needsPayment) {
          actualPaymentAmount = 0;
        } else {
          actualPaymentAmount = paymentAmount;
        }
      } else if (paymentMethod === "credit") {
        actualPaymentAmount = 0; // Credit means no immediate payment
      }

      // Prepare sale data - decode GraphQL IDs to get numeric database IDs
      const decodedCustomerId = safeExtractId(selectedCustomer.id);

      const saleData = {
        customerId: decodedCustomerId,
        saleType: saleType.toUpperCase() as "RETAIL" | "WHOLESALE",
        items: cartItems.map((item) => ({
          productId: safeExtractId(item.id),
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        payments: [
          {
            method: paymentMethod.toUpperCase() as
              | "CASH"
              | "TRANSFER"
              | "CREDIT"
              | "PART_PAYMENT",
            amount: actualPaymentAmount,
          },
        ],
        discount: discount,
      };

      console.log("Creating sale with data:", saleData);
      console.log("Payment details:", {
        method: paymentMethod,
        total: total,
        actualPaymentAmount: actualPaymentAmount,
        paymentAmount: paymentAmount,
        partPaymentAmount: partPaymentAmount,
      });
      console.log("Original customer ID:", selectedCustomer.id);
      console.log("Decoded customer ID:", decodedCustomerId);
      console.log(
        "Cart items with IDs:",
        cartItems.map((item) => ({
          originalId: item.id,
          decodedId: safeExtractId(item.id),
          name: item.name,
        }))
      );

      // Create the sale
      const result = await createSale(saleData);

      if (result.success) {
        // Reset the form
        setCartItems([]);
        setSelectedCustomer(null);
        setDiscountAmount(0);
        setPartPaymentAmount(0);
        setPartPaymentMethod("cash");
        setPaymentAmount(0);
        setShowDiscountInput(false);
        setCustomerValidationError("");
        setShowConfirmation(true);

        // Auto-hide confirmation after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
        }, 3000);
      } else {
        console.error("Sale failed:", result.errors);
        setCustomerValidationError(
          result.errors?.[0] || "Failed to create sale"
        );
      }
    } catch (error) {
      console.error("Error completing sale:", error);
      setCustomerValidationError("An error occurred while processing the sale");
    }
  };

  // ...existing code...

  const handleAddNewCustomer = async () => {
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

    try {
      // Create customer using backend hook
      const result = await createCustomer(newCustomer);

      if (result.success && result.customer) {
        // Select the new customer and close modals
        setSelectedCustomer(result.customer);
        setShowAddCustomerModal(false);
        setShowCustomerModal(false);

        // Auto-set sale type based on customer type
        setSaleType(
          result.customer.type === "WHOLESALE" ? "wholesale" : "retail"
        );

        // Reset the form
        setNewCustomer({
          name: "",
          phone: "",
          email: "",
          address: "",
          type: "RETAIL",
          creditLimit: 5000,
          notes: "",
        });
        setCustomerValidationError("");
      } else {
        setCustomerValidationError(
          result.errors?.[0] || "Failed to create customer"
        );
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setCustomerValidationError(
        "An error occurred while creating the customer"
      );
    }
  };

  // Calculate remaining stock for display
  const calculateRemainingStock = (): number => {
    const usedLiters = cartItems.reduce((total, item) => {
      const itemLiters = parseInt(item.unit) * KEG_CAPACITY * item.quantity;
      return total + itemLiters;
    }, 0);

    return totalAvailableStock - usedLiters;
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
                <button
                  onClick={() => router.back()}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </button>
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
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
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
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
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

              <AnimatePresence mode="wait">
                {selectedCustomer ? (
                  <motion.div
                    key="selected-customer"
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
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

                    <AnimatePresence>
                      {selectedCustomer.balance < 0 && (
                        <motion.div
                          key="customer-debt"
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3 }}
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
                          key="customer-credit"
                          className="bg-green-50 border border-green-200 rounded-lg p-3"
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3 }}
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
                                This will be deducted from the current sale
                                total
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-customer"
                    className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center text-red-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <Users className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    </motion.div>
                    <p className="font-medium">Customer required</p>
                    <p className="text-sm">
                      Please select a customer to complete sale
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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

              <AnimatePresence mode="wait">
                {currentProducts && currentProducts.length > 0 ? (
                  <motion.div
                    key={`products-${saleType}`}
                    className="grid md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {currentProducts.map((product, index) => {
                      const unitKegs = parseInt(product.unit);

                      // Check stock availability for this product
                      const { isAvailable, remainingStock } =
                        checkStockAvailability(
                          unitKegs,
                          totalAvailableStock,
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
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1,
                          }}
                          whileHover={{
                            scale: 1.03,
                            y: -3,
                            boxShadow:
                              "0 10px 25px -5px rgba(251, 146, 60, 0.2)",
                          }}
                          layout
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                ₦{product.price.toLocaleString()} per{" "}
                                {product.unit} keg{unitKegs !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                Available
                              </div>
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
                                })`}{" "}
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-products"
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>
                      {productsLoading
                        ? "Loading products..."
                        : "No products available"}
                    </p>
                    <p className="text-sm">
                      {productsLoading
                        ? "Please wait while we fetch products from the backend"
                        : products.retail.length > 0 ||
                          products.wholesale.length > 0
                        ? `Try switching to ${
                            saleType === "retail" ? "wholesale" : "retail"
                          } products`
                        : "Products are being loaded from the backend..."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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

              <AnimatePresence mode="wait">
                {cartItems.length === 0 ? (
                  <motion.div
                    key="empty-cart"
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
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
                    key="cart-with-items"
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    <AnimatePresence>
                      {cartItems.map((item, index) => {
                        const unitKegs = parseInt(item.unit);
                        return (
                          <motion.div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.05,
                              layout: { duration: 0.3 },
                            }}
                            layout
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
                                ₦{item.price.toLocaleString()} per {unitKegs}{" "}
                                keg
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
                              <motion.span
                                className="w-8 text-center font-medium"
                                key={item.quantity}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.quantity}
                              </motion.span>
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
                              <motion.div
                                className="font-medium text-gray-900"
                                key={item.price * item.quantity}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </motion.div>
                              <div className="text-xs text-gray-500">
                                {unitKegs * item.quantity} keg
                                {unitKegs * item.quantity !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Discount Section */}
            {cartItems.length > 0 && (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
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
            <AnimatePresence>
              {cartItems.length > 0 && (
                <motion.div
                  key="payment-method"
                  className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
                  initial={{ y: 30, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -30, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
                  }}
                >
                  <motion.h2
                    className="text-xl font-semibold text-gray-900 mb-4"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Payment Method
                  </motion.h2>

                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, staggerChildren: 0.1 }}
                  >
                    <motion.button
                      onClick={() => setPaymentMethod("cash")}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === "cash"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{ x: 5 }}
                      >
                        <Banknote className="w-5 h-5" />
                        <span className="font-medium">Cash</span>
                      </motion.div>
                    </motion.button>

                    <motion.button
                      onClick={() => setPaymentMethod("transfer")}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === "transfer"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{ x: 5 }}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium">Bank Transfer</span>
                      </motion.div>
                    </motion.button>

                    <motion.button
                      onClick={() => setPaymentMethod("part_payment")}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === "part_payment"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{ x: 5 }}
                      >
                        <Calculator className="w-5 h-5" />
                        <span className="font-medium">Part Payment</span>
                      </motion.div>
                    </motion.button>

                    <motion.button
                      onClick={() => setPaymentMethod("credit")}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === "credit"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{ x: 5 }}
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Credit (Pay Later)</span>
                      </motion.div>
                    </motion.button>
                  </motion.div>

                  {/* Payment Amount Input for Non-Part Payment Methods */}
                  <AnimatePresence>
                    {paymentMethod !== "part_payment" &&
                      paymentMethod !== "credit" && (
                        <motion.div
                          className="mt-4 space-y-3"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {(() => {
                            // Calculate if payment is needed
                            const currentTotal = calculateTotal();
                            const customerCredit = getCustomerCredit();
                            const customerDebt = getCustomerDebt();
                            const actualAmountOwed =
                              currentTotal + customerDebt - customerCredit;
                            const needsPayment = actualAmountOwed > 0;

                            if (!needsPayment) {
                              // Customer has enough credit - no payment needed, but allow optional additional payment
                              return (
                                <motion.div
                                  className="space-y-3"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <motion.div
                                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Check className="w-5 h-5 text-green-600" />
                                      <div>
                                        <div className="font-medium text-green-800">
                                          No Payment Required
                                        </div>
                                        <div className="text-sm text-green-600">
                                          Customer credit (₦
                                          {customerCredit.toLocaleString()})
                                          covers the full purchase amount (₦
                                          {currentTotal.toLocaleString()})
                                        </div>
                                        {actualAmountOwed < 0 && (
                                          <div className="text-xs text-blue-600 mt-1">
                                            Remaining credit after purchase: ₦
                                            {Math.abs(
                                              actualAmountOwed
                                            ).toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>

                                  {/* Optional Additional Payment */}
                                  <motion.div
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <div className="mb-3">
                                      <h4 className="font-medium text-blue-800 mb-1">
                                        Optional Additional Payment
                                      </h4>
                                      <p className="text-sm text-blue-600">
                                        Customer can make an additional payment
                                        to further increase their credit balance
                                      </p>
                                    </div>

                                    <div className="relative">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Amount{" "}
                                        {paymentMethod === "cash"
                                          ? "Received"
                                          : "Paid"}{" "}
                                        (Optional)
                                      </label>
                                      <input
                                        type="number"
                                        value={paymentAmount || ""}
                                        onChange={(e) => {
                                          const value =
                                            parseFloat(e.target.value) || 0;
                                          setPaymentAmount(Math.max(0, value));
                                        }}
                                        placeholder={`Enter additional amount ${
                                          paymentMethod === "cash"
                                            ? "received from customer"
                                            : "paid"
                                        }`}
                                        className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                      />
                                      <span className="absolute right-3 top-9 text-gray-500">
                                        ₦
                                      </span>
                                    </div>

                                    {paymentAmount > 0 && (
                                      <motion.div
                                        className="mt-3 p-3 bg-blue-100 rounded-lg"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                      >
                                        <div className="text-sm text-blue-800">
                                          <div className="flex justify-between">
                                            <span>Current Credit Balance:</span>
                                            <span className="font-medium">
                                              ₦
                                              {(
                                                customerCredit || 0
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Purchase Amount:</span>
                                            <span className="font-medium">
                                              -₦{currentTotal.toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Additional Payment:</span>
                                            <span className="font-medium text-green-700">
                                              +₦{paymentAmount.toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between font-semibold">
                                            <span>New Credit Balance:</span>
                                            <span className="text-blue-900">
                                              ₦
                                              {(
                                                customerCredit -
                                                currentTotal +
                                                paymentAmount
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                </motion.div>
                              );
                            }

                            // Payment is needed - show input
                            return (
                              <motion.div
                                className="relative"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Amount{" "}
                                  {paymentMethod === "cash"
                                    ? "Received"
                                    : "Paid"}
                                  {actualAmountOwed < currentTotal && (
                                    <span className="text-green-600 text-xs ml-2">
                                      (Only ₦{actualAmountOwed.toLocaleString()}{" "}
                                      needed after credit)
                                    </span>
                                  )}
                                </label>
                                <input
                                  type="number"
                                  value={paymentAmount || ""}
                                  onChange={(e) => {
                                    const value =
                                      parseFloat(e.target.value) || 0;
                                    setPaymentAmount(Math.max(0, value));
                                  }}
                                  placeholder={`Enter amount ${
                                    paymentMethod === "cash"
                                      ? "received from customer"
                                      : "paid"
                                  }`}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <span className="absolute right-3 top-9 text-gray-500">
                                  ₦
                                </span>
                              </motion.div>
                            );
                          })()}

                          <AnimatePresence>
                            {paymentMethod === "cash" && paymentAmount > 0 && (
                              <motion.div
                                className={`border rounded-lg p-3 ${
                                  paymentAmount >= calculateTotal()
                                    ? "bg-green-50 border-green-200"
                                    : "bg-yellow-50 border-yellow-200"
                                }`}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex justify-between items-center text-sm">
                                  <span
                                    className={
                                      paymentAmount >= calculateTotal()
                                        ? "text-green-700"
                                        : "text-yellow-700"
                                    }
                                  >
                                    Amount Due:
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      paymentAmount >= calculateTotal()
                                        ? "text-green-900"
                                        : "text-yellow-900"
                                    }`}
                                  >
                                    ₦{calculateTotal().toLocaleString()}
                                  </span>
                                </div>
                                {selectedCustomer &&
                                  (getCustomerCredit() > 0 ||
                                    getCustomerDebt() > 0) && (
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">
                                        {getCustomerCredit() > 0
                                          ? "Customer Credit:"
                                          : "Customer Debt:"}
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          getCustomerCredit() > 0
                                            ? "text-green-700"
                                            : "text-red-700"
                                        }`}
                                      >
                                        {getCustomerCredit() > 0 ? "-" : "+"}₦
                                        {(
                                          getCustomerCredit() ||
                                          getCustomerDebt() ||
                                          0
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                {paymentAmount > calculateTotal() && (
                                  <div className="flex justify-between items-center text-sm border-t border-green-200 pt-2 mt-2">
                                    <span className="text-green-700">
                                      Change to Give:
                                    </span>
                                    <span className="font-bold text-green-900">
                                      ₦
                                      {(
                                        paymentAmount - calculateTotal()
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {calculateActualAmountOwed(paymentAmount) >
                                  0 && (
                                  <div className="flex justify-between items-center text-sm border-t border-yellow-200 pt-2 mt-2">
                                    <span className="text-yellow-700">
                                      Customer Still Owes:
                                    </span>
                                    <span className="font-bold text-yellow-900">
                                      ₦
                                      {calculateActualAmountOwed(
                                        paymentAmount
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {calculateActualAmountOwed(paymentAmount) < 0 &&
                                  paymentAmount <= calculateTotal() && (
                                    <div className="flex justify-between items-center text-sm border-t border-green-200 pt-2 mt-2">
                                      <span className="text-green-700">
                                        Customer Credit Balance:
                                      </span>
                                      <span className="font-bold text-green-900">
                                        ₦
                                        {Math.abs(
                                          calculateActualAmountOwed(
                                            paymentAmount
                                          )
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                              </motion.div>
                            )}

                            {paymentMethod === "transfer" &&
                              paymentAmount > 0 && (
                                <motion.div
                                  className={`border rounded-lg p-3 ${
                                    paymentAmount >= calculateTotal()
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-yellow-50 border-yellow-200"
                                  }`}
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="flex justify-between items-center text-sm">
                                    <span
                                      className={
                                        paymentAmount >= calculateTotal()
                                          ? "text-blue-700"
                                          : "text-yellow-700"
                                      }
                                    >
                                      Amount Due:
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        paymentAmount >= calculateTotal()
                                          ? "text-blue-900"
                                          : "text-yellow-900"
                                      }`}
                                    >
                                      ₦{calculateTotal().toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span
                                      className={
                                        paymentAmount >= calculateTotal()
                                          ? "text-blue-700"
                                          : "text-yellow-700"
                                      }
                                    >
                                      Transfer Amount:
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        paymentAmount >= calculateTotal()
                                          ? "text-blue-900"
                                          : "text-yellow-900"
                                      }`}
                                    >
                                      ₦{paymentAmount.toLocaleString()}
                                    </span>
                                  </div>
                                  {selectedCustomer &&
                                    (getCustomerCredit() > 0 ||
                                      getCustomerDebt() > 0) && (
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700">
                                          {getCustomerCredit() > 0
                                            ? "Customer Credit:"
                                            : "Customer Debt:"}
                                        </span>
                                        <span
                                          className={`font-medium ${
                                            getCustomerCredit() > 0
                                              ? "text-green-700"
                                              : "text-red-700"
                                          }`}
                                        >
                                          {getCustomerCredit() > 0 ? "-" : "+"}₦
                                          {(
                                            getCustomerCredit() ||
                                            getCustomerDebt() ||
                                            0
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  {calculateActualAmountOwed(paymentAmount) >
                                    0 && (
                                    <div className="flex justify-between items-center text-sm border-t border-yellow-200 pt-2 mt-2">
                                      <span className="text-yellow-700">
                                        Customer Still Owes:
                                      </span>
                                      <span className="font-bold text-yellow-900">
                                        ₦
                                        {calculateActualAmountOwed(
                                          paymentAmount
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {paymentAmount > calculateTotal() && (
                                    <div className="flex justify-between items-center text-sm border-t border-blue-200 pt-2 mt-2">
                                      <span className="text-blue-700">
                                        Excess Transfer Amount:
                                      </span>
                                      <span className="font-bold text-blue-900">
                                        ₦
                                        {(
                                          paymentAmount - calculateTotal()
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {calculateActualAmountOwed(paymentAmount) <
                                    0 &&
                                    paymentAmount <= calculateTotal() && (
                                      <div className="flex justify-between items-center text-sm border-t border-blue-200 pt-2 mt-2">
                                        <span className="text-blue-700">
                                          Customer Credit Balance:
                                        </span>
                                        <span className="font-bold text-blue-900">
                                          ₦
                                          {Math.abs(
                                            calculateActualAmountOwed(
                                              paymentAmount
                                            )
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  {paymentAmount >= calculateTotal() &&
                                    calculateActualAmountOwed(paymentAmount) <=
                                      0 && (
                                      <div className="text-xs text-blue-600 mt-2">
                                        ✓ Transfer amount covers the full sale
                                        amount
                                      </div>
                                    )}
                                </motion.div>
                              )}
                          </AnimatePresence>

                          {/* Cash/Transfer Payment Amount Validation Warning */}
                          <AnimatePresence>
                            {(() => {
                              if (
                                paymentMethod !== "cash" &&
                                paymentMethod !== "transfer"
                              )
                                return false;
                              if (!selectedCustomer) return false;
                              if (paymentAmount > 0) return false;

                              // Check if payment is actually required
                              const currentTotal = calculateTotal();
                              const customerCredit = getCustomerCredit();
                              const customerDebt = getCustomerDebt();
                              const actualAmountOwed =
                                currentTotal + customerDebt - customerCredit;
                              const needsPayment = actualAmountOwed > 0;

                              return needsPayment; // Only show warning if payment is needed
                            })() && (
                              <motion.div
                                className="bg-red-50 border border-red-200 rounded-lg p-3"
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div
                                  className="flex items-center space-x-2 text-red-700"
                                  animate={{ x: [0, 2, -2, 0] }}
                                  transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                  }}
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-sm">
                                    Enter amount{" "}
                                    {paymentMethod === "cash"
                                      ? "received from customer"
                                      : "paid"}
                                  </span>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Part Payment Input */}
                  <AnimatePresence>
                    {paymentMethod === "part_payment" && (
                      <motion.div
                        className="mt-4 space-y-3"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Part Payment Method Selection */}
                        <motion.div
                          className="space-y-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="text-sm font-medium text-gray-700">
                            Part Payment Method
                          </label>
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => setPartPaymentMethod("cash")}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                partPaymentMethod === "cash"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-green-100"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <Banknote className="w-4 h-4" />
                                <span>Cash</span>
                              </div>
                            </motion.button>
                            <motion.button
                              onClick={() => setPartPaymentMethod("transfer")}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                partPaymentMethod === "transfer"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-blue-100"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <CreditCard className="w-4 h-4" />
                                <span>Transfer</span>
                              </div>
                            </motion.button>
                          </div>
                        </motion.div>

                        <motion.div
                          className="relative"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
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
                        </motion.div>

                        <AnimatePresence>
                          {partPaymentAmount > 0 && (
                            <motion.div
                              className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-purple-700">
                                  Payment Method:
                                </span>
                                <span className="font-medium text-purple-900 capitalize">
                                  {partPaymentMethod}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-purple-700">
                                  Payment:
                                </span>
                                <span className="font-medium text-purple-900">
                                  ₦{partPaymentAmount.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-purple-700">
                                  Customer Still Owes:
                                </span>
                                <span className="font-medium text-purple-900">
                                  ₦
                                  {calculateRemainingBalance().toLocaleString()}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Total & Checkout */}
            <AnimatePresence>
              {cartItems.length > 0 && (
                <motion.div
                  key="checkout-section"
                  className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
                  initial={{ y: 30, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -30, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
                  }}
                >
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, staggerChildren: 0.1 }}
                  >
                    <motion.div
                      className="flex justify-between items-center"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-gray-600">Subtotal:</span>
                      <motion.span
                        className="font-medium text-gray-900"
                        key={calculateSubtotal()}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        ₦{calculateSubtotal().toLocaleString()}
                      </motion.span>
                    </motion.div>

                    <AnimatePresence>
                      {discountAmount > 0 && (
                        <motion.div
                          className="flex justify-between items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-green-600">
                            Discount (
                            {discountType === "percentage"
                              ? `${discountAmount}%`
                              : `₦${discountAmount.toLocaleString()}`}
                            ):
                          </span>
                          <motion.span
                            className="font-medium text-green-600"
                            key={calculateDiscount()}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            -₦{calculateDiscount().toLocaleString()}
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="border-t pt-3"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <motion.div
                        className="flex justify-between items-center text-lg"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <span className="font-medium text-gray-900">
                          Total:
                        </span>
                        <motion.span
                          className="font-bold text-gray-900"
                          key={calculateTotal()}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          ₦{calculateTotal().toLocaleString()}
                        </motion.span>
                      </motion.div>
                    </motion.div>

                    <AnimatePresence>
                      {selectedCustomer && getCustomerDebt() > 0 && (
                        <motion.div
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-red-700">
                              Customer Outstanding Debt:
                            </span>
                            <span className="font-medium text-red-700">
                              ₦{(getCustomerDebt() || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-bold border-t border-red-200 pt-2 mt-2">
                            <span className="text-red-800">
                              Grand Total (including debt):
                            </span>
                            <motion.span
                              className="text-red-800"
                              key={calculateActualAmountOwed(0)}
                              initial={{ scale: 1.1 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              ₦{calculateActualAmountOwed(0).toLocaleString()}
                            </motion.span>
                          </div>

                          {/* Show payment impact if payment amounts are entered */}
                          {(paymentMethod === "cash" ||
                            paymentMethod === "transfer") &&
                            paymentAmount > 0 && (
                              <div className="border-t border-red-200 pt-2 mt-2">
                                {calculateActualAmountOwed(paymentAmount) >
                                0 ? (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-red-700">
                                      After Payment - Still Owes:
                                    </span>
                                    <span className="font-medium text-red-700">
                                      ₦
                                      {calculateActualAmountOwed(
                                        paymentAmount
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-700">
                                      After Payment - Credit Balance:
                                    </span>
                                    <span className="font-medium text-green-700">
                                      ₦
                                      {Math.abs(
                                        calculateActualAmountOwed(paymentAmount)
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {selectedCustomer && getCustomerCredit() > 0 && (
                        <motion.div
                          className="bg-green-50 border border-green-200 rounded-lg p-3"
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-700">
                              Customer Available Credit:
                            </span>
                            <span className="font-medium text-green-700">
                              ₦{(getCustomerCredit() || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-bold border-t border-green-200 pt-2 mt-2">
                            <span className="text-green-800">
                              Amount Due (after credit):
                            </span>
                            <motion.span
                              className="text-green-800"
                              key={calculateActualAmountOwed(0)}
                              initial={{ scale: 1.1 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              ₦
                              {Math.max(
                                0,
                                calculateActualAmountOwed(0)
                              ).toLocaleString()}
                            </motion.span>
                          </div>

                          {/* Show payment impact if payment amounts are entered */}
                          {(paymentMethod === "cash" ||
                            paymentMethod === "transfer") &&
                            paymentAmount > 0 && (
                              <div className="border-t border-green-200 pt-2 mt-2">
                                {calculateActualAmountOwed(paymentAmount) >
                                0 ? (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-yellow-700">
                                      After Payment - Still Owes:
                                    </span>
                                    <span className="font-medium text-yellow-700">
                                      ₦
                                      {calculateActualAmountOwed(
                                        paymentAmount
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-700">
                                      After Payment - Credit Balance:
                                    </span>
                                    <span className="font-medium text-green-700">
                                      ₦
                                      {Math.abs(
                                        calculateActualAmountOwed(paymentAmount)
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                          <AnimatePresence>
                            {calculateRemainingCredit() > 0 &&
                              !(
                                (paymentMethod === "cash" ||
                                  paymentMethod === "transfer") &&
                                paymentAmount > 0
                              ) && (
                                <motion.div
                                  className="flex justify-between items-center text-sm border-t border-green-200 pt-2 mt-2"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <span className="text-green-700">
                                    Remaining Credit After Sale:
                                  </span>
                                  <span className="font-medium text-green-700">
                                    ₦
                                    {calculateRemainingCredit().toLocaleString()}
                                  </span>
                                </motion.div>
                              )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {paymentMethod === "part_payment" &&
                        partPaymentAmount > 0 && (
                          <motion.div
                            className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-purple-700">
                                Paying Now:
                              </span>
                              <span className="font-medium text-purple-900">
                                ₦{partPaymentAmount.toLocaleString()}
                              </span>
                            </div>
                            {selectedCustomer &&
                              (getCustomerCredit() > 0 ||
                                getCustomerDebt() > 0) && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700">
                                    {getCustomerCredit() > 0
                                      ? "Customer Credit:"
                                      : "Customer Debt:"}
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      getCustomerCredit() > 0
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }`}
                                  >
                                    {getCustomerCredit() > 0 ? "-" : "+"}₦
                                    {(
                                      getCustomerCredit() ||
                                      getCustomerDebt() ||
                                      0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            {calculateActualAmountOwed(partPaymentAmount) >
                              0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-purple-700">
                                  Customer Still Owes:
                                </span>
                                <span className="font-medium text-red-600">
                                  ₦
                                  {calculateActualAmountOwed(
                                    partPaymentAmount
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {calculateActualAmountOwed(partPaymentAmount) <=
                              0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-green-700">
                                  Customer Credit Balance:
                                </span>
                                <span className="font-medium text-green-600">
                                  ₦
                                  {Math.abs(
                                    calculateActualAmountOwed(partPaymentAmount)
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {!selectedCustomer && (
                        <motion.div
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="flex items-center space-x-2 text-red-700"
                            animate={{ x: [0, 2, -2, 0] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              repeatDelay: 2,
                            }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">
                              Customer must be selected to complete sale
                            </span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {paymentMethod === "part_payment" &&
                        selectedCustomer &&
                        partPaymentAmount === 0 && (
                          <motion.div
                            className="bg-red-50 border border-red-200 rounded-lg p-3"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className="flex items-center space-x-2 text-red-700"
                              animate={{ x: [0, 2, -2, 0] }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2,
                              }}
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">
                                Enter part payment amount
                              </span>
                            </motion.div>
                          </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                      onClick={handleSaleComplete}
                      disabled={(() => {
                        if (!selectedCustomer) return true;

                        if (
                          paymentMethod === "part_payment" &&
                          partPaymentAmount === 0
                        ) {
                          return true;
                        }

                        if (
                          paymentMethod === "cash" ||
                          paymentMethod === "transfer"
                        ) {
                          // Check if customer has enough credit to cover the purchase
                          const currentTotal = calculateTotal();
                          const customerCredit = getCustomerCredit();
                          const customerDebt = getCustomerDebt();
                          const actualAmountOwed =
                            currentTotal + customerDebt - customerCredit;
                          const needsPayment = actualAmountOwed > 0;

                          // Only require payment amount if customer doesn't have enough credit
                          return needsPayment && paymentAmount === 0;
                        }

                        return false;
                      })()}
                      className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${(() => {
                        if (!selectedCustomer)
                          return "bg-gray-300 text-gray-500 cursor-not-allowed";

                        if (
                          paymentMethod === "part_payment" &&
                          partPaymentAmount === 0
                        ) {
                          return "bg-gray-300 text-gray-500 cursor-not-allowed";
                        }

                        if (
                          paymentMethod === "cash" ||
                          paymentMethod === "transfer"
                        ) {
                          const currentTotal = calculateTotal();
                          const customerCredit = getCustomerCredit();
                          const customerDebt = getCustomerDebt();
                          const actualAmountOwed =
                            currentTotal + customerDebt - customerCredit;
                          const needsPayment = actualAmountOwed > 0;

                          if (needsPayment && paymentAmount === 0) {
                            return "bg-gray-300 text-gray-500 cursor-not-allowed";
                          }
                        }

                        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 transform hover:scale-105";
                      })()}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      whileHover={(() => {
                        if (!selectedCustomer) return {};

                        if (
                          paymentMethod === "part_payment" &&
                          partPaymentAmount === 0
                        ) {
                          return {};
                        }

                        if (
                          paymentMethod === "cash" ||
                          paymentMethod === "transfer"
                        ) {
                          const currentTotal = calculateTotal();
                          const customerCredit = getCustomerCredit();
                          const customerDebt = getCustomerDebt();
                          const actualAmountOwed =
                            currentTotal + customerDebt - customerCredit;
                          const needsPayment = actualAmountOwed > 0;

                          if (needsPayment && paymentAmount === 0) {
                            return {};
                          }
                        }

                        return { scale: 1.05, y: -3 };
                      })()}
                      whileTap={(() => {
                        if (!selectedCustomer) return {};

                        if (
                          paymentMethod === "part_payment" &&
                          partPaymentAmount === 0
                        ) {
                          return {};
                        }

                        if (
                          paymentMethod === "cash" ||
                          paymentMethod === "transfer"
                        ) {
                          const currentTotal = calculateTotal();
                          const customerCredit = getCustomerCredit();
                          const customerDebt = getCustomerDebt();
                          const actualAmountOwed =
                            currentTotal + customerDebt - customerCredit;
                          const needsPayment = actualAmountOwed > 0;

                          if (needsPayment && paymentAmount === 0) {
                            return {};
                          }
                        }

                        return { scale: 0.98 };
                      })()}
                    >
                      <motion.div
                        className="flex items-center justify-center space-x-2"
                        whileHover={{ x: 5 }}
                      >
                        <Receipt className="w-5 h-5" />
                        <span>
                          {paymentMethod === "part_payment" &&
                          partPaymentAmount > 0
                            ? `Pay ₦${partPaymentAmount.toLocaleString()} Now`
                            : `Complete Sale - ₦${calculateTotal().toLocaleString()}`}
                        </span>
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowCustomerModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="flex items-center justify-between mb-4"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Customer
                </h3>
                <motion.button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              <motion.div
                className="relative mb-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </motion.div>

              <motion.div
                className="max-h-64 overflow-y-auto space-y-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  {filteredCustomers.length > 0 ? (
                    <motion.div
                      key="customer-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {filteredCustomers.map((customer, index) => (
                        <motion.button
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerModal(false);
                            setSearchTerm("");
                            // Auto-set sale type based on customer type
                            setSaleType(
                              customer.type === "WHOLESALE"
                                ? "wholesale"
                                : "retail"
                            );
                          }}
                          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {customer.phone}
                          </div>
                          {customer.balance < 0 && (
                            <div className="text-sm text-red-600">
                              Debt: ₦
                              {Math.abs(customer.balance).toLocaleString()}
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
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-customers"
                      className="text-center py-8 text-gray-500"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      >
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      </motion.div>
                      <p>No customers found</p>
                      <p className="text-sm mb-4">
                        Try a different search term
                      </p>
                      <motion.button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Add New Customer
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Customer Modal */}
      <AddCustomerModal
        show={showAddCustomerModal}
        newCustomer={convertCustomerInputToModal(newCustomer)}
        setNewCustomer={(customer: Partial<InterfaceCustomer>) =>
          setNewCustomer(convertModalToCustomerInput(customer))
        }
        onClose={() => setShowAddCustomerModal(false)}
        onSubmit={handleAddNewCustomer}
        validationError={customerValidationError}
      />

      {/* Success Confirmation */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-xl p-8 w-full max-w-md mx-4 text-center"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.div
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.5,
                  type: "spring",
                  bounce: 0.5,
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <Check className="w-8 h-8 text-green-600" />
                </motion.div>
              </motion.div>

              <motion.h3
                className="text-xl font-semibold text-gray-900 mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Sale Completed!
              </motion.h3>

              <motion.p
                className="text-gray-600 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {paymentMethod === "part_payment" && partPaymentAmount > 0
                  ? `Part payment of ₦${partPaymentAmount.toLocaleString()} via ${partPaymentMethod} processed successfully!`
                  : `Transaction processed successfully for ₦${calculateTotal().toLocaleString()}`}
              </motion.p>

              <AnimatePresence>
                {paymentMethod === "part_payment" &&
                  calculateRemainingBalance() > 0 && (
                    <motion.p
                      className="text-sm text-red-600 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.6 }}
                    >
                      Remaining balance: ₦
                      {calculateRemainingBalance().toLocaleString()}
                    </motion.p>
                  )}
              </AnimatePresence>

              <motion.div
                className="text-sm text-gray-500"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Receipt will be generated automatically
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewSalePage;
