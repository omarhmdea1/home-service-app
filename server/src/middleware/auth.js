const admin = require('firebase-admin');
const User = require('../models/User');

if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin with environment variables for Heroku compatibility
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Use explicit credentials from environment variables
      // Fix private key formatting for Heroku environment variables
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      console.log('✅ Firebase Admin initialized with environment credentials');
    } else {
      // Fallback to application default credentials (for local development)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      console.log('✅ Firebase Admin initialized with default credentials');
    }
  } catch (error) {
    console.error('⚠️ Firebase Admin initialization failed:', error.message);
    console.log('🔄 App will continue without Firebase Admin (authentication disabled)');
    // Don't crash the app - just log the error and continue
  }
}

/**
 * Middleware to verify Firebase authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  let token;
  
  // Check if Firebase Admin is properly initialized
  if (!admin.apps.length) {
    console.log('⚠️ Firebase Admin not initialized - authentication unavailable');
    return res.status(500).json({ 
      error: 'Authentication service temporarily unavailable',
      message: 'Firebase Admin configuration issue'
    });
  }
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decodedToken = await admin.auth().verifyIdToken(token);

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
      const user = await User.findOne({ firebaseUid: req.user.uid });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.role !== role && user.role !== 'admin') {
        return res.status(403).json({ 
          message: `Access denied. ${role} role required.` 
        });
      }
      
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
      const user = await User.findOne({ firebaseUid: req.user.uid });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!roles.includes(user.role) && user.role !== 'admin') {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${roles.join(' or ')}.` 
        });
      }
      
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
