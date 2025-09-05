import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, Customer, Sale, SaleItem, Expense, Category } from '../types';
import { 
  listProducts, 
  createProduct, 
  updateProduct as updateProductDB, 
  deleteProduct as deleteProductDB,
  listCustomers,
  upsertCustomer,
  listSales,
  createSale as createSaleDB,
  listExpenses,
  createExpense as createExpenseDB
} from '../lib/db';

// Action Types
type ActionType = 
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: { id: string; updates: Partial<Customer> } }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_SALES'; payload: Sale[] }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SALE'; payload: { id: string; updates: Partial<Sale> } }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; updates: Partial<Expense> } }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'SET_MODAL'; payload: { isOpen: boolean; type: string; data?: any } };

// State Interface
interface AppState {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  categories: Category[];
  loading: boolean;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  modal: { isOpen: boolean; type: string; data?: any };
}

// Initial State
const initialState: AppState = {
  products: [],
  customers: [],
  sales: [],
  expenses: [],
  categories: [
    { id: '1', name: 'Vegetables', icon: '🥬', color: '#16a34a' },
    { id: '2', name: 'Fruits', icon: '🍎', color: '#ef4444' },
    { id: '3', name: 'Grains', icon: '🌾', color: '#f59e0b' },
    { id: '4', name: 'Dairy', icon: '🥛', color: '#3b82f6' },
  ],
  loading: false,
  notification: null,
  modal: { isOpen: false, type: '', data: null },
};

// Reducer
function appReducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      };
    
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id
            ? { ...product, ...action.payload.updates }
            : product
        ),
      };
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    
    case 'SET_CUSTOMERS':
      return {
        ...state,
        customers: action.payload,
      };
    
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [...state.customers, action.payload],
      };
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id
            ? { ...customer, ...action.payload.updates }
            : customer
        ),
      };
    
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload),
      };
    
    case 'SET_SALES':
      return {
        ...state,
        sales: action.payload,
      };
    
    case 'ADD_SALE':
      return {
        ...state,
        sales: [...state.sales, action.payload],
      };
    
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map(sale =>
          sale.id === action.payload.id
            ? { ...sale, ...action.payload.updates }
            : sale
        ),
      };
    
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter(sale => sale.id !== action.payload),
      };
    
    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload,
      };
    
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload.updates }
            : expense
        ),
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload,
      };
    
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notification: null,
      };
    
    case 'SET_MODAL':
      return {
        ...state,
        modal: action.payload,
      };
    
    default:
      return state;
  }
}

// Context Interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
  // Helper functions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  getDashboardStats: () => {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    todaySales: number;
    lowStockProducts: Product[];
  };
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [productsData, customersData, salesData, expensesData] = await Promise.all([
        listProducts(),
        listCustomers(),
        listSales(),
        listExpenses(),
      ]);

      console.log('Loaded data:', {
        products: productsData?.length || 0,
        customers: customersData?.length || 0,
        sales: salesData?.length || 0,
        expenses: expensesData?.length || 0,
      });

      dispatch({ type: 'SET_PRODUCTS', payload: productsData || [] });
      dispatch({ type: 'SET_CUSTOMERS', payload: customersData || [] });
      dispatch({ type: 'SET_SALES', payload: salesData || [] });
      dispatch({ type: 'SET_EXPENSES', payload: expensesData || [] });
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data from database', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Helper functions
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await createProduct(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      showNotification('Product added successfully!', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      showNotification('Error adding product', 'error');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await updateProductDB(id, updates);
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates: updatedProduct } });
      showNotification('Product updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification('Error updating product', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteProductDB(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      showNotification('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await upsertCustomer(customerData);
      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      showNotification('Customer added successfully!', 'success');
    } catch (error) {
      console.error('Error adding customer:', error);
      showNotification('Error adding customer', 'error');
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updatedCustomer = await upsertCustomer({ 
        id, 
        name: updates.name || '', 
        phone: updates.phone || '',
        ...updates 
      });
      dispatch({ type: 'UPDATE_CUSTOMER', payload: { id, updates: updatedCustomer } });
      showNotification('Customer updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating customer:', error);
      showNotification('Error updating customer', 'error');
    }
  };

  const deleteCustomer = (id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    showNotification('Customer deleted successfully!', 'success');
  };

  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    try {
      const newSale = await createSaleDB({
        customerId: saleData.customer?.id || null,
        paymentMethod: saleData.paymentMethod,
        items: saleData.items,
        tax: saleData.tax,
        discount: saleData.discount,
      });
      
      // Convert to our Sale format
      const formattedSale: Sale = {
        id: newSale.id,
        date: new Date(newSale.date),
        customer: saleData.customer,
        items: saleData.items,
        total: saleData.total,
        paymentMethod: saleData.paymentMethod,
        status: saleData.status,
        tax: saleData.tax,
        discount: saleData.discount,
      };
      
      dispatch({ type: 'ADD_SALE', payload: formattedSale });
      showNotification('Sale completed successfully!', 'success');
    } catch (error) {
      console.error('Error adding sale:', error);
      showNotification('Error completing sale', 'error');
    }
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    dispatch({ type: 'UPDATE_SALE', payload: { id, updates } });
    showNotification('Sale updated successfully!', 'success');
  };

  const deleteSale = (id: string) => {
    dispatch({ type: 'DELETE_SALE', payload: id });
    showNotification('Sale deleted successfully!', 'success');
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await createExpenseDB(expenseData);
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      showNotification('Expense added successfully!', 'success');
    } catch (error) {
      console.error('Error adding expense:', error);
      showNotification('Error adding expense', 'error');
    }
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: { id, updates } });
    showNotification('Expense updated successfully!', 'success');
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    showNotification('Expense deleted successfully!', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    dispatch({ type: 'SET_NOTIFICATION', payload: { message, type } });
    setTimeout(() => {
      dispatch({ type: 'CLEAR_NOTIFICATION' });
    }, 3000);
  };

  const openModal = (type: string, data?: any) => {
    dispatch({ type: 'SET_MODAL', payload: { isOpen: true, type, data } });
  };

  const closeModal = () => {
    dispatch({ type: 'SET_MODAL', payload: { isOpen: false, type: '', data: null } });
  };

  const getDashboardStats = () => {
    const totalSales = state.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = state.sales.length;
    const totalProducts = state.products.length;
    const totalCustomers = state.customers.length;
    
    const today = new Date();
    const todaySales = state.sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.toDateString() === today.toDateString();
      })
      .reduce((sum, sale) => sum + sale.total, 0);
    
    const lowStockProducts = state.products.filter(p => p.stock < (p.minStock || 10));

    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      todaySales,
      lowStockProducts,
    };
  };

  const value: AppContextType = {
    state,
    dispatch,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSale,
    updateSale,
    deleteSale,
    addExpense,
    updateExpense,
    deleteExpense,
    showNotification,
    openModal,
    closeModal,
    getDashboardStats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

