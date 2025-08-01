import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import ChatBox from '../components/messaging/ChatBox';
import { getConversations, deleteConversation } from '../services/messageService';
import { getServiceById } from '../services/serviceService';
import StatusBadge from '../components/common/StatusBadge';
import socketService from '../services/socketService';

// ✅ NEW: Import our design system components
import {
  PageLayout,
  PageHeader,
  ContentSection,
} from '../components/layout';

import {
  Card,
  CardContent,
  Button,
  Badge,
  Icon,
  Heading,
  Text,
  Input,
  Alert,
  LoadingState,
  ConfirmationDialog,
} from '../components/ui';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceDetails, setServiceDetails] = useState({});
  const [deletingConversation, setDeletingConversation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
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
              } catch (error) {
                console.error('Error fetching service details:', error);
                return {
                  ...conversation,
                  serviceTitle: 'Unknown Service',
                  serviceImage: defaultServiceImage,
                  serviceCategory: 'Service',
                  otherParty: { name: 'Unknown', email: '', id: '' }
                };
              }
            })
          );
          
          setConversations(conversationsWithDetails);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [currentUser, userRole]);

  // Set up real-time updates for conversations
  useEffect(() => {
    if (currentUser) {
      socketService.connect();

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

      const handleConversationDeleted = (data) => {
        console.log('🗑️ Conversation deleted by other user:', data);
        
        // Remove conversation from list
        setConversations(prevConversations => 
          prevConversations.filter(conv => conv.bookingId !== data.bookingId)
        );
        
        // If this was the selected conversation, clear selection
        if (selectedConversation?.bookingId === data.bookingId) {
          setSelectedConversation(null);
        }
      };

      socketService.onMessageReceived(handleNewMessage);
      socketService.onMessagesMarkedRead(handleMessagesRead);
      socketService.onConversationDeleted(handleConversationDeleted);

      return () => {
        socketService.offMessageReceived();
        socketService.offMessagesMarkedRead();
        socketService.offConversationDeleted();
      };
    }
  }, [currentUser]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('messagesViewed', { 
      detail: { chatPageViewed: true } 
    }));
  }, []);

  // Helper function to format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now - time;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return time.toLocaleDateString();
  };

  // Helper function to truncate messages
  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  // Handle delete conversation
  const handleDeleteConversation = async (conversation) => {
    setConversationToDelete(conversation);
    setShowDeleteConfirm(true);
  };

  // Confirm delete conversation
  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      setDeletingConversation(conversationToDelete.bookingId);
      
      console.log('🗑️ Attempting to delete conversation:', conversationToDelete.bookingId);
      
      await deleteConversation(conversationToDelete.bookingId);
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv.bookingId !== conversationToDelete.bookingId));
      
      // If this was the selected conversation, clear selection
      if (selectedConversation?.bookingId === conversationToDelete.bookingId) {
        setSelectedConversation(null);
      }
      
      console.log('✅ Conversation deleted successfully');
      
      // Close dialog
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to delete conversation: ${errorMessage}. Please try again.`);
    } finally {
      setDeletingConversation(null);
    }
  };

  // Cancel delete conversation
  const cancelDeleteConversation = () => {
    setShowDeleteConfirm(false);
    setConversationToDelete(null);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    conversation.otherParty?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ NEW: Enhanced ConversationCard component
  const ConversationCard = ({ conversation, isSelected, onClick }) => (
    <Card 
      className={`cursor-pointer transition-all duration-150 hover:shadow-sm group ${
        isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-neutral-50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Service Image with Online Indicator */}
          <div className="relative flex-shrink-0">
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
              <img 
                src={conversation.serviceImage || defaultServiceImage} 
                alt={conversation.serviceTitle || 'Service'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = defaultServiceImage;
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-400 border-2 border-white rounded-full"></div>
          </div>
          
          {/* Conversation Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <Heading level={4} className="text-neutral-900 truncate">
                {conversation.otherParty?.name}
              </Heading>
              <div className="flex items-center space-x-2">
                {conversation.lastMessage && (
                  <Text size="tiny" className="text-neutral-500">
                    {formatRelativeTime(conversation.lastMessage.createdAt)}
                  </Text>
                )}
                {conversation.unreadCount > 0 && (
                  <Badge variant="error" size="sm">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </Badge>
                )}
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDeleteConversation(conversation);
                  }}
                  disabled={deletingConversation === conversation.bookingId}
                  className={`
                    opacity-0 group-hover:opacity-100 transition-opacity duration-150 
                    p-1 h-auto w-auto hover:bg-error-100 hover:text-error-600
                    ${isSelected ? 'opacity-100' : ''}
                  `}
                  title="Delete conversation"
                >
                  {deletingConversation === conversation.bookingId ? (
                    <Icon name="loading" size="xs" className="animate-spin" />
                  ) : (
                    <Icon name="delete" size="xs" />
                  )}
                </Button>
              </div>
            </div>
            
            <Text size="small" className="text-neutral-600 mb-2 truncate">
              <Icon name="services" size="xs" className="inline mr-1" />
              {conversation.serviceTitle}
            </Text>
            
            {conversation.lastMessage ? (
              <div className="flex items-center mb-2">
                {conversation.lastMessage.isFromCurrentUser && (
                  <Icon name="arrowRight" size="xs" className="text-neutral-400 mr-1 flex-shrink-0" />
                )}
                <Text 
                  size="small" 
                  className={`truncate ${
                    conversation.unreadCount > 0 && !conversation.lastMessage.isFromCurrentUser
                      ? 'font-semibold text-neutral-900'
                      : 'text-neutral-600'
                  }`}
                >
                  {truncateMessage(conversation.lastMessage.content)}
                </Text>
              </div>
            ) : (
              <Text size="small" className="text-neutral-500 italic mb-2">
                No messages yet
              </Text>
            )}
            
            <StatusBadge status={conversation.booking.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced conversations panel
  const conversationsPanel = (
    <div className="h-full flex flex-col">
      {/* Header with search */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <Heading level={3} className="text-neutral-900">Conversations</Heading>
          <Badge variant="neutral" size="sm">
            {filteredConversations.length} {filteredConversations.length === 1 ? 'chat' : 'chats'}
          </Badge>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="services" size="sm" className="text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150 placeholder-neutral-500"
          />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="chat" className="w-8 h-8 text-neutral-400" />
            </div>
            <Heading level={4} className="text-neutral-900 mb-2">No conversations</Heading>
            <Text className="text-neutral-500">
              {conversations.length === 0 
                ? "Book a service to start a conversation"
                : "No conversations match your search"
              }
            </Text>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredConversations.map((conversation, index) => (
                <ConversationCard
                  key={conversation.bookingId}
                  conversation={conversation}
                  isSelected={selectedConversation?.bookingId === conversation.bookingId}
                  onClick={() => setSelectedConversation(conversation)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );

  // ✅ NEW: Enhanced chat area
  const chatArea = selectedConversation ? (
    <ChatBox 
      booking={selectedConversation.booking} 
      onClose={() => setSelectedConversation(null)}
      isStandalone={true}
    />
  ) : (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center py-12">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="chat" className="w-10 h-10 text-primary-600" />
        </div>
        <Heading level={3} className="text-neutral-900 mb-2">Select a conversation</Heading>
        <Text className="text-neutral-600 max-w-sm">
          Choose a conversation from the list to start messaging with customers or service providers.
        </Text>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout background="bg-neutral-50">
      <PageHeader
        title="Messages"
        subtitle="Communicate with customers and service providers"
        description="Manage your conversations and stay connected"
        icon={<Icon name="chat" />}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Messages' }
        ]}
        actions={[
          { 
            label: 'Mark All Read',
            variant: 'outline',
            onClick: () => console.log('Mark all as read')
          }
        ]}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          <Icon name="error" size="sm" className="mr-2" />
          {error}
        </Alert>
      )}

      <ContentSection>
        {loading ? (
          <LoadingState 
            title="Loading conversations..."
            description="Fetching your latest messages"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
            {/* Conversations Panel */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                {conversationsPanel}
              </Card>
            </div>
            
            {/* Chat Area */}
            <div className="lg:col-span-2">
              {chatArea}
            </div>
          </div>
        )}
      </ContentSection>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteConversation}
        onConfirm={confirmDeleteConversation}
        title="Delete Conversation"
        message={`Are you sure you want to delete this conversation with ${conversationToDelete?.otherParty?.name}?`}
        details={
          conversationToDelete && (
            `This will permanently delete ${conversationToDelete.totalMessages || 0} message${(conversationToDelete.totalMessages || 0) !== 1 ? 's' : ''} for the service "${conversationToDelete.serviceTitle}". This action cannot be undone.`
          )
        }
        confirmText="Delete Conversation"
        cancelText="Keep Conversation"
        variant="primary"
        icon="delete"
        loading={deletingConversation === conversationToDelete?.bookingId}
      />
    </PageLayout>
  );
};

export default Chat;
