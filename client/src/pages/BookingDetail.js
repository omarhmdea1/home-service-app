import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion } from 'framer-motion';
import { getBookingById, updateBookingStatus } from '../services/bookingService';
import { getServiceById } from '../services/serviceService';
import ChatBox from '../components/messaging/ChatBox';

const BookingDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    timeSlot: ''
  });
  
  // Available time slots
  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
    '04:00 PM', '05:00 PM', '06:00 PM'
  ];
  
  // Validate MongoDB ObjectId format (24 hex characters)
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  // Fetch booking details
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/booking/${id}`, message: 'Please log in to view booking details.' } });
      return;
    }
    
    // Check if ID is valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      setError('Invalid booking ID');
      setLoading(false);
      return;
    }
    
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const bookingData = await getBookingById(id);
        
        if (!bookingData) {
          setError('Booking not found');
          setLoading(false);
          return;
        }
        
        // Fetch service details
        await fetchServiceDetails(bookingData);
        
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [id, currentUser, navigate]);
  
  // Fetch service details for the booking
  const fetchServiceDetails = async (bookingData) => {
    try {
      const serviceData = await getServiceById(bookingData.serviceId);
      
      if (!serviceData) {
        setBooking({
          ...bookingData,
          serviceName: 'Unknown Service',
          serviceImage: '',
          provider: {
            name: 'Unknown Provider',
            image: '',
            rating: 0,
            reviews: 0,
          }
        });
      } else {
        setBooking({
          ...bookingData,
          serviceName: serviceData.title,
          serviceImage: serviceData.image,
          provider: {
            name: serviceData.providerName || 'Service Provider',
            image: serviceData.providerImage || '',
            rating: serviceData.rating || 0,
            reviews: serviceData.reviewCount || 0,
          }
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setBooking(bookingData);
      setLoading(false);
    }
  };
  
  // Handle booking status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateBookingStatus(booking._id, newStatus);
      
      // Update local state
      setBooking({
        ...booking,
        status: newStatus
      });
      
      // Close modals
      setShowCancelModal(false);
      setShowRescheduleModal(false);
      
    } catch (err) {
      console.error(`Error updating booking status to ${newStatus}:`, err);
      alert(`Failed to update booking status. Please try again.`);
    }
  };
  
  // Handle booking cancellation
  const handleCancelBooking = () => {
    handleStatusUpdate('cancelled');
  };
  
  // Handle booking rescheduling
  const handleRescheduleBooking = () => {
    if (!rescheduleData.date || !rescheduleData.timeSlot) {
      alert('Please select both a date and time');
      return;
    }
    
    // In a real app, we would update the booking with the new date and time
    // For now, we'll just close the modal
    setShowRescheduleModal(false);
    
    // Reset form data
    setRescheduleData({
      date: '',
      timeSlot: ''
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link to="/bookings" className="text-primary-600 hover:text-primary-700">
          Back to Bookings
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Booking Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <Link
              to="/bookings"
              className="text-primary-600 hover:text-primary-700 flex items-center"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Bookings
            </Link>
          </div>
          
          <div className="mt-2 flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <span className="ml-4 text-gray-500">Booking #{booking._id.substring(booking._id.length - 6)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-lg overflow-hidden">
                  {booking.serviceImage ? (
                    <img
                      src={booking.serviceImage}
                      alt={booking.serviceName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-semibold text-gray-900">{booking.serviceName}</h2>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(booking.provider.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-gray-500">({booking.provider.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-600">
                      Provider: {booking.provider.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(booking.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{booking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{booking.address || 'No address provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-gray-900">${booking.price?.toFixed(2) || 'N/A'}</p>
                </div>
                {booking.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium text-gray-900">{booking.notes}</p>
                  </div>
                )}
              </div>
              
              {booking.status === 'pending' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex-1"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex-1"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              )}
              
              {booking.status === 'completed' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors w-full"
                  >
                    Leave a Review
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Message Provider/Customer */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Message about this booking</h3>
                  <p className="text-gray-600">
                    {booking ? (booking.providerId === currentUser?.uid ? 'Chat with the customer' : 'Chat with the service provider') : ''} about this booking.
                  </p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setShowChatModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    Open Chat
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-4">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Need help with your booking?</h3>
                  <p className="text-gray-600">Our support team is available 24/7 to assist you.</p>
                </div>
                <div className="ml-auto">
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Booking</h3>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Select New Date</label>
                <input
                  id="date"
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">Select New Time</label>
                <select
                  id="timeSlot"
                  value={rescheduleData.timeSlot}
                  onChange={(e) => setRescheduleData({...rescheduleData, timeSlot: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleBooking}
                  className="px-4 py-2 bg-primary-600 border border-transparent text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex-1"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Modal */}
      {showChatModal && booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <ChatBox booking={booking} onClose={() => setShowChatModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
