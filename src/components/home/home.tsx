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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Success Enterprise
                </h1>
                <p className="text-xs text-orange-600">POS Management System</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last Login: Today 9:30 AM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-700">
                    SE
                  </span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Dashboard Overview */}
      <section className="relative overflow-hidden py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back to Your POS System
            </h1>
            <p className="text-lg text-gray-600">
              Manage your groundnut oil distribution business efficiently
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Today&apos;s Sales
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{dashboardStat.totalSales.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">+12% from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStat.transaction.totalTransactionCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600">
                    {dashboardStat.transaction.wholeSales.toLocaleString()}{" "}
                    wholesale,{" "}
                    {dashboardStat.transaction.retails.toLocaleString()} retail
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Outstanding Debt</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{dashboardStat.outstandingDebts.debtValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-orange-600">
                    {dashboardStat.outstandingDebts.customerCount.toLocaleString()}{" "}
                    customers
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl p-6 shadow-lg border ${colorMap[litresStatus].bg} border-orange-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${colorMap[litresStatus].textColor} mb-1`}
                  >
                    Stock Alert
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAvailableStock} L
                  </p>
                  <p className={`text-sm ${colorMap[litresStatus].textColor}`}>
                    {colorMap[litresStatus].statusText}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${colorMap[litresStatus].iconBg} rounded-lg flex items-center justify-center`}
                >
                  <Bell
                    className={`w-6 h-6 ${colorMap[litresStatus].iconColor}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Action Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Quick Sale */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Process New Sale</h2>
                <p className="text-orange-100 mb-6">
                  Start a new transaction for wholesale drums or retail kegs
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <Link
                    href="/sales"
                    className="min-w-[250px] bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-300 flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    New Sale
                  </Link>

                  <button
                    onClick={() => setShowCalculator(true)}
                    className="min-w-[250px] border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Quick Calculator
                  </button>

                  <Link
                    href="validate-sales"
                    className="min-w-[250px] border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Validate Sales
                  </Link>
                </div>
              </div>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-white/5 rounded-full"></div>
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
                <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {card.description}
                  </p>
                  <div
                    className={`flex items-center ${card.textColor} font-medium text-sm`}
                  >
                    {card.id === "customer-management"
                      ? "Open"
                      : card.id === "sales-reports"
                      ? "View Reports"
                      : card.id === "transaction-history"
                      ? "View History"
                      : "Manage"}
                    <ArrowRight className="w-4 h-4 ml-1" />
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
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      Adebayo Motors
                    </div>
                    <div className="text-sm text-gray-600">
                      2 Wholesale Drums
                    </div>
                    <div className="text-xs text-gray-500">Today, 2:30 PM</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₦18,000</div>
                    <div className="text-xs text-gray-500">PAID</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Mrs. Fatima</div>
                    <div className="text-sm text-gray-600">3 Retail Kegs</div>
                    <div className="text-xs text-gray-500">Today, 1:15 PM</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">₦4,500</div>
                    <div className="text-xs text-gray-500">CASH</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      Kemi&apos;s Store
                    </div>
                    <div className="text-sm text-gray-600">5 Retail Kegs</div>
                    <div className="text-xs text-gray-500">Today, 11:45 AM</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">₦7,500</div>
                    <div className="text-xs text-orange-500">CREDIT</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Alerts & Reminders
                </h3>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  Mark All Read
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <Bell className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">
                      Low Stock Alert
                    </div>
                    <div className="text-sm text-red-600">
                      Empty containers are running low (8 units remaining)
                    </div>
                    <div className="text-xs text-red-500 mt-1">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-800">
                      Payment Reminder
                    </div>
                    <div className="text-sm text-orange-600">
                      Taiwo Enterprises has ₦15,000 overdue payment
                    </div>
                    <div className="text-xs text-orange-500 mt-1">
                      1 day ago
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">
                      Sales Milestone
                    </div>
                    <div className="text-sm text-blue-600">
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
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Success Enterprise POS</span>
            </div>

            <div className="text-center text-gray-400">
              <p>&copy; 2025 Success Enterprise. All rights reserved.</p>
              <p className="text-sm">Internal POS Management System</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
