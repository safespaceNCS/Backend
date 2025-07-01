const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  anonymous: { type: Boolean, default: true },
  feeling: { type: String},
  notify: { type: String }, // e.g. email or phone if not anonymous
  what: { type: String},
  when: { type: String }, // free text or could be Date
  where: { type: String },
  who: { type: String },
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, only if not anonymous
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['seen', 'pending'], default: 'pending' },
  agentNotes: { type: String },
});

module.exports = mongoose.model('Report', ReportSchema);
