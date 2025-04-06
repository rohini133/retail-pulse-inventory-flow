
import { Bill, BillWithItems, Product } from "./models";

export const sampleProducts: Product[] = [
  {
    id: "p1",
    name: "Slim Fit T-Shirt",
    brand: "FashionX",
    category: "Clothing",
    description: "Comfortable cotton t-shirt with a modern slim fit design",
    price: 24.99,
    discountPercentage: 0,
    stock: 45,
    lowStockThreshold: 10,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    size: "M",
    color: "Blue",
    itemNumber: "TX-1001",
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-01-15T08:30:00Z"
  },
  {
    id: "p2",
    name: "Wireless Earbuds",
    brand: "AudioTech",
    category: "Electronics",
    description: "High-quality wireless earbuds with noise cancellation",
    price: 79.99,
    discountPercentage: 15,
    stock: 12,
    lowStockThreshold: 5,
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    itemNumber: "AT-2001",
    createdAt: "2023-02-10T10:15:00Z",
    updatedAt: "2023-02-10T10:15:00Z"
  },
  {
    id: "p3",
    name: "Leather Wallet",
    brand: "LuxeGoods",
    category: "Accessories",
    description: "Genuine leather wallet with multiple card slots",
    price: 39.99,
    discountPercentage: 0,
    stock: 30,
    lowStockThreshold: 8,
    image: "https://images.unsplash.com/photo-1517254797898-06f64f141cc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "Brown",
    itemNumber: "LG-3001",
    createdAt: "2023-03-05T14:45:00Z",
    updatedAt: "2023-03-05T14:45:00Z"
  },
  {
    id: "p4",
    name: "Running Shoes",
    brand: "SportFlex",
    category: "Footwear",
    description: "Lightweight running shoes with cushioned soles",
    price: 89.99,
    discountPercentage: 10,
    stock: 18,
    lowStockThreshold: 5,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    size: "42",
    color: "Red/Black",
    itemNumber: "SF-4001",
    createdAt: "2023-04-12T09:20:00Z",
    updatedAt: "2023-04-12T09:20:00Z"
  },
  {
    id: "p5",
    name: "Smartphone Case",
    brand: "TechProtect",
    category: "Accessories",
    description: "Durable smartphone case with drop protection",
    price: 19.99,
    discountPercentage: 0,
    stock: 0,
    lowStockThreshold: 10,
    image: "https://images.unsplash.com/photo-1541877944-ac82a091518a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "Clear",
    itemNumber: "TP-5001",
    createdAt: "2023-05-20T11:30:00Z",
    updatedAt: "2023-05-20T11:30:00Z"
  },
  {
    id: "p6",
    name: "Coffee Maker",
    brand: "HomeEssentials",
    category: "Kitchen",
    description: "Programmable coffee maker with thermal carafe",
    price: 64.99,
    discountPercentage: 20,
    stock: 3,
    lowStockThreshold: 5,
    image: "https://images.unsplash.com/photo-1570087935833-42e1be04a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "Silver",
    itemNumber: "HE-6001",
    createdAt: "2023-06-08T15:15:00Z",
    updatedAt: "2023-06-08T15:15:00Z"
  },
  {
    id: "p7",
    name: "Laptop Backpack",
    brand: "TravelGear",
    category: "Bags",
    description: "Spacious backpack with laptop compartment and USB charging port",
    price: 49.99,
    discountPercentage: 5,
    stock: 22,
    lowStockThreshold: 7,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "Black",
    itemNumber: "TG-7001",
    createdAt: "2023-07-16T13:40:00Z",
    updatedAt: "2023-07-16T13:40:00Z"
  },
  {
    id: "p8",
    name: "Fitness Tracker",
    brand: "FitTech",
    category: "Electronics",
    description: "Water-resistant fitness tracker with heart rate monitoring",
    price: 59.99,
    discountPercentage: 0,
    stock: 8,
    lowStockThreshold: 5,
    image: "https://images.unsplash.com/photo-1557935728-e6d1eaaa3378?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "Black",
    itemNumber: "FT-8001",
    createdAt: "2023-08-22T16:55:00Z",
    updatedAt: "2023-08-22T16:55:00Z"
  }
];

