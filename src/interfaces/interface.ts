// Type definitions
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
}
  
export interface ReportFilters {
    dateRange: "today" | "week" | "month" | "year" | "custom";
    customerType: "all" | "wholesale" | "retail";
    paymentMethod: "all" | "cash" | "credit" | "transfer" | "part_payment";
    status: "all" | "paid" | "partial" | "pending";
    startDate: string;
    endDate: string;
  }

export interface Customer {
  id: number;
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
  type: "sale" | "payment" | "credit";
  amount: number;
  description: string;
  balance: number;
}

export interface DeliveryHistory {
  id: number;
  amount: number;
  supplier: string;
  date: string;
  timestamp: Date;
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
