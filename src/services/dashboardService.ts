/**
 * Dashboard Service
 * 
 * Aggregates data from multiple sources to provide comprehensive dashboard statistics.
 * Falls back to individual service calls if unified dashboard query is not available.
 */

import { inventoryService } from './inventoryService';
import { salesService } from './salesService';
import { customerService } from './customerService';
import { DashboardStats } from '@/types/types';
import { DeliveryHistory } from '@/interfaces/interface';

export interface DashboardServiceResponse {
  success: boolean;
  data?: DashboardStats;
  errors?: string[];
}

export interface QuickMetricsResponse {
  salesStats: {
    totalSales: number;
    totalTransactions: number;
    retailSales: number;
    wholesaleSales: number;
    cashSales: number;
    creditSales: number;
  };
  customerStats: {
    totalCustomers: number;
    debt: {
      value: number;
      count: number;
    };
  };
  latestStockDeliveries: Array<{
    id: string;
    deliveredQuantity: number;
    cumulativeStock: number;
    remainingStock: number;
    soldStock: number;
    price: number;
    stockUtilizationPercentage: number;
    createdAt: string;
    supplier: string;
  }>;
}

class DashboardService {
  /**
   * Get comprehensive dashboard statistics from all services
   */
  async getDashboardStats(dateFrom?: string, dateTo?: string): Promise<DashboardServiceResponse> {
    try {
      // Fetch data from all services in parallel
      const [
        salesStatsResponse,
        customerStatsResponse,
        inventoryResponse,
        recentSalesResponse,
      ] = await Promise.all([
        salesService.getSalesStats(dateFrom, dateTo),
        customerService.getCustomerStats(),
        inventoryService.getProductInventory(),
        salesService.getRecentSales(100), // Get more sales for better transaction analysis
      ]);

      // Check for any service failures
      if (!salesStatsResponse.success) {
        return {
          success: false,
          errors: ['Failed to fetch sales statistics', ...(salesStatsResponse.errors || [])],
        };
      }

      if (!customerStatsResponse.success) {
        return {
          success: false,
          errors: ['Failed to fetch customer statistics', ...(customerStatsResponse.errors || [])],
        };
      }

      if (!inventoryResponse.success) {
        return {
          success: false,
          errors: ['Failed to fetch inventory data', ...(inventoryResponse.errors || [])],
        };
      }

      // Extract data from responses
      const salesStats = salesStatsResponse.stats!;
      const customerStats = customerStatsResponse.stats!;
      const { products, latestStockDelivery } = inventoryResponse;
      const recentSales = recentSalesResponse.sales || [];

      // Calculate transaction breakdown from recent sales
      const transactionBreakdown = this.calculateTransactionBreakdown(recentSales);

      // Calculate stock metrics
      const stockMetrics = this.calculateStockMetrics(products);

      // Calculate returns data (mock for now - would need returns service)
      const returnsData = this.calculateReturnsData();

      // Aggregate all data
      const dashboardStats: DashboardStats = {
        totalSales: salesStats.totalSales,
        transaction: {
          totalTransactionCount: salesStats.totalTransactions,
          wholeSales: transactionBreakdown.wholesale,
          retails: transactionBreakdown.retail,
        },
        debt: {
          debtValue: customerStats.debt.value,
          customerCount: customerStats.debt.count,
        },
        returns: returnsData,
        stockData: this.transformToDeliveryHistory(latestStockDelivery),
        totalLitres: stockMetrics.totalStock,
        totalCustomers: customerStats.totalCustomers,
        totalDeliveries: stockMetrics.totalDeliveries,
      };

      return {
        success: true,
        data: dashboardStats,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to fetch dashboard statistics'],
      };
    }
  }

  /**
   * Calculate transaction breakdown by type from recent sales
   */
  private calculateTransactionBreakdown(sales: Array<{ saleType: string }>) {
    const wholesale = sales.filter(sale => sale.saleType === 'WHOLESALE').length;
    const retail = sales.filter(sale => sale.saleType === 'RETAIL').length;

    return { wholesale, retail };
  }

  /**
   * Calculate stock metrics from inventory data
   */
  private calculateStockMetrics(products: Array<{ stock: number }>) {
    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    
    // Mock delivery count - would need delivery history service
    const totalDeliveries = 67; // This should come from delivery history

    return {
      totalStock,
      totalDeliveries,
    };
  }

  /**
   * Calculate returns data (mock implementation)
   * This would be replaced with actual returns service when available
   */
  private calculateReturnsData() {
    return {
      totalReturns: 15,
      totalRefundValue: 82500,
      pendingReturns: 5,
      processedReturns: 10,
    };
  }

  /**
   * Transform stock delivery data to match DeliveryHistory interface
   */
  private transformToDeliveryHistory(stockDelivery: {
    id?: string;
    deliveredQuantity?: number;
    supplier?: string;
    createdAt?: string;
    remainingStock?: number;
    cumulativeStock?: number;
    soldStock?: number;
  } | null): DeliveryHistory {
    if (!stockDelivery) {
      return {
        id: 0,
        amount: 0,
        supplier: 'No recent delivery',
        createdAt: new Date(),
        availableStock: 0,
        totalAvailableStock: 0,
        soldStock: 0,
      };
    }

    return {
      id: stockDelivery.id ? parseInt(stockDelivery.id) : 0,
      amount: stockDelivery.deliveredQuantity || 0,
      supplier: stockDelivery.supplier || 'Unknown Supplier',
      createdAt: stockDelivery.createdAt ? new Date(stockDelivery.createdAt) : new Date(),
      availableStock: stockDelivery.remainingStock || 0,
      totalAvailableStock: stockDelivery.cumulativeStock || 0,
      soldStock: stockDelivery.soldStock || 0,
    };
  }

  /**
   * Get real-time stock status for dashboard alerts
   */
  async getStockStatus(): Promise<{
    success: boolean;
    status?: 'low' | 'medium' | 'high';
    totalStock?: number;
    errors?: string[];
  }> {
    try {
      const inventoryResponse = await inventoryService.getProductInventory();
      
      if (!inventoryResponse.success) {
        return {
          success: false,
          errors: inventoryResponse.errors,
        };
      }

      const totalStock = inventoryResponse.products.reduce(
        (sum, product) => sum + (product.stock || 0), 
        0
      );

      // Determine status based on stock levels
      let status: 'low' | 'medium' | 'high';
      if (totalStock < 1500) {
        status = 'low';
      } else if (totalStock < 5000) {
        status = 'medium';
      } else {
        status = 'high';
      }

      return {
        success: true,
        status,
        totalStock,
      };
    } catch (error) {
      console.error('Error getting stock status:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to get stock status'],
      };
    }
  }

  /**
   * Get recent sales for dashboard display
   */
  async getRecentSalesForDashboard(limit = 5) {
    return await salesService.getRecentSales(limit);
  }

  /**
   * Get customer credit summary for dashboard
   */
  async getCustomerCreditSummary() {
    const customerStatsResponse = await customerService.getCustomerStats();
    
    if (!customerStatsResponse.success) {
      return {
        success: false,
        errors: customerStatsResponse.errors,
      };
    }

    const stats = customerStatsResponse.stats!;
    
    return {
      success: true,
      data: {
        totalCustomers: stats.totalCustomers,
        totalOutstandingBalance: stats.debt.value,
        totalCreditIssued: stats.totalCreditIssued,
        retailCustomers: stats.retailCustomers,
        wholesaleCustomers: stats.wholesaleCustomers,
        activeCustomers: stats.activeCustomers,
      },
    };
  }
}

export const dashboardService = new DashboardService();
