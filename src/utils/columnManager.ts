// Column visibility management for the transaction table
export interface TableColumn {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  required?: boolean; // Some columns should always be visible
  width?: string;
  description?: string;
}

export interface ColumnVisibilityState {
  [key: string]: boolean;
}

export class ColumnManager {
  private static readonly STORAGE_KEY = 'reportsTableColumns';

  static getDefaultColumns(): TableColumn[] {
    return [
      {
        key: 'transactionId',
        label: 'Transaction ID',
        visible: true,
        sortable: true,
        required: true,
        width: '140px',
        description: 'Unique transaction identifier'
      },
      {
        key: 'datetime',
        label: 'Date & Time',
        visible: true,
        sortable: true,
        required: true,
        width: '160px',
        description: 'When the transaction occurred'
      },
      {
        key: 'customer',
        label: 'Customer',
        visible: true,
        sortable: true,
        width: '200px',
        description: 'Customer name and type'
      },
      {
        key: 'type',
        label: 'Type',
        visible: true,
        sortable: true,
        width: '100px',
        description: 'Wholesale or retail transaction'
      },
      {
        key: 'amount',
        label: 'Amount',
        visible: true,
        sortable: true,
        required: true,
        width: '120px',
        description: 'Transaction total and discount'
      },
      {
        key: 'payment',
        label: 'Payment',
        visible: true,
        sortable: false,
        width: '120px',
        description: 'Payment methods used'
      },
      {
        key: 'status',
        label: 'Status',
        visible: true,
        sortable: true,
        width: '100px',
        description: 'Payment status'
      },
      {
        key: 'items',
        label: 'Items',
        visible: false,
        sortable: false,
        width: '80px',
        description: 'Number of items in transaction'
      },
      {
        key: 'discount',
        label: 'Discount',
        visible: false,
        sortable: true,
        width: '100px',
        description: 'Discount amount applied'
      },
      {
        key: 'tax',
        label: 'Tax',
        visible: false,
        sortable: true,
        width: '80px',
        description: 'Tax amount'
      },
      {
        key: 'notes',
        label: 'Notes',
        visible: false,
        sortable: false,
        width: '150px',
        description: 'Transaction notes'
      },
      {
        key: 'action',
        label: 'Action',
        visible: true,
        sortable: false,
        required: true,
        width: '80px',
        description: 'View transaction details'
      }
    ];
  }

  static saveColumnVisibility(columns: TableColumn[]): void {
    const visibility: ColumnVisibilityState = {};
    columns.forEach(column => {
      visibility[column.key] = column.visible;
    });
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(visibility));
    } catch (error) {
      console.warn('Failed to save column visibility:', error);
    }
  }

  static loadColumnVisibility(): ColumnVisibilityState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load column visibility:', error);
      return null;
    }
  }

  static applyStoredVisibility(columns: TableColumn[]): TableColumn[] {
    const stored = this.loadColumnVisibility();
    if (!stored) return columns;

    return columns.map(column => ({
      ...column,
      visible: stored[column.key] !== undefined ? stored[column.key] : column.visible
    }));
  }

  static getVisibleColumns(columns: TableColumn[]): TableColumn[] {
    return columns.filter(column => column.visible);
  }

  static toggleColumnVisibility(columns: TableColumn[], columnKey: string): TableColumn[] {
    const updated = columns.map(column => {
      if (column.key === columnKey && !column.required) {
        return { ...column, visible: !column.visible };
      }
      return column;
    });

    this.saveColumnVisibility(updated);
    return updated;
  }

  static resetToDefaults(): TableColumn[] {
    const defaultColumns = this.getDefaultColumns();
    this.saveColumnVisibility(defaultColumns);
    return defaultColumns;
  }

  static getColumnStats(columns: TableColumn[]): {
    total: number;
    visible: number;
    hidden: number;
    required: number;
  } {
    const total = columns.length;
    const visible = columns.filter(col => col.visible).length;
    const hidden = total - visible;
    const required = columns.filter(col => col.required).length;

    return { total, visible, hidden, required };
  }

  static validateColumns(columns: TableColumn[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const requiredColumns = columns.filter(col => col.required);
    const visibleRequired = requiredColumns.filter(col => col.visible);

    if (visibleRequired.length !== requiredColumns.length) {
      errors.push('All required columns must be visible');
    }

    const visibleColumns = columns.filter(col => col.visible);
    if (visibleColumns.length === 0) {
      errors.push('At least one column must be visible');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Hook for managing column visibility
import { useState } from 'react';

export function useColumnVisibility() {
  const [columns, setColumns] = useState<TableColumn[]>(() => {
    const defaultColumns = ColumnManager.getDefaultColumns();
    return ColumnManager.applyStoredVisibility(defaultColumns);
  });

  const toggleColumn = (columnKey: string) => {
    setColumns(prev => ColumnManager.toggleColumnVisibility(prev, columnKey));
  };

  const resetColumns = () => {
    setColumns(ColumnManager.resetToDefaults());
  };

  const visibleColumns = ColumnManager.getVisibleColumns(columns);
  const columnStats = ColumnManager.getColumnStats(columns);
  const validation = ColumnManager.validateColumns(columns);

  return {
    columns,
    visibleColumns,
    columnStats,
    validation,
    toggleColumn,
    resetColumns,
    setColumns
  };
}
