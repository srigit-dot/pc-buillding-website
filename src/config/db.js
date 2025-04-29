const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Use a simple local connection string
    const mongoURI = 'mongodb://localhost:27017/product-store';
    
    // Basic connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Please make sure MongoDB is running on your system');
    console.error('You can start MongoDB with: mongod');
    process.exit(1);
  }
};

module.exports = connectDB; 