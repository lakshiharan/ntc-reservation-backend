const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addBus,
  getAllBuses,
  getMyBuses,
  updateBus,
  deleteBus
} = require('../controllers/busController');

// Add a new bus (Admin and Operator only)
router.post('/',authenticateToken, addBus);

// Get all buses (Admin only)
router.get('/',authenticateToken, getAllBuses);

// Get buses for the logged-in operator
router.get('/my',authenticateToken, getMyBuses);

// Update a bus (Admin only)
router.put('/:id',authenticateToken, updateBus);

// Delete a bus (Admin only or bus owner)
router.delete('/:id',authenticateToken, deleteBus);

module.exports = router;
