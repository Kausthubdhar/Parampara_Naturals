import React from 'react';
import { Home, ShoppingCart, Package, Users, BarChart3, Trash2, Plus, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface SidebarProps {
  currentView: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management';
  setCurrentView: (view: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management') => void;
  onNewSale?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onNewSale }) => {
  const { state } = useApp();
  const { sales, customers } = state;
  
  // Calculate live stats
  const safeSales = sales || [];
  const safeCustomers = customers || [];
  
  const today = new Date();
  const todaySales = safeSales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    })
    .reduce((sum, sale) => sum + sale.total, 0);
  
  const totalOrders = safeSales.length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'waste-management', label: 'Waste Management', icon: Trash2 },
  ] as const;

  return (
    <aside className="w-64 bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border-r border-border/50 dark:border-border-dark/50 min-h-screen hidden lg:block">
      <div className="p-6 space-y-8">
        {/* Quick Action Button */}
        <div className="relative">
          <button 
            onClick={onNewSale}
            className="w-full btn-primary flex items-center justify-center space-x-3 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Sale</span>
            <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          <div className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider mb-4 px-2">
            Navigation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-105'
                    : 'text-text-secondary dark:text-text-secondary-dark hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 hover:text-text dark:hover:text-text-dark hover:scale-105'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-secondary/50 dark:bg-secondary-dark/50 group-hover:bg-primary/20'
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'text-white' : 'group-hover:scale-110'
                  }`} />
                </div>
                <span className="font-semibold">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="pt-6 border-t border-border/30 dark:border-border-dark/30">
          <div className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider mb-4 px-2">
            Quick Stats
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Today's Sales</span>
                <span className="text-lg font-bold text-green-700 dark:text-green-300">₹{(todaySales || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Orders</span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{totalOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
