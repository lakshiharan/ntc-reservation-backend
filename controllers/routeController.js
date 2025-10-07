const Route = require('../models/Route');

// Add a New Route (Admin Only)
exports.addRoute = async (req, res) => {


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
};

// Fetch All Routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({}, 'start_point end_point distance fare');
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes.' });
  }
};

// Update a Route (Admin Only)
exports.updateRoute = async (req, res) => {
 
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
};

// Delete a Route (Admin Only)
exports.deleteRoute = async (req, res) => {
  

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
};