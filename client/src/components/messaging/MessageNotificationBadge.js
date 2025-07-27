import React, { useState, useEffect } from 'react';
import { getUnreadMessageCount } from '../../services/messageService';
import { useAuth } from '../auth/AuthProvider';
import socketService from '../../services/socketService';

const MessageNotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const { currentUser, userRole, userProfile, needsRoleSelection } = useAuth();

  useEffect(() => {
    // Only fetch unread messages if user is fully authenticated and has a profile
    if (!currentUser || !userRole || !userProfile || needsRoleSelection) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadMessageCount();
        setUnreadCount(count);
      } catch (error) {
        // Only log error if it's not an authentication issue during setup
        if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
          console.error('Error fetching unread message count:', error);
        }
      }
    };

    // Fetch immediately on mount
    fetchUnreadCount();

    // Set up Socket.io for real-time unread count updates
    socketService.connect();

    // Listen for new messages to update unread count
    const handleNewMessage = (message) => {
      // Only increment if the message is not from the current user
      if (message.senderId !== currentUser?.uid) {
        setUnreadCount(prev => prev + 1);
      }
    };

    socketService.onMessageReceived(handleNewMessage);

    // Listen for messages being marked as read via Socket.io
    const handleMessagesMarkedRead = (data) => {
      setIsUpdating(true);
      
      // If messages were marked as read by someone else, refresh unread count
      if (data.readBy !== currentUser?.uid) {
        fetchUnreadCount();
      } else {
        // If current user marked messages as read, decrease count locally
        setUnreadCount(prev => Math.max(0, prev - data.count));
      }
      
      // Reset updating animation after a brief delay
      setTimeout(() => setIsUpdating(false), 300);
    };

    socketService.onMessagesMarkedRead(handleMessagesMarkedRead);

    // Listen for messages being viewed/read to update unread count
    const handleMessagesViewed = () => {
      setIsUpdating(true);
      // Refresh unread count when messages are viewed
      fetchUnreadCount();
      // Reset updating animation after a brief delay
      setTimeout(() => setIsUpdating(false), 300);
    };

    window.addEventListener('messagesViewed', handleMessagesViewed);

    // Set up polling interval as fallback (every 60 seconds instead of 30)
    const intervalId = setInterval(fetchUnreadCount, 60000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      socketService.offMessageReceived();
      socketService.offMessagesMarkedRead();
      window.removeEventListener('messagesViewed', handleMessagesViewed);
    };
  }, [currentUser, userRole, userProfile, needsRoleSelection]);

  // Don't show badge if no unread messages
  if (unreadCount === 0) {
    return null;
  }

  return (
    <span 
      className={`absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
        isUpdating 
          ? 'bg-blue-500 scale-110' 
          : 'bg-red-500 scale-100'
      }`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default MessageNotificationBadge;
