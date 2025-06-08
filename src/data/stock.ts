import { DashboardStats, MeterReading } from "@/types/types";

export const dailyMeterReading: MeterReading = {
    id: "1",
    date: "2025-06-01",
    startReading: 245.7,
    endReading: null,
    totalSales: 125,
    discrepancy: 0,
    status: "valid",
    operator: "John Doe",
}


export const dashboardStat: DashboardStats = {
  totalSales: 1250000,
  transaction: {
    totalTransactionCount: 420,
    wholeSales: 160,
    retails: 260,
  },
  outstandingDebts: {
    debtValue: 230000,
    customerCount: 34,
  },
  returns: {
    totalReturns: 15,
    totalRefundValue: 82500,
    pendingReturns: 5,
    processedReturns: 10,
  },
  stockData: {
    id: 101,
    amount: 9200, // litres delivered
    supplier: "Global Oil Ltd",
    createdAt: new Date("2025-06-01T08:30:00Z"),
    availableStock: 9500,
    totalAvailableStock: 6000,
    soldStock: 3500,
  },
  totalLitres: 47500,
  totalCustomers: 182,
  totalDeliveries: 67,
};
