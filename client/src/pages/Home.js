import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';

const Home = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {userRole === 'provider' ? <ProviderDashboard /> : <CustomerDashboard />}
      </div>
    </div>
  );
};

// Customer Dashboard
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch services and bookings in parallel
      const [servicesRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5001/api/services'),
        fetch('http://localhost:5001/api/bookings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.slice(0, 4)); // Show only 4 services
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.slice(0, 3)); // Show only recent 3 bookings
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Find Your Perfect Service</h1>
              <p className="text-primary-100 text-lg">Trusted professionals ready to help with your home needs</p>
            </div>
            <div className="hidden md:block">
              <svg className="h-20 w-20 text-white/20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Search</h2>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="What service do you need today?"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/services?search=${encodeURIComponent(e.target.value)}`);
                }
              }}
            />
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Search Services
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          title="Emergency Services"
          subtitle="24/7 urgent help"
          onClick={() => navigate('/services?category=emergency')}
          variant="emergency"
        />
        <ActionCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          title="House Cleaning"
          subtitle="Professional cleaning"
          onClick={() => navigate('/services?category=cleaning')}
          variant="primary"
        />
        <ActionCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 012-2z" />
            </svg>
          }
          title="Repairs & Fixes"
          subtitle="Fix what's broken"
          onClick={() => navigate('/services?category=repair')}
          variant="secondary"
        />
        <ActionCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="My Bookings"
          subtitle="Manage appointments"
          onClick={() => navigate('/my-bookings')}
          variant="default"
        />
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            </div>
            <Link to="/my-bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group">
              View all
              <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-3">
            {bookings.map((booking, index) => (
              <BookingCard key={booking._id} booking={booking} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Services */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg mr-3">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Popular Services</h2>
          </div>
          <Link to="/services" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group">
            Browse all
            <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-40 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <ServiceCard key={service._id} service={service} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services available</h3>
            <p className="text-gray-600">Check back later for new services, or browse our full catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Provider Dashboard
const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    activeServices: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      // In a real app, you'd fetch this from your API
      // For now, we'll use mock data
      setStats({
        totalBookings: 24,
        pendingRequests: 3,
        totalEarnings: 1250,
        activeServices: 5
      });
      setRecentBookings([
        { id: 1, service: 'House Cleaning', customer: 'John D.', date: 'Today, 2:00 PM', status: 'confirmed', amount: 120 },
        { id: 2, service: 'Plumbing Repair', customer: 'Sarah M.', date: 'Tomorrow, 10:00 AM', status: 'pending', amount: 95 },
        { id: 3, service: 'Garden Maintenance', customer: 'Mike R.', date: 'Dec 28, 3:00 PM', status: 'completed', amount: 80 },
      ]);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Provider Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Business Dashboard</h1>
              <p className="text-emerald-100 text-lg">Manage your services and grow your business</p>
            </div>
            <div className="hidden md:block">
              <svg className="h-20 w-20 text-white/20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          urgent={stats.pendingRequests > 0}
          color="amber"
        />
        <StatsCard
          title="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="+8%"
          trendUp={true}
          color="emerald"
        />
        <StatsCard
          title="Active Services"
          value={stats.activeServices}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProviderActionCard
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Manage Bookings"
          subtitle="View and manage your appointments"
          onClick={() => navigate('/provider/bookings')}
          color="blue"
          badge={stats.pendingRequests > 0 ? stats.pendingRequests : null}
        />
        <ProviderActionCard
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="My Services"
          subtitle="Edit your service offerings"
          onClick={() => navigate('/provider/services')}
          color="purple"
        />
        <ProviderActionCard
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Earnings"
          subtitle="Track your revenue and payouts"
          onClick={() => navigate('/provider/earnings')}
          color="emerald"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <Link to="/provider/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group">
            View all
            <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="space-y-4">
          {recentBookings.map((booking, index) => (
            <ProviderBookingCard key={booking.id} booking={booking} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Welcome Screen for non-logged-in users
const WelcomeScreen = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to HomeServices
          </h1>
          <p className="text-gray-600 mb-8">
            Connect with trusted professionals for all your home service needs
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/signup')}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link 
              to="/services" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Browse services without signing up →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
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
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${variants[variant]} relative overflow-hidden group`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
      
      <div className="relative z-10">
        <div className={`mb-3 ${iconColors[variant]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </motion.div>
  );
};

const StatsCard = ({ title, value, icon, trend, urgent, trendUp, color = 'gray' }) => {
  const colorSchemes = {
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    gray: 'from-gray-500 to-gray-600'
  };

  const bgSchemes = {
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100',
    amber: 'bg-gradient-to-r from-amber-50 to-amber-100',
    emerald: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-100',
    gray: 'bg-white'
  };

  const borderSchemes = {
    blue: 'border-blue-200',
    amber: 'border-amber-200',
    emerald: 'border-emerald-200',
    purple: 'border-purple-200',
    gray: 'border-gray-200'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${urgent ? 'bg-gradient-to-r from-amber-50 to-orange-100 border-amber-300' : `${bgSchemes[color]} ${borderSchemes[color]}`} p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group`}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-r ${colorSchemes[color]} opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trend && (
              <div className="flex items-center">
                <svg className={`h-4 w-4 mr-1 ${trendUp ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendUp ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
                <span className={`text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-r ${colorSchemes[color]} rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProviderActionCard = ({ icon, title, subtitle, onClick, color, badge }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-4 rounded-lg cursor-pointer transition-all border ${
      color === 'blue' 
        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
        : color === 'purple' 
        ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' 
        : color === 'emerald' 
        ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <div className="text-2xl mb-2 text-primary-600">{icon}</div>
    <h3 className="font-medium text-gray-900">{title}</h3>
    <p className="text-sm text-gray-600">{subtitle}</p>
    {badge && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
        {badge}
      </span>
    )}
  </motion.div>
);

const ServiceCard = ({ service, index }) => {
  const navigate = useNavigate();
  const gradients = [
    'from-blue-100 to-blue-200',
    'from-emerald-100 to-emerald-200',
    'from-purple-100 to-purple-200',
    'from-amber-100 to-amber-200'
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      onClick={() => navigate(`/service/${service._id}`)}
      className="bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-primary-300 transition-all duration-300 shadow-sm hover:shadow-lg group"
    >
      <div className={`h-40 bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="text-4xl group-hover:scale-110 transition-transform duration-300 relative z-10">
          {getCategoryIcon(service.category)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
          {service.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">${service.price}</span>
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
            {service.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const BookingCard = ({ booking, index }) => {
  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center">
        <div className="p-2 bg-primary-100 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{booking.serviceName || 'Service'}</p>
          <p className="text-sm text-gray-600">{booking.date}</p>
        </div>
      </div>
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[booking.status] || statusColors.pending}`}>
        {booking.status}
      </span>
    </motion.div>
  );
};

const ProviderBookingCard = ({ booking, index }) => {
  const statusColors = {
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center">
        <div className="p-2 bg-emerald-100 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{booking.service}</p>
          <p className="text-sm text-gray-600">Customer: {booking.customer}</p>
          <p className="text-sm text-gray-500">{booking.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900 mb-1">${booking.amount}</p>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[booking.status] || statusColors.pending}`}>
          {booking.status}
        </span>
      </div>
    </motion.div>
  );
};

// Helper function
const getCategoryIcon = (category) => {
  const iconMap = {
    cleaning: '🧹',
    plumbing: '🔧',
    electrical: '⚡',
    gardening: '🌱',
    painting: '🎨',
    moving: '📦',
    repair: '🔨',
    emergency: '🚨',
    default: '🏠'
  };
  return iconMap[category] || iconMap.default;
};

export default Home;
