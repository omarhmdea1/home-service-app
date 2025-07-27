import React from 'react';
import { Badge } from '../ui';

const STATUS_CONFIG = {
  pending: { variant: 'warning', label: 'Pending', icon: '⏳' },
  confirmed: { variant: 'primary', label: 'Confirmed', icon: '✓' },
  completed: { variant: 'success', label: 'Completed', icon: '✅' },
  cancelled: { variant: 'error', label: 'Cancelled', icon: '❌' },
  expired: { variant: 'neutral', label: 'Expired', icon: '⏰' }
};

/**
 * Display a colored badge for a booking status using the design system.
 * 
 * @param {string} status - The booking status
 * @param {boolean} showIcon - Whether to show status icon
 * @param {string} size - Badge size: 'sm' | 'md' | 'lg'
 * @param {string} className - Additional CSS classes
 */
const StatusBadge = ({ 
  status, 
  showIcon = true, 
  size = 'md', 
  className = '' 
}) => {
  const config = STATUS_CONFIG[status] || {
    variant: 'neutral',
    label: status || 'Unknown',
    icon: '❓'
  };

  return (
    <Badge 
      variant={config.variant} 
      size={size}
      className={className}
    >
      {showIcon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
