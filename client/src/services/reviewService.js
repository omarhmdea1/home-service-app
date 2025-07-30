import { getAuthToken } from '../utils/authToken';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Get reviews for a service or provider
export const getReviews = async (filters = {}) => {
  try {
    const token = await getAuthToken();
    const queryParams = new URLSearchParams();
    
    if (filters.serviceId) queryParams.append('serviceId', filters.serviceId);
    if (filters.providerId) queryParams.append('providerId', filters.providerId);
    
    const url = `${API_BASE_URL}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Submit a new review
export const submitReview = async (reviewData) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to submit review: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

// Provider respond to review
export const respondToReview = async (reviewId, responseText) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/respond`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: responseText })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to respond to review: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error responding to review:', error);
    throw error;
  }
}; 