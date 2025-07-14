import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { motion } from 'framer-motion';
import { getServices, createService, updateService } from '../../services/serviceService';
import ServiceForm from '../../components/provider/ServiceForm';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();

  // Default placeholder image as data URI
  const defaultPlaceholderImage = 'https://via.placeholder.com/600x400?text=Service+Image';

  // Fetch provider services
  useEffect(() => {
    const fetchProviderServices = async () => {
      try {
        setLoading(true);
        console.log('Current currentUser:', currentUser);

        // Use currentUser.uid if available
        const providerIdToUse = (currentUser && currentUser.uid) ? currentUser.uid : null;

        if (providerIdToUse) {
          console.log('Fetching services for provider ID:', providerIdToUse);
          console.log('Database providerId to match:', 'CPDBQF09m3XCrVyBgZo45wqUFyG3');
          // Get services from API for this provider
          const response = await getServices({ providerId: providerIdToUse });
          console.log('Services response from API:', response);

          // Format the services
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

          console.log('Formatted services:', formattedServices);
          setServices(formattedServices);
        } else {
          console.warn('No userProfile or userProfile.uid available to fetch services');
          if (currentUser) {
            console.log('Current user exists but may not have proper profile:', currentUser.uid);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
        setLoading(false);
      }
    };

    fetchProviderServices();
  }, [currentUser]);

  // Handle image error for service list
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultPlaceholderImage;
  };

  // Handle service status toggle
  const handleToggleStatus = async (serviceId) => {
    try {
      // Find the service to toggle
      const serviceToToggle = services.find(service => service.id === serviceId);
      if (!serviceToToggle) return;

      // Update the service status via API
      await updateService(serviceId, { isActive: !serviceToToggle.isActive });

      // Update local state
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId 
            ? { ...service, isActive: !service.isActive } 
            : service
        )
      );
      
      setSuccess(`Service ${serviceToToggle.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      setError(`Failed to update service status: ${error.message}`);
    }
  };

  // Handle edit service
  const handleEditService = (serviceId) => {
    setEditingService(serviceId);
    setShowAddForm(true);

    // Scroll to form
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

      // Prepare service data
      const serviceData = {
        ...serviceFormData,
        price: parseFloat(serviceFormData.price),
        image: serviceFormData.image || defaultPlaceholderImage,
        isActive: true
      };

      if (editingService) {
        // Update existing service
        const updateResponse = await updateService(editingService, serviceData);

        // Update the services list
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
        // Create new service
        const createResponse = await createService(serviceData);

        // Add the new service to the list
        setServices(prevServices => [...prevServices, createResponse]);

        setSuccess('Service added successfully!');
      }

      // Reset form and hide it
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error submitting service:', error);
      setError(error.message || 'Failed to save service. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Categories for dropdown - must match backend enum values exactly
  const categories = [
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Gardening', label: 'Gardening' },
    { value: 'Painting', label: 'Painting' },
    { value: 'Moving', label: 'Moving' },
    { value: 'Other', label: 'Other' }
  ];

  // Duration options for dropdown
  const durationOptions = [
    { value: '30 minutes', label: '30 minutes' },
    { value: '1 hour', label: '1 hour' },
    { value: '1.5 hours', label: '1.5 hours' },
    { value: '2 hours', label: '2 hours' },
    { value: '3 hours', label: '3 hours' },
    { value: '4 hours', label: '4 hours' },
    { value: '5+ hours', label: '5+ hours' },
    { value: 'custom', label: 'Custom duration' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
          <button
            onClick={() => {
              if (showAddForm) {
                // Reset form when canceling
                resetForm();
              }
              setShowAddForm(!showAddForm);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {showAddForm ? 'Cancel' : 'Add New Service'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <ServiceForm
              initialData={editingService ? services.find(s => s.id === editingService) : null}
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                setShowAddForm(false);
              }}
              isEditing={!!editingService}
            />
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">You haven't added any services yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="divide-y divide-gray-200">
              {services.map(service => (
                <div key={service.id} className="px-4 py-5 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start space-x-4 w-full sm:w-auto">
                      <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
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
                          <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-x-3 gap-y-1">
                          <span className="flex items-center">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {service.category}
                          </span>
                          <span className="flex items-center">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            ${service.price.toFixed(2)}
                          </span>
                          <span className="flex items-center">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {service.duration}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{service.description}</p>

                        {service.tags && service.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {service.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleEditService(service.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                      >
                        <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(service.id)}
                        className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                          service.isActive
                            ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                            : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                        }`}
                      >
                        {service.isActive ? (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Deactivate
                          </>
                        ) : (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProviderServices;
