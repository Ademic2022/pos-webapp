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