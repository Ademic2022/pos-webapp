interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  unit: string;
}

/**
 * Check if a specific product unit can be added to cart based on available stock
 */
export function checkStockAvailability(
  unitKegs: number,
  totalAvailableStock: number,
  cart: CartItem[]
): {
  isAvailable: boolean;
  remainingStock: number;
} {
  // Calculate total liters used by current cart
  const usedLiters = cart.reduce((total, item) => {
    const itemKegs = parseInt(item.unit);
    const KEG_CAPACITY = 50; // 50 liters per keg
    return total + (itemKegs * KEG_CAPACITY * item.quantity);
  }, 0);

  const remainingStock = Math.max(0, totalAvailableStock - usedLiters);
  const KEG_CAPACITY = 50; // 50 liters per keg
  const litersNeeded = unitKegs * KEG_CAPACITY;
  
  return {
    isAvailable: remainingStock >= litersNeeded,
    remainingStock: remainingStock
  };
}

/**
 * Calculate total kegs in cart
 */
export function calculateTotalKegsInCart(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    const itemKegs = parseInt(item.unit);
    return total + (itemKegs * item.quantity);
  }, 0);
}

/**
 * Calculate remaining stock for a product after considering cart items
 */
export function calculateRemainingStock(
  totalStock: number,
  cart: CartItem[]
): number {
  const KEG_CAPACITY = 50; // 50 liters per keg
  const usedLiters = cart.reduce((total, item) => {
    const itemKegs = parseInt(item.unit);
    return total + (itemKegs * KEG_CAPACITY * item.quantity);
  }, 0);
  
  return Math.max(0, totalStock - usedLiters);
}

/**
 * Check if a specific quantity can be added for a product
 */
export function canAddQuantity(
  productId: string,
  requestedQuantity: number,
  totalStock: number,
  cart: CartItem[]
): boolean {
  const currentInCart = cart.find(item => item.id === productId)?.quantity || 0;
  return (currentInCart + requestedQuantity) <= totalStock;
}

/**
 * Get available quantity that can still be added for a product
 */
export function getAvailableQuantity(
  productId: string,
  totalStock: number,
  cart: CartItem[]
): number {
  const currentInCart = cart.find(item => item.id === productId)?.quantity || 0;
  return Math.max(0, totalStock - currentInCart);
}
