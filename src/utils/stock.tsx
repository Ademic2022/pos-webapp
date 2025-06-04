import React from "react";
import { Droplet, Package, Droplets } from "lucide-react";
import Link from "next/link";
import { StockDisplayProps } from "@/interfaces/interface";
import { getStockStatus } from "./utils";
import { colorMap } from "@/data/constants";

const StockDisplay: React.FC<StockDisplayProps> = ({
  totalAvailableStock,
  totalDrums,
  totalKegs,
  remainingKegs,
  remainingLitres,
}) => {
  const litresStatus = getStockStatus(totalAvailableStock, "litres");
  const drumsStatus = getStockStatus(totalDrums, "drums");
  const kegStatus = getStockStatus(totalDrums, "kegs");

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Stock</h2>
      </div>

      <div className="space-y-4">
        {/* Total Litres */}
        <div
          className={`flex items-center justify-between p-4 ${colorMap[litresStatus].bg} rounded-lg`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${colorMap[litresStatus].iconBg} rounded-lg flex items-center justify-center`}
            >
              <Droplet
                className={`w-6 h-6 ${colorMap[litresStatus].iconColor}`}
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
            <div className={`text-sm ${colorMap[litresStatus].textColor}`}>
              {colorMap[litresStatus].statusText}
            </div>
          </div>
        </div>

        {/* Wholesale Drums */}
        <div
          className={`flex items-center justify-between p-4 ${colorMap[drumsStatus].bg} rounded-lg`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${colorMap[drumsStatus].iconBg} rounded-lg flex items-center justify-center`}
            >
              <Package
                className={`w-6 h-6 ${colorMap[drumsStatus].iconColor}`}
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
            <div className={`text-sm ${colorMap[drumsStatus].textColor}`}>
              {colorMap[drumsStatus].statusText}
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
