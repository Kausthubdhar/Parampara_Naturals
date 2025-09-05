import React from 'react';
import { TrendingUp, ShoppingCart, Package, Users, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface MobileDashboardProps {
  onNewSale?: () => void;
  onAddProduct?: () => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ onNewSale, onAddProduct }) => {
  const { state, updateProduct, showNotification } = useApp();
  const { products, sales, customers } = state;

  const stats = {
    totalSales: sales.reduce((sum, sale) => sum + sale.total, 0),
    totalOrders: sales.length,
    totalProducts: products.length,
    totalCustomers: customers.length,
  };

  const today = new Date();
  const todaySales = sales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  const quickStats = [
    { label: 'Today Sales', value: `₹${(todaySales || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' },
    { label: 'Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400', bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' },
    { label: 'Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-orange-600 dark:text-orange-400', bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20' },
    { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-purple-600 dark:text-purple-400', bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20' },
  ];

  const recentSales = sales.slice(0, 3);
  const lowStockProducts = products.filter(p => p.stock < (p.minStock || 10)).slice(0, 3);

  const handleRestock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { stock: product.stock + 50 });
      showNotification(`${product.name} restocked successfully!`, 'success');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary/10 to-primary-dark/10 border-primary/20">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text dark:text-text-dark">Welcome back! 👋</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">Here's your store overview today</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card card-hover p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.bgGradient}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{stat.label}</p>
                  <p className="text-xl font-bold text-text dark:text-text-dark">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sales */}
      <div className="card card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text dark:text-text-dark">Recent Sales</h3>
          <button className="text-sm text-primary dark:text-primary-dark font-semibold">View All</button>
        </div>
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/30 to-secondary/10 dark:from-secondary-dark/30 dark:to-secondary-dark/10 rounded-xl hover:scale-105 transition-transform duration-200">
              <div>
                <p className="text-sm font-semibold text-text dark:text-text-dark">Order #{sale.id.slice(-6)}</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{sale.customer?.name || 'Walk-in Customer'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text dark:text-text-dark">₹{sale.total}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sale.status === 'completed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {sale.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="card card-hover">
          <h3 className="text-lg font-bold text-text dark:text-text-dark mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800 hover:scale-105 transition-transform duration-200">
                <div>
                  <p className="text-sm font-semibold text-text dark:text-text-dark">{product.name}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Stock: {product.stock} {product.unit}</p>
                </div>
                <button 
                  onClick={() => handleRestock(product.id)}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full font-medium transition-colors duration-200"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card card-hover">
        <h3 className="text-lg font-bold text-text dark:text-text-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onNewSale}
            className="p-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm font-semibold">New Sale</span>
          </button>
          <button 
            onClick={onAddProduct}
            className="p-4 bg-gradient-to-r from-secondary to-secondary/80 dark:from-secondary-dark dark:to-secondary-dark/80 text-primary dark:text-primary-dark rounded-xl transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg group"
          >
            <Package className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-semibold">Add Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
