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
app.use(cors)

// Register routes
app.use('/users', userRoutes);  // All user-related routes
app.use('/routes', routeRoutes);  // Register route routes
app.use('/buses', busRoutes);
app.use('/trips', tripRoutes);
app.use('/reservations', reservationRoutes);

// Middleware to verify JWT token
/*const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(403).json({ error: 'Invalid token.' });
  }
};*/

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the NTC Reservation System!');
});

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// User schema
/*const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['commuter', 'admin', 'operator'], required: true },
  phone_number: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);*/

// Route schema
/*const routeSchema = new mongoose.Schema({
  start_point: { type: String, required: true },
  end_point: { type: String, required: true },
  distance: { type: Number, required: true },
  fare: { type: Number, required: true },
});
routeSchema.index({ start_point: 1, end_point: 1 }, { unique: true }); // Unique compound index
const Route = mongoose.model('Route', routeSchema);*/

// Bus schema
/*const busSchema = new mongoose.Schema({
  bus_number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  bus_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus_permission_number: { type: String, required: true, unique: true },
});
const Bus = mongoose.model('Bus', busSchema);*/

// Reservation schema
/*const reservationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  seat_numbers: [{ type: Number, required: true }],
  ticket_id: { type: String, required: true },
  total_fare: { type: Number, required: true },
  status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
});
const Reservation = mongoose.model('Reservation', reservationSchema);*/

// Trip schema
/*const tripSchema = new mongoose.Schema({
  bus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  departure_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  middle_stops: { type: String },
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
const Trip = mongoose.model('Trip', tripSchema);*/


/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone_number
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [commuter, operator]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: All fields are required
 *       409:
 *         description: Email is already registered
 *       500:
 *         description: Failed to register user
 */
/*// User Registration
app.post('/users/register', async (req, res) => {
  const { name, email, password, role, phone_number } = req.body;

  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Restrict admin role registration
  if (role === 'admin') {
    return res.status(403).json({ error: 'You cannot register as an admin directly.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'commuter', // Default to commuter if no role is provided
      phone_number,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// User Login
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful!', token, role: user.role });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Fetch logged-in user details
app.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
});

// Fetch all users (admin only)
app.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Delete a user (admin only)
app.delete('/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Update a user (admin only)
app.put('/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { id } = req.params;
  const { name, email, role, phone_number } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (phone_number !== undefined) user.phone_number = phone_number;

    await user.save();

    res.json({ message: 'User updated successfully!', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});*/


/*// Add a New Route (Admin Only)
app.post('/routes', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { start_point, end_point, distance, fare } = req.body;

  if (!start_point || !end_point || !distance || !fare) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingRoute = await Route.findOne({ start_point, end_point });
    if (existingRoute) {
      return res.status(409).json({ error: 'Route already exists.' });
    }

    const newRoute = new Route({ start_point, end_point, distance, fare });
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route.' });
  }
});

// Fetch All Routes
app.get('/routes', async (req, res) => {
  try {
    const routes = await Route.find({}, 'start_point end_point distance fare');
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes.' });
  }
});

// Update a Route (Admin Only)
app.put('/routes/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { id } = req.params;
  const { start_point, end_point, distance, fare } = req.body;

  try {
    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found.' });
    }

    route.start_point = start_point || route.start_point;
    route.end_point = end_point || route.end_point;
    route.distance = distance || route.distance;
    route.fare = fare || route.fare;
    await route.save();

    res.json(route);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: 'Failed to update route.' });
  }
});

// Delete a Route (Admin Only)
app.delete('/routes/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found.' });
    }

    res.json({ message: 'Route deleted successfully.' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route.' });
  }
});*/

