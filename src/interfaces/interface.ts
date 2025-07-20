import { PermissionType } from "../types/types";

// Core Business Interfaces
export interface SalesData {
  id: string;
  date: string;
  time: string;
  customer: string;
  customerType: "wholesale" | "retail";
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "credit" | "transfer" | "part_payment";
  amountPaid: number;
  balance: number;
  status: "paid" | "partial" | "pending";
  // For part payments, track the payment method used for the partial amount
  partPaymentMethod?: "cash" | "transfer";
}

export interface ReportFilters {
  dateRange: "today" | "week" | "month" | "year" | "custom";
  customerType: "all" | "wholesale" | "retail";
  paymentMethod: "all" | "cash" | "credit" | "transfer" | "part_payment";
  status: "all" | "paid" | "partial" | "pending";
  startDate: string;
  endDate: string;
  // Advanced filters
  searchTerm?: string;
  amountMin?: number;
  amountMax?: number;
  customerId?: string;
  sortBy?: "date" | "amount" | "customer" | "status";
  sortDirection?: "asc" | "desc";
}

export interface ValueCountPair {
  value: number;
  count: number;
}

// Customer Credit types
export type TransactionType = "CREDIT_USED" | "CREDIT_EARNED" | "DEBT_INCURRED";

// Customer Credit interfaces
export interface CustomerCredit {
  id: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
    type?: "wholesale" | "retail";
  };
  amount: number;
  transactionType: "CREDIT_USED" | "CREDIT_EARNED" | "DEBT_INCURRED";
  balanceAfter: number;
  createdAt: string;
  description?: string;
  sale?: {
    id: string;
    transactionId: string;
  };
}

export interface CustomerCreditEdge {
  node: CustomerCredit;
}

export interface CustomerCreditConnection {
  edges: CustomerCreditEdge[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
  totalCount?: number;
}

export interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageSaleValue: number;
  totalDiscounts: number;
  wholesaleSales: number;
  retailSales: number;
  cashSales: number;
  transferSales: number;
  creditSales: number;
  partPaymentSales: number;
  customerCreditApplied: ValueCountPair;
  customerCreditEarned: ValueCountPair;
  customerDebtIncurred: ValueCountPair;
  dateRangeFrom?: string;
  dateRangeTo?: string;
  filteredBySaleType?: string;
  filteredByPaymentMethod?: string;
  filteredByCustomerType?: string;
  filteredByAmountRange?: string;
}export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: "wholesale" | "retail";
  balance: number;
  creditLimit: number;
  totalPurchases: number;
  lastPurchase: string;
  joinDate: string;
  status: "active" | "inactive" | "blocked";
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  type: "sale" | "payment" | "credit" | "return";
  amount: number;
  description: string;
  balance: number;
  originalTransactionId?: string; // For returns, reference to original sale
  returnReason?: string; // For returns
  status?: "pending" | "approved" | "rejected" | "processed"; // For returns
  returnedItems?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>; // For returns
}

export interface DeliveryHistory {
  id: number;
  amount: number;
  supplier: string;
  createdAt: Date
  availableStock: number;
  totalAvailableStock: number;
  soldStock: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  address: string;
  createdAt: string;
  isActive: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface StockStatus {
  status: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface StockStatusConfig {
  bg: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  statusText: string;
}

export interface StockDisplayProps {
  totalAvailableStock: number;
  totalDrums: number;
  totalKegs: number;
  remainingKegs: number;
  remainingLitres: number;
}

// Auth Context Interfaces
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSuperuser: boolean;
  isStaff: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkPermission: (permission: PermissionType) => boolean;
  isLoading?: boolean;
}

// Loading Context Interfaces
export interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, text?: string) => void;
  showPageLoader: (text?: string) => void;
  hidePageLoader: () => void;
}

export interface LoadingProviderProps {
  children: React.ReactNode;
}

// Modal Props Interfaces
export interface ProcessReturnModalProps {
  show: boolean;
  returnRequest: ReturnRequest | null;
  onClose: () => void;
  onProcess: (decision: "approved" | "rejected", notes?: string) => void;
}

export interface AddCustomerModalProps {
  show: boolean;
  newCustomer: Partial<Customer>;
  setNewCustomer: (customer: Partial<Customer>) => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  validationError?: string;
}

export interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: (updatedCustomer: Customer) => void;
}

export interface PaymentModalProps {
  show: boolean;
  customer: Customer | null;
  paymentAmount: number;
  setPaymentAmount: (value: number) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  paymentNote: string;
  setPaymentNote: (value: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
}

export interface DeleteCustomerModalProps {
  show: boolean;
  customerName: string;
  onClose: () => void;
  onDelete: () => Promise<void> | void;
}

export interface ReturnModalProps {
  show: boolean;
  onClose: () => void;
  customers: Customer[];
  customerTransactions: Record<string, CustomerTransaction[]>;
}

export interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
    category: "wholesale" | "retail";
  } | null;
  tempPrice: string;
  setTempPrice: (value: string) => void;
  onSave: () => void;
  formatPrice: (price: number) => string;
}

export interface TransactionHistoryModalProps {
  show: boolean;
  customer: Customer | null;
  transactions: Record<string | number, Transaction[]>;
  onClose: () => void;
  onRecordPayment: () => void;
  getBalanceColor: (balance: number) => string;
}

