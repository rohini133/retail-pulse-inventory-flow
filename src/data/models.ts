
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  lowStockThreshold: number;
  image: string;
  size?: string;
  color?: string;
  itemNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Bill {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: "cash" | "card" | "digital-wallet";
  createdAt: string;
  status: "pending" | "completed" | "cancelled";
}

export interface DashboardStats {
  totalSales: number;
  todaySales: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentSales: Bill[];
  topSellingProducts: { product: Product; soldCount: number }[];
}
