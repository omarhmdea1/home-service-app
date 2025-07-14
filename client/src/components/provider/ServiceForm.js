import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ServiceForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '1 hour',
    category: 'Plumbing',
    image: '',
    tags: []
  });

  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // Set initial data if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        duration: initialData.duration || '1 hour',
        category: initialData.category || 'Plumbing',
        image: initialData.image || '',
        tags: initialData.tags || []
      });
      
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    }
  }, [initialData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset error state
    setImageError(false);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setFormData(prev => ({
        ...prev,
        image: e.target.result
      }));
    };
    reader.onerror = () => {
      setImageError('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Service' : 'Add New Service'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-100 text-primary-800 p-1 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span>
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Service Title */}
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Service Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Professional Plumbing Service"
                    className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  {formData.title && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">A clear, descriptive title helps customers find your service</p>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Choose the category that best fits your service</p>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="pl-7 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Set a competitive price for your service</p>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <select
                    id="duration"
                    name="duration"
                    required
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="" disabled>Select service duration</option>
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Select the typical duration for this service</p>
              </div>
            </div>
          </div>

          {/* Service Description Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-100 text-primary-800 p-1 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span>
              Service Description
            </h4>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Describe your service in detail. Include what's included, what customers can expect, and any special features."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div className="mt-1 flex justify-between">
                <p className="text-xs text-gray-500">
                  A detailed description helps customers understand your service better
                </p>
                <p className="text-xs text-gray-500">
                  {formData.description.length} characters
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-100 text-primary-800 p-1 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span>
              Service Image
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-4">
              {/* Image Upload */}
              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload an image (optional)
                </label>
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100
                        focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
                {imageError && (
                  <p className="mt-1 text-sm text-red-600">
                    {imageError}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Recommended size: 600x400 pixels. Max file size: 5MB.
                </p>
              </div>
              
              {/* Image URL */}
              <div className="sm:col-span-4">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Or enter an image URL:
                </label>
                <input
                  type="text"
                  name="image"
                  id="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL or leave empty for default image"
                  className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              {/* Image Preview */}
              <div className="sm:col-span-2">
                {(imagePreview || formData.image) && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="h-40 w-full border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={imagePreview || formData.image}
                        alt="Service preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20fill%3D%22%23e9ecef%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23495057%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22150%22%20y%3D%22110%22%3EService%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-primary-100 text-primary-800 p-1 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">4</span>
              Service Tags
            </h4>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="tags"
                  placeholder="Type a tag and press Enter or comma to add"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const tag = e.target.value.trim();
                      if (tag && !formData.tags.includes(tag)) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...prev.tags, tag]
                        }));
                      }
                      e.target.value = '';
                    }
                  }}
                  className="pl-10 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 transition-all hover:bg-primary-200"
                      >
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tags: prev.tags.filter((_, i) => i !== index)
                            }));
                          }} 
                          className="ml-1.5 inline-flex text-primary-500 hover:text-primary-600 focus:outline-none"
                          aria-label={`Remove ${tag} tag`}
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Add tags to help customers find your service (e.g., "emergency", "residential", "commercial")
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              {isEditing ? (
                <>
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Update Service
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ServiceForm;
