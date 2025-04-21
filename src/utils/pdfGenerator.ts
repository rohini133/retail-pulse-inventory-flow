import { BillWithItems } from "@/data/models";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Constants for shop information
const SHOP_NAME = "Vivaas";
const SHOP_ADDRESS_LINE1 = "Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road";
const SHOP_ADDRESS_LINE2 = "Lakshumi Colony Opp.HDFC Bank Near Angle School Pune-412307";
const SHOP_CONTACT = "9657171777 || 9765971717";
const SHOP_LOGO = "public/lovable-uploads/85d83170-b4fe-40bb-962f-890602ddcacc.png";

/**
 * Format a UUID-style bill ID to a simple numeric format
 * @param billId The UUID of the bill
 * @returns A simplified bill number (e.g., "123")
 */
export const formatBillNumber = (billId: string): string => {
  // Extract the first part of the UUID and convert to a number
  if (!billId) return "1"; // Fallback
  
  const firstPart = billId.split('-')[0];
  if (!firstPart) return "1"; // Fallback
  
  // Convert to integer by taking last 6 digits of hex as decimal
  const num = parseInt(firstPart.slice(-6), 16);
  return num.toString();
};

export const generatePDF = (bill: BillWithItems): Blob => {
  console.log("Generating PDF for bill:", bill);

  try {
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    let currentY = margin;

    // Add the logo image instead of text "Vivaas"
    // The image path should be accessible. We use the public url shared by user (uploaded)
    const logoUrl = "/lovable-uploads/ac58d961-7833-46c0-b5a4-fd5650245900.png";
    const imageProps = (doc as any).getImageProperties(logoUrl);
    // We can't load image async easily, so fallback to fixed width/height
    const imgWidth = 40;
    const imgHeight = 20;
    // Center the image
    doc.addImage(logoUrl, 'PNG', (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight);
    currentY += imgHeight + 5;

    // Shop address and contact
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road", pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    doc.text("Lakshumi Colony Opp.HDFC Bank Near Angle School Pune-412307", pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    doc.text("MOB No. 9657171777 | 9765971717", pageWidth / 2, currentY, { align: "center" });
    currentY += 5;

    // Add a horizontal line
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;

    // Add bill information (Bill No, Date, Counter, Time)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    const simpleBillNumber = formatBillNumber(bill.id);

    const createdAtStr = bill.createdAt && typeof bill.createdAt === 'string'
      ? bill.createdAt
      : new Date().toISOString();

    const billDate = new Date(createdAtStr);
    const isValidDate = !isNaN(billDate.getTime());

    const formattedDate = isValidDate
      ? `${billDate.getDate().toString().padStart(2, '0')}/${(billDate.getMonth() + 1).toString().padStart(2, '0')}/${billDate.getFullYear()}`
      : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

    const formattedTime = isValidDate
      ? billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Bill details - left side
    doc.text(`Bill No : ${simpleBillNumber}`, margin, currentY);
    // Bill details - right side
    doc.text(`Date : ${formattedDate}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 6;

    // Counter - left side
    doc.text(`Counter No : 1`, margin, currentY);
    // Time - right side
    doc.text(`Time : ${formattedTime}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 6;

    // Add Customer Information
    if (bill.customerName || bill.customerPhone || bill.customerEmail) {
      doc.text("Customer:", margin, currentY);
      currentY += 5;

      if (bill.customerName) {
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${bill.customerName}`, margin + 5, currentY);
        currentY += 5;
      }

      if (bill.customerPhone) {
        doc.text(`Phone: ${bill.customerPhone}`, margin + 5, currentY);
        currentY += 5;
      }

      if (bill.customerEmail) {
        doc.text(`Email: ${bill.customerEmail}`, margin + 5, currentY);
        currentY += 5;
      }

      currentY += 2;
    }

    // Add a separator line
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;

    // Add header for table columns
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Particulars", margin, currentY);
    doc.text("Qty", pageWidth * 0.6, currentY, { align: "center" });
    doc.text("MRP", pageWidth * 0.75, currentY, { align: "center" });
    doc.text("Amount", pageWidth - margin, currentY, { align: "right" });
    currentY += 4;

    // Add a separator line
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // Add items
    doc.setFont("helvetica", "normal");
    let totalMRP = 0;
    let totalQty = 0;

    const hasItems = bill.items && Array.isArray(bill.items) && bill.items.length > 0;

    if (hasItems) {
      bill.items.forEach(item => {
        const productName = item.productName ||
          (item.product ? item.product.name : "Unknown Product");

        const mrp = item.productPrice ||
          (item.product ? item.product.price : 0);

        totalMRP += mrp * item.quantity;
        totalQty += item.quantity;

        doc.text(productName.toUpperCase(), margin, currentY);
        doc.text(item.quantity.toString(), pageWidth * 0.6, currentY, { align: "center" });
        doc.text(formatCurrency(mrp, false), pageWidth * 0.75, currentY, { align: "center" });
        doc.text(formatCurrency(mrp * item.quantity, false), pageWidth - margin, currentY, { align: "right" });

        currentY += 6;
      });
    } else {
      doc.text("No items in this bill", pageWidth / 2, currentY, { align: "center" });
      currentY += 6;
    }

    // Show discount if applied
    let finalTotal = totalMRP;
    if ((bill.discountAmount && bill.discountAmount > 0) || (bill.discountValue && bill.discountValue > 0)) {
      doc.setFont("helvetica", "bold");
      let discountLabel = "Special Discount Offer";
      if (bill.discountType === "percent" && bill.discountValue) {
        discountLabel += ` (${bill.discountValue}%)`;
      }
      doc.text(discountLabel, margin, currentY);
      doc.text(`- ${formatCurrency(bill.discountAmount || 0, false)}`, pageWidth - margin, currentY, { align: "right" });
      currentY += 6;
      
      // Update the final total after discount
      finalTotal = bill.total || (totalMRP - (bill.discountAmount || 0));
    }

    // Add a separator line
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // Total quantity and MRP (after discount)
    doc.setFont("helvetica", "bold");
    doc.text(`Qty: ${totalQty}`, margin, currentY);
    doc.text(`Total MRP: ${formatCurrency(finalTotal, false)}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 6;

    // Payment details etc (keep existing code)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Thank you for shopping with us", pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    doc.text("Please visit again..!", pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    doc.text("*** Have A Nice Day ***", pageWidth / 2, currentY, { align: "center" });

    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error("Error creating PDF:", error);
    return new Blob(['Error generating PDF'], { type: 'text/plain' });
  }
};

export const generateReceiptHTML = (bill: BillWithItems): string => {
  // Ensure we have a valid date
  const createdAtStr = bill.createdAt && typeof bill.createdAt === 'string' 
    ? bill.createdAt 
    : new Date().toISOString();
  
  const billDate = new Date(createdAtStr);
  const isValidDate = !isNaN(billDate.getTime());
  
  const simpleBillNumber = formatBillNumber(bill.id);
  
  const formattedDate = isValidDate 
    ? billDate.toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');
  
  const formattedTime = isValidDate
    ? billDate.toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})
    : new Date().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'});
  
  // Check if bill.items exists, is an array, and has elements
  const hasItems = bill.items && Array.isArray(bill.items) && bill.items.length > 0;
  
  const itemsHTML = hasItems 
    ? bill.items.map(item => {
        const productName = item.productName || (item.product ? item.product.name : "Unknown Product");
        const productPrice = item.productPrice || (item.product ? item.product.price : 0);
        const discountPercentage = item.discountPercentage || (item.product ? item.product.discountPercentage : 0);
        const finalPrice = productPrice * (1 - discountPercentage / 100);
        
        return `
          <tr>
            <td style="padding: 4px 0;">${productName}</td>
            <td style="text-align: center; padding: 4px 0;">${item.quantity}</td>
            <td style="text-align: right; padding: 4px 0;">${formatCurrency(finalPrice)}</td>
            <td style="text-align: right; padding: 4px 0;">${formatCurrency(item.total)}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="4" style="text-align: center; padding: 10px;">No items in this bill</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${simpleBillNumber}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
        .receipt { max-width: 80mm; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 15px; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { text-align: left; padding: 5px 0; border-bottom: 1px solid #ddd; }
        .items-table td { vertical-align: top; }
        .total-table { width: 100%; margin-top: 10px; }
        .total-table td { padding: 3px 0; }
        .total-table .total-row td { font-weight: bold; padding-top: 5px; border-top: 1px solid #ddd; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; }
        .customer-info { margin: 10px 0; text-align: left; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <img src="public/lovable-uploads/85d83170-b4fe-40bb-962f-890602ddcacc.png" alt="Vivaa's Logo" style="max-width: 100px; margin-bottom: 10px;">
          <div>Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road</div>
          <div>Lakshumi Colony Opposite HDFC Bank Near Angle School, Pune-412307</div>
          <div>9657171777 || 9765971717</div>
          <div style="margin-top: 10px;">${formattedDate} ${formattedTime}</div>
          <div style="margin-top: 5px;">Receipt #${simpleBillNumber}</div>
        </div>
        
        <div class="customer-info">
          <div><strong>Customer:</strong> ${bill.customerName || "Walk-in Customer"}</div>
          ${bill.customerPhone ? `<div><strong>Phone:</strong> ${bill.customerPhone}</div>` : ''}
          ${bill.customerEmail ? `<div><strong>Email:</strong> ${bill.customerEmail}</div>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <table class="total-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">${formatCurrency(bill.subtotal)}</td>
          </tr>
          <tr>
            <td>Tax (8%):</td>
            <td style="text-align: right;">${formatCurrency(bill.tax)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td style="text-align: right;">${formatCurrency(bill.total)}</td>
          </tr>
        </table>
        
        <div style="margin-top: 15px;">
          <div><strong>Payment Method:</strong> ${getPaymentMethodName(bill.paymentMethod)}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping at Vivaas!</p>
          <p>Visit us again soon!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to format currency
function formatCurrency(amount: number, includeCurrencySymbol: boolean = true): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: includeCurrencySymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

// Helper function to get payment method name
function getPaymentMethodName(method: string): string {
  switch (method) {
    case 'cash': return 'Cash';
    case 'card': return 'Card';
    case 'digital-wallet': return 'UPI';
    default: return 'Unknown';
  }
}

export const generateSalesReportPDF = (reportData: any, period: string): Blob => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Vivaas - Sales Report (${period})`, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Add date range
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 30, { align: "center" });
    
    // Add summary data
    if (period === "products" && reportData.productSalesDetails) {
      // Add product sales details table
      autoTable(doc, {
        head: [['Product', 'Category', 'Qty Sold', 'Buying Price', 'Selling Price', 'Revenue', 'Profit']],
        body: reportData.productSalesDetails.map((product: any) => [
          product.name,
          product.category,
          product.totalQuantity.toString(),
          formatCurrencyForReport(product.buyingPrice),
          formatCurrencyForReport(product.sellingPrice),
          formatCurrencyForReport(product.totalRevenue),
          formatCurrencyForReport(product.totalProfit)
        ]),
        startY: 40,
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Calculate total values
      const totalQuantity = reportData.productSalesDetails.reduce((sum: number, p: any) => sum + p.totalQuantity, 0);
      const totalRevenue = reportData.productSalesDetails.reduce((sum: number, p: any) => sum + p.totalRevenue, 0);
      const totalProfit = reportData.productSalesDetails.reduce((sum: number, p: any) => sum + p.totalProfit, 0);
      
      // Add summary line
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(12);
      doc.text(`Summary: ${reportData.productSalesDetails.length} products, ${totalQuantity} units sold, ₹${totalRevenue.toLocaleString('en-IN')} revenue, ₹${totalProfit.toLocaleString('en-IN')} profit`, 14, finalY + 10);
      
      // Add insights
      if (reportData.mostSellingProduct) {
        doc.text(`Most Selling Product: ${reportData.mostSellingProduct.name} (${reportData.mostSellingProduct.totalQuantity} units)`, 14, finalY + 20);
      }
      
      if (reportData.mostProfitableProduct) {
        doc.text(`Most Profitable Product: ${reportData.mostProfitableProduct.name} (₹${reportData.mostProfitableProduct.totalProfit.toLocaleString('en-IN')})`, 14, finalY + 30);
      }
    } else {
      // For other reports (daily, weekly, monthly, yearly)
      // Add a simple summary table based on the period
      const data = reportData[`${period}Sales`] || [];
      
      autoTable(doc, {
        head: [['Period', 'Sales Amount']],
        body: data.map((item: any) => [
          item.day || item.week || item.name || item.year || 'Unknown',
          formatCurrencyForReport(item.sales)
        ]),
        startY: 40
      });
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} - ${SHOP_NAME} - Generated on ${new Date().toLocaleString()}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating sales report PDF:", error);
    return new Blob([`Error generating sales report for ${period}`], { type: 'text/plain' });
  }
};

export const generateSalesReportExcel = (reportData: any, period: string): Blob => {
  try {
    // Header row
    let csv = '';
    
    if (period === "products" && reportData.productSalesDetails) {
      // Product sales report CSV
      csv = 'Product,Category,Brand,Qty Sold,Buying Price,Selling Price,Revenue,Profit\n';
      
      // Add data rows
      reportData.productSalesDetails.forEach((product: any) => {
        csv += `"${product.name}","${product.category}","${product.brand}",${product.totalQuantity},${product.buyingPrice},${product.sellingPrice},${product.totalRevenue},${product.totalProfit}\n`;
      });
      
      // Add summary row
      const totalQuantity = reportData.productSalesDetails.reduce((sum: number, p: any) => sum + p.totalQuantity, 0);
      const totalRevenue = reportData.productSalesDetails.reduce((sum: number, p: any) => sum + p.totalRevenue, 0);
      const totalProfit = reportData.productSalesDetails.reduce((sum: number, p: any) => sum + p.totalProfit, 0);
      
      csv += `\n"TOTAL","","",${totalQuantity},"","",${totalRevenue},${totalProfit}\n`;
      
      // Add insights
      if (reportData.mostSellingProduct) {
        csv += `\n"Most Selling Product: ${reportData.mostSellingProduct.name} (${reportData.mostSellingProduct.totalQuantity} units)"\n`;
      }
      
      if (reportData.mostProfitableProduct) {
        csv += `"Most Profitable Product: ${reportData.mostProfitableProduct.name} (₹${reportData.mostProfitableProduct.totalProfit})"\n`;
      }
      
    } else {
      // For other reports (daily, weekly, monthly, yearly)
      const data = reportData[`${period}Sales`] || [];
      
      // Determine the header name based on the period
      let periodName = 'Day';
      if (period === 'weekly') periodName = 'Week';
      else if (period === 'monthly') periodName = 'Month';
      else if (period === 'yearly') periodName = 'Year';
      
      csv = `${periodName},Sales Amount\n`;
      
      // Add data rows
      data.forEach((item: any) => {
        const periodValue = item.day || item.week || item.name || item.year || 'Unknown';
        csv += `"${periodValue}",${item.sales}\n`;
      });
    }
    
    return new Blob([csv], { type: 'text/csv' });
  } catch (error) {
    console.error("Error generating sales report CSV:", error);
    return new Blob([`Error generating sales report CSV for ${period}`], { type: 'text/csv' });
  }
};

// Helper function for formatting currency in reports
function formatCurrencyForReport(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}
