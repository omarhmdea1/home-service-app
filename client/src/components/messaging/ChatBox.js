import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../auth/AuthProvider';

const ChatBox = ({ booking, onClose, isStandalone = false }) => {
  const { userRole } = useAuth();
  const [recipientId, setRecipientId] = useState('');
  
  useEffect(() => {
    if (booking) {
      if (userRole === 'provider') {
        setRecipientId(booking.userId);
      } else {
        setRecipientId(booking.providerId);
      }
    }
  }, [booking, userRole]);

  const handleMessageSent = () => {
    // This will be called after a message is successfully sent
    // We could trigger a refresh of the message list here if needed
  };

  // Determine the appropriate container based on whether this is standalone or modal
  const Container = isStandalone ? React.Fragment : motion.div;
  const InnerContainer = isStandalone ? React.Fragment : motion.div;
  
  // If no booking is selected in standalone mode, show a message
  if (isStandalone && !booking) {
    return (
      <div className="bg-white shadow rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <p className="mt-2 text-sm font-medium">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }
  
  // If no booking is provided at all, return null
  if (!booking) return null;
  
  return (
    <div className={isStandalone ? "" : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"}>
      <div className={isStandalone ? "bg-white shadow rounded-lg overflow-hidden" : "bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"}>
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Chat - {booking.serviceTitle || 'Service Booking'}
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
        
        <MessageList bookingId={booking?._id || booking?.id} />
        
        <MessageInput
          bookingId={booking?._id || booking?.id}
          recipientId={recipientId}
          onMessageSent={handleMessageSent}
        />
      </div>
      </div>
    </div>
  );
};

export default ChatBox;
