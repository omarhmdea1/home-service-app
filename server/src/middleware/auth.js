const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // You can also use a service account key file:
    // credential: admin.credential.cert(require('../path-to-service-account.json')),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

/**
 * Middleware to verify Firebase authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  let token;
  
  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Add user info to request
      // Some routes expect `firebaseUid`, so expose both properties
      req.user = {
        uid: decodedToken.uid,
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
      
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to check if user has required role
 * @param {String} role - Required role (customer, provider, admin)
 * @returns {Function} - Express middleware function
 */
const checkRole = (role) => {
  return async (req, res, next) => {
    try {
      // Get user from MongoDB
      const user = await User.findOne({ firebaseUid: req.user.uid });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user has required role
      if (user.role !== role && user.role !== 'admin') {
        return res.status(403).json({ 
          message: `Access denied. ${role} role required.` 
        });
      }
      
      // Add role and user data to req.user
      req.user.role = user.role;
      req.user.id = user._id;
      req.user.name = user.name;
      req.user.email = user.email;
      req.user.photoURL = user.photoURL;
      
      next();
    } catch (error) {
      console.error('Error checking role:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

/**
 * Middleware to authorize users with specific roles
 * @param {...String} roles - Required roles (customer, provider, admin)
 * @returns {Function} - Express middleware function
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get user from MongoDB
      const user = await User.findOne({ firebaseUid: req.user.uid });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user has one of the required roles
      if (!roles.includes(user.role) && user.role !== 'admin') {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${roles.join(' or ')}.` 
        });
      }
      
      // Add role and user data to req.user
      req.user.role = user.role;
      req.user.id = user._id;
      req.user.name = user.name;
      req.user.email = user.email;
      req.user.photoURL = user.photoURL;
      
      next();
    } catch (error) {
      console.error('Error authorizing user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

module.exports = { protect, checkRole, authorize };
