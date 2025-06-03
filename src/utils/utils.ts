import { DRUM_CAPACITY, KEG_CAPACITY } from "@/data/constants";
import { stockData } from "@/data/stock";
import { DeliveryHistory } from "@/interfaces/interface";

export const getLatestAvailableStock = (stockData: DeliveryHistory[]): number => {
  if (!Array.isArray(stockData) || stockData.length === 0) return 0;

  const latestStock = stockData.reduce((latest, current) =>
    current.timestamp.getTime() > latest.timestamp.getTime() ? current : latest
  );

  return latestStock.totalAvailableStock;
};


export const getLatestStock = (stockData: DeliveryHistory[]): DeliveryHistory | null => {
    if (!Array.isArray(stockData) || stockData.length === 0) return null;
  
    return stockData.reduce((latest, current) =>
      current.timestamp.getTime() > latest.timestamp.getTime() ? current : latest
    );
  };


export const getTotalAvailableStock = (stockData: DeliveryHistory[]): number => {
    if (!Array.isArray(stockData) || stockData.length === 0) return 0;
  
    const latestStock = stockData.reduce((latest, current) =>
      current.timestamp.getTime() > latest.timestamp.getTime() ? current : latest
    );
  
    return latestStock.totalAvailableStock - latestStock.soldStock;
};
  

export const getFillDetails = () => {
    const stock = getLatestStock(stockData);
    const totalAvailableStock = (stock?.totalAvailableStock ?? 0) - (stock?.soldStock ?? 0);
    const currentStock = stock?.availableStock ?? 0;

    const totalDrums = Math.floor(totalAvailableStock / DRUM_CAPACITY);
    const remainingKegs = totalAvailableStock % DRUM_CAPACITY;
  
    const totalKegs = Math.floor(totalAvailableStock / KEG_CAPACITY);
    const remainingLitres = remainingKegs % KEG_CAPACITY;    
  
    const remainingPercentage = (totalAvailableStock / currentStock) * 100;
    const fillPercentage = parseFloat(remainingPercentage.toFixed(2));
  
    return {
      totalDrums,
      totalKegs,
      remainingKegs,
      remainingLitres,
      fillPercentage,
      totalAvailableStock,
    };
  };
  