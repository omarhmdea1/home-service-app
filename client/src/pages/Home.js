import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import { getServices } from '../services/serviceService';
import { getUserBookings } from '../services/bookingService';
import { formatPrice, formatCurrency } from '../utils/formatters';

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

  // Return the appropriate dashboard based on user role
  return userRole === 'provider' ? <ProviderDashboard /> : <CustomerDashboard />;
};

// Customer Dashboard
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth(); 
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetch, setLastFetch] = useState(0);
  const [weather, setWeather] = useState(null);

  // ✅ Memoize currentUser.uid to prevent unnecessary re-fetches
  const currentUserId = currentUser?.uid;
  const userName = userProfile?.name || currentUser?.displayName || 'there';
  const firstName = userName.split(' ')[0];

  useEffect(() => {
    // Only fetch if we have a valid user ID and data is stale (5 minutes)
    const isStale = Date.now() - lastFetch > 300000; // 5 minutes
    if (currentUserId && (isStale || services.length === 0)) {
      fetchDashboardData();
    } else if (currentUserId && !isStale) {
      console.log('💾 Using cached dashboard data');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentUserId]); // Use memoized ID instead of full currentUser object

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

  // ✅ Enhanced data fetching with retry logic
  const fetchDashboardData = async (isRetry = false) => {
    try {
      if (!currentUserId) {
        console.error('No current user ID available');
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Fetch featured services and user's recent bookings in parallel
      const [servicesResponse, bookingsResponse] = await Promise.allSettled([
        apiCall('http://localhost:5001/api/services?limit=6&featured=true'),
        apiCall(`http://localhost:5001/api/bookings/user/${currentUserId}?limit=3`)
      ]);

      // Handle services
      if (servicesResponse.status === 'fulfilled') {
        const servicesData = servicesResponse.value?.services || servicesResponse.value || [];
        setServices(servicesData.slice(0, 6));
        setPopularServices(servicesData.slice(0, 8));
      } else {
        console.error('Services fetch failed:', servicesResponse.reason);
        setServices([]);
        setPopularServices([]);
      }

      // Handle bookings with service details
      if (bookingsResponse.status === 'fulfilled') {
        const bookingsData = bookingsResponse.value?.bookings || bookingsResponse.value || [];
        
        if (bookingsData.length > 0) {
          const bookingsWithDetails = await Promise.allSettled(
            bookingsData.slice(0, 3).map(async (booking) => {
              try {
                const serviceData = await apiCall(`http://localhost:5001/api/services/${booking.serviceId}`);
                return {
                  ...booking,
                  serviceName: serviceData?.title || 'Unknown Service',
                  providerName: serviceData?.providerName || 'Unknown Provider',
                  serviceImage: serviceData?.image || null,
                  category: serviceData?.category || 'General'
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

          const successfulBookings = bookingsWithDetails
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
          
          setBookings(successfulBookings);
        } else {
          setBookings([]);
        }
      } else {
        console.error('Bookings fetch failed:', bookingsResponse.reason);
        setBookings([]);
      }

      setLoading(false);
      setRetryCount(0);
      setLastFetch(Date.now());
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

  // ✅ Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ✅ Enhanced loading state
  if (loading) {
    return (
      <PageLayout background="bg-gradient-to-br from-neutral-50 to-primary-50">
        <LoadingState 
          title="Loading your dashboard..."
          description="Preparing your personalized home service experience"
        />
      </PageLayout>
    );
  }

  // ✅ Enhanced error state
  if (error && retryCount < 3) {
    return (
      <PageLayout background="bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-2xl mx-auto">
          <Alert variant="error">
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
      </PageLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full transform translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full transform -translate-x-32 translate-y-32 animate-pulse delay-300"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="bg-white/20 text-white border-white/30 mb-4">
                ✨ Welcome Back!
              </Badge>
              
              <Heading level={1} className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {getGreeting()}, {firstName}!
              </Heading>
              
              <Text className="text-xl text-primary-100 mb-8 leading-relaxed">
                Your home deserves the best care. Let's find the perfect service for your next project.
              </Text>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white mb-1">{bookings.length}</div>
                  <div className="text-primary-200 text-sm">Active Bookings</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white mb-1">{services.length}+</div>
                  <div className="text-primary-200 text-sm">Services Available</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/services')}
                  className="bg-white text-primary-600 hover:bg-primary-50 border-0 text-lg px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Icon name="services" size="sm" className="mr-2" />
                  Explore Services
                </Button>
                
                {bookings.length > 0 && (
                  <Button 
                    onClick={() => navigate('/my-bookings')}
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
                  >
                    <Icon name="calendar" size="sm" className="mr-2" />
                    My Bookings
                  </Button>
                )}
              </div>
            </div>

            <div className="relative">
              {/* Service Preview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon name="home" className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <Text size="small" className="font-semibold text-neutral-900">House Cleaning</Text>
                      <Text size="tiny" className="text-neutral-600">Available Now</Text>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-white p-4 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                      <Icon name="services" className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <Text size="small" className="font-semibold text-neutral-900">Quick Repairs</Text>
                      <Text size="tiny" className="text-neutral-600">Same Day</Text>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Smart Quick Actions */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CustomerActionCard
              title="Instant Help"
              subtitle="Urgent solutions available"
              icon="emergency"
              onClick={() => navigate('/services?category=emergency')}
              variant="error"
              badge="Fast"
            />
            <CustomerActionCard
              title="Trending Now"
              subtitle="What others are booking"
              icon="star"
              onClick={() => navigate('/services?popular=true')}
              variant="warning"
              badge="Popular"
            />
            <CustomerActionCard
              title="Quick Book"
              subtitle={bookings.length > 0 ? "Book your favorites" : "Find your service"}
              icon={bookings.length > 0 ? "repeat" : "plus"}
              onClick={() => bookings.length > 0 ? navigate('/my-bookings') : navigate('/services')}
              variant="primary"
            />
            <CustomerActionCard
              title="Need Help?"
              subtitle="Expert advice & support"
              icon="chat"
              onClick={() => navigate('/messages')}
              variant="secondary"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Services - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="star" size="sm" className="text-warning-500" />
                    Recommended for You
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/services')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.slice(0, 4).map((service, index) => (
                      <CustomerServiceCard key={service._id} service={service} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="services" className="w-10 h-10 text-primary-600" />
                    </div>
                    <Heading level={3} className="text-neutral-900 mb-2">Discover Amazing Services</Heading>
                    <Text className="text-neutral-600 mb-6">
                      Browse our marketplace of trusted professionals
                    </Text>
                    <Button
                      onClick={() => navigate('/services')}
                      className="transform hover:scale-105 transition-all duration-300"
                    >
                      <Icon name="services" size="sm" className="mr-2" />
                      Explore Services
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="calendar" size="sm" className="text-primary-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking, index) => (
                      <CustomerBookingCard key={booking._id} booking={booking} index={index} compact />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/my-bookings')}
                      className="w-full mt-4"
                    >
                      View All Bookings
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="calendar" className="w-8 h-8 text-primary-600" />
                    </div>
                    <Heading level={4} className="text-neutral-900 mb-2">Ready to Start?</Heading>
                    <Text className="text-neutral-600 mb-4 text-sm">
                      Book your first service and join thousands of satisfied customers
                    </Text>
                    <Button 
                      onClick={() => navigate('/services')}
                      size="sm"
                      className="w-full"
                    >
                      <Icon name="plus" size="xs" className="mr-1" />
                      Book First Service
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips & Insights */}
            <Card className="bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
              <CardHeader className="border-b border-success-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-success-700">
                  <Icon name="check" size="sm" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="check" size="xs" className="text-success-600" />
                    </div>
                    <Text size="small" className="text-success-700">
                      Book services during weekdays for better availability and rates
                    </Text>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="star" size="xs" className="text-primary-600" />
                    </div>
                    <Text size="small" className="text-primary-700">
                      Check provider reviews and ratings before booking
                    </Text>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="clock" size="xs" className="text-warning-600" />
                    </div>
                    <Text size="small" className="text-warning-700">
                      Schedule regular maintenance to prevent costly repairs
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Service Categories */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <Heading level={2} className="text-2xl font-bold text-neutral-900 mb-2">
              Popular Service Categories
            </Heading>
            <Text className="text-neutral-600">
              Find the right professional for any home project
            </Text>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Cleaning', icon: 'home', color: 'primary' },
              { name: 'Plumbing', icon: 'services', color: 'success' },
              { name: 'Electrical', icon: 'emergency', color: 'warning' },
              { name: 'Gardening', icon: 'star', color: 'success' },
              { name: 'Moving', icon: 'calendar', color: 'primary' },
              { name: 'Repairs', icon: 'tools', color: 'error' }
            ].map((category, index) => (
              <Card 
                key={category.name}
                className={`cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 border-${category.color}-200`}
                onClick={() => navigate(`/services?category=${category.name.toLowerCase()}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 bg-${category.color}-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon name={category.icon} className={`w-6 h-6 text-${category.color}-600`} />
                  </div>
                  <Text className={`font-medium text-${category.color}-700`}>
                    {category.name}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
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
  const [lastFetch, setLastFetch] = useState(0);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    activeServices: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  // ✅ Memoize currentUser.uid to prevent unnecessary re-fetches
  const currentUserId = currentUser?.uid;

  useEffect(() => {
    // Only fetch if we have a valid user ID and data is stale (5 minutes)
    const isStale = Date.now() - lastFetch > 300000; // 5 minutes
    if (currentUserId && (isStale || stats.totalBookings === 0)) {
      fetchProviderData();
    } else if (currentUserId && !isStale) {
      console.log('💾 Using cached provider dashboard data');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentUserId]); // Use memoized ID instead of full currentUser object

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
      if (!currentUserId) {
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
          `http://localhost:5001/api/bookings?providerId=${currentUserId}`
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
        const servicesResponse = await apiCall(`http://localhost:5001/api/services?providerId=${currentUserId}`);
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
      setLastFetch(Date.now()); // Update last fetch timestamp
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
            value={formatCurrency(stats.totalEarnings)}
            icon="money"
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

// Welcome Screen for non-logged-in users - Beautiful Marketing Landing Page
const WelcomeScreen = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden min-h-screen flex items-center">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-black/20">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80" 
            alt="Beautiful modern home" 
            className="w-full h-full object-cover opacity-30" 
          />
        </div>
        
        {/* Animated Floating Pattern Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full transform -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full transform translate-x-40 translate-y-40 animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full animate-bounce"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="bg-white/20 text-white border-white/30 mb-4">
                ⭐ Trusted by 10,000+ Homeowners
              </Badge>
              
              <Heading level={1} className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Your Home,<br />
                <span className="text-primary-200 bg-gradient-to-r from-primary-200 to-white bg-clip-text text-transparent">
                  Perfect Care
                </span>
              </Heading>
              
              <Text className="text-xl lg:text-2xl text-primary-100 mb-8 leading-relaxed">
                Connect with verified, trusted professionals for cleaning, repairs, maintenance, and more. 
                <span className="font-semibold text-white">Quality service guaranteed, every time.</span>
              </Text>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  onClick={() => navigate('/services')}
                  className="bg-white text-primary-600 hover:bg-primary-50 border-0 text-lg px-8 py-6 shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Icon name="services" size="sm" className="mr-2" />
                  Browse Services
                  <span className="ml-2">→</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-6 transform hover:scale-105 transition-all duration-300"
                >
                  <Icon name="user" size="sm" className="mr-2" />
                  Join as Provider
                </Button>
              </div>
              
              {/* Enhanced Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
                <div className="group">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">10K+</div>
                  <div className="text-primary-200 text-sm">Happy Customers</div>
                </div>
                <div className="group">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">500+</div>
                  <div className="text-primary-200 text-sm">Verified Providers</div>
                </div>
                <div className="group">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">4.9★</div>
                  <div className="text-primary-200 text-sm">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block">
              {/* Hero Image Showcase */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-white p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Professional cleaning service" 
                    className="w-full h-32 object-cover rounded-lg mb-3" 
                  />
                  <Text size="small" className="font-semibold text-neutral-900">House Cleaning</Text>
                  <Text size="tiny" className="text-neutral-600">Starting at ₪80</Text>
                </Card>
                
                <Card className="bg-white p-4 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Professional plumbing service" 
                    className="w-full h-32 object-cover rounded-lg mb-3" 
                  />
                  <Text size="small" className="font-semibold text-neutral-900">Plumbing Repair</Text>
                  <Text size="tiny" className="text-neutral-600">Starting at ₪120</Text>
                </Card>
              </div>
              
              {/* Quick Booking Card */}
              <Card className="bg-white p-8 shadow-2xl backdrop-blur-sm bg-white/95">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <Icon name="home" className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <Heading level={3} className="text-neutral-900">Quick Booking</Heading>
                    <Text size="small" className="text-neutral-600">Get service in 3 easy steps</Text>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center group">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 group-hover:scale-110 transition-transform duration-300">1</div>
                    <Text>Choose your service</Text>
                  </div>
                  <div className="flex items-center group">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 group-hover:scale-110 transition-transform duration-300">2</div>
                    <Text>Select a provider</Text>
                  </div>
                  <div className="flex items-center group">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 group-hover:scale-110 transition-transform duration-300">3</div>
                    <Text>Book and relax</Text>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/services')}
                  className="w-full mt-6 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Icon name="calendar" size="sm" className="mr-2" />
                  Start Booking Now
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Heading level={2} className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Hausly?
            </Heading>
            <Text className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We make home maintenance simple, reliable, and stress-free with our comprehensive platform
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon="check"
              title="Verified Professionals"
              description="All service providers are thoroughly vetted, background-checked, and insured for your peace of mind."
              color="success"
            />
            <FeatureCard
              icon="clock"
              title="24/7 Support"
              description="Round-the-clock customer support and emergency services available when you need them most."
              color="primary"
            />
            <FeatureCard
              icon="dollar"
              title="Transparent Pricing"
              description="No hidden fees or surprise charges. See upfront pricing and pay securely through our platform."
              color="warning"
            />
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">
              🏆 Most Popular Services
            </Badge>
            <Heading level={2} className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Popular Services
            </Heading>
            <Text className="text-xl text-neutral-600">
              From routine maintenance to emergency repairs, we've got you covered
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <ServiceShowcaseCard
              image="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              icon="cleaning"
              title="House Cleaning"
              description="Professional deep cleaning and regular maintenance"
              price="Starting at ₪80"
              rating="4.9"
              reviews="1.2k"
            />
            <ServiceShowcaseCard
              image="https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              icon="services"
              title="Plumbing"
              description="Expert plumbing repairs and installations"
              price="Starting at ₪120"
              rating="4.8"
              reviews="890"
            />
            <ServiceShowcaseCard
              image="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              icon="emergency"
              title="Electrical"
              description="Safe and reliable electrical services"
              price="Starting at ₪150"
              rating="4.9"
              reviews="756"
            />
            <ServiceShowcaseCard
              image="https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              icon="home"
              title="HVAC"
              description="Heating, cooling, and ventilation services"
              price="Starting at ₪200"
              rating="4.7"
              reviews="634"
            />
          </div>
          
          <div className="text-center">
            <Button
              onClick={() => navigate('/services')}
              className="text-lg px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              View All Services
              <Icon name="arrowRight" size="sm" className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">
              💬 Customer Stories
            </Badge>
            <Heading level={2} className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              What Our Customers Say
            </Heading>
            <Text className="text-xl text-neutral-600">
              Real experiences from real homeowners who trust Hausly
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              image="https://images.unsplash.com/photo-1494790108755-2616b612b1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
              name="Sarah Johnson"
              location="San Francisco, CA"
              rating={5}
              text="Amazing service! The cleaning team was professional, thorough, and my house has never looked better. Scheduling was so easy through the app."
              service="House Cleaning"
            />
            <TestimonialCard
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
              name="Mike Chen"
              location="Austin, TX"
              rating={5}
              text="Had a plumbing emergency at 11 PM. Found a certified plumber through Hausly who came within an hour. Saved my weekend!"
              service="Emergency Plumbing"
            />
            <TestimonialCard
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
              name="Emily Rodriguez"
              location="Miami, FL"
              rating={5}
              text="The electrical work was done perfectly and the technician explained everything clearly. Great value and peace of mind knowing it's done right."
              service="Electrical Repair"
            />
          </div>
        </div>
      </section>

      {/* Before & After Transformations */}
      <section className="py-24 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4">
              ✨ Amazing Transformations
            </Badge>
            <Heading level={2} className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              See the Difference We Make
            </Heading>
            <Text className="text-xl text-neutral-600">
              Real transformations from our professional service providers
            </Text>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <BeforeAfterCard
              beforeImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              afterImage="https://images.unsplash.com/photo-1616627404449-8162f1de6c6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              title="Kitchen Deep Clean"
              description="Professional deep cleaning transformed this kitchen from cluttered to spotless in just 3 hours."
              service="House Cleaning"
              duration="3 hours"
              provider="CleanCo Professionals"
            />
            <BeforeAfterCard
              beforeImage="https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              afterImage="https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              title="Bathroom Renovation"
              description="Complete bathroom makeover with new fixtures, tiles, and modern design elements."
              service="Home Renovation"
              duration="5 days"
              provider="Elite Home Solutions"
            />
          </div>
          
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/services')}
              className="text-lg px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Icon name="camera" size="sm" className="mr-2" />
              Start Your Transformation
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Heading level={2} className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              How It Works
            </Heading>
            <Text className="text-xl text-neutral-600">
              Getting your home serviced has never been easier
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ProcessStep
              step="1"
              title="Book Online"
              description="Choose your service, select date and time that works for you. No phone calls needed."
              icon="calendar"
            />
            <ProcessStep
              step="2"
              title="We Match You"
              description="Our algorithm connects you with the best verified professionals in your area."
              icon="user"
            />
            <ProcessStep
              step="3"
              title="Get It Done"
              description="Your service provider arrives on time, completes the work, and you pay securely online."
              icon="check"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading level={2} className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Home?
          </Heading>
          <Text className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers who trust Hausly for all their home maintenance needs.
          </Text>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/signup')}
              className="bg-white text-primary-600 hover:bg-primary-50 border-0 text-lg px-8 py-4"
            >
              Get Started Today
            </Button>
            <Button
              onClick={() => navigate('/services')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4"
            >
              Browse Services
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Icon name="home" className="w-8 h-8 text-primary-400 mr-2" />
                <span className="text-xl font-bold">Hausly</span>
              </div>
              <Text className="text-neutral-400 mb-4">
                Your trusted partner for all home service needs. Quality, reliability, and peace of mind guaranteed.
              </Text>
            </div>
            
            <div>
              <Heading level={4} className="text-white mb-4">Services</Heading>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Cleaning</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Plumbing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Electrical</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HVAC</a></li>
              </ul>
            </div>
            
            <div>
              <Heading level={4} className="text-white mb-4">Company</Heading>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <Heading level={4} className="text-white mb-4">Connect</Heading>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
            <Text className="text-neutral-400">
              © 2024 Hausly. All rights reserved.
            </Text>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ✅ NEW: Enhanced Customer Dashboard Components
const CustomerActionCard = ({ title, subtitle, icon, onClick, variant = 'default', badge = null }) => {
  const variants = {
    error: 'bg-gradient-to-br from-error-50 to-error-100 border-error-200 hover:from-error-100 hover:to-error-200 hover:border-error-300',
    primary: 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:from-primary-100 hover:to-primary-200 hover:border-primary-300',
    success: 'bg-gradient-to-br from-success-50 to-success-100 border-success-200 hover:from-success-100 hover:to-success-200 hover:border-success-300',
    warning: 'bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 hover:from-warning-100 hover:to-warning-200 hover:border-warning-300',
    secondary: 'bg-gradient-to-br from-neutral-50 to-neutral-100 border-neutral-200 hover:from-neutral-100 hover:to-neutral-200 hover:border-neutral-300',
    default: 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200 hover:border-neutral-300 hover:shadow-lg'
  };

  const iconColors = {
    error: 'text-error-600',
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    secondary: 'text-neutral-600',
    default: 'text-neutral-600'
  };

  const iconBgColors = {
    error: 'bg-error-100',
    primary: 'bg-primary-100',
    success: 'bg-success-100',
    warning: 'bg-warning-100',
    secondary: 'bg-neutral-100',
    default: 'bg-neutral-100'
  };

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 border-2 hover:scale-105 hover:shadow-xl relative overflow-hidden group ${variants[variant]}`}
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBgColors[variant]} ${iconColors[variant]} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            <Icon name={icon} size="lg" />
          </div>
          {badge && (
            <Badge variant={variant === 'default' ? 'neutral' : variant} size="sm" className="shadow-sm">
              {badge}
            </Badge>
          )}
        </div>
        
        <Heading level={3} className="text-neutral-900 mb-2 group-hover:text-neutral-800 transition-colors">
          {title}
        </Heading>
        <Text className="text-neutral-600 group-hover:text-neutral-700 transition-colors">
          {subtitle}
        </Text>
      </CardContent>
      
      {/* Enhanced background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-125 transition-transform duration-500"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full transform -translate-x-8 translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
    </Card>
  );
};

const CustomerServiceCard = ({ service, index }) => {
  const navigate = useNavigate();
  
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group border border-neutral-200 hover:border-primary-200 overflow-hidden bg-white"
      onClick={() => navigate(`/services/${service._id}`)}
    >
      <CardContent className="p-0">
        {/* Service Image */}
        <div className="relative h-32 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
          {service.image ? (
            <img 
              src={service.image} 
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="services" className="w-12 h-12 text-primary-600 opacity-50" />
            </div>
          )}
          
          {/* Service Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="primary" className="bg-white/90 text-primary-700 border-0 shadow-sm">
              {service.category || 'Service'}
            </Badge>
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full shadow-sm">
            <Icon name="star" size="xs" className="text-warning-500" />
            <Text size="tiny" className="font-medium text-neutral-700">
              {service.rating || '4.8'}
            </Text>
          </div>
        </div>
        
        {/* Service Content */}
        <div className="p-4">
          <div className="mb-3">
            <Heading level={4} className="text-neutral-900 line-clamp-1 group-hover:text-primary-600 transition-colors mb-1">
              {service.title}
            </Heading>
            <Text size="small" className="text-neutral-600 line-clamp-2 leading-relaxed">
              {service.description}
            </Text>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Text className="text-lg font-bold text-neutral-900">
                {formatPrice(service.price, service.priceUnit)}
              </Text>
              <Text size="small" className="text-neutral-500">
                {/* priceUnit already included in formatPrice */}
              </Text>
            </div>
            
            <div className="flex items-center space-x-2">
              <Text size="small" className="text-neutral-500">
                View Details
              </Text>
              <Icon name="arrowRight" size="sm" className="text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomerBookingCard = ({ booking, index, compact = false }) => {
  const navigate = useNavigate();
  
  const statusConfig = {
    pending: { variant: 'warning', icon: 'clock', text: 'Pending', color: 'text-warning-700' },
    confirmed: { variant: 'primary', icon: 'check', text: 'Confirmed', color: 'text-primary-700' },
    'in-progress': { variant: 'primary', icon: 'clock', text: 'In Progress', color: 'text-primary-700' },
    completed: { variant: 'success', icon: 'check', text: 'Completed', color: 'text-success-700' },
    cancelled: { variant: 'error', icon: 'close', text: 'Cancelled', color: 'text-error-700' }
  };

  const config = statusConfig[booking.status] || statusConfig.pending;
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-200 group border border-neutral-200 hover:border-primary-200"
        onClick={() => navigate(`/booking/${booking._id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
              <Icon name="calendar" className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <Text className="font-medium text-neutral-900 truncate">
                  {booking.serviceName}
                </Text>
                <Badge variant={config.variant} size="sm">
                  {config.text}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-neutral-600">
                <span>{formatDate(booking.scheduledDate || booking.createdAt)}</span>
                <span>•</span>
                <span className="truncate">{booking.providerName}</span>
              </div>
            </div>
            
            <Icon name="arrowRight" size="sm" className="text-neutral-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group border border-neutral-200 hover:border-primary-200 overflow-hidden"
      onClick={() => navigate(`/booking/${booking._id}`)}
    >
      <CardContent className="p-0">
        {/* Booking Header */}
        <div className="bg-gradient-to-r from-neutral-50 to-primary-50 p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <Icon name="calendar" className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <Text className="font-medium text-neutral-900">
                  {booking.serviceName}
                </Text>
                <Text size="small" className="text-neutral-600">
                  with {booking.providerName}
                </Text>
              </div>
            </div>
            
            <Badge variant={config.variant} className="shadow-sm">
              <Icon name={config.icon} size="xs" className="mr-1" />
              {config.text}
            </Badge>
          </div>
        </div>
        
        {/* Booking Details */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Text size="small" className="text-neutral-500 mb-1">Date</Text>
              <Text className="font-medium text-neutral-900">
                {formatDate(booking.scheduledDate || booking.createdAt)}
              </Text>
            </div>
            <div>
              <Text size="small" className="text-neutral-500 mb-1">Category</Text>
              <Text className="font-medium text-neutral-900">
                {booking.category || 'General'}
              </Text>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              {formatCurrency(booking.totalPrice || booking.price)}
            </Text>
            <div className="flex items-center space-x-2 text-primary-600">
              <Text size="small" className="font-medium">View Details</Text>
              <Icon name="arrowRight" size="sm" className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Legacy components (keeping for backwards compatibility)
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
        <span className="text-sm font-bold text-gray-900">{formatCurrency(service.price)}</span>
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

// Marketing Landing Page Components
const FeatureCard = ({ icon, title, description, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-success-600 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    error: 'text-error-600 bg-error-100'
  };

  return (
    <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 group">
      <CardContent>
        <div className={`w-16 h-16 ${colorMap[color]} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon name={icon} className="w-8 h-8" />
        </div>
        
        <Heading level={3} className="text-neutral-900 mb-4">
          {title}
        </Heading>
        
        <Text className="text-neutral-600 leading-relaxed">
          {description}
        </Text>
      </CardContent>
    </Card>
  );
};

const ServiceShowcaseCard = ({ image, icon, title, description, price, rating, reviews }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    // Add filled stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={`star-${i}`} name="star" size="sm" className="text-yellow-500" />);
    }
    
    // Add empty stars
    for (let i = fullStars; i < 5; i++) {
      stars.push(<Icon key={`star-${i}`} name="starOutline" size="sm" className="text-yellow-300" />);
    }
    
    return stars;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden">
      <CardContent className="p-6">
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon name={icon} className="w-8 h-8 text-primary-600" />
          </div>
          
          <Heading level={4} className="text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
            {title}
          </Heading>
          
          <Text size="small" className="text-neutral-600 mb-4">
            {description}
          </Text>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center">
              {renderStars(parseFloat(rating))}
            </div>
            <Text size="small" className="text-neutral-500">
              {rating} ({reviews} reviews)
            </Text>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <Text className="font-semibold text-primary-600">
              {price}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TestimonialCard = ({ image, name, location, rating, text, service }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    // Add filled stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={`star-${i}`} name="star" size="sm" className="text-yellow-500" />);
    }
    
    // Add empty stars
    for (let i = fullStars; i < 5; i++) {
      stars.push(<Icon key={`star-${i}`} name="starOutline" size="sm" className="text-yellow-300" />);
    }
    
    return stars;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover mr-3 group-hover:scale-110 transition-transform duration-300" />
          <div>
            <Heading level={4} className="text-neutral-900">{name}</Heading>
            <Text size="small" className="text-neutral-600">{location}</Text>
          </div>
        </div>
        <div className="flex items-center mb-3">
          {renderStars(rating)}
        </div>
        <Text className="text-neutral-600 leading-relaxed mb-4 italic">"{text}"</Text>
        <Badge variant="primary" size="sm">
          {service}
        </Badge>
      </CardContent>
    </Card>
  );
};

const BeforeAfterCard = ({ beforeImage, afterImage, title, description, service, duration, provider }) => {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-64 overflow-hidden">
          <div className="grid grid-cols-2 h-full">
            <div className="relative">
              <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2">
                <Badge variant="error" size="sm">Before</Badge>
              </div>
            </div>
            <div className="relative">
              <img src={afterImage} alt="After" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2">
                <Badge variant="success" size="sm">After</Badge>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <Heading level={3} className="text-neutral-900 group-hover:text-primary-600 transition-colors">
              {title}
            </Heading>
            <Badge variant="warning" size="sm">
              {duration}
            </Badge>
          </div>
          
          <Text className="text-neutral-600 mb-4 leading-relaxed">
            {description}
          </Text>
          
          <div className="flex items-center justify-between">
            <div>
              <Text size="small" className="text-neutral-500">Service by</Text>
              <Text size="small" className="font-semibold text-neutral-900">{provider}</Text>
            </div>
            <Badge variant="primary" size="sm">
              {service}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProcessStep = ({ step, title, description, icon }) => {
  return (
    <div className="text-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4 shadow-lg">
          {step}
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-12 bg-white border-4 border-primary-100 rounded-full flex items-center justify-center">
            <Icon name={icon} className="w-5 h-5 text-primary-600" />
          </div>
        </div>
      </div>
      
      <Heading level={3} className="text-neutral-900 mb-4">
        {title}
      </Heading>
      
      <Text className="text-neutral-600 leading-relaxed">
        {description}
      </Text>
    </div>
  );
};

export default Home;
