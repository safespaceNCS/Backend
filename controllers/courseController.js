const Course = require('../models/Course');
const CourseRating = require('../models/CourseRating');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get course by id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: req.params.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get not yet learned courses for a student
exports.getNotLearnedCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allCourses = await Course.find();
    const learnedRatings = await CourseRating.find({ student: studentId, learned: true });
    const learnedCourseIds = learnedRatings.map(r => r.courseId);
    const notLearned = allCourses.filter(c => !learnedCourseIds.includes(c.courseId));
    res.json(notLearned);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add or update a rating for a course by a student
exports.rateCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, rating, learned } = req.body;
    if (!courseId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid courseId and rating (1-5) required' });
    }
    // Upsert: update if exists, else create
    const courseRating = await CourseRating.findOneAndUpdate(
      { student: studentId, courseId },
      { rating, learned: !!learned, ratedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ message: 'Course rated', courseRating });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
