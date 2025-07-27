import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Icon, Text, Heading } from './index';

/**
 * Role Restriction Alert Component
 * Shows user-friendly messages when users try to access functionality not available for their role
 */
const RoleRestrictionAlert = ({ 
  userRole, 
  restrictedAction = 'book services',
  allowedRole = 'customer',
  title = 'Access Restricted',
  showActions = true,
  className = '',
  onClose 
}) => {
  const navigate = useNavigate();

  // Define role-specific messages
  const getRestrictionMessage = () => {
    if (userRole === 'provider' && restrictedAction === 'book services') {
      return {
        title: 'Providers Cannot Book Services',
        message: 'As a service provider, you can manage your business but cannot book services. Only customers can create bookings.',
        suggestion: 'If you need to book a service for personal use, consider creating a separate customer account.',
        actions: [
          {
            label: 'Manage My Services',
            variant: 'primary',
            onClick: () => navigate('/provider/services'),
            icon: 'services'
          },
          {
            label: 'View My Bookings',
            variant: 'outline', 
            onClick: () => navigate('/provider/bookings'),
            icon: 'calendar'
          }
        ]
      };
    }

    if (!userRole && restrictedAction === 'book services') {
      return {
        title: 'Please Log In to Book Services',
        message: 'You need to be logged in as a customer to book services.',
        suggestion: 'Create an account or log in to access booking functionality.',
        actions: [
          {
            label: 'Sign Up',
            variant: 'primary',
            onClick: () => navigate('/signup'),
            icon: 'user'
          },
          {
            label: 'Log In',
            variant: 'outline',
            onClick: () => navigate('/login'),
            icon: 'user'
          }
        ]
      };
    }

    // Generic restriction message
    return {
      title: title,
      message: `Your current role (${userRole || 'guest'}) does not have permission to ${restrictedAction}.`,
      suggestion: `Only ${allowedRole}s can ${restrictedAction}.`,
      actions: []
    };
  };

  const restriction = getRestrictionMessage();

  return (
    <Alert variant="warning" className={`max-w-2xl mx-auto ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon name="info" size="sm" className="text-warning-600 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <Heading level={4} className="text-warning-900 mb-2">
            {restriction.title}
          </Heading>
          
          <Text className="text-warning-800 mb-2">
            {restriction.message}
          </Text>
          
          {restriction.suggestion && (
            <Text size="small" className="text-warning-700 mb-4">
              {restriction.suggestion}
            </Text>
          )}
          
          {showActions && restriction.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {restriction.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.onClick}
                  className="flex items-center gap-2"
                >
                  <Icon name={action.icon} size="xs" />
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <Icon name="close" size="xs" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default RoleRestrictionAlert; 