// Return Receipt Generator Utility
import { ReturnReceiptData } from "@/interfaces/interface";

export class ReturnReceiptGenerator {
  private static formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString()}`;
  }

  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static generateReceiptHTML(data: ReturnReceiptData): string {
    const itemsHTML = data.returnItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatCurrency(item.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatCurrency(item.total)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Return Receipt - ${data.returnId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .receipt { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 28px; font-weight: bold; color: #dc2626; margin-bottom: 5px; }
          .receipt-title { font-size: 20px; color: #666; margin-top: 10px; }
          .info-section { margin-bottom: 25px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f8f9fa; padding: 12px 8px; text-align: left; border-bottom: 2px solid #dc2626; font-weight: bold; }
          .summary { background: #fef2f2; padding: 20px; border-radius: 6px; margin-top: 25px; border-left: 4px solid #dc2626; }
          .total-row { font-size: 18px; font-weight: bold; color: #dc2626; margin-top: 10px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
          .refund-info { background: #ecfdf5; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #10b981; }
          @media print { body { background: white; } .receipt { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">Success Enterprise</div>
            <div style="color: #f59e0b; font-size: 14px;">Groundnut Oil Distribution</div>
            <div class="receipt-title">RETURN RECEIPT</div>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="label">Return ID:</span>
              <span class="value">${data.returnId}</span>
            </div>
            <div class="info-row">
              <span class="label">Original Transaction:</span>
              <span class="value">${data.originalTransactionId}</span>
            </div>
            <div class="info-row">
              <span class="label">Customer:</span>
              <span class="value">${data.customerName}</span>
            </div>
            <div class="info-row">
              <span class="label">Return Date:</span>
              <span class="value">${this.formatDate(data.returnDate)}</span>
            </div>
            <div class="info-row">
              <span class="label">Processed By:</span>
              <span class="value">${data.processedBy}</span>
            </div>
            <div class="info-row">
              <span class="label">Reason:</span>
              <span class="value">${data.reason}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <div class="info-row">
              <span class="label">Original Refund Amount:</span>
              <span class="value">${this.formatCurrency(data.originalRefundAmount)}</span>
            </div>
            <div class="info-row total-row">
              <span>Actual Refund Amount:</span>
              <span>${this.formatCurrency(data.actualRefundAmount)}</span>
            </div>
          </div>

          <div class="refund-info">
            <div style="font-weight: bold; color: #10b981; margin-bottom: 8px;">Refund Information</div>
            <div class="info-row">
              <span class="label">Refund Method:</span>
              <span class="value" style="text-transform: capitalize;">${data.refundMethod}</span>
            </div>
            ${data.refundMethod === 'credit' ? `
              <div style="margin-top: 10px; padding: 10px; background: #f0fdf4; border-radius: 4px; font-size: 14px;">
                <strong>Note:</strong> Amount has been added to customer's credit balance.
              </div>
            ` : data.refundMethod === 'transfer' ? `
              <div style="margin-top: 10px; padding: 10px; background: #f0fdf4; border-radius: 4px; font-size: 14px;">
                <strong>Note:</strong> Refund will be processed via bank transfer within 2-3 business days.
              </div>
            ` : `
              <div style="margin-top: 10px; padding: 10px; background: #f0fdf4; border-radius: 4px; font-size: 14px;">
                <strong>Note:</strong> Cash refund processed immediately.
              </div>
            `}
          </div>

          ${data.notes ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
              <div style="font-weight: bold; margin-bottom: 5px;">Additional Notes:</div>
              <div style="color: #666;">${data.notes}</div>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for your business. If you have any questions about this return, please contact us.</p>
            <p style="margin-top: 15px;">
              <strong>Success Enterprise</strong><br>
              Groundnut Oil Distribution<br>
              Email: info@successenterprise.com | Phone: +234-XXX-XXXX
            </p>
            <p style="margin-top: 15px; font-size: 10px; color: #999;">
              This is a computer-generated receipt. Generated on ${this.formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generateReceiptText(data: ReturnReceiptData): string {
    const separator = "=" .repeat(50);
    const items = data.returnItems.map(item => 
      `${item.name.padEnd(20)} ${item.quantity.toString().padStart(3)} ${this.formatCurrency(item.price).padStart(10)} ${this.formatCurrency(item.total).padStart(12)}`
    ).join('\n');

    return `
${separator}
           SUCCESS ENTERPRISE
        Groundnut Oil Distribution
              RETURN RECEIPT
${separator}

Return ID: ${data.returnId}
Original Transaction: ${data.originalTransactionId}
Customer: ${data.customerName}
Return Date: ${this.formatDate(data.returnDate)}
Processed By: ${data.processedBy}
Reason: ${data.reason}

${separator}
RETURNED ITEMS
${separator}
Item                 Qty      Price       Total
${separator}
${items}
${separator}

Original Refund Amount: ${this.formatCurrency(data.originalRefundAmount)}
Actual Refund Amount:   ${this.formatCurrency(data.actualRefundAmount)}

Refund Method: ${data.refundMethod.toUpperCase()}

${data.notes ? `
Notes: ${data.notes}
` : ''}
${separator}
Thank you for your business!
Success Enterprise
${separator}
    `;
  }

  static async printReceipt(data: ReturnReceiptData): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups.');
    }

    printWindow.document.write(this.generateReceiptHTML(data));
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  static downloadReceiptPDF(data: ReturnReceiptData): void {
    // In a real application, you would use a PDF library like jsPDF or html2pdf
    // For now, we'll create a downloadable HTML file
    const htmlContent = this.generateReceiptHTML(data);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `return-receipt-${data.returnId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
