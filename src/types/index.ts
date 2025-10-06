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
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address?: string;
  ageGroup?: '0-12' | '13-17' | '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  totalPurchases: number;
  lastPurchase?: Date;
  // Computed property for backward compatibility
  name?: string;
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
  receiptId?: string; // Short 8-character receipt ID for display
  date: Date;
  customer?: Customer;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'completed' | 'pending' | 'cancelled' | 'partial';
  tax?: number;
  discount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  cashReceived?: number;
  changeGiven?: number;
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

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'achievement';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
}
