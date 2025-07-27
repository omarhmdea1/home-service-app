import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../auth/AuthProvider';
import { getBookingMessages } from '../../services/messageService';
import socketService from '../../services/socketService';

const MessageList = ({ bookingId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  // Early return if no bookingId
  if (!bookingId) {
    return (
      <div className="flex flex-col h-96 overflow-y-auto px-4 py-2 bg-gray-50 rounded-lg">
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No booking selected
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchMessages = async () => {
      if (!bookingId) return;
      
      try {
        setLoading(true);
        const response = await getBookingMessages(bookingId);
        
        // Handle the response structure properly
        const messagesData = response?.data || response || [];
        setMessages(Array.isArray(messagesData) ? messagesData : []);
        setError(null);
        
        // Emit event to update unread count after messages are marked as read
        window.dispatchEvent(new CustomEvent('messagesViewed', { 
          detail: { bookingId } 
        }));
        
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
        setMessages([]); // Ensure messages is always an array
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMessages();

    // Set up Socket.io for real-time messages
    if (bookingId) {
      // Connect to socket if not already connected
      socketService.connect();
      
      // Join the booking room
      socketService.joinBookingRoom(bookingId);

      // Listen for new messages
      const handleNewMessage = (newMessage) => {
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
          if (messageExists) return prevMessages;
          
          return [...prevMessages, newMessage];
        });
      };

      socketService.onMessageReceived(handleNewMessage);

      // Listen for typing indicators
      const handleTypingIndicator = ({ isTyping, userName }) => {
        if (isTyping) {
          setTypingUser(userName);
        } else {
          setTypingUser(null);
        }
      };

      socketService.onUserTyping(handleTypingIndicator);

      // Listen for messages marked as read
      const handleMessagesMarkedRead = (data) => {
        // Update read status of messages in real-time
        if (data.messageIds && data.messageIds.length > 0) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              data.messageIds.includes(msg._id) 
                ? { ...msg, isRead: true }
                : msg
            )
          );
        }
      };

      socketService.onMessagesMarkedRead(handleMessagesMarkedRead);

      // Cleanup function
      return () => {
        socketService.leaveBookingRoom(bookingId);
        socketService.offMessageReceived();
        socketService.offUserTyping();
        socketService.offMessagesMarkedRead();
      };
    }
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

  if (loading && (!messages || messages.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && (!messages || messages.length === 0)) {
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
      {!messages || messages.length === 0 ? (
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
      
      {/* Typing indicator */}
      {typingUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start mb-4"
        >
          <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">{typingUser} is typing</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
