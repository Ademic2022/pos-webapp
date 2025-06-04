"use client";
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calculator,
  Fuel,
  Droplets,
  ArrowLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { MeterReading, ValidationResult } from "@/types/types";
import { generateMockData } from "@/data/sales";
import { loggedInUser } from "@/data/user";
import MeterReadingReports from "@/components/reports/validationReport";
import { dailyMeterReading } from "@/data/stock";

const FuelValidationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"validation" | "reports">(
    "validation"
  );
  const [startReading, setStartReading] = useState<number>(
    dailyMeterReading.startReading
  );
  const [endReading, setEndReading] = useState<string>(
    (dailyMeterReading?.endReading ?? "").toString() || ""
  );
  const [totalSales, setTotalSales] = useState<number>(
    dailyMeterReading.totalSales
  );
  const [tolerance, setTolerance] = useState<number>(1);
  const [validation, setValidation] = useState<ValidationResult>(null);
  const [mockReadings] = useState<MeterReading[]>(generateMockData());
  useState<MeterReading[]>(mockReadings);

  const calculateValidation = (): ValidationResult => {
    if (!endReading) return null;

    const meterDifference = parseFloat(endReading) - startReading;
    const discrepancy = Math.abs(meterDifference - totalSales);
    const discrepancyPercentage = (discrepancy / totalSales) * 100;

    const status = discrepancy <= tolerance ? "valid" : "invalid";

    return {
      meterDifference: meterDifference.toFixed(2),
      totalSales: totalSales.toFixed(2),
      discrepancy: discrepancy.toFixed(2),
      discrepancyPercentage: discrepancyPercentage.toFixed(2),
      status,
      withinTolerance: discrepancy <= tolerance,
    };
  };

  const saveReading = () => {
    if (!validation || !endReading) return;

    const newReading: MeterReading = {
      id: `${startReading}-${
        new Date().toISOString().split("T")[0]
      }-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      startReading,
      endReading: parseFloat(endReading),
      totalSales,
      discrepancy: parseFloat(validation.discrepancy),
      status: validation.status,
      operator: loggedInUser.username,
    };

    console.log("Saving new reading:", newReading);

    // In a real app, you would save this to a database
    alert("Reading saved successfully!");
  };

  useEffect(() => {
    setValidation(calculateValidation());
  }, [startReading, endReading, totalSales, tolerance]);

  const getStatusColor = (status: "valid" | "invalid" | null): string => {
    switch (status) {
      case "valid":
        return "text-green-700 bg-green-50 border-green-200";
      case "invalid":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (
    status: "valid" | "invalid" | null
  ): React.ReactNode => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-6 h-6" />;
      case "invalid":
        return <XCircle className="w-6 h-6" />;
      default:
        return <Calculator className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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
                    Sales Validation System
                  </h1>
                  <p className="text-xs text-orange-600">
                    Daily Meter Tracking
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("validation")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "validation"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Calculator className="w-4 h-4 inline mr-2" />
                Validation
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "reports"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Reports
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === "validation" ? (
          <React.Fragment>
            {/* Page Title */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Fuel className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Daily Validation
                  </h1>
                  <p className="text-gray-600">
                    Verify meter readings against recorded sales to detect
                    discrepancies
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Input Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Daily Readings
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Start of Day Reading (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={startReading}
                      onChange={(e) =>
                        setStartReading(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                      placeholder="000245.7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      End of Day Reading (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={endReading}
                      onChange={(e) => setEndReading(e.target.value)}
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                      placeholder={(startReading + totalSales).toFixed(1)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Total Sales Recorded (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={totalSales}
                      readOnly={true}
                      onChange={(e) =>
                        setTotalSales(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                      placeholder="75.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tolerance Level (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      readOnly={true}
                      value={tolerance}
                      onChange={(e) =>
                        setTolerance(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                      placeholder="2.0"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Acceptable variance between meter and sales
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Validation Results
                  </h2>
                </div>

                {validation ? (
                  <div className="space-y-6">
                    <div
                      className={`p-6 rounded-xl border-2 ${getStatusColor(
                        validation.status
                      )} transition-all duration-300`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(validation.status)}
                        <span className="font-bold text-lg">
                          {validation.withinTolerance
                            ? "VALIDATION PASSED"
                            : "VALIDATION FAILED"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {validation.withinTolerance
                          ? "Readings are within acceptable tolerance range"
                          : "Significant discrepancy detected - investigation required"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                          Meter Difference
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {validation.meterDifference} L
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 uppercase font-semibold mb-1">
                          Recorded Sales
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {validation.totalSales} L
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-xl border-2 ${
                          validation.withinTolerance
                            ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                            : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                        }`}
                      >
                        <p
                          className={`text-xs uppercase font-semibold mb-1 ${
                            validation.withinTolerance
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Discrepancy
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            validation.withinTolerance
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          ±{validation.discrepancy} L
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-xl border-2 ${
                          validation.withinTolerance
                            ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                            : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                        }`}
                      >
                        <p
                          className={`text-xs uppercase font-semibold mb-1 ${
                            validation.withinTolerance
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Variance %
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            validation.withinTolerance
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {validation.discrepancyPercentage}%
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={saveReading}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all duration-300 shadow-lg"
                    >
                      Save Reading
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">
                      Enter end reading to validate
                    </p>
                    <p className="text-sm">
                      Fill in all the required fields above
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Potential Issues & Actions */}
            {validation && !validation.withinTolerance && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-amber-800 mb-4">
                      Potential Issues to Investigate:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <ul className="text-sm text-amber-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                          Meter calibration drift or malfunction
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                          Human error in reading analog meter
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                          Unrecorded sales or transactions
                        </li>
                      </ul>
                      <ul className="text-sm text-amber-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                          Fuel theft or unauthorized dispensing
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                          Temperature compensation variations
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                          Mechanical meter wear or damage
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-amber-200">
                      <p className="text-sm font-bold text-gray-800 mb-3">
                        Recommended Actions:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                            1
                          </span>
                          Double-check meter readings
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                            2
                          </span>
                          Review all sales records
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                            3
                          </span>
                          Inspect meter for visible damage
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                            4
                          </span>
                          Consider professional calibration
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Reference */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-blue-800">
                  Quick Reference
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl border border-blue-200">
                  <p className="font-semibold text-blue-700 mb-2">Formula:</p>
                  <p className="text-blue-600 text-sm">
                    End Reading - Start Reading = Sold Product
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-200">
                  <p className="font-semibold text-blue-700 mb-2">Example:</p>
                  <p className="text-blue-600 text-sm">
                    320.7L - 245.7L = 75.0L Sold
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-200">
                  <p className="font-semibold text-blue-700 mb-2">Tolerance:</p>
                  <p className="text-blue-600 text-sm">
                    ±{tolerance}L variance acceptable
                  </p>
                </div>
              </div>
            </div>
          </React.Fragment>
        ) : (
          // Reports Tab
          <MeterReadingReports />
        )}
      </div>
    </div>
  );
};

export default FuelValidationSystem;
