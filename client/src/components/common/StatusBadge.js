import React from 'react';

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired' }
};

/**
 * Display a colored badge for a booking status.
 */
const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: status || 'Unknown'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>{style.label}</span>
  );
};

export default StatusBadge;
