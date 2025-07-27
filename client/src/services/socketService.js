import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const SERVER_URL = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace('/api', '') 
      : 'http://localhost:5001';

    this.socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.io server:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.io server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a booking room
  joinBookingRoom(bookingId) {
    if (this.socket && bookingId) {
      this.socket.emit('join_booking_room', bookingId);
      console.log(`Joined booking room: ${bookingId}`);
    }
  }

  // Leave a booking room
  leaveBookingRoom(bookingId) {
    if (this.socket && bookingId) {
      this.socket.emit('leave_booking_room', bookingId);
      console.log(`Left booking room: ${bookingId}`);
    }
  }

  // Send a new message
  sendMessage(bookingId, message) {
    if (this.socket && bookingId && message) {
      this.socket.emit('new_message', { bookingId, message });
    }
  }

  // Listen for new messages
  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('message_received', callback);
    }
  }

  // Remove message listener
  offMessageReceived() {
    if (this.socket) {
      this.socket.off('message_received');
    }
  }

  // Send typing indicator
  sendTypingIndicator(bookingId, isTyping, userName) {
    if (this.socket && bookingId) {
      this.socket.emit('typing', { bookingId, isTyping, userName });
    }
  }

  // Listen for typing indicators
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  // Remove typing listener
  offUserTyping() {
    if (this.socket) {
      this.socket.off('user_typing');
    }
  }

  // Listen for messages marked as read
  onMessagesMarkedRead(callback) {
    if (this.socket) {
      this.socket.on('messages_marked_read', callback);
    }
  }

  // Remove messages marked as read listener
  offMessagesMarkedRead() {
    if (this.socket) {
      this.socket.off('messages_marked_read');
    }
  }

  // Listen for conversation deletion
  onConversationDeleted(callback) {
    if (this.socket) {
      this.socket.on('conversation_deleted', callback);
    }
  }

  // Remove conversation deletion listener
  offConversationDeleted() {
    if (this.socket) {
      this.socket.off('conversation_deleted');
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isSocketConnected() {
    return this.socket && this.isConnected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 