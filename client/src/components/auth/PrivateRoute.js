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
  const { currentUser, userRole, loading } = useAuth();
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
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // Check email verification if required
  if (requireVerification && !currentUser.emailVerified) {
    // Redirect to a verification page or show verification UI
    return <Navigate to="/verify-email" state={{ from: location.pathname }} />;
  }
  
  // If specific roles are required and user doesn't have the right role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
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
    const { userProfile } = useAuth();
    if (userProfile && userProfile.isVerified === false) {
      // Provider is not verified yet, redirect to pending verification page
      return <Navigate to="/provider/pending-verification" />;
    }
  }
  
  // User is authenticated and authorized
  return children;
};

export default PrivateRoute;
