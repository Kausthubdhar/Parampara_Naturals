import { Sale, Customer } from '../types';

// Weekly Sales Pattern Analysis
export interface WeeklySalesData {
  day: string;
  sales: number;
  orders: number;
  avgOrderValue: number;
}

// Hourly Sales Pattern Analysis
export interface HourlySalesData {
  hour: string;
  sales: number;
  orders: number;
  avgOrderValue: number;
  timeLabel: string;
}

// Day-Hour Heat Map Analysis
export interface DayHourSalesData {
  day: string;
  hour: number;
  sales: number;
  orders: number;
  intensity: number; // 0-1 scale for heat map coloring
}

export const getWeeklySalesPattern = (sales: Sale[], startDate?: Date, endDate?: Date): WeeklySalesData[] => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Initialize data for each day
  const weeklyData: { [key: string]: { sales: number; orders: number } } = {};
  daysOfWeek.forEach(day => {
    weeklyData[day] = { sales: 0, orders: 0 };
  });

  // Process sales data with optional date filtering
  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    
    // Apply date filtering if provided
    if (startDate && saleDate < startDate) return;
    if (endDate && saleDate > endDate) return;
    
    const dayName = daysOfWeek[saleDate.getDay()];
    
    weeklyData[dayName].sales += sale.total;
    weeklyData[dayName].orders += 1;
  });

  // Convert to array format with calculated averages
  return daysOfWeek.map(day => ({
    day,
    sales: weeklyData[day].sales,
    orders: weeklyData[day].orders,
    avgOrderValue: weeklyData[day].orders > 0 ? weeklyData[day].sales / weeklyData[day].orders : 0
  }));
};

// Hourly Sales Pattern Analysis
export const getHourlySalesPattern = (sales: Sale[], startDate?: Date, endDate?: Date): HourlySalesData[] => {
  // Initialize data for each hour (0-23)
  const hourlyData: { [key: number]: { sales: number; orders: number } } = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { sales: 0, orders: 0 };
  }

  // Process sales data with optional date filtering
  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    
    // Apply date filtering if provided
    if (startDate && saleDate < startDate) return;
    if (endDate && saleDate > endDate) return;
    
    const hour = saleDate.getHours();
    
    hourlyData[hour].sales += sale.total;
    hourlyData[hour].orders += 1;
  });

  // Convert to array format with time labels
  return Array.from({ length: 24 }, (_, i) => {
    const data = hourlyData[i];
    const avgOrderValue = data.orders > 0 ? data.sales / data.orders : 0;
    
    // Create time labels
    const timeLabel = i === 0 ? '12 AM' : 
                     i < 12 ? `${i} AM` : 
                     i === 12 ? '12 PM' : 
                     `${i - 12} PM`;

    return {
      hour: i.toString().padStart(2, '0'),
      sales: data.sales,
      orders: data.orders,
      avgOrderValue,
      timeLabel
    };
  });
};

// Day-Hour Heat Map Analysis
export const getDayHourHeatMapData = (sales: Sale[], startDate?: Date, endDate?: Date): DayHourSalesData[] => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Initialize data structure for all day-hour combinations
  const dayHourData: { [key: string]: { [key: number]: { sales: number; orders: number } } } = {};
  daysOfWeek.forEach(day => {
    dayHourData[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      dayHourData[day][hour] = { sales: 0, orders: 0 };
    }
  });

  // Process sales data with optional date filtering
  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    
    // Apply date filtering if provided
    if (startDate && saleDate < startDate) return;
    if (endDate && saleDate > endDate) return;
    
    const dayName = daysOfWeek[saleDate.getDay()];
    const hour = saleDate.getHours();
    
    dayHourData[dayName][hour].sales += sale.total;
    dayHourData[dayName][hour].orders += 1;
  });

  // Find max sales for intensity calculation
  let maxSales = 0;
  daysOfWeek.forEach(day => {
    for (let hour = 0; hour < 24; hour++) {
      maxSales = Math.max(maxSales, dayHourData[day][hour].sales);
    }
  });

  // Convert to array format with intensity values
  const result: DayHourSalesData[] = [];
  daysOfWeek.forEach(day => {
    for (let hour = 0; hour < 24; hour++) {
      const data = dayHourData[day][hour];
      const intensity = maxSales > 0 ? data.sales / maxSales : 0;
      
      result.push({
        day,
        hour,
        sales: data.sales,
        orders: data.orders,
        intensity
      });
    }
  });

  return result;
};

// Date Range Utilities
export const getDateRange = (range: 'current_week' | 'current_month' | 'current_year' | 'last_week' | 'last_month' | 'last_year' | 'custom', customStart?: Date, customEnd?: Date): { startDate: Date; endDate: Date } => {
  const now = new Date();
  
  switch (range) {
    case 'current_week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return { startDate: startOfWeek, endDate: endOfWeek };
    }
    
    case 'current_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate: startOfMonth, endDate: endOfMonth };
    }
    
    case 'current_year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate: startOfYear, endDate: endOfYear };
    }
    
    case 'last_week': {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      const startOfLastWeek = new Date(lastWeek);
      startOfLastWeek.setDate(lastWeek.getDate() - lastWeek.getDay());
      startOfLastWeek.setHours(0, 0, 0, 0);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      return { startDate: startOfLastWeek, endDate: endOfLastWeek };
    }
    
    case 'last_month': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate: lastMonth, endDate: endOfLastMonth };
    }
    
    case 'last_year': {
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { startDate: lastYear, endDate: endOfLastYear };
    }
    
    case 'custom': {
      if (!customStart || !customEnd) {
        throw new Error('Custom date range requires start and end dates');
      }
      return { startDate: customStart, endDate: customEnd };
    }
    
    default:
      return { startDate: now, endDate: now };
  }
};

