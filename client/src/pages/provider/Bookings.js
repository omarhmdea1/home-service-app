import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProviderBookings, updateBookingStatus } from '../../services/bookingService';
import StatusBadge from "../../components/common/StatusBadge";

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState("");
  const { userProfile } = useAuth();

  // Fetch provider bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!userProfile || !userProfile.firebaseUid) {
          setError('User profile not loaded');
          setLoading(false);
          return;
        }
        
        // Call the real API service to get provider bookings
        const bookingsData = await getProviderBookings(userProfile.firebaseUid);
        
        // Format the bookings data for display
        const formattedBookings = bookingsData.map(booking => ({
          id: booking._id,
          customerName: booking.userName || booking.userEmail || 'Customer',
          service: booking.serviceTitle || 'Service',
          date: booking.date,
          time: booking.time,
          status: booking.status,
          address: booking.address,
          notes: booking.notes,
          serviceId: booking.serviceId
        }));
        
        setBookings(formattedBookings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userProfile]);
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);


  // Handle booking status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      setError('');

      // Update status on the server
      await updateBookingStatus(bookingId, newStatus);

      // Refresh bookings from the API to ensure state is in sync
      const updated = await getProviderBookings(userProfile.firebaseUid);
      const formatted = updated.map(b => ({
        id: b._id,
        customerName: b.userName || b.userEmail || 'Customer',
        service: b.serviceTitle || 'Service',
        date: b.date,
        time: b.time,
        status: b.status,
        address: b.address,
        notes: b.notes,
        serviceId: b.serviceId
      }));

      setBookings(formatted);
      setSuccess('Booking status updated');
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(`Failed to update booking status: ${err.message}`);
    } finally {
      setLoading(false);
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
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{success}</p>
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
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 items-center">
                          <Link 
                            to={`/provider/bookings/${booking.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            View Details
                          </Link>
                          
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                className="text-primary-600 hover:text-primary-900 mr-2"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
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
