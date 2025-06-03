import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  TrendingUp,
  Filter,
  Download,
} from "lucide-react";
import { MeterReading } from "@/types/types";
import { generateMockData } from "@/data/sales";
import { calculateStats, getLatestStock, isDateInRange } from "@/utils/utils";
import { stockData } from "@/data/stock";

const MeterReadingReports = () => {
  const [mockReadings] = useState<MeterReading[]>(generateMockData());
  const [filteredReadings, setFilteredReadings] =
    useState<MeterReading[]>(mockReadings);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFilterType, setDateFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const latestStock = getLatestStock(stockData);

  useEffect(() => {
    let filtered = mockReadings;

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((reading) => reading.status === filterStatus);
    }

    // Apply date filter
    if (dateFilterType === "date_range" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day to include the entire end date
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((reading) =>
        isDateInRange(reading.date || reading.date, start, end)
      );
    } else if (dateFilterType === "since_restock" && latestStock) {
      const restockDate = new Date(latestStock.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      filtered = filtered.filter((reading) =>
        isDateInRange(reading.date || reading.date, restockDate, today)
      );
    }

    setFilteredReadings(filtered);
  }, [
    filterStatus,
    dateFilterType,
    startDate,
    endDate,
    mockReadings,
    latestStock,
  ]);

  const getStatusBadge = (status: "valid" | "invalid") => {
    return status === "valid" ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
        Valid
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
        Invalid
      </span>
    );
  };

  const stats = calculateStats(filteredReadings);

  return (
    <React.Fragment>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meter Reports</h1>
            <p className="text-gray-600">
              Historical data and analysis of meter readings
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-blue-600">
              Total Readings
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalReadings}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-600">
              Valid Readings
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.validReadings}
          </p>
          <p className="text-sm text-green-600">
            {stats.validPercentage}% of total
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-semibold text-red-600">
              Invalid Readings
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.invalidReadings}
          </p>
          <p className="text-sm text-red-600">
            {(100 - parseFloat(stats.validPercentage)).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-amber-600">
              Avg Discrepancy
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.avgDiscrepancy}L
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Filter
            </label>
            <select
              value={dateFilterType}
              onChange={(e) => {
                setDateFilterType(e.target.value);
                // Reset date inputs when changing filter type
                if (e.target.value !== "date_range") {
                  setStartDate("");
                  setEndDate("");
                }
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Time</option>
              <option value="date_range">Date Range</option>
              <option value="since_restock">Since Last Restock</option>
            </select>
          </div>

          {/* Date Range Inputs - Only show when date_range is selected */}
          {dateFilterType === "date_range" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </>
          )}

          {/* Show restock date info when since_restock is selected */}
          {dateFilterType === "since_restock" && latestStock && (
            <div className="md:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Last Restock Date:</span>{" "}
                  {new Date(latestStock.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Showing readings from{" "}
                  {new Date(latestStock.date).toLocaleDateString()} to today
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="valid">Valid Only</option>
              <option value="invalid">Invalid Only</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-amber-700 transition-all duration-300 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Pdf
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Readings
          </h3>
          <p className="text-sm text-gray-600">
            Showing {filteredReadings.length} readings
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Start Reading
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  End Reading
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Discrepancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Operator
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReadings.slice(0, 20).map((reading) => (
                <tr
                  key={reading.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(reading.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reading.startReading.toFixed(1)}L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(reading?.endReading ?? 0).toFixed(1)}L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reading.totalSales.toFixed(1)}L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        reading.discrepancy <= 2
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ±{reading.discrepancy.toFixed(2)}L
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reading.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reading.operator}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReadings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium">No readings found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}

        {filteredReadings.length > 20 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Showing 20 of {filteredReadings.length} readings.
              <button className="text-orange-600 hover:text-orange-700 font-medium ml-1">
                Load more
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Daily Summary Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-green-800">Best Performance</h3>
              <p className="text-sm text-green-600">Lowest discrepancy</p>
            </div>
          </div>
          {(() => {
            const best = filteredReadings.reduce(
              (min, reading) =>
                reading.discrepancy < min.discrepancy ? reading : min,
              filteredReadings[0] || {
                discrepancy: 0,
                meterNumber: "N/A",
                date: "N/A",
              }
            );
            return (
              <div>
                <p className="text-2xl font-bold text-green-800">
                  ±{best?.discrepancy?.toFixed(2) || "0.00"}L
                </p>
                <p className="text-sm text-green-600">
                  on{" "}
                  {best?.date
                    ? new Date(best.date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            );
          })()}
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-red-800">Needs Attention</h3>
              <p className="text-sm text-red-600">Highest discrepancy</p>
            </div>
          </div>
          {(() => {
            const worst = filteredReadings.reduce(
              (max, reading) =>
                reading.discrepancy > max.discrepancy ? reading : max,
              filteredReadings[0] || {
                discrepancy: 0,
                meterNumber: "N/A",
                date: "N/A",
              }
            );
            return (
              <div>
                <p className="text-2xl font-bold text-red-800">
                  ±{worst?.discrepancy?.toFixed(2) || "0.00"}L
                </p>
                <p className="text-sm text-red-600">
                  on{" "}
                  {worst?.date
                    ? new Date(worst.date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            );
          })()}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-800">Today's Discrepancy</h3>
              <p className="text-sm text-blue-600">Single meter reading</p>
            </div>
          </div>
          {(() => {
            const today = new Date().toISOString().split("T")[0];
            const todayReading = filteredReadings.find((r) => r.date === today);
            const discrepancy = todayReading ? todayReading.discrepancy : 0;
            return (
              <div>
                <p className="text-2xl font-bold text-blue-800">
                  ±{discrepancy.toFixed(2)}L
                </p>
                <p className="text-sm text-blue-600">
                  {todayReading ? "1 reading today" : "No reading today"}
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </React.Fragment>
  );
};

export default MeterReadingReports;
