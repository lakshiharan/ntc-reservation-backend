const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'NTC Reservation System API',
    version: '1.0.0',
    description: 'API documentation for the NTC Reservation System',
  },
  servers: [
    {
      url: 'https://ntc-reservation-system.onrender.com', 
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};