import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion } from 'framer-motion';
import { getUserBookings, getProviderBookings, updateBookingStatus } from '../services/bookingService';
import { getServiceById } from '../services/serviceService';
import { format, parseISO } from 'date-fns';

const MyBookings = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [serviceDetails, setServiceDetails] = useState({});
  
  // Default placeholder images as data URIs
  const defaultServiceImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20fill%3D%22%23e9ecef%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23495057%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22150%22%20y%3D%22110%22%3EService%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
  const defaultAvatarImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2264%22%20height%3D%2264%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20fill%3D%22%23e9ecef%22%20width%3D%2264%22%20height%3D%2264%22%2F%3E%3Ctext%20fill%3D%22%23495057%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%20x%3D%2232%22%20y%3D%2232%22%3EProvider%3C%2Ftext%3E%3C%2Fsvg%3E';
  
  // Check for success message from various sources
  useEffect(() => {
    // Check for direct success message in sessionStorage
    if (sessionStorage.getItem('bookingSuccess') === 'true') {
      const message = sessionStorage.getItem('bookingMessage') || 'Booking was successful!';
      setSuccess(message);
      setActiveTab('upcoming'); // Switch to upcoming tab to show the new booking
      
      // Clear sessionStorage
      sessionStorage.removeItem('bookingSuccess');
      sessionStorage.removeItem('bookingMessage');
      
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Check for state passed from Link component (legacy support)
    if (location.state?.bookingSuccess) {
      setSuccess(location.state.message || 'Booking was successful!');
      setActiveTab('upcoming');
      
      // Clear the location state
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Check for lastBookingId in sessionStorage (alternative method)
    const lastBookingId = sessionStorage.getItem('lastBookingId');
    if (lastBookingId) {
      setSuccess('Your booking has been successfully submitted! The service provider will confirm your booking soon.');
      setActiveTab('upcoming');
      
      // Remove from session storage
      sessionStorage.removeItem('lastBookingId');
      
      // Auto-hide success message
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Handle role-based access
  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading) {
      if (!currentUser) {
        navigate('/login', { state: { from: '/my-bookings' } });
        return;
      }
      
      // If user role is explicitly set to something other than 'customer'
      if (userRole !== null && userRole !== 'customer') {
        console.log('User role not customer:', userRole);
        navigate('/services');
        return;
      }
      
      // If user role is null but user is authenticated, we'll assume they're a customer
      // and proceed with loading their bookings
    }
  }, [currentUser, userRole, authLoading, navigate]);

  // Fetch bookings when component mounts
  useEffect(() => {
    if (currentUser && !authLoading) {
      fetchBookings();
    }
  }, [currentUser, authLoading]);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      let response;
      
      // Get bookings based on user role
      if (userRole === 'provider') {
        response = await getProviderBookings(currentUser.uid);
        console.log('Provider bookings:', response);
      } else {
        response = await getUserBookings(currentUser.uid);
        console.log('Customer bookings:', response);
      }
      
      // Process bookings
      if (response && Array.isArray(response)) {
        // Sort by date (newest first)
        const sortedBookings = response.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Fetch service details for each booking
        const bookingsWithDetails = await Promise.all(sortedBookings.map(async (booking) => {
          try {
            const serviceData = await getServiceById(booking.serviceId);
            // Store service details in state for quick access
            setServiceDetails(prev => ({
              ...prev,
              [booking.serviceId]: serviceData
            }));
            
            return {
              ...booking,
              id: booking._id, // Ensure we have an id property for consistency
              serviceTitle: serviceData?.title || 'Unknown Service',
              serviceImage: serviceData?.image || defaultServiceImage,
              serviceCategory: serviceData?.category || 'General',
              serviceDuration: serviceData?.duration || '1 hour',
              servicePrice: serviceData?.price || 0,
              providerName: serviceData?.providerName || 'Service Provider',
              providerPhoto: serviceData?.providerPhoto || defaultAvatarImage,
              formattedDate: format(new Date(booking.date), 'PPP'),
              formattedTime: booking.time
            };
          } catch (err) {
            console.error(`Error fetching service details for booking ${booking._id}:`, err);
            return {
              ...booking,
              id: booking._id,
              serviceTitle: 'Service Details Unavailable',
              serviceImage: defaultServiceImage,
              serviceCategory: 'Unknown',
              serviceDuration: '1 hour',
              servicePrice: 0,
              providerName: 'Unknown Provider',
              providerPhoto: defaultAvatarImage,
              formattedDate: format(new Date(booking.date), 'PPP'),
              formattedTime: booking.time
            };
          }
        }));
        
        setBookings(bookingsWithDetails);
      } else {
        setBookings([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again later.');
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    
    try {
      setProcessingAction(true);
      
      // Call API to update booking status
      await updateBookingStatus(cancelBookingId, 'cancelled');
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          (booking._id === cancelBookingId || booking.id === cancelBookingId)
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      setShowCancelModal(false);
      setCancelBookingId(null);
      setSuccess('Booking cancelled successfully.');
      setProcessingAction(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
      setProcessingAction(false);
    }
  };

  // Handle booking reschedule
  const handleRescheduleBooking = (bookingId) => {
    // Navigate to reschedule page with booking ID
    navigate(`/reschedule-booking/${bookingId}`);
  };
  
  // Handle viewing booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setProcessingAction(true);

      await updateBookingStatus(bookingId, newStatus);

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId || booking.id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      if (showDetailsModal && selectedBooking && (selectedBooking._id === bookingId || selectedBooking.id === bookingId)) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }

      let successMessage = '';
      switch (newStatus) {
        case 'confirmed':
          successMessage = 'Booking confirmed successfully.';
          break;
        case 'cancelled':
          successMessage = 'Booking cancelled successfully.';
          break;
        case 'completed':
          successMessage = 'Booking marked as completed successfully.';
          break;
        default:
          successMessage = `Booking status updated to ${newStatus} successfully.`;
      }

      setSuccess(successMessage);
      setProcessingAction(false);
    } catch (error) {
      console.error(`Error updating booking to ${newStatus}:`, error);
      setError(`Failed to update booking status. Please try again.`);
      setProcessingAction(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const StatusBadge = ({ status }) => {
    let bgColor, textColor, label;

    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        label = 'Pending';
        break;
      case 'confirmed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        label = 'Confirmed';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        label = 'Cancelled';
        break;
      case 'completed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        label = 'Completed';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = status || 'Unknown';
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        {label}
      </span>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

    if (activeTab === 'upcoming') {
      return bookingDate >= today && booking.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return bookingDate < today && booking.status !== 'cancelled' || booking.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true;
  });

  const bookingCounts = {
    upcoming: bookings.filter((b) => new Date(b.date) >= new Date() && b.status !== 'cancelled').length,
    past: bookings.filter((b) => new Date(b.date) < new Date() && b.status !== 'cancelled' || b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-lg text-gray-600">
            {userRole === 'provider' ? 'Manage bookings for your services' : 'View and manage your service bookings'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            <p className="font-medium">Success</p>
            <p>{success}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'upcoming'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
              {bookingCounts.upcoming > 0 && (
                <span
                  className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {bookingCounts.upcoming}
                </span>
              )}
            </button>
            <button
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'past'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past
              {bookingCounts.past > 0 && (
                <span
                  className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {bookingCounts.past}
                </span>
              )}
            </button>
            <button
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'cancelled'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled
              {bookingCounts.cancelled > 0 && (
                <span
                  className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {bookingCounts.cancelled}
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {filteredBookings.length > 0 ? (
              <div className="space-y-6">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id || booking.id}
                    className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={booking.serviceImage || defaultServiceImage}
                            alt={booking.serviceTitle}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.target.src = defaultServiceImage;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{booking.serviceTitle}</h3>
                          <p className="mt-1 text-sm text-gray-500">{booking.serviceCategory}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <StatusBadge status={booking.status} />
                            <span className="text-sm font-medium text-primary-600">
                              ${booking.servicePrice || booking.price || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{formatDate(booking.date)} • {booking.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{booking.serviceDuration}</span>
                        </div>
                        {booking.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{booking.address}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            <svg
                              className="mr-1.5 h-4 w-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Details
                          </button>

                          {/* Customer actions */}
                          {userRole === 'customer' && (booking.status === 'pending' || booking.status === 'confirmed') && (
                            <>
                              <button
                                onClick={() => handleRescheduleBooking(booking._id || booking.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                              >
                                <svg
                                  className="mr-1.5 h-4 w-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setCancelBookingId(booking._id || booking.id);
                                  setShowCancelModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                              >
                                <svg
                                  className="mr-1.5 h-4 w-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {/* Provider actions */}
                          {userRole === 'provider' && booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id || booking.id, 'confirmed')}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                              >
                                <svg
                                  className="mr-1.5 h-4 w-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  setCancelBookingId(booking._id || booking.id);
                                  setShowCancelModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                              >
                                <svg
                                  className="mr-1.5 h-4 w-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          
                          {userRole === 'provider' && booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id || booking.id, 'completed')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              <svg
                                className="mr-1.5 h-4 w-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                {activeTab === 'upcoming' ? (
                  <>
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-4 text-xl font-medium text-gray-900">No upcoming bookings</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">
                      You don't have any pending or confirmed bookings scheduled. Browse our services to book your next appointment.
                    </p>
                  </>
                ) : activeTab === 'past' ? (
                  <>
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-4 text-xl font-medium text-gray-900">No past bookings</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">
                      You don't have any completed bookings yet.
                    </p>
                  </>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <h3 className="mt-4 text-xl font-medium text-gray-900">No cancelled bookings</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">
                      You don't have any cancelled bookings.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Booking Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Cancel Booking</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 mt-5">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelBookingId(null);
                }}
                disabled={processingAction}
              >
                No, Keep It
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleCancelBooking}
                disabled={processingAction}
              >
                {processingAction ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Service Image */}
              <div className="md:col-span-1">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedBooking.serviceImage || defaultServiceImage}
                    alt={selectedBooking.serviceTitle}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = defaultServiceImage;
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <StatusBadge status={selectedBooking.status} />
                  <span className="text-lg font-bold text-primary-600">
                    ${selectedBooking.servicePrice || selectedBooking.price || 0}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-lg font-medium text-gray-900">{selectedBooking.serviceTitle}</h4>
                <p className="text-sm text-gray-500">{selectedBooking.serviceCategory}</p>

                <div className="border-t border-b border-gray-200 py-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{formatDate(selectedBooking.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">{selectedBooking.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{selectedBooking.serviceDuration}</span>
                  </div>
                  {selectedBooking.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium text-right">{selectedBooking.address}</span>
                    </div>
                  )}
                </div>

                {/* Provider/Customer Information */}
                <div className="border-b border-gray-200 pb-4">
                  {userRole === 'provider' ? (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Customer:</span>
                      <div className="flex items-center">
                        <span className="font-medium ml-2">{selectedBooking.userName || 'Customer'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Provider:</span>
                      <div className="flex items-center">
                        <img
                          src={selectedBooking.providerPhoto || defaultAvatarImage}
                          alt={selectedBooking.providerName}
                          className="h-8 w-8 rounded-full mr-2"
                          onError={(e) => {
                            e.target.src = defaultAvatarImage;
                          }}
                        />
                        <span className="font-medium">{selectedBooking.providerName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes if any */}
                {selectedBooking.notes && (
                  <div className="border-b border-gray-200 pb-4">
                    <h5 className="font-medium mb-2">Notes:</h5>
                    <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {/* Close button */}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  
                  {/* Provider Actions */}
                  {userRole === 'provider' && selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking._id || selectedBooking.id, 'confirmed')}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                      disabled={processingAction}
                    >
                      {processingAction ? 'Processing...' : 'Confirm Booking'}
                    </button>
                  )}
                  
                  {userRole === 'provider' && selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking._id || selectedBooking.id, 'completed')}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                      disabled={processingAction}
                    >
                      {processingAction ? 'Processing...' : 'Mark as Completed'}
                    </button>
                  )}
                  
                  {/* Customer Actions */}
                  {userRole === 'customer' && (selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() => handleRescheduleBooking(selectedBooking._id || selectedBooking.id)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                        disabled={processingAction}
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => {
                          setCancelBookingId(selectedBooking._id || selectedBooking.id);
                          setShowDetailsModal(false);
                          setShowCancelModal(true);
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                        disabled={processingAction}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  


                  {/* Contact button */}
                  <button
                    onClick={() => {
                      // Logic to handle messaging or contacting
                      // This could navigate to a chat page or open a contact modal
                      console.log('Contact about booking:', selectedBooking);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <svg
                      className="inline-block w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
