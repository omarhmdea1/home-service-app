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
    <div className="space-y-6">
      {/* Quick Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Services</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search for services..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/services?search=${encodeURIComponent(e.target.value)}`);
              }
            }}
          />
          <button
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Browse All
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ActionCard
          icon="🔧"
          title="Emergency Services"
          subtitle="Get help now"
          onClick={() => navigate('/services?category=emergency')}
        />
        <ActionCard
          icon="🧹"
          title="House Cleaning"
          subtitle="Book cleaning"
          onClick={() => navigate('/services?category=cleaning')}
        />
        <ActionCard
          icon="🔨"
          title="Repairs"
          subtitle="Fix something"
          onClick={() => navigate('/services?category=repair')}
        />
        <ActionCard
          icon="📅"
          title="My Bookings"
          subtitle="View appointments"
          onClick={() => navigate('/my-bookings')}
        />
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Available Services */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Popular Services</h2>
          <Link to="/services" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">🔍</div>
            <p className="text-gray-600">No services available at the moment</p>
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
        { id: 1, service: 'House Cleaning', customer: 'John D.', date: 'Today, 2:00 PM', status: 'confirmed' },
        { id: 2, service: 'Plumbing Repair', customer: 'Sarah M.', date: 'Tomorrow, 10:00 AM', status: 'pending' },
      ]);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon="📊"
          trend="+12%"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon="⏳"
          urgent={stats.pendingRequests > 0}
        />
        <StatsCard
          title="Total Earnings"
          value={`$${stats.totalEarnings}`}
          icon="💰"
          trend="+8%"
        />
        <StatsCard
          title="Active Services"
          value={stats.activeServices}
          icon="⚙️"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          icon="📅"
          title="View Bookings"
          subtitle="Check your schedule"
          onClick={() => navigate('/provider/bookings')}
          variant="primary"
        />
        <ActionCard
          icon="⚙️"
          title="Manage Services"
          subtitle="Edit your offerings"
          onClick={() => navigate('/provider/services')}
        />
        <ActionCard
          icon="💰"
          title="View Earnings"
          subtitle="Check your income"
          onClick={() => navigate('/provider/earnings')}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/provider/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{booking.service}</p>
                <p className="text-sm text-gray-600">Customer: {booking.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">{booking.date}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
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
const ActionCard = ({ icon, title, subtitle, onClick, variant = 'default' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-4 rounded-lg cursor-pointer transition-all border ${
      variant === 'primary' 
        ? 'bg-primary-50 border-primary-200 hover:bg-primary-100' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <div className="text-2xl mb-2">{icon}</div>
    <h3 className="font-medium text-gray-900">{title}</h3>
    <p className="text-sm text-gray-600">{subtitle}</p>
  </motion.div>
);

const StatsCard = ({ title, value, icon, trend, urgent }) => (
  <div className={`bg-white p-4 rounded-lg border ${urgent ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && <p className="text-sm text-green-600">{trend}</p>}
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/service/${service._id}`)}
      className="bg-gray-50 rounded-lg p-4 cursor-pointer border border-gray-200 hover:border-primary-300 transition-colors"
    >
      <div className="text-2xl mb-2">{getCategoryIcon(service.category)}</div>
      <h3 className="font-medium text-gray-900 mb-1">{service.title}</h3>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
      <p className="text-primary-600 font-semibold">${service.price}</p>
    </motion.div>
  );
};

const BookingCard = ({ booking }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div>
      <p className="font-medium text-gray-900">{booking.serviceName || 'Service'}</p>
      <p className="text-sm text-gray-600">{booking.date}</p>
    </div>
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
      booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {booking.status}
    </span>
  </div>
);

// Helper function
const getCategoryIcon = (category) => {
  const icons = {
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
  return icons[category] || icons.default;
};

export default Home;
