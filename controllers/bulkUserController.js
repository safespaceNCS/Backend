const xlsx = require('xlsx');
const { Child, SchoolPsychologist } = require('../models/User');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Helper to generate random password
function generatePassword(length = 10) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// Admin uploads Excel to create child accounts
exports.bulkCreateChildren = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const students = xlsx.utils.sheet_to_json(sheet);
    const results = [];
    const updatedSheet = [];
    for (const student of students) {
      const name = student.name || student.Name || student.NAME;
      const email = student.email || student.Email || student.EMAIL;
      const age = student.age || student.Age || student.AGE || 12;
      // Generate a password for each child
      const password = generatePassword();
      if (!name || !email) {
        results.push({ error: 'Missing name or email', student });
        continue;
      }
      try {
        const child = new Child({ email, name, role: 'Child', age, password });
        await child.save();
        updatedSheet.push({ name, email, age, password, status: 'created' });
        results.push({ name, email, age, password, status: 'created' });
      } catch (err) {
        updatedSheet.push({ name, email, age, password, error: err.message });
        results.push({ name, email, age, password, error: err.message });
      }
    }
    // Optionally, write a summary Excel file
    const xlsxSummary = xlsx.utils.json_to_sheet(updatedSheet);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, xlsxSummary, 'Summary');
    const downloadsDir = path.join(__dirname, '../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }
    const outPath = path.join(downloadsDir, 'students_bulk_summary.xlsx');
    xlsx.writeFile(newWorkbook, outPath);

    // Send the file to the admin by email
    const { User } = require('../models/User');
    const { sendEmail } = require('../utils/email');
    // Find the first admin (or customize as needed)
    const admin = await User.findOne({ role: 'Admin' });
    if (
      admin && admin.email
    ) {
      await sendEmail({
        to: admin.email,
        subject: 'Bulk Student Account Creation Summary',
        template: `<p>Dear Admin,</p><p>Attached is the summary of the latest bulk student account creation.</p>`,
        data: {},
        attachments: [
          {
            filename: 'students_bulk_summary.xlsx',
            path: outPath
          }
        ]
      });
    }
    res.json({ message: 'Accounts processed', results, download: '/downloads/students_bulk_summary.xlsx' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
