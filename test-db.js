const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://lakshiharanlksh:lksh2001@clothingapp.p9zjlgo.mongodb.net/ntc_reservation?retryWrites=true&w=majority&appName=ClothingApp';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to databse successfully!');
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });
