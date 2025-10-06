import React from 'react';
import { X, Package, DollarSign, Hash } from 'lucide-react';
import { Sale, SaleItem } from '../types';
import Modal from './Modal';

interface ViewSaleItemsModalProps {
  sale: Sale | null;
  onClose: () => void;
}

const ViewSaleItemsModal: React.FC<ViewSaleItemsModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  const subtotal = sale.items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
  const discount = sale.discount || 0;
  const tax = sale.tax || 0;
  const total = subtotal - discount + tax;

  return (
    <Modal isOpen={true} onClose={onClose} title="Sale Details">
      <div className="space-y-6">
        {/* Sale Info Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text dark:text-text-dark">
                  Order #{sale.receiptId || sale.id}
                </h3>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {sale.date.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text dark:text-text-dark">₹{total.toLocaleString()}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                sale.status === 'completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : sale.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {sale.status}
              </span>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
            <h4 className="font-semibold text-text dark:text-text-dark mb-2">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Name</p>
                <p className="font-medium text-text dark:text-text-dark">
                  {sale.customer?.name || 'Walk-in Customer'}
                </p>
              </div>
              {sale.customer?.phone && (
                <div>
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Phone</p>
                  <p className="font-medium text-text dark:text-text-dark">{sale.customer.phone}</p>
                </div>
              )}
              {sale.customer?.email && (
                <div>
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Email</p>
                  <p className="font-medium text-text dark:text-text-dark">{sale.customer.email}</p>
                </div>
              )}
              {sale.customer?.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Address</p>
                  <p className="font-medium text-text dark:text-text-dark">{sale.customer.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary dark:text-primary-dark" />
            <h4 className="text-lg font-semibold text-text dark:text-text-dark">Items Purchased</h4>
          </div>
          
          <div className="bg-secondary/30 dark:bg-secondary-dark/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 dark:bg-secondary-dark/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-text dark:text-text-dark">Item</th>
                    <th className="text-center py-3 px-4 font-medium text-text dark:text-text-dark">Qty</th>
                    <th className="text-right py-3 px-4 font-medium text-text dark:text-text-dark">Price</th>
                    <th className="text-right py-3 px-4 font-medium text-text dark:text-text-dark">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index} className="border-b border-border/30 dark:border-border-dark/30 last:border-b-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text dark:text-text-dark">{item.productName}</p>
                          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                            Product ID: {item.productId}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-dark text-sm font-medium">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-text dark:text-text-dark">₹{item.price}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-text dark:text-text-dark">₹{item.total || item.price * item.quantity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h4 className="text-lg font-semibold text-text dark:text-text-dark">Payment Summary</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary dark:text-text-secondary-dark">Subtotal</span>
              <span className="font-medium text-text dark:text-text-dark">₹{subtotal.toLocaleString()}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary dark:text-text-secondary-dark">Discount</span>
                <span className="font-medium text-green-600 dark:text-green-400">-₹{discount.toLocaleString()}</span>
              </div>
            )}
            
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary dark:text-text-secondary-dark">Tax</span>
                <span className="font-medium text-text dark:text-text-dark">₹{tax.toLocaleString()}</span>
              </div>
            )}
            
            <div className="border-t border-green-200 dark:border-green-700 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-text dark:text-text-dark">Total</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{total.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <span className="text-text-secondary dark:text-text-secondary-dark">Payment Method</span>
              <span className="font-medium text-text dark:text-text-dark capitalize">{sale.paymentMethod}</span>
            </div>
            
            {/* Cash Payment Details */}
            {sale.paymentMethod === 'cash' && sale.cashReceived && sale.changeGiven !== undefined && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h5 className="font-semibold text-green-800 dark:text-green-200 text-sm mb-3">Cash Payment Details</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-300">Cash Received</span>
                    <span className="font-medium text-green-800 dark:text-green-200">₹{sale.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-300">Change Given</span>
                    <span className="font-medium text-green-800 dark:text-green-200">₹{sale.changeGiven.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="btn-secondary px-6 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSaleItemsModal;
