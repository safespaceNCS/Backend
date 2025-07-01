const express = require('express');
const { authenticateJWT, isChild, isAgent, isAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');
const router = express.Router();

// GET all users (admin only)
router.get('/', authenticateJWT, isAdmin, userController.getAllUsers);

// GET child chat history (hotline agent only)
router.get('/child/:id/chats', authenticateJWT, isAgent, userController.getChildChats);

// DELETE /api/users/me (authenticated child account deletion)
router.delete('/me', authenticateJWT, isChild, userController.deleteOwnAccount);

module.exports = router;
