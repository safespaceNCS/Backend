const express = require('express');
const { registerUser,loginUser, forgotPassword, resetPassword } = require('../controllers/authController');
const router = express.Router();

// Login
router.post('/login', loginUser);
router.post('/register',registerUser );

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;
