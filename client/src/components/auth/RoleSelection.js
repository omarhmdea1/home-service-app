import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RoleSelection = () => {
  const { pendingUserData, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If no pending user data, redirect to login
  if (!pendingUserData) {
    navigate('/login');
    return null;
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await completeProfile(selectedRole);
      
      // Navigate to appropriate page
      navigate(selectedRole === 'provider' ? '/provider/dashboard' : '/');
    } catch (error) {
      setError('Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userName = pendingUserData.name || pendingUserData.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Home Services
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hello {userName}! Please select your role to continue
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-red-50 p-4"
                >
                  <div className="text-sm text-red-700">{error}</div>
                </motion.div>
              )}

              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Choose how you'd like to use our platform:
                </p>

                {/* Customer Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                    selectedRole === 'customer'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleRoleSelect('customer')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="customer"
                      name="role"
                      value="customer"
                      checked={selectedRole === 'customer'}
                      onChange={() => handleRoleSelect('customer')}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <label htmlFor="customer" className="block text-sm font-medium text-gray-900 cursor-pointer">
                        I'm a Customer
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        I need home services and want to book providers
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Provider Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                    selectedRole === 'provider'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleRoleSelect('provider')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="provider"
                      name="role"
                      value="provider"
                      checked={selectedRole === 'provider'}
                      onChange={() => handleRoleSelect('provider')}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <label htmlFor="provider" className="block text-sm font-medium text-gray-900 cursor-pointer">
                        I'm a Service Provider
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        I provide home services and want to find customers
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!selectedRole || isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Setting up your account...
                  </div>
                ) : (
                  'Continue'
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
