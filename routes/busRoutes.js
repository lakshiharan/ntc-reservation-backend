const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  addBus,
  getAllBuses,
  getMyBuses,
  updateBus,
  deleteBus
} = require('../controllers/busController');

// Add a new bus (Admin and Operator only)
/**
 * @openapi
 * /buses:
 *   post:
 *     tags:
 *       - Bus
 *     summary: Add a new bus (Admin and Operator only)
 *     description: Allows admins and operators to create a new bus with details like bus number, capacity, route, and permission number.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bus_number
 *               - capacity
 *               - route_id
 *               - bus_permission_number
 *             properties:
 *               bus_number:
 *                 type: string
 *                 example: "NB-1024"
 *               capacity:
 *                 type: integer
 *                 example: 40
 *               route_id:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab3456"
 *               bus_permission_number:
 *                 type: string
 *                 example: "BP-5566"
 *     responses:
 *       201:
 *         description: Bus added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bus added successfully!"
 *                 bus:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     bus_number:
 *                       type: string
 *                     capacity:
 *                       type: integer
 *                     route_id:
 *                       type: string
 *                     bus_owner:
 *                       type: string
 *                     bus_permission_number:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Access denied. Admins and operators only
 *       409:
 *         description: Bus number or permission number already exists
 *       500:
 *         description: Failed to create bus
 */
router.post('/',authenticateToken, authorizeRoles('admin', 'operator'), addBus);

// Get all buses (Admin only)
/**
 * @openapi
 * /buses:
 *   get:
 *     tags:
 *       - Bus
 *     summary: Get all buses (Admin only)
 *     description: Allows an admin to fetch a list of all buses, including their routes and owners.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all buses
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
 *                   bus_number:
 *                     type: string
 *                     example: "NB-1024"
 *                   capacity:
 *                     type: integer
 *                     example: 40
 *                   bus_permission_number:
 *                     type: string
 *                     example: "BP-5566"
 *                   route_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6701a56fd3b6c70012ab5678"
 *                       start_point:
 *                         type: string
 *                         example: "Colombo"
 *                       end_point:
 *                         type: string
 *                         example: "Kandy"
 *                   bus_owner:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6701a56fd3b6c70012ab6789"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john@example.com"
 *       403:
 *         description: Access denied. Admins only
 *       500:
 *         description: Failed to fetch buses
 */
router.get('/',authenticateToken, authorizeRoles('admin'), getAllBuses);

// Get buses for the logged-in operator
/**
 * @openapi
 * /buses/my:
 *   get:
 *     tags:
 *       - Bus
 *     summary: Get buses owned by the authenticated operator
 *     description: Allows an operator to fetch all buses they own. Only accessible to users with the 'operator' role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of operator's buses
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
 *                   bus_number:
 *                     type: string
 *                     example: "NB-1024"
 *                   capacity:
 *                     type: integer
 *                     example: 40
 *                   bus_permission_number:
 *                     type: string
 *                     example: "BP-5566"
 *                   route_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6701a56fd3b6c70012ab5678"
 *                       start_point:
 *                         type: string
 *                         example: "Colombo"
 *                       end_point:
 *                         type: string
 *                         example: "Kandy"
 *                   bus_owner:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6701a56fd3b6c70012ab6789"
 *                       name:
 *                         type: string
 *                         example: "Jane Operator"
 *                       email:
 *                         type: string
 *                         example: "jane@example.com"
 *       403:
 *         description: Access denied. Operators only
 *       500:
 *         description: Failed to fetch operator buses
 */
router.get('/my',authenticateToken, authorizeRoles('operator'), getMyBuses);

// Update a bus (Admin only)
/**
 * @openapi
 * /buses/{id}:
 *   put:
 *     tags:
 *       - Bus
 *     summary: Update a bus by ID (Admin only)
 *     description: Allows an admin to update a bus’s details such as bus number, capacity, route, permission number, or owner.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the bus to update
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
 *               bus_number:
 *                 type: string
 *                 example: "NB-1025"
 *               capacity:
 *                 type: integer
 *                 example: 42
 *               route_id:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab5678"
 *               bus_permission_number:
 *                 type: string
 *                 example: "BP-5567"
 *               bus_owner:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab6789"
 *     responses:
 *       200:
 *         description: Bus updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bus updated successfully!"
 *                 bus:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     bus_number:
 *                       type: string
 *                     capacity:
 *                       type: integer
 *                     route_id:
 *                       type: string
 *                     bus_owner:
 *                       type: string
 *                     bus_permission_number:
 *                       type: string
 *       403:
 *         description: Access denied. Admins only
 *       404:
 *         description: Bus not found
 *       409:
 *         description: Bus number or permission number already exists
 *       500:
 *         description: Failed to update bus
 */
router.put('/:id',authenticateToken, authorizeRoles('admin'), updateBus);

// Delete a bus (Admin only or bus owner)
/**
 * @openapi
 * /buses/{id}:
 *   delete:
 *     tags:
 *       - Bus
 *     summary: Delete a bus by ID
 *     description: Allows an admin to delete any bus or an operator to delete only their own buses.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the bus to delete
 *         schema:
 *           type: string
 *           example: "6701a56fd3b6c70012ab3456"
 *     responses:
 *       200:
 *         description: Bus deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bus deleted successfully."
 *       403:
 *         description: Access denied. Only admins or the bus owner can delete
 *       404:
 *         description: Bus not found
 *       500:
 *         description: Failed to delete bus
 */
router.delete('/:id',authenticateToken, deleteBus);

module.exports = router;
