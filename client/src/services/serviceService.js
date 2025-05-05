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
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

const SERVICES_COLLECTION = 'services';

/**
 * Get all services with optional filtering
 * @param {Object} filters - Optional filters (category, etc)
 * @param {number} limitCount - Optional limit on number of results
 * @returns {Promise<Array>} - Array of services
 */
export const getServices = async (filters = {}, limitCount = 50) => {
  try {
    let q = collection(db, SERVICES_COLLECTION);
    
    // Apply filters if provided
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.providerId) {
      q = query(q, where('providerId', '==', filters.providerId));
    }
    
    // Apply ordering and limit
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

/**
 * Get a service by ID
 * @param {string} serviceId - The service ID
 * @returns {Promise<Object>} - The service
 */
export const getServiceById = async (serviceId) => {
  try {
    const docRef = doc(db, SERVICES_COLLECTION, serviceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Service not found');
    }
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

/**
 * Create a new service
 * @param {Object} serviceData - The service data
 * @returns {Promise<Object>} - The created service with ID
 */
export const createService = async (serviceData) => {
  try {
    // Add timestamp
    const serviceWithTimestamp = {
      ...serviceData,
      createdAt: serverTimestamp(),
      isActive: true
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), serviceWithTimestamp);
    
    return {
      id: docRef.id,
      ...serviceWithTimestamp
    };
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

/**
 * Update a service
 * @param {string} serviceId - The service ID
 * @param {Object} serviceData - The updated service data
 * @returns {Promise<Object>} - The updated service
 */
export const updateService = async (serviceId, serviceData) => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
    
    // Add updated timestamp
    const updatedData = {
      ...serviceData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(serviceRef, updatedData);
    
    // Get the updated service
    const updatedService = await getServiceById(serviceId);
    return updatedService;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};
