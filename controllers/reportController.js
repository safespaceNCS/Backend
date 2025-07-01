const Report = require('../models/Report');

// Child posts an anonymous report
exports.postAnonymousReport = async (req, res) => {
  try {
    const { anonymous, feeling, notify, what, when, where, who } = req.body;
    const report = new Report({
      anonymous: anonymous !== false, // default true
      feeling,
      notify,
      what,
      when,
      where,
      who,
      child: anonymous === false && req.user ? req.user.id : undefined
    });
    await report.save();
    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Agent gets all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Agent gets a report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
