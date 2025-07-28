import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice, formatCurrency } from '../utils/formatters';

const ProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        // const response = await axios.get(`/api/providers/${providerId}`);
        // setProvider(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          // Find the provider in our mock data
          const foundProvider = mockProviders.find(p => p.id === providerId);
          
          if (foundProvider) {
            setProvider(foundProvider);
          } else {
            setError('Provider not found');
          }
          
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching provider data:', err);
        setError('Failed to load provider data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProviderData();
  }, [providerId]);

  // Mock data for providers
  const mockProviders = [
    {
      id: 'provider123',
      name: 'Naki Babait',
      photo: 'https://randomuser.me/api/portraits/women/68.jpg',
      bio: 'Professional cleaning service with over 10 years of experience. We specialize in residential and commercial cleaning using eco-friendly products.',
      badges: ['Verified', 'Top Rated', 'Eco-Friendly'],
      serviceArea: 'Tel Aviv, Jaffa, Ramat Gan',
      experience: 10,
      contactInfo: {
        email: 'info@nakibabait.co.il',
        phone: '+972-50-123-4567',
        website: 'www.nakibabait.co.il'
      },
      services: [
        {
          id: 's1',
          title: 'House Cleaning',
          description: 'Complete house cleaning service including dusting, vacuuming, mopping, and bathroom sanitizing.',
          price: 300,
          priceUnit: 'per hour',
          rating: 4.8,
          reviewCount: 127
        },
        {
          id: 's2',
          title: 'Office Cleaning',
          description: 'Professional cleaning for offices and commercial spaces.',
          price: 350,
          priceUnit: 'per hour',
          rating: 4.7,
          reviewCount: 89
        },
        {
          id: 's3',
          title: 'Deep Cleaning',
          description: 'Thorough cleaning of all areas including hard-to-reach places, appliances, and detailed sanitizing.',
          price: 400,
          priceUnit: 'per session',
          rating: 4.9,
          reviewCount: 64
        }
      ],
      reviews: [
        {
          id: 'r1',
          user: 'Yael Cohen',
          rating: 5,
          date: '2023-05-15',
          comment: 'Excellent service! My apartment has never been cleaner. Will definitely use again.'
        },
        {
          id: 'r2',
          user: 'Mohammed Abu',
          rating: 4,
          date: '2023-04-22',
          comment: 'Very thorough cleaning. Arrived on time and did a great job.'
        },
        {
          id: 'r3',
          user: 'Sarah Levy',
          rating: 5,
          date: '2023-03-10',
          comment: 'Best cleaning service in Tel Aviv! I highly recommend them for any cleaning needs.'
        }
      ]
    },
    {
      id: 'provider456',
      name: 'Cohen Plumbing Solutions',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Family-owned plumbing business serving the greater Tel Aviv area since 2005. We handle everything from minor repairs to major installations.',
      badges: ['Licensed', 'Insured', '24/7 Service'],
      serviceArea: 'Tel Aviv, Herzliya, Ramat Gan, Givatayim',
      experience: 18,
      contactInfo: {
        email: 'service@cohenplumbing.co.il',
        phone: '+972-52-987-6543',
        website: 'www.cohenplumbing.co.il'
      },
      services: [
        {
          id: 's4',
          title: 'Plumbing Repair',
          description: 'Fix leaks, clogs, and other plumbing issues quickly and efficiently.',
          price: 350,
          priceUnit: 'per hour',
          rating: 4.7,
          reviewCount: 112
        },
        {
          id: 's5',
          title: 'Pipe Installation',
          description: 'Installation of new pipes for renovations or repairs.',
          price: 400,
          priceUnit: 'per hour',
          rating: 4.8,
          reviewCount: 78
        },
        {
          id: 's6',
          title: 'Water Heater Service',
          description: 'Installation, repair, and maintenance of water heaters.',
          price: 450,
          priceUnit: 'per service',
          rating: 4.6,
          reviewCount: 53
        }
      ],
      reviews: [
        {
          id: 'r4',
          user: 'David Mizrahi',
          rating: 5,
          date: '2023-05-20',
          comment: 'Fixed our emergency leak within an hour of calling. Excellent service!'
        },
        {
          id: 'r5',
          user: 'Amir Hassan',
          rating: 4,
          date: '2023-04-15',
          comment: 'Professional and knowledgeable. Slightly expensive but worth it for the quality.'
        },
        {
          id: 'r6',
          user: 'Noa Berger',
          rating: 5,
          date: '2023-03-28',
          comment: 'Very reliable and honest. Explained everything clearly and fixed our problem quickly.'
        }
      ]
    },
    {
      id: 'provider789',
      name: 'Abu Mazen Electrical',
      photo: 'https://randomuser.me/api/portraits/men/67.jpg',
      bio: 'Licensed electrician with expertise in residential and commercial electrical services. Safety and quality are our top priorities.',
      badges: ['Licensed', 'Certified', 'Insured'],
      serviceArea: 'Haifa, Acre, Nazareth',
      experience: 15,
      contactInfo: {
        email: 'info@abumazenelectric.co.il',
        phone: '+972-54-765-4321',
        website: 'www.abumazenelectric.co.il'
      },
      services: [
        {
          id: 's7',
          title: 'Electrical Installation',
          description: 'Installation of outlets, switches, lighting fixtures, and more.',
          price: 400,
          priceUnit: 'per hour',
          rating: 4.9,
          reviewCount: 95
        },
        {
          id: 's8',
          title: 'Electrical Troubleshooting',
          description: 'Diagnose and fix electrical problems in your home or business.',
          price: 350,
          priceUnit: 'per hour',
          rating: 4.8,
          reviewCount: 72
        },
        {
          id: 's9',
          title: 'Panel Upgrades',
          description: 'Upgrade your electrical panel for increased capacity and safety.',
          price: 2500,
          priceUnit: 'per service',
          rating: 4.9,
          reviewCount: 41
        }
      ],
      reviews: [
        {
          id: 'r7',
          user: 'Itay Cohen',
          rating: 5,
          date: '2023-06-02',
          comment: 'Excellent work rewiring our apartment. Very professional and clean.'
        },
        {
          id: 'r8',
          user: 'Fatima Khalil',
          rating: 5,
          date: '2023-05-11',
          comment: 'Fixed our electrical issues quickly and explained everything clearly. Highly recommend!'
        },
        {
          id: 'r9',
          user: 'Moshe Levi',
          rating: 4,
          date: '2023-04-19',
          comment: 'Professional service at a fair price. Would use again.'
        }
      ]
    }
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading provider profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-medium text-gray-900">{error}</h2>
            <div className="mt-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render provider profile
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Provider Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Provider Profile</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Provider Info Section */}
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <img 
                  src={provider.photo} 
                  alt={provider.name} 
                  className="h-32 w-32 rounded-full object-cover border-4 border-primary-100"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{provider.name}</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {provider.experience} years of experience • {provider.serviceArea}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {provider.badges.map((badge, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-gray-700">{provider.bio}</p>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Services Offered</h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {provider.services.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-lg font-medium text-gray-900">{service.title}</h4>
                    <p className="mt-2 text-sm text-gray-500">{service.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(service.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-500">({service.reviewCount})</span>
                      </div>
                      <span className="text-lg font-bold text-primary-600">{formatPrice(service.price, service.priceUnit)}</span>
                    </div>
                    <div className="mt-5">
                      <Link
                        to={`/book/${service.id}`}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
            <div className="mt-6 space-y-6">
              {provider.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-900">{review.user}</p>
                    <span className="mx-2 text-gray-500">•</span>
                    <time className="text-sm text-gray-500">{review.date}</time>
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h4 className="text-sm font-medium text-gray-900">Email</h4>
                    <a href={`mailto:${provider.contactInfo.email}`} className="mt-1 text-sm text-primary-600 hover:text-primary-700">
                      {provider.contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h4 className="text-sm font-medium text-gray-900">Phone</h4>
                    <a href={`tel:${provider.contactInfo.phone}`} className="mt-1 text-sm text-primary-600 hover:text-primary-700">
                      {provider.contactInfo.phone}
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h4 className="text-sm font-medium text-gray-900">Website</h4>
                    <a href={`https://${provider.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-primary-600 hover:text-primary-700">
                      {provider.contactInfo.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
