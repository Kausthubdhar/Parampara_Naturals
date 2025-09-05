import React from 'react';
import { Home, ShoppingCart, Package, Users, BarChart3, Trash2 } from 'lucide-react';

interface BottomNavigationProps {
  currentView: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management';
  setCurrentView: (view: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'waste-management', label: 'Waste', icon: Trash2 },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl border-t border-border/50 dark:border-border-dark/50 px-4 py-3 z-50">
      <div className="flex justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? 'text-primary dark:text-primary-dark scale-110'
                  : 'text-text-secondary dark:text-text-secondary-dark hover:text-text dark:hover:text-text-dark hover:scale-105'
              }`}
            >
              {isActive && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary dark:bg-primary-dark rounded-full animate-pulse"></div>
              )}
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-primary-dark/20 shadow-lg' 
                  : 'bg-transparent group-hover:bg-secondary/50 dark:group-hover:bg-secondary-dark/50'
              }`}>
                <Icon className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'text-primary dark:text-primary-dark scale-110' : 'group-hover:scale-110'
                }`} />
              </div>
              <span className="text-xs font-semibold mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
