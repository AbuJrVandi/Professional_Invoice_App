const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Update profile route (protected)
router.put('/profile', authenticateJWT, updateProfile);

module.exports = router; 