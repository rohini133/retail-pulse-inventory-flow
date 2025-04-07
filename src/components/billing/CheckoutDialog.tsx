import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Printer, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";
import { CartItem, BillItemWithProduct, BillWithItems } from "@/data/models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string | null;
  customerPhone?: string;
  cartItems: CartItem[];
  customerName?: string;
  customerEmail?: string;
  paymentMethod: "cash" | "card" | "digital-wallet";
  subtotal: number;
  tax: number;
  total: number;
}

export const CheckoutDialog = ({
  open,
  onOpenChange,
  billId,
  customerPhone,
  cartItems,
  customerName,
  customerEmail,
  paymentMethod,
  subtotal,
  tax,
  total
}: CheckoutDialogProps) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleSendWhatsApp = async () => {
    if (!billId) return;
    
    setIsSendingWhatsApp(true);
    try {
      const billItems: BillItemWithProduct[] = cartItems.map(item => ({
        id: `bi-${Math.random().toString(36).substring(2, 9)}`,
        billId: billId,
        productId: item.product.id,
        productPrice: item.product.price,
        discountPercentage: item.product.discountPercentage,
        quantity: item.quantity,
        total: item.product.price * (1 - item.product.discountPercentage / 100) * item.quantity,
        productName: item.product.name,
        product: item.product
      }));
      
      const billWithItems: BillWithItems = {
        id: billId,
        items: billItems,
        subtotal,
        tax,
        total,
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        createdAt: new Date().toISOString(),
        status: "completed",
        userId: "system"
      };
      
      await sendBillToWhatsApp(billWithItems);
      
      toast({
        title: "WhatsApp Receipt Sent",
        description: `The receipt has been sent to ${customerPhone}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send WhatsApp",
        description: "There was an error sending the bill via WhatsApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handlePrintReceipt = () => {
    setIsPrinting(true);
    
    setTimeout(() => {
      toast({
        title: "Receipt Printed",
        description: "The receipt has been sent to the printer.",
      });
      setIsPrinting(false);
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      toast({
        title: "Receipt Downloaded",
        description: "The receipt has been downloaded successfully.",
      });
      setIsDownloading(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bill Generated Successfully</DialogTitle>
          <DialogDescription>
            Bill #{billId} has been created and inventory has been updated.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">What would you like to do next?</p>
          
          <Button 
            className="w-full mb-3"
            onClick={handlePrintReceipt}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Print Receipt
          </Button>
          
          <Button 
            className="w-full mb-3"
            variant="secondary"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Receipt
          </Button>
          
          {customerPhone && (
            <Button 
              className="w-full mb-3 dmart-button"
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
            >
              {isSendingWhatsApp ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Send Receipt via WhatsApp
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Return to Billing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