/*// Add a New Bus (Admin and Operator Only)
app.post('/buses', authenticateToken, async (req, res) => {
  const { bus_number, capacity, route_id, bus_permission_number } = req.body;

  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Admins and operators only.' });
  }

  if (!bus_number || !capacity || !route_id || !bus_permission_number) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingBus = await Bus.findOne({ $or: [{ bus_number }, { bus_permission_number }] });
    if (existingBus) {
      return res.status(409).json({ error: 'Bus number or permission number already exists.' });
    }

    const newBus = new Bus({
      bus_number,
      capacity,
      route_id,
      bus_owner: req.user.id,
      bus_permission_number,
    });

    await newBus.save();
    res.status(201).json({ message: 'Bus added successfully!', bus: newBus });
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({ error: 'Failed to create bus.' });
  }
});

// Fetch All Buses (Admin Only)
app.get('/buses', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  try {
    const buses = await Bus.find()
      .populate('route_id', 'start_point end_point')
      .populate('bus_owner', 'name email');
    res.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Failed to fetch buses.' });
  }
});

// Fetch Operator's Buses
app.get('/buses/my', authenticateToken, async (req, res) => {
  if (req.user.role !== 'operator') {
    return res.status(403).json({ error: 'Access denied. Operators only.' });
  }

  try {
    const buses = await Bus.find({ bus_owner: req.user.id })
      .populate('route_id', 'start_point end_point')
      .populate('bus_owner', 'name email');
    res.json(buses);
  } catch (error) {
    console.error('Error fetching operator buses:', error);
    res.status(500).json({ error: 'Failed to fetch buses.' });
  }
});

// Update a Bus (Admin Only)
app.put('/buses/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { id } = req.params;
  const { bus_number, capacity, route_id, bus_permission_number, bus_owner } = req.body;

  try {
    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found.' });
    }

    if (bus_number && bus_number !== bus.bus_number) {
      const existingBus = await Bus.findOne({ bus_number });
      if (existingBus) {
        return res.status(409).json({ error: 'Bus number already exists.' });
      }
      bus.bus_number = bus_number;
    }

    if (bus_permission_number && bus_permission_number !== bus.bus_permission_number) {
      const existingBus = await Bus.findOne({ bus_permission_number });
      if (existingBus) {
        return res.status(409).json({ error: 'Permission number already exists.' });
      }
      bus.bus_permission_number = bus_permission_number;
    }

    if (capacity) bus.capacity = capacity;
    if (route_id) bus.route_id = route_id;
    if (bus_owner) bus.bus_owner = bus_owner;

    await bus.save();
    res.json({ message: 'Bus updated successfully!', bus });
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({ error: 'Failed to update bus.' });
  }
});

// Delete a Bus
app.delete('/buses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found.' });
    }

    if (req.user.role !== 'admin' && bus.bus_owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only delete your buses.' });
    }

    await Bus.findByIdAndDelete(id);
    res.json({ message: 'Bus deleted successfully.' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ error: 'Failed to delete bus.' });
  }
});*/

/*// Add a New Trip (Admin and Operator Only)
app.post('/trips', authenticateToken, async (req, res) => {
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Admins and operators only.' });
  }

  const { bus_id, route_id, departure_time, arrival_time, middle_stops } = req.body;

  if (!bus_id || !route_id || !departure_time || !arrival_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const conflictingTrip = await Trip.findOne({
      bus_id,
      $or: [
        { departure_time: { $lt: arrival_time, $gte: departure_time } },
        { arrival_time: { $gt: departure_time, $lte: arrival_time } },
      ],
    });

    if (conflictingTrip) {
      return res.status(409).json({ error: 'Bus is already assigned to another trip during this time.' });
    }

    const trip = new Trip({ bus_id, route_id, departure_time, arrival_time, middle_stops });
    await trip.save();
    res.status(201).json({ message: 'Trip created successfully!', trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip.' });
  }
});

// Fetch All Trips (Admin and Operator Only)
app.get('/trips', authenticateToken, async (req, res) => {
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const trips = await Trip.find()
      .populate('bus_id', 'bus_number capacity bus_owner')
      .populate('route_id', 'start_point end_point distance fare');
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips.' });
  }
});

// Search Available Trips
app.get('/trips/search', authenticateToken, async (req, res) => {
  const { start_point, end_point, date } = req.query;

  if (!start_point || !end_point || !date) {
    return res.status(400).json({ error: 'Start point, end point, and date are required.' });
  }

  try {
    const dateStart = new Date(date).setHours(0, 0, 0, 0);
    const dateEnd = new Date(date).setHours(23, 59, 59, 999);

    const matchingRoutes = await Route.find({ start_point, end_point }).select('_id');
    if (!matchingRoutes.length) {
      return res.status(404).json({ error: 'No routes match the search criteria.' });
    }

    const routeIds = matchingRoutes.map((route) => route._id);

    const trips = await Trip.find({
      route_id: { $in: routeIds },
      departure_time: { $gte: dateStart, $lte: dateEnd },
    })
      .populate('bus_id', 'bus_number capacity')
      .populate('route_id', 'start_point end_point');

    const tripsWithSeats = await Promise.all(
      trips.map(async (trip) => {
        const availableSeats = await trip.available_seats;
        return { ...trip.toObject(), available_seats: availableSeats };
      })
    );

    res.json(tripsWithSeats);
  } catch (error) {
    console.error('Error searching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips.' });
  }
});

// Fetch Specific Trip
app.get('/trips/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const trip = await Trip.findById(id)
      .populate('bus_id', 'bus_number capacity')
      .populate('route_id', 'start_point end_point');

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip.' });
  }
});

// Update a Trip (Admin and Operator Only)
app.put('/trips/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { id } = req.params;
  const { bus_id, route_id, departure_time, arrival_time, middle_stops } = req.body;

  if (!departure_time || !arrival_time) {
    return res.status(400).json({ error: 'Departure and arrival times are required.' });
  }

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (bus_id && bus_id !== trip.bus_id.toString()) {
      const conflictingTrip = await Trip.findOne({
        bus_id,
        _id: { $ne: id },
        $or: [
          { departure_time: { $lt: arrival_time }, arrival_time: { $gt: departure_time } },
        ],
      });

      if (conflictingTrip) {
        return res.status(409).json({ error: 'Bus is already assigned to another trip during this time.' });
      }
    }

    trip.bus_id = bus_id || trip.bus_id;
    trip.route_id = route_id || trip.route_id;
    trip.departure_time = departure_time || trip.departure_time;
    trip.arrival_time = arrival_time || trip.arrival_time;
    trip.middle_stops = middle_stops || trip.middle_stops;

    await trip.save();
    res.json({ message: 'Trip updated successfully!', trip });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip.' });
  }
});

// Delete a Trip
app.delete('/trips/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
});*/

