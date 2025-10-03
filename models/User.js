'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[\w-.]+@[\w-]+\.[a-z]{2,6}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [3, 'Password must be at least 8 characters long'],
    select: false, // Exclude password field by default when querying
  },
  role: {
    type: String,
    enum: ['commuter', 'admin', 'operator'],
    required: [true, 'Role is required'],
    default: 'commuter',
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function (v) {
        return /^[0-9]{10,15}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Middleware to hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    console.log('Password before hashing (Save):', this.password); // Debug
    //this.password = await bcrypt.hash(this.password, 10);
    //console.log('Password after hashing (Save):', this.password); // Debug
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to hash password before updating the user
userSchema.pre('findOneAndUpdate', async function (next) {
  if (!this.getUpdate().password) return next();

  try {
    console.log('Password before hashing (Update):', this.getUpdate().password); // Debug
    this.getUpdate().password = await bcrypt.hash(this.getUpdate().password, 10);
    console.log('Password after hashing (Update):', this.getUpdate().password); // Debug
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.checkPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
