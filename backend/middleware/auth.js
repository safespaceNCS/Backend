const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function isChild(req, res, next) {
  if (!req.user || req.user.role !== 'Child') {
    return res.status(403).json({ error: 'Forbidden: Child role required' });
  }
  next();
}

function isAgent(req, res, next) {
  if (!req.user || req.user.role !== 'HotlineAgent') {
    return res.status(403).json({ error: 'Forbidden: HotlineAgent role required' });
  }
  next();
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin role required' });
  }
  next();
}

module.exports = { authenticateJWT, isChild, isAgent, isAdmin };
