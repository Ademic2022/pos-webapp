"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { getFillColor } from "@/utils/utils";
import { InventoryCard } from "@/components/cards/inventoryCard";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useInventory } from "@/hooks/useInventory";
import { formatNumber } from "@/utils/formatters";
import { KEG_CAPACITY } from "@/data/constants";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ManageStock: React.FC = () => {
  const router = useRouter();

  usePageLoading({
    text: "Loading stock data",
    minDuration: 600,
  });

  // Use live inventory data instead of static mock data
  const {
    latestStockDelivery,
    fillDetails,
    isLoading,
    error,
    refetchInventory,
  } = useInventory();

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Extract fill details from live data
  const {
    totalDrums,
    totalKegs,
    remainingKegs,
    remainingLitres,
    fillPercentage,
    totalAvailableStock,
    soldStock,
  } = fillDetails;

  // Handle refresh - now fetches live data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    try {
      await refetchInventory();
    } catch (error) {
      console.error("Failed to refresh inventory:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="MANAGE_STOCK">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Loading stock data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Stock Data
              </h3>
              <p className="text-gray-600 mb-4">
                Unable to fetch inventory information
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Try Again
              </motion.button>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading &&
          !error &&
          !latestStockDelivery &&
          totalAvailableStock === 0 && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Stock Data Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first stock delivery
                </p>
                <Link href="/inventory/settings">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Add Stock
                  </motion.button>
                </Link>
              </div>
            </div>
          )}
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50"
                >
                  <ArrowLeft className="w-5 h-5 text-orange-600" />
                </motion.button>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <motion.div
                    // whileHover={{ rotate: 10 }}
                    className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center"
                  >
                    <Droplets className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Manage Stock
                    </h1>
                    <p className="text-xs text-orange-600">
                      Inventory & Flow Management
                    </p>
                  </div>
                </motion.div>
              </div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isRefreshing
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={
                      isRefreshing
                        ? { duration: 1, repeat: Infinity, ease: "linear" }
                        : { duration: 0.3 }
                    }
                    whileHover={!isRefreshing ? { rotate: 180 } : {}}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm font-medium">
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </span>
                </motion.button>

                <Link href="/inventory/settings">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-orange-50"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Settings className="w-5 h-5 text-orange-600" />
                    </motion.div>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Current Stock Overview */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Current Stock Levels
              </h2>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-2 text-sm text-gray-600"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Activity className="w-4 h-4" />
                </motion.div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12"
            >
              {/* Total Litres */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <InventoryCard
                  value={totalAvailableStock}
                  unit="Litres"
                  icon={Droplets}
                  footerText="Total Available"
                />
              </motion.div>

              {/* Total Drums */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
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
              </motion.div>

              {/* Total Kegs */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                {" "}
                <InventoryCard
                  value={totalKegs}
                  unit="Kegs"
                  icon={Cylinder}
                  iconColor="text-orange-600"
                  iconBg="bg-orange-100"
                  footerText={`${totalKegs} Kegs (${remainingLitres} Litres)`}
                />
              </motion.div>

              {/* Total Sold */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <InventoryCard
                  value={soldStock || 0}
                  unit="Litres"
                  icon={Droplets}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  footerText="Total Sold Stock"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Storage Tank */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mb-8"
          >
            <motion.h2
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              Storage Tank
            </motion.h2>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-orange-100"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Main Storage Tank
                  </h3>
                  <p className="text-lg text-gray-600">
                    {totalAvailableStock}L / {soldStock || 0}L
                  </p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center"
                >
                  <Gauge className="w-8 h-8 text-blue-600" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.7 }}
                className="mb-6"
              >
                <div className="flex justify-between text-lg text-gray-600 mb-3">
                  <span>Fill Level</span>
                  <span>{fillPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(fillPercentage, 100)}%` }}
                    transition={{ delay: 1.8, duration: 1, ease: "easeOut" }}
                    className={`h-6 rounded-full ${getFillColor(
                      fillPercentage
                    )}`}
                  ></motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.9 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2.0 }}
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-blue-50 rounded-lg"
                >
                  <div className="text-xl font-bold text-blue-600 mb-1">
                    {formatNumber(
                      latestStockDelivery?.remainingStock || totalAvailableStock
                    )}
                    L
                  </div>
                  <div className="text-sm text-gray-600">
                    Volume (L) since last restock
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-green-50 rounded-lg"
                >
                  <div className="text-xl font-bold text-green-600 mb-1">
                    {formatNumber(totalAvailableStock)}L
                  </div>
                  <div className="text-sm text-gray-600">
                    Available Capacity (L)
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2.2 }}
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-green-50 rounded-lg"
                >
                  <div className="text-xl font-bold text-green-600 mb-1">
                    {formatNumber(soldStock || 0)}L
                  </div>
                  <div className="text-sm text-gray-600">Sold Capacity (L)</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default ManageStock;
