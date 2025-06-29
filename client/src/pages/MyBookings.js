import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion } from 'framer-motion';
import { getUserBookings, updateBookingStatus } from '../services/bookingService';

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
  const [processingAction, setProcessingAction] = useState(false);
  
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
    setLoading(true);
    setError(null);
    
    try {
      // Fetch bookings from API
      const userBookings = await getUserBookings(currentUser.uid);
      
      // Format the bookings from API
      const formattedBookings = userBookings.map(booking => ({
        id: booking._id || booking.id,
        service: {
          id: booking.serviceId,
          title: booking.serviceName,
          image: booking.serviceImage || 'https://via.placeholder.com/300x200?text=Service+Image',
          provider: {
            id: booking.providerId,
            name: booking.providerName || 'Service Provider',
            rating: booking.providerRating || 4.5,
            avatar: booking.providerAvatar || 'https://via.placeholder.com/64x64?text=Provider'
          }
        },
        date: new Date(booking.date),
        timeSlot: booking.time || '12:00 PM',
        address: booking.address || 'No address provided',
        status: booking.status || 'pending',
        notes: booking.notes || '',
        price: booking.price || 0,
        createdAt: booking.createdAt || new Date().toISOString()
      }));
      
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load your bookings. Please try again later.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    
    setProcessingAction(true);
    try {
      await updateBookingStatus(cancelBookingId, 'cancelled');
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === cancelBookingId ? {...booking, status: 'cancelled'} : booking
      ));
      
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setProcessingAction(false);
      setCancelBookingId(null);
    }
  };

  // Handle booking reschedule
  const handleRescheduleBooking = (bookingId) => {
    navigate(`/booking/${bookingId}/reschedule`);
  };

  // Format date function
  const formatDate = (date) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = '';
    let textColor = '';
    
    switch(status) {
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'confirmed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'completed':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    
    if (activeTab === 'upcoming') {
      return (bookingDate >= today && (booking.status === 'confirmed' || booking.status === 'pending'));
    } else if (activeTab === 'completed') {
      return (booking.status === 'completed' || (bookingDate < today && booking.status === 'confirmed'));
    } else if (activeTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true;
  });

  // Count bookings by tab for displaying badge counts
  const bookingCounts = {
    upcoming: bookings.filter(b => new Date(b.date) >= new Date() && (b.status === 'confirmed' || b.status === 'pending')).length,
    completed: bookings.filter(b => b.status === 'completed' || (new Date(b.date) < new Date() && b.status === 'confirmed')).length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <Link 
              to="/services" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Book New Service
            </Link>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Success message removed as requested */}
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'upcoming' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
                {bookingCounts.upcoming > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {bookingCounts.upcoming}
                  </span>
                )}
              </button>
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'completed' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
                {bookingCounts.completed > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {bookingCounts.completed}
                  </span>
                )}
              </button>
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'cancelled' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled
                {bookingCounts.cancelled > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {bookingCounts.cancelled}
                  </span>
                )}
              </button>
            </div>
            
            <div className="p-6">
              {filteredBookings.length > 0 ? (
                <div className="space-y-6">
                  {filteredBookings.map((booking) => (
                    <motion.div 
                      key={booking.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 h-48 md:h-auto">
                          <img 
                            src={booking.service.image} 
                            alt={booking.service.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{booking.service.title}</h3>
                              <div className="flex items-center mt-1">
                                <img 
                                  src={booking.service.provider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.service.provider.name)}`} 
                                  alt={booking.service.provider.name}
                                  className="h-6 w-6 rounded-full mr-2"
                                />
                                <Link to={`/providers/${booking.service.provider.id}`} className="text-sm text-primary-600 hover:underline">
                                  {booking.service.provider.name}
                                </Link>
                              </div>
                            </div>
                            <div className="mt-2 md:mt-0 flex flex-col items-start md:items-end">
                              <div className="mb-2">
                                <StatusBadge status={booking.status} />
                              </div>
                              <p className="text-sm text-gray-500">
                                {formatDate(booking.date)} at {booking.timeSlot}
                              </p>
                              {booking.price && (
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  ₪{booking.price}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 mb-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Address:</span> {booking.address}
                            </p>
                            {booking.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Notes:</span> {booking.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                            <Link 
                              to={`/booking/${booking.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </Link>
                            
                            {/* Show Reschedule button for pending or confirmed bookings */}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <button 
                                onClick={() => handleRescheduleBooking(booking.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Reschedule
                              </button>
                            )}
                            
                            {/* Show Cancel button for pending or confirmed bookings */}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <button 
                                onClick={() => {
                                  setCancelBookingId(booking.id);
                                  setShowCancelModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {activeTab === 'upcoming' ? (
                    <>
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-4 text-xl font-medium text-gray-900">No upcoming bookings</h3>
                      <p className="mt-2 text-gray-500 max-w-md mx-auto">
                        You don't have any pending or confirmed bookings scheduled. Browse our services to book your next appointment.
                      </p>
                    </>
                  ) : activeTab === 'completed' ? (
                    <>
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-4 text-xl font-medium text-gray-900">No completed bookings</h3>
                      <p className="mt-2 text-gray-500 max-w-md mx-auto">
                        You don't have any completed bookings yet. Once your service is completed, you'll be able to leave reviews here.
                      </p>
                    </>
                  ) : (
                    <>
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <h3 className="mt-4 text-xl font-medium text-gray-900">No cancelled bookings</h3>
                      <p className="mt-2 text-gray-500 max-w-md mx-auto">
                        You don't have any cancelled bookings. If you need to cancel a booking, you can do so from the upcoming tab.
                      </p>
                    </>
                  )}
                  <div className="mt-8">
                    <Link 
                      to="/services" 
                      className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Browse Services
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
