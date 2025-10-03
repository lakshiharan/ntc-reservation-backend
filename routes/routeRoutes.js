const express = require('express');
const router = express.Router();
const {
  addRoute,
  getAllRoutes,
  updateRoute,
  deleteRoute
} = require('../controllers/routeController');
const authenticateToken = require('../middleware/authenticateToken');

// Add a New Route (Admin Only)
router.post('/', authenticateToken, addRoute);

// Fetch All Routes
router.get('/', getAllRoutes);

// Update a Route (Admin Only)
router.put('/:id', authenticateToken, updateRoute);

// Delete a Route (Admin Only)
router.delete('/:id', authenticateToken, deleteRoute);

module.exports = router;

