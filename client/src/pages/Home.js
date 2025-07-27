import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';

// ✅ NEW: Import our design system components
import {
  PageLayout,
  PageHeader,
  ContentSection,
  StatsLayout,
  CardGrid,
} from '../components/layout';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Icon,
  Heading,
  Text,
  Alert,
  LoadingState,
} from '../components/ui';

const Home = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {userRole === 'provider' ? <ProviderDashboard /> : <CustomerDashboard />}
      </div>
    </div>
  );
};

// Customer Dashboard
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]); 

  // ✅ Enhanced API call with timeout and better error handling
  const apiCall = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    }
  };

  // ✅ Enhanced data fetching with retry logic and better error handling
  const fetchDashboardData = async (isRetry = false) => {
    try {
      if (!currentUser?.uid) {
        console.log('No currentUser available, skipping data fetch');
        setLoading(false);
        return;
      }

      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      // ✅ Fetch services with better error handling
      let servicesData = [];
      try {
        const servicesResponse = await apiCall('http://localhost:5001/api/services');
        // Handle multiple response formats: array, { data: [] }, { services: [] }
        servicesData = Array.isArray(servicesResponse) 
          ? servicesResponse 
          : (servicesResponse.data || servicesResponse.services || []);
        
        if (!Array.isArray(servicesData)) {
          console.warn('Services API returned unexpected format:', servicesResponse);
          servicesData = [];
        }
        
        setServices(servicesData.slice(0, 4));
      } catch (servicesError) {
        console.error('Error fetching services:', servicesError);
        setServices([]); // Partial failure - continue with empty services
      }

      // ✅ Fetch bookings with better error handling
      let bookingsData = [];
      try {
        const bookingsResponse = await apiCall(
          `http://localhost:5001/api/bookings?userId=${currentUser.uid}`
        );
        
        // Handle multiple response formats
        bookingsData = Array.isArray(bookingsResponse) 
          ? bookingsResponse 
          : (bookingsResponse.data || bookingsResponse.bookings || []);

        if (!Array.isArray(bookingsData)) {
          console.warn('Bookings API returned unexpected format:', bookingsResponse);
          bookingsData = [];
        }

        // ✅ Enhanced booking details fetching with better error handling
        if (bookingsData.length > 0) {
          const bookingsWithDetails = await Promise.allSettled(
            bookingsData.slice(0, 3).map(async (booking) => {
              try {
                const serviceData = await apiCall(`http://localhost:5001/api/services/${booking.serviceId}`);
                return {
                  ...booking,
                  serviceName: serviceData?.title || 'Unknown Service',
                  providerName: serviceData?.providerName || 'Unknown Provider',
                  serviceImage: serviceData?.image || null
                };
              } catch (error) {
                console.warn(`Failed to fetch service details for booking ${booking._id}:`, error);
                return {
                  ...booking,
                  serviceName: 'Service Details Unavailable',
                  providerName: 'Provider Details Unavailable'
                };
              }
            })
          );

          // Extract successful results
          const successfulBookings = bookingsWithDetails
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
          
          setBookings(successfulBookings);
        } else {
          setBookings([]);
        }
      } catch (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        setBookings([]); // Partial failure - continue with empty bookings
      }

      setLoading(false);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  // ✅ Retry mechanism
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchDashboardData(true);
  };

  // ✅ Enhanced loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold mb-4">Welcome to HomeServices</h1>
          <p className="text-xl text-primary-100">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ Enhanced error state
  if (error && retryCount < 3) {
    return (
      <div className="space-y-8">
        <Alert variant="error" className="mx-auto max-w-2xl">
          <Icon name="error" size="sm" className="mr-2" />
          <div className="flex-1">
            <Text className="font-medium">Failed to Load Dashboard</Text>
            <Text size="small" className="text-neutral-600 mt-1">
              {error}
            </Text>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="ml-4"
          >
            <Icon name="spinner" size="xs" className="mr-1" />
            Retry {retryCount > 0 && `(${retryCount}/3)`}
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to HomeServices</h1>
        <p className="text-xl text-primary-100 mb-8">Find trusted professionals for all your home service needs</p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/services')}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Browse Services
          </button>
          <button
            onClick={() => navigate('/book-service')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          icon="⚡"
          title="Quick Service"
          subtitle="Book emergency services"
          onClick={() => navigate('/book-service')}
          variant="emergency"
        />
        <ActionCard
          icon="🔍"
          title="Browse Services"
          subtitle="Explore all available services"
          onClick={() => navigate('/services')}
          variant="primary"
        />
        <ActionCard
          icon="📅"
          title="My Bookings"
          subtitle="View your appointments"
          onClick={() => navigate('/my-bookings')}
          variant="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured Services</h2>
            <Link to="/services" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <ServiceCard key={service._id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="services" className="w-8 h-8 text-neutral-400" />
              </div>
              <Text className="text-neutral-600 mb-4">
                No services available at the moment
              </Text>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                size="sm"
              >
                Refresh
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <BookingCard key={booking._id} booking={booking} index={index} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="calendar" className="w-8 h-8 text-neutral-400" />
                </div>
                <Text className="text-neutral-600 mb-4">No bookings yet</Text>
                <Button 
                  onClick={() => navigate('/services')}
                  size="sm"
                >
                  Book your first service →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ NEW: Enhanced ProviderDashboard with Design System
const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    activeServices: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchProviderData();
  }, [currentUser]); 

  // ✅ Enhanced API call with timeout and better error handling
  const apiCall = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    }
  };

  // ✅ Enhanced provider data fetching
  const fetchProviderData = async (isRetry = false) => {
    try {
      if (!currentUser?.uid) {
        console.log('No currentUser available, skipping provider data fetch');
        setLoading(false);
        return;
      }

      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      // ✅ Fetch bookings with better error handling
      let bookingsData = [];
      try {
        const bookingsResponse = await apiCall(
          `http://localhost:5001/api/bookings?providerId=${currentUser.uid}`
        );
        
        bookingsData = Array.isArray(bookingsResponse) 
          ? bookingsResponse 
          : (bookingsResponse.data || bookingsResponse.bookings || []);

        if (!Array.isArray(bookingsData)) {
          console.warn('Provider bookings API returned unexpected format:', bookingsResponse);
          bookingsData = [];
        }
      } catch (bookingsError) {
        console.error('Error fetching provider bookings:', bookingsError);
        throw new Error('Failed to load booking information');
      }

      // ✅ Calculate stats with better error handling
      const totalBookings = bookingsData.length;
      const pendingRequests = bookingsData.filter(b => b.status === 'pending').length;
      const completedBookings = bookingsData.filter(b => b.status === 'completed');
      const totalEarnings = completedBookings.reduce((sum, booking) => {
        const price = parseFloat(booking.price) || 0;
        return sum + price;
      }, 0);
      
      // ✅ Fetch services count with better error handling
      let activeServices = 0;
      try {
        const servicesResponse = await apiCall(`http://localhost:5001/api/services?providerId=${currentUser.uid}`);
        const servicesData = Array.isArray(servicesResponse) 
          ? servicesResponse 
          : (servicesResponse.data || servicesResponse.services || []);
        activeServices = Array.isArray(servicesData) ? servicesData.length : 0;
      } catch (servicesError) {
        console.warn('Error fetching provider services count:', servicesError);
        // Continue with activeServices = 0
      }

      setStats({
        totalBookings,
        pendingRequests,
        totalEarnings,
        activeServices
      });

      // ✅ Process recent bookings with better error handling
      const sortedBookings = bookingsData
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 3);

      if (sortedBookings.length > 0) {
        const bookingsWithDetails = await Promise.allSettled(
          sortedBookings.map(async (booking) => {
            try {
              const serviceData = await apiCall(`http://localhost:5001/api/services/${booking.serviceId}`);
              return {
                ...booking,
                serviceName: serviceData?.title || 'Unknown Service',
                serviceImage: serviceData?.image || null
              };
            } catch (error) {
              console.warn(`Failed to fetch service details for booking ${booking._id}:`, error);
              return {
                ...booking,
                serviceName: 'Service Details Unavailable'
              };
            }
          })
        );

        const successfulBookings = bookingsWithDetails
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        
        setRecentBookings(successfulBookings);
      } else {
        setRecentBookings([]);
      }

      setLoading(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching provider data:', error);
      setError(error.message || 'Failed to load provider dashboard');
      setLoading(false);
    }
  };

  // ✅ Retry mechanism
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchProviderData(true);
  };

  // ✅ NEW: Enhanced StatCard component
  const StatCard = ({ title, value, icon, trend, variant = 'default', badge }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Text size="small" className="text-neutral-600 font-medium mb-2">
              {title}
            </Text>
            <Heading level={2} className="text-neutral-900 mb-1">
              {value}
            </Heading>
            {trend && (
              <div className="flex items-center mt-2">
                <Icon 
                  name={trend.includes('+') ? 'trendingUp' : 'trendingDown'} 
                  size="xs" 
                  className={`mr-1 ${trend.includes('+') ? 'text-success-600' : 'text-error-600'}`} 
                />
                <Text 
                  size="small" 
                  className={`font-medium ${trend.includes('+') ? 'text-success-600' : 'text-error-600'}`}
                >
                  {trend}
                </Text>
              </div>
            )}
            {badge && (
              <Badge variant="warning" size="sm" className="mt-2">
                {badge} pending
              </Badge>
            )}
          </div>
          <div className={`p-3 rounded-lg ${variant === 'primary' ? 'bg-primary-100' : variant === 'warning' ? 'bg-warning-100' : variant === 'success' ? 'bg-success-100' : 'bg-neutral-100'}`}>
            <Icon 
              name={icon} 
              size="lg" 
              className={variant === 'primary' ? 'text-primary-600' : variant === 'warning' ? 'text-warning-600' : variant === 'success' ? 'text-success-600' : 'text-neutral-600'} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced BusinessActionCard component
  const BusinessActionCard = ({ title, subtitle, icon, onClick, variant = 'default', badge }) => (
    <Card className="cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.02]" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${variant === 'primary' ? 'bg-primary-100' : variant === 'warning' ? 'bg-warning-100' : variant === 'success' ? 'bg-success-100' : 'bg-neutral-100'}`}>
            <Icon 
              name={icon} 
              size="lg" 
              className={variant === 'primary' ? 'text-primary-600' : variant === 'warning' ? 'text-warning-600' : variant === 'success' ? 'text-success-600' : 'text-neutral-600'} 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Heading level={4} className="text-neutral-900">
                {title}
              </Heading>
              {badge && (
                <Badge variant="warning" size="sm">
                  {badge}
                </Badge>
              )}
            </div>
            <Text size="small" className="text-neutral-600">
              {subtitle}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced RecentBookingCard component
  const RecentBookingCard = ({ booking }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon name="calendar" size="sm" className="text-primary-600" />
            </div>
            <div>
              <Heading level={4} className="text-neutral-900">
                {booking.userName || 'Customer'}
              </Heading>
              <Text size="small" className="text-neutral-600">
                {booking.serviceName}
              </Text>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <Text size="small" className="text-neutral-600">
                {new Date(booking.date).toLocaleDateString()}
              </Text>
              <Text size="small" className="text-neutral-500">
                {booking.time}
              </Text>
            </div>
            <Badge 
              variant={
                booking.status === 'completed' ? 'success' : 
                booking.status === 'confirmed' ? 'primary' : 
                booking.status === 'pending' ? 'warning' : 'neutral'
              }
              size="sm"
            >
              {booking.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ Enhanced loading state for provider
  if (loading) {
    return (
      <PageLayout background="bg-neutral-50">
        <PageHeader
          title="Business Dashboard"
          subtitle="Loading your business overview..."
          icon={<Icon name="home" />}
        />
        <ContentSection>
          <LoadingState 
            title="Loading your business dashboard..."
            description="Fetching your metrics, bookings, and recent activity"
          />
        </ContentSection>
      </PageLayout>
    );
  }

  // ✅ Enhanced error state for provider
  if (error && retryCount < 3) {
    return (
      <PageLayout background="bg-neutral-50">
        <PageHeader
          title="Business Dashboard"
          subtitle="Failed to load dashboard data"
          icon={<Icon name="home" />}
        />
        <ContentSection>
          <Alert variant="error" className="mx-auto max-w-2xl">
            <Icon name="error" size="sm" className="mr-2" />
            <div className="flex-1">
              <Text className="font-medium">Failed to Load Business Dashboard</Text>
              <Text size="small" className="text-neutral-600 mt-1">
                {error}
              </Text>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="ml-4"
            >
              <Icon name="spinner" size="xs" className="mr-1" />
              Retry {retryCount > 0 && `(${retryCount}/3)`}
            </Button>
          </Alert>
        </ContentSection>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="bg-neutral-50">
      <PageHeader
        title="Business Dashboard"
        subtitle={`Welcome back, ${userProfile?.name || currentUser?.displayName || 'Provider'}!`}
        description="Manage your services, track bookings, and grow your business"
        icon={<Icon name="home" />}
        breadcrumbs={[
          { label: 'Home' }
        ]}
        actions={[
          {
            label: 'Add Service',
            variant: 'primary',
            onClick: () => navigate('/provider/services'),
            icon: <Icon name="plus" size="sm" />
          },
          {
            label: 'View Profile',
            variant: 'outline',
            onClick: () => navigate('/provider/profile'),
            icon: <Icon name="user" size="sm" />
          }
        ]}
      />

      <ContentSection>
        {/* Verification Alert */}
        {!userProfile?.isVerified && (
          <Alert variant="warning" className="mb-8">
            <Icon name="clock" size="sm" className="mr-2" />
            <div>
              <Text className="font-medium">Account Verification Pending</Text>
              <Text size="small" className="text-neutral-600 mt-1">
                Complete your profile verification to start receiving bookings and build customer trust.
              </Text>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/provider/profile')}
              className="ml-4"
            >
              Complete Verification
            </Button>
          </Alert>
        )}

        {/* Business Stats */}
        <StatsLayout className="mb-8">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="calendar"
            trend="+12%"
            variant="primary"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon="clock"
            variant="warning"
            badge={stats.pendingRequests > 0 ? stats.pendingRequests : null}
          />
          <StatCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            icon="dollar"
            trend="+8%"
            variant="success"
          />
          <StatCard
            title="Active Services"
            value={stats.activeServices}
            icon="services"
            variant="default"
          />
        </StatsLayout>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BusinessActionCard
            title="Manage Bookings"
            subtitle="View and manage your appointments"
            icon="calendar"
            onClick={() => navigate('/provider/bookings')}
            variant="primary"
            badge={stats.pendingRequests > 0 ? stats.pendingRequests : null}
          />
          <BusinessActionCard
            title="My Services"
            subtitle="Edit your service offerings"
            icon="services"
            onClick={() => navigate('/provider/services')}
            variant="default"
          />
          <BusinessActionCard
            title="Earnings"
            subtitle="Track your revenue and payouts"
            icon="dollar"
            onClick={() => navigate('/provider/earnings')}
            variant="success"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="activity" size="sm" />
                Recent Activity
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/provider/bookings')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-0">
                {recentBookings.map((booking) => (
                  <RecentBookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="calendar" className="w-8 h-8 text-neutral-400" />
                </div>
                <Heading level={3} className="text-neutral-900 mb-2">No recent activity</Heading>
                <Text className="text-neutral-600 mb-4">
                  Start by adding your services to attract customers
                </Text>
                <Button
                  onClick={() => navigate('/provider/services')}
                  className="flex items-center gap-2"
                >
                  <Icon name="plus" size="sm" />
                  Add Your First Service
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </ContentSection>
    </PageLayout>
  );
};

// Welcome Screen for non-logged-in users
const WelcomeScreen = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <Heading level={2} className="text-neutral-900 mb-2">
            Welcome to HomeServices
          </Heading>
          <Text className="text-neutral-600 mb-8">
            Connect with trusted professionals for all your home service needs
          </Text>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/signup')}
              className="w-full"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Sign In
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <Link 
              to="/services" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Browse services without signing up →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Reusable Components for Customer Dashboard (keeping existing for now)
const ActionCard = ({ icon, title, subtitle, onClick, variant = 'default' }) => {
  const variants = {
    emergency: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200',
    primary: 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200 hover:from-primary-100 hover:to-primary-200',
    secondary: 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:from-amber-100 hover:to-amber-200',
    default: 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
  };

  const iconColors = {
    emergency: 'text-red-600',
    primary: 'text-primary-600',
    secondary: 'text-amber-600',
    default: 'text-gray-600'
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${variants[variant]} relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
      
      <div className="relative z-10">
        <div className={`mb-3 text-2xl ${iconColors[variant]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, index }) => {
  const navigate = useNavigate();
  const gradients = [
    'from-blue-100 to-blue-200',
    'from-emerald-100 to-emerald-200',
    'from-purple-100 to-purple-200',
    'from-amber-100 to-amber-200'
  ];

  return (
    <div
      className={`bg-gradient-to-r ${gradients[index % gradients.length]} p-4 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 border border-gray-200`}
      onClick={() => navigate(`/services/${service._id}`)}
    >
      <h3 className="font-medium text-gray-900 text-sm mb-1">{service.title}</h3>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{service.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">${service.price}</span>
        <span className="text-xs text-gray-500">{service.category}</span>
      </div>
    </div>
  );
};

const BookingCard = ({ booking, index }) => {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 text-sm">{booking.serviceName}</p>
        <p className="text-xs text-gray-600">{booking.providerName}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-600">{new Date(booking.date).toLocaleDateString()}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
          {booking.status}
        </span>
      </div>
    </div>
  );
};

export default Home;
