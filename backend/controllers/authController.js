const { User, Child, HotlineAgent, SchoolPsychologist, Admin } = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

async function registerUser(req, res) {
  try {
    const { email, name, password, role, age } = req.body;
    let user;
    if (role === 'Child') {
      if (typeof age !== 'number' || age < 10 || age > 17) {
        return res.status(400).json({ error: 'Valid age is required for Child registration' });
      }
      user = new Child({ email, name, password, role, age });
    } else if (role === 'HotlineAgent') {
      user = new HotlineAgent({ email, name, password, role });
    } else if (role === 'SchoolPsychologist') {
      user = new SchoolPsychologist({ email, name, password, role });
    } else if (role === 'Admin') {
      user = new Admin({ email, name, password, role });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Forgot password: send reset link securely
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    // Always respond with success for privacy
    const user = await User.findOne({ email });
    if (user) {
      // Defensive: ensure email is valid and not empty
      if (typeof email !== 'string' || !email.trim()) {
        console.error('Forgot password: invalid or empty email:', email);
        return res.status(400).json({ error: 'Invalid email address.' });
      }
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 minutes
      await user.save();
      const resetLink = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;
      console.log('Sending password reset to:', email);
      await sendEmail({
        to: email.trim(),
        template: 'passwordReset',
        data: {
          name: user.name,
          resetUrl: resetLink
        }
      });
    }
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Reset password (with token)
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword required' });
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