// Component Props Interfaces
export interface ProfileDropdownProps {
  userName?: string;
  userInitials?: string;
  userEmail?: string;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  variant?: "primary" | "secondary";
}

export interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export interface StatsCardProps {
  title: string;
  titleColor?: string;
  cardBg?: string;
  value: string | number;
  change?: {
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    textColor?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  borderColor?: string;
}

export interface InventoryCardProps {
  value: string | number;
  unit: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  footerText?: string;
  layout?: "horizontal" | "vertical";
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperuser?: boolean;
  requireStaff?: boolean;
  requiredPermission?: PermissionType;
  fallback?: React.ReactNode;
}

export interface ProtectedElementProps {
  children: React.ReactNode;
  requireSuperuser?: boolean;
  requireStaff?: boolean;
  requiredPermission?: PermissionType;
  fallback?: React.ReactNode;
  hideIfNoAccess?: boolean;
}

// Utility Interfaces
export interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UsePageLoadingOptions {
  text?: string;
  delay?: number;
  minDuration?: number;
}

// Data Interfaces
export interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  route: string;
}

// Return Related Interfaces
export interface ReturnProcessData {
  returnId: string;
  decision: "approved" | "rejected";
  refundMethod: "cash" | "credit" | "transfer";
  refundAmount: number;
  notes: string;
  processedBy: string;
  processedDate: string;
  restockItems: boolean;
  generateReceipt: boolean;
  auditTrail: {
    action: string;
    timestamp: string;
    user: string;
    details: {
      originalTransaction: string;
      customer: string;
      refundMethod: string;
      amount: number;
    };
  };
}

export interface ReturnItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  maxQuantity?: number;
}

export interface ReceiptData {
  returnId: string;
}

export interface ReturnRequest {
  id: string;
  originalTransactionId: string;
  customerId: string;
  customerName: string;
  originalDate: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "processed";
  reason: string;
  returnItems: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalRefundAmount: number;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

export interface Transaction {
  id: string | number;
  type: "sale" | "payment" | "credit" | "return";
  description: string;
  date: string;
  amount: number;
  balance: number;
}

// Analytics Interfaces
export interface AnalyticsSalesData {
  id: string;
  customerId: string;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ReturnMetrics {
  totalReturns: number;
  totalRefundValue: number;
  averageRefundValue: number;
  returnRate: number;
  topReturnReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    returns: number;
    refundValue: number;
  }>;
}

export interface CustomerReturnAnalytics {
  customerId: string;
  customerName: string;
  totalReturns: number;
  totalRefundValue: number;
  returnRate: number;
  lastReturnDate: string;
}

export interface ReturnValidationRule {
  name: string;
  check: (context: ReturnValidationContext) => {
    passed: boolean;
    message: string;
    severity: "error" | "warning" | "info";
  };
}

export interface ReturnValidationContext {
  returnRequest: {
    originalTransactionId: string;
    customerId: string;
    returnItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    reason: string;
    requestDate: string;
  };
  originalTransaction: {
    id: string;
    date: string;
    customerId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
  };
  customer: {
    id: number;
    name: string;
    type: "wholesale" | "retail";
    returnHistory: Array<{
      date: string;
      reason: string;
      amount: number;
    }>;
  };
}

export interface ReturnValidationResult {
  canProcess: boolean;
  hasWarnings: boolean;
  summary: string;
  details: Array<{
    rule: string;
    passed: boolean;
    message: string;
    severity: "error" | "warning" | "info";
  }>;
}

// Receipt Generator Interfaces
export interface ReturnReceiptData {
  returnId: string;
  originalTransactionId: string;
  customerId: string;
  customerName: string;
  returnDate: string;
  processedBy: string;
  refundMethod: "cash" | "credit" | "transfer";
  returnItems: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  originalRefundAmount: number;
  actualRefundAmount: number;
  reason: string;
  notes?: string;
}

// Note: PermissionType is defined in ../types/types.ts to avoid circular imports

export interface ExtendedSale {
  id: string;
  saleType?: 'RETAIL' | 'WHOLESALE';
  paymentMethod?: 'CASH' | 'TRANSFER' | 'CREDIT' | 'PART_PAYMENT';
  creditApplied?: number;
  creditEarned?: number;
  tax?: number;
  transactionId?: string;
  date?: string;
  createdAt?: string;
  notes?: string;
  subtotal: number;
  discount: number;
  total: number;
  amountDue: number;
  customer?: {
    name: string;
    phone?: string;
  };
  items: Array<{
    quantity: number;
    totalPrice: number;
    unitPrice?: number;
    product: { name: string; sku?: string };
  }>;
}

// Sale interface for better type safety
export interface Sale {
  id: string;
  transactionId: string;
  createdAt: string;
  total: number;
  subtotal: number;
  discount: number;
  tax?: number;
  amountDue: number;
  saleType: "WHOLESALE" | "RETAIL";
  notes?: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  payments?: Array<{
    method: string;
    amount: number;
  }>;
  items: Array<{
    quantity: number;
    totalPrice: number;
    product: {
      name: string;
    };
  }>;
}