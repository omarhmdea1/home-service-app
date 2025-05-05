import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Create a new booking in Firestore
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} - The created booking with ID
 */
export const createBooking = async (bookingData) => {
  try {
    // Add timestamp
    const bookingWithTimestamp = {
      ...bookingData,
      createdAt: serverTimestamp(),
      status: 'pending',
      paymentStatus: 'unpaid'
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingWithTimestamp);
    
    return {
      id: docRef.id,
      ...bookingWithTimestamp
    };
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
    const q = query(
      collection(db, BOOKINGS_COLLECTION), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
    const q = query(
      collection(db, BOOKINGS_COLLECTION), 
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Booking not found');
    }
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
    
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated booking
    const updatedBooking = await getBookingById(bookingId);
    return updatedBooking;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};
