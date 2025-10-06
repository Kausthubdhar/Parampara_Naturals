import React, { useState } from 'react';
import { Search, Plus, Filter, Users, Phone, Mail, Star, TrendingUp, Edit, Eye, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Customer } from '../types';
import AddCustomerForm from './forms/AddCustomerForm';
import EditCustomerForm from './forms/EditCustomerForm';
import CustomerDetailsModal from './CustomerDetailsModal';
import Modal from './Modal';

const Customers: React.FC = () => {
  const { state, deleteCustomer } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'purchases'>('name');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const safeCustomers = state.customers || [];
  const safeSales = state.sales || [];

  const filteredCustomers = safeCustomers
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
    const customerSales = safeSales.filter(sale => sale.customer?.id === customer.id);
    const totalOrders = customerSales.length;
    const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Get the most recent purchase date
    const lastPurchase = customerSales.length > 0 
      ? new Date(Math.max(...customerSales.map(sale => new Date(sale.date).getTime())))
      : null;
    
    return { totalOrders, totalSpent, averageOrderValue, lastPurchase };
  };

  // Calculate stats from actual sales data
  const totalRevenue = safeSales.reduce((sum, sale) => sum + sale.total, 0);
  const averagePurchase = safeCustomers.length > 0 ? totalRevenue / safeCustomers.length : 0;
  const repeatCustomers = safeCustomers.filter(customer => {
    const customerSales = safeSales.filter(sale => sale.customer?.id === customer.id);
    const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);
    return totalSpent > 1000; // Customers who spent more than ₹1000
  }).length;

  const openModal = (type: 'add' | 'edit' | 'view' | 'delete', customer?: Customer) => {
    setModalType(type);
    setSelectedCustomer(customer || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id);
      closeModal();
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'add':
        return <AddCustomerForm onClose={closeModal} />;
      case 'edit':
        return selectedCustomer ? <EditCustomerForm customer={selectedCustomer} onClose={closeModal} /> : null;
      case 'view':
        return selectedCustomer ? <CustomerDetailsModal customer={selectedCustomer} sales={state.sales} onClose={closeModal} /> : null;
      case 'delete':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">Delete Customer</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
              Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={closeModal}
                className="btn-secondary px-6 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Delete Customer
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add':
        return 'Add New Customer';
      case 'edit':
        return 'Edit Customer';
      case 'view':
        return 'Customer Details';
      case 'delete':
        return 'Delete Customer';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Customers</h1>
          <p className="text-gray-600">Manage your customer database and relationships</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="btn-primary flex items-center space-x-2 px-6 py-3"
        >
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold text-text">{state.customers.length}</p>
          <p className="text-gray-600">Total Customers</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-accent-orange/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-accent-orange" />
          </div>
          <p className="text-3xl font-bold text-accent-orange">₹{(totalRevenue || 0).toLocaleString()}</p>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-accent-brown/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-accent-brown" />
          </div>
          <p className="text-3xl font-bold text-accent-brown">₹{Math.round(averagePurchase)}</p>
          <p className="text-gray-600">Avg. Purchase</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-secondary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">{repeatCustomers}</p>
          <p className="text-gray-600">Repeat Customers</p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-field py-2 min-w-[200px]"
            >
              <option value="name">Sort by Name</option>
              <option value="purchases">Sort by Total Purchases</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Spent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Loyalty</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Purchase</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer);
                return (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-text">{customer.name}</p>
                          {customer.address && (
                            <p className="text-sm text-gray-600 truncate max-w-xs">{customer.address}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
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
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-primary">₹{stats.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{stats.totalOrders}</span>
                    </td>
                    <td className="py-3 px-4">
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {stats.lastPurchase ? stats.lastPurchase.toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openModal('view', customer)}
                          className="btn-secondary text-xs px-3 py-1"
                        >
                          <Eye className="h-3 w-3 mr-1 inline" />
                          View
                        </button>
                        <button 
                          onClick={() => openModal('edit', customer)}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          <Edit className="h-3 w-3 mr-1 inline" />
                          Edit
                        </button>
                        <button 
                          onClick={() => openModal('delete', customer)}
                          className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-3 py-1 rounded transition-colors"
                        >
                          <Trash2 className="h-3 w-3 mr-1 inline" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-medium text-gray-900 mb-4">No customers found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchQuery ? 'Try adjusting your search criteria' : 'Start building your customer base by adding your first customer'}
          </p>
          <button 
            onClick={() => openModal('add')}
            className="btn-primary px-8 py-3"
          >
            Add Your First Customer
          </button>
        </div>
      )}

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">🏆 Top Customers</h3>
          <div className="space-y-3">
            {state.customers
              .map(customer => ({
                ...customer,
                totalSpent: safeSales
                  .filter(sale => sale.customer?.id === customer.id)
                  .reduce((sum, sale) => sum + sale.total, 0)
              }))
              .sort((a, b) => b.totalSpent - a.totalSpent)
              .slice(0, 5)
              .map((customer, index) => (
                <div key={customer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text text-sm">
                      {customer.firstName && customer.lastName 
                        ? `${customer.firstName} ${customer.lastName}` 
                        : customer.name || ''}
                    </p>
                    <p className="text-xs text-gray-600">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary text-sm">₹{customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text">Total Customers</p>
                <p className="text-sm text-gray-600">Active customer base</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{state.customers.length}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text">Average Order Value</p>
                <p className="text-sm text-gray-600">Per customer transaction</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent-orange">₹{Math.round(averagePurchase)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text">Repeat Customers</p>
                <p className="text-sm text-gray-600">Loyal customer percentage</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent-brown">
                  {Math.round((repeatCustomers / state.customers.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalType !== 'view' && (
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={getModalTitle()}
          size="lg"
        >
          {renderModalContent()}
        </Modal>
      )}

      {/* Customer Details Modal */}
      {modalType === 'view' && showModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          sales={state.sales}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Customers;
