const jwt = require('jsonwebtoken');
const config = require('config');

function mailAuth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied: Token not found');

  try {
    const decoded = jwt.verify(token, config.get('mailTokenKey'));
    req.token = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).send('Access denied: token expired');
    if (error.name === 'JsonWebTokenError') return res.status(401).send('Access denied: token invalid');
    return res.status(500).send('Internal server error');
  }
};

module.exports = mailAuth