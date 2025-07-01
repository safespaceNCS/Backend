const express = require('express');
const multer = require('multer');
const { authenticateJWT, isAdmin } = require('../middleware/auth');
const bulkUserController = require('../controllers/bulkUserController');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Admin uploads Excel to create child accounts
router.post('/children/bulk-create', upload.single('file'), bulkUserController.bulkCreateChildren);

module.exports = router;
