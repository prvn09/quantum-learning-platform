const pool = require('../config/database');
const { achievementCatalog, levelFor, awardPoints } = require('../services/gamificationService');

async function getProfileGamification(req, res, next) {
  try {
    const pointsResult = await pool.query('SELECT COALESCE(SUM(points), 0)::integer AS points FROM points_events WHERE user_id = $1', [req.user.sub]);
    const badges = await pool.query('SELECT a.key, a.title, a.description, a.icon, ua.points_awarded, ua.unlocked_at, ua.seen_at FROM achievements a JOIN user_achievements ua ON ua.achievement_key = a.key WHERE ua.user_id = $1 ORDER BY ua.unlocked_at DESC', [req.user.sub]);
    const topics = await pool.query('SELECT topic_slug, completion_percent, best_score, updated_at FROM topic_progress WHERE user_id = $1 ORDER BY updated_at DESC', [req.user.sub]);
    const points = Number(pointsResult.rows[0].points);
    return res.json({ points, level: levelFor(points), badges: badges.rows, topicProgress: topics.rows, catalog: achievementCatalog });
  } catch (error) { return next(error); }
}

async function getLeaderboard(_req, res, next) {
  try {
    const result = await pool.query('SELECT u.display_name, COALESCE(SUM(p.points), 0)::integer AS points FROM users u LEFT JOIN points_events p ON p.user_id = u.id GROUP BY u.id, u.display_name ORDER BY points DESC, u.display_name ASC LIMIT 20');
    return res.json({ leaderboard: result.rows });
  } catch (error) { return next(error); }
}

async function markBadgeSeen(req, res, next) {
  try {
    await pool.query('UPDATE user_achievements SET seen_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND achievement_key = $2', [req.user.sub, req.params.key]);
    return res.status(204).send();
  } catch (error) { return next(error); }
}

async function recordChallenge(req, res, next) {
  try {
    const result = await awardPoints(req.user.sub, 100, 'challenge', req.body?.topicSlug, { score: req.body?.score || 0 });
    return res.json(result);
  } catch (error) { return next(error); }
}

module.exports = { getProfileGamification, getLeaderboard, markBadgeSeen, recordChallenge };
