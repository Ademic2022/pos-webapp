// Batch operations for transaction management
import { Sale } from "@/services/salesService";
import { formatCurrency } from "@/utils/formatters";

export interface BatchOperation {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  action: (items: Sale[]) => Promise<BatchOperationResult>;
  requiresConfirmation?: boolean;
  confirmationMessage?: (items: Sale[]) => string;
  disabled?: (items: Sale[]) => boolean;
  disabledReason?: (items: Sale[]) => string;
}

export interface BatchOperationResult {
  success: boolean;
  message: string;
  processed: number;
  failed: number;
  errors?: string[];
}

export class BatchOperationManager {
  static async exportSelectedToCSV(transactions: Sale[]): Promise<BatchOperationResult> {
    try {
      const { ReportsExporter } = await import("@/utils/exportUtils");
      
      const exportData = ReportsExporter.prepareExportData(
        transactions,
        {
          totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
          totalPaid: transactions.reduce((sum, t) => sum + (t.total - t.amountDue), 0),
          totalOutstanding: transactions.reduce((sum, t) => sum + t.amountDue, 0),
          totalTransactions: transactions.length,
          totalDiscounts: transactions.reduce((sum, t) => sum + (t.discount || 0), 0),
          wholesaleRevenue: transactions.filter(t => t.saleType === 'WHOLESALE').reduce((sum, t) => sum + t.total, 0),
          retailRevenue: transactions.filter(t => t.saleType === 'RETAIL').reduce((sum, t) => sum + t.total, 0),
          averageTransaction: transactions.length > 0 
            ? transactions.reduce((sum, t) => sum + t.total, 0) / transactions.length 
            : 0,
        },
        {} // Empty filters since we're working with selected data
      );
      
      ReportsExporter.exportToCSV(exportData);
      
      return {
        success: true,
        message: `Exported ${transactions.length} transactions to CSV`,
        processed: transactions.length,
        failed: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to export transactions',
        processed: 0,
        failed: transactions.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static async markAsPaid(transactions: Sale[]): Promise<BatchOperationResult> {
    // This would typically make API calls to update transaction status
    const processable = transactions.filter(t => t.amountDue > 0);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: `Marked ${processable.length} transactions as paid`,
        processed: processable.length,
        failed: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update transaction status',
        processed: 0,
        failed: processable.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static async sendReminders(transactions: Sale[]): Promise<BatchOperationResult> {
    const pendingTransactions = transactions.filter(t => 
      t.amountDue > 0 && t.customer?.email
    );
    
    try {
      // Simulate API call to send email reminders
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        message: `Sent payment reminders for ${pendingTransactions.length} transactions`,
        processed: pendingTransactions.length,
        failed: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send reminders',
        processed: 0,
        failed: pendingTransactions.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static async applyBulkDiscount(
    transactions: Sale[], 
    discountPercent: number
  ): Promise<BatchOperationResult> {
    const eligibleTransactions = transactions.filter(t => t.amountDue > 0);
    
    try {
      // Simulate API call to apply discount
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        success: true,
        message: `Applied ${discountPercent}% discount to ${eligibleTransactions.length} transactions`,
        processed: eligibleTransactions.length,
        failed: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply bulk discount',
        processed: 0,
        failed: eligibleTransactions.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static async generateReport(transactions: Sale[]): Promise<BatchOperationResult> {
    try {
      const totalAmount = transactions.reduce((sum, t) => sum + t.total, 0);
      const paidAmount = transactions.reduce((sum, t) => sum + (t.total - t.amountDue), 0);
      const pendingAmount = transactions.reduce((sum, t) => sum + t.amountDue, 0);
      
      const report = {
        summary: {
          totalTransactions: transactions.length,
          totalAmount: formatCurrency(totalAmount),
          paidAmount: formatCurrency(paidAmount),
          pendingAmount: formatCurrency(pendingAmount),
          averageTransaction: formatCurrency(totalAmount / transactions.length),
        },
        byStatus: {
          paid: transactions.filter(t => t.amountDue === 0).length,
          partial: transactions.filter(t => t.amountDue > 0 && t.amountDue < t.total).length,
          pending: transactions.filter(t => t.amountDue === t.total).length,
        },
        byCustomerType: {
          wholesale: transactions.filter(t => t.saleType === 'WHOLESALE').length,
          retail: transactions.filter(t => t.saleType === 'RETAIL').length,
        },
      };

      // Create and download report
      const reportData = JSON.stringify(report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: `Generated report for ${transactions.length} transactions`,
        processed: transactions.length,
        failed: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate report',
        processed: 0,
        failed: transactions.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static getAvailableOperations(): BatchOperation[] {
    return [
      {
        id: 'export-csv',
        name: 'Export to CSV',
        description: 'Export selected transactions to CSV format',
        icon: () => null, // Will be provided by the component
        action: this.exportSelectedToCSV,
      },
      {
        id: 'mark-paid',
        name: 'Mark as Paid',
        description: 'Mark selected transactions as fully paid',
        icon: () => null,
        action: this.markAsPaid,
        requiresConfirmation: true,
        confirmationMessage: (items) => 
          `Are you sure you want to mark ${items.filter(t => t.amountDue > 0).length} transactions as paid?`,
        disabled: (items) => items.every(t => t.amountDue === 0),
        disabledReason: () => 'All selected transactions are already paid',
      },
      {
        id: 'send-reminders',
        name: 'Send Reminders',
        description: 'Send payment reminder emails to customers',
        icon: () => null,
        action: this.sendReminders,
        requiresConfirmation: true,
        confirmationMessage: (items) => {
          const eligible = items.filter(t => t.amountDue > 0 && t.customer?.email);
          return `Send payment reminders for ${eligible.length} transactions?`;
        },
        disabled: (items) => items.every(t => t.amountDue === 0 || !t.customer?.email),
        disabledReason: () => 'No eligible transactions with pending payments and customer emails',
      },
      {
        id: 'generate-report',
        name: 'Generate Report',
        description: 'Generate detailed report for selected transactions',
        icon: () => null,
        action: this.generateReport,
      },
    ];
  }

  static validateOperation(operation: BatchOperation, items: Sale[]): {
    canExecute: boolean;
    reason?: string;
  } {
    if (items.length === 0) {
      return { canExecute: false, reason: 'No transactions selected' };
    }

    if (operation.disabled && operation.disabled(items)) {
      return { 
        canExecute: false, 
        reason: operation.disabledReason ? operation.disabledReason(items) : 'Operation not available for selected transactions'
      };
    }

    return { canExecute: true };
  }
}

// Hook for managing batch operations
import { useState } from 'react';

export function useBatchOperations() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<BatchOperationResult | null>(null);

  const executeOperation = async (
    operation: BatchOperation,
    items: Sale[]
  ): Promise<BatchOperationResult> => {
    const validation = BatchOperationManager.validateOperation(operation, items);
    
    if (!validation.canExecute) {
      const errorResult: BatchOperationResult = {
        success: false,
        message: validation.reason || 'Cannot execute operation',
        processed: 0,
        failed: items.length,
      };
      setLastResult(errorResult);
      return errorResult;
    }

    setIsExecuting(true);
    setCurrentOperation(operation.id);

    try {
      const result = await operation.action(items);
      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: BatchOperationResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        processed: 0,
        failed: items.length,
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
      setCurrentOperation(null);
    }
  };

  const clearResult = () => {
    setLastResult(null);
  };

  return {
    isExecuting,
    currentOperation,
    lastResult,
    executeOperation,
    clearResult,
    availableOperations: BatchOperationManager.getAvailableOperations(),
  };
}
