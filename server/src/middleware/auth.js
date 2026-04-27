const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

function requireSupervisor(req, res, next) {
  if (req.user?.role !== 'supervisor') {
    return res.status(403).json({ error: 'Supervisor role required' });
  }
  next();
}

module.exports = { authenticate, requireSupervisor };
