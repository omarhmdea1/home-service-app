import { get, post, put, del } from './apiService';
import { getAuth } from 'firebase/auth';

// Only using Firebase for authentication, not for data storage

/**
 * Get all services with optional filtering
 * @param {Object} filters - Optional filters (category, etc)
 * @param {number} limitCount - Optional limit on number of results
 * @returns {Promise<Array>} - Array of services
 */
export const getServices = async (filters = {}, limitCount = 50) => {
  try {
    // Prepare query parameters
    const params = { ...filters, limit: limitCount };
    
    // Call API to get services
    const services = await get('/services', params);
    return services;
  } catch (error) {
    console.error('Error fetching services from API:', error);
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
    // Call API to get service by ID
    const service = await get(`/services/${serviceId}`);
    return service;
  } catch (error) {
    console.error('Error fetching service from API:', error);
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
    // Get current user ID from Firebase Auth
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in to create a service');
    }
    
    // Add provider info to service data
    const serviceWithProviderInfo = {
      ...serviceData,
      providerId: user.uid,
      providerName: user.displayName || 'Service Provider',
      providerPhoto: user.photoURL || '',
      isActive: true
    };
    
    // Call API to create service
    const response = await post('/services', serviceWithProviderInfo);
    return response;
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
    // Call API to update service
    const response = await put(`/services/${serviceId}`, serviceData);
    return response;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

/**
 * Delete a service
 * @param {string} serviceId - The service ID
 * @returns {Promise<void>}
 */
export const deleteService = async (serviceId) => {
  try {
    // Call API to delete service
    await del(`/services/${serviceId}`);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};
