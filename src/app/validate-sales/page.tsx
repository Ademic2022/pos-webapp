"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import { MeterReading, ValidationResult } from "@/types/types";
import { generateMockData } from "@/data/sales";
import { loggedInUser } from "@/data/user";
import MeterReadingReports from "@/components/reports/validationReport";
import { dailyMeterReading } from "@/data/stock";
import { usePageLoading } from "@/hooks/usePageLoading";

const FuelValidationSystem: React.FC = () => {
  usePageLoading({
    text: "Loading validation system",
    minDuration: 700,
  });

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

  const calculateValidation = useCallback((): ValidationResult => {
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
  }, [endReading, startReading, totalSales, tolerance]);

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
    const calculatedValidation = calculateValidation();
    setValidation(calculatedValidation);
  }, [calculateValidation]);

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
    <ProtectedRoute requiredPermission="VALIDATE_SALES">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/">
                    <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors">
                      <ArrowLeft className="w-5 h-5 text-orange-600" />
                    </button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center"
                  >
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
                </motion.div>
              </div>

              {/* Tab Navigation */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex bg-gray-100 rounded-lg p-1"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("validation")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === "validation"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Calculator className="w-4 h-4 inline mr-2" />
                  Validation
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("reports")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === "reports"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Reports
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto p-6"
        >
          {activeTab === "validation" ? (
            <React.Fragment>
              {/* Page Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
                  >
                    <Fuel className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h1 className="text-3xl font-bold text-gray-900">
                      Daily Validation
                    </h1>
                    <p className="text-gray-600">
                      Verify meter readings against recorded sales to detect
                      discrepancies
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid lg:grid-cols-2 gap-8 mb-8"
              >
                {/* Input Section */}
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center"
                    >
                      <Calculator className="w-5 h-5 text-white" />
                    </motion.div>
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
                </motion.div>

                {/* Results Section */}
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Validation Results
                    </h2>
                  </div>

                  <AnimatePresence mode="wait">
                    {validation ? (
                      <motion.div
                        key="validation-results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className={`p-6 rounded-xl border-2 ${getStatusColor(
                            validation.status
                          )}`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div
                              initial={{ rotate: -90 }}
                              animate={{ rotate: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              {getStatusIcon(validation.status)}
                            </motion.div>
                            <motion.span
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="font-bold text-lg"
                            >
                              {validation.withinTolerance
                                ? "VALIDATION PASSED"
                                : "VALIDATION FAILED"}
                            </motion.span>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {validation.withinTolerance
                              ? "Readings are within acceptable tolerance range"
                              : "Significant discrepancy detected - investigation required"}
                          </p>
                        </motion.div>

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

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={saveReading}
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 shadow-lg"
                        >
                          Save Reading
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="no-validation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-gray-500"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Calculator className="w-8 h-8 opacity-50" />
                        </motion.div>
                        <p className="text-lg font-medium">
                          Enter end reading to validate
                        </p>
                        <p className="text-sm">
                          Fill in all the required fields above
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Potential Issues & Actions */}
              {validation && !validation.withinTolerance && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 mb-6"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 1.0,
                        type: "spring",
                        stiffness: 300,
                      }}
                      className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </motion.div>
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
                </motion.div>
              )}

              {/* Quick Reference */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
                  >
                    <Fuel className="w-5 h-5 text-white" />
                  </motion.div>
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
                    <p className="font-semibold text-blue-700 mb-2">
                      Tolerance:
                    </p>
                    <p className="text-blue-600 text-sm">
                      ±{tolerance}L variance acceptable
                    </p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : (
            // Reports Tab
            <MeterReadingReports />
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default FuelValidationSystem;
