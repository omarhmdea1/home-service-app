import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BookService = () => {
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
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      // Save the service ID to session storage to redirect back after login
      sessionStorage.setItem('pendingBookingServiceId', serviceId);
      navigate('/login', { state: { from: `/book/${serviceId}`, message: 'Please log in to book a service.' } });
    }
  }, [currentUser, navigate, serviceId]);
  
  // Fetch service details
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      // Simulated API call to fetch service details
      setTimeout(() => {
        // This would be replaced with a real API call
        const mockService = {
          id: serviceId,
          title: 'Professional Plumbing Service',
          description: 'Expert plumbing services for all your home needs. We handle everything from minor repairs to major installations.',
          provider: {
            name: 'Mike\'s Plumbing',
            rating: 4.8,
            reviews: 127
          },
          price: 85,
          priceUnit: 'hour',
          image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80'
        };
        
        setService(mockService);
        setLoading(false);
      }, 1000);
    }
  }, [currentUser, serviceId]);
  
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
  
  const handleSubmit = (e) => {
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
    
    // Simulated API call to create booking
    setTimeout(() => {
      // This would be replaced with a real API call
      // POST /api/bookings with { userId: currentUser.uid, serviceId, ...bookingData }
      
      const bookingDetails = {
        id: 'bk' + Math.random().toString(36).substr(2, 9),
        service,
        user: {
          id: currentUser.uid,
          email: currentUser.email
        },
        ...bookingData,
        status: 'pending', // Initial status is pending, will be confirmed by service provider
        createdAt: new Date().toISOString()
      };
      
      setLoading(false);
      setBookingConfirmed(true);
      
      // In a real app, you would store this in your database
      console.log('Booking created:', bookingDetails);
    }, 1500);
  };
  
  // Show loading state
  if (loading && !bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Show booking confirmation
  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary-600 text-white p-6 text-center">
              <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-2xl font-bold">Booking Submitted!</h2>
              <p className="mt-2">Your service booking request has been successfully submitted.</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Booking Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{service.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="font-medium">{service.provider.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{bookingData.date.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{bookingData.timeSlot}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{bookingData.address}</p>
                    </div>
                    {bookingData.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="font-medium">{bookingData.notes}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                        <span className="ml-2 text-sm text-gray-500">Waiting for service provider confirmation</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>You'll receive a confirmation email shortly.</li>
                  <li>The service provider will review your request and confirm or reschedule.</li>
                  <li>Once confirmed, the status will change from <strong>Pending</strong> to <strong>Confirmed</strong>.</li>
                  <li>You can view or manage this booking in your dashboard.</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/bookings" 
                  className="flex-1 px-6 py-3 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View My Bookings
                </Link>
                <Link 
                  to="/" 
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </motion.div>
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
                        <span>${service.price}/{service.priceUnit}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Booking Fee</span>
                        <span>$5.00</span>
                      </div>
                      <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold">
                        <span>Total Due Now</span>
                        <span>${service.price + 5}</span>
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
