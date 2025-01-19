const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');

// Get user profile with stats
router.get('/profile', auth, userController.getProfile);

// Change password
router.post('/change-password', auth, userController.changePassword);

module.exports = router;
