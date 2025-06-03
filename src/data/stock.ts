import { DeliveryHistory } from "@/interfaces/interface";

export const stockData: DeliveryHistory[] = [
    {
      id: 1,
      amount: 1500,
      supplier: "Premium Oil Suppliers Ltd",
      date: "2024-05-30",
      timestamp: new Date("2024-05-30T10:30:00"),
      availableStock: 1550, // Example available stock after this delivery
      totalAvailableStock: 1425, // Total available stock after this delivery, this value change as stock is sold
      soldStock: 125, // Example sold stock after this delivery
    },
    {
      id: 2,
      amount: 1050,
      supplier: "Golden Harvest Oil Co.",
      date: "2024-05-28",
      timestamp: new Date("2024-05-28T14:15:00"),
      availableStock: 1200, // Example available stock after this delivery
      totalAvailableStock : 50, // Total available stock after this delivery, this value change as stock is sold
      soldStock: 1150, // Example sold stock after this delivery
    },
  ]