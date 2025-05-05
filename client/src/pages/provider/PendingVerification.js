import React from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PendingVerification = () => {
  const { userProfile } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Account Verification Pending</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your provider account is currently under review.
          </p>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Thank you for registering as a service provider. Our team is currently reviewing your application.
                This process typically takes 1-2 business days.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Account Information:</strong><br />
                Name: {userProfile?.name}<br />
                Email: {userProfile?.email}<br />
                Service Area: {userProfile?.serviceArea}<br />
                Registration Date: {userProfile?.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-md bg-gray-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-700">What happens next?</h3>
              <div className="mt-2 text-sm text-gray-500">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Our team will review your service description and credentials</li>
                  <li>You'll receive an email notification once your account is verified</li>
                  <li>After verification, you'll have full access to the provider dashboard</li>
                  <li>You can then start managing your services and accepting bookings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 mt-6">
          <Link
            to="/services"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Browse Services
          </Link>
          
          <Link
            to="/contact"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingVerification;
