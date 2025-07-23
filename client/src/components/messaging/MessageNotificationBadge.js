import React, { useState, useEffect } from 'react';
import { getUnreadMessageCount } from '../../services/messageService';
import { useAuth } from '../auth/AuthProvider';

const MessageNotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
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

    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(fetchUnreadCount, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUser, userRole, userProfile, needsRoleSelection]);

  // Don't show badge if no unread messages
  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default MessageNotificationBadge;
