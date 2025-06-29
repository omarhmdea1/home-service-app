const admin = require('firebase-admin');

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
      req.user = {
        uid: decodedToken.uid,
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
      // Get user from Firestore
      const userRecord = await admin.firestore().collection('users').doc(req.user.uid).get();
      
      if (!userRecord.exists) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userData = userRecord.data();
      
      // Check if user has required role
      if (userData.role !== role && userData.role !== 'admin') {
        return res.status(403).json({ 
          message: `Access denied. ${role} role required.` 
        });
      }
      
      // Add role to req.user
      req.user.role = userData.role;
      
      next();
    } catch (error) {
      console.error('Error checking role:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

module.exports = { protect, checkRole };
