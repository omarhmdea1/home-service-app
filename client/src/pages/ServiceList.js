import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';

// ✅ NEW: Import our design system components
import {
  ListPageTemplate,
  ContentSection,
} from '../components/layout';

import {
  Card,
  CardContent,
  Button,
  Badge,
  Icon,
  Heading,
  Text,
  Input,
  ServiceCard,
  Alert,
  LoadingState,
  getServiceIcon,
} from '../components/ui';

const ServiceList = () => {
  const { currentUser, userRole } = useAuth();
  const location = useLocation();
  const [rawServices, setRawServices] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  
  // ✅ CACHING: Store API responses to avoid duplicate requests
  const [servicesCache, setServicesCache] = useState(new Map());
  
  // Parse search parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const searchFromURL = searchParams.get('search') || '';
  const categoryFromURL = searchParams.get('category') || '';
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(searchFromURL);
  const [categoryFilter, setCategoryFilter] = useState(
    categoryFromURL === 'All Categories' ? '' : categoryFromURL
  );
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [ratingFilter, setRatingFilter] = useState(0);
  
  // Modal states
  const [selectedService, setSelectedService] = useState(null);

  // ✅ FIXED: Fetch all categories separately to prevent dropdown disappearing
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        console.log('🏷️ Fetching all categories...');
        const response = await fetch('http://localhost:5001/api/services/categories');
        
        if (response.ok) {
          const categoriesResponse = await response.json();
          
          // Handle both direct array and object response formats
          const categoriesArray = Array.isArray(categoriesResponse) 
            ? categoriesResponse 
            : (categoriesResponse.categories || []);
          
          setAllCategories(categoriesArray.sort());
          console.log('✅ Categories loaded:', categoriesArray);
        } else {
          // Fallback: extract from first batch of services
          console.log('⚠️ Categories endpoint not found (status:', response.status, '), will use fallback from services');
          
          // ✅ TEMP FIX: If server hasn't been restarted, get categories from main API
          if (response.status === 400) {
            console.log('🔧 Detected server restart needed, using fallback extraction');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        console.log('🔧 Server may need restart - will extract categories from services data');
      }
    };

    fetchAllCategories();
  }, []);

  // ✅ OPTIMIZED: Debounced search + caching + improved data fetching
  useEffect(() => {
    const fetchServices = async () => {
      const params = new URLSearchParams();
      
      if (searchTerm?.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      
      // Add pagination for better performance
      params.append('limit', '50');
      params.append('page', '1');
      
      // ✅ CACHING: Check if we already have this data
      const cacheKey = params.toString();
      const cachedData = servicesCache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < 300000) { // 5 min cache
        console.log('💾 Using cached data for:', cacheKey);
        setRawServices(cachedData.services);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Fetching services...', params.toString());
        const startTime = Date.now();
        
        const response = await fetch(`http://localhost:5001/api/services?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        const fetchTime = Date.now() - startTime;
        
        // ✅ Handle new API response structure
        const servicesArray = data.services || data || [];
        const apiQueryTime = data.meta?.queryTime || 'N/A';
        
        console.log(`✅ Services fetched in ${fetchTime}ms (API: ${apiQueryTime})`, servicesArray.length, 'services');
        
        if (data.pagination) {
          console.log('📄 Pagination:', data.pagination);
        }
        
        // Simplified data mapping
        const formattedServices = servicesArray.map(service => ({
          ...service,
          _id: service._id,
          id: service._id,
          priceUnit: service.priceUnit || 'flat rate',
          rating: service.rating || 4.5,
          reviewCount: service.reviewCount || 0,
          provider: service.providerName || service.provider || 'Professional Provider',
          providerName: service.providerName || service.provider || 'Professional Provider',
        }));
        
        setRawServices(formattedServices);
        
        // ✅ CACHING: Store with timestamp
        setServicesCache(prev => {
          const newCache = new Map(prev.set(cacheKey, {
            services: formattedServices,
            timestamp: Date.now()
          }));
          
          // ✅ MEMORY MANAGEMENT: Keep only last 5 searches and clean stale entries
          if (newCache.size > 5) {
            // Remove oldest entries
            const entries = [...newCache.entries()];
            const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const keepEntries = sortedEntries.slice(-5); // Keep last 5
            return new Map(keepEntries);
          }
          
          return newCache;
        });
        
        // ✅ FALLBACK: Extract categories if categories endpoint failed
        if (allCategories.length === 0) {
          const extractedCategories = [...new Set(formattedServices.map(service => service.category))].sort();
          setAllCategories(extractedCategories);
          console.log('📝 Extracted categories from services:', extractedCategories);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
        setLoading(false);
      }
    };

    // ✅ PERFORMANCE: Only fetch if we don't have the data or cache is stale
    const params = new URLSearchParams();
    if (searchTerm?.trim()) params.append('search', searchTerm.trim());
    if (categoryFilter) params.append('category', categoryFilter);
    params.append('limit', '50');
    params.append('page', '1');
    
    const cacheKey = params.toString();
    const cachedData = servicesCache.get(cacheKey);
    const isStale = !cachedData || Date.now() - cachedData.timestamp > 300000;
    
    if (isStale) {
      // ✅ DEBOUNCING: Wait 500ms after user stops typing for search, immediate for category
      const debounceTime = searchTerm ? 500 : 0;
      const timeoutId = setTimeout(() => {
        if (searchTerm && searchTerm.length > 0) {
          setIsSearching(true);
        }
        fetchServices().finally(() => {
          setIsSearching(false);
        });
      }, debounceTime);

      return () => clearTimeout(timeoutId);
    } else {
      // Use cached data immediately
      console.log('💾 Using fresh cached data for:', cacheKey);
      setRawServices(cachedData.services);
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]); // Removed servicesCache to prevent infinite loops

  // ✅ FIXED: Use all categories instead of only from filtered results
  const categories = allCategories;
  
  // Apply client-side filters
  useEffect(() => {
    const filteredResults = rawServices.filter(service => {
      const matchesPrice = 
        service.price >= priceRange.min && service.price <= priceRange.max;
      const matchesRating = service.rating >= ratingFilter;
      
      return matchesPrice && matchesRating;
    });
    
    setServices(filteredResults);
  }, [rawServices, priceRange.min, priceRange.max, ratingFilter]);
  
  // Check if any filters are currently active
  const isFilteringActive = () => {
    return searchTerm !== '' ||
           categoryFilter !== '' || 
           priceRange.min > 0 || 
           priceRange.max < 1000 || 
           ratingFilter > 0;
  };

  // ✅ Role-aware booking function
  const handleBookNow = (serviceId) => {
    if (userRole !== 'customer') {
      alert('Only customers can book services. Please log in as a customer to book services.');
      return;
    }
    window.location.href = `/book/${serviceId}`;
  };

  // ✅ Provider edit service function
  const handleEditService = (serviceId) => {
    window.location.href = `/provider/services?edit=${serviceId}`;
  };

  // ✅ Provider contact function
  const handleContactProvider = (service) => {
    // Navigate to chat/contact with the provider
    alert(`Contact feature coming soon! You can reach out to ${service.providerName || 'the service provider'} for more information.`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPriceRange({ min: 0, max: 1000 });
    setRatingFilter(0);
  };

  // ✅ RETRY MECHANISM: Allow users to retry failed requests
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    // Trigger refetch by updating a dependency
    setSearchTerm(prev => prev); // This will trigger the useEffect
  };

  // ✅ NEW: Enhanced filter panel using our design system
  const filtersPanel = (
    <Card id="filters" className="shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <Icon name="services" className="text-primary-600 mr-2" />
          <Heading level={3}>Filter Services</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {/* Search Input */}
           <div className="relative">
             <Input
               label="Search Services"
               placeholder="Find your service..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full"
             />
             {isSearching && (
               <div className="absolute right-3 top-9 flex items-center">
                 <Icon name="spinner" size="sm" className="text-primary-500" />
               </div>
             )}
           </div>

                     {/* Category Filter */}
           <div>
             <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
             <select
               value={categoryFilter}
               onChange={(e) => setCategoryFilter(e.target.value)}
               className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
               disabled={categories.length === 0}
             >
               <option value="">
                 {categories.length === 0 ? 'Loading categories...' : 'All Categories'}
               </option>
               {categories.map(category => (
                 <option key={category} value={category}>
                   {category.charAt(0).toUpperCase() + category.slice(1)}
                 </option>
               ))}
             </select>
             {categories.length === 0 && (
               <Text size="tiny" className="text-neutral-500 mt-1">
                 Categories will appear once services are loaded
               </Text>
             )}
           </div>
          
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Price Range</label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                max={priceRange.max}
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                placeholder="Min"
                className="w-full"
              />
              <Text size="small" className="text-neutral-500">to</Text>
              <Input
                type="number"
                min={priceRange.min}
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))}
                placeholder="Max"
                className="w-full"
              />
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Minimum Rating</label>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setRatingFilter(rating)}
                  className={`p-2 rounded-lg transition-colors duration-150 ${
                    ratingFilter === rating 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-neutral-400 hover:text-warning-400 hover:bg-neutral-50'
                  }`}
                >
                  {rating === 0 ? (
                    <Text size="small" className="font-medium">Any</Text>
                  ) : (
                    <Icon name="star" size="sm" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        {isFilteringActive() && (
          <div className="flex justify-end mt-6 pt-6 border-t border-neutral-200">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <Icon name="close" size="xs" className="mr-2" />
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced empty state
  const emptyAction = (
    <div className="text-center space-y-4">
      <Button variant="primary" onClick={resetFilters}>
        <Icon name="close" size="sm" className="mr-2" />
        Reset All Filters
      </Button>
      <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <Icon name="arrowLeft" size="sm" className="mr-2" />
        Back to Top
      </Button>
    </div>
  );

  // ✅ NEW: Service detail modal with enhanced design
  const serviceModal = selectedService && (
    <div 
      className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => setSelectedService(null)} // Close on backdrop click
    >
      <Card 
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on modal content
      >
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Heading level={3}>Service Details</Heading>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedService(null)}
            >
              <Icon name="close" />
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Service Image */}
            <div className="relative">
              <img 
                src={selectedService.image || getDefaultImage(selectedService.category)} 
                alt={selectedService.title} 
                className="w-full h-64 object-cover rounded-lg"
              />
              <Badge 
                variant="primary" 
                className="absolute top-4 right-4 bg-white/90 text-primary-800"
              >
                <Icon name={getServiceIcon(selectedService.category)} size="xs" className="mr-1" />
                {selectedService.category}
              </Badge>
            </div>
            
            {/* Service Info */}
            <div>
              <Heading level={2} className="mb-2">{selectedService.title}</Heading>
              <Text className="text-neutral-600 mb-4">{selectedService.description}</Text>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
                <div>
                  <Text size="small" className="text-neutral-500 mb-1">Service Price</Text>
                  <Text className="font-bold text-neutral-900">
                    ₪{selectedService.price} {selectedService.priceUnit}
                  </Text>
                </div>
                <div>
                  <Text size="small" className="text-neutral-500 mb-1">Provider</Text>
                  <Text className="font-medium text-neutral-900">{selectedService.provider}</Text>
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <Text size="small" className="text-neutral-500 mr-3">Rating:</Text>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i}
                      name={i < Math.floor(selectedService.rating) ? "starFilled" : "star"}
                      size="sm"
                      className={i < Math.floor(selectedService.rating) ? "text-warning-400" : "text-neutral-300"}
                    />
                  ))}
                  <Text size="small" className="text-neutral-600 ml-2">
                    {selectedService.rating.toFixed(1)} ({selectedService.reviewCount} reviews)
                  </Text>
                </div>
              </div>
            </div>
            
            {/* Role-Based Action Button */}
            {userRole === 'customer' && (
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
                onClick={() => {
                  setSelectedService(null);
                  handleBookNow(selectedService._id || selectedService.id);
                }}
              >
                <Icon name="calendar" size="sm" className="mr-2" />
                Book This Service
              </Button>
            )}

            {userRole === 'provider' && currentUser?.uid === selectedService?.providerId && (
              <Button 
                variant="secondary" 
                size="lg"
                className="w-full"
                onClick={() => {
                  setSelectedService(null);
                  handleEditService(selectedService._id || selectedService.id);
                }}
              >
                <Icon name="edit" size="sm" className="mr-2" />
                Edit This Service
              </Button>
            )}

            {userRole === 'provider' && currentUser?.uid !== selectedService?.providerId && (
              <Button 
                variant="outline" 
                size="lg"
                className="w-full"
                onClick={() => {
                  handleContactProvider(selectedService);
                }}
              >
                <Icon name="chat" size="sm" className="mr-2" />
                Contact Provider
              </Button>
            )}

            {!userRole && (
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                <Icon name="user" size="sm" className="mr-2" />
                Login to Book
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Helper function for default images
  const getDefaultImage = (category) => {
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20fill%3D%22%23e9ecef%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23495057%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22150%22%20y%3D%22110%22%3EService%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
  };

  // ✅ NEW: Use ListPageTemplate for consistent layout
  return (
    <>
      {/* ✅ NEW: Guest Welcome Banner */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-6 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Icon name="services" className="w-8 h-8 text-primary-200" />
                <div>
                  <Heading level={3} className="text-white font-semibold">
                    Browse All Services
                  </Heading>
                  <Text className="text-primary-100">
                    Explore our marketplace of trusted professionals. Sign up to book services instantly!
                  </Text>
                </div>
              </div>
              <div className="hidden md:flex space-x-3">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-white text-primary-600 hover:bg-primary-50"
                  onClick={() => window.location.href = '/signup'}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ListPageTemplate
         title="Professional Home Services"
         subtitle="Find and book trusted professionals for all your home service needs"
         description="Browse our comprehensive catalog of verified service providers"
         icon={<Icon name="services" />}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services' }
        ]}
        primaryAction={userRole === 'provider' ? {
          label: 'Add Your Service',
          onClick: () => window.location.href = '/provider/services',
          icon: <Icon name="add" />
        } : null}
        actions={[
          { 
            label: 'Categories',
            variant: 'outline',
            onClick: () => document.getElementById('filters')?.scrollIntoView({ behavior: 'smooth' })
          }
        ]}
        filters={filtersPanel}
        items={services}
                 renderItem={(service, index) => (
           <ServiceCard 
             key={service._id} 
             service={service} 
             index={index}
             onViewDetails={() => setSelectedService(service)}
             onBook={userRole === 'customer' ? () => handleBookNow(service._id || service.id) : null}
             onEdit={userRole === 'provider' && currentUser?.uid === service.providerId ? () => handleEditService(service._id || service.id) : null}
             onContact={userRole === 'provider' && currentUser?.uid !== service.providerId ? () => handleContactProvider(service) : null}
             userRole={userRole}
             currentUserId={currentUser?.uid}
             className="transform hover:scale-105 transition-transform duration-150"
           />
         )}
        layout="grid"
        cols={3}
        loading={loading}
                 error={error ? { 
           message: error,
           action: (
             <Button variant="primary" onClick={retryFetch}>
               <Icon name="arrowRight" size="sm" className="mr-2" />
               Retry
             </Button>
           )
         } : null}
        empty={services.length === 0 && !loading}
        emptyTitle="No services found"
        emptyDescription={
          isFilteringActive() 
            ? "We couldn't find any services matching your current filters. Try adjusting your search criteria or browse our categories."
            : "No services are currently available. Check back later for new offerings."
        }
        emptyAction={emptyAction}
        background="bg-neutral-50"
      />
      
      {/* Service Detail Modal */}
      {serviceModal}
    </>
  );
};

export default ServiceList;
