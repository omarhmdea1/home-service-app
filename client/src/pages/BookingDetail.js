import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookingById, updateBookingStatus } from '../services/bookingService';
import { getServiceById } from '../services/serviceService';
import { submitReview } from '../services/reviewService';
import ChatBox from '../components/messaging/ChatBox';

const BookingDetail = () => {
  const { id } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    timeSlot: ''
  });
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  
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
          serviceCategory: 'service',
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
          serviceCategory: serviceData.category || 'service',
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
      setBooking({
        ...bookingData,
        serviceName: 'Service',
        serviceCategory: 'service'
      });
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

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!reviewData.rating || !reviewData.comment.trim()) {
      alert('Please provide both a rating and comment');
      return;
    }

    try {
      setSubmittingReview(true);
      
      await submitReview({
        bookingId: booking._id,
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      });

      // Reset form and close modal
      setReviewData({ rating: 0, comment: '' });
      setShowReviewModal(false);
      
      // Show success message
      alert('Thank you for your review! Your feedback helps improve our services.');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get category icon
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

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'from-amber-500 to-amber-600',
        bgPattern: 'from-amber-50 to-orange-100'
      },
      confirmed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'from-green-500 to-green-600',
        bgPattern: 'from-green-50 to-emerald-100'
      },
      completed: {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        bgColor: 'from-emerald-500 to-emerald-600',
        bgPattern: 'from-emerald-50 to-green-100'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        bgColor: 'from-red-500 to-red-600',
        bgPattern: 'from-red-50 to-pink-100'
      }
    };
    return configs[status] || configs.pending;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-6"
          />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Booking Details</h3>
          <p className="text-gray-600">Please wait while we fetch your booking information...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md mx-4"
        >
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link 
            to="/my-bookings" 
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Bookings
          </Link>
        </motion.div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Enhanced Professional Header */}
      <div className={`relative bg-gradient-to-r ${statusConfig.bgColor} text-white overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-white/5 rounded-full translate-x-40 translate-y-40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-start space-x-6">
              <Link
                to="/my-bookings"
                className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm hover:scale-110"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">Booking Details</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-white/90 text-lg">
                    ID: #{booking._id.substring(booking._id.length - 8).toUpperCase()}
                  </p>
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                    {statusConfig.icon}
                    <span className="font-medium text-sm">
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="text-6xl opacity-30">
                  {getCategoryIcon(booking.serviceCategory)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Status Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${statusConfig.bgPattern} rounded-full opacity-50 transform translate-x-16 -translate-y-16`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`p-4 bg-gradient-to-r ${statusConfig.bgColor} rounded-xl text-white mr-6 shadow-lg`}>
                      {statusConfig.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Booking Status</h2>
                      <p className="text-gray-600">Current state of your service booking</p>
                    </div>
                  </div>
                  <motion.span 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`px-6 py-3 rounded-full text-sm font-bold border-2 ${statusConfig.color} shadow-lg`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </motion.span>
                </div>

                {/* Status Timeline */}
                <div className="grid grid-cols-4 gap-4 mt-8">
                  {[
                    { key: 'pending', label: 'Requested', icon: '📝' },
                    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
                    { key: 'in-progress', label: 'In Progress', icon: '🔄' },
                    { key: 'completed', label: 'Completed', icon: '🎉' }
                  ].map((step, index) => {
                    const isActive = ['pending', 'confirmed', 'completed'].includes(booking.status) && 
                                   (index === 0 || 
                                    (index === 1 && ['confirmed', 'completed'].includes(booking.status)) ||
                                    (index === 3 && booking.status === 'completed'));
                    const isCancelled = booking.status === 'cancelled';
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary-100 border-primary-500 text-primary-700' 
                            : isCancelled
                            ? 'bg-red-100 border-red-300 text-red-600'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                        }`}>
                          <span className="text-lg">{step.icon}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          isActive ? 'text-primary-700' : isCancelled ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Service Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <div className="p-3 bg-primary-100 rounded-xl mr-4">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Service Information
                </h3>
                
                <div className="flex items-start space-x-8">
                  <div className="flex-shrink-0">
                    <div className="h-32 w-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                      {booking.serviceImage ? (
                        <img
                          src={booking.serviceImage}
                          alt={booking.serviceName}
                          className="h-full w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                          {getCategoryIcon(booking.serviceCategory)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                      {booking.serviceName}
                    </h4>
                    
                    <div className="flex items-center mb-4">
                      <span className="px-4 py-2 bg-primary-100 text-primary-700 text-sm font-bold rounded-full">
                        {booking.serviceCategory}
                      </span>
                    </div>
                    
                    {/* Enhanced Provider Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{booking.provider?.name || 'Service Provider'}</p>
                            <p className="text-sm text-gray-600">Service Provider</p>
                          </div>
                        </div>
                        
                        {booking.provider?.rating > 0 && (
                          <div className="flex items-center space-x-2">
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
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {booking.provider.rating.toFixed(1)} ({booking.provider.reviews})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Booking Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Date"
                  value={formatDate(booking.date)}
                  color="bg-green-100 text-green-600"
                />
                
                <InfoCard
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  label="Time"
                  value={booking.time || 'To be scheduled'}
                  color="bg-blue-100 text-blue-600"
                />
                
                <InfoCard
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  label="Location"
                  value={booking.address || 'Address not provided'}
                  color="bg-purple-100 text-purple-600"
                />
                
                <InfoCard
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  label="Price"
                  value={`$${booking.price?.toFixed(2) || 'TBD'}`}
                  color="bg-emerald-100 text-emerald-600"
                />
              </div>
              
              {booking.notes && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center mb-3">
                    <svg className="h-6 w-6 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4.414 4.414z" />
                    </svg>
                    <span className="text-lg font-bold text-gray-700">Special Instructions</span>
                  </div>
                  <p className="text-gray-900 leading-relaxed">{booking.notes}</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {booking.status === 'pending' && (
                  <>
                    <ActionButton
                      onClick={() => setShowRescheduleModal(true)}
                      icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      }
                      label="Reschedule"
                      variant="primary"
                    />
                    <ActionButton
                      onClick={() => setShowCancelModal(true)}
                      icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      }
                      label="Cancel Booking"
                      variant="danger"
                    />
                  </>
                )}
                
                {booking.status === 'completed' && userRole === 'customer' && (
                  <ActionButton
                    onClick={() => setShowReviewModal(true)}
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    }
                    label="Leave Review"
                    variant="primary"
                  />
                )}
                
                <ActionButton
                  onClick={() => setShowChatModal(true)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  }
                  label={userRole === 'provider' ? 'Message Customer' : 'Message Provider'}
                  variant="secondary"
                />
              </div>
            </motion.div>

            {/* Enhanced Contact Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border-2 border-primary-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200 rounded-full opacity-30 transform translate-x-12 -translate-y-12"></div>
              
              <div className="relative text-center">
                <div className="p-4 bg-primary-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Our support team is here to help with any questions about your booking.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Modals */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBooking}
        booking={booking}
      />

      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleRescheduleBooking}
        rescheduleData={rescheduleData}
        setRescheduleData={setRescheduleData}
        timeSlots={timeSlots}
      />

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        booking={booking}
        currentUser={currentUser}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        reviewData={reviewData}
        setReviewData={setReviewData}
        submitting={submittingReview}
        booking={booking}
      />
    </div>
  );
};

// Enhanced Component Helpers
const InfoCard = ({ icon, label, value, color }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className="flex items-start space-x-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 group"
  >
    <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="font-bold text-gray-900 mt-2 text-lg group-hover:text-primary-600 transition-colors">{value}</p>
    </div>
  </motion.div>
);

const ActionButton = ({ onClick, icon, label, variant = 'default' }) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold transition-all duration-200 transform ${variants[variant]}`}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
};

// Enhanced Modal Components
const CancelModal = ({ isOpen, onClose, onConfirm, booking }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200"
        >
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="p-4 bg-red-100 rounded-xl mr-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Cancel Booking</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-800 font-medium">
                Are you sure you want to cancel your booking for:
              </p>
              <p className="text-gray-900 font-bold mt-1 text-lg">
                {booking?.serviceName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                This action will permanently cancel your booking and cannot be reversed.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold"
              >
                Keep Booking
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const RescheduleModal = ({ isOpen, onClose, onConfirm, rescheduleData, setRescheduleData, timeSlots }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200"
        >
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="p-4 bg-primary-100 rounded-xl mr-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Reschedule Booking</h3>
                <p className="text-sm text-gray-500">Select a new date and time</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">New Time</label>
                <select
                  value={rescheduleData.timeSlot}
                  onChange={(e) => setRescheduleData({...rescheduleData, timeSlot: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!rescheduleData.date || !rescheduleData.timeSlot}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reschedule
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ChatModal = ({ isOpen, onClose, booking, currentUser }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl max-w-2xl w-full h-[600px] shadow-2xl border border-gray-200"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Message about Booking</h3>
                <p className="text-sm text-gray-600">ID: #{booking?._id?.substring(booking._id.length - 8).toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-full">
            <ChatBox
              booking={booking}
              onClose={onClose}
              isStandalone={false}
            />
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// Enhanced Star Rating Component
const StarRating = ({ rating, setRating, interactive = true }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => interactive && setRating(star)}
          disabled={!interactive}
          whileHover={interactive ? { scale: 1.1 } : {}}
          whileTap={interactive ? { scale: 0.95 } : {}}
          className={`p-1 transition-all duration-200 ${interactive ? 'hover:scale-110' : ''} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </motion.button>
      ))}
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, onSubmit, reviewData, setReviewData, submitting, booking }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200"
        >
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="p-4 bg-yellow-100 rounded-xl mr-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Leave a Review</h3>
                <p className="text-gray-600">Share your experience with others</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Enhanced Service Info */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl border border-gray-200"
              >
                <div className="h-16 w-16 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{booking?.serviceCategory ? 
                    (() => {
                      const icons = {
                        cleaning: '🧹', plumbing: '🔧', electrical: '⚡', gardening: '🌱',
                        painting: '🎨', moving: '📦', repair: '🔨', emergency: '🚨', service: '🏠'
                      };
                      return icons[booking.serviceCategory] || icons.service;
                    })() : '🏠'
                  }</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{booking?.serviceName}</p>
                  <p className="text-sm text-gray-600">by {booking?.provider?.name}</p>
                </div>
              </motion.div>

              {/* Enhanced Rating */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">
                  How would you rate this service?
                </label>
                <div className="flex flex-col items-center space-y-3">
                  <StarRating 
                    rating={reviewData.rating} 
                    setRating={(rating) => setReviewData({...reviewData, rating})}
                  />
                  {reviewData.rating > 0 && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-lg font-bold text-gray-700"
                    >
                      {reviewData.rating === 1 ? '😞 Poor' :
                       reviewData.rating === 2 ? '😐 Fair' :
                       reviewData.rating === 3 ? '🙂 Good' :
                       reviewData.rating === 4 ? '😊 Very Good' : '🤩 Excellent'}
                    </motion.p>
                  )}
                </div>
              </div>
              
              {/* Enhanced Comment */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Share your experience
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="Tell others about your experience with this service..."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-200 font-medium"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {reviewData.comment.length}/1000 characters
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your review will be public
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting || !reviewData.rating || !reviewData.comment.trim()}
                className="flex-1 px-6 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default BookingDetail;
