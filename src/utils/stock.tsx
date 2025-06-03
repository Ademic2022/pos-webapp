import React from "react";
import { Droplet, Package, Droplets } from "lucide-react";
import Link from "next/link";
import { StockDisplayProps, StockStatusConfig } from "@/interfaces/interface";

type StockStatus = "low" | "medium" | "high";

const StockDisplay: React.FC<StockDisplayProps> = ({
  totalAvailableStock,
  totalDrums,
  totalKegs,
  remainingKegs,
  remainingLitres,
}) => {
  // Calculate stock status
  const getStockStatus = (
    value: number,
    thresholds: { low: number; medium: number }
  ): StockStatus => {
    if (value <= thresholds.low) return "low";
    if (value <= thresholds.medium) return "medium";
    return "high";
  };

  // Status thresholds (adjust these as needed)
  const litreStatus = getStockStatus(totalAvailableStock, {
    low: 500,
    medium: 1500,
  });
  const drumStatus = getStockStatus(totalDrums, { low: 10, medium: 30 });
  const kegStatus = getStockStatus(totalKegs, { low: 20, medium: 50 });

  // Color mappings
  const colorMap: Record<StockStatus, StockStatusConfig> = {
    low: {
      bg: "bg-red-50",
      iconBg: "bg-red-200",
      iconColor: "text-red-700",
      textColor: "text-red-600",
      statusText: "Low Stock",
    },
    medium: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-200",
      iconColor: "text-amber-700",
      textColor: "text-amber-600",
      statusText: "Medium Stock",
    },
    high: {
      bg: "bg-green-50",
      iconBg: "bg-green-200",
      iconColor: "text-green-700",
      textColor: "text-green-600",
      statusText: "Good Stock",
    },
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Stock</h2>
      </div>

      <div className="space-y-4">
        {/* Total Litres */}
        <div
          className={`flex items-center justify-between p-4 ${colorMap[litreStatus].bg} rounded-lg`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${colorMap[litreStatus].iconBg} rounded-lg flex items-center justify-center`}
            >
              <Droplet
                className={`w-6 h-6 ${colorMap[litreStatus].iconColor}`}
              />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Total Available in Litres
              </div>
              <div className="text-sm text-gray-600">Current liquid volume</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">
              {totalAvailableStock.toLocaleString()} L
            </div>
            <div className={`text-sm ${colorMap[litreStatus].textColor}`}>
              {colorMap[litreStatus].statusText}
            </div>
          </div>
        </div>

        {/* Wholesale Drums */}
        <div
          className={`flex items-center justify-between p-4 ${colorMap[drumStatus].bg} rounded-lg`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${colorMap[drumStatus].iconBg} rounded-lg flex items-center justify-center`}
            >
              <Package
                className={`w-6 h-6 ${colorMap[drumStatus].iconColor}`}
              />
            </div>
            <div>
              <div className="font-medium text-gray-900">Wholesale Drums</div>
              <div className="text-sm text-gray-600">
                {totalDrums} Drums {Math.floor(remainingKegs / 25)} Kegs
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">{totalDrums} Drums</div>
            <div className={`text-sm ${colorMap[drumStatus].textColor}`}>
              {colorMap[drumStatus].statusText}
            </div>
          </div>
        </div>

        {/* Retail Kegs */}
        <div
          className={`flex items-center justify-between p-4 ${colorMap[kegStatus].bg} rounded-lg`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${colorMap[kegStatus].iconBg} rounded-lg flex items-center justify-center`}
            >
              <Droplets
                className={`w-6 h-6 ${colorMap[kegStatus].iconColor}`}
              />
            </div>
            <div>
              <div className="font-medium text-gray-900">Retail Kegs</div>
              <div className="text-sm text-gray-600">
                {totalKegs} Kegs {remainingLitres} Litres
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">{totalKegs} Kegs</div>
            <div className={`text-sm ${colorMap[kegStatus].textColor}`}>
              {colorMap[kegStatus].statusText}
            </div>
          </div>
        </div>
      </div>
      <Link href="/stock">
        <button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-700 transition-all duration-300 mt-6">
          Manage Stock
        </button>
      </Link>
    </div>
  );
};

export default StockDisplay;
