import { get, post, put, del, getPublic } from './apiService';
import { getAuth } from 'firebase/auth';

/**
 * Get all services with optional filtering
 * @param {Object} params - Filter parameters (category, search, etc.)
 * @returns {Promise<Array>} - Array of services
 */
export const getServices = async (params = {}) => {
  try {
    // Use public request since services list should be publicly accessible
    const response = await getPublic('/services', params);
    
    // Handle the new API response format that wraps services in an object
    const services = response.services || response || [];
    
    console.log('🔍 getServices response:', { 
      responseType: typeof response, 
      hasServices: !!response.services,
      servicesCount: services.length,
      firstService: services[0]?.title || 'N/A'
    });
    
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
    // Use public request since service details should be publicly accessible
    const service = await getPublic(`/services/${serviceId}`);
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
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in to create a service');
    }
    
    const serviceWithProviderInfo = {
      ...serviceData,
      providerId: user.uid,
      providerName: user.displayName || 'Service Provider',
      providerPhoto: user.photoURL || '',
      isActive: true
    };
    
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
    await del(`/services/${serviceId}`);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};
