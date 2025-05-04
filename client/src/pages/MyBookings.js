import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion } from 'framer-motion';

const MyBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      // Simulated API call to fetch user's bookings
      setTimeout(() => {
        // This would be replaced with a real API call
        const mockBookings = [
          {
            id: 'bk1',
            service: {
              id: 's1',
              title: 'Professional Plumbing Service',
              image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80',
              provider: {
                name: 'Mike\'s Plumbing',
                rating: 4.8
              }
            },
            date: new Date(Date.now() + 86400000 * 3), // 3 days from now
            timeSlot: '10:00 AM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'confirmed',
            createdAt: new Date().toISOString()
          },
          {
            id: 'bk2',
            service: {
              id: 's2',
              title: 'House Cleaning Service',
              image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
              provider: {
                name: 'CleanHome Pro',
                rating: 4.9
              }
            },
            date: new Date(Date.now() + 86400000 * 7), // 7 days from now
            timeSlot: '02:00 PM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'confirmed',
            createdAt: new Date().toISOString()
          },
          {
            id: 'bk3',
            service: {
              id: 's3',
              title: 'Electrical Repair',
              image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80',
              provider: {
                name: 'ElectraTech',
                rating: 4.7
              }
            },
            date: new Date(Date.now() - 86400000 * 5), // 5 days ago
            timeSlot: '11:00 AM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'completed',
            createdAt: new Date().toISOString()
          }
        ];
        
        setBookings(mockBookings);
        setLoading(false);
      }, 1000);
    }
  }, [currentUser]);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return bookingDate >= now && booking.status !== 'cancelled';
    } else if (activeTab === 'completed') {
      return booking.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true;
  });

  // Show loading state
  if (loading) {
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
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Bookings
          </motion.h1>
          
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled
              </button>
            </nav>
          </div>
          
          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <motion.div 
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-48 md:h-auto md:w-48 relative">
                      <img 
                        src={booking.service.image} 
                        alt={booking.service.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-0 right-0 mt-2 mr-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 md:flex-1 flex flex-col">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h2 className="text-xl font-semibold text-gray-900">{booking.service.title}</h2>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-gray-700">{booking.service.provider.rating}</span>
                          </div>
                        </div>
                        
                        <p className="mt-1 text-gray-600">Provider: {booking.service.provider.name}</p>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Date</span>
                            <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Time</span>
                            <p className="font-medium">{booking.timeSlot}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-sm text-gray-500">Address</span>
                            <p className="font-medium">{booking.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <span className="text-sm text-gray-500">Booking ID</span>
                          <p className="font-mono text-sm">{booking.id}</p>
                        </div>
                        
                        <div className="flex space-x-3">
                          {booking.status === 'confirmed' && (
                            <>
                              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Reschedule
                              </button>
                              <button className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50">
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {booking.status === 'completed' && (
                            <button className="px-4 py-2 bg-primary-600 rounded-md text-sm font-medium text-white hover:bg-primary-700">
                              Leave Review
                            </button>
                          )}
                          
                          <Link 
                            to={`/booking/${booking.id}`}
                            className="px-4 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 hover:bg-primary-50"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No {activeTab} bookings</h3>
              <p className="mt-1 text-gray-500">
                {activeTab === 'upcoming' ? "You don't have any upcoming bookings." : 
                 activeTab === 'completed' ? "You don't have any completed bookings yet." :
                 "You don't have any cancelled bookings."}
              </p>
              <div className="mt-6">
                <Link 
                  to="/services" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Browse Services
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
