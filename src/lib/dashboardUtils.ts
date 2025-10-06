import { Sale, Product } from '../types';
import { FilterOptions } from '../components/DashboardFilters';

export interface SalesDataPoint {
  date: string;
  amount: number;
  orders: number;
}

export function filterSalesData(
  sales: Sale[],
  products: Product[],
  filters: FilterOptions
): SalesDataPoint[] {
  const now = new Date();
  let filteredSales = [...sales];

  // Filter by time range
  if (filters.timeRange !== 'all') {
    const daysBack = getDaysBack(filters.timeRange);
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    filteredSales = filteredSales.filter(sale => 
      new Date(sale.date) >= cutoffDate
    );
  }

  // Filter by status
  if (filters.status !== 'all') {
    filteredSales = filteredSales.filter(sale => sale.status === filters.status);
  }

  // Filter by category (through products in sale items)
  if (filters.category !== 'all') {
    filteredSales = filteredSales.filter(sale => {
      return sale.items.some(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.category === filters.category;
      });
    });
  }

  // Filter by customer type
  if (filters.customerType !== 'all') {
    filteredSales = filteredSales.filter(sale => {
      if (!sale.customer) return filters.customerType === 'new'; // No customer = new
      
      // Simple logic: if customer has made purchases before, they're returning
      const customerSalesCount = sales.filter(s => 
        s.customer?.id === sale.customer?.id && 
        new Date(s.date) < new Date(sale.date)
      ).length;
      
      if (filters.customerType === 'new') {
        return customerSalesCount === 0;
      } else if (filters.customerType === 'returning') {
        return customerSalesCount > 0;
      }
      return true;
    });
  }

  // Group by date and calculate totals
  const salesByDate = new Map<string, { amount: number; orders: number }>();
  
  filteredSales.forEach(sale => {
    const dateKey = new Date(sale.date).toISOString().split('T')[0];
    const existing = salesByDate.get(dateKey) || { amount: 0, orders: 0 };
    
    salesByDate.set(dateKey, {
      amount: existing.amount + sale.total,
      orders: existing.orders + 1,
    });
  });

  // Convert to array and sort by date
  return Array.from(salesByDate.entries())
    .map(([date, data]) => ({
      date: formatDateForDisplay(date),
      amount: data.amount,
      orders: data.orders,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getDaysBack(timeRange: string): number {
  switch (timeRange) {
    case '7d': return 7;
    case '30d': return 30;
    case '3m': return 90;
    case '6m': return 180;
    case '1y': return 365;
    default: return 30;
  }
}

function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

export function getFilteredStats(
  sales: Sale[],
  products: Product[],
  filters: FilterOptions
) {
  const filteredSales = filterSalesData(sales, products, filters);
  
  const totalSales = filteredSales.reduce((sum, data) => sum + data.amount, 0);
  const totalOrders = filteredSales.reduce((sum, data) => sum + data.orders, 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  // Calculate growth compared to previous period
  const currentPeriod = filteredSales;
  const previousPeriod = getPreviousPeriodData(sales, products, filters);
  
  const currentTotal = currentPeriod.reduce((sum, data) => sum + data.amount, 0);
  const previousTotal = previousPeriod.reduce((sum, data) => sum + data.amount, 0);
  
  const growthRate = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : 0;

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    growthRate,
    filteredSales,
  };
}

function getPreviousPeriodData(
  sales: Sale[],
  products: Product[],
  filters: FilterOptions
): SalesDataPoint[] {
  const now = new Date();
  const daysBack = getDaysBack(filters.timeRange);
  const previousPeriodStart = new Date(now.getTime() - (daysBack * 2) * 24 * 60 * 60 * 1000);
  const previousPeriodEnd = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  
  const previousFilters = {
    ...filters,
    timeRange: 'all' as const,
  };
  
  const allFilteredSales = filterSalesData(sales, products, previousFilters);
  
  return allFilteredSales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= previousPeriodStart && saleDate < previousPeriodEnd;
  });
}