/*// Create New Reservations
app.post('/reservations', authenticateToken, async (req, res) => {
  const { bus_id, seat_numbers } = req.body;

  if (!bus_id || !Array.isArray(seat_numbers) || seat_numbers.length === 0) {
    return res.status(400).json({ error: 'Bus ID and seat numbers are required.' });
  }

  try {
    const bus = await Bus.findById(bus_id).populate('route_id');
    if (!bus || !bus.route_id) {
      return res.status(404).json({ error: 'Bus or associated route not found.' });
    }

    const existingReservations = await Reservation.find({
      bus_id,
      seat_numbers: { $in: seat_numbers },
      status: 'booked',
    });

    if (existingReservations.length > 0) {
      const bookedSeats = existingReservations.map((res) => res.seat_numbers).flat();
      return res.status(409).json({
        error: 'Some seats are already booked.',
        booked_seats: bookedSeats,
      });
    }

    const routeFare = bus.route_id.fare;
    const totalFare = routeFare * seat_numbers.length;

    const ticket_id = uuidv4();

    const newReservations = seat_numbers.map((seat_number) => ({
      user_id: req.user.id,
      bus_id,
      seat_numbers: [seat_number],
      ticket_id,
      total_fare: totalFare,
    }));

    await Reservation.insertMany(newReservations);

    res.status(201).json({
      message: 'Reservations created successfully!',
      ticket_id,
      total_fare: totalFare,
    });
  } catch (error) {
    console.error('Error creating reservations:', error);
    res.status(500).json({ error: 'Failed to create reservations.' });
  }
});

// Fetch All Reservations (Admin Only)
app.get('/reservations', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { ticket_id, username } = req.query;

  try {
    const query = {};

    if (ticket_id) {
      query.ticket_id = ticket_id;
    }

    if (username) {
      const user = await User.findOne({ name: new RegExp(username, 'i') });
      if (user) {
        query.user_id = user._id;
      } else {
        return res.status(404).json({ error: 'No reservations found for the specified username.' });
      }
    }

    const reservations = await Reservation.find(query)
      .populate('user_id', 'name email')
      .populate('bus_id', 'bus_number');
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations.' });
  }
});

// Fetch Reservations for Logged-In User
app.get('/reservations/my', authenticateToken, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user_id: req.user.id })
      .populate('bus_id', 'bus_number')
      .populate('user_id', 'name email');
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations.' });
  }
});

// Cancel a Ticket
app.delete('/reservations/ticket/:ticket_id', authenticateToken, async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const reservations = await Reservation.find({ ticket_id, status: 'booked' });
    if (reservations.length === 0) {
      return res.status(404).json({ error: 'No active reservations found for this ticket.' });
    }

    if (reservations[0].user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await Reservation.updateMany({ ticket_id }, { $set: { status: 'cancelled' } });

    res.json({
      message: 'Ticket and associated reservations cancelled successfully.',
      ticket_id,
    });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ error: 'Failed to cancel ticket.' });
  }
});*/

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
