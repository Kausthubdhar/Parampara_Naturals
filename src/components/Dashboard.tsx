import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getCurrentUser, getUserProfile } from '../lib/supabaseAuth';
import { CompactDashboard, DetailedDashboard, AnalyticsDashboard } from './DashboardTemplates';

const Dashboard: React.FC = () => {
  const { state, updateProduct, showNotification } = useApp();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dashboardTemplate, setDashboardTemplate] = useState<'compact' | 'detailed' | 'analytics'>('detailed');
  
  // Load user and profile from Supabase (optimized - single call)
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile in Dashboard:', error);
        }
      }
    };

    loadUserData();
  }, []);

  // Listen for user profile updates (e.g., after onboarding)
  useEffect(() => {
    const handleProfileUpdate = () => {
      const loadUpdatedProfile = async () => {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading updated user profile:', error);
        }
      };
      loadUpdatedProfile();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  // Load dashboard template preference
  useEffect(() => {
    const savedTemplate = localStorage.getItem('dashboard_template') as 'compact' | 'detailed' | 'analytics';
    if (savedTemplate) {
      setDashboardTemplate(savedTemplate);
    }
  }, []);

  // Listen for template changes from Settings
  useEffect(() => {
    const handleTemplateChange = (event: CustomEvent) => {
      const { template } = event.detail;
      setDashboardTemplate(template);
    };

    window.addEventListener('dashboardTemplateChanged', handleTemplateChange as EventListener);
    
    return () => {
      window.removeEventListener('dashboardTemplateChanged', handleTemplateChange as EventListener);
    };
  }, []);
  
  // Get user data from Supabase profile, localStorage, or user
  const userName = userProfile?.full_name || localStorage.getItem('organica_user_name') || user?.user_metadata?.first_name || '';
  const storeName = userProfile?.store_name || localStorage.getItem('organica_store_name') || 'My Organic Store';
  
  
  const { products, sales, customers, loading } = state;
  
  // Add null checks to prevent runtime errors
  const safeProducts = products || [];
  const safeSales = sales || [];
  const safeCustomers = customers || [];

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-secondary-dark">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  const stats = {
    totalSales: safeSales.reduce((sum, sale) => sum + sale.total, 0),
    totalOrders: safeSales.length,
    totalProducts: safeProducts.length,
    totalCustomers: safeCustomers.length,
  };


  // Generate sales data for charts
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const daySales = safeSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: daySales.reduce((sum, sale) => sum + sale.total, 0),
      orders: daySales.length,
    };
  });

  const handleRestock = (productId: string) => {
    const product = safeProducts.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { stock: product.stock + 50 });
      showNotification(`${product.name} restocked successfully!`, 'success');
    }
  };

  const lowStockProducts = safeProducts.filter(p => p.stock < (p.minStock || 10));

  // Render the appropriate dashboard template
  const templateProps = {
    template: dashboardTemplate,
    stats,
    salesData,
    products: safeProducts,
    sales: safeSales,
    customers: safeCustomers,
    lowStockProducts,
    userName,
    storeName,
    onRestock: handleRestock
  };


  switch (dashboardTemplate) {
    case 'compact':
      return <CompactDashboard {...templateProps} />;
    case 'analytics':
      return <AnalyticsDashboard {...templateProps} />;
    case 'detailed':
    default:
      return <DetailedDashboard {...templateProps} />;
  }
};

export default Dashboard;
