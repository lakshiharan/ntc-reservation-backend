'use strict';

const mongoose = require('mongoose');
const User = require('./User'); // Import User model
const Route = require('./Route'); // Import Route model
const Bus = require('./Bus'); // Import Bus model
const Reservation = require('./Reservation'); // Import Reservation model

// Database Connection
const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ntc_reservation';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Export models and connect function
module.exports = {
  User,
  Route,
  Bus,
  Reservation,
  connectToDatabase,
};
