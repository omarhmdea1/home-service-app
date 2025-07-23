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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                HomeServices
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex md:items-center md:space-x-1">
              <NavLink 
                to="/" 
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                } 
                label="Dashboard" 
              />
              <NavLink 
                to="/services" 
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                } 
                label="Browse Services" 
              />
              {userRole === 'customer' && (
                <NavLink 
                  to="/my-bookings" 
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  } 
                  label="My Bookings" 
                />
              )}
              {userRole === 'provider' && (
                <NavLink 
                  to="/provider/bookings" 
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  } 
                  label="Manage Bookings" 
                />
              )}
              <NavLink 
                to="/chat" 
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                } 
                label="Messages" 
                badge={<MessageNotificationBadge />} 
              />
            </div>
          )}

          {/* User Menu (Desktop) */}
          <div className="hidden md:block">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <UserRoleBadge />
                      {userRole === 'provider' && !userProfile?.isVerified && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {userRole === 'provider' && userProfile?.isVerified && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 border border-primary-300 group-hover:border-primary-400 transition-all duration-200">
                    {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 z-50 ring-1 ring-black ring-opacity-5 border border-gray-100">
                    {/* User info section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {currentUser.displayName || currentUser.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                      <div className="mt-2 flex items-center">
                        <UserRoleBadge />
                        {userRole === 'provider' && userProfile?.isVerified && (
                          <span className="ml-2 text-xs text-emerald-600 font-medium">Professional Account</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Provider-specific menu items */}
                    {userRole === 'provider' && (
                      <div className="py-2">
                        <div className="px-4 py-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider Tools</p>
                        </div>
                        <DropdownItem
                          to="/provider/dashboard"
                          icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                          }
                          label="Dashboard"
                          description="Analytics & overview"
                          onClick={closeDropdown}
                        />
                        <DropdownItem
                          to="/provider/services"
                          icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          }
                          label="My Services"
                          description="Manage your offerings"
                          onClick={closeDropdown}
                        />
                        <DropdownItem
                          to="/provider/bookings"
                          icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          }
                          label="Bookings"
                          description="Manage appointments"
                          onClick={closeDropdown}
                        />
                        <DropdownItem
                          to="/provider/earnings"
                          icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                          label="Earnings"
                          description="Revenue & payouts"
                          onClick={closeDropdown}
                        />
                      </div>
                    )}
                    
                    {/* Customer-specific menu items */}
                    {userRole === 'customer' && (
                      <div className="py-2">
                        <DropdownItem
                          to="/my-bookings"
                          icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          }
                          label="My Bookings"
                          description="View your appointments"
                          onClick={closeDropdown}
                        />
                      </div>
                    )}
                    
                    {/* Common menu items */}
                    <div className="py-2 border-t border-gray-100">
                      <DropdownItem
                        to={userRole === 'provider' ? '/provider/profile' : '/profile'}
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        }
                        label="Profile Settings"
                        description="Account & preferences"
                        onClick={closeDropdown}
                      />
                      <DropdownItem
                        to="/about"
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                        label="About"
                        description="Learn more about us"
                        onClick={closeDropdown}
                      />
                      <DropdownItem
                        to="/contact"
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        }
                        label="Contact Support"
                        description="Get help when you need it"
                        onClick={closeDropdown}
                      />
                    </div>
                    
                    {/* Logout section */}
                    <div className="py-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          closeDropdown();
                          logout();
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 group"
                      >
                        <svg className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <div>
                          <div className="font-medium">Sign Out</div>
                          <div className="text-xs text-gray-500">End your session</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 bg-gray-50/50">
            {currentUser ? (
              <div className="space-y-1">
                <MobileNavLink 
                  to="/" 
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  } 
                  label="Dashboard" 
                  onClick={closeMobileMenu} 
                />
                <MobileNavLink 
                  to="/services" 
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  } 
                  label="Browse Services" 
                  onClick={closeMobileMenu} 
                />
                {userRole === 'customer' && (
                  <MobileNavLink 
                    to="/my-bookings" 
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    } 
                    label="My Bookings" 
                    onClick={closeMobileMenu} 
                  />
                )}
                {userRole === 'provider' && (
                  <>
                    <MobileNavLink 
                      to="/provider/dashboard" 
                      icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      } 
                      label="Dashboard" 
                      onClick={closeMobileMenu} 
                    />
                    <MobileNavLink 
                      to="/provider/bookings" 
                      icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      } 
                      label="Bookings" 
                      onClick={closeMobileMenu} 
                    />
                    <MobileNavLink 
                      to="/provider/services" 
                      icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      } 
                      label="Services" 
                      onClick={closeMobileMenu} 
                    />
                  </>
                )}
                <MobileNavLink 
                  to="/chat" 
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  } 
                  label="Messages" 
                  onClick={closeMobileMenu} 
                />
                <MobileNavLink 
                  to="/profile" 
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  } 
                  label="Profile" 
                  onClick={closeMobileMenu} 
                />
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/services"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Browse Services
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// Helper Components
const NavLink = ({ to, icon, label, badge }) => (
  <Link
    to={to}
    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 relative group"
  >
    <span className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">{icon}</span>
    <span>{label}</span>
    {badge && <div className="absolute -top-1 -right-1">{badge}</div>}
  </Link>
);

const DropdownItem = ({ to, icon, label, description, onClick }) => (
  <Link
    to={to}
    className="flex items-start px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
    onClick={onClick}
  >
    <span className="mr-3 mt-0.5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200">{icon}</span>
    <div>
      <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">{label}</div>
      {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
    </div>
  </Link>
);

const MobileNavLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 group"
    onClick={onClick}
  >
    <span className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">{icon}</span>
    <span>{label}</span>
  </Link>
);

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
          <Route path="/my-bookings" element={
            <PrivateRoute allowedRoles={['customer', 'provider']}>
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
