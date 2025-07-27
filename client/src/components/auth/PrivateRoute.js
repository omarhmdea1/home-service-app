import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * PrivateRoute component for role-based access control
 * @param {Object} props Component properties
 * @param {React.ReactNode} props.children Child components to render if authorized
 * @param {string[]} [props.allowedRoles] Optional array of roles allowed to access the route
 * @param {boolean} [props.requireVerification=true] Whether email verification is required
 * @returns {React.ReactNode} The protected component or a redirect
 */
const PrivateRoute = ({ children, allowedRoles, requireVerification = true }) => {
  const { currentUser, userRole, loading, userProfile } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login page with the intended destination
  if (!currentUser) {
    // If this is a booking route, store the service ID in session storage
    if (location.pathname.startsWith('/book/')) {
      const serviceId = location.pathname.split('/').pop();
      sessionStorage.setItem('pendingBookingServiceId', serviceId);
    }
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // Check email verification if required
  // Skip verification for customers, only require it for providers
  if (requireVerification && !currentUser.emailVerified && userRole === 'provider') {
    // Redirect to a verification page or show verification UI
    return <Navigate to="/verify-email" state={{ from: location.pathname }} />;
  }
  
  // Debug logging
  console.log('PrivateRoute - Current state:', {
    currentUser: currentUser?.email,
    userRole,
    allowedRoles,
    pathname: location.pathname
  });

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('Role mismatch:', { userRole, allowedRoles });
    
    // Special handling for booking routes
    if (location.pathname.startsWith('/book/')) {
      console.log('Booking route detected with role:', userRole);
      
      // Only show alert if user is a provider (not for null roles or other issues)
      if (userRole === 'provider') {
        alert('You need to be logged in as a customer to book services. Please log in with a customer account.');
      } else {
        console.log('Role issue detected:', { userRole, allowedRoles });
      }
      return <Navigate to="/services" />;
    }
    
    // Redirect based on user's actual role
    if (userRole === 'provider') {
      return <Navigate to="/provider/dashboard" />;
    } else {
      return <Navigate to="/services" />;
    }
  }
  
  // For provider routes, check if provider is verified
  if (userRole === 'provider' && allowedRoles && allowedRoles.includes('provider')) {
    // We need to check if the provider is verified in the database
    // This is different from email verification
    if (userProfile && userProfile.isVerified === false) {
      // Provider is not verified yet, redirect to pending verification page
      return <Navigate to="/provider/pending-verification" />;
    }
  }
  
  // User is authenticated and authorized
  return children;
};

export default PrivateRoute;
