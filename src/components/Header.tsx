import React from 'react';
import { Bell, ShoppingBag, User, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onNewSale?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewSale }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border-b border-border/50 dark:border-border-dark/50 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-2 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">Parampara Naturals</h1>
            <p className="text-text-secondary dark:text-text-secondary-dark text-xs sm:text-sm font-medium">Organic Store Management</p>
          </div>
          <div className="block sm:hidden">
            <h1 className="text-lg font-bold gradient-text">PN</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          <button className="btn-ghost relative group">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></span>
            <div className="absolute top-full right-0 mt-2 w-48 sm:w-64 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-border/50 dark:border-border-dark/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium text-text dark:text-text-dark">Notifications</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">No new notifications</p>
            </div>
          </button>
          <button 
            onClick={onNewSale}
            className="btn-ghost"
            title="Quick Sale"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="btn-ghost">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