// Age Group Analysis
export interface AgeGroupData {
  ageGroup: string;
  customers: number;
  sales: number;
  avgOrderValue: number;
  visitFrequency: number;
}

export const getAgeGroupAnalysis = (sales: Sale[], customers: Customer[]): AgeGroupData[] => {
  // Map the ageGroup values from the Customer type to our analysis groups
  const ageGroupMapping: { [key: string]: string } = {
    '0-12': '0-12',
    '13-17': '13-17', 
    '18-25': '18-25',
    '26-35': '26-35',
    '36-45': '36-45',
    '46-55': '46-55',
    '56-65': '56-65',
    '65+': '65+'
  };

  // Initialize data for each age group
  const ageGroupData: { [key: string]: { customers: Set<string>; sales: number; orders: number } } = {};
  Object.values(ageGroupMapping).forEach(group => {
    ageGroupData[group] = { customers: new Set(), sales: 0, orders: 0 };
  });

  // Process sales data
  sales.forEach(sale => {
    if (sale.customer?.id) {
      const customer = customers.find(c => c.id === sale.customer?.id);
      if (customer && customer.ageGroup) {
        const mappedAgeGroup = ageGroupMapping[customer.ageGroup];
        
        if (mappedAgeGroup && ageGroupData[mappedAgeGroup]) {
          ageGroupData[mappedAgeGroup].customers.add(customer.id);
          ageGroupData[mappedAgeGroup].sales += sale.total;
          ageGroupData[mappedAgeGroup].orders += 1;
        }
      }
    }
  });

  // Convert to array format with calculated metrics
  return Object.values(ageGroupMapping).map(group => {
    const data = ageGroupData[group];
    const uniqueCustomers = data.customers.size;
    const avgOrderValue = data.orders > 0 ? data.sales / data.orders : 0;
    const visitFrequency = uniqueCustomers > 0 ? data.orders / uniqueCustomers : 0;

    return {
      ageGroup: group,
      customers: uniqueCustomers,
      sales: data.sales,
      avgOrderValue,
      visitFrequency
    };
  });
};

// Customer Demographics Insights
export interface CustomerInsights {
  totalCustomers: number;
  dominantAgeGroup: string;
  mostActiveAgeGroup: string;
  leastActiveAgeGroup: string;
  peakDay: string;
  lowDay: string;
  peakHour: string;
  lowHour: string;
}

export const getCustomerInsights = (sales: Sale[], customers: Customer[]): CustomerInsights => {
  const weeklyData = getWeeklySalesPattern(sales);
  const hourlyData = getHourlySalesPattern(sales);
  const ageGroupData = getAgeGroupAnalysis(sales, customers);

  // Find peak and low days
  const peakDay = weeklyData.reduce((max, day) => day.sales > max.sales ? day : max, weeklyData[0]);
  const lowDay = weeklyData.reduce((min, day) => day.sales < min.sales ? day : min, weeklyData[0]);

  // Find peak and low hours
  const peakHour = hourlyData.reduce((max, hour) => hour.sales > max.sales ? hour : max, hourlyData[0]);
  const lowHour = hourlyData.reduce((min, hour) => hour.sales < min.sales ? hour : min, hourlyData[0]);

  // Find most and least active age groups
  const mostActiveAgeGroup = ageGroupData.reduce((max, group) => group.customers > max.customers ? group : max, ageGroupData[0]);
  const leastActiveAgeGroup = ageGroupData.reduce((min, group) => group.customers < min.customers ? group : min, ageGroupData[0]);

  // Find dominant age group (most customers overall)
  const dominantAgeGroup = customers.reduce((acc, customer) => {
    if (customer.ageGroup) {
      acc[customer.ageGroup] = (acc[customer.ageGroup] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  const dominantAgeGroupName = Object.keys(dominantAgeGroup).reduce((a, b) => 
    dominantAgeGroup[a] > dominantAgeGroup[b] ? a : b, 'N/A'
  );

  return {
    totalCustomers: customers.length,
    dominantAgeGroup: dominantAgeGroupName,
    mostActiveAgeGroup: mostActiveAgeGroup.ageGroup,
    leastActiveAgeGroup: leastActiveAgeGroup.ageGroup,
    peakDay: peakDay.day,
    lowDay: lowDay.day,
    peakHour: peakHour.timeLabel,
    lowHour: lowHour.timeLabel
  };
};

// Sales Performance by Day of Week
export const getDayPerformanceInsights = (weeklyData: WeeklySalesData[]): {
  bestDay: WeeklySalesData;
  worstDay: WeeklySalesData;
  weekendVsWeekday: { weekend: number; weekday: number };
} => {
  const bestDay = weeklyData.reduce((max, day) => day.sales > max.sales ? day : max, weeklyData[0]);
  const worstDay = weeklyData.reduce((min, day) => day.sales < min.sales ? day : min, weeklyData[0]);

  // Calculate weekend vs weekday performance
  const weekendDays = ['Saturday', 'Sunday'];
  const weekendSales = weeklyData
    .filter(day => weekendDays.includes(day.day))
    .reduce((sum, day) => sum + day.sales, 0);
  
  const weekdaySales = weeklyData
    .filter(day => !weekendDays.includes(day.day))
    .reduce((sum, day) => sum + day.sales, 0);

  return {
    bestDay,
    worstDay,
    weekendVsWeekday: { weekend: weekendSales, weekday: weekdaySales }
  };
};
