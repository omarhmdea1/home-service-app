import React, { useState, useEffect } from 'react';
import { getUnreadMessageCount } from '../../services/messageService';
import { useAuth } from '../auth/AuthProvider';

const MessageNotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Only fetch unread messages if user is logged in
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadMessageCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread message count:', error);
      }
    };

    // Fetch immediately on mount
    fetchUnreadCount();

    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default MessageNotificationBadge;
