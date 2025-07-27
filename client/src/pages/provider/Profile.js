import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

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
  const { userProfile, currentUser, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceArea: '',
    providerDescription: '',
    businessHours: '',
    website: '',
    profileImage: ''
  });
  
  // Initialize form with user data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        serviceArea: userProfile.serviceArea || '',
        providerDescription: userProfile.providerDescription || '',
        businessHours: userProfile.businessHours || '',
        website: userProfile.website || '',
        profileImage: userProfile.photoURL || ''
      });
    }
  }, [userProfile]);
  
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
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const { updateUserProfile } = useAuth();
      await updateUserProfile(formData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }
    
    setLoading(true);
    setDeleteError('');
    
    try {
      console.log('Attempting to delete provider account');
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

  // ✅ NEW: Enhanced ProfileCard component
  const ProfileCard = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Profile Avatar */}
          <div className="relative w-24 h-24 mb-4">
            <img
              src={formData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover ring-4 ring-primary-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <Icon name="user" size="sm" className="text-white" />
            </div>
          </div>
          
          {/* Profile Info */}
          <Heading level={3} className="text-neutral-900 mb-1">
            {formData.name || 'Provider Name'}
          </Heading>
          <Text size="small" className="text-neutral-600 mb-3">
            {currentUser?.email}
          </Text>
          
          {/* Verification Status */}
          <Badge 
            variant={userProfile?.isVerified ? 'success' : 'warning'}
            className="mb-4"
          >
            <Icon 
              name={userProfile?.isVerified ? 'check' : 'clock'} 
              size="xs" 
              className="mr-1" 
            />
            {userProfile?.isVerified ? 'Verified Provider' : 'Pending Verification'}
          </Badge>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <Text size="small" className="text-neutral-600">Service Area</Text>
              <Text className="font-medium text-neutral-900 mt-1">
                {formData.serviceArea || 'Not set'}
              </Text>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <Text size="small" className="text-neutral-600">Business Hours</Text>
              <Text className="font-medium text-neutral-900 mt-1">
                {formData.businessHours || 'Not set'}
              </Text>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced DeleteModal component
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100 mb-4">
            <Icon name="trash" className="h-6 w-6 text-error-600" />
          </div>
          <CardTitle className="text-error-900">Delete Provider Account</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="error">
            <Icon name="error" size="sm" className="mr-2" />
            This action cannot be undone. This will permanently delete your provider account, all your services, and remove your data from our servers.
          </Alert>
          
          <div>
            <Text size="small" className="text-neutral-600 mb-2">
              Please type <Text className="font-bold">DELETE</Text> to confirm
            </Text>
            <FormInput
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full"
            />
          </div>
          
          {deleteError && (
            <Alert variant="error">
              <Icon name="error" size="sm" className="mr-2" />
              {deleteError}
            </Alert>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
                setDeleteError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              className="flex-1"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PageLayout background="bg-neutral-50">
      <PageHeader
        title="Provider Profile"
        subtitle="Manage your account and business information"
        description="Update your profile details to help customers find and connect with your services"
        icon={<Icon name="user" />}
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

      {/* Success Alert */}
      {success && (
        <Alert variant="success" className="mb-6">
          <Icon name="check" size="sm" className="mr-2" />
          Profile updated successfully!
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          <Icon name="error" size="sm" className="mr-2" />
          {error}
        </Alert>
      )}

      <ContentSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard />
          </div>
          
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <Text size="small" className="text-neutral-600">
                  Update your professional details and service information
                </Text>
              </CardHeader>
              
              <CardContent>
                <Form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Full Name" required>
                      <FormInput
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
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
                      />
                    </FormField>
                    
                    <FormField label="Service Area" required>
                      <FormInput
                        name="serviceArea"
                        value={formData.serviceArea}
                        onChange={handleInputChange}
                        placeholder="e.g. New York City, NY"
                        required
                      />
                    </FormField>
                    
                    <FormField label="Business Hours">
                      <FormInput
                        name="businessHours"
                        value={formData.businessHours}
                        onChange={handleInputChange}
                        placeholder="e.g. Mon-Fri: 9AM-5PM"
                      />
                    </FormField>
                    
                    <FormField label="Website" className="md:col-span-2">
                      <FormInput
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://your-website.com"
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
                      required
                    />
                  </FormField>
                  
                  <FormActions className="flex justify-between">
                    <Button
                      type="button"
                      variant="error"
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Icon name="trash" size="sm" />
                      Delete Account
                    </Button>
                    
                    <Button
                      type="submit"
                      loading={loading}
                      className="flex items-center gap-2"
                    >
                      <Icon name="save" size="sm" />
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </FormActions>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </ContentSection>

      {/* Delete Account Modal */}
      {showDeleteModal && <DeleteModal />}
    </PageLayout>
  );
};

export default ProviderProfile;
