// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getLoggedInUser, getAllUsers, deleteUser, updateUser } = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// User registration and login routes
/**
 * @openapi
 * /users/register:
 *   post:
 *     tags:
 *       - User
 *     summary: Register a new user
 *     description: Create a new user account with name, email, password, role, and phone number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 example: "commuter"
 *               phone_number:
 *                 type: string
 *                 example: "+94771234567"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully!"
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Failed to register user
 */
router.post('/register', registerUser);

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags:
 *       - User
 *     summary: Login a user
 *     description: Authenticate a user and return a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful!"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 role:
 *                   type: string
 *                   example: "commuter"
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Login failed
 */
router.post('/login', loginUser);


// Protected routes (authentication required)

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Fetch logged-in user details
 *     description: Returns the profile details of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6501a56fd3b6c70012ab1234"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *                 role:
 *                   type: string
 *                   example: "commuter"
 *                 phone_number:
 *                   type: string
 *                   example: "+94771234567"
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user details
 */
router.get('/me', authenticateToken, getLoggedInUser);


/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - User
 *     summary: Fetch all users (Admin only)
 *     description: Returns a list of all users. Accessible only by admin users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "6501a56fd3b6c70012ab1234"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *                   role:
 *                     type: string
 *                     example: "commuter"
 *                   phone_number:
 *                     type: string
 *                     example: "+94771234567"
 *       403:
 *         description: Access denied. Admins only.
 *       500:
 *         description: Failed to fetch users
 */
router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);  // Admin only

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete a user (Admin only)
 *     description: Deletes a user by ID. Accessible only by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *           example: "6501a56fd3b6c70012ab1234"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully."
 *       403:
 *         description: Access denied. Admins only.
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 */
router.delete('/:id', authenticateToken,authorizeRoles('admin'), deleteUser);  // Admin only

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update a user (Admin only)
 *     description: Updates the details of a user by ID. Accessible only by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *           example: "6501a56fd3b6c70012ab1234"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               role:
 *                 type: string
 *                 example: "commuter"
 *               phone_number:
 *                 type: string
 *                 example: "+94771234567"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully!"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6501a56fd3b6c70012ab1234"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     role:
 *                       type: string
 *                       example: "commuter"
 *                     phone_number:
 *                       type: string
 *                       example: "+94771234567"
 *       403:
 *         description: Access denied. Admins only.
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 */
router.put('/:id', authenticateToken,authorizeRoles('admin'), updateUser);  // Admin only

module.exports = router;
