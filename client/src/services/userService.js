/**
 * User service for handling user-related operations
 */
import { get, post, put } from './apiService';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getIdToken, setAuthToken } from '../utils/authToken';

/**
 * Get the current user's profile from the backend
 * @returns {Promise<Object>} - User profile data
 */
export const getCurrentUserProfile = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    await getIdToken();
    
    const userProfile = await get(`/users/${user.uid}`);
    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create or update user profile in the backend
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user profile
 */
export const updateUserProfile = async (userData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    await getIdToken();
    
    try {
      const updatedProfile = await put(`/users/${user.uid}`, userData);
      return updatedProfile;
    } catch (error) {
      if (error.message === 'User not found' || error.message.includes('duplicate key error')) {
        console.log('User not found in database or duplicate email, trying to find existing user by email');
        
        try {
          const existingUser = await get(`/users/email/${user.email}`);
          
          if (existingUser && existingUser._id) {
            console.log('Found existing user by email, updating with Firebase UID');
            const updatedUser = await put(`/users/id/${existingUser._id}`, {
              ...userData,
              firebaseUid: user.uid
            });
            return updatedUser;
          }
        } catch (findError) {
          console.log('No existing user found by email, creating new profile');
        }
        
        const newProfile = await post('/users', {
          ...userData,
          firebaseUid: user.uid,
          email: user.email || userData.email,
          name: userData.name || user.displayName || user.email.split('@')[0]
        });
        return newProfile;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Register a new provider
 * @param {Object} providerData - Provider registration data
 * @returns {Promise<Object>} - Provider profile
 */
export const registerProvider = async (providerData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    await getIdToken();
    
    const providerProfile = await post('/users/provider-registration', {
      ...providerData,
      firebaseUid: user.uid,
      email: user.email,
      name: user.displayName || providerData.name
    });
    
    return providerProfile;
  } catch (error) {
    console.error('Error registering as provider:', error);
    throw error;
  }
};

/**
 * Setup auth state listener to keep token updated
 */
export const setupAuthListener = () => {
  const auth = getAuth();
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        setAuthToken(token);
      } catch (error) {
        console.error('Error getting token:', error);
      }
    } else {
      setAuthToken(null);
    }
  });
};

/**
 * Get all providers
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of providers
 */
export const getProviders = async (filters = {}) => {
  try {
    const params = { ...filters, role: 'provider' };
    
    const providers = await get('/users', params);
    return providers;
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
};

/**
 * Get provider by ID
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} - Provider profile
 */
export const getProviderById = async (providerId) => {
  try {
    const provider = await get(`/users/${providerId}`);
    return provider;
  } catch (error) {
    console.error('Error fetching provider:', error);
    throw error;
  }
};
