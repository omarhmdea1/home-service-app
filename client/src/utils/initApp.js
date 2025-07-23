/**
 * Application initialization utilities
 */
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getIdToken, setAuthToken, removeAuthToken } from './authToken';

/**
 * Initialize the application
 * Sets up authentication listeners and token management
 */
export const initializeApp = () => {
  // Set up authentication state listener
  const auth = getAuth();
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get fresh token and store it
        const token = await user.getIdToken(true);
        setAuthToken(token);
        
        // Set up token refresh
        // Firebase tokens expire after 1 hour, so refresh every 55 minutes
        const REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes in milliseconds
        
        // Clear any existing interval
        if (window.tokenRefreshInterval) {
          clearInterval(window.tokenRefreshInterval);
        }
        
        // Set up new interval
        window.tokenRefreshInterval = setInterval(async () => {
          try {
            const freshToken = await user.getIdToken(true);
            setAuthToken(freshToken);
            console.log('Auth token refreshed');
          } catch (error) {
            console.error('Error refreshing auth token:', error);
          }
        }, REFRESH_INTERVAL);
        
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      }
    } else {
      // User is signed out
      removeAuthToken();
      
      // Clear token refresh interval
      if (window.tokenRefreshInterval) {
        clearInterval(window.tokenRefreshInterval);
        window.tokenRefreshInterval = null;
      }
    }
  });
  
  // Add axios interceptor for API errors (if using axios)
  // This would handle 401 errors and trigger token refresh
  
  if (process.env.NODE_ENV === 'development') {
    console.log('App initialization complete');
  }
};

/**
 * Clean up application resources
 * Call this when the app is unmounted
 */
export const cleanupApp = () => {
  // Clear token refresh interval
  if (window.tokenRefreshInterval) {
    clearInterval(window.tokenRefreshInterval);
    window.tokenRefreshInterval = null;
  }
};
