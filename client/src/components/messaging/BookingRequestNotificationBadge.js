import React, { useState, useEffect } from 'react';
import { getProviderBookings } from '../../services/bookingService';
import { useAuth } from '../auth/AuthProvider';

const BookingRequestNotificationBadge = () => {
  const { currentUser, userRole, userProfile, needsRoleSelection } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Only fetch for providers who are fully authenticated
    if (!currentUser || userRole !== 'provider' || !userProfile || needsRoleSelection) {
      setPendingCount(0);
      return;
    }

    const fetchPendingCount = async () => {
      try {
        const bookings = await getProviderBookings(currentUser.uid);
        const pending = bookings.filter(booking => booking.status === 'pending').length;
        setPendingCount(pending);
      } catch (error) {
        // Only log error if it's not an authentication issue during setup
        if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
          console.error('Error fetching pending booking requests:', error);
        }
      }
    };

    // Fetch immediately on mount
    fetchPendingCount();

    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(fetchPendingCount, 30000);

    // Listen for booking status updates to refresh count
    const handleBookingUpdate = () => {
      setIsUpdating(true);
      fetchPendingCount();
      // Reset updating animation after a brief delay
      setTimeout(() => setIsUpdating(false), 300);
    };

    // Listen for custom events that might indicate booking changes
    window.addEventListener('bookingStatusUpdated', handleBookingUpdate);
    window.addEventListener('newBookingReceived', handleBookingUpdate);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('bookingStatusUpdated', handleBookingUpdate);
      window.removeEventListener('newBookingReceived', handleBookingUpdate);
    };
  }, [currentUser, userRole, userProfile, needsRoleSelection]);

  // Don't show badge if no pending requests or not a provider
  if (pendingCount === 0 || userRole !== 'provider') {
    return null;
  }

  return (
    <span 
      className={`absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
        isUpdating 
          ? 'bg-blue-500 scale-110' 
          : 'bg-orange-500 scale-100'
      }`}
    >
      {pendingCount > 99 ? '99+' : pendingCount}
    </span>
  );
};

export default BookingRequestNotificationBadge; 