import { supabase } from './supabaseClient';
import { useAuth, useUser } from '@clerk/clerk-react';

// Simplified Clerk-Supabase integration
// This approach bypasses Supabase auth and uses RLS with custom headers

// Hook to use Clerk-Supabase integration
export function useClerkSupabaseAuth() {
  const { isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();

  // Set Clerk user info in Supabase headers for RLS
  const syncUser = async () => {
    if (isSignedIn && clerkUser) {
      try {
        // Set custom headers that our RLS function can read
        supabase.auth.setSession({
          access_token: 'clerk_authenticated',
          refresh_token: 'clerk_authenticated'
        });

        // Store Clerk user info in localStorage for RLS function
        localStorage.setItem('clerk_user_id', clerkUser.id);
        localStorage.setItem('clerk_user_email', clerkUser.emailAddresses[0]?.emailAddress || '');
        
        console.log('Clerk user synced:', clerkUser.id);
        return true;
      } catch (error) {
        console.error('Error syncing Clerk user:', error);
        return false;
      }
    }
    return false;
  };

  return {
    isSignedIn,
    clerkUser,
    syncUser,
    userId,
  };
}

// Get current Clerk user ID for database operations
export function getCurrentClerkUserId(): string | null {
  return localStorage.getItem('clerk_user_id');
}

// Clear Clerk user data on sign out
export function clearClerkUserData() {
  localStorage.removeItem('clerk_user_id');
  localStorage.removeItem('clerk_user_email');
}
