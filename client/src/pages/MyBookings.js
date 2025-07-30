import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import { getUserBookings, getProviderBookings, updateBookingStatus, deleteBooking } from '../services/bookingService';
import { getServiceById } from '../services/serviceService';
import { formatPrice, formatCurrency } from '../utils/formatters';

// Enhanced Stats Card Component
const StatsCard = ({ title, value, subtitle, icon, color = "primary", trend = null }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br ${
      color === 'primary' ? 'from-primary-50 to-primary-100 border-primary-200' :
      color === 'green' ? 'from-emerald-50 to-green-100 border-emerald-200' :
      color === 'amber' ? 'from-amber-50 to-yellow-100 border-amber-200' :
      color === 'red' ? 'from-red-50 to-pink-100 border-red-200' :
      'from-gray-50 to-slate-100 border-gray-200'
    } p-6 rounded-xl border-2 hover:shadow-lg transition-all duration-300 group`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          color === 'primary' ? 'text-primary-600' :
          color === 'green' ? 'text-emerald-600' :
          color === 'amber' ? 'text-amber-600' :
          color === 'red' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform duration-300">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.type === 'up' ? 'bg-green-100 text-green-800' :
              trend.type === 'down' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {trend.type === 'up' ? '↗' : trend.type === 'down' ? '↘' : '→'} {trend.value}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${
        color === 'primary' ? 'bg-primary-100 text-primary-600' :
        color === 'green' ? 'bg-emerald-100 text-emerald-600' :
        color === 'amber' ? 'bg-amber-100 text-amber-600' :
        color === 'red' ? 'bg-red-100 text-red-600' :
        'bg-gray-100 text-gray-600'
      } group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// Enhanced Search and Filter Component
const SearchAndFilter = ({ searchTerm, onSearchChange, selectedCategory, onCategoryChange, selectedStatus, onStatusChange, userRole }) => {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'cleaning', label: '🧹 Cleaning' },
    { value: 'plumbing', label: '🔧 Plumbing' },
    { value: 'electrical', label: '⚡ Electrical' },
    { value: 'gardening', label: '🌱 Gardening' },
    { value: 'painting', label: '🎨 Painting' },
    { value: 'moving', label: '📦 Moving' },
    { value: 'repair', label: '🔨 Repair' },
    { value: 'emergency', label: '🚨 Emergency' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'confirmed', label: '✅ Confirmed' },
    { value: 'completed', label: '🎉 Completed' },
    { value: 'cancelled', label: '❌ Cancelled' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search bookings by service name, location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="lg:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || selectedCategory || selectedStatus) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              onSearchChange('');
              onCategoryChange('');
              onStatusChange('');
            }}
            className="px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
          >
            Clear Filters
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Booking Card Component
const EnhancedBookingCard = ({ booking, userRole, onCancelBooking, onUpdateStatus, onViewDetails, index }) => {
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
      service: '🏠'
    };
    return icons[category] || icons.service;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const isUpcoming = ['pending', 'confirmed'].includes(booking.status);
  const isPast = ['completed', 'expired'].includes(booking.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full opacity-50 transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Service Icon */}
            <div className="p-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl group-hover:scale-110 transition-transform duration-300 relative">
              <span className="text-2xl">{getCategoryIcon(booking.serviceCategory)}</span>
              {isUpcoming && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Service Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {booking.serviceTitle}
              </h3>
              
              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center text-gray-600">
                  <svg className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {booking.time && (
                  <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{booking.time}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <svg className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-lg">{formatCurrency(booking.servicePrice || booking.price || 0)}</span>
                </div>
                
                {booking.location && (
                  <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{booking.location}</span>
                  </div>
                )}
              </div>
              
              {/* Customer Info for Providers */}
              {userRole === 'provider' && (booking.userName || booking.userEmail) && (
                <div className="flex items-center text-gray-600 mb-3">
                  <svg className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">
                    {booking.userName || booking.userEmail?.split('@')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-3">
            <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(booking.status)} shadow-sm`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
          
          {/* Customer Actions */}
          {userRole === 'customer' && booking.status === 'pending' && (
            <button
              onClick={() => onCancelBooking(booking)}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          )}
          
          {/* Book Again for completed services */}
          {userRole === 'customer' && booking.status === 'completed' && (
            <Link
              to={`/services/${booking.serviceId}`}
              className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Book Again
            </Link>
          )}
          
          {/* Provider Actions */}
          {userRole === 'provider' && booking.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(booking.id || booking._id, 'confirmed')}
                className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </button>
              <button
                onClick={() => onUpdateStatus(booking.id || booking._id, 'cancelled')}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </>
          )}
          
          {userRole === 'provider' && booking.status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(booking.id || booking._id, 'completed')}
              className="flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Loading State Component
