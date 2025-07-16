import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../auth/AuthProvider';
import { getBookingMessages } from '../../services/messageService';

const MessageList = ({ bookingId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!bookingId) return;
      
      try {
        setLoading(true);
        const response = await getBookingMessages(bookingId);
        setMessages(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Set up polling for new messages every 10 seconds
    const intervalId = setInterval(fetchMessages, 10000);
    
    return () => clearInterval(intervalId);
  }, [bookingId]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="text-center text-red-500 py-4">
        {error}
        <button 
          className="block mx-auto mt-2 text-blue-500 underline"
          onClick={() => getBookingMessages(bookingId)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 overflow-y-auto px-4 py-2 bg-gray-50 rounded-lg">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser?.uid;
          
          return (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div 
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  isCurrentUser 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div 
                  className={`text-xs mt-1 text-right ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatMessageTime(message.createdAt)}
                  {message.isRead && isCurrentUser && (
                    <span className="ml-1">✓</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
