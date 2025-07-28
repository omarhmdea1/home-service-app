import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUserProfile, updateUserProfile } from '../../services/userService';
import { getProviderBookings } from '../../services/bookingService';

// ✅ NEW: Import our design system components
import {
  PageLayout,
  PageHeader,
  ContentSection,
} from '../../components/layout';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Icon,
  Heading,
  Text,
  Alert,
  LoadingState,
  Form,
  FormField,
  FormInput,
  FormTextarea,
  FormActions,
} from '../../components/ui';

const ProviderProfile = () => {
  const { currentUser, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [providerBookings, setProviderBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceArea: '',
    providerDescription: '',
    businessHours: '',
    website: '',
    profileImage: '',
    specialties: [],
    businessLicense: '',
    insurance: '',
    experienceYears: ''
  });

  // Enhanced provider stats calculation from real data
  const providerStats = useMemo(() => {
    if (!userProfile || !providerBookings) return {};
    
    const totalBookings = providerBookings.length;
    const completedBookings = providerBookings.filter(booking => booking.status === 'completed').length;
    const pendingBookings = providerBookings.filter(booking => booking.status === 'pending').length;
    const upcomingBookings = providerBookings.filter(booking => booking.status === 'confirmed').length;
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
    
    // Calculate total earnings from completed bookings
    const totalEarnings = providerBookings
      .filter(booking => booking.status === 'completed' && booking.totalAmount)
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    // Calculate average rating from reviews
    const reviewsWithRatings = providerBookings
      .filter(booking => booking.review && booking.review.rating);
    const avgRating = reviewsWithRatings.length > 0 
      ? (reviewsWithRatings.reduce((sum, booking) => sum + booking.review.rating, 0) / reviewsWithRatings.length).toFixed(1)
      : 0;
    
    // Days since joining
    const memberDays = Math.floor((new Date() - new Date(userProfile.createdAt)) / (1000 * 60 * 60 * 24));
    
    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      upcomingBookings,
      completionRate,
      totalEarnings,
      avgRating,
      totalReviews: reviewsWithRatings.length,
      memberDays
    };
  }, [userProfile, providerBookings]);
  
  // Fetch user profile data and provider bookings
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchProviderData = async () => {
      setLoading(true);
      
      try {
        // Fetch user profile and provider bookings in parallel
        const [profileData, bookingsData] = await Promise.all([
          getCurrentUserProfile(),
          getProviderBookings(currentUser.uid)
        ]);
        
        // Ensure we have the required structure for provider
        const processedProfile = {
          ...profileData,
          id: profileData.id || currentUser.uid,
          name: profileData.name || currentUser.displayName || 'Provider',
          email: profileData.email || currentUser.email,
          profileImage: profileData.profileImage || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'Provider')}&background=6366f1&color=fff`,
          accountType: profileData.accountType || 'Provider',
          serviceArea: profileData.serviceArea || '',
          providerDescription: profileData.providerDescription || '',
          businessHours: profileData.businessHours || '',
          website: profileData.website || '',
          specialties: profileData.specialties || [],
          businessLicense: profileData.businessLicense || '',
          insurance: profileData.insurance || '',
          experienceYears: profileData.experienceYears || '',
          isVerified: profileData.isVerified || false,
          createdAt: profileData.createdAt || currentUser.metadata?.creationTime
        };
        
        setUserProfile(processedProfile);
        setFormData({
          name: processedProfile.name,
          phone: processedProfile.phone || '',
          serviceArea: processedProfile.serviceArea,
          providerDescription: processedProfile.providerDescription,
          businessHours: processedProfile.businessHours,
          website: processedProfile.website,
          profileImage: processedProfile.profileImage,
          specialties: processedProfile.specialties,
          businessLicense: processedProfile.businessLicense,
          insurance: processedProfile.insurance,
          experienceYears: processedProfile.experienceYears
        });
        setProviderBookings(Array.isArray(bookingsData) ? bookingsData : []);
        
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setError('Failed to load profile data. Please try again.');
        
        // Create minimal profile from Firebase auth data as fallback
        const fallbackProfile = {
          id: currentUser.uid,
          name: currentUser.displayName || 'Provider',
          email: currentUser.email,
          profileImage: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'Provider')}&background=6366f1&color=fff`,
          accountType: 'Provider',
          serviceArea: '',
          providerDescription: '',
          businessHours: '',
          website: '',
          specialties: [],
          businessLicense: '',
          insurance: '',
          experienceYears: '',
          isVerified: false,
          createdAt: currentUser.metadata?.creationTime
        };
        
        setUserProfile(fallbackProfile);
        setFormData({
          name: fallbackProfile.name,
          phone: '',
          serviceArea: '',
          providerDescription: '',
          businessHours: '',
          website: '',
          profileImage: fallbackProfile.profileImage,
          specialties: [],
          businessLicense: '',
          insurance: '',
          experienceYears: ''
        });
        setProviderBookings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviderData();
  }, [currentUser]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Update profile via API
      const updatedProfile = await updateUserProfile(formData);
      
      setUserProfile(updatedProfile);
      setIsEditing(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Enhanced LoadingState component for provider
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
          <h3 className="text-lg font-bold text-gray-900">Loading Provider Profile</h3>
          <p className="text-gray-600 mt-1">Preparing your business dashboard...</p>
        </motion.div>
      </motion.div>
    </div>
  );

  // Enhanced StatsCard component for provider metrics
  const StatsCard = ({ icon, title, value, subtitle, color = 'primary', trend, prefix = '', suffix = '' }) => (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {trend}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{prefix}{value}{suffix}</h3>
          <p className="text-gray-600 font-medium text-sm">{title}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  // Loading state for the entire page
  if (loading) {
    return <LoadingState />;
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }
    
    setSaveLoading(true);
    setDeleteError('');
    
    try {
      console.log('Attempting to delete provider account');
      await deleteAccount();
      
      setSaveLoading(false);
      setShowDeleteModal(false);
      alert('Account deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteAccount:', error);
      setSaveLoading(false);
      
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError('For security reasons, please log out and log back in before deleting your account.');
      } else {
        setDeleteError('Failed to delete account: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // ✅ Enhanced ProfileCard component with animations and better design
  const ProfileCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full -translate-y-8 translate-x-8 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full translate-y-6 -translate-x-6 opacity-20"></div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Profile Avatar */}
            <motion.div 
              className="relative w-28 h-28 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={formData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=6366f1&color=fff`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover ring-4 ring-primary-100 shadow-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=6366f1&color=fff`;
                }}
              />
              <motion.div 
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name="briefcase" size="sm" className="text-white" />
              </motion.div>
            </motion.div>
            
            {/* Profile Info */}
            <Heading level={3} className="text-neutral-900 mb-2 text-xl">
              {formData.name || 'Provider Name'}
            </Heading>
            <Text size="small" className="text-neutral-600 mb-4">
              {currentUser?.email}
            </Text>
            
            {/* Enhanced Verification Status */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mb-6"
            >
              <Badge 
                variant={userProfile?.isVerified ? 'success' : 'warning'}
                className="px-4 py-2 text-sm font-bold"
              >
                <Icon 
                  name={userProfile?.isVerified ? 'shield-check' : 'clock'} 
                  size="xs" 
                  className="mr-2" 
                />
                {userProfile?.isVerified ? 'Verified Provider' : 'Verification Pending'}
              </Badge>
            </motion.div>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-1 gap-4 w-full">
              <motion.div 
                className="text-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200"
                whileHover={{ scale: 1.02 }}
              >
                <Text size="small" className="text-primary-600 font-medium">Service Area</Text>
                <Text className="font-bold text-primary-900 mt-1 text-lg">
                  {formData.serviceArea || 'Not set'}
                </Text>
              </motion.div>
              <motion.div 
                className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border border-green-200"
                whileHover={{ scale: 1.02 }}
              >
                <Text size="small" className="text-green-600 font-medium">Avg Rating</Text>
                <div className="flex items-center justify-center mt-1">
                  <Icon name="star" size="sm" className="text-yellow-500 mr-1" />
                  <Text className="font-bold text-green-900 text-lg">
                    {providerStats.avgRating || 'N/A'}
                  </Text>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // ✅ NEW: Enhanced DeleteModal component with animations and better design
  const DeleteModal = () => (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-2xl border border-white/20 rounded-3xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-red-50 to-orange-50 pb-6">
            <motion.div 
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Icon name="trash" className="h-8 w-8 text-red-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-red-900">Delete Provider Account</CardTitle>
            <Text className="text-red-700 mt-2">
              This action will permanently remove your business from Hausly
            </Text>
          </CardHeader>
          
          <CardContent className="space-y-6 p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Alert variant="error" className="border-red-200 bg-red-50">
                <Icon name="error" size="sm" className="mr-2" />
                <div>
                  <Text className="font-medium text-red-900">Warning: This action cannot be undone</Text>
                  <Text size="small" className="text-red-700 mt-1 leading-relaxed">
                    This will permanently delete your provider account, all your services, bookings history, and remove all your data from our servers.
                  </Text>
                </div>
              </Alert>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Text size="small" className="text-neutral-600 mb-3 font-medium">
                Please type <Text className="font-bold bg-gray-100 px-2 py-1 rounded text-gray-900">DELETE</Text> to confirm
              </Text>
              <FormInput
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full border-2 focus:border-red-500 focus:ring-red-100"
              />
            </motion.div>
            
            <AnimatePresence>
              {deleteError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert variant="error" className="border-red-200 bg-red-50">
                    <Icon name="error" size="sm" className="mr-2" />
                    {deleteError}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div 
              className="flex gap-4 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                className="flex-1 border-2"
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || saveLoading}
                loading={saveLoading}
                className="flex-1 shadow-lg"
                icon={<Icon name="trash" size="sm" />}
              >
                {saveLoading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Enhanced Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full transform translate-x-48 -translate-y-48 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-200 rounded-full transform -translate-x-32 translate-y-32 opacity-20 animate-pulse delay-300"></div>
      </div>

      <PageLayout background="bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageHeader
            title="Provider Profile"
            subtitle="Manage your business profile and track your success"
            description="Update your professional details to attract more customers and grow your business on Hausly"
            icon={<Icon name="briefcase" />}
            breadcrumbs={[
              { label: 'Dashboard', href: '/provider/dashboard' },
              { label: 'Profile' }
            ]}
            actions={[
              {
                label: 'View Public Profile',
                variant: 'outline',
                onClick: () => navigate(`/provider/${userProfile?.uid}`),
                icon: <Icon name="external" size="sm" />
              }
            ]}
          />
        </motion.div>

        {/* Enhanced Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert variant="success" className="border-green-200 bg-green-50 shadow-lg">
                <Icon name="check" size="sm" className="mr-2" />
                Profile updated successfully! Your changes are now live.
              </Alert>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert variant="error" className="border-red-200 bg-red-50 shadow-lg">
                <Icon name="error" size="sm" className="mr-2" />
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <ContentSection>
          {/* Provider Stats Dashboard */}
          {providerBookings.length > 0 ? (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <Heading level={2} className="text-2xl font-bold text-gray-900 mb-2">
                  Your Business Overview
                </Heading>
                <Text className="text-gray-600">
                  Track your performance and grow your success on Hausly
                </Text>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                  title="Total Bookings"
                  value={providerStats.totalBookings || 0}
                  subtitle="All time"
                  color="primary"
                />
                
                <StatsCard
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  }
                  title="Total Earnings"
                  value={providerStats.totalEarnings || 0}
                  prefix="$"
                  subtitle="From completed bookings"
                  color="green"
                />
                
                <StatsCard
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                  title="Average Rating"
                  value={providerStats.avgRating || 'N/A'}
                  subtitle={`${providerStats.totalReviews || 0} reviews`}
                  color="yellow"
                />
                
                <StatsCard
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Completion Rate"
                  value={providerStats.completionRate || 0}
                  suffix="%"
                  subtitle="Success rate"
                  color="blue"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12 mb-8 bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl border border-gray-200"
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start Your Business?</h3>
                <p className="text-gray-600 mb-6">Complete your profile and start receiving bookings from customers!</p>
                <Button
                  onClick={() => navigate('/provider/services')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Icon name="plus" size="sm" className="mr-2" />
                  Add Your First Service
                </Button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <ProfileCard />
            </div>
            
            {/* Profile Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="border-b border-gray-100 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Business Information</CardTitle>
                        <Text size="small" className="text-neutral-600 mt-1">
                          Keep your professional details up to date
                        </Text>
                      </div>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2"
                        >
                          <Icon name="edit" size="sm" />
                          Edit Profile
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setError('');
                          }}
                          className="flex items-center gap-2"
                        >
                          <Icon name="x" size="sm" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <Form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Full Name" required>
                          <FormInput
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            disabled={!isEditing}
                            required
                          />
                        </FormField>
                        
                        <FormField label="Phone Number">
                          <FormInput
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            disabled={!isEditing}
                          />
                        </FormField>
                        
                        <FormField label="Service Area" required>
                          <FormInput
                            name="serviceArea"
                            value={formData.serviceArea}
                            onChange={handleInputChange}
                            placeholder="e.g. New York City, NY"
                            disabled={!isEditing}
                            required
                          />
                        </FormField>
                        
                        <FormField label="Years of Experience">
                          <FormInput
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears}
                            onChange={handleInputChange}
                            placeholder="e.g. 5"
                            disabled={!isEditing}
                          />
                        </FormField>
                        
                        <FormField label="Business Hours">
                          <FormInput
                            name="businessHours"
                            value={formData.businessHours}
                            onChange={handleInputChange}
                            placeholder="e.g. Mon-Fri: 9AM-5PM"
                            disabled={!isEditing}
                          />
                        </FormField>
                        
                        <FormField label="Business License">
                          <FormInput
                            name="businessLicense"
                            value={formData.businessLicense}
                            onChange={handleInputChange}
                            placeholder="License number"
                            disabled={!isEditing}
                          />
                        </FormField>
                        
                        <FormField label="Website" className="md:col-span-2">
                          <FormInput
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://your-website.com"
                            disabled={!isEditing}
                          />
                        </FormField>
                        
                        <FormField label="Profile Image URL" className="md:col-span-2">
                          <FormInput
                            type="url"
                            name="profileImage"
                            value={formData.profileImage}
                            onChange={handleInputChange}
                            placeholder="https://example.com/your-photo.jpg"
                            helperText="Provide a URL to your professional photo"
                            disabled={!isEditing}
                          />
                        </FormField>
                      </div>
                      
                      <FormField label="Professional Description" required>
                        <FormTextarea
                          name="providerDescription"
                          value={formData.providerDescription}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Describe your services, experience, and qualifications..."
                          helperText="Help customers understand your expertise and what makes you unique"
                          disabled={!isEditing}
                          required
                        />
                      </FormField>
                      
                      {isEditing && (
                        <FormActions className="flex justify-between pt-6 border-t border-gray-100">
                          <Button
                            type="button"
                            variant="error"
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2"
                          >
                            <Icon name="trash" size="sm" />
                            Delete Account
                          </Button>
                          
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                setError('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              loading={saveLoading}
                              className="flex items-center gap-2"
                            >
                              <Icon name="save" size="sm" />
                              {saveLoading ? 'Updating...' : 'Update Profile'}
                            </Button>
                          </div>
                        </FormActions>
                      )}
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </ContentSection>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && <DeleteModal />}
        </AnimatePresence>
      </PageLayout>
    </div>
  );
};

export default ProviderProfile;
