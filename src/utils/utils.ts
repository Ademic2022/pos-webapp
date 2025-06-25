import { DRUM_CAPACITY, KEG_CAPACITY, STOCK_THRESHOLDS } from "@/data/constants";
import { dashboardStat } from "@/data/stock";
import { DeliveryHistory } from "@/interfaces/interface";
import { MeterReading, Stats, StockStatus } from "@/types/types";

export const getLatestAvailableStock = (stockData: DeliveryHistory[]): number => {
  if (!Array.isArray(stockData) || stockData.length === 0) return 0;

  const latestStock = stockData.reduce((latest, current) =>
    current.createdAt.getTime() > latest.createdAt.getTime() ? current : latest
  );

  return latestStock.totalAvailableStock;
};


export const getLatestStock = (stockData: DeliveryHistory[]): DeliveryHistory | null => {
    if (!Array.isArray(stockData) || stockData.length === 0) return null;
  
    return stockData.reduce((latest, current) =>
      current.createdAt.getTime() > latest.createdAt.getTime() ? current : latest
    );
  };


export const getTotalAvailableStock = (stockData: DeliveryHistory[]): number => {
    if (!Array.isArray(stockData) || stockData.length === 0) return 0;
  
    const latestStock = stockData.reduce((latest, current) =>
      current.createdAt.getTime() > latest.createdAt.getTime() ? current : latest
    );
  
    return latestStock.totalAvailableStock - latestStock.soldStock;
};
  

export const getFillDetails = (stockDelivery?: {
  cumulativeStock: number;
  remainingStock: number;
  soldStock: number;
  stockUtilizationPercentage: number;
} | null) => {
  // Use real data if available, otherwise fallback to mock data
  const totalAvailableStock = stockDelivery?.cumulativeStock ?? dashboardStat.stockData.totalAvailableStock;
  const currentStock = stockDelivery?.remainingStock ?? dashboardStat.stockData.availableStock;
  const soldStock = stockDelivery?.soldStock ?? dashboardStat.stockData.soldStock;
  const utilizationPercentage = stockDelivery?.stockUtilizationPercentage ?? 0;

  const totalDrums = Math.floor(totalAvailableStock / DRUM_CAPACITY);
  const remainingAfterDrums = totalAvailableStock % DRUM_CAPACITY;
  
  const totalKegs = Math.floor(totalAvailableStock / KEG_CAPACITY);
  const remainingLitres = totalAvailableStock % KEG_CAPACITY;
  
  // Calculate fill percentage based on remaining vs total capacity
  const fillPercentage = totalAvailableStock > 0 
    ? parseFloat(((currentStock / totalAvailableStock) * 100).toFixed(2))
    : 0;

  return {
    totalDrums,
    totalKegs,
    remainingKegs: Math.floor(remainingAfterDrums),
    remainingLitres,
    fillPercentage,
    totalAvailableStock,
    currentStock,
    soldStock,
    utilizationPercentage,
  };
};
  
export const getFillColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-green-500 to-green-600'; // Full – green
    if (percentage >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'; // Moderate – yellow
    if (percentage >= 25) return 'bg-gradient-to-r from-orange-500 to-orange-600'; // Low – orange
    return 'bg-gradient-to-r from-red-500 to-red-600'; // Critical – red
};
  

export const calculateStats = (filteredReadings:MeterReading[]): Stats => {
  const totalReadings = filteredReadings.length;
  const validReadings = filteredReadings.filter(
    (r) => r.status === "valid"
  ).length;
  const invalidReadings = totalReadings - validReadings;
  const validPercentage =
    totalReadings > 0
      ? ((validReadings / totalReadings) * 100).toFixed(1)
      : "0";
  const avgDiscrepancy =
    totalReadings > 0
      ? (
          filteredReadings.reduce((sum, r) => sum + r.discrepancy, 0) /
          totalReadings
        ).toFixed(2)
      : "0";

  return {
    totalReadings,
    validReadings,
    invalidReadings,
    validPercentage,
    avgDiscrepancy,
  };
};


// Helper function to check if a date is within range
export const isDateInRange = (
  readingDate: string,
  start: Date,
  end: Date
): boolean => {
  const reading = new Date(readingDate);
  return reading >= start && reading <= end;
};

// export const getStockStatus = (
//   value: number,
//   thresholds: { low: number; medium: number }
// ): StockStatus => {
//   if (value <= thresholds.low) return "low";
//   if (value <= thresholds.medium) return "medium";
//   return "high";
// };


export function getStockStatus(
  value: number,
  productType: keyof typeof STOCK_THRESHOLDS
): StockStatus {
  const { low, medium } = STOCK_THRESHOLDS[productType];
  
  if (value <= low) return 'low';
  if (value <= medium) return 'medium';
  return 'high';
}