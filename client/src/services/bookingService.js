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

// Mock bookings data for development
let MOCK_BOOKINGS = [
  {
    id: 'bk1',
    userId: 'user123',
    serviceId: 's1',
    providerId: 'provider123',
    serviceName: 'Professional Plumbing Service',
    serviceImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
    providerName: 'Cohen Plumbing Solutions',
    providerRating: 4.8,
    providerAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: '2025-05-10',
    time: '10:00 AM',
    address: 'Herzl 45, Tel Aviv',
    notes: 'Leaky faucet in kitchen',
    status: 'pending',
    paymentStatus: 'unpaid',
    servicePrice: 350,
    servicePriceUnit: 'hour',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'bk2',
    userId: 'user123',
    serviceId: 's2',
    providerId: 'provider456',
    serviceName: 'House Cleaning Service',
    serviceImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    providerName: 'Naki Babait',
    providerRating: 4.9,
    providerAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    date: '2025-05-15',
    time: '14:00',
    address: 'Dizengoff 120, Tel Aviv',
    notes: 'Please focus on kitchen and bathrooms',
    status: 'confirmed',
    paymentStatus: 'unpaid',
    servicePrice: 300,
    servicePriceUnit: 'hour',
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'bk3',
    userId: 'user123',
    serviceId: 's3',
    providerId: 'provider789',
    serviceName: 'Electrical Repair',
    serviceImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4',
    providerName: 'Abu Mazen Electrical',
    providerRating: 4.7,
    providerAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    date: '2025-04-30',
    time: '11:00',
    address: 'Yefet 18, Jaffa',
    notes: 'Need to fix outlet in living room',
    status: 'completed',
    paymentStatus: 'paid',
    servicePrice: 400,
    servicePriceUnit: 'hour',
    createdAt: new Date(Date.now() - 86400000 * 10)
  },
  {
    id: 'bk4',
    userId: 'user123',
    serviceId: 's4',
    providerId: 'provider101',
    serviceName: 'Gardening Service',
    serviceImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b',
    providerName: 'Gan Eden Landscaping',
    providerRating: 4.6,
    providerAvatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    date: '2025-05-03',
    time: '09:00',
    address: 'HaSharon 52, Ramat Gan',
    notes: 'Front and back yard, please trim hedges too',
    status: 'completed',
    paymentStatus: 'paid',
    servicePrice: 200,
    servicePriceUnit: 'job',
    createdAt: new Date(Date.now() - 86400000 * 5)
  },
  {
    id: 'bk5',
    userId: 'user123',
    serviceId: 's5',
    providerId: 'provider202',
    serviceName: 'Carpet Cleaning',
    serviceImage: 'https://images.unsplash.com/photo-1558317374-067fb5f30001',
    providerName: 'Nasreen Cleaning Services',
    providerRating: 4.8,
    providerAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    date: '2025-04-25',
    time: '13:00',
    address: 'Ben Gurion 78, Haifa',
    notes: 'Living room and hallway carpets',
    status: 'cancelled',
    paymentStatus: 'refunded',
    servicePrice: 280,
    servicePriceUnit: 'job',
    createdAt: new Date(Date.now() - 86400000 * 15)
  }
];

// Helper function to generate a random ID
const generateId = () => {
  return 'bk' + Math.random().toString(36).substring(2, 10);
};

/**
 * Create a new booking in Firestore
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} - The created booking with ID
 */
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating mock booking instead of using Firebase');
    
    // Create a mock booking with an ID
    const newBooking = {
      id: generateId(),
      ...bookingData,
      createdAt: new Date()
    };
    
    // Add to mock data
    MOCK_BOOKINGS.unshift(newBooking);
    
    console.log('Mock booking created:', newBooking);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newBooking;
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
    console.log('Fetching mock bookings instead of using Firebase');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock bookings filtered by userId
    // For demo purposes, we'll return all mock bookings regardless of userId
    return MOCK_BOOKINGS;
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
    console.log('Fetching mock provider bookings instead of using Firebase');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock bookings filtered by providerId
    return MOCK_BOOKINGS.filter(booking => booking.providerId === providerId);
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
    console.log('Fetching mock booking by ID instead of using Firebase');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find booking by ID
    const booking = MOCK_BOOKINGS.find(booking => booking.id === bookingId);
    
    if (booking) {
      return booking;
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
    console.log('Updating mock booking status instead of using Firebase');
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and update the booking
    const bookingIndex = MOCK_BOOKINGS.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex !== -1) {
      MOCK_BOOKINGS[bookingIndex] = {
        ...MOCK_BOOKINGS[bookingIndex],
        status,
        updatedAt: new Date()
      };
      
      return MOCK_BOOKINGS[bookingIndex];
    } else {
      throw new Error('Booking not found');
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};
