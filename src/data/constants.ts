import { StockStatusConfig } from "@/interfaces/interface";
import { StockStatus } from "@/types/types";

export const STOCK_STATUSES = ['low', 'medium', 'high'] as const;
export const DRUM_CAPACITY = 225;
export const KEG_CAPACITY = 25;
export const STOCK_THRESHOLDS = {
    litres: {
      low: 500,
      medium: 1500
    },
    drums: {
      low: 10,
      medium: 30
    },
    kegs: {
      low: 20,
      medium: 50
    }
  } as const;

export const colorMap: Record<StockStatus, StockStatusConfig> = {
    low: {
      bg: "bg-red-50",
      iconBg: "bg-red-200",
      iconColor: "text-red-700",
      textColor: "text-red-600",
      statusText: "Low Stock",
    },
    medium: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-200",
      iconColor: "text-amber-700",
      textColor: "text-amber-600",
      statusText: "Medium Stock",
    },
    high: {
      bg: "bg-green-50",
      iconBg: "bg-green-200",
      iconColor: "text-green-700",
      textColor: "text-green-600",
      statusText: "Good Stock",
    },
  } as const;