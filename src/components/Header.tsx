import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Sparkles, LogOut, Settings, Store } from 'lucide-react';
import { getCurrentUser, getUserProfile, signOut } from '../lib/supabaseAuth';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onNewSale?: () => void;
  onSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewSale, onSettings }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load user and profile from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserData();
  }, []);

  // Listen for store information changes from Settings
  useEffect(() => {
    const handleStoreInfoChange = () => {
      // Force re-render by updating state
      setUserProfile((prev: any) => ({ ...prev }));
    };

    window.addEventListener('storeInfoChanged', handleStoreInfoChange);
    
    return () => {
      window.removeEventListener('storeInfoChanged', handleStoreInfoChange);
    };
  }, []);

  // Get user data from Supabase profile, localStorage, or user
  const userName = userProfile?.full_name || localStorage.getItem('organica_user_name') || user?.user_metadata?.first_name || 'User';
  const storeName = userProfile?.store_name || localStorage.getItem('organica_store_name') || 'Organica AI';
  
  // Listen for user profile updates from onboarding
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Reload user profile when it's updated
      if (user) {
        const loadUserProfile = async () => {
          try {
            const profile = await getUserProfile();
            setUserProfile(profile);
          } catch (error) {
            console.error('Error reloading user profile:', error);
          }
        };
        loadUserProfile();
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border-b border-border/50 dark:border-border-dark/50 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-2 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">
              {storeName}
            </h1>
            <p className="text-text-secondary dark:text-text-secondary-dark text-xs sm:text-sm font-medium">
              {userName ? `Welcome back, ${userName}!` : 'Intelligent Organic Store Management'}
            </p>
          </div>
          <div className="block sm:hidden">
            <h1 className="text-lg font-bold gradient-text">OA</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          <NotificationDropdown />
          <div className="relative" ref={userMenuRef}>
            <button 
              className="btn-ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="User Menu"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-border/50 dark:border-border-dark/50 p-5 z-50 min-w-max">
                {/* User Profile Section */}
                <div className="flex items-start space-x-4 mb-5 pb-5 border-b border-border/30 dark:border-border-dark/30">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-xl flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text dark:text-text-dark text-lg truncate">
                      {userName || 'User'}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Premium User
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Store Profile Section */}
                {storeName && storeName !== 'Organica AI' && (
                  <div className="flex items-start space-x-4 mb-5 pb-5 border-b border-border/30 dark:border-border-dark/30">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-xl flex-shrink-0">
                      <Store className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text dark:text-text-dark truncate">
                        {storeName}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                        Business Profile
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      onSettings?.();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Account Settings</span>
                  </button>
                  <button 
                    onClick={async () => {
                      await signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
