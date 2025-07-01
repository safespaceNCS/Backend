const mongoose = require('mongoose');

const CourseRatingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true }, // matches frontend id
  rating: { type: Number, min: 1, max: 5 },
  learned: { type: Boolean, default: false },
  ratedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CourseRating', CourseRatingSchema);
