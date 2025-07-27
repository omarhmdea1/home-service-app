import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { getProviderBookings, updateBookingStatus } from '../../services/bookingService';

// ✅ NEW: Import our design system components
import {
  ListPageTemplate,
} from '../../components/layout';

import {
  Card,
  CardContent,
  Button,
  Badge,
  Icon,
  Heading,
  Text,
  Alert,
  LoadingState,
} from '../../components/ui';

import StatusBadge from "../../components/common/StatusBadge";

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
        
        const bookingsData = await getProviderBookings(userProfile.firebaseUid);
        
        const formattedBookings = bookingsData.map(booking => ({
          id: booking._id,
          customerName: booking.userName || booking.userEmail || 'Customer',
          service: booking.serviceTitle || 'Service',
          date: booking.date,
          time: booking.time,
          status: booking.status,
          address: booking.address,
          notes: booking.notes,
          serviceId: booking.serviceId,
          createdAt: booking.createdAt || new Date()
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

      await updateBookingStatus(bookingId, newStatus);

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
        serviceId: b.serviceId,
        createdAt: b.createdAt || new Date()
      }));

      setBookings(formatted);
      setSuccess(`Booking ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'completed' ? 'completed' : 'cancelled'} successfully`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(`Failed to update booking status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ✅ NEW: Enhanced BookingCard component
  const BookingCard = ({ booking }) => (
    <Card className="hover:shadow-card-hover transition-all duration-150">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Icon name="calendar" className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Heading level={4} className="text-neutral-900">
                  {booking.customerName}
                </Heading>
                <StatusBadge status={booking.status} />
              </div>
              <Text className="text-neutral-600 mb-1">{booking.service}</Text>
              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                <div className="flex items-center space-x-1">
                  <Icon name="calendar" size="xs" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="clock" size="xs" />
                  <span>{booking.time}</span>
                </div>
              </div>
              {booking.address && (
                <div className="flex items-center space-x-1 mt-2 text-sm text-neutral-500">
                  <Icon name="location" size="xs" />
                  <span>{booking.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div className="flex items-center space-x-2">
            <Link to={`/provider/bookings/${booking.id}`}>
              <Button variant="outline" size="sm">
                <Icon name="info" size="xs" className="mr-1" />
                View Details
              </Button>
            </Link>
            
            {booking.status === 'pending' && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                >
                  <Icon name="check" size="xs" className="mr-1" />
                  Confirm
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                >
                  <Icon name="close" size="xs" className="mr-1" />
                  Cancel
                </Button>
              </>
            )}
            
            {booking.status === 'confirmed' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => handleStatusUpdate(booking.id, 'completed')}
              >
                <Icon name="check" size="xs" className="mr-1" />
                Mark Complete
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="chat" size="xs" className="mr-1" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced filter panel
  const filtersPanel = (
    <Card>
      <CardContent>
        <div className="flex items-center mb-6">
          <Icon name="services" className="text-primary-600 mr-2" />
          <Heading level={3}>Filter Bookings</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer, service, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              />
              <Icon 
                name="services" 
                size="sm" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" 
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-200">
          {[
            { label: 'Total', count: bookings.length, color: 'text-neutral-600' },
            { label: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: 'text-warning-600' },
            { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'text-success-600' },
            { label: 'Completed', count: bookings.filter(b => b.status === 'completed').length, color: 'text-primary-600' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <Text className={`text-2xl font-bold ${stat.color}`}>{stat.count}</Text>
              <Text size="small" className="text-neutral-500">{stat.label}</Text>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced empty state
  const emptyAction = (
    <div className="text-center space-y-4">
      <Text className="text-neutral-600">
        Start providing services to receive booking requests from customers.
      </Text>
      <Link to="/provider/services">
        <Button variant="primary">
          <Icon name="add" size="sm" className="mr-2" />
          Add Your Services
        </Button>
      </Link>
    </div>
  );

  return (
    <>
      {/* Success/Error Alerts */}
      {success && (
        <Alert variant="success" className="mb-6">
          <Icon name="success" size="sm" className="mr-2" />
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert variant="error" className="mb-6">
          <Icon name="error" size="sm" className="mr-2" />
          {error}
        </Alert>
      )}

      <ListPageTemplate
        title="Manage Bookings"
        subtitle="Review and manage your service booking requests"
        description="Track customer bookings, update status, and communicate with clients"
        icon={<Icon name="calendar" />}
        breadcrumbs={[
          { label: 'Provider Dashboard', href: '/provider/dashboard' },
          { label: 'Bookings' }
        ]}
        primaryAction={{
          label: 'View Calendar',
          onClick: () => console.log('Calendar view'),
          icon: <Icon name="calendar" />
        }}
        actions={[
          { 
            label: 'Export',
            variant: 'outline',
            onClick: () => console.log('Export bookings')
          }
        ]}
        filters={filtersPanel}
        items={filteredBookings}
        renderItem={(booking, index) => (
          <BookingCard key={booking.id} booking={booking} />
        )}
        layout="list"
        loading={loading}
        error={error ? { message: error } : null}
        empty={filteredBookings.length === 0 && !loading}
        emptyTitle="No bookings found"
        emptyDescription={
          searchTerm || statusFilter 
            ? "No bookings match your current filters. Try adjusting your search criteria."
            : "You don't have any bookings yet."
        }
        emptyAction={emptyAction}
        background="bg-neutral-50"
      />
    </>
  );
};

export default ProviderBookings;
