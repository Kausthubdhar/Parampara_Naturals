import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Eye, Printer, Phone, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Sale } from '../types';
import ViewSaleItemsModal from './ViewSaleItemsModal';
import ReceiptModal from './ReceiptModal';
import PaymentCompleteModal from './PaymentCompleteModal';
import { getUserProfile, getCurrentUserProfileId } from '../lib/supabaseAuth';

interface OrdersProps {
  onNewSale?: () => void;
}

const Orders: React.FC<OrdersProps> = ({ onNewSale }) => {
  const { state, updateSale } = useApp();
  const { sales } = state;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'partial' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [paymentCompleteSale, setPaymentCompleteSale] = useState<Sale | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        // Error fetching user profile - will retry on next auth state change
      }
    };

    fetchUserProfile();
  }, []);

  // Get store name from localStorage as fallback
  const getStoreName = () => {
    if (userProfile?.store_name) {
      return userProfile.store_name;
    }
    // Fallback to localStorage or default
    return localStorage.getItem('organica_store_name') || 'Parampara Naturals';
  };

  const filteredSales = sales.filter(sale => {
    const customerName = sale.customer?.firstName && sale.customer?.lastName 
      ? `${sale.customer.firstName} ${sale.customer.lastName}`.toLowerCase()
      : sale.customer?.name?.toLowerCase() || '';
    const firstName = sale.customer?.firstName?.toLowerCase() || '';
    const lastName = sale.customer?.lastName?.toLowerCase() || '';
    
    const matchesSearch = 
      customerName.includes(searchQuery.toLowerCase()) ||
      firstName.includes(searchQuery.toLowerCase()) ||
      lastName.includes(searchQuery.toLowerCase()) ||
      sale.customer?.phone?.includes(searchQuery) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.receiptId && sale.receiptId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    // Date filtering
    const saleDate = new Date(sale.date);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = saleDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      matchesDate = saleDate >= startOfWeek;
    } else if (dateFilter === 'month') {
      matchesDate = saleDate >= startOfMonth;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingSales = sales.filter(sale => sale.status === 'pending');
  const partialSales = sales.filter(sale => sale.status === 'partial');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'upi':
        return '📱';
      default:
        return '💰';
    }
  };

  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale);
  };

  const handleCloseView = () => {
    setViewingSale(null);
  };

  const handleReceipt = (sale: Sale) => {
    setReceiptSale(sale);
  };

  const handleCloseReceipt = () => {
    setReceiptSale(null);
  };

  const handleMarkAsPaid = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      setPaymentCompleteSale(sale);
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentCompleteSale) {
      // Update the sale status to completed
      updateSale(paymentCompleteSale.id, { status: 'completed' });
      setPaymentCompleteSale(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text dark:text-text-dark">Sales & Orders</h1>
          <p className="text-text-secondary dark:text-text-secondary-dark">Track all your sales transactions and customer orders</p>
        </div>
        <button 
          onClick={onNewSale}
          className="btn-primary flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 w-full sm:w-auto"
        >
          <Phone className="h-5 w-5" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card text-center">
          <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary dark:text-primary-dark" />
          </div>
          <p className="text-3xl font-bold text-text dark:text-text-dark">{sales.length}</p>
          <p className="text-text-secondary dark:text-text-secondary-dark">Total Orders</p>
        </div>


        <div className="card text-center">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingSales.length}</p>
          <p className="text-text-secondary dark:text-text-secondary-dark">Pending</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{partialSales.length}</p>
          <p className="text-text-secondary dark:text-text-secondary-dark">Partial</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-accent-orange/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-accent-orange dark:text-accent-orange-dark" />
          </div>
          <p className="text-3xl font-bold text-accent-orange dark:text-accent-orange-dark">₹{(totalRevenue || 0).toLocaleString()}</p>
          <p className="text-text-secondary dark:text-text-secondary-dark">Total Revenue</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark h-5 w-5" />
            <input
              type="text"
              placeholder="Search by customer name, order ID, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field py-2 min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field py-2 min-w-[150px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

        </div>
      </div>

      {/* Sales Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 dark:border-border-dark/50">
                <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Items</th>
                <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Total</th>
                <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Date</th>
                <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/30 dark:border-border-dark/30 hover:bg-secondary/30 dark:hover:bg-secondary-dark/30">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-text dark:text-text-dark">
                        {sale.customer?.name || 'Walk-in Customer'}
                      </p>
                      {sale.customer?.phone && (
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{sale.customer.phone}</p>
                      )}
                      <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-mono">Order #{sale.receiptId || sale.id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-text dark:text-text-dark">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-text dark:text-text-dark">₹{sale.total}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getPaymentIcon(sale.paymentMethod)}</span>
                      <span className="text-sm text-text-secondary dark:text-text-secondary-dark capitalize">{sale.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                      {new Date(sale.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewSale(sale)}
                        className="btn-secondary text-xs px-3 py-1 hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1 inline" />
                        View
                      </button>
                      <button 
                        onClick={() => handleReceipt(sale)}
                        className="btn-primary text-xs px-3 py-1 hover:bg-primary/80 dark:hover:bg-primary-dark/80 transition-colors"
                      >
                        <Printer className="h-3 w-3 mr-1 inline" />
                        Receipt
                      </button>
                      {(sale.status === 'pending' || sale.status === 'partial') && (
                        <button 
                          onClick={() => handleMarkAsPaid(sale.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-3 w-3 mr-1 inline" />
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredSales.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="h-24 w-24 text-text-secondary dark:text-text-secondary-dark mx-auto mb-6" />
          <h3 className="text-2xl font-medium text-text dark:text-text-dark mb-4">No sales found</h3>
          <p className="text-text-secondary dark:text-text-secondary-dark mb-8 max-w-md mx-auto">
            {searchQuery ? 'Try adjusting your search or filter criteria' : 'Start making sales to see them appear here'}
          </p>
          <button 
            onClick={onNewSale}
            className="btn-primary px-8 py-3"
          >
            Make Your First Sale
          </button>
        </div>
      )}

      {/* Recent Sales Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-secondary/30 dark:bg-secondary-dark/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-4 w-4 text-primary dark:text-primary-dark" />
                  </div>
                  <div>
                    <p className="font-medium text-text dark:text-text-dark text-sm">
                      Order #{sale.receiptId || sale.id} - {sale.customer?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text dark:text-text-dark">₹{sale.total}</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary-dark capitalize">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {[
              { method: 'cash', label: 'Cash', icon: '💵', count: sales.filter(s => s.paymentMethod === 'cash').length },
              { method: 'card', label: 'Card', icon: '💳', count: sales.filter(s => s.paymentMethod === 'card').length },
              { method: 'upi', label: 'UPI', icon: '📱', count: sales.filter(s => s.paymentMethod === 'upi').length },
            ].map((payment) => (
              <div key={payment.method} className="flex items-center justify-between p-3 bg-secondary/30 dark:bg-secondary-dark/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{payment.icon}</span>
                  <span className="font-medium text-text dark:text-text-dark">{payment.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary dark:text-primary-dark">{payment.count}</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary-dark">orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewSaleItemsModal 
        sale={viewingSale} 
        onClose={handleCloseView} 
      />
      <ReceiptModal 
        sale={receiptSale} 
        onClose={handleCloseReceipt}
        storeName={getStoreName()}
        storePhone={userProfile?.phone || '+91 98765 43210'}
        storeEmail={userProfile?.email || 'info@paramparanaturals.com'}
        storeAddress={userProfile?.address || '123 Green Street, Organic City, India - 110001'}
      />

      {/* Payment Complete Modal */}
      <PaymentCompleteModal
        isOpen={!!paymentCompleteSale}
        onClose={() => setPaymentCompleteSale(null)}
        onConfirm={handleConfirmPayment}
        sale={paymentCompleteSale || { id: '', receiptId: '', total: 0, status: 'pending', paidAmount: 0, remainingAmount: 0 }}
      />
    </div>
  );
};

export default Orders;
