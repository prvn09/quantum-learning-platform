const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function createAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });
}

function createOpaqueToken() {
  return crypto.randomBytes(48).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { createAccessToken, createOpaqueToken, hashToken };
