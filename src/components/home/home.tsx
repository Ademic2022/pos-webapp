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
} from "lucide-react";
import Link from "next/link";
import { cardsData } from "@/data/featureCardData";
import StockDisplay from "@/utils/stock";
import CalculatorModal from "@/utils/calculator";
import { getFillDetails, getStockStatus } from "@/utils/utils";
import { colorMap } from "@/data/constants";
import { dashboardStat } from "@/data/stock";
import ProfileDropdown from "@/components/ui/ProfileDropdown";
import { StatsCard } from "../cards/statCard";

const Home = () => {
  const [showCalculator, setShowCalculator] = React.useState(false);
  const {
    totalDrums,
    totalKegs,
    totalAvailableStock,
    remainingKegs,
    remainingLitres,
  } = getFillDetails();

  const litresStatus = getStockStatus(totalAvailableStock, "litres");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
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
                <span>Last Login: Today 9:30 AM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600" />
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
      <section className="relative overflow-hidden py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back to Your POS System
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Manage your groundnut oil distribution business efficiently
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <StatsCard
              title="Today's Sales"
              value={`₦${dashboardStat.totalSales.toLocaleString()}`}
              change={{
                value: "+12% from yesterday",
                textColor: "text-green-600",
                icon: TrendingUp,
              }}
              icon={DollarSign}
              iconColor="text-green-600"
              iconBg="bg-green-100"
            />

            <StatsCard
              title="Transactions"
              value={dashboardStat.transaction.totalTransactionCount.toLocaleString()}
              change={{
                value: `${dashboardStat.transaction.wholeSales.toLocaleString()} wholesale, ${dashboardStat.transaction.retails.toLocaleString()} retail`,
                textColor: "text-blue-600",
              }}
              icon={ShoppingCart}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatsCard
              title="Outstanding Debt"
              value={`₦${dashboardStat.outstandingDebts.debtValue.toLocaleString()}`}
              change={{
                value: `${dashboardStat.outstandingDebts.customerCount.toLocaleString()} customers`,
                textColor: "text-orange-600",
              }}
              icon={FileText}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />

            <StatsCard
              title="Stock Alert"
              titleColor={colorMap[litresStatus].textColor}
              cardBg={colorMap[litresStatus].bg}
              value={`${totalAvailableStock} L`}
              icon={Bell}
              iconBg={colorMap[litresStatus].iconBg}
              iconColor={colorMap[litresStatus].iconColor}
              change={{
                value: colorMap[litresStatus].statusText,
                textColor: colorMap[litresStatus].textColor,
              }}
            />

            {/* <StatsCard
              title="Returns"
              value={`₦${dashboardStat.returns.totalRefundValue.toLocaleString()}`}
              change={{
                value: `${dashboardStat.returns.pendingReturns} pending, ${dashboardStat.returns.processedReturns} processed`,
                textColor: "text-red-600",
              }}
              icon={RotateCcw}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            /> */}
          </div>

          {/* Main Action Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Quick Sale */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
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
                    className="w-full bg-white text-orange-600 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-300 flex items-center justify-center text-sm md:text-base"
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    New Sale
                  </Link>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => setShowCalculator(true)}
                      className="border-2 border-white/30 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-sm md:text-base"
                    >
                      <Calculator className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Calculator
                    </button>

                    <Link
                      href="validate-sales"
                      className="border-2 border-white/30 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-sm md:text-base"
                    >
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Validate Sales
                    </Link>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 -top-6 md:-right-8 md:-top-8 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -right-12 -bottom-12 md:-right-16 md:-bottom-16 w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-full"></div>
            </div>
            <CalculatorModal
              isOpen={showCalculator}
              onClose={() => setShowCalculator(false)}
            />

            {/* Current Inventory */}
            <StockDisplay
              totalAvailableStock={totalAvailableStock}
              totalDrums={totalDrums}
              totalKegs={totalKegs}
              remainingLitres={remainingLitres}
              remainingKegs={remainingKegs}
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardsData.map((card) => (
              <Link href={card.route} key={card.id} passHref>
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
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
                    className={`flex items-center ${card.textColor} font-medium text-xs md:text-sm`}
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
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm text-left sm:text-right">
                  View All
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2">
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2">
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2">
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
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  Alerts & Reminders
                </h3>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm text-left sm:text-right">
                  Mark All Read
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
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

                <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
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

                <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
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
      <footer className="bg-gray-900 text-white py-6 md:py-8">
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
    </div>
  );
};

export default Home;
