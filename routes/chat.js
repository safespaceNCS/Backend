const express = require('express');
const { authenticateJWT, isChild } = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const router = express.Router();

// POST /api/chat
router.post('/', authenticateJWT, isChild, chatController.childChat);

module.exports = router;
