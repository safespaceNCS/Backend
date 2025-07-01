const express = require('express');
const { authenticateJWT, isChild, isAgent } = require('../middleware/auth');
const reportController = require('../controllers/reportController');
const router = express.Router();

// Child posts an anonymous report
router.post('/', authenticateJWT, isChild, reportController.postAnonymousReport);

// Agent gets all reports
router.get('/', authenticateJWT, isAgent, reportController.getAllReports);

// Agent gets a report by ID
router.get('/:id', authenticateJWT, isAgent, reportController.getReportById);

module.exports = router;
