/**
 * Export utilities for reports data
 * Supports CSV, Excel, and PDF export formats
 */

import { Sale } from '@/services/salesService';
import { formatCurrency, formatNumber } from './formatters';

export interface ExportData {
  sales: Sale[];
  summary: {
    totalSales: number;
    totalTransactions: number;
    totalOutstanding: number;
    averageTransaction: number;
    totalDiscounts: number;
    wholesaleRevenue: number;
    retailRevenue: number;
  };
  filters: {
    dateRange?: string;
    customerType?: string;
    paymentMethod?: string;
    status?: string;
    searchTerm?: string;
    amountMin?: number;
    amountMax?: number;
    sortBy?: string;
    sortDirection?: string;
  };
}

export class ReportsExporter {
  /**
   * Export data to CSV format
   */
  static exportToCSV(data: ExportData): void {
    const { sales, summary, filters } = data;
    const csvData: string[] = [];

    // Add header with export info
    csvData.push('SALES REPORT EXPORT');
    csvData.push(`Export Date: ${new Date().toLocaleString()}`);
    csvData.push('');

    // Add filter information
    csvData.push('APPLIED FILTERS');
    if (filters.dateRange) csvData.push(`Date Range: ${filters.dateRange}`);
    if (filters.customerType && filters.customerType !== 'all') csvData.push(`Customer Type: ${filters.customerType}`);
    if (filters.paymentMethod && filters.paymentMethod !== 'all') csvData.push(`Payment Method: ${filters.paymentMethod}`);
    if (filters.status && filters.status !== 'all') csvData.push(`Status: ${filters.status}`);
    if (filters.searchTerm) csvData.push(`Search: ${filters.searchTerm}`);
    if (filters.amountMin) csvData.push(`Min Amount: ${formatCurrency(filters.amountMin)}`);
    if (filters.amountMax) csvData.push(`Max Amount: ${formatCurrency(filters.amountMax)}`);
    if (filters.sortBy) csvData.push(`Sort By: ${filters.sortBy} (${filters.sortDirection})`);
    csvData.push('');

    // Add summary statistics
    csvData.push('SUMMARY STATISTICS');
    csvData.push(`Total Sales: ${formatCurrency(summary.totalSales)}`);
    csvData.push(`Total Transactions: ${formatNumber(summary.totalTransactions)}`);
    csvData.push(`Outstanding Amount: ${formatCurrency(summary.totalOutstanding)}`);
    csvData.push(`Average Transaction: ${formatCurrency(summary.averageTransaction)}`);
    csvData.push(`Total Discounts: ${formatCurrency(summary.totalDiscounts)}`);
    csvData.push(`Wholesale Revenue: ${formatCurrency(summary.wholesaleRevenue)}`);
    csvData.push(`Retail Revenue: ${formatCurrency(summary.retailRevenue)}`);
    csvData.push('');

    // Add transaction data headers
    csvData.push('TRANSACTION DATA');
    csvData.push('Transaction ID,Date,Customer,Sale Type,Payment Method,Subtotal,Discount,Total,Amount Paid,Amount Due,Status');

    // Add transaction data
    sales.forEach(sale => {
      // Get primary payment method (first payment method used)
      const primaryPaymentMethod = sale.payments?.length > 0 ? sale.payments[0].method : 'N/A';
      
      const row = [
        sale.transactionId,
        new Date(sale.createdAt).toLocaleDateString(),
        sale.customer?.name || 'N/A',
        sale.saleType,
        primaryPaymentMethod,
        sale.subtotal.toString(),
        (sale.discount || 0).toString(),
        sale.total.toString(),
        (sale.total - sale.amountDue).toString(),
        sale.amountDue.toString(),
        sale.amountDue === 0 ? 'Paid' : sale.amountDue < sale.total ? 'Partial' : 'Pending'
      ];
      csvData.push(row.join(','));
    });

    // Create and download CSV file
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Export data to Excel format (HTML table that opens in Excel)
   */
  static exportToExcel(data: ExportData): void {
    const { sales, summary, filters } = data;
    
    const excelContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; background: #f0f0f0; padding: 5px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .number { text-align: right; }
            .currency { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">Sales Report - ${new Date().toLocaleDateString()}</div>
          
          <div class="section">
            <div class="section-title">Applied Filters</div>
            <table>
              ${filters.dateRange ? `<tr><td>Date Range</td><td>${filters.dateRange}</td></tr>` : ''}
              ${filters.customerType && filters.customerType !== 'all' ? `<tr><td>Customer Type</td><td>${filters.customerType}</td></tr>` : ''}
              ${filters.paymentMethod && filters.paymentMethod !== 'all' ? `<tr><td>Payment Method</td><td>${filters.paymentMethod}</td></tr>` : ''}
              ${filters.status && filters.status !== 'all' ? `<tr><td>Status</td><td>${filters.status}</td></tr>` : ''}
              ${filters.searchTerm ? `<tr><td>Search Term</td><td>${filters.searchTerm}</td></tr>` : ''}
              ${filters.amountMin ? `<tr><td>Min Amount</td><td class="currency">${formatCurrency(filters.amountMin)}</td></tr>` : ''}
              ${filters.amountMax ? `<tr><td>Max Amount</td><td class="currency">${formatCurrency(filters.amountMax)}</td></tr>` : ''}
              ${filters.sortBy ? `<tr><td>Sort By</td><td>${filters.sortBy} (${filters.sortDirection})</td></tr>` : ''}
            </table>
          </div>

          <div class="section">
            <div class="section-title">Summary Statistics</div>
            <table>
              <tr><td>Total Sales</td><td class="currency">${formatCurrency(summary.totalSales)}</td></tr>
              <tr><td>Total Transactions</td><td class="number">${formatNumber(summary.totalTransactions)}</td></tr>
              <tr><td>Outstanding Amount</td><td class="currency">${formatCurrency(summary.totalOutstanding)}</td></tr>
              <tr><td>Average Transaction</td><td class="currency">${formatCurrency(summary.averageTransaction)}</td></tr>
              <tr><td>Total Discounts</td><td class="currency">${formatCurrency(summary.totalDiscounts)}</td></tr>
              <tr><td>Wholesale Revenue</td><td class="currency">${formatCurrency(summary.wholesaleRevenue)}</td></tr>
              <tr><td>Retail Revenue</td><td class="currency">${formatCurrency(summary.retailRevenue)}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Transaction Data</div>
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Sale Type</th>
                  <th>Payment Method</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Amount Paid</th>
                  <th>Amount Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${sales.map(sale => {
                  const primaryPaymentMethod = sale.payments?.length > 0 ? sale.payments[0].method : 'N/A';
                  return `
                  <tr>
                    <td>${sale.transactionId}</td>
                    <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td>${sale.customer?.name || 'N/A'}</td>
                    <td>${sale.saleType}</td>
                    <td>${primaryPaymentMethod}</td>
                    <td class="currency">${formatCurrency(sale.subtotal)}</td>
                    <td class="currency">${formatCurrency(sale.discount || 0)}</td>
                    <td class="currency">${formatCurrency(sale.total)}</td>
                    <td class="currency">${formatCurrency(sale.total - sale.amountDue)}</td>
                    <td class="currency">${formatCurrency(sale.amountDue)}</td>
                    <td>${sale.amountDue === 0 ? 'Paid' : sale.amountDue < sale.total ? 'Partial' : 'Pending'}</td>
                  </tr>
                `;}).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Export data to PDF format (HTML that can be printed as PDF)
   */
  static exportToPDF(data: ExportData): void {
    const { sales, summary, filters } = data;
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sales Report PDF</title>
          <style>
            @page { 
              size: A4; 
              margin: 1cm; 
            }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.4;
              margin: 0;
              padding: 0;
            }
            .header { 
              text-align: center; 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .company-info {
              text-align: center;
              margin-bottom: 20px;
              color: #666;
            }
            .section { 
              margin-bottom: 25px; 
              page-break-inside: avoid;
            }
            .section-title { 
              font-size: 14px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              background: #f0f0f0; 
              padding: 8px; 
              border-left: 4px solid #007bff;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-bottom: 15px;
              font-size: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold; 
              font-size: 9px;
            }
            .number { text-align: right; }
            .currency { text-align: right; }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 20px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 8px;
              border: 1px solid #ddd;
              background: #f9f9f9;
            }
            .footer {
              position: fixed;
              bottom: 1cm;
              left: 1cm;
              right: 1cm;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              .no-print { display: none !important; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">Sales Report</div>
          <div class="company-info">
            Success Enterprise - Groundnut Oil Distribution<br>
            Generated on ${new Date().toLocaleString()}
          </div>
          
          <div class="section">
            <div class="section-title">Report Filters Applied</div>
            <table>
              ${filters.dateRange ? `<tr><td>Date Range</td><td>${filters.dateRange}</td></tr>` : ''}
              ${filters.customerType && filters.customerType !== 'all' ? `<tr><td>Customer Type</td><td>${filters.customerType}</td></tr>` : ''}
              ${filters.paymentMethod && filters.paymentMethod !== 'all' ? `<tr><td>Payment Method</td><td>${filters.paymentMethod}</td></tr>` : ''}
              ${filters.status && filters.status !== 'all' ? `<tr><td>Status</td><td>${filters.status}</td></tr>` : ''}
              ${filters.searchTerm ? `<tr><td>Search Term</td><td>${filters.searchTerm}</td></tr>` : ''}
              ${filters.amountMin ? `<tr><td>Min Amount</td><td class="currency">${formatCurrency(filters.amountMin)}</td></tr>` : ''}
              ${filters.amountMax ? `<tr><td>Max Amount</td><td class="currency">${formatCurrency(filters.amountMax)}</td></tr>` : ''}
              ${filters.sortBy ? `<tr><td>Sort By</td><td>${filters.sortBy} (${filters.sortDirection})</td></tr>` : ''}
            </table>
          </div>

          <div class="section">
            <div class="section-title">Summary Statistics</div>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Total Sales:</span>
                <strong>${formatCurrency(summary.totalSales)}</strong>
              </div>
              <div class="summary-item">
                <span>Total Transactions:</span>
                <strong>${formatNumber(summary.totalTransactions)}</strong>
              </div>
              <div class="summary-item">
                <span>Outstanding Amount:</span>
                <strong>${formatCurrency(summary.totalOutstanding)}</strong>
              </div>
              <div class="summary-item">
                <span>Average Transaction:</span>
                <strong>${formatCurrency(summary.averageTransaction)}</strong>
              </div>
              <div class="summary-item">
                <span>Total Discounts:</span>
                <strong>${formatCurrency(summary.totalDiscounts)}</strong>
              </div>
              <div class="summary-item">
                <span>Wholesale Revenue:</span>
                <strong>${formatCurrency(summary.wholesaleRevenue)}</strong>
              </div>
              <div class="summary-item">
                <span>Retail Revenue:</span>
                <strong>${formatCurrency(summary.retailRevenue)}</strong>
              </div>
            </div>
          </div>

          <div class="section page-break">
            <div class="section-title">Transaction Details (${sales.length} transactions)</div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${sales.map(sale => {
                  const primaryPaymentMethod = sale.payments?.length > 0 ? sale.payments[0].method : 'N/A';
                  return `
                  <tr>
                    <td>${sale.transactionId}</td>
                    <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td>${sale.customer?.name || 'N/A'}</td>
                    <td>${sale.saleType}</td>
                    <td>${primaryPaymentMethod}</td>
                    <td class="currency">${formatCurrency(sale.subtotal)}</td>
                    <td class="currency">${formatCurrency(sale.discount || 0)}</td>
                    <td class="currency">${formatCurrency(sale.total)}</td>
                    <td class="currency">${formatCurrency(sale.amountDue)}</td>
                    <td>${sale.amountDue === 0 ? 'Paid' : sale.amountDue < sale.total ? 'Partial' : 'Pending'}</td>
                  </tr>
                `;}).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div>Success Enterprise - Sales Report | Page 1 of 1</div>
            <div>This report was generated automatically and contains ${sales.length} transactions</div>
          </div>
        </body>
      </html>
    `;

    // Open in new window for printing as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Auto-print when loaded
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      // Fallback: download as HTML
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Get export data formatted for the exporters
   */
  static prepareExportData(
    sales: Sale[],
    summary: {
      totalSales: number;
      totalPaid: number;
      totalOutstanding: number;
      totalTransactions: number;
      totalDiscounts: number;
      wholesaleRevenue: number;
      retailRevenue: number;
      averageTransaction: number;
    },
    filters: {
      dateRange?: string;
      customerType?: string;
      paymentMethod?: string;
      status?: string;
      searchTerm?: string;
      amountMin?: number;
      amountMax?: number;
      sortBy?: string;
      sortDirection?: string;
    }
  ): ExportData {
    return {
      sales,
      summary,
      filters: {
        dateRange: filters.dateRange,
        customerType: filters.customerType,
        paymentMethod: filters.paymentMethod,
        status: filters.status,
        searchTerm: filters.searchTerm,
        amountMin: filters.amountMin,
        amountMax: filters.amountMax,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      }
    };
  }
}
