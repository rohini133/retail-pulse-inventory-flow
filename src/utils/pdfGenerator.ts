
import { BillWithItems } from "@/data/models";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = (bill: BillWithItems): Blob => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add business info
    doc.setFontSize(20);
    doc.text("Demo", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Retail Management System", pageWidth / 2, 28, { align: "center" });
    doc.text("123 Shopping Street, Retail City", pageWidth / 2, 35, { align: "center" });
    doc.text("Contact: +91 98765 43210", pageWidth / 2, 42, { align: "center" });
    
    // Add bill info
    doc.setFontSize(14);
    doc.text(`Bill #${bill.id}`, 14, 55);
    
    doc.setFontSize(10);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const date = new Date(bill.createdAt);
    doc.text(`Date: ${date.toLocaleDateString('en-IN', dateOptions)}`, 14, 62);
    
    // Add customer details
    doc.text(`Customer: ${bill.customerName || "Walk-in Customer"}`, 14, 70);
    if (bill.customerPhone) {
      doc.text(`Phone: ${bill.customerPhone}`, 14, 77);
    }
    if (bill.customerEmail) {
      doc.text(`Email: ${bill.customerEmail}`, 14, 84);
    }
    
    // Add payment method
    const paymentMethodMap = {
      "cash": "Cash",
      "card": "Credit/Debit Card",
      "digital-wallet": "Digital Wallet"
    };
    doc.text(`Payment Method: ${paymentMethodMap[bill.paymentMethod]}`, 14, 91);
    
    // Add items table
    const tableColumn = ["No.", "Item", "Price", "Qty", "Discount", "Total"];
    const tableRows = bill.items.map((item, index) => [
      (index + 1).toString(),
      item.productName,
      `₹ ${item.productPrice.toFixed(2)}`,
      item.quantity.toString(),
      `${item.discountPercentage}%`,
      `₹ ${(item.productPrice * (1 - item.discountPercentage / 100) * item.quantity).toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 100,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      margin: { top: 100 }
    });
    
    // Calculate the Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Add summary
    doc.text(`Subtotal: ₹ ${bill.subtotal.toFixed(2)}`, pageWidth - 60, finalY + 10);
    doc.text(`Tax (18%): ₹ ${bill.tax.toFixed(2)}`, pageWidth - 60, finalY + 17);
    doc.setFontSize(12);
    doc.text(`Grand Total: ₹ ${bill.total.toFixed(2)}`, pageWidth - 60, finalY + 27);
    
    // Add footer
    doc.setFontSize(8);
    doc.text("Thank you for shopping with us!", pageWidth / 2, finalY + 40, { align: "center" });
    doc.text("This is a computer-generated receipt and does not require a signature.", pageWidth / 2, finalY + 45, { align: "center" });
    
    // Convert to blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw new Error("Failed to generate PDF");
  }
};
