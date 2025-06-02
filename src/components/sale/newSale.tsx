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
import { Customer, Product, CartItem } from "@/interfaces/interface";
import { SaleType, PaymentMethod } from "@/types/types";
import { customers } from "@/data/customers";
import { products } from "@/data/sales";

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
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
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

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter((item) => item.id !== productId));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
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
    const total = calculateTotal();
    if (paymentMethod === "part_payment") {
      return Math.max(0, total - partPaymentAmount);
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
      setShowDiscountInput(false);
    }, 3000);
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
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">New Sale</h1>
                  <p className="text-xs text-orange-600">Process Transaction</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Transaction ID: #SE{Date.now().toString().slice(-6)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Type Toggle */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sale Type
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSaleType("retail")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    saleType === "retail"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Droplets className="w-5 h-5" />
                    <span className="font-medium">Retail (1-8 Kegs)</span>
                  </div>
                </button>
                <button
                  onClick={() => setSaleType("wholesale")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    saleType === "wholesale"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Wholesale (Drums)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer
                </h2>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Select Customer
                </button>
              </div>

              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedCustomer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedCustomer.phone}
                    </div>
                    {selectedCustomer.balance < 0 && (
                      <div className="text-sm text-red-600">
                        Outstanding: ₦
                        {Math.abs(selectedCustomer.balance).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No customer selected</p>
                  <p className="text-sm">Optional for cash sales</p>
                </div>
              )}
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {saleType === "wholesale"
                  ? "Wholesale Products"
                  : "Retail Products"}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {products[saleType].map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ₦{product.price.toLocaleString()} per {product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Stock</div>
                        <div
                          className={`font-medium ${
                            product.stock < 10
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.stock}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.stock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Cart & Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart</h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          ₦{item.price.toLocaleString()} each
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right ml-3">
                        <div className="font-medium text-gray-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount Section */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Discount
                  </h2>
                  <button
                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    {showDiscountInput ? "Hide" : "Add Discount"}
                  </button>
                </div>

                {showDiscountInput && (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setDiscountType("amount")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          discountType === "amount"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                        }`}
                      >
                        Amount (₦)
                      </button>
                      <button
                        onClick={() => setDiscountType("percentage")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          discountType === "percentage"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                        }`}
                      >
                        Percentage (%)
                      </button>
                    </div>

                    <div className="relative">
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
                    </div>

                    {discountAmount > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm text-green-700">
                          Discount Applied: ₦
                          {calculateDiscount().toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                        max={calculateTotal()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">
                        ₦
                      </span>
                    </div>

                    {partPaymentAmount > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
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

                  {paymentMethod === "credit" && !selectedCustomer && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Customer required for credit sales
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "part_payment" &&
                    (!selectedCustomer || partPaymentAmount === 0) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">
                            {!selectedCustomer
                              ? "Customer required for part payment"
                              : "Enter part payment amount"}
                          </span>
                        </div>
                      </div>
                    )}

                  <button
                    onClick={handleSaleComplete}
                    disabled={
                      (paymentMethod === "credit" && !selectedCustomer) ||
                      (paymentMethod === "part_payment" &&
                        (!selectedCustomer || partPaymentAmount === 0))
                    }
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                      (paymentMethod === "credit" && !selectedCustomer) ||
                      (paymentMethod === "part_payment" &&
                        (!selectedCustomer || partPaymentAmount === 0))
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
          </div>
        </div>
      </div>

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
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                    setSearchTerm("");
                  }}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                  {customer.balance < 0 && (
                    <div className="text-sm text-red-600">
                      Debt: ₦{Math.abs(customer.balance).toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 capitalize">
                    {customer.type} customer
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                ? `Part payment of ₦${partPaymentAmount.toLocaleString()} processed successfully!`
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
