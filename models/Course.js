const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true }, // matches frontend id
  name: { type: String, required: true },
  description: { type: String },
  // Optionally add more fields if needed
});

module.exports = mongoose.model('Course', CourseSchema);
