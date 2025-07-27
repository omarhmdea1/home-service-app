import { get, post, put, del } from './apiService';

/**
 * Send a new message
 * @param {Object} messageData - Message data (bookingId, recipientId, content, attachments)
 * @returns {Promise<Object>} - The created message
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await post('/messages', messageData);
    return response?.data || response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get all messages for a specific booking
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} - Response object with data array
 */
export const getBookingMessages = async (bookingId) => {
  try {
    const response = await get(`/messages/booking/${bookingId}`);
    return response;
  } catch (error) {
    console.error('Error fetching booking messages:', error);
    throw error;
  }
};

/**
 * Get count of unread messages for the current user
 * @returns {Promise<Object>} - Object containing unreadCount
 */
export const getUnreadMessageCount = async () => {
  try {
    const response = await get('/messages/unread');
    return response.data.unreadCount;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return 0;
  }
};

/**
 * Mark a message as read
 * @param {string} messageId - The message ID
 * @returns {Promise<Object>} - The updated message
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await put(`/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Get all conversations for the current user
 * @returns {Promise<Array>} - Array of conversations with last message and unread count
 */
export const getConversations = async () => {
  try {
    const response = await get('/messages/conversations');
    return response?.data || response || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Delete entire conversation (all messages for a booking)
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} - Delete result
 */
export const deleteConversation = async (bookingId) => {
  try {
    const response = await del(`/messages/conversation/${bookingId}`);
    return response;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
