export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pack';
  image?: string;
  description?: string;
  minStock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  loyaltyPoints: number;
  lastPurchase?: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  date: Date;
  customer?: Customer;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'completed' | 'pending' | 'cancelled';
  tax?: number;
  discount?: number;
}

export interface Expense {
  id: string;
  date: Date;
  category: string;
  amount: number;
  description: string;
  receipt?: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  topProducts: Product[];
  recentSales: Sale[];
  lowStockAlerts: Product[];
}

export interface SalesData {
  date: string;
  amount: number;
  orders: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
