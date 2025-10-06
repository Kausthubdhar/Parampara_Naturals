import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../../contexts/AppContext';

const AnalyticsScreen: React.FC = () => {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">Analytics</h2>
        <button className="btn-secondary flex items-center space-x-2 px-4 py-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Time Range Filter */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
        </div>
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-bold text-text">₹{(totalRevenue || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-600">Total Revenue</p>
        </div>

        <div className="card text-center">
          <div className="p-3 bg-accent-orange/10 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-accent-orange" />
          </div>
          <p className="text-lg font-bold text-text">₹{(totalExpenses || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-600">Total Expenses</p>
        </div>

        <div className="card text-center">
          <div className="p-3 bg-accent-brown/10 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-accent-brown" />
          </div>
          <p className="text-lg font-bold text-text">₹{(netProfit || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-600">Net Profit</p>
        </div>

        <div className="card text-center">
          <div className="p-3 bg-secondary rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-bold text-text">{profitMargin.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">Profit Margin</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
            <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Categories Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Product Categories</h3>
        <ResponsiveContainer width="100%" height={250}>
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
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={expenseCategories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
            <Bar dataKey="value" fill="#FF9800" />
          </BarChart>
        </ResponsiveContainer>
      </div>

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

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Quick Reports</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 bg-primary/10 rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/20 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-primary">Sales Report</p>
            </div>
          </button>
          <button className="p-4 bg-accent-orange/10 rounded-lg border-2 border-dashed border-accent-orange/30 hover:bg-accent-orange/20 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm font-medium text-accent-orange">Profit Report</p>
            </div>
          </button>
          <button className="p-4 bg-accent-brown/10 rounded-lg border-2 border-dashed border-accent-brown/30 hover:bg-accent-brown/20 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium text-accent-brown">Customer Report</p>
            </div>
          </button>
          <button className="p-4 bg-secondary rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/20 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm font-medium text-primary">Inventory Report</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
