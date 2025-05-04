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
        // This would be replaced with a real API call to fetch bookings with status
        const mockBookings = [
          {
            id: 'bk1',
            service: {
              id: 's1',
              title: 'Professional Plumbing Service',
              image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80',
              provider: {
                name: 'Mike\'s Plumbing',
                rating: 4.8,
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
              }
            },
            date: new Date(Date.now() + 86400000 * 3), // 3 days from now
            timeSlot: '10:00 AM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'pending',
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
                rating: 4.9,
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
              }
            },
            date: new Date(Date.now() + 86400000 * 7), // 7 days from now
            timeSlot: '02:00 PM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'pending',
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
                rating: 4.7,
                avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
              }
            },
            date: new Date(Date.now() - 86400000 * 5), // 5 days ago
            timeSlot: '11:00 AM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'completed',
            createdAt: new Date().toISOString()
          },
          {
            id: 'bk4',
            service: {
              id: 's4',
              title: 'Lawn Mowing Service',
              image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
              provider: {
                name: 'GreenThumb Landscaping',
                rating: 4.6,
                avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
              }
            },
            date: new Date(Date.now() - 86400000 * 2), // 2 days ago
            timeSlot: '09:00 AM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'completed',
            createdAt: new Date().toISOString()
          },
          {
            id: 'bk5',
            service: {
              id: 's5',
              title: 'Carpet Cleaning',
              image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
              provider: {
                name: 'Fresh Carpets Inc',
                rating: 4.5,
                avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
              }
            },
            date: new Date(Date.now() + 86400000 * 1), // 1 day from now
            timeSlot: '01:00 PM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'cancelled',
            createdAt: new Date().toISOString()
          },
          {
            id: 'bk6',
            service: {
              id: 's6',
              title: 'HVAC Maintenance',
              image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
              provider: {
                name: 'Cool Air Systems',
                rating: 4.8,
                avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
              }
            },
            date: new Date(Date.now() + 86400000 * 10), // 10 days from now
            timeSlot: '03:00 PM',
            address: '123 Main St, Anytown, CA 12345',
            status: 'cancelled',
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
      return bookingDate >= now && (booking.status === 'confirmed' || booking.status === 'pending');
    } else if (activeTab === 'completed') {
      return booking.status === 'completed' || (bookingDate < now && booking.status === 'confirmed');
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
                className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'upcoming'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming
                {bookingCounts.upcoming > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {bookingCounts.upcoming}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'completed'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed
                {bookingCounts.completed > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {bookingCounts.completed}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'cancelled'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled
                {bookingCounts.cancelled > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {bookingCounts.cancelled}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          {/* Bookings List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <motion.div 
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
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
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
                        
                        <div className="mt-2 flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-2">
                            <img 
                              src={booking.service.provider.avatar} 
                              alt={booking.service.provider.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <p className="text-gray-600">{booking.service.provider.name}</p>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <span className="text-sm text-gray-500 block">Date</span>
                              <p className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <span className="text-sm text-gray-500 block">Time</span>
                              <p className="font-medium">{booking.timeSlot}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <span className="text-sm text-gray-500 block">Status</span>
                              <p className="font-medium">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                                {booking.status === 'pending' && 
                                  <span className="ml-2 text-xs text-gray-500">Awaiting confirmation</span>
                                }
                              </p>
                            </div>
                          </div>
                          <div className="md:col-span-2 flex items-start">
                            <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                              <span className="text-sm text-gray-500 block">Address</span>
                              <p className="font-medium">{booking.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-4">
                        <div className="mb-4 sm:mb-0 flex items-center">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span className="font-mono text-xs text-gray-500">{booking.id}</span>
                        </div>
                        
                        <div className="flex space-x-3">
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <>
                              <button 
                                onClick={() => window.location.href = `/booking/${booking.id}`}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Reschedule
                              </button>
                              <button 
                                onClick={() => window.location.href = `/booking/${booking.id}`}
                                className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {booking.status === 'completed' && (
                            <button 
                              onClick={() => window.location.href = `/booking/${booking.id}`}
                              className="px-4 py-2 bg-primary-600 rounded-md text-sm font-medium text-white hover:bg-primary-700 transition-colors flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              Leave Review
                            </button>
                          )}
                          
                          <Link 
                            to={`/booking/${booking.id}`}
                            className="px-4 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
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
  );
};

export default MyBookings;
