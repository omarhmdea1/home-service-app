import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import ChatBox from '../components/messaging/ChatBox';
import { getConversations } from '../services/messageService';
import { getServiceById } from '../services/serviceService';
import StatusBadge from '../components/common/StatusBadge';
import socketService from '../services/socketService';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceDetails, setServiceDetails] = useState({});
  const { userRole, currentUser } = useAuth();
  
  const defaultServiceImage = 'https://via.placeholder.com/100';

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        const response = await getConversations();
        
        if (response && Array.isArray(response)) {
          // Enhance conversations with service details
          const conversationsWithDetails = await Promise.all(
            response.map(async (conversation) => {
              try {
                const serviceData = await getServiceById(conversation.booking.serviceId);
                setServiceDetails(prev => ({ 
                  ...prev, 
                  [conversation.booking.serviceId]: serviceData 
                }));
                
                return {
                  ...conversation,
                  serviceTitle: serviceData?.title || 'Unknown Service',
                  serviceImage: serviceData?.image || defaultServiceImage,
                  serviceCategory: serviceData?.category || 'Service',
                  otherParty: userRole === 'provider' 
                    ? {
                        name: conversation.booking.userName || 'Customer',
                        email: conversation.booking.userEmail || '',
                        id: conversation.booking.userId
                      }
                    : {
                        name: serviceData?.providerName || 'Service Provider',
                        email: '',
                        id: conversation.booking.providerId
                      }
                };
              } catch (err) {
                console.error('Error fetching service details:', err);
                return {
                  ...conversation,
                  serviceTitle: 'Unknown Service',
                  serviceImage: defaultServiceImage,
                  serviceCategory: 'Service',
                  otherParty: userRole === 'provider' 
                    ? {
                        name: conversation.booking.userName || 'Customer',
                        email: conversation.booking.userEmail || '',
                        id: conversation.booking.userId
                      }
                    : {
                        name: 'Service Provider',
                        email: '',
                        id: conversation.booking.providerId
                      }
                };
              }
            })
          );
          
          setConversations(conversationsWithDetails);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchConversations();
    }
  }, [currentUser, userRole]);

  // Set up real-time updates for conversations
  useEffect(() => {
    if (currentUser) {
      // Connect to Socket.io
      socketService.connect();

      // Listen for new messages to update conversation list
      const handleNewMessage = (message) => {
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.bookingId === message.bookingId) {
              return {
                ...conv,
                lastMessage: {
                  ...message,
                  isFromCurrentUser: message.senderId === currentUser.uid
                },
                updatedAt: message.createdAt,
                unreadCount: message.senderId !== currentUser.uid 
                  ? conv.unreadCount + 1 
                  : conv.unreadCount
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
      };

      const handleMessagesRead = (data) => {
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.bookingId === data.bookingId && data.readBy === currentUser.uid) {
              return {
                ...conv,
                unreadCount: Math.max(0, conv.unreadCount - data.count)
              };
            }
            return conv;
          });
        });
      };

      socketService.onMessageReceived(handleNewMessage);
      socketService.onMessagesMarkedRead(handleMessagesRead);

      return () => {
        socketService.offMessageReceived();
        socketService.offMessagesMarkedRead();
      };
    }
  }, [currentUser]);

  // Emit event to refresh unread count when Chat page is viewed
  useEffect(() => {
    // Refresh notification badge when user visits chat page
    window.dispatchEvent(new CustomEvent('messagesViewed', { 
      detail: { chatPageViewed: true } 
    }));
  }, []);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conversation.serviceTitle?.toLowerCase().includes(searchLower) ||
      conversation.otherParty?.name?.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  // Truncate message content
  const truncateMessage = (content, maxLength = 60) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Enhanced Conversations List */}
            <div className="lg:col-span-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              {/* Header with search */}
              <div className="px-4 py-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                  <span className="text-sm text-gray-600">
                    {filteredConversations.length} {filteredConversations.length === 1 ? 'chat' : 'chats'}
                  </span>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations</h3>
                    <p className="text-sm text-gray-500">
                      {conversations.length === 0 
                        ? "Book a service to start a conversation"
                        : "No conversations match your search"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={conversation.bookingId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            className={`w-full text-left px-4 py-4 hover:bg-gray-50 focus:outline-none focus:bg-primary-50 transition-colors duration-200 ${
                              selectedConversation?.bookingId === conversation.bookingId 
                                ? 'bg-primary-50 border-r-2 border-primary-500' 
                                : ''
                            }`}
                            onClick={() => setSelectedConversation(conversation)}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Service Image */}
                              <div className="relative flex-shrink-0">
                                <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                                  <img 
                                    src={conversation.serviceImage || defaultServiceImage} 
                                    alt={conversation.serviceTitle || 'Service'}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                {/* Online indicator */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                              </div>
                              
                              {/* Conversation Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                                    {conversation.otherParty?.name}
                                  </h3>
                                  <div className="flex items-center space-x-2">
                                    {conversation.lastMessage && (
                                      <span className="text-xs text-gray-500">
                                        {formatRelativeTime(conversation.lastMessage.createdAt)}
                                      </span>
                                    )}
                                    {conversation.unreadCount > 0 && (
                                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-600 mb-2 truncate">
                                  {conversation.serviceTitle}
                                </p>
                                
                                {conversation.lastMessage ? (
                                  <div className="flex items-center">
                                    {conversation.lastMessage.isFromCurrentUser && (
                                      <svg className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                      </svg>
                                    )}
                                    <p className={`text-sm truncate ${
                                      conversation.unreadCount > 0 && !conversation.lastMessage.isFromCurrentUser
                                        ? 'font-semibold text-gray-900'
                                        : 'text-gray-600'
                                    }`}>
                                      {truncateMessage(conversation.lastMessage.content)}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No messages yet</p>
                                )}
                                
                                {/* Status Badge */}
                                <div className="mt-2">
                                  <StatusBadge status={conversation.booking.status} />
                                </div>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Chat Area */}
            <div className="lg:col-span-2">
              <motion.div
                layout
                className="h-full"
              >
                <ChatBox 
                  booking={selectedConversation?.booking} 
                  onClose={() => setSelectedConversation(null)}
                  isStandalone={true}
                />
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Chat;
