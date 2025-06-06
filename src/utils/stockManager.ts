import { KEG_CAPACITY } from "@/data/constants";
import { CartItem } from "@/interfaces/interface";

export const convertToLiters = (quantity: number, unit: string): number => {
    // For wholesale (drums), unit is "9" representing 9 kegs
    // For retail, unit is the number of kegs (1-8)
    return quantity * parseInt(unit) * KEG_CAPACITY;
  };


  export const checkStockAvailability = (
    requestedQuantity: number,
    currentStock: number, // This should be in liters
    cartItems: CartItem[] = []
  ): {
    isAvailable: boolean;
    remainingStock: number;
  } => {
    // Convert requested quantity to liters based on sale type
    const requestedLiters = requestedQuantity * KEG_CAPACITY 
    
    // Calculate already allocated liters from cart
    const allocatedLiters = cartItems.reduce((total, item) => {
      return total + convertToLiters(item.quantity, item.unit);
    }, 0);
        
    const availableLiters = Math.max(currentStock - allocatedLiters, 0);
    
    const isAvailable = requestedLiters <= availableLiters;
    
    return {
      isAvailable,
      remainingStock: availableLiters,
    };
  };

 
  