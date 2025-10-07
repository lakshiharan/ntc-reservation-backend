// cors.js
const cors = require('cors');

const URL_WHITELIST = [
  process.env.CLIENT_URL,  // Ensure this is http://localhost:3001 in your .env
  process.env.SWAGGER_URL,
  "https://ntc-reservation-frontend.onrender.com",  // Allow Render URL if you're deploying there
  "http://localhost:3001",  // Local frontend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // If origin is not provided (e.g., for Postman), allow all
    if (!origin || URL_WHITELIST.indexOf(origin) !== -1) {
      callback(null, true);  // Allow the request
    } else {
      callback(new Error('CORS error: Origin not allowed'));
    }
  },
  credentials: true,  // Allow credentials (cookies/tokens)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
};

module.exports = cors(corsOptions);
