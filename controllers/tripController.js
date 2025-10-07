const Trip = require('../models/Trip');
const Route = require('../models/Route');

// Add a New Trip (Admin and Operator Only)
exports.addTrip = async (req, res) => {
  

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
};

// Fetch All Trips (Admin and Operator Only)
exports.getAllTrips = async (req, res) => {
  
  try {
    const trips = await Trip.find()
      .populate('bus_id', 'bus_number capacity bus_owner')
      .populate('route_id', 'start_point end_point distance fare');
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips.' });
  }
};

// Search Available Trips
exports.searchTrips = async (req, res) => {
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
};

// Fetch Specific Trip
exports.getTripById = async (req, res) => {
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
};

// Update a Trip (Admin and Operator Only)
exports.updateTrip = async (req, res) => {

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
};

// Delete a Trip
exports.deleteTrip = async (req, res) => {

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
};