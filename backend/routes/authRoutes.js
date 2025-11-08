const express = require('express');
const router = express.Router();
const { signup, login, getMe, verifyOTP, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * AUTH ROUTES
 * Handles user registration, login, OTP verification
 */

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// POST /api/auth/signup
// Register a new user account
// Sends OTP to email for verification
router.post('/signup', signup);

// POST /api/auth/verify-otp
// Verify the OTP sent to user's email
// Completes the registration process
router.post('/verify-otp', verifyOTP);

// POST /api/auth/resend-otp
// Resend OTP if user didn't receive it
// Or if OTP expired
router.post('/resend-otp', resendOTP);

// POST /api/auth/login
// Login with email and password
// Returns JWT token for authentication
router.post('/login', login);

// ============================================
// PROTECTED ROUTES (Requires authentication)
// ============================================

// GET /api/auth/me
// Get current logged-in user's information
// Uses JWT token to identify user
router.get('/me', protect, getMe);

module.exports = router;
