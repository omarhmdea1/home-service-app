import React from 'react';
import { useAuth } from './auth/AuthProvider';

/**
 * A simple badge component that displays the user's current role
 */
const UserRoleBadge = () => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser || !userRole) {
    return null;
  }
  
  const isProvider = userRole === 'provider';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isProvider ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
    }`}>
      {isProvider ? 'Provider' : 'Customer'}
    </span>
  );
};

export default UserRoleBadge;
