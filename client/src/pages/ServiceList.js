import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthProvider';

const ServiceList = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  const [sortBy, setSortBy] = useState('default'); // default, price-low, price-high, rating
  
  // Booking states
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Fetch services from the server
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, this would fetch from your API
        // For now, we'll use mock data
        // const response = await axios.get('/api/services');
        // setServices(response.data);
        
        // Mock data for development
        const mockServices = [
          {
            id: 1,
            title: 'House Cleaning',
            description: 'Professional house cleaning services for all room types. Our team ensures a spotless home with eco-friendly products.',
            price: 300,
            priceUnit: 'per hour',
            category: 'Cleaning',
            rating: 4.8,
            reviewCount: 127,
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Naki Babait'
          },
          {
            id: 2,
            title: 'Plumbing Repair',
            description: 'Expert plumbing services for leaks, clogs, installations, and more. Available 24/7 for emergency calls.',
            price: 350,
            priceUnit: 'per hour',
            category: 'Plumbing',
            rating: 4.7,
            reviewCount: 89,
            image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Cohen Plumbing Solutions'
          },
          {
            id: 3,
            title: 'Electrical Installation',
            description: 'Licensed electricians for all your electrical needs. From rewiring to new installations, we handle it all safely.',
            price: 400,
            priceUnit: 'per hour',
            category: 'Electrical',
            rating: 4.9,
            reviewCount: 64,
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Abu Mazen Electrical'
          },
          {
            id: 4,
            title: 'Gardening Service',
            description: 'Regular garden maintenance to keep your yard looking its best. Services include planting, pruning, and cleanup.',
            price: 200,
            priceUnit: 'per visit',
            category: 'Gardening',
            rating: 4.5,
            reviewCount: 112,
            image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Gan Eden Landscaping'
          },
          {
            id: 5,
            title: 'Air Conditioning Service',
            description: 'Keep your cooling systems running efficiently with our comprehensive maintenance and repair services.',
            price: 450,
            priceUnit: 'per visit',
            category: 'HVAC',
            rating: 4.6,
            reviewCount: 73,
            image: 'https://images.unsplash.com/photo-1581275288578-bfb01a800c59?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Kol Kar - Air Conditioning'
          },
          {
            id: 6,
            title: 'Interior Painting',
            description: 'Transform your space with our professional painting services. We use premium paints for a lasting finish.',
            price: 120,
            priceUnit: 'per sqm',
            category: 'Painting',
            rating: 4.8,
            reviewCount: 95,
            image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Tzeva Rishon'
          },
          {
            id: 7,
            title: 'Carpet Cleaning',
            description: 'Deep clean your carpets to remove stains, odors, and allergens. Safe for all carpet types and pets.',
            price: 280,
            priceUnit: 'per room',
            category: 'Cleaning',
            rating: 4.7,
            reviewCount: 83,
            image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Nasreen Cleaning Services'
          },
          {
            id: 8,
            title: 'Furniture Assembly',
            description: 'Expert assembly of all types of furniture. Save time and avoid frustration with our professional service.',
            price: 250,
            priceUnit: 'per hour',
            category: 'Handyman',
            rating: 4.4,
            reviewCount: 58,
            image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            provider: 'Tachles Handyman'
          }
        ];
        
        setServices(mockServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get unique categories for the filter dropdown
  const categories = [...new Set(services.map(service => service.category))].sort();
  
  // Apply all filters
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm ? (
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
      
    const matchesCategory = categoryFilter === '' || service.category === categoryFilter;
    
    const matchesPrice = 
      service.price >= priceRange.min && service.price <= priceRange.max;
      
    const matchesRating = service.rating >= ratingFilter;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });
  
  // Sort filtered services
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0; // Keep original order
    }
  });

  const handleViewService = (service) => {
    setSelectedService(service);
  };
  
  const handleBookNow = (serviceId) => {
    // Navigate to the booking page for this service
    window.location.href = `/book/${serviceId}`;
  };

  const handleBooking = async () => {
    if (!currentUser) {
      alert('Please log in to book a service.');
      return;
    }
    
    if (!selectedService || !bookingDate || !bookingTime) {
      alert('Please select a service, date, and time.');
      return;
    }
    
    try {
      // In a real app, this would send to your API
      // await axios.post('/api/bookings', {
      //   serviceId: selectedService.id,
      //   userId: currentUser.uid,
      //   date: bookingDate,
      //   time: bookingTime
      // });
      
      // For now, just simulate a successful booking
      setTimeout(() => {
        alert('Booking request submitted successfully!');
        setSelectedService(null);
        setBookingDate('');
        setBookingTime('');
      }, 1000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking request.');
    }
  };
  
  // Handle price range changes
  const handlePriceRangeChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };
  
  // Format price with unit
  const formatPrice = (price, unit) => {
    return `₪${price} ${unit}`;
  };
  
  // Render star ratings
  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-600 text-sm">
          {rating.toFixed(1)} ({filteredServices.find(s => s.id === selectedService?.id)?.reviewCount || 0})
        </span>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="small-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#small-grid)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-3">Professional Home Services</h1>
          <p className="text-xl mb-6 max-w-2xl">Find and book trusted professionals for all your home service needs.</p>
          
          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <input
              type="text"
              placeholder="Search for a service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full shadow-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 border-2 border-transparent hover:border-white/20 focus:border-white/30"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Spacer between hero and filters */}
      <div className="py-8"></div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Filter Section */}
        <div className="mb-12 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-primary-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-300 transition-colors cursor-pointer bg-white shadow-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max={priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors shadow-sm"
                  placeholder="Min"
                />
                <span className="text-gray-500 font-medium px-2">to</span>
                <input
                  type="number"
                  min={priceRange.min}
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors shadow-sm"
                  placeholder="Max"
                />
              </div>
            </div>
            
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <div className="flex items-center space-x-1">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setRatingFilter(rating)}
                    className={`p-1 ${ratingFilter === rating ? 'text-yellow-500' : 'text-gray-400'}`}
                  >
                    {rating === 0 ? (
                      <span className="text-sm font-medium">Any</span>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setPriceRange({ min: 0, max: 1000 });
                  setRatingFilter(0);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Count and Sort */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Available Services
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found)
            </span>
          </h2>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-300 transition-colors cursor-pointer bg-white shadow-sm text-sm"
            >
              <option value="default">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Services Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.map(service => (
              <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] border border-gray-100">
                <div className="relative">
                  <img 
                    src={service.image || 'https://via.placeholder.com/300x200'} 
                    alt={service.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-white bg-opacity-90 rounded-full text-xs font-semibold text-primary-800 shadow-sm border border-primary-100">
                    {service.category}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                <div className="p-5">
                  <div className="mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.provider}</p>
                  </div>
                  
                  {/* Rating */}
                  <div className="mb-3">
                    {renderRating(service.rating)}
                  </div>
                  
                  <p className="text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                  <div className="mb-3">
                    <Link 
                      to={`/services/${service.id}`}
                      className="text-primary-600 text-sm font-medium hover:text-primary-800 transition-colors focus:outline-none flex items-center"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(service.price, service.priceUnit)}
                    </p>
                    <button 
                      onClick={() => handleBookNow(service.id)}
                      className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* No Results */}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="bg-primary-50 mx-auto w-24 h-24 flex items-center justify-center rounded-full mb-4">
              <svg className="h-12 w-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No services found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">We couldn't find any services matching your current filters. Try adjusting your search criteria or browse our categories.</p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setPriceRange({ min: 0, max: 1000 });
                  setRatingFilter(0);
                  setSortBy('default');
                }}
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All Filters
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Top
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Service Detail Modal - Only shows details, booking is now on a separate page */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
              <button 
                onClick={() => setSelectedService(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <img 
                src={selectedService.image} 
                alt={selectedService.title} 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h4 className="text-xl font-semibold mb-2">{selectedService.title}</h4>
              <p className="text-gray-600 mb-4">{selectedService.description}</p>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="text-sm text-gray-500">Service Price</p>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(selectedService.price, selectedService.priceUnit)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="text-gray-900">{selectedService.provider}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-500 mr-2">Rating:</span>
                <div className="flex items-center">
                  {renderRating(selectedService.rating)}
                  <span className="ml-1 text-gray-700">{selectedService.rating}</span>
                  <span className="ml-1 text-gray-500">({selectedService.reviewCount} reviews)</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedService(null);
                  handleBookNow(selectedService.id);
                }}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Book This Service
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Spacing */}
      <div className="py-12 bg-gray-50"></div>
    </div>
  );
};

export default ServiceList;
