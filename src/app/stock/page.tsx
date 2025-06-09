
"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  Droplets,
  RefreshCw,
  Activity,
  Gauge,
  Settings,
  Cylinder,
} from "lucide-react";
import Link from "next/link";
import { dashboardStat } from "@/data/stock";
import { getFillColor, getFillDetails } from "@/utils/utils";
import { InventoryCard } from "@/components/cards/inventoryCard";
import { KEG_CAPACITY } from "@/data/constants";
import { usePageLoading } from "@/hooks/usePageLoading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ManageStock: React.FC = () => {
  usePageLoading({
    text: "Loading stock data",
    minDuration: 600,
  });

  const stock = dashboardStat.stockData;

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const {
    totalDrums,
    totalKegs,
    remainingKegs,
    remainingLitres,
    fillPercentage,
    totalAvailableStock,
  } = getFillDetails();

  // Handle refresh
  const handleRefresh = () => {
    setLastUpdate(new Date());
    // You could add logic here to fetch fresh data from an API
  };

  return (
    <ProtectedRoute requiredPermission="MANAGE_STOCK">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                {/* <Link href="/">
                <button className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link> */}
                <Link href="/">
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
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

                <Link href="/inventory/settings">
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white  hover:bg-orange-50 transition-colors">
                    <Settings className="w-5 h-5 text-orange-600" />
                  </button>
                </Link>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
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
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ManageStock;
