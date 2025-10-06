import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { 
  initializeAuth, 
  onAuthStateChange, 
  getCurrentUser, 
  getUserProfile, 
  updateUserProfile, 
  isUserOnboarded,
  createUserProfileManually
} from './lib/supabaseAuth';
// Test functions removed from production
import OnboardingModal from './components/OnboardingModal';
import OnboardingTour from './components/OnboardingTour';
import MobileApp from './components/MobileApp';
import Header from './components/Header';
import TopNavigation from './components/TopNavigation';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Analytics from './components/Analytics';
import WasteManagement from './components/WasteManagement';
import Settings from './components/Settings';
import Notification from './components/Notification';
import Modal from './components/Modal';
import AddProductForm from './components/forms/AddProductForm';
import NewSaleForm from './components/forms/NewSaleForm';
import LandingPage from './components/LandingPage';

// Main App Content Component
const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management'>('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add-product' | 'new-sale' | 'settings'>('new-sale');
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Initialize auth and set up listener
  useEffect(() => {
    const initAuth = async () => {
        try {
          // Initialize auth state
        const { user: initialUser } = await initializeAuth();
        setUser(initialUser);
        setIsLoading(false);

        // Set up auth state listener
        const { data: { subscription } } = onAuthStateChange(async (user, session) => {
          setUser(user);
          
          if (user) {
            // Only create profile if it doesn't exist (for new users)
            try {
              const userProfile = await getUserProfile();
              
              if (!userProfile) {
                await createUserProfileManually();
              }
            } catch (error) {
              console.error('Error handling user profile:', error);
            }
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check onboarding status when user changes
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        try {
          const isOnboarded = await isUserOnboarded();
          
          if (!isOnboarded) {
            setShowOnboarding(true);
          } else {
            // User is onboarded, show tour if they haven't seen it
            const hasSeenTour = localStorage.getItem('has_seen_tour');
            if (!hasSeenTour) {
              setShowTour(true);
            }
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Fallback to localStorage check
          const hasOnboarded = localStorage.getItem('organica_onboarded');
          if (!hasOnboarded) {
            setShowOnboarding(true);
          } else {
            const hasSeenTour = localStorage.getItem('has_seen_tour');
            if (!hasSeenTour) {
              setShowTour(true);
            }
          }
        }
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleOnboardingComplete = async (data: { 
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
    specialties: string[] 
  }) => {
    console.log('handleOnboardingComplete called with data:', data);
    
    if (user) {
      console.log('Supabase user found:', user.id);
      
      try {
        console.log('Attempting to update user profile...');
        
        // Update Supabase profile with all onboarding data
        const success = await updateUserProfile({
          first_name: data.name.split(' ')[0] || '',
          last_name: data.name.split(' ').slice(1).join(' ') || '',
          full_name: data.name,
          store_name: data.storeName,
          store_type: data.storeType,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          business_size: data.businessSize,
          established_year: data.establishedYear ? parseInt(data.establishedYear) : undefined,
          specialties: data.specialties,
          is_onboarded: true
        });

        console.log('Update profile result:', success);

        if (success) {
          console.log('Profile updated successfully, proceeding to dashboard...');
          console.log('Profile updated successfully, updating localStorage...');
          
          // Store onboarding data in localStorage as backup
          localStorage.setItem('organica_onboarded', 'true');
          localStorage.setItem('organica_user_name', data.name);
          localStorage.setItem('organica_store_name', data.storeName);
          localStorage.setItem('organica_store_type', data.storeType);
          localStorage.setItem('organica_phone', data.phone);
          localStorage.setItem('organica_address', data.address);
          localStorage.setItem('organica_city', data.city);
          localStorage.setItem('organica_state', data.state);
          localStorage.setItem('organica_business_size', data.businessSize);
          localStorage.setItem('organica_established_year', data.establishedYear);
          localStorage.setItem('organica_specialties', JSON.stringify(data.specialties));
          
          console.log('Setting showOnboarding to false and showTour to true...');
          setShowOnboarding(false);
          
          // Dispatch event to notify components that user profile has been updated
          window.dispatchEvent(new CustomEvent('userProfileUpdated'));
          
          // Show tour after onboarding
          setShowTour(true);
          console.log('Onboarding completed successfully');
        } else {
          console.error('Failed to update user profile, using fallback...');
          // Fallback: just update localStorage and proceed
          localStorage.setItem('organica_onboarded', 'true');
          localStorage.setItem('organica_user_name', data.name);
          localStorage.setItem('organica_store_name', data.storeName);
          localStorage.setItem('organica_store_type', data.storeType);
          localStorage.setItem('organica_phone', data.phone);
          localStorage.setItem('organica_address', data.address);
          localStorage.setItem('organica_city', data.city);
          localStorage.setItem('organica_state', data.state);
          localStorage.setItem('organica_business_size', data.businessSize);
          localStorage.setItem('organica_established_year', data.establishedYear);
          localStorage.setItem('organica_specialties', JSON.stringify(data.specialties));
          
          console.log('Setting showOnboarding to false and showTour to true...');
          setShowOnboarding(false);
          setShowTour(true);
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Fallback to localStorage only
        console.log('Using fallback - updating localStorage only...');
        localStorage.setItem('organica_onboarded', 'true');
        localStorage.setItem('organica_user_name', data.name);
        localStorage.setItem('organica_store_name', data.storeName);
        setShowOnboarding(false);
        setShowTour(true);
      }
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem('has_seen_tour', 'true');
    setShowTour(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem('has_seen_tour', 'true');
    setShowTour(false);
  };

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not signed in
  if (!user) {
    return <LandingPage />;
  }

  // Show onboarding if user is signed in but hasn't completed onboarding
  if (user && showOnboarding) {
    return <OnboardingModal isOpen={true} onComplete={handleOnboardingComplete} />;
  }

  const openModal = (type: 'add-product' | 'new-sale') => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'add-product':
        return <AddProductForm onClose={closeModal} />;
      case 'new-sale':
        return <NewSaleForm onClose={closeModal} />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add-product':
        return 'Add New Product';
      case 'new-sale':
        return 'New Sale';
      default:
        return '';
    }
  };

  if (isMobile) {
    return (
      <AppProvider>
        <MobileApp 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          onNewSale={() => openModal('new-sale')}
          onAddProduct={() => openModal('add-product')}
        />
        <Notification />
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={getModalTitle()}
          size={modalType === 'new-sale' ? '3xl' : 'lg'}
        >
          {renderModalContent()}
        </Modal>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors duration-200">
        <Header 
          onNewSale={() => openModal('new-sale')} 
          onSettings={() => setShowSettings(true)} 
        />
        <TopNavigation 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          onNewSale={() => openModal('new-sale')}
        />
        <main className="p-4 sm:p-6">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'sales' && <Orders onNewSale={() => openModal('new-sale')} />}
          {currentView === 'products' && <Products onAddProduct={() => openModal('add-product')} />}
          {currentView === 'customers' && <Customers />}
          {currentView === 'analytics' && <Analytics />}
          {currentView === 'waste-management' && <WasteManagement />}
        </main>
        <Notification />
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={getModalTitle()}
          size={modalType === 'new-sale' ? '3xl' : 'lg'}
        >
          {renderModalContent()}
        </Modal>
        
        {/* Settings Modal */}
        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="Settings"
          size="xl"
        >
          <Settings onClose={() => setShowSettings(false)} />
        </Modal>
        
        <OnboardingTour 
          isOpen={showTour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      </div>
    </AppProvider>
  );
};

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;