import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../auth/AuthProvider';

const ChatBox = ({ booking, onClose }) => {
  const { userRole } = useAuth();
  const [recipientId, setRecipientId] = useState('');
  
  useEffect(() => {
    // Determine the recipient based on user role
    if (userRole === 'provider') {
      setRecipientId(booking.userId); // If provider, send to customer
    } else {
      setRecipientId(booking.providerId); // If customer, send to provider
    }
  }, [booking, userRole]);

  const handleMessageSent = () => {
    // This will be called after a message is successfully sent
    // We could trigger a refresh of the message list here if needed
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium">
          Chat - Booking #{booking._id.substring(booking._id.length - 6)}
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-medium text-gray-800">
            {booking.serviceName}
          </h4>
          <p className="text-sm text-gray-600">
            {new Date(booking.date).toLocaleDateString()} at {booking.time}
          </p>
        </div>
        
        <MessageList bookingId={booking._id} />
        
        <MessageInput
          bookingId={booking._id}
          recipientId={recipientId}
          onMessageSent={handleMessageSent}
        />
      </div>
    </motion.div>
  );
};

export default ChatBox;
