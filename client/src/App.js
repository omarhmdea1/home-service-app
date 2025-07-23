import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import UserRoleBadge from './components/UserRoleBadge';
import { initializeApp, cleanupApp } from './utils/initApp';
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
import Chat from './pages/Chat';
import RoleSelection from './components/auth/RoleSelection';
import { useAuth } from './components/auth/AuthProvider';
import MessageNotificationBadge from './components/messaging/MessageNotificationBadge';

// Import the new provider profile page
import ProviderPublicProfile from './pages/ProviderProfile';

// Lazy-loaded provider dashboard components
const ProviderDashboard = lazy(() => import('./pages/provider/Dashboard'));
const ProviderBookings = lazy(() => import('./pages/provider/Bookings'));
const ProviderServices = lazy(() => import('./pages/provider/Services'));
const ProviderProfile = lazy(() => import('./pages/provider/Profile'));
const ProviderEarnings = lazy(() => import('./pages/provider/Earnings'));
const PendingVerification = lazy(() => import('./pages/provider/PendingVerification'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex justify-center items-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

const Navigation = () => {
  const { currentUser, logout, userRole, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  
  // Function to close the dropdown
  const closeDropdown = () => {
    setIsProfileDropdownOpen(false);
  };
  
  // Function to close the mobile menu
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

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
            {currentUser && (
              <Link to="/chat" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200 relative">
                Messages
                <MessageNotificationBadge />
              </Link>
            )}
            {currentUser && userRole === 'provider' && (
              <Link 
                to="/provider/dashboard" 
                className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Provider Dashboard
              </Link>
            )}
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:block">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none group"
                >
                  <div className="flex flex-col items-end mr-3">
                    <span className="font-medium">{currentUser.displayName || currentUser.email}</span>
                    <div className="flex items-center">
                      <UserRoleBadge />
                      {userRole === 'provider' && !userProfile?.isVerified && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                          Pending Verification
                        </span>
                      )}
                      {userRole === 'provider' && userProfile?.isVerified && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-800 border border-green-300">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 border-2 border-transparent group-hover:border-primary-300 transition-all duration-200">
                    {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                    {/* User info section */}
                    <div className="px-4 py-3">
                      <p className="text-sm leading-5 text-gray-900 truncate font-medium">
                        {currentUser.displayName || currentUser.email}
                      </p>
                      <p className="text-xs leading-4 text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    
                    {/* Provider-specific menu items */}
                    {userRole === 'provider' && (
                      <div>
                        {/* Dashboard */}
                        <Link
                          to="/provider/dashboard"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          title="View your dashboard with upcoming bookings, earnings, and quick actions"
                          onClick={closeDropdown}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                          Dashboard
                        </Link>
                        
                        {/* Manage Services */}
                        <Link
                          to="/provider/services"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          title="Manage your service listings, add new services, and toggle availability"
                          onClick={closeDropdown}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Manage Services
                        </Link>
                        
                        {/* Booking Requests */}
                        <Link
                          to="/provider/bookings"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          title="View, accept, decline, and manage booking requests"
                          onClick={closeDropdown}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Booking Requests
                        </Link>
                        
                        {/* Earnings */}
                        <Link
                          to="/provider/earnings"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          title="View your earnings, completed bookings, and payout details"
                          onClick={closeDropdown}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Earnings
                        </Link>
                      </div>
                    )}
                    
                    {/* Common menu items */}
                    <div className="py-1">
                      {userRole === 'customer' && (
                        <Link 
                          to="/bookings" 
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors duration-150"
                          onClick={closeDropdown}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          My Bookings
                          {currentUser && <MessageNotificationBadge className="ml-2" />}
                        </Link>
                      )}
                      <Link 
                        to={userRole === 'provider' ? '/provider/profile' : '/profile'} 
                        className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                        title="Update your profile information, contact details, and verification status"
                        onClick={closeDropdown}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                    </div>
                    
                    {/* Logout section */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          closeDropdown();
                          logout();
                        }}
                        className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
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
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={closeMobileMenu}>
            Home
          </Link>
          <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={closeMobileMenu}>
            Services
          </Link>
          <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={closeMobileMenu}>
            About
          </Link>
          <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={closeMobileMenu}>
            Contact
          </Link>
          {currentUser && (
            <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 relative" onClick={closeMobileMenu}>
              Messages
              <span className="inline-block ml-2">
                <MessageNotificationBadge />
              </span>
            </Link>
          )}
          {currentUser && userRole === 'provider' && (
            <Link to="/provider/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={closeMobileMenu}>
              Provider Dashboard
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {currentUser ? (
            <div>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 border-2 border-primary-200">
                    {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{currentUser.displayName || currentUser.email}</div>
                  <div className="flex items-center mt-1">
                    <UserRoleBadge />
                    {userRole === 'provider' && !userProfile?.isVerified && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                        Pending Verification
                      </span>
                    )}
                    {userRole === 'provider' && userProfile?.isVerified && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-800 border border-green-300">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Provider-specific menu items */}
              {userRole === 'provider' && (
                <div className="mt-3 border-t border-b border-gray-200 py-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Provider Menu
                  </div>
                  {/* Dashboard */}
                  <Link 
                    to="/provider/dashboard" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                    title="View your dashboard with upcoming bookings, earnings, and quick actions"
                    onClick={closeMobileMenu}
                  >
                    <svg className="mr-3 h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Dashboard
                  </Link>
                  
                  {/* Manage Services */}
                  <Link 
                    to="/provider/services" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                    title="Manage your service listings, add new services, and toggle availability"
                    onClick={closeMobileMenu}
                  >
                    <svg className="mr-3 h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Manage Services
                  </Link>
                  
                  {/* Booking Requests */}
                  <Link 
                    to="/provider/bookings" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                    title="View, accept, decline, and manage booking requests"
                    onClick={closeMobileMenu}
                  >
                    <svg className="mr-3 h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Booking Requests
                  </Link>
                  
                  {/* Earnings */}
                  <Link 
                    to="/provider/earnings" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                    title="View your earnings, completed bookings, and payout details"
                    onClick={closeMobileMenu}
                  >
                    <svg className="mr-3 h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Earnings
                  </Link>
                </div>
              )}
              
              {/* Common menu items */}
              <div className="mt-3 space-y-1 px-2">
                {userRole === 'customer' && (
                  <Link 
                    to="/bookings" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-green-700 hover:bg-green-50"
                    onClick={closeMobileMenu}
                  >
                    <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Bookings
                    {currentUser && <MessageNotificationBadge className="ml-2" />}
                  </Link>
                )}
                <Link 
                  to={userRole === 'provider' ? '/provider/profile' : '/profile'} 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  title="Update your profile information, contact details, and verification status"
                  onClick={closeMobileMenu}
                >
                  <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50"
                >
                  <svg className="mr-3 h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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
  const { userRole, needsRoleSelection } = useAuth();
  
  // If user needs to select a role, redirect to role selection
  if (needsRoleSelection) {
    return <RoleSelection />;
  }
  
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
          
          {/* Booking route - accessible to all authenticated users */}
          <Route path="/book/:serviceId" element={
            <PrivateRoute>
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
          
          {/* Chat page (available to all authenticated users) */}
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          
          {/* Public provider profile page */}
          <Route path="/providers/:providerId" element={<ProviderPublicProfile />} />
          
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
                  <Route path="bookings/:id" element={<BookingDetail />} />
                  <Route path="services" element={<ProviderServices />} />
                  <Route path="earnings" element={<ProviderEarnings />} />
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


function App() {
  // Initialize app when component mounts
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Initializing app with token management...');
    }
    initializeApp();
    
    // Clean up when component unmounts
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Cleaning up app resources...');
      }
      cleanupApp();
    };
  }, []);
  
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
