const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { createAccessToken, createOpaqueToken, hashToken } = require('../utils/tokens');

const publicUser = (user) => ({ id: user.id, email: user.email, displayName: user.display_name, role: user.role, avatarUrl: user.avatar_url });
const sessionExpiry = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

async function createSession(user, res) {
  const refreshToken = createOpaqueToken();
  await pool.query('INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [user.id, hashToken(refreshToken), sessionExpiry()]);
  res.json({ user: publicUser(user), accessToken: createAccessToken(user), refreshToken });
}

function validateCredentials(email, password) {
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return 'Enter a valid email address';
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

async function register(req, res, next) {
  try {
    const { email, password, displayName, role = 'student' } = req.body || {};
    const validationError = validateCredentials(email, password) || (!displayName?.trim() ? 'Display name is required' : null);
    if (validationError) return res.status(422).json({ error: validationError });
    if (!['student', 'faculty'].includes(role)) return res.status(422).json({ error: 'Public registration is limited to student or faculty roles' });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query('INSERT INTO users (email, display_name, password_hash, role) VALUES (LOWER($1), $2, $3, $4) RETURNING *', [email, displayName.trim(), passwordHash, role]);
    return createSession(result.rows[0], res);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'An account with that email already exists' });
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(422).json({ error: 'Email and password are required' });
    const result = await pool.query('SELECT * FROM users WHERE email = LOWER($1) AND is_active = TRUE', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
    await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    return createSession(user, res);
  } catch (error) { return next(error); }
}

async function refresh(req, res, next) {
  try {
    const token = req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token is required' });
    const result = await pool.query('SELECT u.* FROM auth_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = TRUE', [hashToken(token)]);
    if (!result.rows[0]) return res.status(401).json({ error: 'Invalid or expired session' });
    await pool.query('UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1', [hashToken(token)]);
    return createSession(result.rows[0], res);
  } catch (error) { return next(error); }
}

async function logout(req, res, next) {
  try {
    if (req.body?.refreshToken) await pool.query('UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1', [hashToken(req.body.refreshToken)]);
    return res.status(204).send();
  } catch (error) { return next(error); }
}

async function requestPasswordReset(req, res, next) {
  try {
    const email = req.body?.email;
    if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(422).json({ error: 'Enter a valid email address' });
    const user = (await pool.query('SELECT id FROM users WHERE email = LOWER($1)', [email])).rows[0];
    if (user) {
      const token = createOpaqueToken();
      await pool.query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL \'30 minutes\')', [user.id, hashToken(token)]);
      if (process.env.NODE_ENV !== 'production') return res.json({ message: 'If the email exists, reset instructions were created', developmentToken: token });
    }
    return res.json({ message: 'If the email exists, reset instructions were sent' });
  } catch (error) { return next(error); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body || {};
    if (!token || typeof password !== 'string' || password.length < 8) return res.status(422).json({ error: 'A valid token and password of at least 8 characters are required' });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query('UPDATE users SET password_hash = $1 WHERE id = (SELECT user_id FROM password_reset_tokens WHERE token_hash = $2 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP) RETURNING id', [passwordHash, hashToken(token)]);
    if (!result.rows[0]) return res.status(400).json({ error: 'Reset token is invalid or expired' });
    await pool.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token_hash = $1', [hashToken(token)]);
    await pool.query('UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1', [result.rows[0].id]);
    return res.json({ message: 'Password updated. Please sign in again.' });
  } catch (error) { return next(error); }
}

module.exports = { register, login, refresh, logout, requestPasswordReset, resetPassword };
