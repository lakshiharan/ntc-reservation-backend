const Bus = require('../models/Bus');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Add a New Bus (Admin and Operator Only)
exports.addBus = async (req, res) => {
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
};

// Fetch All Buses (Admin Only)
exports.getAllBuses = async (req, res) => {
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
};

// Fetch Operator's Buses
exports.getMyBuses = async (req, res) => {
  console.log("req:");
  console.log(req.user);
  
  
  if (req.user.role !== 'operator') {
    return res.status(403).json({ error: 'Access denied. Operators only.' });
  }

  try {
    const buses = await Bus.find({ bus_owner: req.user.id })
      .populate('route_id', 'start_point end_point')
      .populate('bus_owner', 'name email');
    res.json(buses);
    console.log(buses);
    
  } catch (error) {
    console.error('Error fetching operator buses:', error);
    res.status(500).json({ error: 'Failed to fetch buses.' });
  }
};

// Update a Bus (Admin Only)
exports.updateBus = async (req, res) => {
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
};

// Delete a Bus
exports.deleteBus = async (req, res) => {
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
};