const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vaultapp-secret-key-2024';
const JWT_EXPIRY = '24h';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyToken, JWT_SECRET };
