const express = require('express');
const router = express.Router();

const { register, login, getProfile, logout, updateProfile, onBoardUser, forgotPassword, verifyOtp, resetPassword, deleteUser, listedTokens } = require('../controllers/authController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');
const { registerLimiter, loginLimiter, forgotPassBtnLimiter } = require('../middleware/rateLimiter.js');
const upload = require('../utils/upload');

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile/update', verifyToken, updateProfile);
router.post('/logout', verifyToken, logout);
router.post('/onboarding', verifyToken, onBoardUser);
router.post('/forgot-password', forgotPassBtnLimiter, forgotPassword);
router.post('/verifyOtp', verifyOtp);
router.post('/reset-password', resetPassword);
router.delete('/delete', verifyToken, deleteUser);

module.exports = router;   