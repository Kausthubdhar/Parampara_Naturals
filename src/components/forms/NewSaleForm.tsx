import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Save, X, User, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Modal from '../Modal';
import { Sale, SaleItem, Product, Customer } from '../../types';

interface NewSaleFormProps {
  onClose: () => void;
}

const NewSaleForm: React.FC<NewSaleFormProps> = ({ onClose }) => {
  const { addSale, addCustomer, state } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [newCustomerErrors, setNewCustomerErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const discount = 0; // Can be made editable
  const total = subtotal + tax - discount;

  // Filter products based on search
  const filteredProducts = (state.products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter customers based on search (name, email, or phone)
  const filteredCustomers = (state.customers || []).filter(customer => {
    const term = customerSearchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(customerSearchTerm))
    );
  });

  const validateNewCustomer = () => {
    const errors: Record<string, string> = {};
    if (!newCustomer.name.trim()) errors.name = 'Name is required';
    const digits = newCustomer.phone.replace(/\D/g, '');
    if (!digits) errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(digits)) errors.phone = 'Enter 10-digit phone';
    if (newCustomer.email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(newCustomer.email)) errors.email = 'Invalid email';
    setNewCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAndSelectCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNewCustomer()) return;
    const payload = {
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.replace(/\D/g, ''),
      email: newCustomer.email.trim() || undefined,
      address: newCustomer.address.trim() || undefined,
      totalPurchases: 0,
      loyaltyPoints: 0,
    } as Omit<Customer, 'id'>;
    addCustomer(payload);
    setTimeout(() => {
      const created = state.customers.find(c => c.phone === payload.phone) || state.customers[state.customers.length - 1];
      if (created) setSelectedCustomer(created);
    }, 0);
    setCustomerSearchTerm('');
    setShowNewCustomerForm(false);
  };

  // Check if a product unit supports decimal quantities
  const supportsDecimalQuantity = (unit: string) => {
    return ['kg', 'g', 'l', 'ml'].includes(unit);
  };

  const addProductToSale = (product: Product) => {
    const existingItem = selectedProducts.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Update quantity if product already in cart (small increment)
      const increment = supportsDecimalQuantity(product.unit) ? 0.5 : 1;
      setSelectedProducts(prev => prev.map(item =>
        item.productId === product.id
          ? { 
              ...item, 
              quantity: item.quantity + increment,
              total: Math.round((item.price * (item.quantity + increment)) * 100) / 100
            }
          : item
      ));
    } else {
      // Add new product to cart with default quantity (user will edit manually)
      const initialQuantity = 1; // Default to 1, user can edit to any value
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: initialQuantity,
        total: Math.round((product.price * initialQuantity) * 100) / 100,
      };
      setSelectedProducts(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
    } else {
      setSelectedProducts(prev => prev.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: Math.round((item.price * quantity) * 100) / 100 }
          : item
      ));
    }
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  const startEditingQuantity = (productId: string, currentQuantity: number) => {
    setEditingProductId(productId);
    setTempQuantity(currentQuantity.toString());
  };

  const saveQuantityEdit = () => {
    if (editingProductId && tempQuantity) {
      const quantity = parseFloat(tempQuantity);
      if (!isNaN(quantity) && quantity > 0) {
        updateQuantity(editingProductId, quantity);
      }
    }
    setEditingProductId(null);
    setTempQuantity('');
  };

  const cancelQuantityEdit = () => {
    setEditingProductId(null);
    setTempQuantity('');
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      alert('Please add at least one product to the sale');
      return;
    }

    const newSale: Omit<Sale, 'id'> = {
      date: new Date(),
      customer: selectedCustomer || undefined,
      items: selectedProducts,
      total,
      paymentMethod,
      status: 'completed',
      tax,
      discount,
    };

    addSale(newSale);
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <div>
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Customer (Optional)</span>
        </h3>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={customerSearchTerm}
            onChange={(e) => setCustomerSearchTerm(e.target.value)}
            className="input-field"
          />
          
          {customerSearchTerm && (
            <div className="max-h-40 overflow-y-auto border border-border/50 dark:border-border-dark/50 rounded-lg">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setCustomerSearchTerm('');
                  }}
                  className="p-3 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 cursor-pointer border-b border-border/30 dark:border-border-dark/30 last:border-b-0"
                >
                  <p className="font-medium text-text dark:text-text-dark">{customer.name}</p>
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{customer.phone}</p>
                  {customer.email && (
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{customer.email}</p>
                  )}
                </div>
              ))}
              {customerSearchTerm && filteredCustomers.length === 0 && (
                <div className="p-3 flex items-center justify-between">
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">No customers found.</p>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => {
                      setNewCustomer({ name: customerSearchTerm, phone: '', email: '', address: '' });
                      setNewCustomerErrors({});
                      setShowNewCustomerModal(true);
                    }}
                  >
                    Add new customer
                  </button>
                </div>
              )}
            </div>
          )}
          
          {selectedCustomer && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-medium text-green-700 dark:text-green-300">{selectedCustomer.name}</p>
              <p className="text-sm text-green-600 dark:text-green-400">{selectedCustomer.phone}</p>
              {selectedCustomer.email && (
                <p className="text-xs text-green-600 dark:text-green-400">{selectedCustomer.email}</p>
              )}
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1"
              >
                Remove customer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-border/50 dark:border-border-dark/50 p-4">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <span>Add Products</span>
        </h3>
        
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field mb-4"
        />
        
        <div className="max-h-60 overflow-y-auto border border-border/30 dark:border-border-dark/30 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addProductToSale(product)}
              className="p-3 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 cursor-pointer border-b border-border/20 dark:border-border-dark/20 last:border-b-0 flex items-center space-x-3"
            >
              {/* Product Image */}
              <div className="flex-shrink-0">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg border border-border/30 dark:border-border-dark/30"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border border-border/30 dark:border-border-dark/30 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                  <ShoppingCart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text dark:text-text-dark truncate">{product.name}</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {product.category} • Stock: {product.stock} {product.unit}
                </p>
              </div>
              
              {/* Price and Stock Status */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-primary dark:text-primary-dark">₹{product.price.toFixed(2)}</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Separator */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center space-x-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 dark:via-border-dark/50 to-transparent"></div>
          <div className="px-3 py-1 bg-primary/10 dark:bg-primary-dark/10 rounded-full">
            <span className="text-xs font-medium text-primary dark:text-primary-dark">Cart Items</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 dark:via-border-dark/50 to-transparent"></div>
        </div>
      )}

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Selected Products ({selectedProducts.length})</span>
          </h3>
          <div className="space-y-3">
            {selectedProducts.map(item => {
              const product = state.products.find(p => p.id === item.productId);
              return (
                <div key={item.productId} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-border/30 dark:border-border-dark/30 flex items-center space-x-4 shadow-sm">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {product?.image ? (
                      <img
                        src={product.image}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-lg border border-border/30 dark:border-border-dark/30"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg border border-border/30 dark:border-border-dark/30 flex items-center justify-center ${product?.image ? 'hidden' : ''}`}>
                      <ShoppingCart className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text dark:text-text-dark">{item.productName}</p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                      ₹{item.price.toFixed(2)} per {product?.unit}
                    </p>
                  </div>
                  
                  {/* Quantity Controls and Actions */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {editingProductId === item.productId ? (
                        // Manual entry mode
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={tempQuantity}
                            onChange={(e) => setTempQuantity(e.target.value)}
                            step={supportsDecimalQuantity(product?.unit || '') ? (product?.unit === 'g' || product?.unit === 'ml' ? 0.1 : 0.5) : 1}
                            min="0"
                            autoFocus
                            className="w-20 px-2 py-1 text-center text-sm border border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-text-dark rounded"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveQuantityEdit();
                              } else if (e.key === 'Escape') {
                                cancelQuantityEdit();
                              }
                            }}
                          />
                          <button
                            onClick={saveQuantityEdit}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full transition-colors"
                            title="Save"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelQuantityEdit}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Display mode with edit button
                        <div className="flex items-center space-x-2">
                          <div 
                            onClick={() => startEditingQuantity(item.productId, item.quantity)}
                            className="flex items-center space-x-1 px-3 py-1 border border-border/30 dark:border-border-dark/30 rounded hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
                          >
                            <span className="text-sm font-medium text-text dark:text-text-dark">
                              {item.quantity} {product?.unit}
                            </span>
                            <svg className="w-3 h-3 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-text dark:text-text-dark">₹{item.total.toFixed(2)}</p>
                    </div>
                    
                    <button
                      onClick={() => removeProduct(item.productId)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Payment Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['cash', 'card', 'upi'] as const).map(method => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`p-3 rounded-lg border transition-colors ${
                paymentMethod === method
                  ? 'border-primary bg-primary/10 text-primary dark:text-primary-dark'
                  : 'border-border dark:border-border-dark hover:border-primary/50'
              }`}
            >
              <span className="capitalize font-medium">{method}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-secondary/30 dark:bg-secondary-dark/30 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-text-secondary-dark">Subtotal:</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-text-secondary-dark">Tax (5%):</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-text-secondary-dark">Discount:</span>
          <span className="font-medium">₹{discount.toFixed(2)}</span>
        </div>
        <div className="border-t border-border/50 dark:border-border-dark/50 pt-2">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-text dark:text-text-dark">Total:</span>
            <span className="text-lg font-bold text-primary dark:text-primary-dark">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border/50 dark:border-border-dark/50">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedProducts.length === 0}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>Complete Sale</span>
        </button>
      </div>
      {/* Add Customer Modal */}
      <Modal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        title="Add New Customer"
        size="md"
      >
        <form onSubmit={handleCreateAndSelectCustomer} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(v => ({ ...v, name: e.target.value }))}
                  className={`input-field pl-9 ${newCustomerErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Customer name"
                />
              </div>
              {newCustomerErrors.name && <p className="text-red-500 text-xs mt-1">{newCustomerErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(v => ({ ...v, phone: e.target.value }))}
                  className={`input-field pl-9 ${newCustomerErrors.phone ? 'border-red-500' : ''}`}
                  placeholder="10-digit phone"
                />
              </div>
              {newCustomerErrors.phone && <p className="text-red-500 text-xs mt-1">{newCustomerErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email (optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(v => ({ ...v, email: e.target.value }))}
                  className={`input-field pl-9 ${newCustomerErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Email address"
                />
              </div>
              {newCustomerErrors.email && <p className="text-red-500 text-xs mt-1">{newCustomerErrors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Address (optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(v => ({ ...v, address: e.target.value }))}
                  rows={3}
                  className="input-field pl-9"
                  placeholder="Street, City"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowNewCustomerModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save & select</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NewSaleForm;
