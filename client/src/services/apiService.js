/**
 * Base API service for making HTTP requests to our backend
 */
import { getAuthToken, getIdToken } from '../utils/authToken';

// Use relative URLs in production, localhost in development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

/**
 * Get a fresh authentication token, automatically refreshing if needed
 * @returns {Promise<string>} - Fresh authentication token
 */
async function getFreshToken() {
  try {
    // Always get a fresh token to avoid expiration issues
    return await getIdToken();
  } catch (error) {
    console.error('Error getting fresh token:', error);
    throw new Error('Authentication failed. Please log in again.');
  }
}

/**
 * Make an authenticated request with automatic token refresh
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {boolean} isRetry - Whether this is a retry attempt
 * @returns {Promise<Response>} - Fetch response
 */
async function makeAuthenticatedRequest(url, options = {}, isRetry = false) {
  try {
    // Get fresh token for authenticated requests
    const token = await getFreshToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If token expired and this isn't a retry, try once more with fresh token
    if ((response.status === 401 || response.status === 403) && !isRetry) {
      console.log('Token expired, retrying with fresh token...');
      return makeAuthenticatedRequest(url, options, true);
    }
    
    return response;
  } catch (error) {
    console.error('Error making authenticated request:', error);
    throw error;
  }
}

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
    
    const response = await makeAuthenticatedRequest(url.toString(), {
      method: 'GET'
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
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
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
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
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
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE'
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

// ✅ PUBLIC REQUEST FUNCTIONS (no authentication required)

/**
 * Make a public GET request (no authentication required)
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Response data
 */
export const getPublic = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    console.log('🌐 Making public GET request to:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Public API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    console.error(`Error in public GET request to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a public POST request (no authentication required)
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} - Response data
 */
export const postPublic = async (endpoint, data = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🌐 Making public POST request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Public API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    console.error(`Error in public POST request to ${endpoint}:`, error);
    throw error;
  }
};
