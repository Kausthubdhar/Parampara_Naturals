import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Sparkles, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../contexts/AppContext';

const Dashboard: React.FC = () => {
  const { state, updateProduct, showNotification } = useApp();
  const { products, sales, customers, loading } = state;
  
  // Add null checks to prevent runtime errors
  const safeProducts = products || [];
  const safeSales = sales || [];
  const safeCustomers = customers || [];

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-secondary-dark">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  const stats = {
    totalSales: safeSales.reduce((sum, sale) => sum + sale.total, 0),
    totalOrders: safeSales.length,
    totalProducts: safeProducts.length,
    totalCustomers: safeCustomers.length,
  };

  const today = new Date();
  const todaySales = safeSales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  const metrics = [
    {
      title: 'Total Sales',
      value: `₹${(stats.totalSales || 0).toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toString(),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Package,
      color: 'text-orange-600 dark:text-orange-400',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
  ];

  // Generate sales data for charts
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const daySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: daySales.reduce((sum, sale) => sum + sale.total, 0),
      orders: daySales.length,
    };
  });

  const handleRestock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { stock: product.stock + 50 });
      showNotification(`${product.name} restocked successfully!`, 'success');
    }
  };

  const lowStockProducts = safeProducts.filter(p => p.stock < (p.minStock || 10));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
            <Sparkles className="w-8 h-8" />
            Dashboard
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark text-lg mt-2">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-xl">
            <Activity className="w-6 h-6 text-primary dark:text-primary-dark" />
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Last updated</p>
            <p className="text-sm font-semibold text-text dark:text-text-dark">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="card card-hover group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.bgGradient}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{metric.title}</p>
                  <p className="text-2xl font-bold text-text dark:text-text-dark">{metric.value}</p>
                </div>
              </div>
              <div className="flex items-center">
                {metric.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                )}
                <span className={`text-sm font-semibold ${
                  metric.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-text-secondary dark:text-text-secondary-dark ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Sales Trend */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Sales Amount Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Daily Sales</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                className="text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7280"
                className="text-xs"
                tickFormatter={(value) => `₹${value}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`₹${value}`, 'Amount']}
                contentStyle={{
                  backgroundColor: 'var(--tw-bg-card)',
                  border: '1px solid var(--tw-border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#4CAF50" 
                strokeWidth={3}
                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#4CAF50', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Orders */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Daily Orders</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Order Count</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                className="text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7280"
                className="text-xs"
                tickFormatter={(value) => `${value}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [value, 'Orders']}
                contentStyle={{
                  backgroundColor: 'var(--tw-bg-card)',
                  border: '1px solid var(--tw-border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="orders" 
                fill="url(#primaryGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <div className="card card-hover">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-6">Top Products</h3>
          <div className="space-y-4">
            {safeProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/30 to-secondary/10 dark:from-secondary-dark/30 dark:to-secondary-dark/10 rounded-xl hover:scale-105 transition-transform duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text dark:text-text-dark">{product.name}</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{product.category}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary dark:text-primary-dark">₹{product.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card card-hover">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-6">Recent Sales</h3>
          <div className="space-y-4">
            {safeSales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:scale-105 transition-transform duration-200">
                <div>
                  <p className="text-sm font-semibold text-text dark:text-text-dark">Order #{sale.id?.slice(-6) || 'N/A'}</p>
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
        <div className="card card-hover">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-6">Low Stock Alerts</h3>
          <div className="space-y-4">
            {lowStockProducts.slice(0, 5).map((product) => (
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
            {lowStockProducts.length === 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">All products are well stocked! 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
