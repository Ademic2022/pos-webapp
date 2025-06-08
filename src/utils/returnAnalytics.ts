// Return Analytics Engine for comprehensive return analysis and reporting

interface ReturnAnalyticsData {
  id: string;
  originalTransactionId: string;
  customerId: number;
  customerName: string;
  originalDate: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "processed";
  reason: string;
  returnItems: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalRefundAmount: number;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

interface SalesData {
  id: string;
  customerId: number;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface CustomerAnalysis {
  customerId: number;
  customerName: string;
  returnCount: number;
  totalRefundAmount: number;
  riskScore: number;
}

interface CustomerAnalysisResult {
  topReturningCustomers: CustomerAnalysis[];
  riskMetrics: {
    highRiskCustomers: number;
    avgReturnsPerCustomer: number;
    customerRetentionImpact: number;
  };
}

interface AnalyticsSummary {
  totalReturns: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
  returnRate: number;
  pendingReturns: number;
  processedReturns: number;
}

interface AnalyticsResult {
  summary: {
    totalReturns: number;
    totalRefundAmount: number;
    averageRefundAmount: number;
    returnRate: number;
    pendingReturns: number;
    processedReturns: number;
  };
  trends: {
    returnsByMonth: Array<{ month: string; count: number; amount: number }>;
    returnsByReason: Array<{ reason: string; count: number; percentage: number }>;
    returnsByCustomerType: Array<{ type: string; count: number; amount: number }>;
  };
  customerAnalysis: {
    topReturningCustomers: Array<{
      customerId: number;
      customerName: string;
      returnCount: number;
      totalRefundAmount: number;
      riskScore: number;
    }>;
    riskMetrics: {
      highRiskCustomers: number;
      avgReturnsPerCustomer: number;
      customerRetentionImpact: number;
    };
  };
  financialImpact: {
    monthlyLoss: number;
    yearlyProjection: number;
    refundMethodBreakdown: Array<{ method: string; amount: number; percentage: number }>;
  };
  recommendations: Array<{
    type: "process" | "policy" | "customer" | "product";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    expectedImpact: string;
  }>;
}

export class ReturnAnalyticsEngine {
  static generateAnalytics(
    returns: ReturnAnalyticsData[],
    sales: SalesData[],
    dateRange: { start: Date; end: Date }
  ): AnalyticsResult {
    // Filter data by date range
    const filteredReturns = returns.filter(r => {
      const returnDate = new Date(r.requestDate);
      return returnDate >= dateRange.start && returnDate <= dateRange.end;
    });

    const filteredSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= dateRange.start && saleDate <= dateRange.end;
    });

    // Calculate summary metrics
    const summary = this.calculateSummary(filteredReturns, filteredSales);

    // Calculate trends
    const trends = this.calculateTrends(filteredReturns);

    // Analyze customers
    const customerAnalysis = this.analyzeCustomers(filteredReturns, filteredSales);

    // Calculate financial impact
    const financialImpact = this.calculateFinancialImpact(filteredReturns);

    // Generate recommendations
    const recommendations = this.generateRecommendations(filteredReturns, summary, customerAnalysis);

    return {
      summary,
      trends,
      customerAnalysis,
      financialImpact,
      recommendations,
    };
  }

  private static calculateSummary(returns: ReturnAnalyticsData[], sales: SalesData[]) {
    const totalReturns = returns.length;
    const totalRefundAmount = returns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
    const averageRefundAmount = totalReturns > 0 ? totalRefundAmount / totalReturns : 0;
    const totalSalesAmount = sales.reduce((sum, s) => sum + s.total, 0);
    const returnRate = totalSalesAmount > 0 ? (totalRefundAmount / totalSalesAmount) * 100 : 0;
    const pendingReturns = returns.filter(r => r.status === "pending").length;
    const processedReturns = returns.filter(r => r.status === "processed").length;

    return {
      totalReturns,
      totalRefundAmount,
      averageRefundAmount,
      returnRate,
      pendingReturns,
      processedReturns,
    };
  }

