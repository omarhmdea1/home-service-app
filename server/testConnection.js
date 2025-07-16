require('dotenv').config();
const mongoose = require('mongoose');

/**
 * This script tests the MongoDB connection. It now checks for the
 * `MONGO_URI` environment variable before attempting to connect. If the
 * variable is not set, an error is logged and the process exits with a
 * non-zero code.
 */

console.log('Testing MongoDB connection...');
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is not defined.');
  process.exit(1);
}
console.log(`MongoDB URI: ${process.env.MONGO_URI.replace(/\/\/(.+?):(.+?)@/, '//***:***@')}`);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully!');
  console.log('Connection state:', mongoose.connection.readyState);
  
  // List all collections in the database
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
      return;
    }
    
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Close the connection after testing
    mongoose.connection.close();
    console.log('Connection closed.');
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
