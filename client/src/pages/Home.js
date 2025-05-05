import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};



// Main Home component
const Home = () => {
  const { currentUser } = useAuth();
  
  return (
    <div>
      {currentUser ? <UserDashboard /> : <VisitorHomepage />}
    </div>
  );
};

// Visitor Homepage (Not Logged In)
const VisitorHomepage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      setIsRedirecting(true);
      // Redirect to services page with search parameters
      window.location.href = `/services?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory)}`;
    }
  };
  
  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <div className="bg-gray-50">
      {/* Hero Section with Search Bar */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <motion.h1 
                  className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <span className="block xl:inline">Home services,</span>{' '}
                  <span className="block text-primary-600 xl:inline">delivered to your door</span>
                </motion.h1>
                <motion.p 
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  custom={1}
                >
                  Book trusted professionals for your home service needs. From cleaning to repairs, we've got you covered with top-rated service providers in your area.
                </motion.p>

                {/* Search Bar */}
                <motion.div 
                  className="mt-8 sm:mx-auto sm:max-w-lg lg:mx-0"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  custom={2}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-full"
                        placeholder="Search for services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                    <div className="relative">
                      <select
                        className="h-full py-3 pl-3 pr-7 border border-gray-300 bg-gray-50 text-gray-500 sm:text-sm rounded-full focus:ring-primary-500 focus:border-primary-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option>All Categories</option>
                        <option>Cleaning</option>
                        <option>Plumbing</option>
                        <option>Electrical</option>
                        <option>Gardening</option>
                        <option>Moving</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ease-in-out"
                      onClick={handleSearch}
                      disabled={isRedirecting}
                    >
                      {isRedirecting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching
                        </>
                      ) : (
                        <>
                          <svg className="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  custom={3}
                >
                  <div className="rounded-md shadow">
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/services"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      Browse Services
                    </Link>
                  </div>
                </motion.div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Home service professional"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
            {['All Services', 'Cleaning', 'Repair & Maintenance', 'Outdoor & Gardening', 'Moving & Assembly', 'Specialized Services'].map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${index === 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Services Section */}
      <PopularServicesSection />
      {/* Featured Providers Section */}
      <FeaturedProvidersSection />
      {/* How It Works Section */}
      <HowItWorksSection />
      {/* Testimonials Section */}
      <TestimonialsSection />
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <motion.div 
      className="relative bg-white overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="relative pt-6 px-4 sm:px-6 lg:px-8"></div>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Find Trusted Home Services</span>
                <span className="block text-primary-600">Near You</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Book cleaners, electricians, and more in minutes.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/services"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                  >
                    Become a Provider
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Home service professional"
        />
      </div>
    </motion.div>
  );
};

// Popular Services Section Component
const PopularServicesSection = () => {
  // Sample service data
  const services = [
    {
      id: 1,
      name: 'House Cleaning',
      price: 300,
      duration: '3h session',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 2,
      name: 'Plumbing',
      price: 350,
      duration: '1h session',
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 3,
      name: 'Electrical',
      price: 400,
      duration: '1h session',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 4,
      name: 'Air Conditioning',
      price: 450,
      duration: 'Per unit',
      image: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 5,
      name: 'Painting',
      price: 120,
      duration: 'Per sqm',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 6,
      name: 'Furniture Assembly',
      price: 250,
      duration: 'Per hour',
      image: 'https://images.unsplash.com/photo-1581957500008-417c4fd99ea8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  return (
    <motion.div 
      className="py-16 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Popular Services</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Browse our most requested services and find the help you need.
          </p>
        </div>

        <div className="mt-12">
          {/* Desktop view: Grid layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -5 }}
                variants={fadeIn}
              >
                <div className="h-48 w-full relative">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-primary-600 font-semibold">From ₪{service.price}</p>
                    <span className="text-sm text-gray-500">{service.duration}</span>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/services/${service.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Book now →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile view: Horizontal scroll */}
          <div className="sm:hidden">
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  className="flex-shrink-0 w-64 bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                  variants={fadeIn}
                >
                  <div className="h-40 w-full relative">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-primary-600 font-semibold">From ₪{service.price}</p>
                      <span className="text-sm text-gray-500">{service.duration}</span>
                    </div>
                    <div className="mt-3">
                      <Link
                        to={`/services/${service.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Book now →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              View all services
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
// Featured Providers Section Component
const FeaturedProvidersSection = () => {
  // Sample provider data
  const providers = [
    {
      id: 1,
      name: 'John Smith',
      specialty: 'Plumbing',
      rating: 4.9,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      specialty: 'House Cleaning',
      rating: 4.8,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 3,
      name: 'Michael Chen',
      specialty: 'Electrical',
      rating: 5.0,
      reviews: 87,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      specialty: 'Gardening',
      rating: 4.7,
      reviews: 65,
      image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  return (
    <motion.div 
      className="py-16 bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Featured Providers</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our top-rated professionals ready to help with your home service needs.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
              variants={fadeIn}
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                <p className="text-primary-600 font-medium mt-1">{provider.specialty}</p>
                <div className="mt-2 flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 ${i < Math.floor(provider.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-600">{provider.rating} ({provider.reviews} reviews)</p>
                </div>
                <div className="mt-4 w-full">
                  <Link
                    to={`/providers/${provider.id}`}
                    className="block w-full text-center px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors duration-300"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/providers"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            View all providers
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
// How It Works Section Component
const HowItWorksSection = () => {
  // Steps data
  const steps = [
    {
      id: 1,
      title: 'Browse Services',
      description: 'Explore our wide range of home services to find exactly what you need.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Choose a Provider',
      description: 'Select from our vetted, top-rated service professionals based on reviews and ratings.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Book an Appointment',
      description: 'Schedule a convenient time for your service with our easy booking system.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Enjoy Quality Service',
      description: 'Sit back and relax while our professionals take care of your home needs.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  return (
    <motion.div 
      className="py-16 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Get your home services done in four simple steps.
          </p>
        </div>

        <div className="mt-16">
          {/* Desktop view with connecting lines */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8 relative">
            {/* Connecting line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gray-200" style={{ width: '75%', left: '12.5%' }}></div>
            
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className="relative flex flex-col items-center text-center"
                variants={fadeIn}
                custom={step.id}
              >
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary-100 text-primary-600 mb-6 relative z-10">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{step.title}</h3>
                <p className="text-base text-gray-500">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Mobile and tablet view */}
          <div className="lg:hidden space-y-10">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className="flex items-start"
                variants={fadeIn}
                custom={step.id}
              >
                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mr-4 relative">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white h-6 w-6 rounded-full flex items-center justify-center font-bold text-sm">
                    {step.id}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-base text-gray-500">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
// Testimonials Section Component
const TestimonialsSection = () => {
  // Sample testimonial data
  const testimonials = [
    {
      id: 1,
      name: 'Alex Thompson',
      role: 'Homeowner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      content: 'The service was exceptional! The cleaner arrived on time and did a thorough job. My home has never looked better. I\'ve already booked my next appointment.',
      service: 'House Cleaning'
    },
    {
      id: 2,
      name: 'Marcus Wilson',
      role: 'Apartment Resident',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      content: 'I had an electrical issue that needed urgent attention. The electrician arrived within an hour of booking and fixed the problem efficiently. Highly recommend!',
      service: 'Electrical Repair'
    },
    {
      id: 3,
      name: 'Sophia Garcia',
      role: 'Business Owner',
      image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      content: 'We\'ve been using this platform for all our office maintenance needs. The quality of service and reliability of the providers has been consistently excellent.',
      service: 'Commercial Maintenance'
    }
  ];

  return (
    <motion.div 
      className="py-16 bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Don't just take our word for it — hear from some of our satisfied customers.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                whileHover={{ y: -5 }}
                variants={fadeIn}
              >
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-primary-600 font-medium">{testimonial.service}</p>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/testimonials"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Read more testimonials
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">HomeServices</h3>
            <p className="text-gray-300 mb-4">
              Connecting you with trusted professionals for all your home service needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Services</Link></li>
              <li><Link to="/providers" className="text-gray-300 hover:text-white">Providers</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services/cleaning" className="text-gray-300 hover:text-white">Cleaning</Link></li>
              <li><Link to="/services/plumbing" className="text-gray-300 hover:text-white">Plumbing</Link></li>
              <li><Link to="/services/electrical" className="text-gray-300 hover:text-white">Electrical</Link></li>
              <li><Link to="/services/gardening" className="text-gray-300 hover:text-white">Gardening</Link></li>
              <li><Link to="/services/painting" className="text-gray-300 hover:text-white">Painting</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Main Street, City, Country</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@homeservices.com</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-center">
            &copy; {new Date().getFullYear()} HomeServices. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// User Dashboard Component (Logged In Users)
const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      setIsRedirecting(true);
      // Redirect to services page with search parameter
      window.location.href = `/services?search=${encodeURIComponent(searchTerm)}`;
    }
  };
  
  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Sample recommended services data
  const recommendedServices = [
    {
      id: 1,
      name: 'Deep House Cleaning',
      price: 80,
      duration: '3h session',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'cleaning'
    },
    {
      id: 2,
      name: 'Emergency Plumbing',
      price: 95,
      duration: 'Per hour',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'repair'
    },
    {
      id: 3,
      name: 'Lawn Mowing & Trimming',
      price: 60,
      duration: 'Per session',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'outdoor'
    }
  ];

  // Sample recent bookings data
  const recentBookings = [
    {
      id: 1,
      serviceName: 'House Cleaning',
      providerName: 'Sarah Johnson',
      date: '2025-05-10',
      time: '10:00 AM',
      status: 'upcoming'
    },
    {
      id: 2,
      serviceName: 'Plumbing Repair',
      providerName: 'John Smith',
      date: '2025-04-28',
      time: '2:30 PM',
      status: 'completed'
    }
  ];

  // Service categories
  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'repair', name: 'Repair & Maintenance' },
    { id: 'outdoor', name: 'Outdoor & Gardening' },
    { id: 'moving', name: 'Moving & Assembly' },
    { id: 'specialized', name: 'Specialized Services' }
  ];

  // Filter services by category
  const filteredServices = activeCategory === 'all' 
    ? recommendedServices 
    : recommendedServices.filter(service => service.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {currentUser.email?.split('@')[0] || 'User'}!</h1>
              <p className="mt-1 text-primary-100">Find and book the services you need.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/bookings" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
              >
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-12 py-4 sm:text-lg border-gray-300 rounded-md"
              placeholder="Search for services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700"
                onClick={handleSearch}
                disabled={isRedirecting}
              >
                {isRedirecting ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeCategory === category.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Services */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
            <Link to="/services" className="text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map(service => (
              <motion.div
                key={service.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                whileHover={{ y: -5 }}
                variants={fadeIn}
              >
                <div className="h-48 w-full relative">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium text-primary-600">
                    ★ {service.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-primary-600 font-semibold">From ₪{service.price}</p>
                    <span className="text-sm text-gray-500">{service.duration}</span>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 w-full justify-center"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Recent Bookings</h2>
            <Link to="/bookings" className="text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {recentBookings.map(booking => (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1 flex items-center">
                            <div>
                              <p className="text-sm font-medium text-primary-600 truncate">{booking.serviceName}</p>
                              <p className="mt-1 flex items-center text-sm text-gray-500">
                                <span>Provider: {booking.providerName}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex-shrink-0 flex flex-col items-end">
                          <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                          <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <p className="text-gray-500">You don't have any recent bookings.</p>
              <Link to="/services" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                Book a Service
              </Link>
            </div>
          )}
        </div>

        {/* Promotions section removed as requested */}
      </div>
    </div>
  );
};

export default Home;
