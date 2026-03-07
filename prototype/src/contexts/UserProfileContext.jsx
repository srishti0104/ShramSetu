/**
 * User Profile Context
 * 
 * @fileoverview Manages user profile data and personalization
 */

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/aws/authService';

const UserProfileContext = createContext(null);

/**
 * User Profile Provider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function UserProfileProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
    
    // Listen for profile reload events
    const handleProfileReload = () => {
      console.log('🔄 Profile reload event received');
      loadUserProfile();
    };
    
    window.addEventListener('reloadUserProfile', handleProfileReload);
    
    return () => {
      window.removeEventListener('reloadUserProfile', handleProfileReload);
    };
  }, []);

  /**
   * Load user profile from localStorage or API
   */
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Loading user profile...');
      
      // First priority: Get authenticated user data from authService
      const authenticatedUser = authService.getUser();
      console.log('👤 Authenticated user from authService:', authenticatedUser);
      console.log('🔐 Is authenticated:', authService.isAuthenticated());
      
      if (authenticatedUser && authService.isAuthenticated()) {
        console.log('✅ Using authenticated user data');
        const profile = {
          name: authenticatedUser.profile?.name || authenticatedUser.name || 'User',
          firstName: (authenticatedUser.profile?.name || authenticatedUser.name || 'User').split(' ')[0],
          role: authenticatedUser.role,
          location: authenticatedUser.location || {},
          skills: authenticatedUser.skills || [],
          phoneNumber: authenticatedUser.phoneNumber,
          age: authenticatedUser.profile?.age,
          gender: authenticatedUser.profile?.gender,
          photo: authenticatedUser.profile?.photo,
          userId: authenticatedUser.userId,
          ...authenticatedUser.profile
        };
        console.log('📋 Final profile:', profile);
        setUserProfile(profile);
        setIsLoading(false);
        return;
      }
      
      console.log('⚠️ No authenticated user found, checking onboarding data...');
      
      // Second priority: Try to get from onboarding data
      const onboardingData = localStorage.getItem('onboarding_progress');
      if (onboardingData) {
        const parsed = JSON.parse(onboardingData);
        console.log('📝 Onboarding data:', parsed);
        if (parsed.profile && parsed.profile.name) {
          console.log('✅ Using onboarding data');
          setUserProfile({
            name: parsed.profile.name,
            firstName: parsed.profile.name.split(' ')[0],
            role: parsed.role,
            location: parsed.location,
            skills: parsed.skills || [],
            phoneNumber: parsed.phoneNumber,
            age: parsed.profile.age,
            gender: parsed.profile.gender,
            photo: parsed.profile.photo,
            ...parsed.profile
          });
          setIsLoading(false);
          return;
        }
      }

      console.log('⚠️ No onboarding data found, checking completed profile...');

      // Fallback: Try to get from completed onboarding (if available)
      const completedOnboarding = localStorage.getItem('user_profile');
      if (completedOnboarding) {
        const profile = JSON.parse(completedOnboarding);
        console.log('✅ Using completed profile:', profile);
        setUserProfile(profile);
      } else {
        console.log('⚠️ No profile found, using mock data');
        // Create mock profile for demo purposes
        const role = localStorage.getItem('user_role');
        setUserProfile({
          name: role === 'worker' ? 'राज कुमार' : 'प्रिया शर्मा',
          firstName: role === 'worker' ? 'राज' : 'प्रिया',
          role: role || 'worker',
          location: {
            city: 'मुंबई',
            state: 'महाराष्ट्र'
          },
          skills: role === 'worker' ? ['Construction', 'Painting', 'Electrical'] : [],
          phoneNumber: '+91 98765 43210'
        });
      }
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      // Set default profile
      setUserProfile({
        name: 'User',
        firstName: 'User',
        role: 'worker'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = (updates) => {
    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);
    
    // Save to localStorage
    try {
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  };

  /**
   * Get user's display name
   */
  const getDisplayName = () => {
    if (!userProfile) return 'User';
    return userProfile.firstName || userProfile.name || 'User';
  };

  /**
   * Get user's full name
   */
  const getFullName = () => {
    if (!userProfile) return 'User';
    return userProfile.name || 'User';
  };

  const value = {
    userProfile,
    isLoading,
    updateUserProfile,
    getDisplayName,
    getFullName,
    loadUserProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

/**
 * Hook to use user profile context
 */
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  
  return context;
}

export default UserProfileContext;