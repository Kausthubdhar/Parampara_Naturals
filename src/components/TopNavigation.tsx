import React from 'react';
import { Home, ShoppingCart, Package, Users, BarChart3, Trash2, Plus, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface TopNavigationProps {
  currentView: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management';
  setCurrentView: (view: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management') => void;
  onNewSale?: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentView, setCurrentView, onNewSale }) => {
  const { state } = useApp();
  const { sales } = state;
  
  // Calculate live stats
  const safeSales = sales || [];
  
  const today = new Date();
  const todaySales = safeSales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    })
    .reduce((sum, sale) => sum + sale.total, 0);
  
  const todayOrders = safeSales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    }).length;

  // Define unique color themes for each tab
  const tabThemes = {
    dashboard: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-blue-50 to-blue-100',
      dark: 'from-blue-900/20 to-blue-800/20',
      text: 'text-blue-700 dark:text-blue-300',
      hover: 'hover:from-blue-400 hover:to-blue-500',
      shadow: 'shadow-blue-500/25',
      border: 'border-blue-200 dark:border-blue-700'
    },
    sales: {
      primary: 'from-green-500 to-green-600',
      secondary: 'from-green-50 to-green-100',
      dark: 'from-green-900/20 to-green-800/20',
      text: 'text-green-700 dark:text-green-300',
      hover: 'hover:from-green-400 hover:to-green-500',
      shadow: 'shadow-green-500/25',
      border: 'border-green-200 dark:border-green-700'
    },
    products: {
      primary: 'from-purple-500 to-purple-600',
      secondary: 'from-purple-50 to-purple-100',
      dark: 'from-purple-900/20 to-purple-800/20',
      text: 'text-purple-700 dark:text-purple-300',
      hover: 'hover:from-purple-400 hover:to-purple-500',
      shadow: 'shadow-purple-500/25',
      border: 'border-purple-200 dark:border-purple-700'
    },
    customers: {
      primary: 'from-orange-500 to-orange-600',
      secondary: 'from-orange-50 to-orange-100',
      dark: 'from-orange-900/20 to-orange-800/20',
      text: 'text-orange-700 dark:text-orange-300',
      hover: 'hover:from-orange-400 hover:to-orange-500',
      shadow: 'shadow-orange-500/25',
      border: 'border-orange-200 dark:border-orange-700'
    },
    analytics: {
      primary: 'from-indigo-500 to-indigo-600',
      secondary: 'from-indigo-50 to-indigo-100',
      dark: 'from-indigo-900/20 to-indigo-800/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      hover: 'hover:from-indigo-400 hover:to-indigo-500',
      shadow: 'shadow-indigo-500/25',
      border: 'border-indigo-200 dark:border-indigo-700'
    },
    'waste-management': {
      primary: 'from-red-500 to-red-600',
      secondary: 'from-red-50 to-red-100',
      dark: 'from-red-900/20 to-red-800/20',
      text: 'text-red-700 dark:text-red-300',
      hover: 'hover:from-red-400 hover:to-red-500',
      shadow: 'shadow-red-500/25',
      border: 'border-red-200 dark:border-red-700'
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'waste-management', label: 'Waste Management', icon: Trash2 },
  ] as const;

  return (
    <nav className="bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl border-b border-border/50 dark:border-border-dark/50 sticky top-0 z-40">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Quick Action Button - Hidden on small screens */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={onNewSale}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-lg hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">New Sale</span>
                <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Navigation Tabs - Responsive */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const theme = tabThemes[item.id];
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 group whitespace-nowrap ${
                    isActive
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg scale-105 ${theme.shadow}`
                      : `text-text-secondary dark:text-text-secondary-dark hover:bg-gradient-to-r ${theme.hover} hover:text-white hover:scale-105 hover:shadow-lg hover:${theme.shadow}`
                  }`}
                >
                  <div className={`p-1.5 rounded-md transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-secondary/50 dark:bg-secondary-dark/50 group-hover:bg-white/20'
                  }`}>
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${
                      isActive ? 'text-white' : 'group-hover:scale-110 group-hover:text-white'
                    }`} />
                  </div>
                  <span className="font-semibold text-sm hidden sm:block">{item.label}</span>
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Stats - Hidden on smaller screens */}
          <div className="hidden xl:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700 dark:text-green-300">Today's Sales</div>
                  <div className="text-sm font-bold text-green-700 dark:text-green-300">₹{(todaySales || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="text-center">
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Orders</div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{todayOrders}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
