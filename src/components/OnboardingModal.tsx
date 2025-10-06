import React, { useState } from 'react';
import { User, Store, Sparkles, ArrowRight, CheckCircle, MapPin, Phone, Mail, Calendar, Building, Leaf } from 'lucide-react';

interface OnboardingData {
  name: string;
  storeName: string;
  storeType: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  establishedYear: string;
  businessSize: string;
  specialties: string[];
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete?: (data: OnboardingData) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    storeName: '',
    storeType: 'organic_store',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    establishedYear: '',
    businessSize: 'small',
    specialties: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  

  // Format phone number to 10 digits
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  // Validate Indian phone number (10 digits starting with 6-9)
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };



  const validateStep = (step: number) => {
    console.log(`Validating step ${step} with formData:`, formData);
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Your name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.storeName.trim()) {
        newErrors.storeName = 'Store name is required';
      } else if (formData.storeName.trim().length < 2) {
        newErrors.storeName = 'Store name must be at least 2 characters';
      }

      if (!formData.storeType) {
        newErrors.storeType = 'Please select your store type';
      }
    }

    if (step === 2) {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhoneNumber(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Store email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (step === 3) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }

      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }

      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
    }

    console.log(`Validation errors for step ${step}:`, newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('OnboardingModal handleSubmit called');
    
    if (!validateStep(currentStep)) {
      console.log('Validation failed for step:', currentStep);
      return;
    }

    console.log('Validation passed, submitting form data:', formData);
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Calling onComplete with formData:', formData);
      if (onComplete) {
        onComplete(formData);
        console.log('onComplete called successfully');
      } else {
        console.error('onComplete function is not provided');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof OnboardingData, value: string | string[]) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    if (field === 'phone') {
      // Format phone number to 10 digits
      const formattedPhone = formatPhoneNumber(value as string);
      setFormData(prev => ({ ...prev, [field]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };


  if (!isOpen) return null;


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store/Company Name *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.storeName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your store or company name"
                />
              </div>
              {errors.storeName && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.storeName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Type *
              </label>
              <select
                value={formData.storeType}
                onChange={(e) => handleInputChange('storeType', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.storeType ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="organic_store">Organic Store</option>
                <option value="farmers_market">Farmers Market</option>
                <option value="health_food_store">Health Food Store</option>
                <option value="grocery_store">Grocery Store</option>
                <option value="restaurant">Restaurant</option>
                <option value="cafe">Cafe</option>
                <option value="other">Other</option>
              </select>
              {errors.storeType && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.storeType}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store's Official Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter 10-digit Indian mobile number (starting with 6-9)
              </p>
              {errors.phone && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store's Official Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="info@yourstore.com"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is your store's business email (different from your personal sign-up email)
              </p>
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
              )}
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Size
              </label>
              <select
                value={formData.businessSize}
                onChange={(e) => handleInputChange('businessSize', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="small">Small (1-5 employees)</option>
                <option value="medium">Medium (6-20 employees)</option>
                <option value="large">Large (20+ employees)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year Established
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none ${
                    errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your complete store address"
                  rows={3}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Mumbai"
                />
                {errors.city && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.state ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Maharashtra"
                />
                {errors.state && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Store Specialties (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Organic Vegetables',
                  'Fresh Fruits',
                  'Dairy Products',
                  'Grains & Pulses',
                  'Spices & Herbs',
                  'Bakery Items',
                  'Beverages',
                  'Health Supplements'
                ].map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      formData.specialties.includes(specialty)
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4" />
                      <span>{specialty}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Contact Details';
      case 3:
        return 'Location & Specialties';
      default:
        return 'Setup';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Tell us about yourself and your store';
      case 2:
        return 'How can we reach your store?';
      case 3:
        return 'Where are you located and what do you specialize in?';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 transition-colors">
          {/* Header */}
          <div className="p-8 pb-6">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Organica AI! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {getStepDescription()}
              </p>
              
              {/* Progress Bar */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        step < currentStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Step {currentStep}: {getStepTitle()}
              </h3>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Setting up...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* OTP Verification Modal */}
    </>
  );
};

export default OnboardingModal;