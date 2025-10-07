const express = require('express');
const router = express.Router();
const {
  createReservation,
  getAllReservations,
  getMyReservations,
  cancelReservation,
} = require('../controllers/reservationController');
const authorizeRoles = require('../middleware/authorizeRoles');
const authenticateToken = require('../middleware/authenticateToken');

// Create New Reservation
/**
 * @openapi
 * /reservations:
 *   post:
 *     tags:
 *       - Reservation
 *     summary: Create new reservations
 *     description: Allows a logged-in user (admin/operator) to reserve one or more seats on a specific bus.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bus_id
 *               - seat_numbers
 *             properties:
 *               bus_id:
 *                 type: string
 *                 example: "6701a56fd3b6c70012ab3456"
 *               seat_numbers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Reservations created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reservations created successfully!"
 *                 ticket_id:
 *                   type: string
 *                   example: "b8f9a7c2-4e9a-4b5d-8e2c-7f9c9b2f3c4d"
 *                 total_fare:
 *                   type: number
 *                   example: 1050
 *       400:
 *         description: Bus ID and seat numbers are required
 *       404:
 *         description: Bus or associated route not found
 *       409:
 *         description: Some seats are already booked
 *       500:
 *         description: Failed to create reservations
 */
router.post('/', authenticateToken, createReservation);

// Fetch All Reservations (Admin only)
/**
 * @openapi
 * /reservations:
 *   get:
 *     tags:
 *       - Reservation
 *     summary: Fetch all reservations (Admin only)
 *     description: Allows an admin to fetch all reservations. Supports filtering by ticket ID or username.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ticket_id
 *         schema:
 *           type: string
 *         description: Filter reservations by ticket ID
 *         example: "b8f9a7c2-4e9a-4b5d-8e2c-7f9c9b2f3c4d"
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter reservations by username
 *         example: "John Doe"
 *     responses:
 *       200:
 *         description: List of reservations
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
 *                   ticket_id:
 *                     type: string
 *                     example: "b8f9a7c2-4e9a-4b5d-8e2c-7f9c9b2f3c4d"
 *                   seat_numbers:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     example: [1, 2, 3]
 *                   total_fare:
 *                     type: number
 *                     example: 1050
 *                   status:
 *                     type: string
 *                     example: "booked"
 *                   user_id:
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
 *                   bus_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6701a56fd3b6c70012ab5678"
 *                       bus_number:
 *                         type: string
 *                         example: "NB-1024"
 *       403:
 *         description: Access denied. Admins only
 *       404:
 *         description: No reservations found for the specified username
 *       500:
 *         description: Failed to fetch reservations
 */
router.get('/', authenticateToken, authorizeRoles('admin'), getAllReservations);

// Fetch Reservations for Logged-In User
/**
 * @openapi
 * /reservations/my:
 *   get:
 *     tags:
 *       - Reservation
 *     summary: Fetch reservations of the logged-in user
 *     description: Allows a user to view all their own reservations with bus details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reservations
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
 *                   ticket_id:
 *                     type: string
 *                     example: "b8f9a7c2-4e9a-4b5d-8e2c-7f9c9b2f3c4d"
 *                   seat_numbers:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     example: [1, 2, 3]
 *                   total_fare:
 *                     type: number
 *                     example: 1050
 *                   status:
 *                     type: string
 *                     example: "booked"
 *                   user_id:
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
 *                   bus_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6701a56fd3b6c70012ab5678"
 *                       bus_number:
 *                         type: string
 *                         example: "NB-1024"
 *       500:
 *         description: Failed to fetch reservations
 */
router.get('/my', authenticateToken, getMyReservations);

// Cancel a Ticket
/**
 * @openapi
 * /reservations/ticket/{ticket_id}:
 *   delete:
 *     tags:
 *       - Reservation
 *     summary: Cancel a ticket
 *     description: Allows a user to cancel their own ticket or an admin to cancel any ticket. All associated reservations will be marked as cancelled.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         description: ID of the ticket to cancel
 *         schema:
 *           type: string
 *           example: "b8f9a7c2-4e9a-4b5d-8e2c-7f9c9b2f3c4d"
 *     responses:
 *       200:
 *         description: Ticket and associated reservations cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket and associated reservations cancelled successfully."
 *                 ticket_id:
 *                   type: string
 *                   example: "b8f9a7c2-4e9a-4b5d-8e2c-7f9c9b2f3c4d"
 *       403:
 *         description: Access denied. User can only cancel their own ticket
 *       404:
 *         description: No active reservations found for this ticket
 *       500:
 *         description: Failed to cancel ticket
 */
router.delete('/ticket/:ticket_id', authenticateToken, cancelReservation);

module.exports = router;