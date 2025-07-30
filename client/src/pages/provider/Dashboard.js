import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../components/auth/AuthProvider';
import { getProviderBookings } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getCurrentUserProfile } from '../../services/userService';
import { formatPrice, formatCurrency } from '../../utils/formatters';

// ✅ NEW: Import our design system components
import {
  DashboardPageTemplate,
  StatsLayout,
  CardGrid,
  ContentSection,
} from '../../components/layout';

import {
  Card,
  CardContent,
  Button,
  Badge,
  Icon,
  Heading,
  Text,
  ActionCard,
  Alert,
} from '../../components/ui';

const ProviderDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalEarnings: 0,
    activeServices: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get provider bookings from API
        if (userProfile && userProfile.uid) {
          const bookings = await getProviderBookings(userProfile.uid);
          
          // Calculate stats from bookings
          const pendingCount = bookings.filter(b => b.status === 'pending').length;
          const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
          const completedCount = bookings.filter(b => b.status === 'completed').length;
          const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
          
          // Calculate total earnings from completed bookings
          const earnings = bookings
            .filter(b => b.status === 'completed')
            .reduce((total, booking) => total + (booking.price || 0), 0);
          
          setStats({
            pendingBookings: pendingCount,
            confirmedBookings: confirmedCount,
            completedBookings: completedCount,
            cancelledBookings: cancelledCount,
            totalEarnings: earnings,
            activeServices: 0 // This would come from a separate API call in a real app
          });
          
          // Get most recent bookings (up to 3)
          const sortedBookings = [...bookings]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map(booking => ({
              id: booking._id,
              customerName: booking.userName || 'Customer',
              customerEmail: booking.userEmail || 'No email provided',
              service: booking.serviceName,
              date: new Date(booking.date),
              time: booking.time,
              status: booking.status,
              price: booking.price
            }));
          
          setRecentBookings(sortedBookings);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [userProfile]);

  // ✅ NEW: Stats cards using our design system
  const statsCards = (
    <StatsLayout cols={3}>
      <StatCard
        icon={<Icon name="calendar" />}
        title="Upcoming Bookings"
        value={stats.pendingBookings + stats.confirmedBookings}
        trend="positive"
        details={[
          { label: 'Pending', value: stats.pendingBookings, color: 'warning' },
          { label: 'Confirmed', value: stats.confirmedBookings, color: 'success' }
        ]}
      />
      
      <StatCard
        icon={<Icon name="money" />}
        title="Total Earnings"
        value={formatCurrency(stats.totalEarnings)}
        subtitle={`From ${stats.completedBookings} completed bookings`}
        trend="positive"
      />
      
      <StatCard
        icon={<Icon name="services" />}
        title="Active Services"
        value={stats.activeServices}
                 action={
           <Link 
             to="/provider/services"
             className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
           >
             Manage Services
             <Icon name="arrowRight" size="xs" className="ml-1" />
           </Link>
         }
      />
    </StatsLayout>
  );

     // ✅ NEW: Quick actions using ActionCard components
   const quickActions = (
     <CardGrid cols={4}>
       <ActionCard
         icon={<Icon name="add" />}
         title="Add Service"
         subtitle="Create new service offering"
         variant="primary"
         onClick={() => window.location.href = '/provider/services'}
       />
       
             <ActionCard
        icon={<Icon name="calendar" />}
        title="Booking Requests"
        subtitle={`${stats.pendingBookings} pending requests`}
        variant="secondary"
        badge={stats.pendingBookings > 0 ? { text: stats.pendingBookings, variant: 'warning' } : null}
        onClick={() => window.location.href = '/my-bookings'}
      />
       
       <ActionCard
         icon={<Icon name="chat" />}
         title="Messages"
         subtitle="Customer communications"
         onClick={() => window.location.href = '/chat'}
       />
       
       <ActionCard
         icon={<Icon name="money" />}
         title="Earnings"
         subtitle="View financial reports"
         variant="success"
         onClick={() => window.location.href = '/provider/earnings'}
       />
     </CardGrid>
   );

  // ✅ NEW: Recent bookings with enhanced design
  const recentBookingsContent = (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <Heading level={3}>Recent Bookings</Heading>
                     <Button variant="outline" size="sm" onClick={() => window.location.href = '/my-bookings'}>
             View All
           </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Icon name="spinner" size="lg" className="text-primary-600 mb-4" />
            <Text>Loading recent bookings...</Text>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="calendar" size="2xl" className="text-neutral-400 mx-auto mb-4" />
            <Heading level={4} className="text-neutral-600 mb-2">No Recent Bookings</Heading>
            <Text className="text-neutral-500 mb-4">
              Your recent booking activity will appear here
            </Text>
                         <Button variant="primary" onClick={() => window.location.href = '/provider/services'}>
               Add Your First Service
             </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Show welcome message for new providers
  const welcomeAlert = (
    <Alert variant="info" title="Welcome to HomeCare Services!" className="mb-6">
      <div className="flex items-center">
        <Icon name="info" size="sm" className="mr-2 text-primary-600" />
        Complete your profile and add services to start receiving bookings from customers.
      </div>
    </Alert>
  );

  // Show alert for pending booking requests
  const pendingRequestsAlert = stats.pendingBookings > 0 && (
    <Alert variant="warning" title={`You have ${stats.pendingBookings} pending booking request${stats.pendingBookings > 1 ? 's' : ''}!`} className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon name="calendar" size="sm" className="mr-2 text-warning-600" />
          <span>Customer{stats.pendingBookings > 1 ? 's' : ''} waiting for your response. Accept or decline to confirm appointment{stats.pendingBookings > 1 ? 's' : ''}.</span>
        </div>
        <Button 
          variant="warning" 
          size="sm"
          onClick={() => window.location.href = '/my-bookings'}
        >
          <Icon name="calendar" size="xs" className="mr-1" />
          Review Requests
        </Button>
      </div>
    </Alert>
  );

  // ✅ NEW: Use DashboardPageTemplate for consistent layout
  return (
    <DashboardPageTemplate
      title="Provider Dashboard"
      subtitle={`Welcome back, ${userProfile?.displayName || 'Provider'}!`}
      icon={<Icon name="home" />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard' }
      ]}
             primaryAction={{
         label: 'Add Service',
         onClick: () => window.location.href = '/provider/services',
         icon: <Icon name="add" />
       }}
       actions={[
         { 
           label: 'Export Data', 
           variant: 'outline',
           onClick: () => alert('Export functionality coming soon!')
         }
       ]}
      stats={statsCards}
      quickActions={quickActions}
      mainContent={
        <div>
          {welcomeAlert}
          {pendingRequestsAlert}
          <ContentSection title="Recent Activity">
            {recentBookingsContent}
          </ContentSection>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <Card>
            <CardContent>
              <Heading level={4} className="mb-4">Quick Stats</Heading>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text size="small">This Week</Text>
                  <Badge variant="success">+12%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Text size="small">This Month</Text>
                  <Badge variant="primary">+8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Text size="small">Response Rate</Text>
                  <Badge variant="success">98%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Heading level={4} className="mb-4">Recent Reviews</Heading>
              <Text size="small" className="text-neutral-600">
                Customer reviews will appear here once you start completing services.
              </Text>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
};

// ✅ NEW: Reusable StatCard component using design system
const StatCard = ({ icon, title, value, subtitle, trend, details, action }) => (
  <Card className="hover:shadow-card-hover transition-all duration-200">
    <CardContent>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          <div className="h-6 w-6 text-primary-600">
            {icon}
          </div>
        </div>
        {trend && (
          <Badge variant={trend === 'positive' ? 'success' : 'error'} size="sm">
            {trend === 'positive' ? '+' : '-'}5.2%
          </Badge>
        )}
      </div>
      
      <div className="mb-4">
        <Text size="small" className="text-neutral-600 mb-1">{title}</Text>
        <Text size="large" className="font-bold text-neutral-900">{value}</Text>
        {subtitle && (
          <Text size="small" className="text-neutral-500 mt-1">{subtitle}</Text>
        )}
      </div>

      {details && (
        <div className="flex space-x-4 mb-4">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                detail.color === 'warning' ? 'bg-warning-400' : 
                detail.color === 'success' ? 'bg-success-400' : 'bg-neutral-400'
              }`} />
              <Text size="small" className="text-neutral-600">
                {detail.label}: {detail.value}
              </Text>
            </div>
          ))}
        </div>
      )}

      {action && action}
    </CardContent>
  </Card>
);

// ✅ NEW: Enhanced BookingCard component
const BookingCard = ({ booking }) => (
  <Card className="p-4 hover:shadow-sm transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-neutral-100 rounded-lg">
          <Icon name="profile" size="md" className="text-neutral-600" />
        </div>
        <div>
          <Text className="font-medium text-neutral-900">{booking.customerName}</Text>
          <Text size="small" className="text-neutral-600">{booking.service}</Text>
          <Text size="small" className="text-neutral-500">
            {booking.date.toLocaleDateString()} at {booking.time}
          </Text>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Badge variant={
          booking.status === 'confirmed' ? 'success' :
          booking.status === 'pending' ? 'warning' :
          booking.status === 'completed' ? 'primary' : 'error'
        }>
          {booking.status}
        </Badge>
        <Text className="font-semibold text-neutral-900">
          {formatCurrency(booking.price)}
        </Text>
      </div>
    </div>
  </Card>
);

export default ProviderDashboard;
