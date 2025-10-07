const express = require('express');
const router = express.Router();
const {
  addTrip,
  getAllTrips,
  searchTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require('../controllers/tripController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// Add a new trip (admin and operator only)
/**
 * @openapi
 * /trips:
 *   post:
 *     tags:
 *       - Trip
 *     summary: Add a new trip (Admin and Operator only)
 *     description: Allows admins or operators to create a new trip with bus, route, and schedule details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bus_id:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab3456"
 *               route_id:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab7890"
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-10T08:00:00Z"
 *               arrival_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-10T12:00:00Z"
 *               middle_stops:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Gampaha", "Kegalle"]
 *     responses:
 *       201:
 *         description: Trip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trip created successfully!"
 *                 trip:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     bus_id:
 *                       type: string
 *                     route_id:
 *                       type: string
 *                     departure_time:
 *                       type: string
 *                     arrival_time:
 *                       type: string
 *                     middle_stops:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Access denied. Admins and operators only
 *       409:
 *         description: Bus already assigned to another trip during this time
 *       500:
 *         description: Failed to create trip
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'operator'), addTrip);

// Fetch all trips (admin and operator only)
/**
 * @openapi
 * /trips:
 *   get:
 *     tags:
 *       - Trip
 *     summary: Fetch all trips (Admin and Operator only)
 *     description: Retrieve a list of all trips with bus and route details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "6701a56fd3b6c70012ab3456"
 *                   bus_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       bus_number:
 *                         type: string
 *                       capacity:
 *                         type: number
 *                       bus_owner:
 *                         type: string
 *                   route_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       start_point:
 *                         type: string
 *                       end_point:
 *                         type: string
 *                       distance:
 *                         type: number
 *                       fare:
 *                         type: number
 *                   departure_time:
 *                     type: string
 *                     format: date-time
 *                   arrival_time:
 *                     type: string
 *                     format: date-time
 *                   middle_stops:
 *                     type: array
 *                     items:
 *                       type: string
 *       403:
 *         description: Access denied
 *       500:
 *         description: Failed to fetch trips
 */
router.get('/', authenticateToken,authorizeRoles('admin', 'operator'), getAllTrips);

// Search available trips
/**
 * @openapi
 * /trips/search:
 *   get:
 *     tags:
 *       - Trip
 *     summary: Search available trips
 *     description: Search trips based on start point, end point, and date.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_point
 *         required: true
 *         schema:
 *           type: string
 *         description: Starting location of the trip
 *         example: "Colombo"
 *       - in: query
 *         name: end_point
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination location of the trip
 *         example: "Kandy"
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date of travel
 *         example: "2025-10-10"
 *     responses:
 *       200:
 *         description: List of matching trips with available seats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   bus_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       bus_number:
 *                         type: string
 *                       capacity:
 *                         type: number
 *                   route_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       start_point:
 *                         type: string
 *                       end_point:
 *                         type: string
 *                   departure_time:
 *                     type: string
 *                     format: date-time
 *                   arrival_time:
 *                     type: string
 *                     format: date-time
 *                   middle_stops:
 *                     type: array
 *                     items:
 *                       type: string
 *                   available_seats:
 *                     type: number
 *       400:
 *         description: Missing required query parameters
 *       404:
 *         description: No routes match the search criteria
 *       500:
 *         description: Failed to fetch trips
 */
router.get('/search', authenticateToken, searchTrips);

// Fetch a specific trip by ID
/**
 * @openapi
 * /trips/{id}:
 *   get:
 *     tags:
 *       - Trip
 *     summary: Fetch a specific trip by ID
 *     description: Retrieve details of a specific trip including bus and route information.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the trip to fetch
 *         schema:
 *           type: string
 *           example: "6701a56fd3b6c70012ab3456"
 *     responses:
 *       200:
 *         description: Trip details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 bus_id:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     bus_number:
 *                       type: string
 *                     capacity:
 *                       type: number
 *                 route_id:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     start_point:
 *                       type: string
 *                     end_point:
 *                       type: string
 *                 departure_time:
 *                   type: string
 *                   format: date-time
 *                 arrival_time:
 *                   type: string
 *                   format: date-time
 *                 middle_stops:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Failed to fetch trip
 */
router.get('/:id', authenticateToken, getTripById);

// Update a trip (admin and operator only)
/**
 * @openapi
 * /trips/{id}:
 *   put:
 *     tags:
 *       - Trip
 *     summary: Update a trip (Admin and Operator only)
 *     description: Allows admins or operators to update a trip's details including bus, route, and schedule.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the trip to update
 *         schema:
 *           type: string
 *           example: "6701a56fd3b6c70012ab3456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bus_id:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab7890"
 *               route_id:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab1234"
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-10T08:00:00Z"
 *               arrival_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-10T12:00:00Z"
 *               middle_stops:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Gampaha", "Kegalle"]
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trip updated successfully!"
 *                 trip:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     bus_id:
 *                       type: string
 *                     route_id:
 *                       type: string
 *                     departure_time:
 *                       type: string
 *                     arrival_time:
 *                       type: string
 *                     middle_stops:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Missing required departure or arrival time
 *       403:
 *         description: Access denied
 *       404:
 *         description: Trip not found
 *       409:
 *         description: Bus is already assigned to another trip during this time
 *       500:
 *         description: Failed to update trip
 */
router.put('/:id', authenticateToken,authorizeRoles('admin', 'operator'), updateTrip);

// Delete a trip (admin and operator only)
/**
 * @openapi
 * /trips/{id}:
 *   delete:
 *     tags:
 *       - Trip
 *     summary: Delete a trip (Admin and Operator only)
 *     description: Allows admins or operators to delete a specific trip by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the trip to delete
 *         schema:
 *           type: string
 *           example: "6701a56fd3b6c70012ab3456"
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trip deleted successfully."
 *       403:
 *         description: Access denied
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Failed to delete trip
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'operator'),deleteTrip);

module.exports = router;