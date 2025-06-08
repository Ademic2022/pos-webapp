import { STOCK_STATUSES } from "@/data/constants";
import { DeliveryHistory } from "@/interfaces/interface";

export type SaleType = "retail" | "wholesale";
export type PaymentMethod = "cash" | "credit" | "transfer" | "part_payment";
export type CustomerFilter =
  | "all"
  | "wholesale"
  | "retail"
  | "debt"
  | "active"
  | "inactive";

export type ValidationResult = {
  meterDifference: string;
  totalSales: string;
  discrepancy: string;
  discrepancyPercentage: string;
  status: "valid" | "invalid";
  withinTolerance: boolean;
} | null;
  
export type MeterReading = {
  id: string;
  date: string;
  startReading: number;
  endReading: number | null;
  totalSales: number;
  discrepancy: number;
  status: "valid" | "invalid";
  operator: string;
};

export type Stats = {
  totalReadings: number;
  validReadings: number;
  invalidReadings: number;
  validPercentage: string;
  avgDiscrepancy: string;
};

export type StockStatus = typeof STOCK_STATUSES[number];

export type Transactions = {
  totalTransactionCount: number;
  wholeSales: number;
  retails: number;
};
export type Debt = {
  debtValue: number;
  customerCount: number;
};

export type Returns = {
  totalReturns: number;
  totalRefundValue: number;
  pendingReturns: number;
  processedReturns: number;
};

export type DashboardStats = {
  totalSales: number;
  transaction: Transactions;
  outstandingDebts: Debt;
  returns: Returns;
  stockData: DeliveryHistory;
  totalLitres: number;
  totalCustomers: number;
  totalDeliveries: number;
};