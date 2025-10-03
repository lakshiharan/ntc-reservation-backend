// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getLoggedInUser, getAllUsers, deleteUser, updateUser } = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// User registration and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (authentication required)
router.get('/me', authenticateToken, getLoggedInUser);
router.get('/', authenticateToken, getAllUsers);  // Admin only
router.delete('/:id', authenticateToken, deleteUser);  // Admin only
router.put('/:id', authenticateToken, updateUser);  // Admin only

module.exports = router;
