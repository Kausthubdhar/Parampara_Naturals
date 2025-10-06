import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Save, X, User, Phone, Mail, MapPin, Calendar, Grid3X3, List } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Modal from '../Modal';
import { Sale, SaleItem, Product, Customer } from '../../types';
import { upsertCustomer } from '../../lib/db';

interface NewSaleFormProps {
  onClose: () => void;
}

const NewSaleForm: React.FC<NewSaleFormProps> = ({ onClose }) => {
  const { addSale, addCustomer, state, dispatch, showNotification } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', phone: '', email: '', address: '', ageGroup: '' });
  const [newCustomerErrors, setNewCustomerErrors] = useState<Record<string, string>>({});
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  
  // Overselling warning state
  const [showOversellingWarning, setShowOversellingWarning] = useState(false);
  const [oversellingProduct, setOversellingProduct] = useState<Product | null>(null);
  const [oversellingQuantity, setOversellingQuantity] = useState(0);
  
  // Get store information from localStorage or default values
  const getStoreInfo = () => {
    return {
      storeName: localStorage.getItem('organica_store_name') || 'My Store',
      storePhone: localStorage.getItem('organica_phone') || '',
      storeEmail: localStorage.getItem('organica_email') || '',
      storeAddress: localStorage.getItem('organica_address') || '',
      storeCity: localStorage.getItem('organica_city') || '',
      storeState: localStorage.getItem('organica_state') || '',
      storeCountry: localStorage.getItem('organica_country') || 'India'
    };
  };

  const [storeInfo, setStoreInfo] = useState(getStoreInfo());
  
  // Listen for store info changes
  useEffect(() => {
    const handleStoreInfoChange = () => {
      const newStoreInfo = getStoreInfo();
      setStoreInfo(newStoreInfo);
    };

    window.addEventListener('storeInfoChanged', handleStoreInfoChange);
    return () => window.removeEventListener('storeInfoChanged', handleStoreInfoChange);
  }, []);

  // Phone number input handler with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setNewCustomer(prev => ({ ...prev, phone: digitsOnly }));
    
    // Clear phone error when user starts typing
    if (newCustomerErrors.phone) {
      setNewCustomerErrors(prev => ({ ...prev, phone: '' }));
    }
  };
  
  
  // Cash payment state
  const [cashReceived, setCashReceived] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment status state
  const [paymentStatus, setPaymentStatus] = useState<'completed' | 'pending' | 'partial'>('completed');
  const [partialAmount, setPartialAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // Calculate totals
  const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0; // Can be made editable
  const total = subtotal - discount;
  
  // Calculate change for cash payments
  const calculateChange = () => {
    if (paymentMethod === 'cash' && cashReceived > 0) {
      const change = cashReceived - total;
      setChangeAmount(change >= 0 ? change : 0);
    } else {
      setChangeAmount(0);
    }
  };
  
  // Update change when cash received or total changes
  useEffect(() => {
    calculateChange();
  }, [cashReceived, total, paymentMethod]);

  // Calculate remaining amount for partial payments
  useEffect(() => {
    if (paymentStatus === 'partial') {
      setRemainingAmount(total - partialAmount);
    } else {
      setRemainingAmount(0);
      setPartialAmount(0);
    }
  }, [paymentStatus, partialAmount, total]);

  // Filter products based on search
  const filteredProducts = (state.products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter customers based on search (name, email, or phone)
  const filteredCustomers = (state.customers || []).filter(customer => {
    const term = customerSearchTerm.toLowerCase();
    const fullName = customer.firstName && customer.lastName 
      ? `${customer.firstName} ${customer.lastName}`.toLowerCase()
      : customer.name?.toLowerCase() || '';
    const firstName = customer.firstName?.toLowerCase() || '';
    const lastName = customer.lastName?.toLowerCase() || '';
    
    return (
      fullName.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(customerSearchTerm))
    );
  });


  const validateNewCustomer = () => {
    const errors: Record<string, string> = {};
    if (!newCustomer.firstName.trim()) errors.firstName = 'First name is required';
    
    const digits = newCustomer.phone.replace(/\D/g, '');
    if (!digits) {
      errors.phone = 'Phone number is required';
    } else if (digits.length < 10) {
      errors.phone = `Enter complete 10-digit phone number (${digits.length}/10)`;
    } else if (!/^\d{10}$/.test(digits)) {
      errors.phone = 'Phone number must contain exactly 10 digits';
    }
    
    if (newCustomer.email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(newCustomer.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setNewCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAndSelectCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isCreatingCustomer) {
      return;
    }
    
    if (!validateNewCustomer()) return;
    
    setIsCreatingCustomer(true);
    
    const payload = {
      firstName: newCustomer.firstName.trim(),
      lastName: newCustomer.lastName.trim() || undefined,
      phone: newCustomer.phone.replace(/\D/g, ''),
      email: newCustomer.email.trim() || undefined,
      address: newCustomer.address.trim() || undefined,
      ageGroup: newCustomer.ageGroup as '0-12' | '13-17' | '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+' | undefined,
      totalPurchases: 0,
    } as Omit<Customer, 'id'>;
    
    try {
      // Create customer directly using the database function
      const createdCustomer = await upsertCustomer(payload);
      
      // Add to state manually
      dispatch({ type: 'ADD_CUSTOMER', payload: createdCustomer });
      
      // Select the created customer immediately
      setSelectedCustomer(createdCustomer);
      setShowNewCustomerModal(false);
      setNewCustomer({ firstName: '', lastName: '', phone: '', email: '', address: '', ageGroup: '' });
      setCustomerSearchTerm('');
      setNewCustomerErrors({});
      setIsCreatingCustomer(false);
      
      // Show success notification
      showNotification('Customer added and selected successfully!', 'success');
    } catch (error) {
      console.error('Error creating customer:', error);
      showNotification('Error creating customer. Please try again.', 'error');
      setIsCreatingCustomer(false);
    }
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
      const newQuantity = existingItem.quantity + increment;
      
      // Check for overselling
      if (newQuantity > product.stock) {
        setOversellingProduct(product);
        setOversellingQuantity(newQuantity);
        setShowOversellingWarning(true);
        return;
      }
      
      setSelectedProducts(prev => prev.map(item =>
        item.productId === product.id
          ? { 
              ...item, 
              quantity: newQuantity,
              total: Math.round((item.price * newQuantity) * 100) / 100
            }
          : item
      ));
    } else {
      // Add new product to cart with default quantity (user will edit manually)
      const initialQuantity = 1; // Default to 1, user can edit to any value
      
      // Check for overselling
      if (initialQuantity > product.stock) {
        setOversellingProduct(product);
        setOversellingQuantity(initialQuantity);
        setShowOversellingWarning(true);
        return;
      }
      
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
      // Check for overselling
      const product = state.products.find(p => p.id === productId);
      if (product && quantity > product.stock) {
        setOversellingProduct(product);
        setOversellingQuantity(quantity);
        setShowOversellingWarning(true);
        return;
      }
      
      setSelectedProducts(prev => prev.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: Math.round((item.price * quantity) * 100) / 100 }
          : item
      ));
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

  // Handle overselling warning
  const handleOversellingProceed = () => {
    if (oversellingProduct) {
      const existingItem = selectedProducts.find(item => item.productId === oversellingProduct.id);
      
      if (existingItem) {
        // Update existing item
        setSelectedProducts(prev => prev.map(item =>
          item.productId === oversellingProduct.id
            ? { 
                ...item, 
                quantity: oversellingQuantity,
                total: Math.round((item.price * oversellingQuantity) * 100) / 100
              }
            : item
        ));
      } else {
        // Add new item
        const newItem: SaleItem = {
          productId: oversellingProduct.id,
          productName: oversellingProduct.name,
          price: oversellingProduct.price,
          quantity: oversellingQuantity,
          total: Math.round((oversellingProduct.price * oversellingQuantity) * 100) / 100,
        };
        setSelectedProducts(prev => [...prev, newItem]);
      }
    }
    
    // Close warning dialog
    setShowOversellingWarning(false);
    setOversellingProduct(null);
    setOversellingQuantity(0);
  };

  const handleOversellingCancel = () => {
    setShowOversellingWarning(false);
    setOversellingProduct(null);
    setOversellingQuantity(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    if (selectedProducts.length === 0) {
      alert('Please add at least one product to the sale');
      return;
    }
    
    // Validate cash payment (only for completed payments)
    if (paymentStatus === 'completed' && paymentMethod === 'cash' && cashReceived < total) {
      alert(`Insufficient cash received. Total: ₹${total.toFixed(2)}, Received: ₹${cashReceived.toFixed(2)}`);
      return;
    }

    // Validate partial payment
    if (paymentStatus === 'partial') {
      if (partialAmount <= 0) {
        alert('Please enter the amount paid now for partial payment');
        return;
      }
      if (partialAmount > total) {
        alert(`Amount paid (₹${partialAmount.toFixed(2)}) cannot be more than total amount (₹${total.toFixed(2)})`);
        return;
      }
    }
    
    setIsSubmitting(true);

    const newSale: Omit<Sale, 'id'> = {
      date: new Date(),
      customer: selectedCustomer || undefined,
      items: selectedProducts,
      total,
      paymentMethod,
      status: paymentStatus,
      tax: 0,
      discount,
      paidAmount: paymentStatus === 'partial' ? partialAmount : (paymentStatus === 'completed' ? total : 0),
      remainingAmount: paymentStatus === 'partial' ? remainingAmount : 0,
      cashReceived: paymentMethod === 'cash' && paymentStatus === 'completed' ? cashReceived : undefined,
      changeGiven: paymentMethod === 'cash' && paymentStatus === 'completed' ? changeAmount : undefined,
    };

    // Debug logging
    console.log('Creating sale with cash data:', {
      paymentMethod,
      paymentStatus,
      cashReceived,
      changeAmount,
      cashReceivedInSale: newSale.cashReceived,
      changeGivenInSale: newSale.changeGiven
    });

    try {
      // Add the sale first
      await addSale(newSale);
      
      showNotification('Sale completed successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Error completing sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Cart & Order Details */}
        <div className="w-full lg:w-1/2 border-r-0 lg:border-r border-border/50 dark:border-border-dark/50 flex flex-col">
          {/* Customer Section */}
          <div className="flex-shrink-0 p-6 border-b border-border/30 dark:border-border-dark/30 bg-blue-50/30 dark:bg-blue-900/10">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Customer</span>
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
                <div className="max-h-32 overflow-y-auto border border-border/50 dark:border-border-dark/50 rounded-lg">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearchTerm('');
                      }}
                      className="p-2 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 cursor-pointer border-b border-border/30 dark:border-border-dark/30 last:border-b-0"
                    >
                      <p className="font-medium text-text dark:text-text-dark text-sm">{customer.name}</p>
                      <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{customer.phone}</p>
                    </div>
                  ))}
                  {customerSearchTerm && filteredCustomers.length === 0 && (
                    <div className="p-2 flex items-center justify-between">
                      <p className="text-xs text-text-secondary dark:text-text-secondary-dark">No customers found.</p>
                      <button
                        type="button"
                        className="btn-primary btn-sm text-xs"
                        onClick={() => {
                          setNewCustomer({ firstName: customerSearchTerm, lastName: '', phone: '', email: '', address: '', ageGroup: '' });
                          setNewCustomerErrors({});
                          setShowNewCustomerModal(true);
                        }}
                      >
                        Add new
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {selectedCustomer && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-700 dark:text-green-300 text-sm">{selectedCustomer.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{selectedCustomer.phone}</p>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 p-6 border-b border-border/30 dark:border-border-dark/30 bg-green-50/30 dark:bg-green-900/10">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart Items ({selectedProducts.length})</span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {selectedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-text-secondary dark:text-text-secondary-dark">No items in cart</p>
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Add products from the right panel</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map(item => {
                    const product = state.products.find(p => p.id === item.productId);
                    return (
                      <div key={item.productId} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-border/30 dark:border-border-dark/30 flex items-center space-x-3 shadow-sm">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {product?.image ? (
                            <img
                              src={product.image}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded-lg border border-border/30 dark:border-border-dark/30"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border border-border/30 dark:border-border-dark/30 flex items-center justify-center ${product?.image ? 'hidden' : ''}`}>
                            <ShoppingCart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text dark:text-text-dark text-sm">{item.productName}</p>
                          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                            ₹{item.price.toFixed(2)} per {product?.unit}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          {editingProductId === item.productId ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                value={tempQuantity}
                                onChange={(e) => setTempQuantity(e.target.value)}
                                step={supportsDecimalQuantity(product?.unit || '') ? (product?.unit === 'g' || product?.unit === 'ml' ? 0.1 : 0.5) : 1}
                                min="0"
                                autoFocus
                                className="w-16 px-2 py-1 text-center text-xs border border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-text-dark rounded"
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
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={cancelQuantityEdit}
                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => startEditingQuantity(item.productId, item.quantity)}
                              className="flex items-center space-x-1 px-2 py-1 border border-border/30 dark:border-border-dark/30 rounded hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
                            >
                              <span className="text-xs font-medium text-text dark:text-text-dark">
                                {item.quantity} {product?.unit}
                              </span>
                              <svg className="w-2 h-2 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="text-right">
                            <p className="font-semibold text-text dark:text-text-dark text-sm">₹{item.total.toFixed(2)}</p>
                          </div>
                          
                          <button
                            onClick={() => removeProduct(item.productId)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Totals Section */}
          <div className="flex-shrink-0 p-6 border-t border-border/30 dark:border-border-dark/30 bg-purple-50/30 dark:bg-purple-900/10">
            {/* Payment Method */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-text dark:text-text-dark mb-2">Payment Method</h4>
              <div className="grid grid-cols-3 gap-2">
                {(['cash', 'card', 'upi'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method !== 'cash') {
                        setCashReceived(0);
                        setChangeAmount(0);
                      }
                    }}
                    className={`p-2 rounded-lg border transition-colors text-xs ${
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

            {/* Payment Status */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-text dark:text-text-dark mb-2">Payment Status</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentStatus('completed')}
                  className={`p-2 rounded-lg border transition-colors text-xs ${
                    paymentStatus === 'completed'
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600'
                      : 'border-border dark:border-border-dark hover:border-green-500/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${paymentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Paid</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentStatus('partial')}
                  className={`p-2 rounded-lg border transition-colors text-xs ${
                    paymentStatus === 'partial'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600'
                      : 'border-border dark:border-border-dark hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${paymentStatus === 'partial' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Partial</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentStatus('pending')}
                  className={`p-2 rounded-lg border transition-colors text-xs ${
                    paymentStatus === 'pending'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-600'
                      : 'border-border dark:border-border-dark hover:border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${paymentStatus === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Pending</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Cash Payment Fields */}
            {paymentMethod === 'cash' && paymentStatus === 'completed' && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm">Cash Payment</h4>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                      Amount Received (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount received"
                      className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-700 rounded focus:outline-none focus:ring-1 focus:ring-green-500 dark:bg-green-900/20 dark:text-green-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                      Change to Return (₹)
                    </label>
                    <div className={`px-2 py-1 border rounded text-xs ${
                      changeAmount < 0 
                        ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' 
                        : 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    }`}>
                      <span className={`font-semibold ${
                        changeAmount < 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        ₹{changeAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cash + Partial Payment Info */}
            {paymentMethod === 'cash' && paymentStatus === 'partial' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Partial Cash Payment</h4>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Customer will pay the partial amount in cash now, and the remaining amount later.
                </p>
              </div>
            )}

            {/* Partial Payment Fields */}
            {paymentStatus === 'partial' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Partial Payment</h4>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Amount Paid Now (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={total}
                      step="0.01"
                      value={partialAmount || ''}
                      onChange={(e) => setPartialAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount paid now"
                      className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Remaining Amount (₹)
                    </label>
                    <div className="px-2 py-1 border border-blue-300 dark:border-blue-700 rounded bg-blue-50 dark:bg-blue-900/20">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                        ₹{remainingAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="bg-secondary/30 dark:bg-secondary-dark/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-text-secondary-dark">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-text-secondary-dark">Discount:</span>
                <span className="font-medium">₹{discount.toFixed(2)}</span>
              </div>
              <div className="border-t border-border/50 dark:border-border-dark/50 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-text dark:text-text-dark">Total:</span>
                  <span className="font-bold text-primary dark:text-primary-dark text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border/30 dark:border-border-dark/30">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary btn-sm flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedProducts.length === 0 || isSubmitting || (paymentStatus === 'completed' && paymentMethod === 'cash' && cashReceived < total) || (paymentStatus === 'partial' && partialAmount <= 0)}
                className={`btn-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentStatus === 'pending' 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-medium transition-colors'
                    : paymentStatus === 'partial'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors'
                    : 'btn-primary'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    <span>
                      {paymentStatus === 'pending' ? 'Create Pending Sale' : 
                       paymentStatus === 'partial' ? 'Create Partial Sale' : 
                       'Complete Sale'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Product Selection */}
        <div className="w-full lg:w-1/2 flex flex-col border-t lg:border-t-0 border-border/50 dark:border-border-dark/50">
          {/* Product Search */}
          <div className="flex-shrink-0 p-6 border-b border-border/30 dark:border-border-dark/30 bg-orange-50/30 dark:bg-orange-900/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Products</span>
              </h3>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Product Display */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-text-secondary dark:text-text-secondary-dark">No products found</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Try adjusting your search</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-2'}>
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => addProductToSale(product)}
                    className={`hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 cursor-pointer border border-border/30 dark:border-border-dark/30 rounded-lg bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md ${
                      viewMode === 'grid' 
                        ? 'p-4 flex flex-row items-center space-x-4 min-h-[100px]' 
                        : 'p-3 flex flex-row items-center space-x-3 h-16'
                    }`}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`object-cover rounded-lg border border-border/30 dark:border-border-dark/30 ${
                            viewMode === 'grid' ? 'w-16 h-16' : 'w-12 h-12'
                          }`}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg border border-border/30 dark:border-border-dark/30 flex items-center justify-center ${product.image ? 'hidden' : ''} ${
                        viewMode === 'grid' ? 'w-16 h-16' : 'w-12 h-12'
                      }`}>
                        <ShoppingCart className={`text-gray-400 dark:text-gray-500 ${viewMode === 'grid' ? 'w-6 h-6' : 'w-4 h-4'}`} />
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      {viewMode === 'grid' ? (
                        // Grid view layout
                        <>
                          <div className="flex flex-col space-y-1 mb-2">
                            <h3 className="font-semibold text-text dark:text-text-dark text-base leading-tight">{product.name}</h3>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                              {product.category}
                            </p>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                              Stock: {product.stock} {product.unit}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-primary dark:text-primary-dark text-lg">₹{product.price.toFixed(2)}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                product.stock > 0 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                              }`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                              {product.stock > 0 && product.stock <= 5 && (
                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        // List view layout
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text dark:text-text-dark text-sm truncate">{product.name}</h3>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark truncate">
                              {product.category} • Stock: {product.stock} {product.unit}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <p className="font-bold text-primary dark:text-primary-dark text-sm">₹{product.price.toFixed(2)}</p>
                            <div className="flex items-center space-x-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                product.stock > 0 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                              }`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                              {product.stock > 0 && product.stock <= 5 && (
                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                                  Low
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer(v => ({ ...v, firstName: e.target.value }))}
                  className={`input-field pl-9 ${newCustomerErrors.firstName ? 'border-red-500' : ''}`}
                  placeholder="First name"
                />
              </div>
              {newCustomerErrors.firstName && <p className="text-red-500 text-xs mt-1">{newCustomerErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer(v => ({ ...v, lastName: e.target.value }))}
                  className="input-field pl-9"
                  placeholder="Last name (optional)"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={handlePhoneChange}
                  className={`input-field pl-9 ${newCustomerErrors.phone ? 'border-red-500' : ''}`}
                  placeholder="10-digit phone"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                {newCustomerErrors.phone ? (
                  <p className="text-red-500 text-xs">{newCustomerErrors.phone}</p>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-500 text-xs">
                      {newCustomer.phone.length}/10 digits
                    </p>
                    {newCustomer.phone.length === 10 && (
                      <span className="text-green-500 text-xs">✓ Valid</span>
                    )}
                  </div>
                )}
              </div>
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
            <div>
              <label className="block text-sm font-medium mb-1">Age Group (optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={newCustomer.ageGroup}
                  onChange={(e) => setNewCustomer(v => ({ ...v, ageGroup: e.target.value }))}
                  className="input-field pl-9"
                >
                  <option value="">Select age group</option>
                  <option value="0-12">0-12 years</option>
                  <option value="13-17">13-17 years</option>
                  <option value="18-25">18-25 years</option>
                  <option value="26-35">26-35 years</option>
                  <option value="36-45">36-45 years</option>
                  <option value="46-55">46-55 years</option>
                  <option value="56-65">56-65 years</option>
                  <option value="65+">65+ years</option>
                </select>
              </div>
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
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowNewCustomerModal(false)}
              disabled={isCreatingCustomer}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex items-center space-x-2"
              disabled={isCreatingCustomer}
            >
              {isCreatingCustomer ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Select</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Overselling Warning Modal */}
      <Modal
        isOpen={showOversellingWarning}
        onClose={handleOversellingCancel}
        title="⚠️ Overselling Warning"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Overselling Detected
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                You're trying to sell <strong>{oversellingQuantity} {oversellingProduct?.unit}</strong> of <strong>{oversellingProduct?.name}</strong>, 
                but only <strong>{oversellingProduct?.stock} {oversellingProduct?.unit}</strong> are available in inventory.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Possible reasons:</strong>
                </p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 ml-4 list-disc">
                  <li>Inventory count might be outdated</li>
                  <li>Products returned but not updated in system</li>
                  <li>Manual counting errors</li>
                  <li>Products received but not recorded</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-yellow-200 dark:border-yellow-800">
            <button
              onClick={handleOversellingCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOversellingProceed}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Proceed Anyway</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewSaleForm;
