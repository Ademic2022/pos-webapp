"use client";
import React from "react";
import {
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Clock,
  Droplets,
  Calculator,
  DollarSign,
  FileText,
  Bell,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cardsData } from "@/data/featureCardData";
import StockDisplay from "@/utils/stock";
import CalculatorModal from "@/utils/calculator";
import { getFillDetails, getStockStatus } from "@/utils/utils";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { colorMap } from "@/data/constants";
import { dashboardStat } from "@/data/stock"; // Fallback for loading state
import ProfileDropdown from "@/components/ui/ProfileDropdown";
import { StatsCard } from "../cards/statCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useStockStatus } from "@/hooks/useStockStatus";

const Home = () => {
  const [showCalculator, setShowCalculator] = React.useState(false);

  // Live data hooks
  const {
    dashboardStats,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
    lastUpdated,
  } = useDashboardData();

  const {
    stockLevel: liveStockStatus,
    totalAvailableStock: liveTotalStock,
    isLoading: isStockLoading,
    error: stockError,
    refetch: refetchStock,
  } = useStockStatus();

  // Use live data or fallback to static data during loading
  const currentStats = dashboardStats || dashboardStat;
  const isLoading = isDashboardLoading || isStockLoading;

  // Extract stock delivery data for getFillDetails - map live data to expected format
  const stockDeliveryData = currentStats.stockData
    ? {
        cumulativeStock: currentStats.stockData.totalAvailableStock,
        remainingStock: currentStats.stockData.availableStock,
        soldStock: currentStats.stockData.soldStock,
        stockUtilizationPercentage: Math.round(
          (currentStats.stockData.soldStock /
            (currentStats.stockData.totalAvailableStock || 1)) *
            100
        ),
      }
    : null;

  const {
    totalDrums,
    totalKegs,
    totalAvailableStock,
    remainingKegs,
    remainingLitres,
  } = getFillDetails(stockDeliveryData);

  // Use live stock status or calculate from available data
  const litresStatus =
    !isStockLoading && liveTotalStock > 0
      ? liveStockStatus
      : getStockStatus(totalAvailableStock, "litres");

  const handleRefreshData = async () => {
    await Promise.all([refetchDashboard(), refetchStock()]);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 animate-fadeInUp">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                  Success Enterprise
                </h1>
                <p className="text-xs text-orange-600">POS Management System</p>
              </div>
            </div>
            <nav className="hidden sm:flex items-center space-x-4 md:space-x-8">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Last Updated:{" "}
                  {lastUpdated
                    ? lastUpdated.toLocaleTimeString()
                    : "Loading..."}
                </span>
              </div>

              {/* Refresh Button */}
              <motion.button
                onClick={handleRefreshData}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:scale-105"
                }`}
                whileHover={!isLoading ? { scale: 1.05 } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>{isLoading ? "Refreshing..." : "Refresh Data"}</span>
              </motion.button>

              {/* Error indicator */}
              {(dashboardError || stockError) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
                  title={dashboardError || stockError || "Error occurred"}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Error</span>
                </motion.div>
              )}

              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    delay: 3,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 8,
                  }}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                </motion.div>
                <ProfileDropdown
                  userName="Store Employee"
                  userInitials="SE"
                  userEmail="employee@store.com"
                />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Dashboard Overview */}
      <section className="relative overflow-hidden py-8 md:py-12 animate-fadeInUp">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back to Your POS System
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Manage your groundnut oil distribution business efficiently
            </p>
          </div>

          {/* Quick Stats - Using Live Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="transform transition-all duration-150 hover:-translate-y-1 hover:scale-105">
              <StatsCard
                title="Today's Sales"
                value={
                  isLoading
                    ? "Loading..."
                    : formatCurrency(currentStats.totalSales)
                }
                change={{
                  value: isLoading ? "..." : "+12% from yesterday",
                  textColor: "text-green-600",
                  icon: TrendingUp,
                }}
                icon={DollarSign}
                iconColor="text-green-600"
                iconBg="bg-green-100"
              />
            </div>

            <div className="transform transition-all duration-150 hover:-translate-y-1 hover:scale-105">
              <StatsCard
                title="Transactions"
                value={
                  isLoading
                    ? "Loading..."
                    : formatNumber(
                        currentStats.transaction.totalTransactionCount
                      )
                }
                change={{
                  value: isLoading
                    ? "..."
                    : `${formatNumber(
                        currentStats.transaction.wholeSales
                      )} wholesale, ${formatNumber(
                        currentStats.transaction.retails
                      )} retail`,
                  textColor: "text-blue-600",
                }}
                icon={ShoppingCart}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />
            </div>

            <div className="transform transition-all duration-150 hover:-translate-y-1 hover:scale-105">
              <StatsCard
                title="Outstanding Debt"
                value={
                  isLoading
                    ? "Loading..."
                    : formatCurrency(currentStats.debt.debtValue)
                }
                change={{
                  value: isLoading
                    ? "..."
                    : `${formatNumber(
                        currentStats.debt.customerCount
                      )} customers`,
                  textColor: "text-orange-600",
                }}
                icon={FileText}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
              />
            </div>

            <div className="transform transition-all duration-150 hover:-translate-y-1 hover:scale-105">
              <StatsCard
                title="Stock Alert"
                titleColor={colorMap[litresStatus].textColor}
                cardBg={colorMap[litresStatus].bg}
                value={
                  isLoading
                    ? "Loading..."
                    : `${formatNumber(totalAvailableStock)} L`
                }
                icon={Bell}
                iconBg={colorMap[litresStatus].iconBg}
                iconColor={colorMap[litresStatus].iconColor}
                change={{
                  value: isLoading ? "..." : colorMap[litresStatus].statusText,
                  textColor: colorMap[litresStatus].textColor,
                }}
              />
            </div>
          </div>

          {/* Main Action Cards - Optimized with CSS hover */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Quick Sale */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden transform transition-all duration-150 hover:scale-105 hover:-translate-y-1">
              <div className="relative z-10">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                  Process New Sale
                </h2>
                <p className="text-orange-100 mb-4 md:mb-6">
                  Start a new transaction for wholesale drums or retail kegs
                </p>

                <div className="flex flex-col gap-3 md:gap-4">
                  <Link
                    href="/sales"
                    className="w-full bg-white text-orange-600 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-150 flex items-center justify-center text-sm md:text-base transform hover:scale-105"
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    New Sale
                  </Link>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => setShowCalculator(true)}
                      className="border-2 border-white/30 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-150 flex items-center justify-center text-sm md:text-base transform hover:scale-105"
                    >
                      <Calculator className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Calculator
                    </button>

                    <Link
                      href="validate-sales"
                      className="border-2 border-white/30 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-150 flex items-center justify-center text-sm md:text-base transform hover:scale-105"
                    >
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Validate Sales
                    </Link>
                  </div>
                </div>
              </div>
              <motion.div
                className="absolute -right-6 -top-6 md:-right-8 md:-top-8 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <motion.div
                className="absolute -right-12 -bottom-12 md:-right-16 md:-bottom-16 w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>

            <AnimatePresence>
              {showCalculator && (
                <CalculatorModal
                  isOpen={showCalculator}
                  onClose={() => setShowCalculator(false)}
                />
              )}
            </AnimatePresence>

            {/* Current Inventory - Optimized with CSS hover */}
            <div className="transform transition-all duration-150 hover:scale-105 hover:-translate-y-1">
              <StockDisplay
                totalAvailableStock={totalAvailableStock}
                totalDrums={totalDrums}
                totalKegs={totalKegs}
                remainingLitres={remainingLitres}
                remainingKegs={remainingKegs}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Ultra-optimized with CSS hover */}
      <section className="py-12 bg-white/50 animate-fadeInUp">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardsData.map((card, index) => (
              <div
                key={card.id}
                className="transform transition-all duration-150 hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={card.route} passHref>
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-150 group cursor-pointer">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-150`}
                    >
                      {card.icon}
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                      {card.description}
                    </p>
                    <div
                      className={`flex items-center ${card.textColor} font-medium text-xs md:text-sm group-hover:translate-x-1 transition-transform duration-150`}
                    >
                      {card.id === "customer-management"
                        ? "Open"
                        : card.id === "sales-reports"
                        ? "View Reports"
                        : card.id === "transaction-history"
                        ? "View History"
                        : "Manage"}
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity - Optimized with CSS hover */}
      <section className="py-12 animate-fadeInUp">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-100 transform transition-all duration-150 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm text-left sm:text-right transition-colors duration-150">
                  View All
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2 hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm md:text-base">
                      Adebayo Motors
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      2 Wholesale Drums
                    </div>
                    <div className="text-xs text-gray-500">Today, 2:30 PM</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-bold text-green-600 text-sm md:text-base">
                      ₦18,000
                    </div>
                    <div className="text-xs text-gray-500">PAID</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2 hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm md:text-base">
                      Mrs. Fatima
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      3 Retail Kegs
                    </div>
                    <div className="text-xs text-gray-500">Today, 1:15 PM</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-bold text-gray-900 text-sm md:text-base">
                      ₦4,500
                    </div>
                    <div className="text-xs text-gray-500">CASH</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2 hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm md:text-base">
                      Kemi&apos;s Store
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      5 Retail Kegs
                    </div>
                    <div className="text-xs text-gray-500">Today, 11:45 AM</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-bold text-orange-600 text-sm md:text-base">
                      ₦7,500
                    </div>
                    <div className="text-xs text-orange-500">CREDIT</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-100 transform transition-all duration-150 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  Alerts & Reminders
                </h3>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm text-left sm:text-right transition-colors duration-150">
                  Mark All Read
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 bg-red-50 rounded-lg border-l-4 border-red-400 hover:bg-red-100 transition-colors duration-150">
                  <Bell className="w-4 h-4 md:w-5 md:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-red-800 text-sm md:text-base">
                      Low Stock Alert
                    </div>
                    <div className="text-xs md:text-sm text-red-600">
                      Empty containers are running low (8 units remaining)
                    </div>
                    <div className="text-xs text-red-500 mt-1">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400 hover:bg-orange-100 transition-colors duration-150">
                  <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-orange-800 text-sm md:text-base">
                      Payment Reminder
                    </div>
                    <div className="text-xs md:text-sm text-orange-600">
                      Taiwo Enterprises has ₦15,000 overdue payment
                    </div>
                    <div className="text-xs text-orange-500 mt-1">
                      1 day ago
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 hover:bg-blue-100 transition-colors duration-150">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-800 text-sm md:text-base">
                      Sales Milestone
                    </div>
                    <div className="text-xs md:text-sm text-blue-600">
                      Congratulations! You&apos;ve reached ₦500K in monthly
                      sales
                    </div>
                    <div className="text-xs text-blue-500 mt-1">2 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-8 animate-fadeInUp">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-base md:text-lg font-bold">
                Success Enterprise POS
              </span>
            </div>

            <div className="text-center text-gray-400">
              <p className="text-sm md:text-base">
                &copy; 2025 Success Enterprise. All rights reserved.
              </p>
              <p className="text-xs md:text-sm">
                Internal POS Management System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default Home;
