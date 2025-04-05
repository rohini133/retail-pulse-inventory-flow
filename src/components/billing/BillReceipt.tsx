
import { useState, useRef } from "react";
import { Bill } from "@/data/models";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Send, FileText, WhatsApp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";

interface BillReceiptProps {
  bill: Bill;
}

export const BillReceipt = ({ bill }: BillReceiptProps) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printContents = receiptRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    const printStyles = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; }
          .receipt-container { width: 80mm; padding: 10mm; margin: 0 auto; }
          .receipt-header { text-align: center; margin-bottom: 5mm; }
          .store-name { font-size: 16pt; font-weight: bold; margin-bottom: 2mm; }
          .receipt-date { font-size: 8pt; margin-bottom: 5mm; }
          .receipt-items { width: 100%; border-collapse: collapse; margin-bottom: 5mm; }
          .receipt-items th, .receipt-items td { text-align: left; padding: 1mm 0; font-size: 8pt; }
          .receipt-items .amount { text-align: right; }
          .receipt-summary { width: 100%; margin-top: 3mm; border-top: 1px dashed #000; padding-top: 3mm; }
          .receipt-summary td { font-size: 8pt; padding: 1mm 0; }
          .receipt-summary .label { text-align: left; }
          .receipt-summary .value { text-align: right; }
          .receipt-footer { margin-top: 5mm; text-align: center; font-size: 8pt; }
          .receipt-separator { border-top: 1px dashed #000; margin: 5mm 0; }
          .receipt-total { font-weight: bold; font-size: 10pt; }
          .receipt-payment { margin-top: 3mm; }
          .receipt-transaction { margin-top: 3mm; }
          .receipt-barcode { margin-top: 5mm; text-align: center; }
          .hide-on-print { display: none !important; }
        }
      </style>
    `;

    document.body.innerHTML = printStyles + '<div class="receipt-container">' + printContents + '</div>';
    
    setTimeout(() => {
      window.print();
      document.body.innerHTML = originalContents;
    }, 100);
  };

  const handleSendWhatsApp = async () => {
    if (!bill.customerPhone) {
      toast({
        title: "Cannot send WhatsApp",
        description: "Customer phone number is required to send bill via WhatsApp.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSendingWhatsApp(true);
    try {
      await sendBillToWhatsApp(bill);
      toast({
        title: "Receipt sent",
        description: `Receipt has been sent to ${bill.customerPhone} via WhatsApp.`,
      });
    } catch (error) {
      toast({
        title: "Failed to send receipt",
        description: "There was an error sending the receipt via WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Receipt</span>
          <div className="text-sm font-normal text-gray-500">Bill #{bill.id}</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto">
        <div ref={receiptRef}>
          <div className="receipt-header">
            <div className="store-name">D MART</div>
            <div className="text-sm text-gray-600">123 Retail Avenue, Shopping District</div>
            <div className="text-sm text-gray-600">Tel: (123) 456-7890</div>
            <div className="receipt-date text-sm text-gray-600 mt-2">
              {new Date(bill.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="receipt-separator border-t border-dashed border-gray-300 my-3"></div>

          <div className="text-sm">
            <div><strong>Customer:</strong> {bill.customerName || "Walk-in Customer"}</div>
            {bill.customerPhone && <div><strong>Phone:</strong> {bill.customerPhone}</div>}
            {bill.customerEmail && <div><strong>Email:</strong> {bill.customerEmail}</div>}
          </div>

          <div className="receipt-separator border-t border-dashed border-gray-300 my-3"></div>

          <table className="receipt-items w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-medium py-1">Item</th>
                <th className="text-center font-medium py-1">Qty</th>
                <th className="text-right font-medium py-1">Price</th>
                <th className="text-right font-medium py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => {
                const discountedPrice = item.product.price * (1 - item.product.discountPercentage / 100);
                const itemTotal = discountedPrice * item.quantity;
                
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-1">
                      {item.product.name}
                      {item.product.discountPercentage > 0 && (
                        <div className="text-xs text-green-600">
                          {item.product.discountPercentage}% off
                        </div>
                      )}
                    </td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">{formatCurrency(discountedPrice)}</td>
                    <td className="text-right py-1">{formatCurrency(itemTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="receipt-summary text-sm">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax (8%):</span>
              <span>{formatCurrency(bill.tax)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Total:</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
          </div>

          <div className="receipt-separator border-t border-dashed border-gray-300 my-3"></div>

          <div className="receipt-payment text-sm">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span>
                {bill.paymentMethod === 'cash' ? 'Cash' : 
                 bill.paymentMethod === 'card' ? 'Card' : 'Digital Wallet'}
              </span>
            </div>
          </div>

          <div className="receipt-transaction text-sm mt-2">
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span>{bill.id}</span>
            </div>
          </div>

          <div className="receipt-footer text-center text-xs text-gray-500 mt-5">
            <p>Thank you for shopping at D MART!</p>
            <p>Visit us again soon!</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 mt-auto">
        <div className="flex flex-col w-full gap-2">
          <Button onClick={handlePrint} className="w-full justify-start">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          
          {bill.customerPhone && (
            <Button 
              onClick={handleSendWhatsApp} 
              disabled={isSendingWhatsApp}
              variant="outline" 
              className="w-full justify-start"
            >
              {isSendingWhatsApp ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <WhatsApp className="mr-2 h-4 w-4" />
              )}
              Send via WhatsApp
            </Button>
          )}
          
          <Button variant="outline" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
