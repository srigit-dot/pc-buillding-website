const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Full error:', error);
    console.error('Please make sure MongoDB is running on your system');
    process.exit(1);
  }
};

module.exports = connectDB; 