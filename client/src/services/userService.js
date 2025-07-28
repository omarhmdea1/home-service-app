/**
 * User service for handling user-related operations
 */
import { getAuth } from 'firebase/auth';
import { get, post, put } from './apiService';

/**
 * Get current user profile from MongoDB
 * @returns {Promise<Object>} - User profile
 */
export const getCurrentUserProfile = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return get(`/users/${user.uid}`);
};

/**
 * Create new user profile in MongoDB
 * @param {Object} profileData - User profile data
 * @returns {Promise<Object>} - Created user profile
 */
export const createUserProfile = async (profileData) => {
  const profile = await post('/users', profileData);
  return profile;
};

/**
 * Update existing user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Updated user profile
 */
export const updateUserProfile = async (userData) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const updatedProfile = await put(`/users/${user.uid}`, userData);
  return updatedProfile;
};

/**
 * Setup auth listener for token management
 */
export const setupAuthListener = () => {
  // This function is no longer needed as token management is handled by getIdToken()
};
