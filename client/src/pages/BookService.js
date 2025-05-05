import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getServiceById } from '../services/serviceService';
import { createBooking } from '../services/bookingService';

const BookService = () => {
  console.log('BookService component rendering');
  const { serviceId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: new Date(),
    timeSlot: '',
    address: '',
    notes: ''
  });
  
  // Available time slots
  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
    '04:00 PM', '05:00 PM', '06:00 PM'
  ];
  
  // Debug information
  useEffect(() => {
    console.log('BookService component mounted');
    console.log('Service ID from URL:', serviceId);
    console.log('Current User:', currentUser?.email);
  }, [serviceId, currentUser]);
  
  // Redirect if not logged in
  useEffect(() => {
    console.log('Checking authentication:', { currentUser: !!currentUser, serviceId });
    if (!currentUser) {
      console.log('User not logged in, redirecting to login');
      // Save the service ID to session storage to redirect back after login
      sessionStorage.setItem('pendingBookingServiceId', serviceId);
      navigate('/login', { state: { from: `/book/${serviceId}`, message: 'Please log in to book a service.' } });
    } else {
      console.log('User is authenticated, proceeding with booking');
    }
  }, [currentUser, navigate, serviceId]);

  // Fetch service details
  useEffect(() => {
    console.log('Fetching service details for ID:', serviceId);
    setLoading(true);
    
    const fetchServiceDetails = async () => {
      try {
        // Try to get the service from Firebase
        console.log('Attempting to fetch service from Firebase');
        let serviceData = null;
        
        try {
          // Try to get from Firebase first
          serviceData = await getServiceById(serviceId);
          console.log('Service data from Firebase:', serviceData);
        } catch (firebaseError) {
          console.log('Firebase fetch failed, will use mock data');
        }
        
        if (serviceData) {
          setService(serviceData);
        } else {
          // If not found in Firebase, use mock data based on ID
          console.log('Service not found in Firebase, using mock data');
          
          // Mock data for development purposes
          const mockServices = {
            "1": {
              id: "1",
              title: 'House Cleaning',
              description: 'Professional house cleaning services for all room types. Our team ensures a spotless home with eco-friendly products.',
              provider: {
                id: 'provider123',
                name: 'Naki Babait',
                rating: 4.8,
                reviews: 127
              },
              price: 300,
              priceUnit: 'hour',
              image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            "2": {
              id: "2",
              title: 'Plumbing Repair',
              description: 'Expert plumbing services for leaks, clogs, installations, and more. Available 24/7 for emergency calls.',
              provider: {
                id: 'provider456',
                name: 'Cohen Plumbing Solutions',
                rating: 4.7,
                reviews: 89
              },
              price: 350,
              priceUnit: 'hour',
              image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            "3": {
              id: "3",
              title: 'Electrical Installation',
              description: 'Licensed electricians for all your electrical needs. From rewiring to new installations, we handle it all safely.',
              provider: {
                id: 'provider789',
                name: 'Abu Mazen Electrical',
                rating: 4.9,
                reviews: 64
              },
              price: 400,
              priceUnit: 'hour',
              image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            "4": {
              id: "4",
              title: 'Air Conditioning',
              description: 'Keep your cooling systems running efficiently with our comprehensive maintenance and repair services.',
              provider: {
                id: 'provider101',
                name: 'Kol Kar - Air Conditioning',
                rating: 4.6,
                reviews: 73
              },
              price: 450,
              priceUnit: 'unit',
              image: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            "5": {
              id: "5",
              title: 'Interior Painting',
              description: 'Transform your space with our professional painting services. We use premium paints for a lasting finish.',
              provider: {
                id: 'provider202',
                name: 'Tzeva Rishon',
                rating: 4.8,
                reviews: 95
              },
              price: 120,
              priceUnit: 'sqm',
              image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            "6": {
              id: "6",
              title: 'Furniture Assembly',
              description: 'Expert assembly of all types of furniture. Save time and avoid frustration with our professional service.',
              provider: {
                id: 'provider303',
                name: 'Tachles Handyman',
                rating: 4.4,
                reviews: 58
              },
              price: 250,
              priceUnit: 'hour',
              image: 'https://images.unsplash.com/photo-1581957500008-417c4fd99ea8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            }
          };
          
          const mockService = mockServices[serviceId] || {
            id: serviceId || '123',
            title: 'Professional Service',
            description: 'Expert services for all your home needs. We handle everything from minor repairs to major installations.',
            provider: {
              id: 'provider123',
              name: 'Home Services Pro',
              rating: 4.8,
              reviews: 127
            },
            price: 85,
            priceUnit: 'hour',
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80'
          };
          
          setService(mockService);
          console.log('Using mock service:', mockService);
        }
      } catch (error) {
        console.error('Error in service fetching process:', error);
        setError('Failed to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [serviceId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });
  };
  
  const handleDateChange = (date) => {
    setBookingData({
      ...bookingData,
      date
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!bookingData.timeSlot) {
      setError('Please select a time slot');
      return;
    }
    
    if (!bookingData.address.trim()) {
      setError('Please enter your address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format the booking data for Firebase
      const formattedDate = bookingData.date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const bookingDetails = {
        userId: currentUser.uid,
        serviceId: service.id,
        providerId: service.provider?.id || 'provider123', // Fallback for mock data
        date: formattedDate,
        time: bookingData.timeSlot,
        address: bookingData.address,
        notes: bookingData.notes,
        serviceName: service.title,
        serviceImage: service.image,
        servicePrice: service.price,
        servicePriceUnit: service.priceUnit,
        providerName: service.provider?.name || 'Service Provider',
        providerAvatar: service.provider?.avatar,
        providerRating: service.provider?.rating,
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Customer',
        status: 'pending', // Initial status is pending
        paymentStatus: 'unpaid'
      };
      
      // Create booking in Firebase
      const createdBooking = await createBooking(bookingDetails);
      console.log('Booking created successfully:', createdBooking);
      
      // Set success state with booking ID for navigation
      setLoading(false);
      setBookingConfirmed(true);
      
      // Store the booking ID for navigation when user clicks a button
      sessionStorage.setItem('lastBookingId', createdBooking.id);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
      setLoading(false);
    }
  };
  
  // Show loading state
  if (loading && !bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render booking confirmed state
  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your booking request has been successfully submitted and is pending confirmation from the service provider.
                You will be redirected to your bookings page in a moment...
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/bookings"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate directly without setting success message
                    window.location.href = '/bookings';
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  View My Bookings
                </a>
                <Link
                  to="/services"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Browse More Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/services" className="inline-flex items-center text-primary-600 hover:text-primary-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Services
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Service Summary */}
              <div className="md:w-2/5 bg-gray-100">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h2>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Provider</span>
                    <div className="flex items-center">
                      <span className="font-medium">{service.provider.name}</span>
                      <div className="ml-2 flex items-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-gray-700">{service.provider.rating}</span>
                        <span className="ml-1 text-gray-500">({service.provider.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <div className="font-bold text-xl text-primary-600">
                      ${service.price}<span className="text-sm font-normal text-gray-500">/{service.priceUnit}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Booking Form */}
              <div className="md:w-3/5 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Service</h2>
                
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <DatePicker
                      selected={bookingData.date}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time Slot
                    </label>
                    <select
                      name="timeSlot"
                      value={bookingData.timeSlot}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={bookingData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full address"
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any special instructions or notes for the service provider..."
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span>Service Rate</span>
                        <span>₪{service.price}/{service.priceUnit}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Booking Fee</span>
                        <span>₪20.00</span>
                      </div>
                      <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold">
                        <span>Total Due Now</span>
                        <span>₪{service.price + 20}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * Final charges may vary based on the actual duration and any additional services requested.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
