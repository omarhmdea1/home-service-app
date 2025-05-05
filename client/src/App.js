import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Home from './pages/Home';
import ServiceList from './pages/ServiceList';
import ServiceDetail from './pages/ServiceDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import BookService from './pages/BookService';
import MyBookings from './pages/MyBookings';
import BookingDetail from './pages/BookingDetail';
import Profile from './pages/Profile';
import { useAuth } from './components/auth/AuthProvider';

// Lazy-loaded provider dashboard components
const ProviderDashboard = lazy(() => import('./pages/provider/Dashboard'));
const ProviderBookings = lazy(() => import('./pages/provider/Bookings'));
const ProviderServices = lazy(() => import('./pages/provider/Services'));
const ProviderProfile = lazy(() => import('./pages/provider/Profile'));
const PendingVerification = lazy(() => import('./pages/provider/PendingVerification'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex justify-center items-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">HomeServices</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
              Home
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
              Services
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
              Contact
            </Link>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:block">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <span className="mr-2">{currentUser.email}</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Bookings
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Login
                </Link>
                <Link to="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
            Home
          </Link>
          <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
            Services
          </Link>
          <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
            About
          </Link>
          <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
            Contact
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {currentUser ? (
            <div>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{currentUser.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                  Profile
                </Link>
                <Link to="/bookings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                  My Bookings
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 px-2">
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                Login
              </Link>
              <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-gray-50">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

function AppContent() {
  const { userRole } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={<Home />} />
          
          {/* Service browsing (available to all) */}
          <Route path="/services" element={<ServiceList />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          
          {/* Customer-only routes */}
          <Route path="/book/:serviceId" element={
            <PrivateRoute allowedRoles={['customer']}>
              <BookService />
            </PrivateRoute>
          } />
          <Route path="/bookings" element={
            <PrivateRoute allowedRoles={['customer']}>
              <MyBookings />
            </PrivateRoute>
          } />
          <Route path="/booking/:id" element={
            <PrivateRoute allowedRoles={['customer']}>
              <BookingDetail />
            </PrivateRoute>
          } />
          
          {/* User profile (available to all authenticated users) */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Provider routes */}
          <Route path="/provider/pending-verification" element={
            <PrivateRoute allowedRoles={['provider']} requireVerification={true}>
              <Suspense fallback={<LoadingFallback />}>
                <PendingVerification />
              </Suspense>
            </PrivateRoute>
          } />
          
          <Route path="/provider/*" element={
            <PrivateRoute allowedRoles={['provider']} requireVerification={true}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="dashboard" element={<ProviderDashboard />} />
                  <Route path="bookings" element={<ProviderBookings />} />
                  <Route path="services" element={<ProviderServices />} />
                  <Route path="profile" element={<ProviderProfile />} />
                  <Route path="*" element={<Navigate to="/provider/dashboard" replace />} />
                </Routes>
              </Suspense>
            </PrivateRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Component to handle Google sign-in redirection
const GoogleRedirectHandler = () => {
  React.useEffect(() => {
    // Check if we have a Google login success flag
    const googleLoginSuccess = localStorage.getItem('googleLoginSuccess');
    if (googleLoginSuccess === 'true') {
      console.log('Detected Google login success flag, redirecting to home');
      // Clear the flag
      localStorage.removeItem('googleLoginSuccess');
      // Redirect to home page
      window.location.href = '/';
    }
  }, []);
  
  return null; // This component doesn't render anything
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GoogleRedirectHandler />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
