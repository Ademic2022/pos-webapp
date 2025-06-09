"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Plus,
  Edit,
  Trash2,
  Cylinder,
  Droplets,
  Calendar,
  TrendingUp,
  Activity,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/data/sales";
import { InventoryCard } from "@/components/cards/inventoryCard";
import { dashboardStat } from "@/data/stock";
import { getFillDetails } from "@/utils/utils";
import { KEG_CAPACITY } from "@/data/constants";
import EditPriceModal from "@/components/modals/editPriceModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedElement from "@/components/auth/ProtectedElement";

const InventorySettingsPage: React.FC = () => {
  const [tempPrice, setTempPrice] = useState<string>("");
  const [showStockManagement, setShowStockManagement] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
    category: "wholesale" | "retail";
  } | null>(null);

  // Stock management states
  const [currentStock, setCurrentStock] = useState<number>(
    dashboardStat.stockData?.totalAvailableStock ?? 0
  );
  const [deliveryAmount, setDeliveryAmount] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deliveryHistory, setDeliveryHistory] = useState([
    dashboardStat.stockData,
  ]);

  // Flatten all products from wholesale and retail
  const allProducts = [
    ...products.wholesale.map((p) => ({
      ...p,
      category: "wholesale" as const,
    })),
    ...products.retail.map((p) => ({ ...p, category: "retail" as const })),
  ];

  const stock = dashboardStat.stockData;
  const {
    totalDrums,
    totalKegs,
    remainingKegs,
    remainingLitres,
    totalAvailableStock,
  } = getFillDetails();

  // Calculate status based on stock levels
  const getProductStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "text-green-600 bg-green-100";
      case "Low Stock":
        return "text-yellow-600 bg-yellow-100";
      case "Out of Stock":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Modal functions
  const handleOpenEditModal = (product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
    category: "wholesale" | "retail";
  }) => {
    setSelectedProduct(product);
    setTempPrice(product.price.toString());
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    setTempPrice("");
  };

  const handleSavePriceModal = () => {
    if (selectedProduct) {
      console.log(`Updating price for ${selectedProduct.id} to ${tempPrice}`);
      handleCloseEditModal();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Stock management functions
  const handleAddStock = async () => {
    if (!deliveryAmount || !selectedSupplier || !deliveryDate) {
      alert("Please fill in all fields");
      return;
    }

    const amount = parseFloat(deliveryAmount);
    if (amount <= 0 || amount > currentStock) {
      alert(`Please enter a valid amount between 1 and ${currentStock} litres`);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add to delivery history
    const newDelivery = {
      id: deliveryHistory.length + 1,
      amount,
      supplier: selectedSupplier,
      createdAt: new Date(),
      availableStock: currentStock + amount,
      totalAvailableStock: currentStock + amount,
      soldStock: 0,
    };

    setDeliveryHistory((prev) => [newDelivery, ...prev]);

    // Update stock
    setCurrentStock((prev) => prev + amount);

    // Reset form
    setDeliveryAmount("");
    setSelectedSupplier("");
    setDeliveryDate(new Date().toISOString().split("T")[0]);
    setIsSubmitting(false);

    alert(`Successfully added ${amount}L to stock!`);
  };

  const suppliers: string[] = [
    "Premium Oil Suppliers Ltd",
    "Golden Harvest Oil Co.",
    "Quality Oil Distributors",
    "Sunrise Oil Trading",
    "Elite Oil Solutions",
  ];

  return (
    <ProtectedRoute requireSuperuser={true}>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 hover:scale-110 hover:rotate-3 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </Link>

                <div
                  className="opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: "0.2s",
                    animationFillMode: "forwards",
                  }}
                >
                  <h1 className="text-xl font-bold text-gray-900">
                    Inventory Settings
                  </h1>
                  <p className="text-sm text-orange-600">
                    Manage your product inventory
                  </p>
                </div>
              </div>
              <ProtectedElement requiredPermission="MANAGE_STOCK">
                <button
                  onClick={() => setShowStockManagement(!showStockManagement)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 hover:scale-105 hover:-translate-y-1 transition-all duration-200 opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: "0.4s",
                    animationFillMode: "forwards",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {showStockManagement
                      ? "Close Stock Management"
                      : "Add Product"}
                  </span>
                </button>
              </ProtectedElement>
            </div>
          </div>
        </motion.header>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 opacity-0 animate-fadeInUp"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          <div className="space-y-8">
            {/* Inventory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Litres */}
              <div
                className="hover:-translate-y-2 hover:scale-105 transition-transform duration-300 ease-out opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: "0.8s",
                  animationFillMode: "forwards",
                }}
              >
                <InventoryCard
                  value={totalAvailableStock}
                  unit="Litres"
                  icon={Droplets}
                  footerText="Total Available"
                />
              </div>

              {/* Total Drums */}
              <div
                className="hover:-translate-y-2 hover:scale-105 transition-transform duration-300 ease-out opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: "0.9s",
                  animationFillMode: "forwards",
                }}
              >
                <InventoryCard
                  value={totalDrums}
                  unit="Drums"
                  icon={Cylinder}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  footerText={`${totalDrums} Drums ${Math.floor(
                    remainingKegs / KEG_CAPACITY
                  )} Kegs`}
                />
              </div>

              {/* Total Kegs */}
              <div
                className="hover:-translate-y-2 hover:scale-105 transition-transform duration-300 ease-out opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: "1.0s",
                  animationFillMode: "forwards",
                }}
              >
                <InventoryCard
                  value={totalKegs}
                  unit="Kegs"
                  icon={Cylinder}
                  iconColor="text-orange-600"
                  iconBg="bg-orange-100"
                  footerText={`${totalKegs} Kegs (${remainingLitres} Litres)`}
                />
              </div>

              {/* Total Sold */}
              <div
                className="hover:-translate-y-2 hover:scale-105 transition-transform duration-300 ease-out opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: "1.1s",
                  animationFillMode: "forwards",
                }}
              >
                <InventoryCard
                  value={stock?.soldStock || 0}
                  unit="Litres"
                  icon={Droplets}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  footerText="Total Sold Stock"
                />
              </div>
            </div>

            {/* Stock Management Section */}
            <AnimatePresence>
              {showStockManagement && (
                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0, height: 0, y: -50 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -50 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <h2
                      className="text-2xl font-bold text-gray-900 mb-6 opacity-0 animate-fadeInUp"
                      style={{
                        animationDelay: "0.4s",
                        animationFillMode: "forwards",
                      }}
                    >
                      Stock Management
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Add Stock */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100 hover:scale-105 hover:-translate-y-2 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              Add New Stock
                            </h3>
                            <p className="text-gray-600 mt-1">
                              Record tanker delivery
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Plus className="w-6 h-6 text-green-600" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delivery Amount
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={deliveryAmount}
                                onChange={(e) =>
                                  setDeliveryAmount(e.target.value)
                                }
                                placeholder="Enter litres delivered"
                                min="1"
                                max={totalAvailableStock}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:scale-105 transition-all duration-200"
                                required
                              />
                              <span className="absolute right-3 top-3 text-gray-500">
                                Litres
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Maximum capacity:{" "}
                              {totalAvailableStock.toLocaleString()}L
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Supplier
                            </label>
                            <select
                              value={selectedSupplier}
                              onChange={(e) =>
                                setSelectedSupplier(e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:scale-105 transition-all duration-200"
                              required
                            >
                              <option value="">Select supplier</option>
                              {suppliers.map((supplier) => (
                                <option key={supplier} value={supplier}>
                                  {supplier}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delivery Date
                            </label>
                            <input
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:scale-105 transition-all duration-200"
                              required
                            />
                          </div>

                          <button
                            onClick={handleAddStock}
                            disabled={isSubmitting}
                            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:scale-105 hover:-translate-y-1 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Recording..." : "Record Delivery"}
                          </button>
                        </div>
                      </div>

                      {/* Recent Deliveries */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border border-blue-100 hover:scale-105 hover:-translate-y-2 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              Recent Deliveries
                            </h3>
                            <p className="text-gray-600 mt-1">
                              Latest stock additions
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>

                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {deliveryHistory.map((delivery) => (
                            <div
                              key={delivery.id}
                              className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm hover:scale-105 hover:-translate-y-1 transition-transform duration-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">
                                  +{delivery.amount?.toLocaleString() || 0}L
                                </span>
                                <span className="text-sm text-gray-500">
                                  {delivery.createdAt?.toLocaleDateString() ||
                                    new Date().toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {delivery.supplier || "Supplier N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {delivery.createdAt?.toLocaleTimeString() ||
                                  new Date().toLocaleTimeString()}
                              </p>
                            </div>
                          ))}

                          {deliveryHistory.length === 0 && (
                            <div className="text-center py-8">
                              <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">
                                No deliveries recorded yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product List */}
            <div
              className="bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 opacity-0 animate-fadeInUp"
              style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
            >
              <div className="p-6 border-b border-orange-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Product Inventory
                </h2>
                <p className="text-sm text-gray-600">
                  Manage your product stock levels and settings
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-100">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-orange-100">
                    {allProducts.map((product, index) => {
                      const status = getProductStatus(product.stock);
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-orange-50 hover:scale-101 transition-all duration-200 opacity-0 animate-fadeInUp"
                          style={{
                            animationDelay: `${1.5 + index * 0.05}s`,
                            animationFillMode: "forwards",
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center mr-3">
                                <Package className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Unit: {product.unit}{" "}
                                  {product.category === "wholesale"
                                    ? "Drum"
                                    : "Keg"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.category === "wholesale"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {product.category === "wholesale"
                                ? "Wholesale"
                                : "Retail"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {product.stock}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category === "wholesale"
                                ? "Drums"
                                : "Kegs"}{" "}
                              available
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(product.price)}
                              </div>
                              <div className="text-sm text-gray-500">
                                per{" "}
                                {product.category === "wholesale"
                                  ? "drum"
                                  : "keg"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <ProtectedElement requiredPermission="EDIT_PRICES">
                                <button
                                  onClick={() => handleOpenEditModal(product)}
                                  className="text-orange-600 hover:text-orange-800 p-1 rounded-lg hover:bg-orange-50 hover:scale-125 transition-all duration-200"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </ProtectedElement>
                              <ProtectedElement requiredPermission="DELETE_PRODUCTS">
                                <button className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 hover:scale-125 transition-all duration-200">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </ProtectedElement>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Settings */}
            <div
              className="bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 opacity-0 animate-fadeInUp"
              style={{ animationDelay: "1.8s", animationFillMode: "forwards" }}
            >
              <div className="p-6 border-b border-orange-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Inventory Settings
                </h2>
                <p className="text-sm text-gray-600">
                  Configure automatic alerts and stock management
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:scale-101 hover:translate-x-2 transition-all duration-200 opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: "2.1s",
                    animationFillMode: "forwards",
                  }}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Low Stock Alerts
                    </p>
                    <p className="text-sm text-gray-600">
                      Get notified when products are running low
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hover:scale-110">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>

                <div
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:scale-101 hover:translate-x-2 transition-all duration-200 opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: "2.2s",
                    animationFillMode: "forwards",
                  }}
                >
                  <div>
                    <p className="font-medium text-gray-900">Auto-Reorder</p>
                    <p className="text-sm text-gray-600">
                      Automatically reorder products when stock is low
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hover:scale-110">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>

                <div
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:scale-101 hover:translate-x-2 transition-all duration-200 opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: "2.3s",
                    animationFillMode: "forwards",
                  }}
                >
                  <div>
                    <p className="font-medium text-gray-900">Stock Tracking</p>
                    <p className="text-sm text-gray-600">
                      Track all inventory movements and changes
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hover:scale-110">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Reports */}
            <div
              className="bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 opacity-0 animate-fadeInUp"
              style={{ animationDelay: "2.4s", animationFillMode: "forwards" }}
            >
              <div className="p-6 border-b border-orange-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Stock Reports
                </h2>
                <p className="text-sm text-gray-600">
                  Generate and export inventory reports
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:scale-110 hover:-translate-y-2 transition-transform duration-300 opacity-0 animate-fadeInUp"
                    style={{
                      animationDelay: "2.8s",
                      animationFillMode: "forwards",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Daily Stock Summary
                      </h4>
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Stock levels and movements for today
                    </p>
                    <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 hover:scale-105 hover:-translate-y-1 transition-all duration-200 text-sm">
                      Generate Report
                    </button>
                  </div>

                  <div
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:scale-110 hover:-translate-y-2 transition-transform duration-300 opacity-0 animate-fadeInUp"
                    style={{
                      animationDelay: "3.0s",
                      animationFillMode: "forwards",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Weekly Inventory Report
                      </h4>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Comprehensive weekly stock analysis
                    </p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 hover:scale-105 hover:-translate-y-1 transition-all duration-200 text-sm">
                      Generate Report
                    </button>
                  </div>

                  <div
                    className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:scale-110 hover:-translate-y-2 transition-transform duration-300 opacity-0 animate-fadeInUp"
                    style={{
                      animationDelay: "3.2s",
                      animationFillMode: "forwards",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Monthly Stock Analysis
                      </h4>
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete monthly inventory overview
                    </p>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 hover:scale-105 hover:-translate-y-1 transition-all duration-200 text-sm">
                      Generate Report
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 mt-6">
                  <button className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-orange-600 hover:scale-105 hover:-translate-y-1 transition-all duration-200">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export All Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Price Modal */}
        <AnimatePresence>
          {showEditModal && (
            <EditPriceModal
              isOpen={showEditModal}
              onClose={handleCloseEditModal}
              selectedProduct={selectedProduct}
              tempPrice={tempPrice}
              setTempPrice={setTempPrice}
              onSave={handleSavePriceModal}
              formatPrice={formatPrice}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ProtectedRoute>
  );
};

export default InventorySettingsPage;
