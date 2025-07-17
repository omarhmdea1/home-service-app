/**
 * Base API service for making HTTP requests to our backend
 */
import { getAuthToken, getIdToken } from '../utils/authToken';

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Safely parse JSON response, handling non-JSON responses
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} - Parsed JSON data
 */
async function safeJsonParse(response) {
  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing response as JSON:', error);
    throw new Error(`Invalid response format from server (${response.status})`);
  }
}

/**
 * Safely handle error responses, with proper JSON parsing
 * @param {Response} response - Fetch API response
 */
async function handleErrorResponse(response) {
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  } catch (parseError) {
    throw new Error(`Server error: ${response.status} ${response.statusText || 'Unknown error'}`);
  }
}

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} - Response data
 */
export const get = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    const token = getAuthToken();
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    console.error(`Error in GET request to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise<any>} - Response data
 */
export const post = async (endpoint, data = {}) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    console.error(`Error in POST request to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise<any>} - Response data
 */
export const put = async (endpoint, data = {}) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    console.error(`Error in PUT request to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Response data
 */
export const del = async (endpoint) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    console.error(`Error in DELETE request to ${endpoint}:`, error);
    throw error;
  }
};
