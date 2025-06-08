"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  Cylinder,
  Droplets,
} from "lucide-react";
import { products } from "@/data/sales";
import { InventoryCard } from "@/components/cards/inventoryCard";
import { dashboardStat } from "@/data/stock";
import { getFillDetails } from "@/utils/utils";
import { KEG_CAPACITY } from "@/data/constants";

const InventorySettingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");

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

  // Filter products based on search
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleEditPrice = (productId: string, currentPrice: number) => {
    setEditingPrice(productId);
    setTempPrice(currentPrice.toString());
  };

  const handleSavePrice = (productId: string) => {
    // Here you would typically update the price in your data store
    console.log(`Updating price for ${productId} to ${tempPrice}`);
    setEditingPrice(null);
    setTempPrice("");
    // TODO: Implement actual price update logic
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setTempPrice("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-orange-600" />
              </Link>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Inventory Settings
                </h1>
                <p className="text-sm text-orange-600">
                  Manage your product inventory
                </p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Litres */}
            <InventoryCard
              value={totalAvailableStock}
              unit="Litres"
              icon={Droplets}
              footerText="Total Available"
            />

            {/* Total Drums */}
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

            {/* Total Kegs */}
            <InventoryCard
              value={totalKegs}
              unit="Kegs"
              icon={Cylinder}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
              footerText={`${totalKegs} Kegs (${remainingLitres} Litres)`}
            />

            {/* Total Sold */}
            <InventoryCard
              value={stock?.soldStock || 0}
              unit="Litres"
              icon={Droplets}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              footerText="Total Sold Stock"
            />
          </div>

          {/* Product List */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
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
                  {filteredProducts.map((product) => {
                    const status = getProductStatus(product.stock);
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-orange-50 transition-colors"
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
                          {editingPrice === product.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                className="w-24 px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePrice(product.id)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
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
                              <button
                                onClick={() =>
                                  handleEditPrice(product.id, product.price)
                                }
                                className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
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
                            <button className="text-orange-600 hover:text-orange-800 p-1 rounded-lg hover:bg-orange-50 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-orange-100">
              <h2 className="text-lg font-medium text-gray-900">
                Inventory Settings
              </h2>
              <p className="text-sm text-gray-600">
                Configure automatic alerts and stock management
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Low Stock Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified when products are running low
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Auto-Reorder</p>
                  <p className="text-sm text-gray-600">
                    Automatically reorder products when stock is low
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Stock Tracking</p>
                  <p className="text-sm text-gray-600">
                    Track all inventory movements and changes
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySettingsPage;
