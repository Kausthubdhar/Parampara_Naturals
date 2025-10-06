import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Layout, BarChart3, Zap, Save, Check, Store, Phone, Mail, MapPin } from 'lucide-react';
import { getCurrentUser, updateUserProfile, getUserProfile } from '../lib/supabaseAuth';

interface SettingsProps {
  onClose?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'compact' | 'detailed' | 'analytics'>('detailed');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  
  // Store information state
  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    storePhone: '',
    storeEmail: '',
    address: '',
    city: '',
    state: '',
    country: 'India'
  });
  
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load dashboard template preference
  useEffect(() => {
    const savedTemplate = localStorage.getItem('dashboard_template') as 'compact' | 'detailed' | 'analytics';
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
  }, []);

  // Load user profile and store information
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
          setStoreInfo({
            storeName: profile?.store_name || localStorage.getItem('organica_store_name') || '',
            storePhone: profile?.phone || localStorage.getItem('organica_phone') || '',
            storeEmail: profile?.email || currentUser?.email || '',
            address: profile?.address || localStorage.getItem('organica_address') || '',
            city: profile?.city || localStorage.getItem('organica_city') || '',
            state: profile?.state || localStorage.getItem('organica_state') || '',
            country: profile?.country || localStorage.getItem('organica_country') || 'India'
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to localStorage
          setStoreInfo({
            storeName: localStorage.getItem('organica_store_name') || '',
            storePhone: localStorage.getItem('organica_phone') || '',
            storeEmail: currentUser?.email || '',
            address: localStorage.getItem('organica_address') || '',
            city: localStorage.getItem('organica_city') || '',
            state: localStorage.getItem('organica_state') || '',
            country: localStorage.getItem('organica_country') || 'India'
          });
        }
      }
    };

    loadUserData();
  }, []);

  const handleTemplateChange = (template: 'compact' | 'detailed' | 'analytics') => {
    setSelectedTemplate(template);
    localStorage.setItem('dashboard_template', template);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        // Update user profile with store information
        await updateUserProfile({
          store_name: storeInfo.storeName,
          phone: storeInfo.storePhone,
          address: storeInfo.address,
          city: storeInfo.city,
          state: storeInfo.state,
          country: storeInfo.country
        });

        // Update localStorage as backup
        localStorage.setItem('organica_store_name', storeInfo.storeName);
        localStorage.setItem('organica_phone', storeInfo.storePhone);
        localStorage.setItem('organica_address', storeInfo.address);
        localStorage.setItem('organica_city', storeInfo.city);
        localStorage.setItem('organica_state', storeInfo.state);
        localStorage.setItem('organica_country', storeInfo.country);

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('storeInfoChanged'));
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const templates = [
    {
      id: 'compact' as const,
      name: 'Compact',
      description: 'Minimal view with essential metrics',
      icon: Layout,
      features: ['Quick overview', 'Essential metrics', 'Clean layout']
    },
    {
      id: 'detailed' as const,
      name: 'Detailed',
      description: 'Comprehensive view with all features',
      icon: BarChart3,
      features: ['Full analytics', 'Detailed charts', 'Complete metrics']
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      description: 'Data-focused view for insights',
      icon: Zap,
      features: ['Advanced analytics', 'Trend analysis', 'Performance insights']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text dark:text-text-dark">Settings</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark">Manage your preferences and store information</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>


      {/* Dashboard Template Selection */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-border/50 dark:border-border-dark/50">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Dashboard Template</h3>
        <p className="text-text-secondary dark:text-text-secondary-dark mb-6">Choose your preferred dashboard layout</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate === template.id;
            
            return (
              <div
                key={template.id}
                onClick={() => handleTemplateChange(template.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary-dark/10'
                    : 'border-border dark:border-border-dark hover:border-primary/50 dark:hover:border-primary-dark/50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark'}`} />
                  <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-text dark:text-text-dark'}`}>
                    {template.name}
                  </h4>
                </div>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-3">
                  {template.description}
                </p>
                <ul className="space-y-1">
                  {template.features.map((feature, index) => (
                    <li key={index} className="text-xs text-text-secondary dark:text-text-secondary-dark flex items-center">
                      <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Store Information */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-border/50 dark:border-border-dark/50">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Store Information</h3>
        <p className="text-text-secondary dark:text-text-secondary-dark mb-6">Update your store details and contact information</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              Store Name
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
              <input
                type="text"
                value={storeInfo.storeName}
                onChange={(e) => setStoreInfo({ ...storeInfo, storeName: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter store name"
              />
            </div>
          </div>

          {/* Store Phone */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              Store Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
              <input
                type="tel"
                value={storeInfo.storePhone}
                onChange={(e) => setStoreInfo({ ...storeInfo, storePhone: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Store Email */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              Store Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
              <input
                type="email"
                value={storeInfo.storeEmail}
                onChange={(e) => setStoreInfo({ ...storeInfo, storeEmail: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter address"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              City
            </label>
            <input
              type="text"
              value={storeInfo.city}
              onChange={(e) => setStoreInfo({ ...storeInfo, city: e.target.value })}
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter city"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              State
            </label>
            <input
              type="text"
              value={storeInfo.state}
              onChange={(e) => setStoreInfo({ ...storeInfo, state: e.target.value })}
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter state"
            />
          </div>
        </div>
      </div>

      {/* User Information (Read-only) */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-border/50 dark:border-border-dark/50">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Account Information</h3>
        <p className="text-text-secondary dark:text-text-secondary-dark mb-6">Your account details (read-only)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={user?.user_metadata?.full_name || user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;