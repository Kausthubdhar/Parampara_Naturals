import React, { useState } from 'react';
import { Save, X, Trash2, AlertTriangle, Package, Calendar, DollarSign, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Product } from '../../types';

interface WasteEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  reason: 'expired' | 'damaged' | 'spoiled' | 'other';
  date: Date;
  cost: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface AddWasteEntryFormProps {
  onClose: () => void;
  onSave: (entry: Omit<WasteEntry, 'id'>) => void;
}

const AddWasteEntryForm: React.FC<AddWasteEntryFormProps> = ({ onClose, onSave }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: 'expired' as 'expired' | 'damaged' | 'spoiled' | 'other',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = state.products.find(p => p.id === formData.productId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedProduct) return;

    const quantity = parseFloat(formData.quantity);
    const cost = Math.round((selectedProduct.price * quantity) * 100) / 100;

    const wasteEntry: Omit<WasteEntry, 'id'> = {
      productId: formData.productId,
      productName: selectedProduct.name,
      quantity,
      unit: selectedProduct.unit,
      reason: formData.reason,
      date: new Date(formData.date),
      cost,
      status: 'pending',
      notes: formData.notes.trim() || undefined,
    };

    onSave(wasteEntry);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const reasonOptions = [
    { value: 'expired', label: 'Expired', icon: Calendar, color: 'text-red-600 dark:text-red-400' },
    { value: 'damaged', label: 'Damaged', icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400' },
    { value: 'spoiled', label: 'Spoiled', icon: Trash2, color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'other', label: 'Other', icon: FileText, color: 'text-gray-600 dark:text-gray-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-border/50 dark:border-border-dark/50">
        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text dark:text-text-dark">Add Waste Entry</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Record product waste to track losses</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-text dark:text-text-dark">
            <Package className="h-4 w-4" />
            <span>Product *</span>
          </label>
          <select
            value={formData.productId}
            onChange={(e) => handleInputChange('productId', e.target.value)}
            className={`input-field ${errors.productId ? 'border-red-500 focus:border-red-500' : ''}`}
          >
            <option value="">Select a product</option>
            {(state.products || []).map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ₹{product.price.toFixed(2)}/{product.unit}
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.productId}</p>
          )}
        </div>

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              {selectedProduct.image ? (
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-text dark:text-text-dark">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Price: ₹{selectedProduct.price.toFixed(2)}/{selectedProduct.unit}
                </p>
                {selectedProduct.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {selectedProduct.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

                 {/* Quantity and Date Row */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quantity */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-text dark:text-text-dark">
              <DollarSign className="h-4 w-4" />
              <span>Quantity *</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="Enter quantity"
                step={selectedProduct?.unit === 'g' || selectedProduct?.unit === 'ml' ? '0.1' : 
                      selectedProduct?.unit === 'kg' || selectedProduct?.unit === 'l' ? '0.5' : '1'}
                min="0"
                className={`input-field pr-16 ${errors.quantity ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                {selectedProduct?.unit || 'unit'}
              </div>
            </div>
            {errors.quantity && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-text dark:text-text-dark">
              <Calendar className="h-4 w-4" />
              <span>Date *</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`input-field ${errors.date ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-medium text-text dark:text-text-dark">
            <AlertTriangle className="h-4 w-4" />
            <span>Reason for Waste *</span>
          </label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reasonOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('reason', option.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    formData.reason === option.value
                      ? 'border-primary bg-primary/10 dark:bg-primary-dark/10'
                      : 'border-border dark:border-border-dark hover:border-primary/50 dark:hover:border-primary-dark/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${option.color}`} />
                    <span className="font-medium text-text dark:text-text-dark">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-text dark:text-text-dark">
            <FileText className="h-4 w-4" />
            <span>Notes (Optional)</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional details about the waste..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Cost Preview */}
        {selectedProduct && formData.quantity && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-800 dark:text-red-300">Estimated Waste Cost</span>
              </div>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                ₹{Math.round((selectedProduct.price * parseFloat(formData.quantity || '0')) * 100) / 100}
              </span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {formData.quantity} {selectedProduct.unit} × ₹{selectedProduct.price.toFixed(2)}
            </p>
          </div>
        )}

                 {/* Form Actions */}
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-border/50 dark:border-border-dark/50">
           <button
             type="button"
             onClick={onClose}
             className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors order-2 sm:order-1"
           >
             Cancel
           </button>
           <button
             type="submit"
             className="btn-primary flex items-center justify-center space-x-2 px-6 py-2 order-1 sm:order-2"
           >
             <Save className="h-4 w-4" />
             <span>Add Waste Entry</span>
           </button>
         </div>
      </form>
    </div>
  );
};

export default AddWasteEntryForm;
