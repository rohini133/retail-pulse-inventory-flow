
import type { Database } from '@/integrations/supabase/types';

// Re-export the Database type for easier imports throughout the app
export type { Database };

// Convenience type for Products table
export type Product = Database['public']['Tables']['products']['Row'];

// Convenience type for Bills table
export type Bill = Database['public']['Tables']['bills']['Row'];

// Convenience type for Bill Items table
export type BillItem = Database['public']['Tables']['bill_items']['Row'];

// Convenience type for Profiles table
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Extended product type with calculated fields
export interface ProductWithStatus extends Product {
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
}

// Extended bill type with items included
export interface BillWithItems extends Bill {
  items: BillItemWithProduct[];
}

// Extended bill item type with product details
export interface BillItemWithProduct extends BillItem {
  product: Product;
}

// Custom CartItem type that matches your current model
export interface CartItem {
  product: Product;
  quantity: number;
}

// Define the type for authentication roles
export type UserRole = 'admin' | 'cashier';

// Define customer information type
export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

// Dashboard statistics type
export interface DashboardStats {
  totalSales: number;
  todaySales: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentSales: BillWithItems[];
  topSellingProducts: { product: Product; soldCount: number }[];
}
