import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { motion } from 'framer-motion';

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

  // Fetch user profile data
  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    
    // Simulated API call to fetch user profile
    setTimeout(() => {
      // This would be replaced with a real API call like:
      // fetch('/api/users/me').then(res => res.json())...
      
      const mockUserProfile = {
        id: currentUser.uid,
        name: 'John Doe',
        email: currentUser.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        accountType: 'Customer',
        location: {
          city: 'San Francisco',
          address: '123 Main St, Apt 4B'
        },
        stats: {
          totalBookings: 12,
          providersRated: 8,
          lastServiceBooked: 'Professional Plumbing Service'
        },
        account: {
          status: 'active',
          createdAt: '2023-01-15',
          lastLogin: new Date().toISOString(),
          preferences: {
            notifications: true,
            emailUpdates: true,
            language: 'English'
          }
        },
        createdAt: '2023-01-15'
      };
      
      setUserProfile(mockUserProfile);
      setEditedProfile(mockUserProfile);
      setLoading(false);
    }, 800);
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
  const handleSaveChanges = () => {
    setLoading(true);
    
    // Simulated API call to update profile
    setTimeout(() => {
      // This would be replaced with a real API call like:
      // fetch('/api/users/me', { method: 'PUT', body: JSON.stringify(editedProfile) })...
      
      // Update avatar if a new one was selected
      const updatedProfile = {
        ...editedProfile,
        avatar: avatarPreview || editedProfile.avatar
      };
      
      setUserProfile(updatedProfile);
      setIsEditing(false);
      setLoading(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 800);
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
    
    // Simulated API call to deactivate account
    setTimeout(() => {
      // This would be replaced with a real API call like:
      // fetch('/api/users/me/deactivate', { method: 'POST' })...
      
      setShowDeactivateModal(false);
      setLoading(false);
      
      // Redirect to home page or login page
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
      // Call the deleteAccount method from AuthProvider without password
      await deleteAccount();
      
      setLoading(false);
      setShowDeleteModal(false);
      
      // Success message
      alert('Account deleted successfully');
      
      // User will be automatically logged out and redirected by the AuthProvider
      // as the auth state will change when the account is deleted
    } catch (error) {
      console.error('Error in handleDeleteAccount:', error);
      setLoading(false);
      
      // Handle specific error types
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError('For security reasons, please log out and log back in before deleting your account.');
      } else {
        setDeleteError('Failed to delete account: ' + (error.message || 'Unknown error'));
      }
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Profile
          </motion.h1>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* User Info Overview Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="relative mb-4 md:mb-0 md:mr-6">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white">
                    <img 
                      src={avatarPreview || userProfile.avatar} 
                      alt={userProfile.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <label htmlFor="avatar-upload" className="bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    </div>
                  )}
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                  <div className="flex flex-col md:flex-row md:items-center mt-1 text-primary-100">
                    <span className="flex items-center justify-center md:justify-start">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {userProfile.email}
                    </span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span className="flex items-center justify-center md:justify-start mt-1 md:mt-0">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {userProfile.phone || 'No phone added'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-800 text-white">
                      {userProfile.accountType}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-auto">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-white text-primary-700 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-white text-white rounded-md hover:bg-primary-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-white text-primary-700 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Save Success Message */}
            {saveSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Your profile has been updated successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Save Error Message */}
            {saveError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {saveError}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveSection('personal-info')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'personal-info'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'security'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Password & Security
                </button>
                <button
                  onClick={() => setActiveSection('bookings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'bookings'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Booking Summary
                </button>
                <button
                  onClick={() => setActiveSection('account')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'account'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Account
                </button>
              </nav>
            </div>
            
            {/* Content Sections */}
            <div className="p-6">
              {/* Personal Info Section */}
              {activeSection === 'personal-info' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={editedProfile.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border rounded-md ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-primary-500 focus:border-primary-500' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={editedProfile.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={editedProfile.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border rounded-md ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-primary-500 focus:border-primary-500' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                          Account Type
                        </label>
                        <input
                          type="text"
                          id="accountType"
                          name="accountType"
                          value={editedProfile.accountType}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="location.city"
                          value={editedProfile.location?.city || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border rounded-md ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-primary-500 focus:border-primary-500' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="location.address"
                          value={editedProfile.location?.address || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border rounded-md ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-primary-500 focus:border-primary-500' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-3"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveChanges}
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Password & Security Section */}
              {activeSection === 'security' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Security</h3>
                  
                  <div className="space-y-6">
                    {/* Current Authentication Method */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Current Sign-In Method</h4>
                          <p className="text-sm text-gray-500 mt-1">You are currently using <span className="font-medium">Email and Password</span> to sign in to your account.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Change Password */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Change Password</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="current-password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter your current password"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              id="new-password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter new password"
                            />
                            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.</p>
                          </div>
                          
                          <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              id="confirm-password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Confirm new password"
                            />
                          </div>
                          
                          <div className="pt-2">
                            <button
                              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                            >
                              Update Password
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Two-Factor Authentication */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-700">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                            <p className="text-sm text-gray-500 mt-1">When enabled, you'll be required to enter a verification code along with your password when signing in.</p>
                          </div>
                          <div className="ml-4">
                            <button
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                              disabled
                            >
                              Coming Soon
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Account Activity</h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                          <li className="p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">Login</p>
                                  <p className="text-xs text-gray-500">Just now</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">From San Francisco, CA using Chrome on Mac</p>
                              </div>
                            </div>
                          </li>
                          <li className="p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">Login</p>
                                  <p className="text-xs text-gray-500">2 days ago</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">From San Francisco, CA using Chrome on Mac</p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Account Section */}
              {activeSection === 'account' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Management</h3>
                  
                  <div className="space-y-6">
                    {/* Account Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Account Status</p>
                            <div className="flex items-center mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                {userProfile.account.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                              <p className="text-sm font-medium text-gray-900">
                                Your account is in good standing
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Member Since</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {new Date(userProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{userProfile.accountType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Login</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {new Date(userProfile.account.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Preferences */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Account Preferences</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive email updates about your bookings</p>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                              <input 
                                type="checkbox" 
                                name="emailUpdates" 
                                id="emailUpdates" 
                                checked={userProfile.account.preferences.emailUpdates}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                              />
                              <label htmlFor="emailUpdates" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                              <p className="text-sm text-gray-500">Receive push notifications for important updates</p>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                              <input 
                                type="checkbox" 
                                name="notifications" 
                                id="notifications" 
                                checked={userProfile.account.preferences.notifications}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                              />
                              <label htmlFor="notifications" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                          </div>
                          <div className="pt-4">
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                              Language Preference
                            </label>
                            <select
                              id="language"
                              name="language"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              value={userProfile.account.preferences.language}
                            >
                              <option value="English">English</option>
                              <option value="Spanish">Spanish</option>
                              <option value="French">French</option>
                              <option value="German">German</option>
                              <option value="Chinese">Chinese</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Deactivate or Delete Account */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Deactivate or Delete Account</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h5 className="text-sm font-medium text-gray-900">Temporarily Deactivate Account</h5>
                                <p className="mt-1 text-sm text-gray-500">
                                  Your account will be disabled and you won't be able to use our services until you log in again. Your data will be preserved.
                                </p>
                                <div className="mt-3">
                                  <button
                                    onClick={() => setShowDeactivateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    Deactivate Account
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h5 className="text-sm font-medium text-gray-900">Permanently Delete Account</h5>
                                <p className="mt-1 text-sm text-gray-500">
                                  Once you delete your account, there is no going back. All of your data will be permanently removed.
                                </p>
                                <div className="mt-3">
                                  <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                  >
                                    Delete Account
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Booking Summary Section */}
              {activeSection === 'bookings' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
                  
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Total Bookings */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-500">Total Bookings</h4>
                            <p className="text-2xl font-semibold text-gray-900">{userProfile.stats.totalBookings}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Providers Rated */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-yellow-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-500">Providers Rated</h4>
                            <p className="text-2xl font-semibold text-gray-900">{userProfile.stats.providersRated}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Completion Rate */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-500">Completion Rate</h4>
                            <p className="text-2xl font-semibold text-gray-900">92%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Last Service Booked */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Last Service Booked</h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                              <img 
                                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80" 
                                alt="Service" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between">
                                <h5 className="text-base font-medium text-gray-900">{userProfile.stats.lastServiceBooked}</h5>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Confirmed
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Scheduled for May 10, 2025 at 10:00 AM</p>
                              <div className="mt-3">
                                <a 
                                  href="/booking/bk1" 
                                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                  View Booking Details →
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking History */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Recent Booking History</h4>
                        <a 
                          href="/bookings" 
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          View All
                        </a>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Service
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">Professional Plumbing Service</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">May 10, 2025</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Confirmed
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">House Cleaning Service</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">May 15, 2025</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Confirmed
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">Electrical Repair</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">April 29, 2025</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Completed
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Export Options */}
                    <div className="flex justify-end">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Booking History
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deactivate Account</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to deactivate your account? You can reactivate it by logging in again.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivateAccount}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors flex-1"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-500 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Please type <span className="font-bold">DELETE</span> to confirm</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 mb-3"
                  placeholder="Type DELETE to confirm"
                />
                
                {deleteError && (
                  <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex-1 ${
                    deleteConfirmText === 'DELETE'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-300 text-white cursor-not-allowed'
                  }`}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add CSS for toggle switch
const toggleStyles = `
  .toggle-checkbox:checked {
    right: 0;
    border-color: #68D391;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #68D391;
  }
`;

// Add style tag to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = toggleStyles;
  document.head.appendChild(style);
}

export default Profile;
