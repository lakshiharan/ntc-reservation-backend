const mongoose = require('mongoose');
const connectToDatabase = require('./config/database');
const User = require('./models/User');
const Route = require('./models/Route');
const Bus = require('./models/bus');

const seedDatabase = async () => {
  try {
    await connectToDatabase();

    // Seed Users
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: 'password1', role: 'commuter', phone_number: '1234567890' },
      { name: 'Admin User', email: 'admin1@example.com', password: 'adminpass01', role: 'admin', phone_number: '0987654321' },
    ];
    await User.insertMany(users);
    console.log('Users seeded successfully!');

    // Seed Routes
    const routes = [
      { start_point: 'Colombo', end_point: 'Kandy', distance: 100, fare: 500 },
      { start_point: 'Galle', end_point: 'Matara', distance: 60, fare: 300 },
    ];
    const createdRoutes = await Route.insertMany(routes);
    console.log('Routes seeded successfully!');

    // Seed Buses
    const buses = [
      { bus_number: 'NB-1234', capacity: 50, route_id: createdRoutes[0]._id },
      { bus_number: 'NB-5678', capacity: 40, route_id: createdRoutes[1]._id },
    ];
    await Bus.insertMany(buses);
    console.log('Buses seeded successfully!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase();
