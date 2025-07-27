import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import { getUserBookings, getProviderBookings, updateBookingStatus, deleteBooking } from '../services/bookingService';
import { getServiceById } from '../services/serviceService';

// Additional Components
const LoadingState = () => (
  <div className="p-12 text-center">
    <div className="inline-block rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 animate-spin mb-4"></div>
    <p className="text-gray-500">Loading bookings...</p>
  </div>
);

const EmptyState = ({ activeTab, userRole }) => (
  <div className="p-12 text-center">
    {activeTab === 'upcoming' ? (
      <div className="flex flex-col items-center">
        <div className="p-4 bg-blue-100 rounded-full mb-4">
          <svg className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
        <p className="text-gray-600 mb-6">You don't have any upcoming bookings scheduled.</p>
        {userRole === 'customer' && (
          <Link
            to="/services"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Browse Services
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    ) : activeTab === 'past' ? (
      <div className="flex flex-col items-center">
        <div className="p-4 bg-emerald-100 rounded-full mb-4">
          <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No past bookings</h3>
        <p className="text-gray-600">You don't have any completed bookings yet.</p>
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <div className="p-4 bg-red-100 rounded-full mb-4">
          <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled bookings</h3>
        <p className="text-gray-600">You don't have any cancelled bookings.</p>
      </div>
    )}
  </div>
);

const BookingsList = ({ bookings, userRole, onCancelBooking, onUpdateStatus, onViewDetails }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      cleaning: '🧹',
      plumbing: '🔧',
      electrical: '⚡',
      gardening: '🌱',
      painting: '🎨',
      moving: '📦',
      repair: '🔨',
      emergency: '🚨',
      service: '🏠'
    };
    return icons[category] || icons.service;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id || booking._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">{getCategoryIcon(booking.serviceCategory)}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.serviceTitle}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {booking.time && (
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.time}
                      </span>
                    )}
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ${booking.servicePrice || booking.price || 0}
                    </span>
                  </div>
                  
                  {userRole === 'provider' && (booking.userName || booking.userEmail) && (
                    <p className="text-sm text-gray-600 mb-2">
                      Customer: {booking.userName || booking.userEmail?.split('@')[0]}
                    </p>
                  )}
                  
                  {booking.location && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {booking.location}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(booking)}
                    className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    View Details
                  </button>
                  
                  {/* Customer actions */}
                  {userRole === 'customer' && booking.status === 'pending' && (
                    <button
                      onClick={() => onCancelBooking(booking)}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {/* Provider actions */}
                  {userRole === 'provider' && booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(booking.id || booking._id, 'confirmed')}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onUpdateStatus(booking.id || booking._id, 'cancelled')}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {userRole === 'provider' && booking.status === 'confirmed' && (
                    <button
                      onClick={() => onUpdateStatus(booking.id || booking._id, 'completed')}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CancelModal = ({ booking, onConfirm, onCancel }) => (
  <AnimatePresence>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-xl max-w-md w-full shadow-xl"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to cancel your booking for <strong>{booking?.serviceTitle}</strong>? This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);



const MyBookings = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Calculate booking counts by status
  const bookingCounts = {
    upcoming: bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length,
    past: bookings.filter(b => ['completed', 'expired'].includes(b.status)).length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };
  
  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') {
      return ['pending', 'confirmed'].includes(booking.status);
    } else if (activeTab === 'past') {
      return ['completed', 'expired'].includes(booking.status);
    } else {
      return booking.status === 'cancelled';
    }
  });

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, [currentUser, userRole]);
  
  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch bookings based on user role
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      let response;
      if (userRole === 'provider') {
        response = await getProviderBookings(currentUser.uid);
      } else {
        response = await getUserBookings(currentUser.uid);
      }
      
      if (response && Array.isArray(response)) {
        const sortedBookings = response.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const bookingsWithDetails = await Promise.all(
          sortedBookings.map(async (booking) => {
            try {
              const serviceData = await getServiceById(booking.serviceId);
              return { 
                ...booking, 
                serviceTitle: serviceData?.title || 'Unknown Service',
                serviceCategory: serviceData?.category || 'service',
                serviceDescription: serviceData?.description || '',
                servicePrice: serviceData?.price || booking.price || 0
              };
            } catch (err) {
              console.error('Error fetching service details:', err);
              return { 
                ...booking, 
                serviceTitle: 'Unknown Service',
                serviceCategory: 'service',
                serviceDescription: '',
                servicePrice: booking.price || 0
              };
            }
          })
        );
        
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
    if (!selectedBooking) return;
    
    try {
      setLoading(true);
      await deleteBooking(selectedBooking.id || selectedBooking._id);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          (booking.id || booking._id) === (selectedBooking.id || selectedBooking._id)
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      setSuccess('Booking cancelled successfully.');
      setLoading(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
      setLoading(false);
    }
  };

  // Handle booking status update (for providers)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          (booking.id || booking._id) === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      
      setSuccess(`Booking ${newStatus} successfully.`);
      setLoading(false);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your bookings.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {userRole === 'provider' ? 'Your Bookings' : 'My Bookings'}
              </h1>
              <p className="text-primary-100 text-lg">
                {userRole === 'provider' 
                  ? 'Manage and track all your service bookings' 
                  : 'Track your service appointments and history'}
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="h-20 w-20 text-white/20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM3 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/>
                <path d="M6 8a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 12a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-emerald-800">{success}</p>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-emerald-400 hover:text-emerald-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'upcoming', label: 'Upcoming', count: bookingCounts.upcoming, color: 'primary' },
              { key: 'past', label: 'Past', count: bookingCounts.past, color: 'gray' },
              { key: 'cancelled', label: 'Cancelled', count: bookingCounts.cancelled, color: 'red' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.key
                      ? 'bg-primary-200 text-primary-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <LoadingState />
          ) : filteredBookings.length === 0 ? (
            <EmptyState activeTab={activeTab} userRole={userRole} />
          ) : (
            <BookingsList 
              bookings={filteredBookings}
              userRole={userRole}
              onCancelBooking={(booking) => {
                setSelectedBooking(booking);
                setShowCancelModal(true);
              }}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={(booking) => {
                navigate(`/booking/${booking._id || booking.id}`);
              }}
            />
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <CancelModal
          booking={selectedBooking}
          onConfirm={handleCancelBooking}
          onCancel={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
        />
      )}


    </div>
  );
};

export default MyBookings;
