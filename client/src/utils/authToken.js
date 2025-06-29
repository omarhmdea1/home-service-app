/**
 * Utility functions for managing authentication tokens
 */
import { getAuth } from 'firebase/auth';

/**
 * Get the current user's ID token
 * @returns {Promise<string>} The ID token
 */
export const getIdToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Get fresh token and store it
    const token = await user.getIdToken(true);
    localStorage.setItem('authToken', token);
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    throw error;
  }
};

/**
 * Store the authentication token in localStorage
 * @param {string} token - The authentication token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

/**
 * Get the stored authentication token
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if a user is authenticated (has a token)
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};
