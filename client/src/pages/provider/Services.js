import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { getServices, createService, updateService } from '../../services/serviceService';
import ServiceForm from '../../components/provider/ServiceForm';

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
} from '../../components/ui';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();

  const defaultPlaceholderImage = 'https://via.placeholder.com/600x400?text=Service+Image';

  // ✅ Memoize currentUser.uid to prevent unnecessary re-fetches
  const currentUserId = currentUser?.uid;
  
  // Fetch provider services
  useEffect(() => {
    const fetchProviderServices = async () => {
      try {
        setLoading(true);
        
        if (currentUserId) {
          const response = await getServices({ providerId: currentUserId });
          
          const formattedServices = response.map(service => ({
            id: service._id,
            title: service.title,
            description: service.description,
            price: service.price,
            duration: service.duration || '1 hour',
            category: service.category,
            image: service.image || defaultPlaceholderImage,
            tags: service.tags || [],
            isActive: service.isActive !== undefined ? service.isActive : true
          }));

          setServices(formattedServices);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
        setLoading(false);
      }
    };

    // Only fetch if we have a valid user ID
    if (currentUserId) {
      fetchProviderServices();
    } else {
      setLoading(false);
    }
  }, [currentUserId]); // Use memoized ID instead of full currentUser object

  // Handle service status toggle
  const handleToggleStatus = async (serviceId) => {
    try {
      console.log('🔄 handleToggleStatus called with serviceId:', serviceId);
      const serviceToToggle = services.find(service => service.id === serviceId);
      if (!serviceToToggle) {
        console.error('❌ Service not found for ID:', serviceId);
        return;
      }

      console.log('🔄 Toggling service:', serviceToToggle.title, 'from', serviceToToggle.isActive, 'to', !serviceToToggle.isActive);

      await updateService(serviceId, { isActive: !serviceToToggle.isActive });

      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId 
            ? { ...service, isActive: !service.isActive } 
            : service
        )
      );
      
      const newStatus = serviceToToggle.isActive ? 'deactivated' : 'activated';
      setSuccess(`Service ${newStatus} successfully!`);
      console.log('✅ Service status updated successfully:', newStatus);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Error updating service status:', error);
      setError(`Failed to update service status: ${error.message}`);
    }
  };

  // Handle edit service
  const handleEditService = (serviceId) => {
    setEditingService(serviceId);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form after submission or cancellation
  const resetForm = () => {
    setEditingService(null);
  };

  // Handle form submission
  const handleSubmit = async (serviceFormData) => {
    try {
      setLoading(true);
      setError('');
      setIsSubmitting(true);

      const serviceData = {
        ...serviceFormData,
        price: parseFloat(serviceFormData.price),
        image: serviceFormData.image || defaultPlaceholderImage,
        isActive: true
      };

      if (editingService) {
        await updateService(editingService, serviceData);
        setServices(prevServices => 
          prevServices.map(service => 
            service.id === editingService ? {
              ...service,
              ...serviceData,
              updatedAt: new Date().toISOString()
            } : service
          )
        );
        setSuccess('Service updated successfully!');
      } else {
        const createResponse = await createService(serviceData);
        setServices(prevServices => [...prevServices, createResponse]);
        setSuccess('Service added successfully!');
      }

      resetForm();
      setShowAddForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error submitting service:', error);
      setError(error.message || 'Failed to save service. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // ✅ NEW: Enhanced ServiceCard component
  const ServiceCard = ({ service }) => {
    // Debug logging
    console.log('🔧 Rendering ServiceCard for service:', service.title, 'isActive:', service.isActive);
    
    return (
    <Card className="transition-all duration-150 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Service Image */}
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 shadow-sm">
              {service.image ? (
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultPlaceholderImage;
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Icon name="services" size="lg" className="text-primary-600" />
                </div>
              )}
            </div>
          </div>
          
          {/* Service Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Heading level={4} className="text-neutral-900 truncate">
                  {service.title}
                </Heading>
                <Badge 
                  variant={service.isActive ? "success" : "neutral"}
                  size="sm"
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <Text size="small" className="text-neutral-600 mb-3 line-clamp-2">
              {service.description}
            </Text>

            {/* Service Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-3">
              <div className="flex items-center gap-1">
                <Icon name="tag" size="xs" />
                <Text size="small">{service.category}</Text>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="dollar" size="xs" />
                <Text size="small">${service.price.toFixed(2)}</Text>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="clock" size="xs" />
                <Text size="small">{service.duration}</Text>
              </div>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {service.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="neutral" 
                    size="sm"
                    className="bg-primary-50 text-primary-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-neutral-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🔧 Edit button clicked for service:', service.id);
                  handleEditService(service.id);
                }}
                className="flex items-center gap-2"
              >
                <Icon name="edit" size="xs" />
                Edit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  console.log('🔄 Toggle button clicked for service:', service.id, 'Current status:', service.isActive);
                  handleToggleStatus(service.id);
                }}
                className="flex items-center gap-2 min-w-[120px]"
              >
                <Icon name={service.isActive ? "close" : "check"} size="xs" />
                {service.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  };

  // ✅ NEW: Service Form Section
  const serviceFormSection = showAddForm && (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          {editingService ? 'Edit Service' : 'Add New Service'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceForm
          initialData={editingService ? services.find(s => s.id === editingService) : null}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            setShowAddForm(false);
          }}
          isEditing={!!editingService}
        />
      </CardContent>
    </Card>
  );

  // ✅ NEW: Services Grid Section  
  const servicesSection = (
    <div className="space-y-4">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );

  // ✅ NEW: Empty State
  const emptyState = (
    <Card className="text-center py-12">
      <CardContent>
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="services" className="w-10 h-10 text-primary-600" />
        </div>
        <Heading level={3} className="text-neutral-900 mb-3">No services yet</Heading>
        <Text className="text-neutral-600 mb-6 max-w-md mx-auto">
          Start building your service catalog by adding your first service offering. 
          This will help customers discover and book your services.
        </Text>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Icon name="plus" size="sm" />
          Add Your First Service
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout background="bg-neutral-50">
      <PageHeader
        title="Manage Services"
        subtitle="Build and manage your service catalog"
        description="Add, edit, and organize the services you offer to customers"
        icon={<Icon name="services" />}
        badge={{
          text: `${services.length} Service${services.length !== 1 ? 's' : ''}`,
          variant: 'neutral'
        }}
        breadcrumbs={[
          { label: 'Dashboard', href: '/provider/dashboard' },
          { label: 'Services' }
        ]}
        actions={[
          {
            label: showAddForm ? 'Cancel' : 'Add New Service',
            variant: showAddForm ? 'outline' : 'primary',
            onClick: () => {
              if (showAddForm) {
                resetForm();
              }
              setShowAddForm(!showAddForm);
            },
            icon: <Icon name={showAddForm ? 'close' : 'plus'} size="sm" />
          }
        ]}
      />

      {/* Success Alert */}
      {success && (
        <Alert variant="success" className="mb-6">
          <Icon name="check" size="sm" className="mr-2" />
          {success}
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
        {/* Service Form */}
        {serviceFormSection}

        {/* Main Content */}
        {loading ? (
          <LoadingState 
            title="Loading your services..."
            description="Fetching your service catalog"
          />
        ) : services.length === 0 ? (
          <div>
            <div className="bg-red-100 border border-red-500 p-4 mb-4">
              <strong>DEBUG: No services found</strong>
              <br />Services array length: {services.length}
              <br />Current user: {currentUser ? 'Logged in' : 'Not logged in'}
              <br />User role: {JSON.stringify(userRole)}
            </div>
            {emptyState}
          </div>
        ) : (
          <div>
            <div className="bg-green-100 border border-green-500 p-4 mb-4">
              <strong>DEBUG: Services loaded successfully!</strong>
              <br />Services count: {services.length}
              <br />First service: {services[0]?.title || 'N/A'}
              <br />Services data: <pre>{JSON.stringify(services, null, 2)}</pre>
            </div>
            <div className="flex items-center justify-between mb-6">
              <Heading level={3} className="text-neutral-900">
                Your Services ({services.length})
              </Heading>
            </div>
            {servicesSection}
          </div>
        )}
      </ContentSection>
    </PageLayout>
  );
};

export default ProviderServices;
