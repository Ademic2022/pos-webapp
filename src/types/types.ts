export type SaleType = "retail" | "wholesale";
export type PaymentMethod = "cash" | "credit" | "transfer" | "part_payment";
export type CustomerFilter =
  | "all"
  | "wholesale"
  | "retail"
  | "debt"
  | "active"
  | "inactive";