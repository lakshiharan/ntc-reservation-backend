'use strict';
const mongoose = require('mongoose');

// Define the Bus Schema
const busSchema = new mongoose.Schema({
  bus_number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  bus_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus_permission_number: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Bus', busSchema);
