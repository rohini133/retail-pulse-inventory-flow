
import { Bill, CartItem } from "@/data/models";
import { sampleBills } from "@/data/sampleData";
import { decreaseStock } from "./productService";
import { toast } from "@/components/ui/use-toast";

// In a real application, these functions would make API calls to a backend
let bills = [...sampleBills];

export const getBills = async (): Promise<Bill[]> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // Return bills sorted by date with most recent first
  return [...bills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getBill = async (id: string): Promise<Bill | undefined> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return bills.find(bill => bill.id === id);
};

export const createBill = async (
  items: CartItem[],
  customerDetails: {
    name?: string;
    phone?: string;
    email?: string;
  },
  paymentMethod: "cash" | "card" | "digital-wallet"
): Promise<Bill> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => {
      const discountedPrice = 
        item.product.price * (1 - item.product.discountPercentage / 100);
      return sum + discountedPrice * item.quantity;
    }, 
    0
  );
  
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  // Create new bill
  const newBill: Bill = {
    id: `B${String(bills.length + 1).padStart(3, '0')}`,
    items,
    subtotal,
    tax,
    total,
    customerName: customerDetails.name,
    customerPhone: customerDetails.phone,
    customerEmail: customerDetails.email,
    paymentMethod,
    createdAt: new Date().toISOString(),
    status: "completed"
  };
  
  // Update inventory stock
  try {
    for (const item of items) {
      await decreaseStock(item.product.id, item.quantity);
    }
  } catch (error) {
    toast({
      title: "Error creating bill",
      description: "Failed to update inventory. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
  
  // Add bill to database
  bills.push(newBill);
  
  toast({
    title: "Bill created successfully",
    description: `Bill #${newBill.id} has been created.`,
  });
  
  return newBill;
};

export const sendBillToWhatsApp = async (bill: Bill): Promise<boolean> => {
  // This would normally call an API to send the WhatsApp message
  // Here we're just simulating success
  
  if (!bill.customerPhone) {
    toast({
      title: "Cannot send WhatsApp",
      description: "Customer phone number is required to send bill via WhatsApp.",
      variant: "destructive"
    });
    return false;
  }
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  toast({
    title: "Bill sent successfully",
    description: `Bill #${bill.id} has been sent to ${bill.customerPhone} via WhatsApp.`,
  });
  
  return true;
};

export const searchBills = async (query: string): Promise<Bill[]> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query.trim()) {
    return [...bills].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  const lowerCaseQuery = query.toLowerCase();
  return bills.filter(
    bill => 
      bill.id.toLowerCase().includes(lowerCaseQuery) ||
      (bill.customerName && bill.customerName.toLowerCase().includes(lowerCaseQuery)) ||
      (bill.customerPhone && bill.customerPhone.toLowerCase().includes(lowerCaseQuery))
  ).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
