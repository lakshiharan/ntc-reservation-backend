const express = require('express');
const router = express.Router();
const {
  addRoute,
  getAllRoutes,
  updateRoute,
  deleteRoute
} = require('../controllers/routeController');
const authorizeRoles = require('../middleware/authorizeRoles');
const authenticateToken = require('../middleware/authenticateToken');

// Add a New Route (Admin Only)
/**
 * @openapi
 * /routes:
 *   post:
 *     tags:
 *       - Route
 *     summary: Add a new route (Admin only)
 *     description: Allows an admin to create a new route with start point, end point, distance, and fare.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_point
 *               - end_point
 *               - distance
 *               - fare
 *             properties:
 *               start_point:
 *                 type: string
 *                 example: "Colombo"
 *               end_point:
 *                 type: string
 *                 example: "Kandy"
 *               distance:
 *                 type: number
 *                 example: 120
 *               fare:
 *                 type: number
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Route created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 start_point:
 *                   type: string
 *                 end_point:
 *                   type: string
 *                 distance:
 *                   type: number
 *                 fare:
 *                   type: number
 *       400:
 *         description: All fields are required
 *       403:
 *         description: Access denied. Admins only
 *       409:
 *         description: Route already exists
 *       500:
 *         description: Failed to create route
 */
router.post('/', authenticateToken, authorizeRoles('admin'),addRoute);

// Fetch All Routes
/**
 * @openapi
 * /routes:
 *   get:
 *     tags:
 *       - Route
 *     summary: Fetch all routes
 *     description: Retrieve a list of all routes with start point, end point, distance, and fare.
 *     responses:
 *       200:
 *         description: List of routes
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
 *                   start_point:
 *                     type: string
 *                     example: "Colombo"
 *                   end_point:
 *                     type: string
 *                     example: "Kandy"
 *                   distance:
 *                     type: number
 *                     example: 120
 *                   fare:
 *                     type: number
 *                     example: 1500
 *       500:
 *         description: Failed to fetch routes
 */
router.get('/', getAllRoutes);

// Update a Route (Admin Only)
/**
 * @openapi
 * /routes/{id}:
 *   put:
 *     tags:
 *       - Route
 *     summary: Update a route (Admin only)
 *     description: Allows an admin to update the details of a specific route by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the route to update
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
 *               start_point:
 *                 type: string
 *                 example: "Colombo"
 *               end_point:
 *                 type: string
 *                 example: "Kandy"
 *               distance:
 *                 type: number
 *                 example: 130
 *               fare:
 *                 type: number
 *                 example: 1600
 *     responses:
 *       200:
 *         description: Route updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 start_point:
 *                   type: string
 *                 end_point:
 *                   type: string
 *                 distance:
 *                   type: number
 *                 fare:
 *                   type: number
 *       403:
 *         description: Access denied. Admins only
 *       404:
 *         description: Route not found
 *       500:
 *         description: Failed to update route
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateRoute);

// Delete a Route (Admin Only)
/**
 * @openapi
 * /routes/{id}:
 *   delete:
 *     tags:
 *       - Route
 *     summary: Delete a route (Admin only)
 *     description: Allows an admin to delete a route by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the route to delete
 *         schema:
 *           type: string
 *           example: "6701a56fd3b6c70012ab3456"
 *     responses:
 *       200:
 *         description: Route deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Route deleted successfully."
 *       403:
 *         description: Access denied. Admins only
 *       404:
 *         description: Route not found
 *       500:
 *         description: Failed to delete route
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteRoute);

module.exports = router;

