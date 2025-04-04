
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";
import { CartItem } from "@/data/models";
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
  const { toast } = useToast();

  const handleSendWhatsApp = async () => {
    if (!billId) return;
    
    setIsSendingWhatsApp(true);
    try {
      await sendBillToWhatsApp({
        id: billId,
        items: cartItems,
        subtotal,
        tax,
        total,
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        createdAt: new Date().toISOString(),
        status: "completed"
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
