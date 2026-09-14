const pool = require('../config/database');

const achievementCatalog = [
  { key: 'first-circuit', title: 'First Circuit', description: 'Complete your first circuit activity.', icon: '⚡', points: 50 },
  { key: 'superposition-master', title: 'Superposition Master', description: 'Score at least 80% on Superposition Basics.', icon: '◈', points: 100 },
  { key: 'quiz-streak', title: 'Quiz Streak', description: 'Complete three quizzes.', icon: '✦', points: 150 },
  { key: 'quantum-explorer', title: 'Quantum Explorer', description: 'Earn 500 learning points.', icon: '◎', points: 200 },
];

function levelFor(points) {
  if (points >= 500) return { name: 'Advanced', min: 500, next: null };
  if (points >= 200) return { name: 'Intermediate', min: 200, next: 500 };
  return { name: 'Beginner', min: 0, next: 200 };
}

async function awardPoints(userId, points, eventType, topicSlug, metadata = {}) {
  await pool.query('INSERT INTO points_events (user_id, event_type, points, topic_slug, metadata) VALUES ($1, $2, $3, $4, $5)', [userId, eventType, points, topicSlug || null, JSON.stringify(metadata)]);
  const earned = [];
  const quizCount = Number((await pool.query('SELECT COUNT(*)::integer AS count FROM points_events WHERE user_id = $1 AND event_type = \'quiz\'', [userId])).rows[0].count);
  const totalPoints = Number((await pool.query('SELECT COALESCE(SUM(points), 0)::integer AS points FROM points_events WHERE user_id = $1', [userId])).rows[0].points);
  const candidates = [];
  if (quizCount >= 1) candidates.push('first-circuit');
  if (topicSlug === 'lesson-2' && metadata.score >= 80) candidates.push('superposition-master');
  if (quizCount >= 3) candidates.push('quiz-streak');
  if (totalPoints >= 500) candidates.push('quantum-explorer');
  for (const key of candidates) {
    const achievement = achievementCatalog.find((item) => item.key === key);
    const result = await pool.query('INSERT INTO user_achievements (user_id, achievement_key, points_awarded) VALUES ($1, $2, $3) ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING achievement_key', [userId, key, achievement.points]);
    if (result.rows[0]) earned.push(achievement);
  }
  return { totalPoints, level: levelFor(totalPoints), earned };
}

module.exports = { achievementCatalog, levelFor, awardPoints };
