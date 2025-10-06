import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Sparkles, Activity, Calendar, UserCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import DashboardFilters, { FilterOptions } from './DashboardFilters';
import { filterSalesData, getFilteredStats } from '../lib/dashboardUtils';
import { getWeeklySalesPattern, getHourlySalesPattern, getDayHourHeatMapData, getAgeGroupAnalysis, getCustomerInsights, getDateRange } from '../lib/dashboardAnalytics';

export interface DashboardTemplateProps {
  template: 'compact' | 'detailed' | 'analytics';
  stats: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  salesData: Array<{
    date: string;
    amount: number;
    orders: number;
  }>;
  products: any[];
  sales: any[];
  customers: any[];
  lowStockProducts: any[];
  userName: string;
  storeName: string;
  onRestock: (productId: string) => void;
}

const CompactDashboard: React.FC<DashboardTemplateProps> = ({
  stats,
  salesData,
  products,
  sales,
  lowStockProducts,
  userName,
  storeName,
  onRestock
}) => {
  const metrics = [
    {
      title: 'Total Sales',
      value: `₹${(stats.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-orange-600 dark:text-orange-400',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-gradient-to-r from-primary to-primary-dark rounded-md shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text dark:text-text-dark">
              Business Overview
            </h1>
          </div>
          <p className="text-text-secondary dark:text-text-secondary-dark">
            {userName 
              ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${userName}. Your ${storeName} summary.`
              : `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}. Your business summary.`
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Last updated</p>
          <p className="text-sm font-semibold text-text dark:text-text-dark">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Compact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="card p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.bgGradient}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{metric.title}</p>
                  <p className="text-lg font-bold text-text dark:text-text-dark">{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Sales Chart */}
      <div className="card p-4">
        <h3 className="text-lg font-bold text-text dark:text-text-dark mb-4">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
            <XAxis dataKey="date" stroke="#6B7280" className="text-xs" />
            <YAxis stroke="#6B7280" className="text-xs" tickFormatter={(value) => `₹${value}`} />
            <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
            <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="card p-4 border-l-4 border-red-500">
          <h3 className="text-lg font-bold text-text dark:text-text-dark mb-3">Low Stock Alerts</h3>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <span className="text-sm font-medium text-text dark:text-text-dark">{product.name}</span>
                <button 
                  onClick={() => onRestock(product.id)}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailedDashboard: React.FC<DashboardTemplateProps> = ({
  stats,
  salesData,
  products,
  sales,
  customers,
  lowStockProducts,
  userName,
  storeName,
  onRestock
}) => {
  // Individual filters for each chart
  const [salesTrendFilters, setSalesTrendFilters] = useState<FilterOptions>({
    timeRange: '30d',
    category: 'all',
    status: 'all',
    customerType: 'all',
  });
  const [ordersFilters, setOrdersFilters] = useState<FilterOptions>({
    timeRange: '30d',
    category: 'all',
    status: 'all',
    customerType: 'all',
  });
  const [showSalesFilters, setShowSalesFilters] = useState(false);
  const [showOrdersFilters, setShowOrdersFilters] = useState(false);
  const [weeklyTimeView, setWeeklyTimeView] = useState<'daily' | 'hourly' | 'heatmap'>('daily');
  const [timeRange, setTimeRange] = useState<'current_week' | 'current_month' | 'current_year' | 'last_week' | 'last_month' | 'last_year' | 'custom'>('current_week');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Get filtered data for each chart
  const salesTrendData = filterSalesData(sales, products, salesTrendFilters);
  const ordersData = filterSalesData(sales, products, ordersFilters);
  const filteredStats = getFilteredStats(sales, products, salesTrendFilters); // Use sales trend filters for overall stats

  // Calculate date range
  const { startDate, endDate } = timeRange === 'custom' && customStartDate && customEndDate
    ? getDateRange('custom', new Date(customStartDate), new Date(customEndDate))
    : getDateRange(timeRange);

  // Analytics data for new charts with date filtering
  const weeklySalesData = getWeeklySalesPattern(sales, startDate, endDate);
  const hourlySalesData = getHourlySalesPattern(sales, startDate, endDate);
  const dayHourHeatMapData = getDayHourHeatMapData(sales, startDate, endDate);
  const ageGroupData = getAgeGroupAnalysis(sales, customers);
  const customerInsights = getCustomerInsights(sales, customers);

  // Color schemes for charts
  const weeklyColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548'];
  const ageGroupColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  // Heat map color function
  const getHeatMapColor = (intensity: number) => {
    if (intensity === 0) return '#f8f9fa';
    if (intensity < 0.2) return '#e3f2fd';
    if (intensity < 0.4) return '#bbdefb';
    if (intensity < 0.6) return '#90caf9';
    if (intensity < 0.8) return '#64b5f6';
    return '#2196f3';
  };

  // Custom Heat Map Component
  const HeatMapComponent = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: '60px repeat(24, 1fr)' }}>
          {/* Header row with hours */}
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2"></div>
          {hours.map(hour => (
            <div key={hour} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
              {hour === 0 ? '12A' : hour < 12 ? `${hour}A` : hour === 12 ? '12P' : `${hour-12}P`}
            </div>
          ))}
          
          {/* Data rows */}
          {days.map(day => (
            <React.Fragment key={day}>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 py-2 pr-2 text-right">
                {day.slice(0, 3)}
              </div>
              {hours.map(hour => {
                const data = dayHourHeatMapData.find(d => d.day === day && d.hour === hour);
                const intensity = data?.intensity || 0;
                const sales = data?.sales || 0;
                const orders = data?.orders || 0;
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="w-6 h-6 rounded-sm border border-gray-200 dark:border-gray-600 cursor-pointer group relative"
                    style={{ backgroundColor: getHeatMapColor(intensity) }}
                    title={`${day} ${hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}: ₹${sales.toLocaleString()} (${orders} orders)`}
                  >
                    {intensity > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
          <div className="flex space-x-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-sm border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: getHeatMapColor(intensity) }}
              ></div>
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
        </div>
      </div>
    );
  };
  // Helper function to calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return null; // No previous data to compare
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      type: change >= 0 ? 'positive' as const : 'negative' as const
    };
  };

  // Calculate previous month data for comparison
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const previousMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === previousMonth && saleDate.getFullYear() === previousYear;
  });

  const currentMonthOrders = currentMonthSales.length;
  const previousMonthOrders = previousMonthSales.length;
  const currentMonthSalesTotal = currentMonthSales.reduce((sum, sale) => sum + sale.total, 0);
  const previousMonthSalesTotal = previousMonthSales.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate changes
  const salesChange = calculatePercentageChange(currentMonthSalesTotal, previousMonthSalesTotal);
  const ordersChange = calculatePercentageChange(currentMonthOrders, previousMonthOrders);
  const productsChange = null as { value: string; type: 'positive' | 'negative' } | null; // Products don't have historical data easily available
  const customersChange = null as { value: string; type: 'positive' | 'negative' } | null; // Customers don't have historical data easily available

  const metrics = [
    {
      title: 'Total Sales',
      value: `₹${filteredStats.totalSales.toLocaleString()}`,
      change: filteredStats.growthRate ? `${filteredStats.growthRate > 0 ? '+' : ''}${filteredStats.growthRate.toFixed(1)}%` : null,
      changeType: filteredStats.growthRate > 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    },
    {
      title: 'Orders',
      value: filteredStats.totalOrders.toString(),
      change: null,
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: 'Avg Order Value',
      value: `₹${filteredStats.averageOrderValue.toFixed(0)}`,
      change: null,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      change: null,
      changeType: 'positive',
      icon: Package,
      color: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-sm">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text dark:text-text-dark">
              Business Overview
            </h1>
          </div>
          <p className="text-text-secondary dark:text-text-secondary-dark text-lg">
            {userName 
              ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${userName}. Here's your ${storeName} performance summary.`
              : `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}. Here's your business performance summary.`
            }
          </p>
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
              {metric.change ? (
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
              ) : (
                <div className="flex items-center">
                  <span className="text-sm text-text-secondary dark:text-text-secondary-dark">No previous data</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Grid - 2x2 Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Sales Trend */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Sales Amount Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Daily Sales</span>
            </div>
          </div>
          
          {/* Sales Trend Filters */}
          <div className="mb-4">
            <DashboardFilters
              filters={salesTrendFilters}
              onFiltersChange={setSalesTrendFilters}
              categories={products.map(p => ({ id: p.id, name: p.category }))}
              showFilters={showSalesFilters}
              onToggleFilters={() => setShowSalesFilters(!showSalesFilters)}
            />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" className="text-xs" />
              <YAxis stroke="#6B7280" className="text-xs" tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Orders */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Daily Orders</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Order Count</span>
            </div>
          </div>
          
          {/* Orders Filters */}
          <div className="mb-4">
            <DashboardFilters
              filters={ordersFilters}
              onFiltersChange={setOrdersFilters}
              categories={products.map(p => ({ id: p.id, name: p.category }))}
              showFilters={showOrdersFilters}
              onToggleFilters={() => setShowOrdersFilters(!showOrdersFilters)}
            />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" className="text-xs" />
              <YAxis stroke="#6B7280" className="text-xs" />
              <Tooltip />
              <Bar dataKey="orders" fill="#4CAF50" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Sales Pattern */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Sales Pattern Analysis</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                {weeklyTimeView === 'daily' ? 'Day of Week' : weeklyTimeView === 'hourly' ? 'Hour of Day' : 'Day-Hour Heat Map'}
              </span>
            </div>
          </div>
          
          {/* Time View Toggle */}
          <div className="mb-4 flex items-center justify-center">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
              <button
                onClick={() => setWeeklyTimeView('daily')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  weeklyTimeView === 'daily'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setWeeklyTimeView('hourly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  weeklyTimeView === 'hourly'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Hourly
              </button>
              <button
                onClick={() => setWeeklyTimeView('heatmap')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  weeklyTimeView === 'heatmap'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Heat Map
              </button>
            </div>
          </div>
          
          {/* Time Range Controls */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range</h4>
              <button
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {showCustomDatePicker ? 'Hide Custom' : 'Custom Range'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { value: 'current_week', label: 'This Week' },
                { value: 'current_month', label: 'This Month' },
                { value: 'current_year', label: 'This Year' },
                { value: 'last_week', label: 'Last Week' },
                { value: 'last_month', label: 'Last Month' },
                { value: 'last_year', label: 'Last Year' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTimeRange(option.value as any);
                    setShowCustomDatePicker(false);
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeRange === option.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {showCustomDatePicker && (
              <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (customStartDate && customEndDate) {
                        setTimeRange('custom');
                      }
                    }}
                    disabled={!customStartDate || !customEndDate}
                    className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing data from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
            </div>
          </div>
          
          {/* Insights Display */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            {weeklyTimeView === 'daily' ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300 font-medium">Peak Day: {customerInsights.peakDay}</span>
                <span className="text-blue-600 dark:text-blue-400">Low Day: {customerInsights.lowDay}</span>
              </div>
            ) : weeklyTimeView === 'hourly' ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300 font-medium">Peak Hour: {customerInsights.peakHour}</span>
                <span className="text-blue-600 dark:text-blue-400">Low Hour: {customerInsights.lowHour}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300 font-medium">Peak: {customerInsights.peakDay} {customerInsights.peakHour}</span>
                <span className="text-blue-600 dark:text-blue-400">Pattern: Day-Hour Analysis</span>
              </div>
            )}
          </div>
          
          {weeklyTimeView === 'heatmap' ? (
            <div className="h-80 overflow-x-auto">
              <HeatMapComponent />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTimeView === 'hourly' ? hourlySalesData : weeklySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                <XAxis 
                  dataKey={weeklyTimeView === 'hourly' ? "timeLabel" : "day"} 
                  stroke="#6B7280" 
                  className="text-xs"
                  angle={weeklyTimeView === 'hourly' ? -45 : 0}
                  textAnchor={weeklyTimeView === 'hourly' ? "end" : "middle"}
                  height={weeklyTimeView === 'hourly' ? 60 : 30}
                />
                <YAxis stroke="#6B7280" className="text-xs" tickFormatter={(value) => `₹${value}`} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                <Bar dataKey="sales" fill="#2196F3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Customer Age Group Analysis */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Customer Age Groups</h3>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Demographics</span>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700 dark:text-purple-300 font-medium">Most Active: {customerInsights.mostActiveAgeGroup}</span>
              <span className="text-purple-600 dark:text-purple-400">Dominant: {customerInsights.dominantAgeGroup}</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageGroupData.filter(group => group.customers > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ ageGroup, customers, percent }) => `${ageGroup}: ${customers} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="customers"
              >
                {ageGroupData.filter(group => group.customers > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ageGroupColors[index % ageGroupColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, 'Customers']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <div className="card card-hover">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-6">Top Products</h3>
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/30 to-secondary/10 dark:from-secondary-dark/30 dark:to-secondary-dark/10 rounded-xl">
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
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-text dark:text-text-dark">Order #{sale.receiptId || sale.id}</p>
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
              <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                <div>
                  <p className="text-sm font-semibold text-text dark:text-text-dark">{product.name}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Stock: {product.stock} {product.unit}</p>
                </div>
                <button 
                  onClick={() => onRestock(product.id)}
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

const AnalyticsDashboard: React.FC<DashboardTemplateProps> = ({
  stats,
  salesData,
  products,
  sales,
  lowStockProducts,
  userName,
  storeName,
  onRestock
}) => {
  // Helper function to calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return null; // No previous data to compare
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      type: change >= 0 ? 'positive' as const : 'negative' as const
    };
  };

  // Calculate previous month data for comparison
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const previousMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === previousMonth && saleDate.getFullYear() === previousYear;
  });

  const currentMonthSalesTotal = currentMonthSales.reduce((sum, sale) => sum + sale.total, 0);
  const previousMonthSalesTotal = previousMonthSales.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate growth rate
  const growthRate = calculatePercentageChange(currentMonthSalesTotal, previousMonthSalesTotal);
  const metrics = [
    {
      title: 'Revenue',
      value: `₹${(stats.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-orange-600 dark:text-orange-400',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-sm">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text dark:text-text-dark">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-text-secondary dark:text-text-secondary-dark text-lg">
            {userName 
              ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${userName}. Advanced analytics for ${storeName}.`
              : `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}. Advanced business analytics.`
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Last updated</p>
            <p className="text-sm font-semibold text-text dark:text-text-dark">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Analytics Metrics */}
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Performance</span>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">+12.5%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Sales Trend with Area */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">7-Day Trend</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" className="text-xs" />
              <YAxis stroke="#6B7280" className="text-xs" tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="url(#revenueGradient)" 
                strokeWidth={3}
                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#4CAF50', strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Volume Analysis */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text dark:text-text-dark">Order Volume</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Daily Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" className="text-xs" />
              <YAxis stroke="#6B7280" className="text-xs" />
              <Tooltip formatter={(value) => [value, 'Orders']} />
              <Bar dataKey="orders" fill="url(#orderGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Products */}
        <div className="card card-hover">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-6">Top Performers</h3>
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text dark:text-text-dark">{product.name}</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text dark:text-text-dark">₹{product.price}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+{Math.floor(Math.random() * 20 + 5)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Insights */}
        <div className="card card-hover">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-6">Business Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text dark:text-text-dark">Avg Order Value</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ₹{Math.round(stats.totalSales / Math.max(stats.totalOrders, 1))}
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">Per transaction</p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text dark:text-text-dark">Growth Rate</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {growthRate ? `${growthRate.type === 'positive' ? '+' : '-'}${growthRate.value}%` : 'N/A'}
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                {growthRate ? 'This month' : 'No previous data'}
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text dark:text-text-dark">Inventory Value</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">Total stock value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CompactDashboard, DetailedDashboard, AnalyticsDashboard };
