import { STOCK_STATUSES } from "@/data/constants";
import { DeliveryHistory } from "@/interfaces/interface";

export type SaleType = "retail" | "wholesale";
export type PaymentMethod = "cash" | "credit" | "transfer";
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
  debt: Debt;
  returns: Returns;
  stockData: DeliveryHistory;
  totalLitres: number;
  totalCustomers: number;
  totalDeliveries: number;
};

// Permission types from AuthContext
export type PermissionType =
  | "VIEW_INVENTORY_SETTINGS"
  | "EDIT_PRICES"
  | "DELETE_PRODUCTS"
  | "MANAGE_USERS"
  | "VIEW_REPORTS"
  | "EDIT_CUSTOMER_DETAILS"
  | "DELETE_CUSTOMERS"
  | "PROCESS_RETURNS"
  | "VALIDATE_SALES"
  | "MANAGE_STOCK"
  | "VIEW_FINANCIAL_DATA"
  | "NEW_SALE"
  | "SECURITY_SETTINGS";

// Filter and Sort Options Types
export type FilterOptions = {
  status: "all" | "pending" | "approved" | "rejected" | "processed";
  dateRange: "all" | "today" | "week" | "month";
  reason: "all" | "quality" | "damaged" | "wrong_quantity" | "customer_changed_mind" | "excess" | "other";
};

export type SortOptions = {
  field: "date" | "customer" | "amount" | "status";
  direction: "asc" | "desc";
};