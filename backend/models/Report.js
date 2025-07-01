const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  anonymous: { type: Boolean, default: true },
  feeling: { type: String, required: true },
  notify: { type: String }, // e.g. email or phone if not anonymous
  what: { type: String, required: true },
  when: { type: String }, // free text or could be Date
  where: { type: String },
  who: { type: String },
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, only if not anonymous
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['open', 'reviewed', 'closed'], default: 'open' },
  agentNotes: { type: String },
});

module.exports = mongoose.model('Report', ReportSchema);
