import { Product, Customer, Sale, SaleItem, Expense, Category } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Organic Vegetables', icon: '🥬', color: '#4CAF50' },
  { id: '2', name: 'Fresh Fruits', icon: '🍎', color: '#FF9800' },
  { id: '3', name: 'Grains & Pulses', icon: '🌾', color: '#8D6E63' },
  { id: '4', name: 'Spices & Herbs', icon: '🌿', color: '#795548' },
  { id: '5', name: 'Dairy Products', icon: '🥛', color: '#FFF9C4' },
  { id: '6', name: 'Honey & Jams', icon: '🍯', color: '#FFB74D' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    price: 80,
    category: 'Organic Vegetables',
    stock: 25,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop',
    description: 'Fresh organic tomatoes from local farms',
    minStock: 5
  },
  {
    id: '2',
    name: 'Fresh Bananas',
    price: 60,
    category: 'Fresh Fruits',
    stock: 40,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    description: 'Sweet organic bananas',
    minStock: 8
  },
  {
    id: '3',
    name: 'Basmati Rice',
    price: 120,
    category: 'Grains & Pulses',
    stock: 100,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    description: 'Premium quality basmati rice',
    minStock: 20
  },
  {
    id: '4',
    name: 'Organic Turmeric',
    price: 200,
    category: 'Spices & Herbs',
    stock: 15,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
    description: 'Pure organic turmeric powder',
    minStock: 3
  },
  {
    id: '5',
    name: 'Fresh Milk',
    price: 60,
    category: 'Dairy Products',
    stock: 50,
    unit: 'l',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    description: 'Pure cow milk from local dairy',
    minStock: 10
  },
  {
    id: '6',
    name: 'Organic Honey',
    price: 400,
    category: 'Honey & Jams',
    stock: 20,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    description: 'Pure organic honey from forest',
    minStock: 5
  },
  {
    id: '7',
    name: 'Organic Onions',
    price: 40,
    category: 'Organic Vegetables',
    stock: 30,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
    description: 'Fresh organic onions',
    minStock: 6
  },
  {
    id: '8',
    name: 'Fresh Oranges',
    price: 100,
    category: 'Fresh Fruits',
    stock: 35,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop',
    description: 'Sweet and juicy oranges',
    minStock: 7
  },
  {
    id: '9',
    name: 'Organic Ginger',
    price: 150,
    category: 'Spices & Herbs',
    stock: 12,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
    description: 'Fresh organic ginger root',
    minStock: 3
  },
  {
    id: '10',
    name: 'Organic Potatoes',
    price: 50,
    category: 'Organic Vegetables',
    stock: 45,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
    description: 'Fresh organic potatoes',
    minStock: 8
  }
];

export const customers: Customer[] = [
  {
    id: '1',
    firstName: 'Priya',
    lastName: 'Sharma',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@email.com',
    address: '123 Green Park, Delhi',
    totalPurchases: 12500,
    lastPurchase: new Date('2024-01-15')
  },
  {
    id: '2',
    firstName: 'Rajesh',
    name: 'Rajesh',
    phone: '+91 87654 32109',
    email: 'rajesh.kumar@email.com',
    address: '456 Eco Colony, Mumbai',
    totalPurchases: 8900,
    lastPurchase: new Date('2024-01-14')
  },
  {
    id: '3',
    firstName: 'Anita',
    lastName: 'Patel',
    name: 'Anita Patel',
    phone: '+91 76543 21098',
    email: 'anita.patel@email.com',
    address: '789 Nature Lane, Bangalore',
    totalPurchases: 15600,
    lastPurchase: new Date('2024-01-16')
  },
  {
    id: '4',
    firstName: 'Suresh',
    name: 'Suresh',
    phone: '+91 65432 10987',
    email: 'suresh.reddy@email.com',
    address: '321 Organic Street, Hyderabad',
    totalPurchases: 7200,
    lastPurchase: new Date('2024-01-13')
  },
  {
    id: '5',
    firstName: 'Meera',
    lastName: 'Singh',
    name: 'Meera Singh',
    phone: '+91 54321 09876',
    email: 'meera.singh@email.com',
    address: '654 Green Valley, Chennai',
    totalPurchases: 9800,
    lastPurchase: new Date('2024-01-12')
  }
];

export const sales: Sale[] = [
  {
    id: '1',
    date: new Date('2024-01-16'),
    customer: customers[0],
    items: [
      {
        productId: products[0].id,
        productName: products[0].name,
        price: 80,
        quantity: 2,
        total: 160
      },
      {
        productId: products[1].id,
        productName: products[1].name,
        price: 60,
        quantity: 1,
        total: 60
      }
    ],
    total: 250,
    paymentMethod: 'upi',
    status: 'completed'
  },
  {
    id: '2',
    date: new Date('2024-01-15'),
    customer: customers[1],
    items: [
      {
        productId: products[2].id,
        productName: products[2].name,
        price: 120,
        quantity: 1,
        total: 120
      },
      {
        productId: products[4].id,
        productName: products[4].name,
        price: 60,
        quantity: 1,
        total: 60
      }
    ],
    total: 720,
    paymentMethod: 'card',
    status: 'completed'
  },
  {
    id: '3',
    date: new Date('2024-01-14'),
    customer: customers[2],
    items: [
      {
        productId: products[3].id,
        productName: products[3].name,
        price: 200,
        quantity: 1,
        total: 200
      },
      {
        productId: products[5].id,
        productName: products[5].name,
        price: 400,
        quantity: 1,
        total: 400
      }
    ],
    total: 300,
    paymentMethod: 'cash',
    status: 'completed'
  }
];

export const expenses: Expense[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    category: 'Inventory Purchase',
    amount: 15000,
    description: 'Organic vegetables from local farmers'
  },
  {
    id: '2',
    date: new Date('2024-01-10'),
    category: 'Utilities',
    amount: 2500,
    description: 'Electricity and water bills'
  },
  {
    id: '3',
    date: new Date('2024-01-05'),
    category: 'Rent',
    amount: 15000,
    description: 'Monthly store rent'
  },
  {
    id: '4',
    date: new Date('2024-01-01'),
    category: 'Staff Wages',
    amount: 20000,
    description: 'January staff salaries'
  }
];

export const salesData: { date: string; amount: number; orders: number }[] = [
  { date: '2024-01-01', amount: 8500, orders: 12 },
  { date: '2024-01-02', amount: 9200, orders: 15 },
  { date: '2024-01-03', amount: 7800, orders: 11 },
  { date: '2024-01-04', amount: 10500, orders: 18 },
  { date: '2024-01-05', amount: 9500, orders: 16 },
  { date: '2024-01-06', amount: 12000, orders: 20 },
  { date: '2024-01-07', amount: 8800, orders: 14 },
  { date: '2024-01-08', amount: 10200, orders: 17 },
  { date: '2024-01-09', amount: 7600, orders: 13 },
  { date: '2024-01-10', amount: 8900, orders: 15 },
  { date: '2024-01-11', amount: 11400, orders: 19 },
  { date: '2024-01-12', amount: 9800, orders: 16 },
  { date: '2024-01-13', amount: 8200, orders: 14 },
  { date: '2024-01-14', amount: 9600, orders: 17 },
  { date: '2024-01-15', amount: 11000, orders: 18 },
  { date: '2024-01-16', amount: 8700, orders: 15 }
];
