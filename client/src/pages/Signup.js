import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // Default role is customer
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Form validation errors
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // Provider-specific fields
  const [serviceArea, setServiceArea] = useState('');
  const [providerDescription, setProviderDescription] = useState('');
  const [serviceAreaError, setServiceAreaError] = useState('');
  const [providerDescriptionError, setProviderDescriptionError] = useState('');
  
  // Show provider fields
  const [showProviderFields, setShowProviderFields] = useState(false);
  
  const { signup, currentUser, signInWithGoogle, emailVerified, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { from } = location.state || { from: '/' };

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(from);
    }
  }, [currentUser, navigate, from]);
  
  // Toggle provider fields visibility when role changes
  useEffect(() => {
    setShowProviderFields(role === 'provider');
  }, [role]);

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    
    // Reset all error messages
    setEmailError('');
    setNameError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setPhoneError('');
    setServiceAreaError('');
    setProviderDescriptionError('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    // Validate phone (optional)
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    }
    
    // Validate provider-specific fields if role is provider
    if (role === 'provider') {
      if (!serviceArea.trim()) {
        setServiceAreaError('Service area is required for providers');
        isValid = false;
      }
      
      if (!providerDescription.trim()) {
        setProviderDescriptionError('Please provide a description of your services');
        isValid = false;
      } else if (providerDescription.length < 20) {
        setProviderDescriptionError('Description should be at least 20 characters');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setVerificationSent(false);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Create user profile data
      const userData = {
        name,
        role,
        phone,
      };
      
      // Add provider-specific fields if role is provider
      if (role === 'provider') {
        userData.serviceArea = serviceArea;
        userData.providerDescription = providerDescription;
        userData.isVerified = false; // Providers need verification
      } else {
        userData.isVerified = true; // Customers are auto-verified
      }
      
      // Sign up with Firebase and create Firestore profile
      await signup(email, password, userData);
      
      setSuccess(true);
      setVerificationSent(true);
      
      // Redirect based on role after a delay to show verification message
      setTimeout(() => {
        if (role === 'provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/services');
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to signup', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email or sign in.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess(false);
    setLoading(true);
    
    const userData = {
      role,
      createdAt: new Date(),
    };
    
    if (role === 'provider') {
      userData.serviceArea = serviceArea || '';
      userData.providerDescription = providerDescription || '';
      userData.isVerified = false; // Providers need verification
    } else {
      userData.isVerified = true; // Customers are auto-verified
    }
    
    signInWithGoogle(userData)
      .then(() => {
        setSuccess(true);
        setLoading(false);
        
        setTimeout(() => {
          if (role === 'provider') {
            navigate('/provider/dashboard');
          } else {
            navigate('/services');
          }
        }, 2000);
      })
      .catch((error) => {
        if (error && error.code && error.code.startsWith('auth/')) {
          console.error('Failed to sign in with Google', error);
          setError('Failed to sign in with Google. Please try again.');
        } else {
          console.warn('Non-critical error during Google sign-in:', error);
        }
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">
              Account created successfully! {verificationSent && 'A verification email has been sent to your inbox.'} Redirecting you...
            </p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">Email address <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-3 py-2 border ${emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  required
                />
              </div>
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={`appearance-none block w-full px-3 py-2 border ${nameError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  required
                />
              </div>
              {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
            </div>
            
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`appearance-none block w-full px-3 py-2 border ${phoneError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                />
              </div>
              {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
              <p className="mt-1 text-xs text-gray-500">Optional, but recommended for account recovery</p>
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-3 py-2 border ${passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  required
                />
              </div>
              {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm password <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-3 py-2 border ${confirmPasswordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) setConfirmPasswordError('');
                  }}
                  required
                />
              </div>
              {confirmPasswordError && <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>}
            </div>
            
            {/* Role Selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">I am signing up as: <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`flex items-center p-4 border rounded-md cursor-pointer ${role === 'customer' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setRole('customer')}
                >
                  <input
                    id="customer"
                    name="role"
                    type="radio"
                    value="customer"
                    checked={role === 'customer'}
                    onChange={() => setRole('customer')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="customer" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    Customer
                    <p className="text-xs text-gray-500 mt-1">I want to book services</p>
                  </label>
                </div>
                <div 
                  className={`flex items-center p-4 border rounded-md cursor-pointer ${role === 'provider' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setRole('provider')}
                >
                  <input
                    id="provider"
                    name="role"
                    type="radio"
                    value="provider"
                    checked={role === 'provider'}
                    onChange={() => setRole('provider')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="provider" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    Service Provider
                    <p className="text-xs text-gray-500 mt-1">I want to offer services</p>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Provider-specific fields */}
            {showProviderFields && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-3">Service Provider Information</h3>
                
                {/* Service Area */}
                <div className="mb-4">
                  <label htmlFor="service-area" className="block text-sm font-medium text-gray-700">Service Area <span className="text-red-500">*</span></label>
                  <div className="mt-1">
                    <input
                      id="service-area"
                      name="serviceArea"
                      type="text"
                      className={`appearance-none block w-full px-3 py-2 border ${serviceAreaError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                      placeholder="e.g., New York City, Brooklyn, Queens"
                      value={serviceArea}
                      onChange={(e) => {
                        setServiceArea(e.target.value);
                        if (serviceAreaError) setServiceAreaError('');
                      }}
                      required={role === 'provider'}
                    />
                  </div>
                  {serviceAreaError && <p className="mt-1 text-sm text-red-600">{serviceAreaError}</p>}
                  <p className="mt-1 text-xs text-gray-500">Enter the areas where you provide services</p>
                </div>
                
                {/* Provider Description */}
                <div>
                  <label htmlFor="provider-description" className="block text-sm font-medium text-gray-700">Service Description <span className="text-red-500">*</span></label>
                  <div className="mt-1">
                    <textarea
                      id="provider-description"
                      name="providerDescription"
                      rows="3"
                      className={`appearance-none block w-full px-3 py-2 border ${providerDescriptionError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                      placeholder="Describe the services you offer, your experience, and why customers should choose you"
                      value={providerDescription}
                      onChange={(e) => {
                        setProviderDescription(e.target.value);
                        if (providerDescriptionError) setProviderDescriptionError('');
                      }}
                      required={role === 'provider'}
                    />
                  </div>
                  {providerDescriptionError && <p className="mt-1 text-sm text-red-600">{providerDescriptionError}</p>}
                  <p className="mt-1 text-xs text-gray-500">Minimum 20 characters. This will be visible to potential customers.</p>
                </div>
                
                <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-100">
                  <p className="text-xs text-yellow-700">
                    <svg className="inline-block h-4 w-4 mr-1 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Note: Provider accounts require verification by our team before you can offer services. This process typically takes 1-2 business days.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
