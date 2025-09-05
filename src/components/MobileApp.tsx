import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import BottomNavigation from './mobile/BottomNavigation';
import MobileDashboard from './mobile/MobileDashboard';

import InventoryScreen from './mobile/InventoryScreen';
import CustomersScreen from './mobile/CustomersScreen';
import AnalyticsScreen from './mobile/AnalyticsScreen';

interface MobileAppProps {
  currentView: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management';
  setCurrentView: (view: 'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management') => void;
  onNewSale?: () => void;
  onAddProduct?: () => void;
}

const MobileApp: React.FC<MobileAppProps> = ({ currentView, setCurrentView, onNewSale, onAddProduct }) => {

  const { theme } = useTheme();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MobileDashboard onNewSale={onNewSale} onAddProduct={onAddProduct} />;
      case 'sales':
        return <div className="p-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Management</h3>
            <p className="text-gray-500 mb-4">View and manage your sales</p>
            <button 
              onClick={onNewSale}
              className="btn-primary"
            >
              Create New Sale
            </button>
          </div>
        </div>;
      case 'products':
        return <InventoryScreen onAddProduct={onAddProduct} />;
      case 'customers':
        return <CustomersScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'waste-management':
        return <div className="p-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Waste Management</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Track and manage product waste</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Mobile view coming soon</p>
          </div>
        </div>;
      default:
        return <MobileDashboard onNewSale={onNewSale} onAddProduct={onAddProduct} />;
    }
  };



  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors duration-200">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl border-b border-border/50 dark:border-border-dark/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">Parampara Naturals</h1>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium">Organic Store</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button 
              onClick={onAddProduct}
              className="btn-ghost"
              title="Add Product"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {renderCurrentView()}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={onNewSale}
        className="fixed bottom-20 right-4 w-16 h-16 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 pulse-glow group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default MobileApp;
