import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { motion } from 'framer-motion';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userProfile } = useAuth();

  // Fetch provider bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // In a real app, this would be a call to your backend API
        // For now, we'll use mock data
        const mockBookings = [
          {
            id: 'bk1',
            customerName: 'John Doe',
            service: 'Plumbing Repair',
            date: '2025-05-10',
            time: '10:00 AM',
            status: 'pending',
            address: '123 Main St, Anytown',
            notes: 'Leaking faucet in kitchen'
          },
          {
            id: 'bk2',
            customerName: 'Jane Smith',
            service: 'Electrical Wiring',
            date: '2025-05-12',
            time: '2:00 PM',
            status: 'confirmed',
            address: '456 Oak Ave, Somewhere',
            notes: 'Need to install new outlets in living room'
          },
          {
            id: 'bk3',
            customerName: 'Robert Johnson',
            service: 'Plumbing Repair',
            date: '2025-05-15',
            time: '9:30 AM',
            status: 'completed',
            address: '789 Pine St, Nowhere',
            notes: 'Fixed bathroom sink'
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setBookings(mockBookings);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle booking status update
  const handleStatusUpdate = (bookingId, newStatus) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Bookings</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">You don't have any bookings yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.date}</div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {booking.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProviderBookings;
