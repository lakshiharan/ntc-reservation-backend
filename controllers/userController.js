const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.registerUser = async (req, res) => {
  const { name, email, password, role, phone_number } = req.body;

  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword:", hashedPassword);
    console.log("password:", password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'commuter',
      phone_number,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

// userController.js
exports.loginUser = async (req, res) => {
  console.log("Request Body:", req.body);  // Log incoming request for debugging

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email }).select('+password'); // Ensure the password field is returned
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Use the checkPassword method to compare the entered password with the hashed password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Compare entered password with hashed password
    //const isPasswordValid = await bcrypt.compare(password, user.password);
    //if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials.' });


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
};

// Fetch logged-in user details
exports.getLoggedInUser = async (req, res) => {
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
};

// Fetch all users (admin only)
exports.getAllUsers = async (req, res) => {

  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
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
};

// Update a user (admin only)
exports.updateUser = async (req, res) => {

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
};