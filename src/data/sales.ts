import { Product, SalesData } from "@/interfaces/interface";
import { MeterReading, SaleType } from "@/types/types";

export const salesData: SalesData[] = [
    {
      id: "TXN001",
      date: "2025-06-02",
      time: "14:30",
      customer: "Adebayo Motors",
      customerType: "wholesale",
      items: [
        {
          name: "Wholesale Drum (9 Kegs)",
          quantity: 2,
          price: 9000,
          total: 18000,
        },
      ],
      subtotal: 18000,
      discount: 0,
      total: 18000,
      paymentMethod: "cash",
      amountPaid: 18000,
      balance: 0,
      status: "paid",
    },
    {
      id: "TXN002",
      date: "2025-06-02",
      time: "13:15",
      customer: "Mrs. Fatima Ibrahim",
      customerType: "retail",
      items: [{ name: "3 Kegs", quantity: 1, price: 4500, total: 4500 }],
      subtotal: 4500,
      discount: 0,
      total: 4500,
      paymentMethod: "cash",
      amountPaid: 4500,
      balance: 0,
      status: "paid",
    },
    {
      id: "TXN003",
      date: "2025-06-02",
      time: "11:45",
      customer: "Kemi's Store",
      customerType: "retail",
      items: [{ name: "5 Kegs", quantity: 1, price: 7500, total: 7500 }],
      subtotal: 7500,
      discount: 0,
      total: 7500,
      paymentMethod: "credit",
      amountPaid: 0,
      balance: 7500,
      status: "pending",
    },
    {
      id: "TXN004",
      date: "2025-06-01",
      time: "16:20",
      customer: "Taiwo Enterprises",
      customerType: "wholesale",
      items: [
        {
          name: "Wholesale Drum (9 Kegs)",
          quantity: 3,
          price: 9000,
          total: 27000,
        },
      ],
      subtotal: 27000,
      discount: 1000,
      total: 26000,
      paymentMethod: "part_payment",
      amountPaid: 15000,
      balance: 11000,
      status: "partial",
    },
    {
      id: "TXN005",
      date: "2025-06-01",
      time: "10:30",
      customer: "Blessing Oil Depot",
      customerType: "wholesale",
      items: [
        {
          name: "Wholesale Drum (9 Kegs)",
          quantity: 1,
          price: 9000,
          total: 9000,
        },
      ],
      subtotal: 9000,
      discount: 500,
      total: 8500,
      paymentMethod: "transfer",
      amountPaid: 8500,
      balance: 0,
      status: "paid",
    },
  ];

  // Product catalog
  export const products: Record<SaleType, Product[]> = {
    wholesale: [
      {
        id: "drum_9kg",
        name: "Wholesale Drum (9 Kegs)",
        price: 9000,
        stock: 45,
        unit: "drum",
      },
    ],
    retail: [
      { id: "keg_1", name: "Single Keg", price: 1500, stock: 127, unit: "keg" },
      { id: "keg_2", name: "2 Kegs", price: 3000, stock: 63, unit: "bundle" },
      { id: "keg_3", name: "3 Kegs", price: 4500, stock: 42, unit: "bundle" },
      { id: "keg_4", name: "4 Kegs", price: 6000, stock: 31, unit: "bundle" },
      { id: "keg_5", name: "5 Kegs", price: 7500, stock: 25, unit: "bundle" },
      { id: "keg_6", name: "6 Kegs", price: 9000, stock: 21, unit: "bundle" },
      { id: "keg_7", name: "7 Kegs", price: 10500, stock: 18, unit: "bundle" },
      { id: "keg_8", name: "8 Kegs", price: 12000, stock: 15, unit: "bundle" },
    ],
  };


  // Mock data generator for meter readings
export const generateMockData = (): MeterReading[] => {
  const meterNumbers = ["M001", "M002", "M003", "M004", "M005"];
  const operators = [
    "John Doe",
    "Sarah Wilson",
    "Mike Johnson",
    "Lisa Brown",
    "David Clark",
  ];
  const mockData: MeterReading[] = [];

  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    meterNumbers.forEach((meterNumber, index) => {
      const baseReading = 1000 + i * 50 + index * 200;
      const dailySales = 45 + Math.random() * 60; // 45-105L daily sales
      const endReading = baseReading + dailySales;
      const recordedSales = dailySales + (Math.random() - 0.5) * 6; // ±3L variance
      const discrepancy = Math.abs(dailySales - recordedSales);

      mockData.push({
        id: `${meterNumber}-${date.toISOString().split("T")[0]}`,
        date: date.toISOString().split("T")[0],
        startReading: baseReading,
        endReading: endReading,
        totalSales: recordedSales,
        discrepancy: discrepancy,
        status: discrepancy <= 2 ? "valid" : "invalid",
        operator: operators[index],
      });
    });
  }

  return mockData.reverse();
};