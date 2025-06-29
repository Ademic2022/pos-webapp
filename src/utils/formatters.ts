/**
 * Utility functions for formatting numbers and currency values
 * Handles both string and number inputs to ensure proper formatting
 */

/**
 * Safely convert a value to a number and format it with locale string
 * Handles both string and number inputs, including Decimal strings from backend
 */
export function formatNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString();
}

/**
 * Format a value as currency with Naira symbol
 * Handles both string and number inputs
 */
export function formatCurrency(value: string | number | null | undefined): string {
  return `₦${formatNumber(value)}`;
}

/**
 * Safely get a numeric value, defaulting to 0 if invalid
 */
export function safeNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return isNaN(numValue) ? 0 : numValue;
}

/**
 * Format percentage with proper decimal places
 */
export function formatPercentage(value: string | number | null | undefined, decimals = 1): string {
  const numValue = safeNumber(value);
  return `${numValue.toFixed(decimals)}%`;
}
