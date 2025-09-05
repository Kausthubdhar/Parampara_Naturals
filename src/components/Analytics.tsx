import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Filter, DollarSign, Users, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useApp } from '../contexts/AppContext';

const Analytics: React.FC = () => {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'customers' | 'products'>('sales');

  const { sales, products, customers, expenses } = state;

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const topProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const categoryData = [
    { name: 'Vegetables', value: products.filter(p => p.category === 'Vegetables').length, color: '#4CAF50' },
    { name: 'Fruits', value: products.filter(p => p.category === 'Fruits').length, color: '#FF9800' },
    { name: 'Grains', value: products.filter(p => p.category === 'Grains').length, color: '#8D6E63' },
    { name: 'Dairy', value: products.filter(p => p.category === 'Dairy').length, color: '#3b82f6' },
  ];

  // Generate sales data for charts
  const salesData = Array.from({ length: 16 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (15 - i));
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

  const expenseCategories = [
    { name: 'Inventory', value: expenses.filter(e => e.category === 'Inventory Purchase').reduce((sum, e) => sum + e.amount, 0), color: '#4CAF50' },
    { name: 'Rent', value: expenses.filter(e => e.category === 'Rent').reduce((sum, e) => sum + e.amount, 0), color: '#FF9800' },
    { name: 'Staff', value: expenses.filter(e => e.category === 'Staff Wages').reduce((sum, e) => sum + e.amount, 0), color: '#8D6E63' },
    { name: 'Utilities', value: expenses.filter(e => e.category === 'Utilities').reduce((sum, e) => sum + e.amount, 0), color: '#795548' },
  ];

  const paymentMethodData = [
    { name: 'Cash', value: sales.filter(s => s.paymentMethod === 'cash').length, color: '#4CAF50' },
    { name: 'Card', value: sales.filter(s => s.paymentMethod === 'card').length, color: '#FF9800' },
    { name: 'UPI', value: sales.filter(s => s.paymentMethod === 'upi').length, color: '#8D6E63' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2 px-6 py-3">
          <Download className="h-5 w-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Time Range Filter */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
            </div>
            <div className="flex space-x-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="input-field py-2 min-w-[150px]"
            >
              <option value="sales">Sales Metrics</option>
              <option value="customers">Customer Metrics</option>
              <option value="products">Product Metrics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold text-text">₹{(totalRevenue || 0).toLocaleString()}</p>
          <p className="text-gray-600">Total Revenue</p>
          <div className="mt-2 flex items-center justify-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12.5% from last month
          </div>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-accent-orange/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-accent-orange" />
          </div>
          <p className="text-3xl font-bold text-accent-orange">₹{(totalExpenses || 0).toLocaleString()}</p>
          <p className="text-gray-600">Total Expenses</p>
          <div className="mt-2 flex items-center justify-center text-sm text-red-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +8.2% from last month
          </div>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-accent-brown/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-accent-brown" />
          </div>
          <p className="text-3xl font-bold text-accent-brown">₹{(netProfit || 0).toLocaleString()}</p>
          <p className="text-gray-600">Net Profit</p>
          <div className="mt-2 flex items-center justify-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +15.3% from last month
          </div>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-secondary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">{profitMargin.toFixed(1)}%</p>
          <p className="text-gray-600">Profit Margin</p>
          <div className="mt-2 flex items-center justify-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +2.1% from last month
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Sales Trend (Last 16 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Area type="monotone" dataKey="amount" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Daily Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* More Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Categories Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Product Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Bar dataKey="value" fill="#8D6E63" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Payment Methods Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            {paymentMethodData.map((payment) => (
              <div key={payment.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: payment.color }}></div>
                  <span className="font-medium text-text">{payment.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{payment.value}</p>
                  <p className="text-xs text-gray-600">orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Top Products by Stock</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary text-sm">₹{product.price}</p>
                  <p className="text-xs text-gray-600">{product.stock} {product.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text">Total Customers</p>
                <p className="text-sm text-gray-600">Active customer base</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{customers.length}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text">Average Order Value</p>
                <p className="text-sm text-gray-600">Per customer transaction</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent-orange">
                  ₹{Math.round(totalRevenue / customers.length)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text">Repeat Customers</p>
                <p className="text-sm text-gray-600">Loyal customer percentage</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent-brown">
                  {Math.round((customers.filter(c => c.totalPurchases > 1000).length / customers.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Quick Reports</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-6 bg-primary/10 rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/20 transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <p className="text-sm font-medium text-primary">Sales Report</p>
            </div>
          </button>
          <button className="p-6 bg-accent-orange/10 rounded-lg border-2 border-dashed border-accent-orange/30 hover:bg-accent-orange/20 transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-3">💰</div>
              <p className="text-sm font-medium text-accent-orange">Profit Report</p>
            </div>
          </button>
          <button className="p-6 bg-accent-brown/10 rounded-lg border-2 border-dashed border-accent-brown/30 hover:bg-accent-brown/20 transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-3">👥</div>
              <p className="text-sm font-medium text-accent-brown">Customer Report</p>
            </div>
          </button>
          <button className="p-6 bg-secondary rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/20 transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-3">📦</div>
              <p className="text-sm font-medium text-primary">Inventory Report</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
