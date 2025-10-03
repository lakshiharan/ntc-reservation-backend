const express = require('express');
const router = express.Router();
const {
  addTrip,
  getAllTrips,
  searchTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require('../controllers/tripController');
const authenticateToken = require('../middleware/authenticateToken');

// Add a new trip (admin and operator only)
router.post('/', authenticateToken, addTrip);

// Fetch all trips (admin and operator only)
router.get('/', authenticateToken, getAllTrips);

// Search available trips
router.get('/search', authenticateToken, searchTrips);

// Fetch a specific trip by ID
router.get('/:id', authenticateToken, getTripById);

// Update a trip (admin and operator only)
router.put('/:id', authenticateToken, updateTrip);

// Delete a trip (admin and operator only)
router.delete('/:id', authenticateToken, deleteTrip);

module.exports = router;