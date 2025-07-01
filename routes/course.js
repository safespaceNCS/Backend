const express = require('express');
const { authenticateJWT, isChild } = require('../middleware/auth');
const courseController = require('../controllers/courseController');
const router = express.Router();

// Get all courses
router.get('/', authenticateJWT, courseController.getAllCourses);

// Get course by id
router.get('/:id', authenticateJWT, courseController.getCourseById);

// Get not yet learned courses for the logged-in student
router.get('/not-learned/all', authenticateJWT, isChild, courseController.getNotLearnedCourses);

// Rate a course (child only)
router.post('/rate', authenticateJWT, isChild, courseController.rateCourse);

module.exports = router;
