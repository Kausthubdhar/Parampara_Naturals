import { supabase } from './supabaseClient';
import type { Session as SupabaseSession } from '@supabase/supabase-js';

// Supabase Auth types
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthSession {
  user: User | null;
  session: SupabaseSession | null;
}

// Auth state management
let currentUser: User | null = null;
let currentSession: SupabaseSession | null = null;

// Initialize auth state
export async function initializeAuth(): Promise<AuthSession> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { user: null, session: null };
    }

    // Update global state
    currentSession = session;
    currentUser = session?.user || null;

    return { user: currentUser, session: currentSession };
  } catch (error) {
    console.error('Error initializing auth:', error);
    return { user: null, session: null };
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: 'Failed to sign in with Google' };
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Email sign in error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sign in error:', error);
    return { success: false, error: 'Failed to sign in with email' };
  }
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Email sign up error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sign up error:', error);
    return { success: false, error: 'Failed to sign up with email' };
  }
}

// Sign out
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }

    currentUser = null;
    currentSession = null;
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return currentUser;
}

// Get current session
export function getCurrentSession(): SupabaseSession | null {
  return currentSession;
}

// Check if user is signed in
export function isSignedIn(): boolean {
  return currentUser !== null;
}


// Simple cache for user profile to prevent repeated API calls
let userProfileCache: { profile: any | null; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 seconds

// Get user profile with caching
export async function getUserProfile(): Promise<any | null> {
  try {
    // Check cache first
    if (userProfileCache && (Date.now() - userProfileCache.timestamp) < CACHE_DURATION) {
      return userProfileCache.profile;
    }

    // Get current user from Supabase directly
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No current user found for profile:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('supabase_user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      
      // If profile doesn't exist, try to create it manually
      if (error.code === 'PGRST116') {
        const created = await createUserProfileManually();
        if (created) {
          // Retry fetching the profile
          const { data: retryData, error: retryError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('supabase_user_id', user.id)
            .single();
          
          if (!retryError) {
            userProfileCache = { profile: retryData, timestamp: Date.now() };
            return retryData;
          }
        }
      }
      
      return null;
    }

    // Cache the result
    userProfileCache = { profile: data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Create user profile manually if it doesn't exist
export async function createUserProfileManually(): Promise<boolean> {
  try {
    // Get current user from Supabase directly
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No current user found for manual profile creation:', userError);
      return false;
    }

    // Create profile directly instead of using RPC function
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        supabase_user_id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        full_name: user.user_metadata?.full_name || user.email || '',
        is_onboarded: false,
        clerk_user_id: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile manually:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating user profile manually:', error);
    return false;
  }
}

// Clear user profile cache
export function clearUserProfileCache(): void {
  userProfileCache = null;
}

// Update user profile
export async function updateUserProfile(profileData: {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  store_name?: string;
  store_type?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  business_size?: string;
  established_year?: number;
  specialties?: string[];
  is_onboarded?: boolean;
}): Promise<boolean> {
  try {
    // Get current user from Supabase directly
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No current user found:', userError);
      return false;
    }

    console.log('Updating user profile for user:', user.id);
    console.log('Profile data:', profileData);

    // First, check if user profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('supabase_user_id', user.id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create it first
      console.log('User profile not found, creating new profile...');
      const { data: insertData, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          supabase_user_id: user.id,
          email: user.email || '',
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          full_name: profileData.full_name || '',
          store_name: profileData.store_name || '',
          store_type: profileData.store_type || 'organic_store',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          country: profileData.country || '',
          business_size: profileData.business_size || '',
          established_year: profileData.established_year || null,
          specialties: profileData.specialties || [],
          is_onboarded: profileData.is_onboarded || false,
          clerk_user_id: null // Explicitly set to null since we're using Supabase Auth
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return false;
      }

      console.log('User profile created successfully:', insertData);
      return true;
    } else if (fetchError) {
      console.error('Error checking existing profile:', fetchError);
      return false;
    } else {
      // Profile exists, update it
      console.log('User profile exists, updating...');
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('supabase_user_id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return false;
      }

      console.log('User profile updated successfully');
      // Clear cache after successful update
      clearUserProfileCache();
      return true;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// Check if user is onboarded
export async function isUserOnboarded(): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    return profile?.is_onboarded || false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

// Set up auth state listener
export function onAuthStateChange(callback: (user: User | null, session: SupabaseSession | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    currentSession = session;
    currentUser = session?.user || null;
    
    // Handle sign out
    if (event === 'SIGNED_OUT') {
      currentUser = null;
      currentSession = null;
    }
    
    callback(currentUser, currentSession);
  });
}

// Get user profile ID for database operations
export async function getCurrentUserProfileId(): Promise<string | null> {
  try {
    // Get current user from Supabase directly
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No current user found for profile ID:', userError);
      return null;
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('supabase_user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error getting user profile ID:', profileError);
      return null;
    }

    return profile.id;
  } catch (error) {
    console.error('Error getting user profile ID:', error);
    return null;
  }
}
