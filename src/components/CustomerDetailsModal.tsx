import React from 'react';
import { X, User, Phone, Mail, MapPin, Star, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';
import { Customer, Sale, SaleItem } from '../types';

interface CustomerDetailsModalProps {
  customer: Customer;
  sales: Sale[];
  onClose: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ customer, sales, onClose }) => {
  const customerSales = sales.filter(sale => sale.customer?.id === customer.id);
  const totalOrders = customerSales.length;
  const averageOrderValue = totalOrders > 0 ? customer.totalPurchases / totalOrders : 0;
  const lastPurchase = customerSales.length > 0 ? 
    new Date(Math.max(...customerSales.map(sale => new Date(sale.date).getTime()))) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border/50 dark:border-border-dark/50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 dark:border-border-dark/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text dark:text-text-dark">{customer.name}</h2>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Customer Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-1">
              <div className="card">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-text dark:text-text-dark">{customer.phone}</p>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Phone</p>
                    </div>
                  </div>
                  
                  {customer.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-text dark:text-text-dark">{customer.email}</p>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Email</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-text dark:text-text-dark">{customer.address}</p>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Address</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Stats */}
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Customer Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-accent-orange" />
                      <span className="text-text dark:text-text-dark">Total Spent</span>
                    </div>
                    <span className="font-bold text-accent-orange">₹{(customer.totalPurchases || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <span className="text-text dark:text-text-dark">Total Orders</span>
                    </div>
                    <span className="font-bold text-primary">{totalOrders}</span>
                  </div>
                  
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-accent-brown" />
                      <span className="text-text dark:text-text-dark">Avg. Order</span>
                    </div>
                    <span className="font-bold text-accent-brown">₹{Math.round(averageOrderValue || 0).toLocaleString()}</span>
                  </div>
                  
                  {lastPurchase && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="text-text dark:text-text-dark">Last Purchase</span>
                      </div>
                      <span className="font-bold text-gray-500">{lastPurchase.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase History */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Purchase History</h3>
                {customerSales.length > 0 ? (
                  <div className="space-y-3">
                    {customerSales
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((sale) => (
                        <div key={sale.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-text dark:text-text-dark">
                                {new Date(sale.date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="font-bold text-primary">₹{sale.total.toFixed(2)}</span>
                          </div>
                          
                          <div className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2">
                            {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} • {sale.paymentMethod.toUpperCase()}
                            {sale.paymentMethod === 'cash' && sale.cashReceived && sale.changeGiven !== undefined && (
                              <span className="ml-2 text-green-600 dark:text-green-400">
                                • Cash: ₹{sale.cashReceived.toFixed(2)} (Change: ₹{sale.changeGiven.toFixed(2)})
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {sale.items.slice(0, 3).map((item: SaleItem, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-text dark:text-text-dark">{item.productName}</span>
                                <span className="text-text-secondary dark:text-text-secondary-dark">
                                  {item.quantity} × ₹{item.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                            {sale.items.length > 3 && (
                              <div className="text-xs text-text-secondary dark:text-text-secondary-dark">
                                +{sale.items.length - 3} more item{sale.items.length - 3 !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-secondary dark:text-text-secondary-dark">No purchase history found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
