import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUserProfile, updateUserProfile } from '../services/userService';
import { getUserBookings } from '../services/bookingService';

const Profile = () => {
  const { currentUser, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('personal-info');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [userBookings, setUserBookings] = useState([]);

  // Enhanced stats calculation from real data
  const userStats = useMemo(() => {
    if (!userProfile || !userBookings) return {};
    
    const totalBookings = userBookings.length;
    const completedBookings = userBookings.filter(booking => booking.status === 'completed').length;
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
    const memberDays = Math.floor((new Date() - new Date(userProfile.createdAt)) / (1000 * 60 * 60 * 24));
    
    // Calculate providers rated (bookings with reviews)
    const providersRated = userBookings.filter(booking => booking.review && booking.review.rating).length;
    
    // Calculate average rating given by user
    const ratingsGiven = userBookings
      .filter(booking => booking.review && booking.review.rating)
      .map(booking => booking.review.rating);
    const avgRatingGiven = ratingsGiven.length > 0 
      ? (ratingsGiven.reduce((sum, rating) => sum + rating, 0) / ratingsGiven.length).toFixed(1)
      : 0;
    
    // Calculate total spent (completed bookings with amounts)
    const totalSpent = userBookings
      .filter(booking => booking.status === 'completed' && booking.totalAmount)
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    return {
      totalBookings,
      providersRated,
      completionRate,
      memberDays,
      avgRating: avgRatingGiven,
      totalSpent
    };
  }, [userProfile, userBookings]);

  // Fetch user profile data and bookings
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUserData = async () => {
    setLoading(true);
    
      try {
        // Fetch user profile and bookings in parallel
        const [profileData, bookingsData] = await Promise.all([
          getCurrentUserProfile(),
          getUserBookings(currentUser.uid)
        ]);
        
        // Ensure we have the required structure
        const processedProfile = {
          ...profileData,
          id: profileData.id || currentUser.uid,
          name: profileData.name || currentUser.displayName || 'User',
          email: profileData.email || currentUser.email,
          avatar: profileData.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=6366f1&color=fff`,
          accountType: profileData.accountType || 'Customer',
          location: profileData.location || { city: '', address: '' },
          account: {
            status: profileData.account?.status || 'active',
            createdAt: profileData.createdAt || currentUser.metadata?.creationTime,
            lastLogin: profileData.account?.lastLogin || new Date().toISOString(),
            preferences: {
              notifications: profileData.account?.preferences?.notifications ?? true,
              emailUpdates: profileData.account?.preferences?.emailUpdates ?? true,
              language: profileData.account?.preferences?.language || 'English'
            }
          },
          createdAt: profileData.createdAt || currentUser.metadata?.creationTime
        };
        
        setUserProfile(processedProfile);
        setEditedProfile(processedProfile);
        setUserBookings(Array.isArray(bookingsData) ? bookingsData : []);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSaveError('Failed to load profile data. Please try again.');
        
        // Create minimal profile from Firebase auth data as fallback
        const fallbackProfile = {
        id: currentUser.uid,
          name: currentUser.displayName || 'User',
          email: currentUser.email,
          avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=6366f1&color=fff`,
        accountType: 'Customer',
          location: { city: '', address: '' },
        account: {
          status: 'active',
            createdAt: currentUser.metadata?.creationTime,
          lastLogin: new Date().toISOString(),
          preferences: {
            notifications: true,
            emailUpdates: true,
            language: 'English'
          }
        },
          createdAt: currentUser.metadata?.creationTime
      };
      
        setUserProfile(fallbackProfile);
        setEditedProfile(fallbackProfile);
        setUserBookings([]);
      } finally {
      setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedProfile({
        ...editedProfile,
        [parent]: {
          ...editedProfile[parent],
          [child]: value
        }
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        [name]: value
      });
    }
  };

  // Handle save profile changes
  const handleSaveChanges = async () => {
    setLoading(true);
    setSaveError(null);
    
    try {
      const updatedData = {
        ...editedProfile,
        avatar: avatarPreview || editedProfile.avatar
      };
      
      // Update profile via API
      const updatedProfile = await updateUserProfile(updatedData);
      
      setUserProfile(updatedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditing(false);
  };
  
  // Handle deactivate account
  const handleDeactivateAccount = () => {
    setLoading(true);
    
    setTimeout(() => {
      setShowDeactivateModal(false);
      setLoading(false);
      window.location.href = '/';
    }, 800);
  };
  
  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }
    
    setLoading(true);
    setDeleteError('');
    
    try {
      console.log('Attempting to delete account');
      await deleteAccount();
      
      setLoading(false);
      setShowDeleteModal(false);
      alert('Account deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteAccount:', error);
      setLoading(false);
      
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError('For security reasons, please log out and log back in before deleting your account.');
      } else {
        setDeleteError('Failed to delete account: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // Enhanced Loading State Component
  const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex justify-center items-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full bg-primary-100 opacity-20 animate-pulse"></div>
        </div>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900">Loading Profile</h3>
          <p className="text-gray-600 mt-1">Preparing your personalized experience...</p>
        </motion.div>
      </motion.div>
      </div>
    );

  // Enhanced Stats Card Component
  const StatsCard = ({ icon, title, value, subtitle, color = 'primary', trend }) => (
    <motion.div
      className={`relative bg-gradient-to-br from-white to-${color}-50 p-6 rounded-2xl border border-${color}-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-100 rounded-full -translate-y-6 translate-x-6 opacity-20`}></div>
      <div className={`absolute bottom-0 left-0 w-16 h-16 bg-${color}-200 rounded-full translate-y-4 -translate-x-4 opacity-10`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-${color}-100 rounded-xl group-hover:bg-${color}-200 transition-colors duration-300`}>
            <div className={`h-6 w-6 text-${color}-600`}>
              {icon}
            </div>
          </div>
          {trend && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              {trend}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-gray-600 font-medium text-sm">{title}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  // Enhanced Input Field Component
  const InputField = ({ label, name, type = 'text', value, onChange, disabled, placeholder, helperText, icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 text-gray-500' 
              : 'border-gray-200 bg-white hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
          } focus:outline-none`}
        />
      </div>
      {helperText && (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      )}
    </motion.div>
  );

  // Enhanced Toggle Switch Component
  const ToggleSwitch = ({ id, checked, onChange, label, description }) => (
    <motion.div
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-all duration-300"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-900">{label}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300 ${
            checked ? 'bg-primary-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </label>
      </div>
    </motion.div>
  );

  // Enhanced Action Button Component
  const ActionButton = ({ children, onClick, variant = 'primary', size = 'md', disabled, loading, icon }) => {
    const baseClasses = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2";
    
    const variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl",
      secondary: "bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:ring-primary-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
      warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-lg hover:shadow-xl",
      ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base"
    };
    
    return (
      <motion.button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
        whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
        ) : icon ? (
          <div className="h-4 w-4 mr-2">{icon}</div>
        ) : null}
        {children}
      </motion.button>
    );
  };

  if (loading && !userProfile) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* Enhanced Page Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent mb-2">
            My Profile
            </h1>
            <p className="text-gray-600 text-lg">Manage your account and preferences</p>
          </motion.div>

          {/* Enhanced Success/Error Messages */}
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 text-green-500">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-green-800">Profile Updated!</h3>
                    <p className="text-sm text-green-600 mt-1">Your profile has been updated successfully.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {saveError && (
              <motion.div
                className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 text-red-500">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-red-800">Update Failed</h3>
                    <p className="text-sm text-red-600 mt-1">{saveError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Profile Header Card */}
          <motion.div
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Dynamic Header Background */}
            <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 px-8 py-12 overflow-hidden">
              {/* Enhanced Background Pattern */}
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center">
                {/* Enhanced Avatar */}
                <div className="relative mb-6 lg:mb-0 lg:mr-8">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white">
                    <img 
                      src={avatarPreview || userProfile.avatar} 
                      alt={userProfile.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {isEditing && (
                      <motion.div
                        className="absolute -bottom-2 -right-2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label htmlFor="avatar-upload" className="bg-primary-600 rounded-2xl p-3 shadow-lg cursor-pointer hover:bg-primary-700 transition-colors border-4 border-white">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      </motion.div>
                  )}
                  </motion.div>
                </div>
                
                {/* Enhanced User Information */}
                <div className="text-center lg:text-left flex-1">
                  <motion.h2
                    className="text-3xl font-bold text-white mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {userProfile.name}
                  </motion.h2>
                  
                  <motion.div
                    className="space-y-2 text-primary-100 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-center lg:justify-start">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{userProfile.email}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium">{userProfile.phone || 'No phone added'}</span>
                  </div>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-center justify-center lg:justify-start mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {userProfile.accountType}
                    </span>
                  </motion.div>
                </div>
                
                {/* Enhanced Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {!isEditing ? (
                    <ActionButton
                      onClick={() => setIsEditing(true)}
                      variant="secondary"
                      icon={
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      }
                    >
                      Edit Profile
                    </ActionButton>
                  ) : (
                    <div className="flex gap-3">
                      <ActionButton
                        onClick={handleCancelEdit}
                        variant="ghost"
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        }
                      >
                        Cancel
                      </ActionButton>
                      <ActionButton
                        onClick={handleSaveChanges}
                        loading={loading}
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        }
                      >
                        Save Changes
                      </ActionButton>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* Enhanced Quick Stats Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-2xl font-bold text-primary-600">{userStats.totalBookings}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
                </motion.div>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-2xl font-bold text-green-600">{userStats.completionRate}%</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completion Rate</p>
                </motion.div>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <p className="text-2xl font-bold text-yellow-600">{userStats.avgRating}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Rating</p>
                </motion.div>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <p className="text-2xl font-bold text-purple-600">{userStats.memberDays}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Days Member</p>
                </motion.div>
                  </div>
                  </div>

            {/* Enhanced Navigation Tabs */}
            <div className="bg-white">
              <nav className="flex space-x-0 px-8">
                {[
                  { id: 'personal-info', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                  { id: 'bookings', label: 'Bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { id: 'account', label: 'Account', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
                ].map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`relative py-4 px-6 font-bold text-sm transition-all duration-300 ${
                      activeSection === tab.id
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                    </svg>
                      <span>{tab.label}</span>
                  </div>
                    {activeSection === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        layoutId="activeTab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>
            
            {/* Content Sections */}
          <motion.div
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-8">
              {/* Personal Info Section */}
              {activeSection === 'personal-info' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                    <p className="text-gray-600">Manage your personal details and contact information</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InputField
                        label="Full Name"
                          name="name"
                          value={editedProfile.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        }
                      />
                      
                      <InputField
                        label="Email Address"
                          name="email"
                        type="email"
                          value={editedProfile.email}
                        disabled={true}
                        helperText="Email cannot be changed for security reasons"
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        }
                      />
                      
                      <InputField
                        label="Phone Number"
                          name="phone"
                        type="tel"
                          value={editedProfile.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        placeholder="+1 (555) 123-4567"
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        }
                      />
                      
                      <InputField
                        label="Account Type"
                          name="accountType"
                          value={editedProfile.accountType}
                        disabled={true}
                        helperText="Contact support to change account type"
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          </svg>
                        }
                      />
                      
                      <InputField
                        label="City"
                          name="location.city"
                          value={editedProfile.location?.city || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        placeholder="San Francisco"
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                      />
                      
                      <InputField
                        label="Address"
                          name="location.address"
                          value={editedProfile.location?.address || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        placeholder="123 Main St, Apt 4B"
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        }
                      />
                    </div>
                    
                    {isEditing && (
                      <motion.div
                        className="flex justify-end gap-4 pt-6 border-t border-gray-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <ActionButton
                          onClick={handleCancelEdit}
                          variant="secondary"
                          icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          }
                        >
                          Cancel
                        </ActionButton>
                        <ActionButton
                          onClick={handleSaveChanges}
                          loading={loading}
                          icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          }
                        >
                          Save Changes
                        </ActionButton>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Password & Security Section */}
              {activeSection === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Password & Security</h3>
                    <p className="text-gray-600">Manage your account security and authentication methods</p>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Current Authentication Method */}
                    <motion.div
                      className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-primary-100 rounded-xl">
                            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-bold text-gray-900">Current Sign-In Method</h4>
                          <p className="text-gray-600 mt-2">You are currently using <span className="font-bold text-primary-600">Email and Password</span> to sign in to your account.</p>
                          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Secure
                      </div>
                    </div>
                      </div>
                    </motion.div>
                    
                    {/* Change Password */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Change Password</h4>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <div className="space-y-6">
                          <InputField
                            label="Current Password"
                            name="current-password"
                              type="password"
                              placeholder="Enter your current password"
                            icon={
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            }
                          />
                          
                          <InputField
                            label="New Password"
                            name="new-password"
                              type="password"
                              placeholder="Enter new password"
                            helperText="Password must be at least 8 characters long and include a mix of letters, numbers, and symbols."
                            icon={
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            }
                          />
                          
                          <InputField
                            label="Confirm New Password"
                            name="confirm-password"
                              type="password"
                              placeholder="Confirm new password"
                            icon={
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            }
                            />
                          
                          <div className="pt-2">
                            <ActionButton
                              icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              }
                            >
                              Update Password
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Two-Factor Authentication */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Two-Factor Authentication</h4>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start">
                            <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            <div>
                              <h5 className="text-base font-bold text-gray-900">Enhanced Security</h5>
                              <p className="text-gray-600 mt-2">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                              <p className="text-gray-500 text-sm mt-1">When enabled, you'll be required to enter a verification code along with your password when signing in.</p>
                                </div>
                              </div>
                          <div className="ml-6">
                            <ActionButton
                              variant="ghost"
                              disabled={true}
                              icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              }
                            >
                              Coming Soon
                            </ActionButton>
                              </div>
                    </div>
                  </div>
                </motion.div>
              
                    {/* Recent Activity */}
                <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                >
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Account Activity</h4>
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-200">
                          {[
                            { action: 'Login', time: 'Just now', location: 'San Francisco, CA', device: 'Chrome on Mac', status: 'current' },
                            { action: 'Login', time: '2 days ago', location: 'San Francisco, CA', device: 'Chrome on Mac', status: 'success' },
                            { action: 'Password Changed', time: '1 week ago', location: 'San Francisco, CA', device: 'Chrome on Mac', status: 'security' }
                          ].map((activity, index) => (
                            <motion.div
                              key={index}
                              className="p-6 hover:bg-gray-50 transition-colors duration-200"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <div className="flex items-center">
                              <div className="flex-shrink-0">
                                  <div className={`p-3 rounded-xl ${
                                    activity.status === 'current' ? 'bg-green-100' :
                                    activity.status === 'security' ? 'bg-blue-100' : 'bg-gray-100'
                                  }`}>
                                    <svg className={`h-5 w-5 ${
                                      activity.status === 'current' ? 'text-green-600' :
                                      activity.status === 'security' ? 'text-blue-600' : 'text-gray-600'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {activity.status === 'security' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                      )}
                                </svg>
                              </div>
                                </div>
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-bold text-gray-900">{activity.action}</h5>
                                    <div className="flex items-center">
                                      {activity.status === 'current' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 mr-3">
                                          Current Session
                                        </span>
                                      )}
                                      <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                              </div>
                            </div>
                                  <p className="text-sm text-gray-600 mt-1">From {activity.location} using {activity.device}</p>
                          </div>
                              </div>
                            </motion.div>
                          ))}
                                </div>
                              </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
              
              {/* Booking Summary Section */}
              {activeSection === 'bookings' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Summary</h3>
                    <p className="text-gray-600">Overview of your service bookings and activity</p>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Enhanced Stats Cards */}
                    {userBookings.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <StatsCard
                          icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          }
                          title="Total Bookings"
                          value={userStats.totalBookings || 0}
                          subtitle="All time"
                          color="primary"
                        />
                        
                        <StatsCard
                          icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          }
                          title="Providers Rated"
                          value={userStats.providersRated || 0}
                          subtitle="Reviews given"
                          color="yellow"
                        />
                        
                        <StatsCard
                          icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                          title="Completion Rate"
                          value={`${userStats.completionRate || 0}%`}
                          subtitle="All time"
                          color="green"
                        />
                          </div>
                    ) : (
                      <motion.div
                        className="text-center py-12 bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl border border-gray-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="max-w-md mx-auto">
                          <div className="mb-6">
                            <div className="mx-auto h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                              <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                          </div>
                        </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
                          <p className="text-gray-600 mb-6">Start your journey by booking your first service with us!</p>
                          <ActionButton
                            onClick={() => window.location.href = '/services'}
                            icon={
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            }
                          >
                            Browse Services
                          </ActionButton>
                      </div>
                      </motion.div>
                    )}
                    
                    {/* Last Service Booked */}
                    {userBookings.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Last Service Booked</h4>
                        <div className="bg-gradient-to-r from-white to-primary-50 rounded-2xl border border-primary-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="p-6">
                          <div className="flex items-start">
                              <div className="flex-shrink-0 h-16 w-16 rounded-2xl overflow-hidden shadow-md">
                              <img 
                                  src={userBookings[0]?.service?.image || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"} 
                                alt="Service" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                              <div className="ml-6 flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-lg font-bold text-gray-900">{userBookings[0]?.service?.title || userBookings[0]?.serviceName || 'Service'}</h5>
                                    <p className="text-gray-600 mt-1">
                                      Scheduled for {new Date(userBookings[0]?.scheduledDate || userBookings[0]?.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })} 
                                      {userBookings[0]?.scheduledTime && ` at ${userBookings[0].scheduledTime}`}
                                    </p>
                              <div className="mt-3">
                                      <ActionButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => window.location.href = `/booking/${userBookings[0]?._id}`}
                                        icon={
                                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        }
                                >
                                        View Details
                                      </ActionButton>
                              </div>
                            </div>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold capitalize ${
                                    userBookings[0]?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    userBookings[0]?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    userBookings[0]?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    userBookings[0]?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {userBookings[0]?.status === 'confirmed' ? '✓ ' : ''}
                                    {userBookings[0]?.status || 'Unknown'}
                                  </span>
                          </div>
                        </div>
                      </div>
                    </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Enhanced Booking History */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-gray-900">Recent Booking History</h4>
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = '/my-bookings'}
                          icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          }
                        >
                          View All
                        </ActionButton>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-primary-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Service
                              </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Date
                              </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Status
                              </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                  Action
                                </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {userBookings.length > 0 ? (
                                userBookings.slice(0, 5).map((booking, index) => {
                                  const getStatusColor = (status) => {
                                    switch (status) {
                                      case 'confirmed': return 'green';
                                      case 'pending': return 'yellow';
                                      case 'completed': return 'blue';
                                      case 'cancelled': return 'red';
                                      default: return 'gray';
                                    }
                                  };
                                  
                                  return (
                                    <motion.tr
                                      key={booking._id || index}
                                      className="hover:bg-gray-50 transition-colors duration-200"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.1 * index }}
                                    >
                              <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">
                                          {booking.service?.title || booking.serviceName || 'Service'}
                                        </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600 font-medium">
                                          {new Date(booking.scheduledDate || booking.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                          })}
                                        </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800 capitalize`}>
                                          {booking.status}
                                </span>
                              </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <ActionButton
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.location.href = `/booking/${booking._id}`}
                                          icon={
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          }
                                        >
                                          View
                                        </ActionButton>
                              </td>
                                    </motion.tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan="4" className="px-6 py-8 text-center">
                                    <div className="text-gray-500">
                                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                      <p className="text-sm font-medium text-gray-900">No bookings yet</p>
                                      <p className="text-sm text-gray-500 mt-1">Start by booking your first service!</p>
                                    </div>
                              </td>
                            </tr>
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    </motion.div>
                    
                    {/* Export Options */}
                    <motion.div
                      className="flex justify-end"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <ActionButton
                        variant="secondary"
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        }
                      >
                        Export Booking History
                      </ActionButton>
                    </motion.div>
                  </div>
                </motion.div>
              )}
              
              {/* Account Section */}
              {activeSection === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Management</h3>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>
                  
                  <div className="space-y-8">
                    {/* Account Information */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Account Information</h4>
                      <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl border border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {[
                            { label: 'Account Status', value: userProfile.account.status === 'active' ? 'Active' : 'Inactive', subtitle: 'Your account is in good standing', color: 'green' },
                            { label: 'Member Since', value: new Date(userProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), subtitle: `${userStats.memberDays} days`, color: 'blue' },
                            { label: 'Account Type', value: userProfile.accountType, subtitle: 'Premium customer benefits', color: 'purple' },
                            { label: 'Last Login', value: new Date(userProfile.account.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), subtitle: 'Recent activity', color: 'gray' }
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex items-start space-x-4"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <div className={`p-3 bg-${item.color}-100 rounded-xl`}>
                                <div className={`h-5 w-5 text-${item.color}-600`}>
                                  {item.label === 'Account Status' && (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                  {item.label === 'Member Since' && (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h1a1 1 0 011 1v8a1 1 0 01-1 1H7a1 1 0 01-1-1V8a1 1 0 011-1h1z" />
                                    </svg>
                                  )}
                                  {item.label === 'Account Type' && (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  )}
                                  {item.label === 'Last Login' && (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
          </div>
        </div>
                              <div>
                                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                                <p className="text-base font-bold text-gray-900 mt-1">{item.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
      </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Account Preferences */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Account Preferences</h4>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <div className="space-y-4">
                          <ToggleSwitch
                            id="emailUpdates"
                            checked={userProfile.account.preferences.emailUpdates}
                            label="Email Notifications"
                            description="Receive email updates about your bookings and account activity"
                          />
                          
                          <ToggleSwitch
                            id="notifications"
                            checked={userProfile.account.preferences.notifications}
                            label="Push Notifications"
                            description="Receive push notifications for important updates and reminders"
                          />
                          
                          <div className="pt-2">
                            <InputField
                              label="Language Preference"
                              name="language"
                              value={userProfile.account.preferences.language}
                              icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Danger Zone */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Danger Zone</h4>
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200">
                        <div className="space-y-6">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
                            <div className="flex-1">
                              <h5 className="text-base font-bold text-gray-900">Temporarily Deactivate Account</h5>
                              <p className="text-gray-600 mt-2">Your account will be disabled and you won't be able to use our services until you log in again. Your data will be preserved.</p>
                              <div className="mt-4">
                                <ActionButton
                                  onClick={() => setShowDeactivateModal(true)}
                                  variant="warning"
                                  icon={
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                    </svg>
                                  }
                                >
                                  Deactivate Account
                                </ActionButton>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-6 border-t border-red-200">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-red-100 rounded-xl">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-base font-bold text-gray-900">Permanently Delete Account</h5>
                                <p className="text-gray-600 mt-2">Once you delete your account, there is no going back. All of your data will be permanently removed.</p>
                                <div className="mt-4">
                                  <ActionButton
                                    onClick={() => setShowDeleteModal(true)}
                                    variant="danger"
                                    icon={
                                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    }
                                  >
                                    Delete Account
                                  </ActionButton>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced Deactivate Account Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="text-center">
                <motion.div
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", damping: 15 }}
                >
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Deactivate Account</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Are you sure you want to deactivate your account? You can reactivate it by logging in again. Your data will be preserved.
              </p>
                </motion.div>
                
                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <ActionButton
                  onClick={() => setShowDeactivateModal(false)}
                    variant="secondary"
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    }
                >
                  Cancel
                  </ActionButton>
                  <ActionButton
                  onClick={handleDeactivateAccount}
                    variant="warning"
                    loading={loading}
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    }
                >
                    Deactivate Account
                  </ActionButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
      
      {/* Enhanced Delete Account Modal */}
      <AnimatePresence>
      {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            >
            <div className="text-center">
                <motion.div
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", damping: 15 }}
                >
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Account</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
                </motion.div>
                
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4">
                    <p className="text-sm text-gray-700 mb-3 font-medium">Please type <span className="font-bold text-red-600">DELETE</span> to confirm</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 transition-all duration-300 text-center font-bold"
                  placeholder="Type DELETE to confirm"
                />
                  </div>
                
                {deleteError && (
                    <motion.div
                      className="bg-red-50 p-4 rounded-xl border border-red-200"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm text-red-700 font-medium">{deleteError}</p>
              </div>
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <ActionButton
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                      setDeleteError('');
                    }}
                    variant="secondary"
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    }
                >
                  Cancel
                  </ActionButton>
                  <ActionButton
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                    loading={loading}
                    variant="danger"
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    }
                >
                  Delete Account
                  </ActionButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};



export default Profile;