export const sampleBills: BillWithItems[] = [
  {
    id: "B001",
    items: [
      { 
        id: "bi1", 
        billId: "B001", 
        productId: sampleProducts[0].id, 
        productPrice: sampleProducts[0].price,
        discountPercentage: sampleProducts[0].discountPercentage,
        quantity: 2, 
        total: sampleProducts[0].price * 2,
        productName: sampleProducts[0].name,
        product: sampleProducts[0] 
      },
      { 
        id: "bi2", 
        billId: "B001", 
        productId: sampleProducts[2].id, 
        productPrice: sampleProducts[2].price,
        discountPercentage: sampleProducts[2].discountPercentage,
        quantity: 1, 
        total: sampleProducts[2].price,
        productName: sampleProducts[2].name,
        product: sampleProducts[2] 
      }
    ],
    subtotal: 89.97,
    tax: 7.20,
    total: 97.17,
    customerName: "John Doe",
    customerPhone: "+1234567890",
    paymentMethod: "card",
    createdAt: "2023-10-01T14:30:00Z",
    status: "completed",
    userId: "system"
  },
  {
    id: "B002",
    items: [
      { 
        id: "bi3", 
        billId: "B002", 
        productId: sampleProducts[1].id, 
        productPrice: sampleProducts[1].price,
        discountPercentage: sampleProducts[1].discountPercentage,
        quantity: 1, 
        total: sampleProducts[1].price * (1 - sampleProducts[1].discountPercentage / 100),
        productName: sampleProducts[1].name,
        product: sampleProducts[1] 
      },
      { 
        id: "bi4", 
        billId: "B002", 
        productId: sampleProducts[4].id, 
        productPrice: sampleProducts[4].price,
        discountPercentage: sampleProducts[4].discountPercentage,
        quantity: 1, 
        total: sampleProducts[4].price,
        productName: sampleProducts[4].name,
        product: sampleProducts[4] 
      }
    ],
    subtotal: 87.98,
    tax: 7.04,
    total: 95.02,
    customerName: "Jane Smith",
    customerPhone: "+1987654321",
    paymentMethod: "cash",
    createdAt: "2023-10-02T10:15:00Z",
    status: "completed",
    userId: "system"
  },
  {
    id: "B003",
    items: [
      { 
        id: "bi5", 
        billId: "B003", 
        productId: sampleProducts[3].id, 
        productPrice: sampleProducts[3].price,
        discountPercentage: sampleProducts[3].discountPercentage,
        quantity: 1, 
        total: sampleProducts[3].price * (1 - sampleProducts[3].discountPercentage / 100),
        productName: sampleProducts[3].name,
        product: sampleProducts[3] 
      },
      { 
        id: "bi6", 
        billId: "B003", 
        productId: sampleProducts[6].id, 
        productPrice: sampleProducts[6].price,
        discountPercentage: sampleProducts[6].discountPercentage,
        quantity: 1, 
        total: sampleProducts[6].price * (1 - sampleProducts[6].discountPercentage / 100),
        productName: sampleProducts[6].name,
        product: sampleProducts[6] 
      }
    ],
    subtotal: 129.98,
    tax: 10.40,
    total: 140.38,
    customerName: "Michael Johnson",
    customerPhone: "+1654987320",
    paymentMethod: "digital-wallet",
    createdAt: "2023-10-03T16:45:00Z",
    status: "completed",
    userId: "system"
  }
];

export const sampleDashboardStats: DashboardStats = {
  totalSales: 3258.75,
  todaySales: 332.57,
  lowStockItems: 3,
  outOfStockItems: 1,
  recentSales: sampleBills,
  topSellingProducts: [
    { product: sampleProducts[0], soldCount: 42 },
    { product: sampleProducts[3], soldCount: 35 },
    { product: sampleProducts[1], soldCount: 28 },
    { product: sampleProducts[2], soldCount: 22 }
  ]
};
