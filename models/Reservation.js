'use strict';
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // For generating unique ticket IDs

// Define the Reservation schema
const reservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  bus_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus ID is required'],
  },
  seat_numbers: {
    type: [Number], // Array of seat numbers
    required: [true, 'Seat numbers are required'],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'At least one seat number is required.',
    },
  },
  ticket_id: {
    type: String,
    default: uuidv4, // Generate unique ticket ID if not provided
    required: [true, 'Ticket ID is required'],
  },
  total_fare: {
    type: Number,
    required: [true, 'Total fare is required'],
    min: [0, 'Total fare must be a positive value'],
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked',
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Middleware to log reservation actions
reservationSchema.pre('save', function (next) {
  console.log(`Reservation being saved with Ticket ID: ${this.ticket_id}`);
  next();
});

// Export the Reservation model
module.exports = mongoose.model('Reservation', reservationSchema);
