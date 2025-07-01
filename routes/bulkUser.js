const express = require('express');
const multer = require('multer');
const { authenticateJWT, isAdmin } = require('../middleware/auth');
const bulkUserController = require('../controllers/bulkUserController');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Admin uploads Excel to create child accounts
router.post('/children/bulk-create', authenticateJWT, isAdmin, upload.single('file'), bulkUserController.bulkCreateChildren);

module.exports = router;
