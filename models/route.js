'use strict';
const mongoose = require('mongoose');

// Define the Route schema
const routeSchema = new mongoose.Schema({
  start_point: {
    type: String,
    required: [true, 'Start point is required'],
    trim: true,
    minlength: [2, 'Start point must be at least 2 characters long'],
  },
  end_point: {
    type: String,
    required: [true, 'End point is required'],
    trim: true,
    minlength: [2, 'End point must be at least 2 characters long'],
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative'],
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [1, 'Fare must be a positive value'],
    default: 0,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Middleware to log route creation or updates
routeSchema.pre('save', function (next) {
  console.log(`Route being saved: ${this.start_point} to ${this.end_point}`);
  next();
});

// Static method to calculate fare based on distance (example)
routeSchema.statics.calculateFare = function (distance, ratePerKm = 5) {
  return distance * ratePerKm;
};

// Export the Route model
module.exports = mongoose.model('Route', routeSchema);
