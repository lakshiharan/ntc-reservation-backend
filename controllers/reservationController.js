const Reservation = require('../models/Reservation');
const Bus = require('../models/Bus');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Create New Reservations
exports.createReservation = async (req, res) => {
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
};

// Fetch All Reservations (Admin Only)
exports.getAllReservations = async (req, res) => {

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
};

// Fetch Reservations for Logged-In User
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user_id: req.user.id })
      .populate('bus_id', 'bus_number')
      .populate('user_id', 'name email');
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations.' });
  }
};

// Cancel a Ticket
exports.cancelReservation = async (req, res) => {
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
};