const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-12 text-center"
  >
    <div className="inline-block rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600 animate-spin mb-6"></div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your bookings...</h3>
    <p className="text-gray-500">Please wait while we fetch your data</p>
  </motion.div>
);

// Enhanced Empty State Component
const EmptyState = ({ activeTab, userRole, searchTerm, hasFilters }) => {
  if (searchTerm || hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 text-center"
      >
        <div className="p-4 bg-primary-100 rounded-full mb-4 inline-block">
          <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matching bookings found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find what you're looking for.</p>
      </motion.div>
    );
  }

  const emptyStates = {
    upcoming: {
      icon: (
        <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'primary',
      title: 'No upcoming bookings',
      subtitle: userRole === 'customer' 
        ? "You don't have any upcoming bookings scheduled." 
        : "No upcoming bookings from customers yet.",
              action: userRole === 'customer' && (
          <Link
            to="/services"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Services
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )
    },
    past: {
      icon: (
        <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
      title: 'No past bookings',
      subtitle: userRole === 'customer' 
        ? "You don't have any completed bookings yet." 
        : "No completed services yet.",
      action: null
    },
    cancelled: {
      icon: (
        <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: 'red',
      title: 'No cancelled bookings',
      subtitle: "You don't have any cancelled bookings.",
      action: null
    }
  };

  const state = emptyStates[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-12 text-center"
    >
      <div className={`p-4 bg-${state.color}-100 rounded-full mb-6 inline-block`}>
        {state.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{state.title}</h3>
      <p className="text-gray-600 mb-6">{state.subtitle}</p>
      {state.action}
    </motion.div>
  );
};

// Enhanced Cancel Modal Component
const CancelModal = ({ booking, onConfirm, onCancel }) => (
  <AnimatePresence>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 rounded-xl mr-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-800 font-medium">
              Are you sure you want to cancel your booking for:
            </p>
            <p className="text-gray-900 font-bold mt-1">
              {booking?.serviceTitle}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Scheduled for {new Date(booking?.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Keep Booking
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

const MyBookings = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Calculate booking statistics
  const bookingStats = useMemo(() => {
    const stats = {
      total: bookings.length,
      upcoming: bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      totalRevenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (parseFloat(b.servicePrice || b.price || 0)), 0)
    };

    // Calculate trends (placeholder for now)
    stats.trends = {
      bookings: { type: 'up', value: '+12%' },
      revenue: { type: 'up', value: '+8%' }
    };

    return stats;
  }, [bookings]);
  
  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by active tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(b => ['pending', 'confirmed'].includes(b.status));
    } else if (activeTab === 'past') {
      filtered = filtered.filter(b => ['completed', 'expired'].includes(b.status));
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(b => b.status === 'cancelled');
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.serviceTitle?.toLowerCase().includes(term) ||
        booking.location?.toLowerCase().includes(term) ||
        booking.userName?.toLowerCase().includes(term) ||
        booking.userEmail?.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(booking => booking.serviceCategory === selectedCategory);
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(booking => booking.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bookings, activeTab, searchTerm, selectedCategory, selectedStatus]);

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCategory || selectedStatus;

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, [currentUser, userRole]);
  
  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch bookings based on user role
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      let response;
      if (userRole === 'provider') {
        response = await getProviderBookings(currentUser.uid);
      } else {
        response = await getUserBookings(currentUser.uid);
      }
      
      if (response && Array.isArray(response)) {
        const sortedBookings = response.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const bookingsWithDetails = await Promise.all(
          sortedBookings.map(async (booking) => {
            try {
              const serviceData = await getServiceById(booking.serviceId);
              return { 
                ...booking, 
                serviceTitle: serviceData?.title || 'Unknown Service',
                serviceCategory: serviceData?.category || 'service',
                serviceDescription: serviceData?.description || '',
                servicePrice: serviceData?.price || booking.price || 0
              };
            } catch (err) {
              console.error('Error fetching service details:', err);
              return { 
                ...booking, 
                serviceTitle: 'Unknown Service',
                serviceCategory: 'service',
                serviceDescription: '',
                servicePrice: booking.price || 0
              };
            }
          })
        );
        
        setBookings(bookingsWithDetails);
      } else {
        setBookings([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again later.');
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setLoading(true);
      await deleteBooking(selectedBooking.id || selectedBooking._id);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          (booking.id || booking._id) === (selectedBooking.id || selectedBooking._id)
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      setSuccess('Booking cancelled successfully.');
      setLoading(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
      setLoading(false);
    }
  };

  // Handle booking status update (for providers)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          (booking.id || booking._id) === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      
      setSuccess(`Booking ${newStatus} successfully.`);
      setLoading(false);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          <div className="p-4 bg-primary-100 rounded-full mb-4 inline-block">
            <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your bookings.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Enhanced Header Section with Beautiful Background */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-white/5 rounded-full translate-x-40 translate-y-40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-between flex-col lg:flex-row">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  {userRole === 'provider' ? 'Your Bookings' : 'My Bookings'}
                </h1>
                <p className="text-primary-100 text-lg lg:text-xl max-w-2xl">
                  {userRole === 'provider' 
                    ? 'Manage and track all your service bookings from customers' 
                    : 'Track your service appointments, history, and upcoming bookings'}
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <svg className="h-24 w-24 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM3 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/>
                    <path d="M6 8a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 12a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-emerald-800 font-medium">{success}</p>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-emerald-400 hover:text-emerald-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Bookings"
            value={bookingStats.total}
            subtitle="All time"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="primary"
            trend={bookingStats.trends.bookings}
          />
          
          <StatsCard
            title="Upcoming"
            value={bookingStats.upcoming}
            subtitle="Scheduled services"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="amber"
          />
          
          <StatsCard
            title="Completed"
            value={bookingStats.completed}
            subtitle="Successful services"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          
          {userRole === 'provider' ? (
            <StatsCard
              title="Revenue"
              value={formatCurrency(bookingStats.totalRevenue)}
              subtitle="Total earned"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
              trend={bookingStats.trends.revenue}
            />
          ) : (
            <StatsCard
              title="Pending"
              value={bookingStats.pending}
              subtitle="Awaiting approval"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="amber"
            />
          )}
        </div>

        {/* Search and Filter Component */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          userRole={userRole}
        />

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'upcoming', label: 'Upcoming', count: bookingStats.upcoming, color: 'primary', icon: '⏳' },
              { key: 'past', label: 'Past', count: bookingStats.completed, color: 'emerald', icon: '✅' },
              { key: 'cancelled', label: 'Cancelled', count: bookingStats.cancelled, color: 'red', icon: '❌' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center space-x-3 border-2 ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-100 text-${tab.color}-700 border-${tab.color}-200 shadow-md scale-105`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-200'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.key
                      ? `bg-${tab.color}-200 text-${tab.color}-800`
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <LoadingState />
          ) : filteredBookings.length === 0 ? (
            <EmptyState activeTab={activeTab} userRole={userRole} searchTerm={searchTerm} hasFilters={hasActiveFilters} />
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                </h3>
                {hasActiveFilters && (
                  <span className="text-sm text-gray-500">
                    Filtered results
                  </span>
                )}
              </div>
              <div className="grid gap-6">
                {filteredBookings.map((booking, index) => (
                  <EnhancedBookingCard
                    key={booking.id || booking._id}
                    booking={booking}
                    userRole={userRole}
                    onCancelBooking={(booking) => {
                      setSelectedBooking(booking);
                      setShowCancelModal(true);
                    }}
                    onUpdateStatus={handleUpdateStatus}
                    onViewDetails={(booking) => {
                      navigate(`/booking/${booking._id || booking.id}`);
                    }}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <CancelModal
          booking={selectedBooking}
          onConfirm={handleCancelBooking}
          onCancel={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;
