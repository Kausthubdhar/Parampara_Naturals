import React, { useState } from 'react';
import { Search, Plus, Users, Phone, Mail, MapPin, Star } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Customer } from '../../types';

const CustomersScreen: React.FC = () => {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'purchases'>('name');

  const { customers, sales } = state;

  const filteredCustomers = customers
    .filter(customer => {
      const fullName = customer.firstName && customer.lastName 
        ? `${customer.firstName} ${customer.lastName}`.toLowerCase()
        : customer.name?.toLowerCase() || '';
      const firstName = customer.firstName?.toLowerCase() || '';
      const lastName = customer.lastName?.toLowerCase() || '';
      
      return fullName.includes(searchQuery.toLowerCase()) ||
             firstName.includes(searchQuery.toLowerCase()) ||
             lastName.includes(searchQuery.toLowerCase()) ||
             customer.phone.includes(searchQuery) ||
             customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'purchases':
          return b.totalPurchases - a.totalPurchases;
        default:
          const aName = a.firstName && a.lastName 
            ? `${a.firstName} ${a.lastName}` 
            : a.name || '';
          const bName = b.firstName && b.lastName 
            ? `${b.firstName} ${b.lastName}` 
            : b.name || '';
          return aName.localeCompare(bName);
      }
    });

  const getCustomerStats = (customer: Customer) => {
    const customerSales = sales.filter(sale => sale.customer?.id === customer.id);
    const totalOrders = customerSales.length;
    const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Get the most recent purchase date
    const lastPurchase = customerSales.length > 0 
      ? new Date(Math.max(...customerSales.map(sale => new Date(sale.date).getTime())))
      : null;
    
    return { totalOrders, totalSpent, averageOrderValue, lastPurchase };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">Customers</h2>
        <button className="btn-primary flex items-center space-x-2 px-4 py-2">
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search and Sort */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 input-field py-2"
          >
            <option value="name">Name</option>
            <option value="purchases">Total Purchases</option>
          </select>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="card">
        <h3 className="font-semibold text-text mb-3">Customer Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{customers.length}</p>
            <p className="text-xs text-gray-600">Total Customers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-orange">
              ₹{sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Total Revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-brown">
              {Math.round(sales.reduce((sum, sale) => sum + sale.total, 0) / customers.length)}
            </p>
            <p className="text-xs text-gray-600">Avg. Purchase</p>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.map((customer) => {
          const stats = getCustomerStats(customer);
          return (
            <div key={customer.id} className="card">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text">{customer.name}</h3>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-primary">₹{stats.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Total Spent</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-accent-orange">{stats.totalOrders}</p>
                      <p className="text-xs text-gray-600">Orders</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-accent-brown">₹{Math.round(stats.averageOrderValue)}</p>
                      <p className="text-xs text-gray-600">Avg. Order</p>
                    </div>
                  </div>

                  {stats.lastPurchase && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Purchase:</span>
                        <span className="font-medium text-text">
                          {stats.lastPurchase.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 btn-secondary text-sm py-2">
                  View History
                </button>
                <button className="flex-1 btn-primary text-sm py-2">
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Start building your customer base'}
          </p>
          <button className="btn-primary">
            Add Your First Customer
          </button>
        </div>
      )}

      {/* Top Customers */}
      <div className="card">
        <h3 className="font-semibold text-text mb-3">🏆 Top Customers</h3>
        <div className="space-y-2">
          {customers
            .sort((a, b) => b.totalPurchases - a.totalPurchases)
            .slice(0, 3)
            .map((customer, index) => (
              <div key={customer.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">{customer.name}</p>
                  <p className="text-xs text-gray-600">{customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary text-sm">₹{(customer.totalPurchases || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CustomersScreen;
