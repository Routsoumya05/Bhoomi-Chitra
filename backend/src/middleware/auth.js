const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bhoomi-chitra-national-secret-key-2026';

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '401 Unauthorized: Authentication token required.'
    });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateJWT,
  requireAuth
};