  private static calculateTrends(returns: ReturnAnalyticsData[]) {
    // Returns by month
    const returnsByMonth = this.groupByMonth(returns);

    // Returns by reason
    const reasonCounts = returns.reduce((acc, r) => {
      acc[r.reason] = (acc[r.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const returnsByReason = Object.entries(reasonCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: (count / returns.length) * 100,
    }));

    // Returns by customer type (mock data - would need customer type info)
    const returnsByCustomerType = [
      { type: "wholesale", count: Math.floor(returns.length * 0.7), amount: Math.floor(returns.reduce((sum, r) => sum + r.totalRefundAmount, 0) * 0.8) },
      { type: "retail", count: Math.floor(returns.length * 0.3), amount: Math.floor(returns.reduce((sum, r) => sum + r.totalRefundAmount, 0) * 0.2) },
    ];

    return {
      returnsByMonth,
      returnsByReason,
      returnsByCustomerType,
    };
  }

  private static groupByMonth(returns: ReturnAnalyticsData[]) {
    const monthlyData = returns.reduce((acc, r) => {
      const month = new Date(r.requestDate).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, amount: 0 };
      }
      acc[month].count++;
      acc[month].amount += r.totalRefundAmount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      amount: data.amount,
    }));
  }

  private static analyzeCustomers(returns: ReturnAnalyticsData[], sales: SalesData[]) {
    // Group returns by customer
    const customerReturns = returns.reduce((acc, r) => {
      if (!acc[r.customerId]) {
        acc[r.customerId] = {
          customerId: r.customerId,
          customerName: r.customerName,
          returns: [],
        };
      }
      acc[r.customerId].returns.push(r);
      return acc;
    }, {} as Record<number, { customerId: number; customerName: string; returns: ReturnAnalyticsData[] }>);

    // Calculate customer metrics
    const topReturningCustomers = Object.values(customerReturns).map(customer => {
      const returnCount = customer.returns.length;
      const totalRefundAmount = customer.returns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
      const customerSales = sales.filter(s => s.customerId === customer.customerId);
      const totalSalesAmount = customerSales.reduce((sum, s) => sum + s.total, 0);
      const riskScore = this.calculateCustomerRiskScore(returnCount, totalRefundAmount, totalSalesAmount);

      return {
        customerId: customer.customerId,
        customerName: customer.customerName,
        returnCount,
        totalRefundAmount,
        riskScore,
      };
    }).sort((a, b) => b.returnCount - a.returnCount);

    const highRiskCustomers = topReturningCustomers.filter(c => c.riskScore > 70).length;
    const avgReturnsPerCustomer = returns.length / Object.keys(customerReturns).length;
    const customerRetentionImpact = this.calculateRetentionImpact(topReturningCustomers);

    return {
      topReturningCustomers: topReturningCustomers.slice(0, 10),
      riskMetrics: {
        highRiskCustomers,
        avgReturnsPerCustomer,
        customerRetentionImpact,
      },
    };
  }

  private static calculateCustomerRiskScore(returnCount: number, refundAmount: number, salesAmount: number): number {
    const returnFrequencyScore = Math.min(returnCount * 20, 50);
    const refundRatioScore = salesAmount > 0 ? Math.min((refundAmount / salesAmount) * 100, 50) : 0;
    return Math.round(returnFrequencyScore + refundRatioScore);
  }

  private static calculateRetentionImpact(customers: CustomerAnalysis[]): number {
    // Simplified calculation - percentage of customers with high return rates
    const highReturnCustomers = customers.filter(c => c.riskScore > 60).length;
    return customers.length > 0 ? (highReturnCustomers / customers.length) * 100 : 0;
  }

  private static calculateFinancialImpact(returns: ReturnAnalyticsData[]) {
    const totalRefundAmount = returns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
    const monthlyLoss = totalRefundAmount;
    const yearlyProjection = monthlyLoss * 12;

    // Mock refund method breakdown
    const refundMethodBreakdown = [
      { method: "cash", amount: totalRefundAmount * 0.6, percentage: 60 },
      { method: "store_credit", amount: totalRefundAmount * 0.3, percentage: 30 },
      { method: "exchange", amount: totalRefundAmount * 0.1, percentage: 10 },
    ];

    return {
      monthlyLoss,
      yearlyProjection,
      refundMethodBreakdown,
    };
  }

  private static generateRecommendations(
    returns: ReturnAnalyticsData[],
    summary: AnalyticsSummary,
    customerAnalysis: CustomerAnalysisResult
  ) {
    const recommendations = [];

    // High return rate recommendation
    if (summary.returnRate > 5) {
      recommendations.push({
        type: "policy" as const,
        priority: "high" as const,
        title: "Review Return Policy",
        description: "Return rate exceeds 5%. Consider tightening return eligibility criteria.",
        expectedImpact: "15-25% reduction in return rate",
      });
    }

    // Quality issue recommendation
    const qualityReturns = returns.filter(r => 
      r.reason.toLowerCase().includes("quality") || 
      r.reason.toLowerCase().includes("defect") ||
      r.reason.toLowerCase().includes("damaged")
    );
    if (qualityReturns.length > returns.length * 0.3) {
      recommendations.push({
        type: "product" as const,
        priority: "high" as const,
        title: "Quality Control Enhancement",
        description: "30%+ of returns are quality-related. Implement stricter quality checks.",
        expectedImpact: "40-60% reduction in quality-related returns",
      });
    }

    // High-risk customer recommendation
    if (customerAnalysis.riskMetrics.highRiskCustomers > 5) {
      recommendations.push({
        type: "customer" as const,
        priority: "medium" as const,
        title: "Customer Relationship Management",
        description: "Multiple high-risk customers identified. Implement customer success program.",
        expectedImpact: "20-30% improvement in customer retention",
      });
    }

    // Process efficiency recommendation
    const pendingReturns = returns.filter(r => r.status === "pending");
    if (pendingReturns.length > 5) {
      recommendations.push({
        type: "process" as const,
        priority: "medium" as const,
        title: "Process Automation",
        description: "Multiple pending returns detected. Consider automating approval process.",
        expectedImpact: "50-70% reduction in processing time",
      });
    }

    return recommendations;
  }

  static exportAnalyticsToCSV(analytics: AnalyticsResult): string {
    const csvData = [];
    
    // Summary section
    csvData.push("RETURN ANALYTICS SUMMARY");
    csvData.push(`Total Returns,${analytics.summary.totalReturns}`);
    csvData.push(`Total Refund Amount,₦${analytics.summary.totalRefundAmount.toLocaleString()}`);
    csvData.push(`Average Refund Amount,₦${analytics.summary.averageRefundAmount.toLocaleString()}`);
    csvData.push(`Return Rate,${analytics.summary.returnRate.toFixed(2)}%`);
    csvData.push("");

    // Customer analysis
    csvData.push("TOP RETURNING CUSTOMERS");
    csvData.push("Customer Name,Return Count,Total Refund Amount,Risk Score");
    analytics.customerAnalysis.topReturningCustomers.forEach(customer => {
      csvData.push(`${customer.customerName},${customer.returnCount},₦${customer.totalRefundAmount.toLocaleString()},${customer.riskScore}`);
    });
    csvData.push("");

    // Recommendations
    csvData.push("RECOMMENDATIONS");
    csvData.push("Priority,Type,Title,Description,Expected Impact");
    analytics.recommendations.forEach(rec => {
      csvData.push(`${rec.priority},${rec.type},${rec.title},"${rec.description}",${rec.expectedImpact}`);
    });

    return csvData.join("\n");
  }
}