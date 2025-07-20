import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import ChatBox from '../components/messaging/ChatBox';
import { getUserBookings, getProviderBookings } from '../services/bookingService';
import { getServiceById } from '../services/serviceService';
import StatusBadge from '../components/common/StatusBadge';

const Chat = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceDetails, setServiceDetails] = useState({});
  const { userRole, currentUser } = useAuth();
  
  const defaultServiceImage = 'https://via.placeholder.com/100';

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        let response;
        // Fetch bookings based on user role
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
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchBookings();
    }
  }, [currentUser, userRole, defaultServiceImage]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bookings/Conversations List */}
            <div className="md:col-span-1 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
              </div>
              
              {bookings.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No bookings found. Book a service to start a conversation.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <li key={booking._id}>
                      <button
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none ${
                          selectedBooking?._id === booking._id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                            <img 
                              src={booking.serviceImage || defaultServiceImage} 
                              alt={booking.serviceTitle || 'Service'}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {booking.serviceTitle || 'Service Booking'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {userRole === 'provider' 
                                ? `Customer: ${booking.userName || booking.userEmail || 'Customer'}`
                                : `Provider: ${booking.providerName || 'Service Provider'}`
                              }
                            </p>
                            <div className="mt-1 flex items-center">
                              <StatusBadge status={booking.status} />
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDate(booking.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Chat Area */}
            <div className="md:col-span-2">
              <ChatBox 
                booking={selectedBooking} 
                onClose={() => setSelectedBooking(null)}
                isStandalone={true}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Chat;
