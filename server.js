// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // For generating unique ticket IDs
const connectToDatabase = require('./config/database');
const cors = require('./cors');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const userRoutes = require('./routes/userRoutes');
const routeRoutes = require('./routes/routeRoutes');
const busRoutes = require('./routes/busRoutes');
const tripRoutes = require('./routes/tripRoutes')
const reservationRoutes = require('./routes/reservationRoutes');


// Connect to MongoDB
connectToDatabase();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors())

// Register routes
app.use('/users', userRoutes);  // All user-related routes
app.use('/routes', routeRoutes);  // Register route routes
app.use('/buses', busRoutes);
app.use('/trips', tripRoutes);
app.use('/reservations', reservationRoutes);



// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the NTC Reservation System!');
});

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
