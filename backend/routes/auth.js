/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: JohnDoe
 *               email:
 *                 type: string
 *                 example: johnwick@yopmail.com
 *               password:
 *                 type: string
 *                 example: "Qwer!234"
 *               role:
 *                 type: string
 *                 enum: [user, creator]
 *                 example: creator
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: johnwick@yopmail.com
 *               password:
 *                 type: string
 *                 example: "Qwer!234"
 *               rememberMe:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get logged in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/profile/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent
 */

/**
 * @swagger
 * /api/auth/verifyOtp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: Delete logged-in user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - password
 *             properties:
 *               reason:
 *                 type: string
 *                 enum:
 *                   - I no longer attend events
 *                   - I found a better event platform
 *                   - Too many notifications or emails
 *                   - Privacy or data concerns
 *                   - App is difficult to use
 *                   - Events are not relevant to me
 *                   - Facing technical issues or bugs
 *                   - Created account by mistake
 *                   - I don’t trust the platform
 *                   - Poor event quality or experience
 *                   - Duplicate account
 *                   - Other
 *                 example: I no longer attend events
 *               feedback:
 *                 type: string
 *                 example: I am deleting my account due to personal reasons.
 *               password:
 *                 type: string
 *                 example: Qwer!234
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Missing fields, invalid reason, or invalid password
 *       401:
 *         description: Unauthorized or user not found
 */

const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } = require('../validator/auth.validator');


const { register, user, login, getProfile, logout, updateProfile, onBoardUser, forgotPassword, verifyOtp, resetPassword, deleteUser, listedTokens } = require('../controllers/authController.js');

const { verifyToken } = require('../middleware/authMiddleware.js');

const { registerLimiter, loginLimiter, forgotPassBtnLimiter, verifyOtpLimiter, resetBtnLimiter, deleteBtnLimiter } = require('../middleware/rateLimiter.js');

const upload = require('../utils/upload');

router.post('/register', validate(registerSchema), registerLimiter, register);
router.get('/user', user);
router.post('/login', validate(loginSchema), loginLimiter, login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile/update', verifyToken, validate(updateProfileSchema), updateProfile);
router.post('/logout', verifyToken, logout);
router.post('/onboarding', verifyToken, onBoardUser);
router.post('/forgot-password', forgotPassBtnLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/verifyOtp', verifyOtpLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', resetBtnLimiter, validate(resetPasswordSchema), resetPassword);
router.delete('/delete', deleteBtnLimiter, verifyToken, deleteUser);

module.exports = router;

// npx sequelize-cli migration:generate --name create-account-deletion-feedbacks