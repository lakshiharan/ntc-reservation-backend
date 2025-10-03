const express = require('express');
const router = express.Router();
const {
  createReservation,
  getAllReservations,
  getMyReservations,
  cancelReservation,
} = require('../controllers/reservationController');
const authenticateToken = require('../middleware/authenticateToken');

// Create New Reservation
router.post('/', authenticateToken, createReservation);

// Fetch All Reservations (Admin only)
router.get('/', authenticateToken, getAllReservations);

// Fetch Reservations for Logged-In User
router.get('/my', authenticateToken, getMyReservations);

// Cancel a Ticket
router.delete('/ticket/:ticket_id', authenticateToken, cancelReservation);

module.exports = router;