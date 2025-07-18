import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { getUserBookings, getProviderBookings, updateBookingStatus, deleteBooking } from '../services/bookingService';
import StatusBadge from '../components/common/StatusBadge';
import { getServiceById } from '../services/serviceService';
import { format } from 'date-fns';

const MyBookings = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [serviceDetails, setServiceDetails] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const defaultServiceImage = 'https://via.placeholder.com/100';
  
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
              setServiceDetails(prev => ({ ...prev, [booking.serviceId]: serviceData }));
              return { 
                ...booking, 
                serviceTitle: serviceData?.title || 'Unknown Service',
                serviceImage: serviceData?.imageUrl || defaultServiceImage,
                serviceCategory: serviceData?.category || 'Service'
              };
            } catch (err) {
              console.error('Error fetching service details:', err);
              return { 
                ...booking, 
                serviceTitle: 'Unknown Service',
                serviceImage: defaultServiceImage,
                serviceCategory: 'Service'
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

  // Handle booking status update
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
      
      setShowDetailsModal(false);
      setSelectedBooking(null);
      setSuccess(`Booking ${newStatus} successfully.`);
      setLoading(false);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    return timeString || 'Not specified';
  };


  // Loading state
  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 animate-spin"></div>
        <p className="ml-3 text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {userRole === 'provider' ? 'Manage Service Bookings' : 'My Bookings'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {userRole === 'provider' 
              ? 'View and manage bookings for your services' 
              : 'Track and manage your service appointments'}
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 rounded-md bg-red-50 border border-red-200">
            <p className="font-medium text-red-800">
              {error}
            </p>
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="p-4 mb-6 rounded-md bg-green-50 border border-green-200">
            <p className="font-medium text-green-800">
              {success}
            </p>
          </div>
        )}
        
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Tabs */}
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
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">
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
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
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
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                  {bookingCounts.cancelled}
                </span>
              )}
            </button>
          </div>
          
          {/* Booking List */}
          <div className="p-6">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 animate-spin"></div>
                <p className="mt-2 text-gray-500">Loading bookings...</p>
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id || booking._id}
                    className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden mr-4">
                          <img
                            src={booking.serviceImage || defaultServiceImage}
                            alt={booking.serviceTitle}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {booking.serviceTitle}
                          </h3>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm text-gray-500 mr-3">
                              {booking.serviceCategory}
                            </span>
                            <StatusBadge status={booking.status} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-sm text-gray-500">
                          {formatDate(booking.date)} • {formatTime(booking.time)}
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailsModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          
                          {/* Show cancel button for customer's pending bookings */}
                          {userRole === 'customer' && booking.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                          
                          {/* Provider action buttons */}
                          {userRole === 'provider' && booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id || booking._id, 'confirmed')}
                                className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id || booking._id, 'cancelled')}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {/* Complete button for providers */}
                          {userRole === 'provider' && booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id || booking._id, 'completed')}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                            >
                              Mark Complete
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
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 text-gray-400 mb-4">📅</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming bookings</h3>
                    <p className="text-gray-500 mb-4">You don't have any upcoming bookings.</p>
                    {userRole === 'customer' && (
                      <Link
                        to="/services"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                      >
                        Browse Services
                      </Link>
                    )}
                  </div>
                ) : activeTab === 'past' ? (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 text-gray-400 mb-4">✓</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No past bookings</h3>
                    <p className="text-gray-500">You don't have any completed bookings yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 text-gray-400 mb-4">✕</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No cancelled bookings</h3>
                    <p className="text-gray-500">You don't have any cancelled bookings.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Booking Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCancelModal(false)}></div>
          
          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl overflow-hidden">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  ❗
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Cancel Booking</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleCancelBooking}
              >
                Yes, Cancel Booking
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
          
          <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="text-center sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Booking Details
                </h3>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Service:</span>
                    <span className="text-sm text-gray-900">{selectedBooking.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedBooking.date)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Time:</span>
                    <span className="text-sm text-gray-900">{formatTime(selectedBooking.time)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <span className="text-sm text-gray-900">{selectedBooking.location || 'Not specified'}</span>
                  </div>
                  
                  {userRole === 'provider' && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Customer:</span>
                      <span className="text-sm text-gray-900">{selectedBooking.customerName || selectedBooking.customerEmail || 'Unknown'}</span>
                    </div>
                  )}
                  
                  {userRole === 'customer' && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Provider:</span>
                      <span className="text-sm text-gray-900">{selectedBooking.providerName || 'Unknown'}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Price:</span>
                    <span className="text-sm text-gray-900">${selectedBooking.price || 'N/A'}</span>
                  </div>
                  
                  {selectedBooking.notes && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-500">Notes:</span>
                      <p className="mt-1 text-sm text-gray-900">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-end space-x-3">
                  {userRole === 'customer' && selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setSelectedBooking(selectedBooking);
                          setShowCancelModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  
                  {userRole === 'provider' && selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking._id, 'confirmed')}
                        className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking._id, 'cancelled')}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {userRole === 'provider' && selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking._id, 'completed')}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                    >
                      Mark Complete
                    </button>
                  )}
                  
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
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
