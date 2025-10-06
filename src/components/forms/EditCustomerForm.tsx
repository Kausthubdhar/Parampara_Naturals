import React, { useState, useEffect } from 'react';
import { User, Save, X, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Customer } from '../../types';

interface EditCustomerFormProps {
  customer: Customer;
  onClose: () => void;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ customer, onClose }) => {
  const { updateCustomer } = useApp();
  const [formData, setFormData] = useState({
    firstName: customer.firstName || customer.name?.split(' ')[0] || '',
    lastName: customer.lastName || customer.name?.split(' ').slice(1).join(' ') || '',
    phone: customer.phone,
    email: customer.email || '',
    address: customer.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      firstName: customer.firstName || customer.name?.split(' ')[0] || '',
      lastName: customer.lastName || customer.name?.split(' ').slice(1).join(' ') || '',
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
    });
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name is optional, no validation needed

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updates: Partial<Customer> = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
    };

    updateCustomer(customer.id, updates);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`input-field pl-10 ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
              placeholder="Enter first name"
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Last Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`input-field pl-10 ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
              placeholder="Enter last name"
            />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field pl-10 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
              placeholder="Enter phone number"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
              placeholder="Enter email address"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="input-field pl-10"
              placeholder="Enter customer address"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border/50 dark:border-border-dark/50">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Update Customer</span>
        </button>
      </div>
    </form>
  );
};

export default EditCustomerForm;
