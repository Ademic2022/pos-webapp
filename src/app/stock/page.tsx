"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  Droplets,
  TrendingUp,
  RefreshCw,
  Activity,
  Gauge,
  Plus,
  Calendar,
  Download,
  Settings,
  Cylinder,
} from "lucide-react";
import Link from "next/link";
import { dashboardStat } from "@/data/stock";
import { DeliveryHistory } from "@/interfaces/interface";
import { loggedInUser } from "@/data/user";
import { getFillColor, getFillDetails } from "@/utils/utils";
import { InventoryCard } from "@/components/cards/inventoryCard";
import { KEG_CAPACITY } from "@/data/constants";

const ManageStock: React.FC = () => {
  const stock = dashboardStat.stockData;

  const [currentStock, setCurrentStock] = useState<number>(
    stock?.totalAvailableStock ?? 0
  );

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Form states
  const [deliveryAmount, setDeliveryAmount] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mock delivery history
  const [deliveryHistory, setDeliveryHistory] = useState([stock]);

  const {
    totalDrums,
    totalKegs,
    remainingKegs,
    remainingLitres,
    fillPercentage,
    totalAvailableStock,
  } = getFillDetails();

  // Handle stock addition
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
    const newDelivery: DeliveryHistory = {
      id: deliveryHistory.length + 1,
      amount,
      supplier: selectedSupplier,
      createdAt: new Date(),
      availableStock: currentStock + amount,
      totalAvailableStock: currentStock + amount, // This could be adjusted based on actual stock sold
      soldStock: 0,
    };

    setDeliveryHistory((prev) => [newDelivery, ...prev]);

    // Update stock
    setCurrentStock((prev) => prev + amount);
    setLastUpdate(new Date());

    // Reset form
    setDeliveryAmount("");
    setSelectedSupplier("");
    setDeliveryDate(new Date().toISOString().split("T")[0]);
    setIsSubmitting(false);

    alert(`Successfully added ${amount}L to stock!`);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLastUpdate(new Date());
    // You could add logic here to fetch fresh data from an API
  };

  const suppliers: string[] = [
    "Premium Oil Suppliers Ltd",
    "Golden Harvest Oil Co.",
    "Quality Oil Distributors",
    "Sunrise Oil Trading",
    "Elite Oil Solutions",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Manage Stock
                  </h1>
                  <p className="text-xs text-orange-600">
                    Inventory & Flow Management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Stock Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Current Stock Levels
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
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
        </div>

        {/* Storage Tank */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Storage Tank
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Main Storage Tank
                </h3>
                <p className="text-lg text-gray-600">
                  {totalAvailableStock}L / {stock?.soldStock ?? 0}L
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <Gauge className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-lg text-gray-600 mb-3">
                <span>Fill Level</span>
                <span>{fillPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className={`h-6 rounded-full transition-all duration-500 ${getFillColor(
                    fillPercentage
                  )}`}
                  style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {stock?.availableStock.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Volume (L) since last restock
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600 mb-1">
                  {totalAvailableStock.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Available Capacity (L)
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600 mb-1">
                  {stock.soldStock.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Sold Capacity (L)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Stock & Recent Deliveries */}
        {loggedInUser.is_superuser && (
          <React.Fragment>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Stock Management
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Stock */}
                <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100">
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
                          onChange={(e) => setDeliveryAmount(e.target.value)}
                          placeholder="Enter litres delivered"
                          min="1"
                          max={totalAvailableStock}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                        <span className="absolute right-3 top-3 text-gray-500">
                          Litres
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum capacity: {totalAvailableStock.toLocaleString()}
                        L
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier
                      </label>
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <button
                      onClick={handleAddStock}
                      disabled={isSubmitting}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Recording..." : "Record Delivery"}
                    </button>
                  </div>
                </div>

                {/* Recent Deliveries */}
                <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100">
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
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {deliveryHistory.map((delivery) => (
                      <div
                        key={delivery.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">
                            +{delivery.amount.toLocaleString()}L
                          </span>
                          <span className="text-sm text-gray-500">
                            {delivery.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {delivery.supplier}
                        </p>
                        <p className="text-xs text-gray-500">
                          {delivery.createdAt.toLocaleTimeString()}
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

            {/* Stock Reports */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Stock Reports
              </h2>
              <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Daily Stock Summary
                      </h4>
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Stock levels and movements for today
                    </p>
                    <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                      Generate Report
                    </button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Weekly Inventory Report
                      </h4>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Comprehensive weekly stock analysis
                    </p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Generate Report
                    </button>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Monthly Stock Analysis
                      </h4>
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete monthly inventory overview
                    </p>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      Generate Report
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 mt-6">
                  <button className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export All Data</span>
                  </button>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default ManageStock;
