import { get, post, put, del } from './apiService';
import { getAuth } from 'firebase/auth';

// Only using Firebase for authentication, not for data storage

/**
 * Create a new booking
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} - The created booking with ID
 */
export const createBooking = async (bookingData) => {
  try {
    // Get current user ID from Firebase Auth
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in to create a booking');
    }
    
    // Add user info to booking data
    const bookingWithUserInfo = {
      ...bookingData,
      userId: user.uid,
      userName: user.displayName || 'User',
      userEmail: user.email
    };
    
    // Call API to create booking
    const response = await post('/bookings', bookingWithUserInfo);
    return response.booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get all bookings for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of bookings
 */
export const getUserBookings = async (userId) => {
  try {
    // Call API to get user bookings
    const bookings = await get('/bookings', { userId });
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

/**
 * Get all bookings for a provider
 * @param {string} providerId - The provider ID
 * @returns {Promise<Array>} - Array of bookings
 */
export const getProviderBookings = async (providerId) => {
  try {
    // Call API to get provider bookings
    const bookings = await get('/bookings', { providerId });
    return bookings;
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    throw error;
  }
};

/**
 * Get a booking by ID
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} - The booking
 */
export const getBookingById = async (bookingId) => {
  try {
    // Call API to get booking by ID
    const booking = await get(`/bookings/${bookingId}`);
    return booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Update booking status
 * @param {string} bookingId - The booking ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - The updated booking
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    // Call API to update booking status
    const response = await put(`/bookings/${bookingId}/status`, { status });
    return response.booking;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

/**
 * Delete a booking
 * @param {string} bookingId - The booking ID
 * @returns {Promise<void>}
 */
export const deleteBooking = async (bookingId) => {
  try {
    // Call API to delete booking
    await del(`/bookings/${bookingId}`);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
