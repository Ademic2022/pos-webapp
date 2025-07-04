// Virtualized table component for performance optimization
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  required?: boolean;
  visible?: boolean;
}

export interface TableItem {
  id: string;
  [key: string]: unknown;
}

export interface VirtualizedTableProps<T = TableItem> {
  data: T[];
  columns: TableColumn[];
  renderCell: (item: T, columnKey: string) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  onItemClick?: (item: T) => void;
  selectedItems?: Set<string>;
  loading?: boolean;
  loadingRowCount?: number;
}

export const VirtualizedTable = <T extends { id: string }>({
  data,
  columns,
  renderCell,
  itemHeight = 60,
  containerHeight = 600,
  overscan = 5,
  onItemClick,
  selectedItems = new Set(),
  loading = false,
  loadingRowCount = 10,
}: VirtualizedTableProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const visibleData = loading ? Array(loadingRowCount).fill(null) : data;

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    visibleData.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = visibleData.slice(startIndex, endIndex + 1);
  const totalHeight = visibleData.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: columns
              .map((col) => col.width || "minmax(0, 1fr)")
              .join(" "),
          }}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-200 last:border-r-0"
            >
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Body */}
      <div
        ref={setContainerRef}
        className="relative overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;
              const isSelected = item && selectedItems.has(item.id);

              return (
                <motion.div
                  key={
                    loading ? `loading-${actualIndex}` : item?.id || actualIndex
                  }
                  className={`grid gap-0 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? "bg-orange-50" : ""
                  }`}
                  style={{
                    gridTemplateColumns: columns
                      .map((col) => col.width || "minmax(0, 1fr)")
                      .join(" "),
                    height: itemHeight,
                    minHeight: itemHeight,
                  }}
                  onClick={() => item && onItemClick?.(item)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  whileHover={{ x: 2 }}
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="px-4 py-3 border-r border-gray-100 last:border-r-0 flex items-center"
                    >
                      {loading ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ) : (
                        renderCell(item, column.key)
                      )}
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        {loading ? (
          <div className="animate-pulse">Loading transactions...</div>
        ) : (
          <div className="flex justify-between items-center">
            <span>
              Showing {Math.min(data.length, endIndex - startIndex + 1)} of{" "}
              {data.length} transactions
            </span>
            <span>
              Rows {startIndex + 1}-{Math.min(data.length, endIndex + 1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for managing virtualized table state
export function useVirtualizedTable<T extends { id: string }>(data: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isVirtualized, setIsVirtualized] = useState(false);

  // Auto-enable virtualization for large datasets
  useEffect(() => {
    setIsVirtualized(data.length > 100);
  }, [data.length]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(data.map((item) => item.id)));
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const getSelectedData = useCallback(() => {
    return data.filter((item) => selectedItems.has(item.id));
  }, [data, selectedItems]);

  return {
    selectedItems,
    isVirtualized,
    toggleSelection,
    selectAll,
    clearSelection,
    getSelectedData,
    setIsVirtualized,
    selectionCount: selectedItems.size,
    hasSelection: selectedItems.size > 0,
  };
}

// Performance monitoring hook
export function useTablePerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    itemCount: 0,
    isLagging: false,
  });

  const measureRender = useCallback((startTime: number, itemCount: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const isLagging = renderTime > 100; // Consider 100ms as threshold

    setMetrics({
      renderTime,
      itemCount,
      isLagging,
    });
  }, []);

  const startMeasurement = useCallback(() => {
    return performance.now();
  }, []);

  return {
    metrics,
    measureRender,
    startMeasurement,
  };
}
