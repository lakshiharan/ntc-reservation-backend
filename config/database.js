const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakshiharanlksh:lksh2001@clothingapp.p9zjlgo.mongodb.net/ntc_reservation?retryWrites=true&w=majority&appName=ClothingApp';
    await mongoose.connect(mongoUri); // Simplified connection without deprecated options
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

module.exports = connectToDatabase;
