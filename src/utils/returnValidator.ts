// Return Validation Rules and Business Logic
import { CustomerTransaction } from "@/interfaces/interface";

// Validator-specific interfaces (different structure from consolidated ones)
export interface ReturnValidationRule {
  id: string;
  name: string;
  description: string;
  validator: (context: ReturnValidationContext) => ReturnValidationResult;
}

export interface ReturnValidationContext {
  originalTransaction: CustomerTransaction;
  returnRequest: {
    requestDate: string;
    returnItems: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    reason: string;
    customerId: string;
  };
  customerBalance: number;
  customerType: "wholesale" | "retail";
}

export interface ReturnValidationResult {
  isValid: boolean;
  message: string;
  severity: "error" | "warning" | "info";
}

export class ReturnValidator {
  private static rules: ReturnValidationRule[] = [
    // Time-based validation
    {
      id: "return_time_limit",
      name: "Return Time Limit",
      description: "Returns must be requested within allowed time frame",
      validator: (context) => {
        const originalDate = new Date(context.originalTransaction.date);
        const returnDate = new Date(context.returnRequest.requestDate);
        const daysDiff = Math.ceil((returnDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Wholesale customers: 7 days, Retail customers: 3 days
        const maxDays = context.customerType === "wholesale" ? 7 : 3;
        
        if (daysDiff > maxDays) {
          return {
            isValid: false,
            message: `Return request exceeds ${maxDays}-day limit for ${context.customerType} customers (${daysDiff} days since purchase)`,
            severity: "error"
          };
        }
        
        if (daysDiff > (maxDays - 1)) {
          return {
            isValid: true,
            message: `Return is near the ${maxDays}-day limit. Consider expedited processing.`,
            severity: "warning"
          };
        }
        
        return {
          isValid: true,
          message: `Return is within ${maxDays}-day limit (${daysDiff} days since purchase)`,
          severity: "info"
        };
      }
    },

    // Transaction amount validation
    {
      id: "transaction_amount",
      name: "Transaction Amount",
      description: "Validate return amount against original transaction",
      validator: (context) => {
        const originalAmount = context.originalTransaction.amount;
        const returnAmount = context.returnRequest.returnItems.reduce((sum, item) => sum + item.total, 0);
        
        if (returnAmount > originalAmount) {
          return {
            isValid: false,
            message: `Return amount (₦${returnAmount.toLocaleString()}) exceeds original transaction amount (₦${originalAmount.toLocaleString()})`,
            severity: "error"
          };
        }
        
        const returnPercentage = (returnAmount / originalAmount) * 100;
        if (returnPercentage > 80) {
          return {
            isValid: true,
            message: `High return percentage (${returnPercentage.toFixed(1)}% of original transaction). Requires manager approval.`,
            severity: "warning"
          };
        }
        
        return {
          isValid: true,
          message: `Return amount validated (${returnPercentage.toFixed(1)}% of original transaction)`,
          severity: "info"
        };
      }
    },

    // Customer balance validation
    {
      id: "customer_balance",
      name: "Customer Credit Balance",
      description: "Check customer balance for credit refunds",
      validator: (context) => {
        if (context.customerBalance < 0) {
          const debtAmount = Math.abs(context.customerBalance);
          const returnAmount = context.returnRequest.returnItems.reduce((sum, item) => sum + item.total, 0);
          
          if (returnAmount <= debtAmount) {
            return {
              isValid: true,
              message: `Customer has outstanding debt (₦${debtAmount.toLocaleString()}). Return amount can offset debt.`,
              severity: "warning"
            };
          } else {
            return {
              isValid: true,
              message: `Customer has outstanding debt (₦${debtAmount.toLocaleString()}). Partial return can offset debt, remainder as credit.`,
              severity: "warning"
            };
          }
        }
        
        return {
          isValid: true,
          message: "Customer has good standing balance",
          severity: "info"
        };
      }
    },

    // Product condition validation
    {
      id: "product_condition",
      name: "Product Condition",
      description: "Validate return reason and product condition",
      validator: (context) => {
        const reason = context.returnRequest.reason.toLowerCase();
        
        // High-risk reasons requiring immediate attention
        const highRiskReasons = ["quality", "contaminated", "spoiled", "damaged", "defective"];
        const isHighRisk = highRiskReasons.some(risk => reason.includes(risk));
        
        if (isHighRisk) {
          return {
            isValid: true,
            message: "Quality issue detected. Requires immediate product inspection and quality control review.",
            severity: "warning"
          };
        }
        
        // Customer change of mind
        const customerChangeReasons = ["excess", "overordered", "change of mind", "no longer needed"];
        const isCustomerChange = customerChangeReasons.some(change => reason.includes(change));
        
        if (isCustomerChange) {
          return {
            isValid: true,
            message: "Customer-initiated return. Standard processing applies.",
            severity: "info"
          };
        }
        
        return {
          isValid: true,
          message: "Return reason reviewed. Proceed with standard validation.",
          severity: "info"
        };
      }
    },

    // Quantity validation
    {
      id: "quantity_validation",
      name: "Quantity Validation",
      description: "Validate returned quantities",
      validator: (context) => {
        // This is a simplified validation - in a real system, you'd check against inventory
        const totalQuantity = context.returnRequest.returnItems.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalQuantity <= 0) {
          return {
            isValid: false,
            message: "Invalid quantity. Return must include at least one item.",
            severity: "error"
          };
        }
        
        // Check for suspicious high quantities
        const hasHighQuantity = context.returnRequest.returnItems.some(item => item.quantity > 10);
        if (hasHighQuantity && context.customerType === "retail") {
          return {
            isValid: true,
            message: "High quantity return for retail customer. Verify original purchase records.",
            severity: "warning"
          };
        }
        
        return {
          isValid: true,
          message: "Quantities validated successfully",
          severity: "info"
        };
      }
    }
  ];

  static validateReturn(context: ReturnValidationContext): ReturnValidationResult[] {
    return this.rules.map(rule => rule.validator(context));
  }

  static getOverallValidation(results: ReturnValidationResult[]): {
    canProcess: boolean;
    hasWarnings: boolean;
    summary: string;
  } {
    const errors = results.filter(r => r.severity === "error");
    const warnings = results.filter(r => r.severity === "warning");
    
    const canProcess = errors.length === 0;
    const hasWarnings = warnings.length > 0;
    
    let summary = "";
    if (errors.length > 0) {
      summary = `${errors.length} error(s) found. Cannot process return.`;
    } else if (warnings.length > 0) {
      summary = `${warnings.length} warning(s) found. Review carefully before processing.`;
    } else {
      summary = "All validations passed. Return can be processed.";
    }
    
    return { canProcess, hasWarnings, summary };
  }

  static getReturnPolicy(): {
    wholesale: { timeLimit: number; conditions: string[] };
    retail: { timeLimit: number; conditions: string[] };
    general: string[];
  } {
    return {
      wholesale: {
        timeLimit: 7,
        conditions: [
          "Items must be in original packaging",
          "Quality issues reported within 24 hours",
          "Minimum return quantity: 1 drum or 3 kegs",
          "Transportation costs may apply for large returns"
        ]
      },
      retail: {
        timeLimit: 3,
        conditions: [
          "Items must be unopened and unused",
          "Original receipt required",
          "No returns on opened containers",
          "Quality issues must be reported immediately"
        ]
      },
      general: [
        "Returns subject to inspection and approval",
        "Refunds processed within 2-3 business days",
        "Credit refunds available immediately",
        "No returns on custom or special orders",
        "Contaminated products require immediate reporting"
      ]
    };
  }
}
