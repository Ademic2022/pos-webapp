"use client";
import React, {
  JSX,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  ArrowLeft,
  DollarSign,
  Package,
  Users,
  Clock,
  Eye,
  Droplets,
  CreditCard,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Mail,
  FileText,
  Check,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportFilters, ExtendedSale, Sale } from "@/interfaces/interface";
import { StatsCard } from "@/components/cards/statCard";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useReportsData } from "@/hooks/useReportsData";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedElement from "@/components/auth/ProtectedElement";
import { formatCurrency, safeNumber } from "@/utils/formatters";
import { ReportsExporter } from "@/utils/exportUtils";
import { CustomerDropdown } from "@/components/CustomerDropdown";
import {
  useLocalStorage,
  useClickOutside,
} from "@/hooks/useUtilityHooks";
import { useToast, ToastContainer } from "@/hooks/useToast";
import { DatePresetUtils, DatePreset } from "@/utils/datePresets";
import { useColumnVisibility } from "@/utils/columnManager";
import { useFilterPresets, FilterPreset } from "@/utils/filterPresets";
import {
  VirtualizedTable,
  useVirtualizedTable,
} from "@/components/VirtualizedTable";
import { useBatchOperations } from "@/utils/batchOperations";



const SalesReportPage = () => {
  const router = useRouter();

  usePageLoading({
    text: "Loading reports",
    minDuration: 750,
  });

  // Live data hook
  const {
    sales: salesData,
    statistics,
    summary,
    isLoading: isDataLoading,
    isLoadingTransactions,
    error: dataError,
    hasNextPage,
    loadMore,
    refetch,
    fetchTransactions,
    applyFilters,
  } = useReportsData();

  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "customers"
  >("overview");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // New feature states
  const [showDatePresets, setShowDatePresets] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [selectedDatePreset, setSelectedDatePreset] = useState<string | null>(
    null
  );

  // Column management
  const { columns, visibleColumns, columnStats, toggleColumn, resetColumns } =
    useColumnVisibility();

  // Filter presets
  const { presets, savePreset, deletePreset } = useFilterPresets();

  // Virtualized table and batch operations
  const {
    selectedItems,
    isVirtualized,
    toggleSelection,
    selectAll,
    clearSelection,
    getSelectedData,
    setIsVirtualized,
    selectionCount,
    hasSelection,
  } = useVirtualizedTable(salesData);

  const {
    isExecuting: isBatchExecuting,
    lastResult: batchResult,
    executeOperation,
    clearResult: clearBatchResult,
    availableOperations: batchOperations,
  } = useBatchOperations();

  // Use localStorage for filter persistence
  const [filters, setFilters] = useLocalStorage<ReportFilters>(
    "reportsFilters",
    {
      dateRange: "month",
      customerType: "all",
      paymentMethod: "all",
      status: "all",
      startDate: "",
      endDate: "",
      // Advanced filters
      amountMin: undefined,
      amountMax: undefined,
      customerId: "",
      sortBy: "date",
      sortDirection: "desc",
    }
  );

  // Click outside refs for dropdowns
  const exportDropdownRef = useClickOutside<HTMLDivElement>(() => {
    setShowExportDropdown(false);
  });

  const datePresetRef = useClickOutside<HTMLDivElement>(() => {
    setShowDatePresets(false);
  });

  const columnSettingsRef = useClickOutside<HTMLDivElement>(() => {
    setShowColumnSettings(false);
  });

  const presetManagerRef = useClickOutside<HTMLDivElement>(() => {
    setShowPresetManager(false);
  });

  // Toast notifications
  const { toasts, showToast, hideToast } = useToast();

  // Handle tab switching with lazy loading
  const handleTabChange = useCallback(async (tab: "overview" | "transactions" | "customers") => {
    setActiveTab(tab);

    // Fetch transactions when switching to transactions tab
    if (tab === "transactions" && salesData.length === 0) {
      await fetchTransactions();
    }
  }, [salesData.length, fetchTransactions]);

  // Reset filters with confirmation
  const handleResetFilters = () => {
    const defaultFilters: ReportFilters = {
      dateRange: "month",
      customerType: "all",
      paymentMethod: "all",
      status: "all",
      startDate: "",
      endDate: "",
      amountMin: undefined,
      amountMax: undefined,
      customerId: "",
      sortBy: "date",
      sortDirection: "desc",
    };

    setFilters(defaultFilters);
    showToast({
      type: "info",
      title: "Filters Reset",
      message: "All filters have been reset to default values",
    });
  };

  // Create a debounced applyFilters to prevent too many API calls
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedApplyFilters = useCallback(
    (filters: ReportFilters) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        applyFilters(filters);
      }, 300);
    },
    [applyFilters]
  );

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== "month") count++;
    if (filters.customerType !== "all") count++;
    if (filters.paymentMethod !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.customerId) count++;
    if (filters.amountMin) count++;
    if (filters.amountMax) count++;
    if (filters.sortBy !== "date" || filters.sortDirection !== "desc") count++;
    return count;
  }, [filters]);

  // Handle filter changes with debouncing
  useEffect(() => {
    debouncedApplyFilters(filters);
  }, [filters, debouncedApplyFilters]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Handle export
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    try {
      const exportData = ReportsExporter.prepareExportData(
        salesData,
        summary,
        filters
      );

      switch (format) {
        case "csv":
          ReportsExporter.exportToCSV(exportData);
          showToast({
            type: "success",
            title: "CSV Export Successful",
            message: `Exported ${salesData.length} transactions to CSV format`,
          });
          break;
        case "excel":
          ReportsExporter.exportToExcel(exportData);
          showToast({
            type: "success",
            title: "Excel Export Successful",
            message: `Exported ${salesData.length} transactions to Excel format`,
          });
          break;
        case "pdf":
          ReportsExporter.exportToPDF(exportData);
          showToast({
            type: "success",
            title: "PDF Export Successful",
            message: "Report opened for printing/saving as PDF",
          });
          break;
      }

      setShowExportDropdown(false);
    } catch (err) {
      console.error("Export failed:", err);
      showToast({
        type: "error",
        title: "Export Failed",
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during export",
      });
    }
  };

  // Date preset handlers
  const handleDatePresetSelect = (preset: DatePreset) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: "custom",
      startDate: DatePresetUtils.formatDateForInput(preset.startDate),
      endDate: DatePresetUtils.formatDateForInput(preset.endDate),
    }));
    setSelectedDatePreset(preset.value);
    setShowDatePresets(false);

    showToast({
      type: "info",
      title: "Date Range Applied",
      message: `Showing ${preset.label.toLowerCase()} transactions`,
    });
  };

  // Filter preset handlers
  const handleApplyPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    setShowPresetManager(false);

    showToast({
      type: "info",
      title: "Preset Applied",
      message: `Applied filter preset: ${preset.name}`,
    });
  };

  const handleSaveCurrentAsPreset = () => {
    const presetName = prompt("Enter a name for this filter preset:");
    if (!presetName?.trim()) return;

    try {
      savePreset({
        name: presetName.trim(),
        description: `Saved on ${new Date().toLocaleDateString()}`,
        filters: { ...filters },
      });

      showToast({
        type: "success",
        title: "Preset Saved",
        message: `Filter preset "${presetName}" has been saved`,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Save Failed",
        message: "Failed to save filter preset",
      });
      console.log(error);
    }
  };

  // Helper function to render table cell content
  const renderTableCell = (sale: Sale, columnKey: string) => {
    const key = `${sale.id}-${columnKey}`;

    switch (columnKey) {
      case "transactionId":
        return (
          <td key={key} className="py-3 px-4 font-mono text-sm">{sale.transactionId}</td>
        );

      case "datetime":
        return (
          <td key={key} className="py-3 px-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {new Date(sale.createdAt).toLocaleDateString()}
              </div>
              <div className="text-gray-600">
                {new Date(sale.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </td>
        );

      case "customer":
        return (
          <td key={key} className="py-3 px-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {sale.customer?.name || "Walk-in Customer"}
              </div>
              <div className="text-gray-600 capitalize">
                {sale.saleType.toLowerCase()}
              </div>
            </div>
          </td>
        );

      case "type":
        return (
          <td key={key} className="py-3 px-4">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sale.saleType === "WHOLESALE"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
                }`}
            >
              {sale.saleType.toLowerCase()}
            </span>
          </td>
        );

      case "amount":
        return (
          <td key={key} className="py-3 px-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {formatCurrency(sale.total)}
              </div>
              {safeNumber(sale.discount) > 0 && (
                <div className="text-green-600">
                  -{formatCurrency(sale.discount)} discount
                </div>
              )}
            </div>
          </td>
        );

      case "payment":
        return (
          <td key={key} className="py-3 px-4">
            <div className="flex flex-wrap gap-1 text-sm">
              {sale.payments?.map(
                (
                  payment: { method: string; amount: number },
                  paymentIndex: number
                ) => (
                  <div
                    key={paymentIndex}
                    className="flex items-center space-x-1"
                  >
                    {getPaymentMethodIcon(payment.method.toLowerCase())}
                    <span className="capitalize text-xs">
                      {payment.method.toLowerCase()}
                    </span>
                  </div>
                )
              ) || <span className="text-gray-500 text-xs">No payments</span>}
            </div>
          </td>
        );

      case "status":
        return (
          <td key={key} className="py-3 px-4">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sale.amountDue === 0
                ? "text-green-600 bg-green-100"
                : sale.amountDue < sale.total
                  ? "text-yellow-600 bg-yellow-100"
                  : "text-red-600 bg-red-100"
                }`}
            >
              {sale.amountDue === 0
                ? "paid"
                : sale.amountDue < sale.total
                  ? "partial"
                  : "pending"}
            </span>
            {safeNumber(sale.amountDue) > 0 && (
              <div className="text-xs text-red-600 mt-1">
                {formatCurrency(sale.amountDue)} remaining
              </div>
            )}
          </td>
        );

      case "items":
        return (
          <td key={key} className="py-3 px-4">
            <span className="text-sm text-gray-600">
              {sale.items?.length || 0} items
            </span>
          </td>
        );

      case "discount":
        return (
          <td key={key} className="py-3 px-4">
            <span className="text-sm text-green-600">
              {safeNumber(sale.discount) > 0
                ? formatCurrency(sale.discount)
                : "-"}
            </span>
          </td>
        );

      case "tax":
        return (
          <td key={key} className="py-3 px-4">
            <span className="text-sm text-gray-600">
              {sale.tax ? formatCurrency(sale.tax) : "-"}
            </span>
          </td>
        );

      case "notes":
        return (
          <td key={key} className="py-3 px-4">
            <span className="text-sm text-gray-600 truncate">
              {sale.notes || "-"}
            </span>
          </td>
        );

      case "action":
        return (
          <td key={key} className="py-3 px-4">
            <motion.button
              onClick={() =>
                setSelectedTransaction(
                  selectedTransaction === sale.id ? null : sale.id
                )
              }
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </td>
        );

      default:
        return <td key={key} className="py-3 px-4">-</td>;
    }
  };

  // Batch operation handlers
  const handleBatchOperation = async (operationId: string) => {
    const operation = batchOperations.find((op) => op.id === operationId);
    if (!operation) return;

    const selectedData = getSelectedData();

    if (operation.requiresConfirmation && operation.confirmationMessage) {
      const confirmed = window.confirm(
        operation.confirmationMessage(selectedData)
      );
      if (!confirmed) return;
    }

    const result = await executeOperation(operation, selectedData);

    if (result.success) {
      showToast({
        type: "success",
        title: "Batch Operation Completed",
        message: result.message,
      });

      // Clear selection after successful operation
      clearSelection();
    } else {
      showToast({
        type: "error",
        title: "Batch Operation Failed",
        message: result.message,
      });
    }
  };

  const handleToggleVirtualization = () => {
    setIsVirtualized(!isVirtualized);
    showToast({
      type: "info",
      title: isVirtualized
        ? "Virtualization Disabled"
        : "Virtualization Enabled",
      message: isVirtualized
        ? "Showing all rows in traditional table view"
        : "Large dataset optimized with virtualization",
    });
  };

  // Enhanced cell rendering for virtualized table
  const renderVirtualizedCell = (sale: Sale, columnKey: string) => {
    switch (columnKey) {
      case "transactionId":
        return (
          <span className="font-mono text-sm text-gray-900">
            {sale.transactionId}
          </span>
        );

      case "datetime":
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {new Date(sale.createdAt).toLocaleDateString()}
            </div>
            <div className="text-gray-600">
              {new Date(sale.createdAt).toLocaleTimeString()}
            </div>
          </div>
        );

      case "customer":
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {sale.customer?.name || "Walk-in Customer"}
            </div>
            <div className="text-gray-600 capitalize">
              {sale.saleType.toLowerCase()}
            </div>
          </div>
        );

      case "amount":
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {formatCurrency(sale.total)}
            </div>
            {safeNumber(sale.discount) > 0 && (
              <div className="text-green-600">
                -{formatCurrency(sale.discount)}
              </div>
            )}
          </div>
        );

      case "status":
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sale.amountDue === 0
              ? "text-green-600 bg-green-100"
              : sale.amountDue < sale.total
                ? "text-yellow-600 bg-yellow-100"
                : "text-red-600 bg-red-100"
              }`}
          >
            {sale.amountDue === 0
              ? "paid"
              : sale.amountDue < sale.total
                ? "partial"
                : "pending"}
          </span>
        );

      default:
        return <span className="text-sm text-gray-600">-</span>;
    }
  };

  const getPaymentMethodIcon = (method: string): JSX.Element => {
    switch (method) {
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "transfer":
        return <CreditCard className="w-4 h-4" />;
      case "credit":
        return <AlertCircle className="w-4 h-4" />;
      case "part_payment":
        return <Clock className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <ProtectedRoute requiredPermission="VIEW_REPORTS">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} hideToast={hideToast} />

      <motion.div
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </button>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      delay: 2,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                  >
                    <BarChart3 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Sales Reports
                    </h1>
                    <p className="text-xs text-orange-600">
                      Live Analytics & Insights{" "}
                      {isDataLoading && "• Updating..."}
                    </p>
                  </div>
                </motion.div>
              </div>
              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {/* Refresh Button */}
                <motion.button
                  onClick={handleRefresh}
                  disabled={isDataLoading || isRefreshing}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDataLoading || isRefreshing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105"
                    }`}
                  whileHover={
                    !isDataLoading && !isRefreshing ? { scale: 1.05 } : {}
                  }
                  whileTap={
                    !isDataLoading && !isRefreshing ? { scale: 0.95 } : {}
                  }
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isDataLoading || isRefreshing ? "animate-spin" : ""
                      }`}
                  />
                  <span>
                    {isDataLoading || isRefreshing
                      ? "Refreshing..."
                      : "Refresh"}
                  </span>
                </motion.button>

                {/* Error indicator */}
                {dataError && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
                    title={dataError}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Error</span>
                  </motion.div>
                )}

                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors relative"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </motion.button>
                <ProtectedElement requiredPermission="VIEW_FINANCIAL_DATA">
                  <div className="relative" ref={exportDropdownRef}>
                    <motion.button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Export</span>
                    </motion.button>

                    {/* Export Dropdown */}
                    <AnimatePresence>
                      {showExportDropdown && (
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="py-2">
                            <button
                              onClick={() => handleExport("csv")}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4 text-blue-600" />
                              <span>Export as CSV</span>
                            </button>
                            <button
                              onClick={() => handleExport("excel")}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4 text-green-600" />
                              <span>Export as Excel</span>
                            </button>
                            <button
                              onClick={() => handleExport("pdf")}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4 text-red-600" />
                              <span>Export as PDF</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ProtectedElement>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 mb-8"
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <motion.h3
                  className="text-lg font-semibold text-gray-900 mb-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  Filter Reports
                </motion.h3>

                {/* Enhanced Filter Controls Row */}
                <motion.div
                  className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  {/* Date Presets */}
                  <div className="relative" ref={datePresetRef}>
                    <motion.button
                      onClick={() => setShowDatePresets(!showDatePresets)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Quick Dates</span>
                      {selectedDatePreset && (
                        <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                          {
                            DatePresetUtils.getAllPresets().find(
                              (p) => p.value === selectedDatePreset
                            )?.label
                          }
                        </span>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showDatePresets && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                              Quick Date Ranges
                            </div>
                            {DatePresetUtils.getAllPresets().map((preset) => (
                              <motion.button
                                key={preset.value}
                                onClick={() => handleDatePresetSelect(preset)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-orange-50 transition-colors ${selectedDatePreset === preset.value
                                  ? "bg-orange-100 text-orange-700"
                                  : "text-gray-700"
                                  }`}
                                whileHover={{ x: 2 }}
                              >
                                <div className="font-medium">
                                  {preset.label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {preset.description}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Filter Presets */}
                  <div className="relative" ref={presetManagerRef}>
                    <motion.button
                      onClick={() => setShowPresetManager(!showPresetManager)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Package className="w-4 h-4 text-orange-600" />
                      <span>Presets</span>
                      <span className="text-xs text-gray-500">
                        ({presets.filter((p) => !p.isDefault).length} saved)
                      </span>
                    </motion.button>

                    <AnimatePresence>
                      {showPresetManager && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                Filter Presets
                              </h4>
                              <motion.button
                                onClick={handleSaveCurrentAsPreset}
                                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Save Current
                              </motion.button>
                            </div>

                            <div className="space-y-1 max-h-64 overflow-y-auto">
                              {presets.map((preset) => (
                                <div
                                  key={preset.id}
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 truncate">
                                      {preset.name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {preset.description || "No description"}
                                    </div>
                                    {preset.tags && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {preset.tags.slice(0, 3).map((tag) => (
                                          <span
                                            key={tag}
                                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1 ml-2">
                                    <motion.button
                                      onClick={() => handleApplyPreset(preset)}
                                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Apply
                                    </motion.button>
                                    {!preset.isDefault && (
                                      <motion.button
                                        onClick={() => deletePreset(preset.id)}
                                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        Delete
                                      </motion.button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Column Settings */}
                  <div className="relative" ref={columnSettingsRef}>
                    <motion.button
                      onClick={() => setShowColumnSettings(!showColumnSettings)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4 text-orange-600" />
                      <span>Columns</span>
                      <span className="text-xs text-gray-500">
                        ({columnStats.visible}/{columnStats.total})
                      </span>
                    </motion.button>

                    <AnimatePresence>
                      {showColumnSettings && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                Table Columns
                              </h4>
                              <motion.button
                                onClick={resetColumns}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Reset
                              </motion.button>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {columns.map((column) => (
                                <div
                                  key={column.key}
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={column.visible}
                                      onChange={() => toggleColumn(column.key)}
                                      disabled={column.required}
                                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
                                    />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {column.label}
                                        {column.required && (
                                          <span className="ml-1 text-xs text-red-500">
                                            *
                                          </span>
                                        )}
                                      </div>
                                      {column.description && (
                                        <div className="text-xs text-gray-500">
                                          {column.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-500">
                                Showing {columnStats.visible} of{" "}
                                {columnStats.total} columns
                                {columnStats.required > 0 && (
                                  <span className="block mt-1">
                                    * Required columns cannot be hidden
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: e.target
                            .value as ReportFilters["dateRange"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Type
                    </label>
                    <select
                      value={filters.customerType}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          customerType: e.target
                            .value as ReportFilters["customerType"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Customers</option>
                      <option value="wholesale">Wholesale Only</option>
                      <option value="retail">Retail Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={filters.paymentMethod}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          paymentMethod: e.target
                            .value as ReportFilters["paymentMethod"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Methods</option>
                      <option value="cash">Cash Only</option>
                      <option value="transfer">Transfer Only</option>
                      <option value="credit">Credit Only</option>
                      <option value="part_payment">Part Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          status: e.target.value as ReportFilters["status"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial Payment</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </motion.div>

                {/* Advanced Filters */}
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Customer
                    </label>
                    <CustomerDropdown
                      value={filters.customerId || ""}
                      onChange={(customerId) => {
                        setFilters({
                          ...filters,
                          customerId: customerId || undefined,
                        });
                      }}
                      placeholder="All Customers"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Search and select a specific customer to filter transactions
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      value={filters.amountMin || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amountMin: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      value={filters.amountMax || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amountMax: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="No limit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy || "date"}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sortBy: e.target.value as
                            | "date"
                            | "amount"
                            | "customer"
                            | "status",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="customer">Customer</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </motion.div>

                {/* Custom Date Range */}
                {filters.dateRange === "custom" && (
                  <motion.div
                    className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Filter Actions */}
                <motion.div
                  className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          sortDirection:
                            filters.sortDirection === "asc" ? "desc" : "asc",
                        })
                      }
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {filters.sortDirection === "asc"
                          ? "Ascending"
                          : "Descending"}
                      </span>
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reset Filters
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Total Sales"
                value={
                  isDataLoading
                    ? "Loading..."
                    : formatCurrency(summary.totalSales)
                }
                change={{
                  value: isDataLoading ? "..." : "+8.2% from last month",
                  icon: TrendingUp,
                  textColor: "text-green-600",
                }}
                icon={DollarSign}
                iconBg="bg-green-100"
                iconColor="text-green-600"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Total Transactions"
                value={
                  isDataLoading
                    ? "Loading..."
                    : summary.totalTransactions.toString()
                }
                change={{
                  value: isDataLoading ? "..." : "+12 from yesterday",
                  icon: TrendingUp,
                  textColor: "text-blue-600",
                }}
                icon={Package}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Outstanding Debt"
                value={
                  isDataLoading
                    ? "Loading..."
                    : formatCurrency(summary.totalOutstanding)
                }
                change={{
                  value: isDataLoading
                    ? "..."
                    : statistics && statistics.customerDebtIncurred.count > 0
                      ? `${statistics.customerDebtIncurred.count} debt transactions`
                      : `${salesData.filter((sale) => sale.amountDue > 0).length} customers`,
                  icon: TrendingDown,
                  textColor: "text-red-600",
                }}
                icon={AlertCircle}
                iconBg="bg-red-100"
                iconColor="text-red-600"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard
                title="Average Sale"
                value={
                  isDataLoading
                    ? "Loading..."
                    : formatCurrency(summary.averageTransaction)
                }
                change={{
                  value: isDataLoading ? "..." : "Per transaction",
                  icon: TrendingUp,
                  textColor: "text-orange-600",
                }}
                icon={BarChart3}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
              />
            </motion.div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{
              y: -2,
              boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
            }}
          >
            <motion.div
              className="border-b border-gray-200"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <nav className="flex space-x-8 px-6">
                <motion.button
                  onClick={() => handleTabChange("overview")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "overview"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Overview
                </motion.button>
                <motion.button
                  onClick={() => handleTabChange("transactions")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "transactions"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoadingTransactions}
                >
                  <span className="flex items-center space-x-2">
                    <span>Transactions</span>
                    {isLoadingTransactions && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}
                  </span>
                </motion.button>
                <motion.button
                  onClick={() => handleTabChange("customers")}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "customers"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Customer Analysis
                </motion.button>
              </nav>
            </motion.div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Sales Breakdown & Payment Methods */}
                <motion.div
                  className="grid lg:grid-cols-2 gap-8 mb-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {/* Sales Type Breakdown */}
                  <motion.div
                    className="bg-white rounded-xl p-6 border border-gray-200"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      Sales Breakdown
                    </h3>

                    <div className="space-y-4">
                      <motion.div
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Wholesale Sales</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {isDataLoading ? "..." : formatCurrency(statistics?.wholesaleSales || summary.wholesaleRevenue)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {isDataLoading ? "..." : (
                              statistics?.totalSales || summary.totalSales) > 0
                              ? ((statistics?.wholesaleSales || summary.wholesaleRevenue) /
                                (statistics?.totalSales || summary.totalSales) * 100).toFixed(1)
                              : "0.0"}% of total
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Retail Sales</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {isDataLoading ? "..." : formatCurrency(statistics?.retailSales || summary.retailRevenue)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {isDataLoading ? "..." : (
                              statistics?.totalSales || summary.totalSales) > 0
                              ? ((statistics?.retailSales || summary.retailRevenue) /
                                (statistics?.totalSales || summary.totalSales) * 100).toFixed(1)
                              : "0.0"}% of total
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Payment Methods */}
                  <motion.div
                    className="bg-white rounded-xl p-6 border border-gray-200"
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                      Payment Methods
                    </h3>

                    <div className="space-y-4">
                      {statistics && [
                        { method: "Cash", amount: statistics.cashSales, color: "green", icon: DollarSign },
                        { method: "Transfer", amount: statistics.transferSales, color: "blue", icon: CreditCard },
                        { method: "Credit", amount: statistics.creditSales, color: "purple", icon: Clock },
                        { method: "Part Payment", amount: statistics.partPaymentSales, color: "orange", icon: AlertCircle },
                      ].filter(payment => payment.amount > 0).map((payment, index) => (
                        <motion.div
                          key={payment.method}
                          className={`flex items-center justify-between p-4 bg-gradient-to-r from-${payment.color}-50 to-${payment.color}-100 rounded-lg`}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <div className="flex items-center space-x-3">
                            <payment.icon className={`w-4 h-4 text-${payment.color}-600`} />
                            <span className="font-medium text-gray-900">{payment.method}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {statistics.totalSales > 0
                                ? (payment.amount / statistics.totalSales * 100).toFixed(1)
                                : "0.0"}%
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {!statistics && (
                        <div className="text-center py-8 text-gray-500">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p>Loading payment method breakdown...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Customer Credit Summary (if statistics available) */}
                {statistics && (statistics.customerCreditApplied.value > 0 || statistics.customerCreditEarned.value > 0 || statistics.customerDebtIncurred.value > 0) && (
                  <motion.div
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mb-8"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-indigo-600" />
                      Customer Credit Activity
                    </h3>

                    <div className="grid md:grid-cols-3 gap-4">
                      <motion.div
                        className="bg-white rounded-lg p-4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-sm text-gray-600 mb-1">Credit Applied</div>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(statistics.customerCreditApplied.value)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {statistics.customerCreditApplied.count} applications
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-white rounded-lg p-4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.3, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-sm text-gray-600 mb-1">Credit Earned</div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(statistics.customerCreditEarned.value)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {statistics.customerCreditEarned.count} earnings
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-white rounded-lg p-4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-sm text-gray-600 mb-1">New Debt</div>
                        <div className="text-xl font-bold text-orange-600">
                          {formatCurrency(statistics.customerDebtIncurred.value)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {statistics.customerDebtIncurred.count} transactions
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Additional Insights */}
                <motion.div
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                    Quick Insights
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Total Transactions:</span>
                        <span className="font-semibold text-gray-900">
                          {statistics?.totalTransactions || summary.totalTransactions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Average per Transaction:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(statistics?.averageSaleValue || summary.averageTransaction)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Total Discounts:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(statistics?.totalDiscounts || summary.totalDiscounts)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      {statistics?.dateRangeFrom && statistics?.dateRangeTo && (
                        <div className="p-3 bg-white rounded-lg">
                          <div className="text-gray-700 mb-1">Date Range:</div>
                          <div className="font-semibold text-gray-900">
                            {new Date(statistics.dateRangeFrom).toLocaleDateString()} - {new Date(statistics.dateRangeTo).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {statistics?.filteredBySaleType && (
                        <div className="p-3 bg-white rounded-lg">
                          <div className="text-gray-700 mb-1">Filtered by:</div>
                          <div className="font-semibold text-gray-900 capitalize">
                            {statistics.filteredBySaleType.toLowerCase()} sales
                          </div>
                        </div>
                      )}
                      {statistics?.filteredByPaymentMethod && (
                        <div className="p-3 bg-white rounded-lg">
                          <div className="text-gray-700 mb-1">Payment Method:</div>
                          <div className="font-semibold text-gray-900 capitalize">
                            {statistics.filteredByPaymentMethod.toLowerCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Show loading state when fetching transactions */}
                {isLoadingTransactions && salesData.length === 0 && (
                  <motion.div
                    className="flex items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Loading Transactions</p>
                      <p className="text-sm text-gray-600">Fetching transaction data...</p>
                    </div>
                  </motion.div>
                )}

                {/* Show empty state when no transactions and not loading */}
                {!isLoadingTransactions && salesData.length === 0 && (
                  <motion.div
                    className="flex items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</p>
                      <p className="text-sm text-gray-600 mb-4">Click &quot;Load Transactions&quot; to fetch data or adjust your filters</p>
                      <motion.button
                        onClick={() => fetchTransactions()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Load Transactions
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Show transactions content when loaded */}
                {(!isLoadingTransactions || salesData.length > 0) && salesData.length > 0 && (
                  <>
                    {/* Batch Operations Toolbar */}
                    <motion.div
                      className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          {/* Selection Controls */}
                          <div className="flex items-center space-x-2">
                            <motion.button
                              onClick={hasSelection ? clearSelection : selectAll}
                              className="text-sm bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {hasSelection ? "Clear" : "Select All"}
                            </motion.button>

                            {hasSelection && (
                              <motion.span
                                className="text-sm text-gray-600 bg-orange-100 px-2 py-1 rounded"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                {selectionCount} selected
                              </motion.span>
                            )}
                          </div>

                          {/* Batch Operations */}
                          {hasSelection && (
                            <motion.div
                              className="flex items-center space-x-2"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.button
                                onClick={() => handleBatchOperation("export-csv")}
                                disabled={isBatchExecuting}
                                className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                              </motion.button>

                              <motion.button
                                onClick={() => handleBatchOperation("mark-paid")}
                                disabled={
                                  isBatchExecuting ||
                                  getSelectedData().every((t) => t.amountDue === 0)
                                }
                                className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Check className="w-4 h-4" />
                                <span>Mark Paid</span>
                              </motion.button>

                              <motion.button
                                onClick={() =>
                                  handleBatchOperation("send-reminders")
                                }
                                disabled={
                                  isBatchExecuting ||
                                  getSelectedData().every(
                                    (t) => t.amountDue === 0 || !t.customer?.email
                                  )
                                }
                                className="flex items-center space-x-1 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Mail className="w-4 h-4" />
                                <span>Remind</span>
                              </motion.button>

                              <motion.button
                                onClick={() =>
                                  handleBatchOperation("generate-report")
                                }
                                disabled={isBatchExecuting}
                                className="flex items-center space-x-1 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <FileText className="w-4 h-4" />
                                <span>Report</span>
                              </motion.button>
                            </motion.div>
                          )}
                        </div>

                        {/* Table Options */}
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={handleToggleVirtualization}
                            className={`flex items-center space-x-1 text-sm px-3 py-2 rounded-lg transition-colors ${isVirtualized
                              ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Settings className="w-4 h-4" />
                            <span>
                              {isVirtualized ? "Virtual View" : "Standard View"}
                            </span>
                          </motion.button>

                          <span className="text-xs text-gray-500">
                            {salesData.length} transactions
                          </span>
                        </div>
                      </div>

                      {/* Batch Operation Status */}
                      <AnimatePresence>
                        {isBatchExecuting && (
                          <motion.div
                            className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-sm text-blue-700">
                                Executing batch operation...
                              </span>
                            </div>
                          </motion.div>
                        )}

                        {batchResult && !isBatchExecuting && (
                          <motion.div
                            className={`mt-3 p-3 rounded-lg border ${batchResult.success
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {batchResult.success ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span
                                  className={`text-sm ${batchResult.success
                                    ? "text-green-700"
                                    : "text-red-700"
                                    }`}
                                >
                                  {batchResult.message}
                                </span>
                              </div>
                              <motion.button
                                onClick={clearBatchResult}
                                className="text-xs text-gray-500 hover:text-gray-700"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                ✕
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Table Content */}
                    {isVirtualized && salesData.length > 100 ? (
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <VirtualizedTable
                          data={salesData}
                          columns={visibleColumns}
                          renderCell={renderVirtualizedCell}
                          onItemClick={(item) => toggleSelection(item.id)}
                          selectedItems={selectedItems}
                          loading={isDataLoading}
                          containerHeight={600}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="overflow-x-auto"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <motion.table
                          className="w-full"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <thead>
                            <tr className="border-b border-gray-200">
                              {/* Selection Checkbox */}
                              <th className="text-left py-3 px-4 font-medium text-gray-900 w-12">
                                <input
                                  type="checkbox"
                                  checked={
                                    hasSelection &&
                                    selectionCount === salesData.length
                                  }
                                  onChange={
                                    hasSelection ? clearSelection : selectAll
                                  }
                                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                              </th>
                              {visibleColumns.map((column) => (
                                <th
                                  key={column.key}
                                  className="text-left py-3 px-4 font-medium text-gray-900"
                                  style={{ width: column.width }}
                                >
                                  <div className="flex items-center space-x-1">
                                    <span>{column.label}</span>
                                    {column.sortable && (
                                      <motion.button
                                        onClick={() => {
                                          const newDirection =
                                            filters.sortBy === column.key &&
                                              filters.sortDirection === "asc"
                                              ? "desc"
                                              : "asc";
                                          setFilters((prev) => ({
                                            ...prev,
                                            sortBy: column.key as
                                              | "date"
                                              | "amount"
                                              | "customer"
                                              | "status",
                                            sortDirection: newDirection,
                                          }));
                                        }}
                                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        {filters.sortBy === column.key ? (
                                          filters.sortDirection === "asc" ? (
                                            <TrendingUp className="w-3 h-3 text-orange-500" />
                                          ) : (
                                            <TrendingDown className="w-3 h-3 text-orange-500" />
                                          )
                                        ) : (
                                          <BarChart3 className="w-3 h-3 text-gray-400" />
                                        )}
                                      </motion.button>
                                    )}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="group">
                            {salesData.map((sale, index) => (
                              <React.Fragment key={sale.id}>
                                <motion.tr
                                  className={`border-b border-gray-100 hover:bg-gray-50 group cursor-pointer ${selectedItems.has(sale.id) ? "bg-orange-50" : ""
                                    }`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: 0.4 + index * 0.05,
                                    duration: 0.4,
                                  }}
                                  whileHover={{
                                    backgroundColor: selectedItems.has(sale.id)
                                      ? "rgba(255, 237, 213, 1)"
                                      : "rgba(249, 250, 251, 1)",
                                    x: 5,
                                  }}
                                  onClick={() => toggleSelection(sale.id)}
                                >
                                  {/* Selection Checkbox */}
                                  <td className="py-3 px-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedItems.has(sale.id)}
                                      onChange={() => toggleSelection(sale.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                  </td>
                                  {visibleColumns.map((column) =>
                                    renderTableCell(sale, column.key)
                                  )}
                                </motion.tr>
                                <AnimatePresence>
                                  {selectedTransaction === sale.id && (
                                    <motion.tr
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <td
                                        colSpan={visibleColumns.length + 1}
                                        className="py-4 px-4 bg-orange-50 border-b"
                                      >
                                        <motion.div
                                          className="space-y-4"
                                          initial={{ y: 10, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.1, duration: 0.3 }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900">
                                              Transaction Details
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                              <span className={`text-xs px-2 py-1 rounded-full ${((sale as ExtendedSale).saleType || '').toUpperCase() === 'WHOLESALE'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {((sale as ExtendedSale).saleType || 'retail').toLowerCase()}
                                              </span>
                                              <span className={`text-xs px-2 py-1 rounded-full ${((sale as ExtendedSale).paymentMethod || '').toUpperCase() === 'CASH' ? 'bg-green-100 text-green-700' :
                                                ((sale as ExtendedSale).paymentMethod || '').toUpperCase() === 'TRANSFER' ? 'bg-blue-100 text-blue-700' :
                                                  ((sale as ExtendedSale).paymentMethod || '').toUpperCase() === 'CREDIT' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {((sale as ExtendedSale).paymentMethod || 'cash').toLowerCase()}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="grid lg:grid-cols-3 gap-6">
                                            {/* Items Purchased */}
                                            <div className="space-y-3">
                                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <Package className="w-4 h-4 mr-1.5" />
                                                Items Purchased ({sale.items.length})
                                              </h5>
                                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {sale.items.map(
                                                  (
                                                    item: {
                                                      quantity: number;
                                                      totalPrice: number;
                                                      unitPrice?: number;
                                                      product: { name: string; sku?: string };
                                                    },
                                                    itemIndex: number
                                                  ) => (
                                                    <motion.div
                                                      key={itemIndex}
                                                      className="bg-gray-50 rounded-lg p-3 text-sm"
                                                      initial={{ x: -10, opacity: 0 }}
                                                      animate={{ x: 0, opacity: 1 }}
                                                      transition={{
                                                        delay: 0.2 + itemIndex * 0.05,
                                                        duration: 0.3,
                                                      }}
                                                    >
                                                      <div className="font-medium text-gray-900 mb-1">
                                                        {item.product.name}
                                                      </div>
                                                      <div className="flex justify-between text-gray-600">
                                                        <span>Qty: {item.quantity}</span>
                                                        <span>{formatCurrency(item.totalPrice)}</span>
                                                      </div>
                                                      {item.unitPrice && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                          Unit Price: {formatCurrency(item.unitPrice)}
                                                        </div>
                                                      )}
                                                    </motion.div>
                                                  )
                                                )}
                                              </div>
                                            </div>

                                            {/* Payment Summary */}
                                            <div>
                                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <DollarSign className="w-4 h-4 mr-1.5" />
                                                Payment Summary
                                              </h5>
                                              <motion.div
                                                className="bg-gray-50 rounded-lg p-3 space-y-2"
                                                initial={{ x: 10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{
                                                  delay: 0.3,
                                                  duration: 0.3,
                                                }}
                                              >
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-600">Subtotal:</span>
                                                  <span className="font-medium text-gray-900">
                                                    {formatCurrency(sale.subtotal)}
                                                  </span>
                                                </div>

                                                {safeNumber(sale.discount) > 0 && (
                                                  <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Discount:</span>
                                                    <span className="text-red-600 font-medium">
                                                      -{formatCurrency(sale.discount)}
                                                    </span>
                                                  </div>
                                                )}

                                                {safeNumber((sale as ExtendedSale).tax || 0) > 0 && (
                                                  <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Tax:</span>
                                                    <span className="font-medium text-gray-900">
                                                      {formatCurrency((sale as ExtendedSale).tax || 0)}
                                                    </span>
                                                  </div>
                                                )}

                                                <div className="border-t border-gray-200 pt-2">
                                                  <div className="flex justify-between text-sm font-semibold">
                                                    <span className="text-gray-900">Total:</span>
                                                    <span className="text-gray-900">
                                                      {formatCurrency(sale.total)}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-600">Amount Paid:</span>
                                                  <span className="font-medium text-green-600">
                                                    {formatCurrency(
                                                      safeNumber(sale.total) - safeNumber(sale.amountDue)
                                                    )}
                                                  </span>
                                                </div>

                                                {safeNumber(sale.amountDue) > 0 && (
                                                  <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Balance Due:</span>
                                                    <span className="text-red-600 font-medium">
                                                      {formatCurrency(sale.amountDue)}
                                                    </span>
                                                  </div>
                                                )}
                                              </motion.div>
                                            </div>

                                            {/* Customer & Credit Information */}
                                            <div>
                                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <Users className="w-4 h-4 mr-1.5" />
                                                Customer & Credit
                                              </h5>
                                              <motion.div
                                                className="bg-gray-50 rounded-lg p-3 space-y-2"
                                                initial={{ x: 10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{
                                                  delay: 0.4,
                                                  duration: 0.3,
                                                }}
                                              >
                                                <div className="text-sm">
                                                  <span className="text-gray-600">Customer:</span>
                                                  <div className="font-medium text-gray-900 mt-1">
                                                    {sale.customer?.name || "Walk-in Customer"}
                                                  </div>
                                                  {sale.customer?.phone && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      {sale.customer.phone}
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Credit Applied */}
                                                {safeNumber((sale as ExtendedSale).creditApplied || 0) > 0 && (
                                                  <div className="pt-2 border-t border-gray-200">
                                                    <div className="flex justify-between text-sm">
                                                      <span className="text-gray-600 flex items-center">
                                                        <CreditCard className="w-3 h-3 mr-1" />
                                                        Credit Applied:
                                                      </span>
                                                      <span className="text-green-600 font-medium">
                                                        -{formatCurrency((sale as ExtendedSale).creditApplied || 0)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Credit Earned */}
                                                {safeNumber((sale as ExtendedSale).creditEarned || 0) > 0 && (
                                                  <div className={`${safeNumber((sale as ExtendedSale).creditApplied || 0) > 0 ? '' : 'pt-2 border-t border-gray-200'}`}>
                                                    <div className="flex justify-between text-sm">
                                                      <span className="text-gray-600 flex items-center">
                                                        <TrendingUp className="w-3 h-3 mr-1" />
                                                        Credit Earned:
                                                      </span>
                                                      <span className="text-blue-600 font-medium">
                                                        +{formatCurrency((sale as ExtendedSale).creditEarned || 0)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Transaction Info */}
                                                <div className="pt-2 border-t border-gray-200 space-y-1">
                                                  <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Transaction ID:</span>
                                                    <span className="font-mono">{(sale as ExtendedSale).transactionId || sale.id}</span>
                                                  </div>
                                                  <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Date:</span>
                                                    <span>{new Date((sale as ExtendedSale).date || (sale as ExtendedSale).createdAt || new Date()).toLocaleString()}</span>
                                                  </div>
                                                  {(sale as ExtendedSale).notes && (
                                                    <div className="pt-1">
                                                      <span className="text-xs text-gray-500">Notes:</span>
                                                      <div className="text-xs text-gray-700 mt-1 italic">
                                                        &quot;{(sale as ExtendedSale).notes}&quot;
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </motion.div>
                                            </div>
                                          </div>
                                        </motion.div>
                                      </td>
                                    </motion.tr>
                                  )}
                                </AnimatePresence>
                              </React.Fragment>
                            ))}
                          </tbody>
                        </motion.table>
                      </motion.div>
                    )}

                    {/* Load More Button */}
                    {hasNextPage && (
                      <motion.div
                        className="flex justify-center mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <motion.button
                          onClick={loadMore}
                          disabled={isDataLoading}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isDataLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:scale-105"
                            }`}
                          whileHover={!isDataLoading ? { scale: 1.05 } : {}}
                          whileTap={!isDataLoading ? { scale: 0.95 } : {}}
                        >
                          {isDataLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                          <span>
                            {isDataLoading
                              ? "Loading..."
                              : "Load More Transactions"}
                          </span>
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Total transactions indicator */}
                    <motion.div
                      className="text-center mt-4 text-sm text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      Showing {salesData.length} transactions
                      {!hasNextPage && salesData.length > 0 && (
                        <span className="text-green-600 ml-2">
                          • All transactions loaded
                        </span>
                      )}
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* Customer Analysis Tab */}
            {activeTab === "customers" && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="grid lg:grid-cols-2 gap-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* Top Customers */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Customers (by Revenue)
                    </h3>
                    <motion.div
                      className="space-y-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {/* Group sales by customer and calculate top customers */}
                      {(() => {
                        const customerMap = new Map();

                        salesData.forEach((sale) => {
                          const customerKey = sale.customer?.id || "walk-in";
                          const customerName =
                            sale.customer?.name || "Walk-in Customer";

                          if (!customerMap.has(customerKey)) {
                            customerMap.set(customerKey, {
                              name: customerName,
                              revenue: 0,
                              transactions: 0,
                              type: sale.saleType.toLowerCase(),
                            });
                          }

                          const customer = customerMap.get(customerKey);
                          customer.revenue += sale.total;
                          customer.transactions += 1;
                        });

                        return Array.from(customerMap.values())
                          .sort((a, b) => b.revenue - a.revenue)
                          .slice(0, 5)
                          .map((customer, index) => (
                            <motion.div
                              key={customer.name}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                delay: 0.5 + index * 0.1,
                                duration: 0.4,
                              }}
                              whileHover={{ scale: 1.02, x: 5 }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-orange-700">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {customer.name}
                                  </div>
                                  <div className="text-sm text-gray-600 capitalize">
                                    {customer.type} customer
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(customer.revenue)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {customer.transactions} transactions
                                </div>
                              </div>
                            </motion.div>
                          ));
                      })()}
                    </motion.div>
                  </motion.div>

                  {/* Customer Debt Analysis */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Outstanding Debts
                    </h3>
                    <motion.div
                      className="space-y-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {salesData
                        .filter((sale) => sale.amountDue > 0)
                        .sort((a, b) => b.amountDue - a.amountDue)
                        .map((sale, index) => (
                          <motion.div
                            key={sale.id}
                            className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              duration: 0.4,
                            }}
                            whileHover={{ scale: 1.02, x: -5 }}
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {sale.customer?.name || "Walk-in Customer"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Transaction: {sale.transactionId}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(sale.createdAt).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(sale.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-red-600">
                                {formatCurrency(sale.amountDue)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Paid:
                                {formatCurrency(
                                  safeNumber(sale.total) -
                                  safeNumber(sale.amountDue)
                                )}{" "}
                                / {formatCurrency(sale.total)}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                      {salesData.filter((sale) => sale.amountDue > 0).length ===
                        0 && (
                          <motion.div
                            className="text-center py-8 text-gray-500"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                            <p>No outstanding debts!</p>
                            <p className="text-sm">
                              All customers are up to date with payments
                            </p>
                          </motion.div>
                        )}
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Customer Performance Metrics */}
                <motion.div
                  className="mt-8"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <motion.h3
                    className="text-lg font-semibold text-gray-900 mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    Customer Performance Metrics
                  </motion.h3>
                  <motion.div
                    className="grid md:grid-cols-3 gap-6"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <motion.div
                      className="bg-blue-50 rounded-lg p-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="text-lg font-bold text-blue-900">
                            {
                              Array.from(
                                new Set(
                                  salesData.map(
                                    (sale) => sale.customer?.id || "walk-in"
                                  )
                                )
                              ).length
                            }
                          </div>
                          <div className="text-sm text-blue-700">
                            Total Customers
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-green-50 rounded-lg p-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.0, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="w-6 h-6 text-green-600" />
                        <div>
                          <div className="text-lg font-bold text-green-900">
                            {
                              Array.from(
                                new Set(
                                  salesData
                                    .filter(
                                      (sale) => sale.saleType === "WHOLESALE"
                                    )
                                    .map(
                                      (sale) => sale.customer?.id || "walk-in"
                                    )
                                )
                              ).length
                            }
                          </div>
                          <div className="text-sm text-green-700">
                            Wholesale Customers
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-yellow-50 rounded-lg p-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Droplets className="w-6 h-6 text-yellow-600" />
                        <div>
                          <div className="text-lg font-bold text-yellow-900">
                            {
                              Array.from(
                                new Set(
                                  salesData
                                    .filter(
                                      (sale) => sale.saleType === "RETAIL"
                                    )
                                    .map(
                                      (sale) => sale.customer?.id || "walk-in"
                                    )
                                )
                              ).length
                            }
                          </div>
                          <div className="text-sm text-yellow-700">
                            Retail Customers
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="mt-8 grid md:grid-cols-3 gap-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900 mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.4 }}
              >
                Quick Actions
              </motion.h3>
              <motion.div
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.4 }}
              >
                <motion.button
                  onClick={() => handleExport("excel")}
                  className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-700">
                      Export to Excel
                    </span>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      Generate PDF Report
                    </span>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      Export as CSV
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900 mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.4 }}
              >
                Key Insights
              </motion.h3>
              <motion.div
                className="space-y-3 text-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                <motion.div
                  className="p-3 bg-green-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-green-800">
                    Best Performing Day
                  </div>
                  <div className="text-green-600">
                    June 1st with ₦34,500 in sales
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-blue-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-blue-800">Top Product</div>
                  <div className="text-blue-600">
                    Wholesale Drums (6 units sold)
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-orange-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-orange-800">
                    Payment Preference
                  </div>
                  <div className="text-orange-600">
                    60% customers prefer cash payments
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900 mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                Recommendations
              </motion.h3>
              <motion.div
                className="space-y-3 text-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.4 }}
              >
                <motion.div
                  className="p-3 bg-yellow-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-yellow-800">
                    Follow Up Required
                  </div>
                  <div className="text-yellow-600">
                    3 customers have overdue payments
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-purple-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-purple-800">
                    Inventory Alert
                  </div>
                  <div className="text-purple-600">
                    Retail stock running low this week
                  </div>
                </motion.div>
                <motion.div
                  className="p-3 bg-indigo-50 rounded-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="font-medium text-indigo-800">
                    Growth Opportunity
                  </div>
                  <div className="text-indigo-600">
                    Wholesale sales up 15% this month
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default SalesReportPage;
