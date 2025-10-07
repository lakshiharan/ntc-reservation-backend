const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
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
 * /api/buses:
 *   post:
 *     tags:
 *       - Bus
 *     summary: Add a new bus (Admin & Operator only)
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
 *                 example: "NB-1234"
 *               capacity:
 *                 type: integer
 *                 example: 50
 *               route_id:
 *                 type: string
 *                 example: "64fe1a0b5d3a9f12345abc"
 *               bus_permission_number:
 *                 type: string
 *                 example: "PERM-98765"
 *     responses:
 *       201:
 *         description: Bus created successfully
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden (Admins & Operators only)
 *       409:
 *         description: Conflict (Bus number or permission exists)
 *       500:
 *         description: Server error
 */
router.post('/',authenticateToken, addBus);

// Get all buses (Admin only)
/**
 * @openapi
 * /api/buses:
 *   get:
 *     tags:
 *       - Bus
 *     summary: Get all buses (Admin only)
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
 *                   bus_number:
 *                     type: string
 *                   capacity:
 *                     type: integer
 *                   route_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       start_point:
 *                         type: string
 *                       end_point:
 *                         type: string
 *                   bus_owner:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       403:
 *         description: Access denied. Admins only.
 *       500:
 *         description: Failed to fetch buses.
 */
router.get('/',authenticateToken, getAllBuses);

// Get buses for the logged-in operator
router.get('/my',authenticateToken, getMyBuses);

// Update a bus (Admin only)
router.put('/:id',authenticateToken, updateBus);

// Delete a bus (Admin only or bus owner)
router.delete('/:id',authenticateToken, deleteBus);

module.exports = router;
