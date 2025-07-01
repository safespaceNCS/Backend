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

// Agent changes report status from pending to seen
router.put('/:id/status', authenticateJWT, isAgent, reportController.changeReportStatus);

// Agent gets weekly report stats for a year (for graph)
router.get('/stats/weekly', authenticateJWT, isAgent, reportController.getWeeklyReportStats);

// Agent gets flagged/not-flagged children stats for bar chart
router.get('/stats/flagged', authenticateJWT, isAgent, reportController.getFlaggedChildrenStats);

module.exports = router;
