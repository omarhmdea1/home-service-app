import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        // const response = await axios.get(`/api/services/${id}`);
        // setService(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          // Mock data for development - this would come from your API
          const mockServices = [
            {
              id: "1",
              title: 'House Cleaning',
              description: 'Professional house cleaning services for all room types. Our team ensures a spotless home with eco-friendly products. We handle everything from regular maintenance cleaning to deep cleaning for special occasions. Our trained professionals use high-quality equipment and environmentally friendly cleaning products.',
              price: 300,
              priceUnit: 'per hour',
              category: 'Cleaning',
              rating: 4.8,
              reviewCount: 127,
              image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Naki Babait',
              features: [
                'Eco-friendly cleaning products',
                'Trained and vetted professionals',
                'Flexible scheduling options',
                'Satisfaction guarantee'
              ]
            },
            {
              id: "2",
              title: 'Plumbing Repair',
              description: 'Expert plumbing services for leaks, clogs, installations, and more. Available 24/7 for emergency calls. Our licensed plumbers can handle everything from minor repairs to major installations. We use the latest tools and techniques to ensure your plumbing system works efficiently.',
              price: 350,
              priceUnit: 'per hour',
              category: 'Plumbing',
              rating: 4.7,
              reviewCount: 89,
              image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Cohen Plumbing Solutions',
              features: [
                '24/7 emergency service',
                'Licensed and insured plumbers',
                'Upfront pricing',
                '90-day labor warranty'
              ]
            },
            {
              id: "3",
              title: 'Electrical Installation',
              description: 'Licensed electricians for all your electrical needs. From rewiring to new installations, we handle it all safely. Our team specializes in residential and commercial electrical services, including panel upgrades, lighting installation, and electrical troubleshooting.',
              price: 400,
              priceUnit: 'per hour',
              category: 'Electrical',
              rating: 4.9,
              reviewCount: 64,
              image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Abu Mazen Electrical',
              features: [
                'Licensed electricians',
                'Code-compliant installations',
                'Energy-efficient solutions',
                'Free safety inspections'
              ]
            },
            {
              id: "4",
              title: 'Air Conditioning',
              description: 'Keep your cooling systems running efficiently with our comprehensive maintenance and repair services. Our certified technicians will inspect, clean, and tune up your air conditioning system to ensure optimal performance during hot Israeli summers.',
              price: 450,
              priceUnit: 'per unit',
              category: 'HVAC',
              rating: 4.6,
              reviewCount: 73,
              image: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Kol Kar - Air Conditioning',
              features: [
                'Comprehensive system inspection',
                'Filter replacement',
                'Coil cleaning',
                'Performance testing'
              ]
            },
            {
              id: "5",
              title: 'Interior Painting',
              description: 'Transform your space with our professional painting services. We use premium paints for a lasting finish. Our experienced painters will prep, paint, and clean up, leaving you with beautifully painted rooms that enhance your home\'s appearance.',
              price: 120,
              priceUnit: 'per sqm',
              category: 'Painting',
              rating: 4.8,
              reviewCount: 95,
              image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Tzeva Rishon',
              features: [
                'Premium paint options',
                'Color consultation',
                'Surface preparation',
                'Clean and precise application'
              ]
            },
            {
              id: "6",
              title: 'Furniture Assembly',
              description: 'Expert assembly of all types of furniture. Save time and avoid frustration with our professional service. Our skilled technicians can assemble any type of furniture, from simple shelves to complex bedroom sets.',
              price: 250,
              priceUnit: 'per hour',
              category: 'Handyman',
              rating: 4.4,
              reviewCount: 58,
              image: 'https://images.unsplash.com/photo-1581957500008-417c4fd99ea8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Tachles Handyman',
              features: [
                'Fast and efficient assembly',
                'All tools provided',
                'Furniture placement',
                'Packaging disposal'
              ]
            },
            {
              id: "7",
              title: 'Carpet Cleaning',
              description: 'Deep clean your carpets to remove stains, odors, and allergens. Safe for all carpet types and pets. Our professional carpet cleaning service uses hot water extraction to remove dirt, dust, and allergens from deep within your carpets, leaving them fresh and clean.',
              price: 280,
              priceUnit: 'per room',
              category: 'Cleaning',
              rating: 4.7,
              reviewCount: 83,
              image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Nasreen Cleaning Services',
              features: [
                'Deep extraction cleaning',
                'Stain treatment',
                'Deodorizing',
                'Quick dry technology'
              ]
            },
            {
              id: "8",
              title: 'Gardening Service',
              description: 'Regular garden maintenance to keep your yard looking its best. Services include planting, pruning, and cleanup. Our team of gardening experts will ensure your garden stays healthy and beautiful throughout the year with regular maintenance and seasonal care.',
              price: 200,
              priceUnit: 'per visit',
              category: 'Gardening',
              rating: 4.5,
              reviewCount: 112,
              image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              provider: 'Gan Eden Landscaping',
              features: [
                'Weekly, bi-weekly, or monthly service',
                'Seasonal garden treatments',
                'Environmentally responsible practices',
                'Garden health assessment'
              ]
            }
          ];
          
          const foundService = mockServices.find(service => service.id === id);
          
          if (foundService) {
            setService(foundService);
          } else {
            setError('Service not found');
          }
          
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to fetch service details');
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [id]);
  
  const handleBookNow = () => {
    console.log('Navigating to booking page for service:', id);
    // Use direct navigation with window.location to bypass any potential React Router issues
    window.location.href = `/book/${id}`;
  };
  
  // Format price with unit
  const formatPrice = (price, unit) => {
    return `₪${price}${unit ? ` ${unit}` : ''}`;
  };
  
  // Render star ratings
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {hasHalfStar && (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Service Not Found</h2>
            <p className="mt-2 text-gray-600">We couldn't find the service you're looking for.</p>
            <div className="mt-6">
              <Link 
                to="/services" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Browse All Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Services link at top for better visibility */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Link 
            to="/services" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Services
          </Link>
        </div>
      </div>
      
      {/* Hero Section with Service Image - Improved with better overlay and readability */}
      <div className="relative h-72 md:h-96 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={service.image} 
            alt={service.title}
            className="w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl">
              <div className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-3 shadow-md">
                {service.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-md">{service.title}</h1>
              <div className="flex flex-wrap items-center text-white gap-y-2">
                <div className="flex items-center bg-gray-900/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  {renderRating(service.rating)}
                  <span className="ml-2 text-sm font-medium">{service.rating} ({service.reviewCount} reviews)</span>
                </div>
                <span className="mx-3 hidden md:inline">•</span>
                <span className="flex items-center bg-gray-900/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Provided by {service.provider}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-24">  {/* Further increased spacing */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 md:p-10">  {/* Increased padding */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">  {/* Increased spacing */}
                <div className="mb-6 md:mb-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Details</h2>
                  <p className="text-gray-600 text-lg">Everything you need to know about this service</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="text-center sm:text-left sm:mr-4 sm:pr-4 sm:border-r sm:border-gray-200">
                    <span className="block text-sm text-gray-500 mb-1">Price</span>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(service.price, service.priceUnit)}</span>
                  </div>
                  <button
                    onClick={handleBookNow}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 shadow-md w-full sm:w-auto hover:scale-105"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Now
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-10">  {/* Increased spacing */}
                <h3 className="text-xl font-semibold text-gray-900 mb-5">Description</h3>  {/* Increased spacing */}
                <p className="text-gray-700 text-lg leading-relaxed mb-10">{service.description}</p>  {/* Increased spacing */}
                
                <h3 className="text-xl font-semibold text-gray-900 mb-5">Features</h3>  {/* Increased spacing */}
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">  {/* Increased spacing and gap */}
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-100 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <div className="bg-primary-100 p-2 rounded-full mr-4 flex-shrink-0">
                        <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-5">About the Provider</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-5">  {/* Increased spacing */}
                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl border-2 border-primary-200 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105">
                      {service.provider.charAt(0)}{service.provider.split(' ')[1]?.charAt(0) || ''}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg mb-2">{service.provider}</h4>
                      <div className="flex items-center">
                        {renderRating(service.rating)}
                        <span className="ml-2 text-sm text-gray-600">{service.rating} ({service.reviewCount} reviews)</span>
                      </div>
                      <button className="mt-3 text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center bg-white px-3 py-1.5 rounded-md border border-primary-100 hover:border-primary-300 transition-colors shadow-sm">
                        View full profile
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    A trusted provider on our platform with a proven track record of quality service and customer satisfaction. All our providers undergo thorough background checks and training verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex flex-col sm:flex-row justify-between gap-6">  {/* Increased spacing */}
            <button
              onClick={handleBookNow}
              className="order-2 sm:order-1 flex-1 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.03] shadow-md text-center font-medium"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book This Service Now
              </span>
            </button>
            
            <Link 
              to="/services" 
              className="order-1 sm:order-2 py-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300 text-center font-medium flex-1 flex items-center justify-center group shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Browsing Services
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer Spacing */}
      <div className="py-12"></div>
    </div>
  );
};

export default ServiceDetail;
