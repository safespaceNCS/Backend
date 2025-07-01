const Report = require('../models/Report');

// Child posts an anonymous report
exports.postAnonymousReport = async (req, res) => {
  try {
    let { anonymous, feeling, notify, what, when, where, who } = req.body;
    // Accept 'Yes' as true, 'No' as false (case-insensitive)
    if (typeof anonymous === 'string') {
      if (anonymous.trim().toLowerCase() === 'yes') anonymous = true;
      else if (anonymous.trim().toLowerCase() === 'no') anonymous = false;
      else anonymous = !!anonymous;
    }
    const childId = req.user ? req.user.id : undefined; // always available from JWT
    const report = new Report({
      anonymous,
      feeling,
      notify,
      what,
      when,
      where,
      who,
      child: !anonymous ? childId : undefined // only store if not anonymous
    });
    await report.save();
    // Always increment reportsCount for the authenticated child
    if (childId) {
      const { Child } = require('../models/User');
      await Child.findByIdAndUpdate(childId, { $inc: { reportsCount: 1 } });
    }
    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Agent gets all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ date: -1 }).lean();
    const { Child } = require('../models/User');
    // For each report, format as requested
    const reportsFormatted = await Promise.all(reports.map(async (report) => {
      let name = '';
      if (report.child) {
        const child = await Child.findById(report.child).lean();
        if (child && child.name) name = child.name;
      }
      // Format date as 'Month Day, Year'
      const dateObj = report.date ? new Date(report.date) : new Date();
      const date = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      // Capitalize status
      const status = report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : '';
      // Anonymous as 'Yes'/'No'
      const anonymous = report.anonymous ? 'Yes' : 'No';
      return {
        id: report._id,
        name,
        date,
        status,
        reporting: {
          where: report.where || '',
          when: report.when || '',
          what: report.what || '',
          who: report.who || '',
          feeling: report.feeling || '',
          anonymous
        }
      };
    }));
    res.json(reportsFormatted);
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

// PUT /api/reports/:id/status - Change report status from pending to seen
exports.changeReportStatus = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.status === 'seen') {
      return res.status(400).json({ error: 'Report already marked as seen' });
    }
    report.status = 'seen';
    await report.save();
    res.json({ message: 'Report status updated to seen', report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get weekly report counts for a given year (52 weeks)
exports.getWeeklyReportStats = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const startOfNextYear = new Date(Date.UTC(year + 1, 0, 1));
    // Aggregate reports by ISO week number
    const stats = await Report.aggregate([
      {
        $match: {
          date: {
            $gte: startOfYear,
            $lt: startOfNextYear
          }
        }
      },
      {
        $addFields: {
          isoWeek: { $isoWeek: "$date" }
        }
      },
      {
        $group: {
          _id: "$isoWeek",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          week: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { week: 1 } }
    ]);
    // Fill in weeks with zero if missing (1-52)
    const result = Array.from({ length: 52 }, (_, i) => ({ week: i + 1, count: 0 }));
    stats.forEach(s => {
      if (s.week >= 1 && s.week <= 52) result[s.week - 1].count = s.count;
    });
    res.json({ year, weeklyCounts: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get count of flagged and not flagged children for bar chart
exports.getFlaggedChildrenStats = async (req, res) => {
  try {
    const { Child } = require('../models/User');
    const [flagged, notFlagged] = await Promise.all([
      Child.countDocuments({ isFlagged: true }),
      Child.countDocuments({ isFlagged: false })
    ]);
    res.json({ flagged, notFlagged });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
