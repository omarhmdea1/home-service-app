require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
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
