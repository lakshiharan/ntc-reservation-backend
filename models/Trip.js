'use strict';
const mongoose = require('mongoose');

// Trip schema
const tripSchema = new mongoose.Schema({
  bus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  departure_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  middle_stops: [{ type: String }],
});
tripSchema.virtual('available_seats').get(async function () {
  const bus = await mongoose.model('Bus').findById(this.bus_id);
  const reservations = await mongoose.model('Reservation').find({
    bus_id: this.bus_id,
    status: 'booked',
  });
  const bookedSeats = reservations.reduce((sum, res) => sum + res.seat_numbers.length, 0);
  return bus.capacity - bookedSeats;
});

// Export the Route model
module.exports = mongoose.model('Trip', tripSchema);