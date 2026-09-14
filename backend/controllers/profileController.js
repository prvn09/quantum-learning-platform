const pool = require('../config/database');

async function getProfile(req, res, next) {
  try {
    const result = await pool.query('SELECT id, email, display_name, role, avatar_url, bio, created_at FROM users WHERE id = $1', [req.user.sub]);
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    return res.json({ data: result.rows[0] });
  } catch (error) { return next(error); }
}

async function updateProfile(req, res, next) {
  try {
    const { displayName, bio, avatarUrl } = req.body || {};
    const result = await pool.query('UPDATE users SET display_name = COALESCE($1, display_name), bio = COALESCE($2, bio), avatar_url = COALESCE($3, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, display_name, role, avatar_url, bio, created_at', [displayName?.trim(), bio, avatarUrl, req.user.sub]);
    return res.json({ data: result.rows[0] });
  } catch (error) { return next(error); }
}

module.exports = { getProfile, updateProfile };
