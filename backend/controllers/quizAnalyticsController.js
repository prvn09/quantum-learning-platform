const pool = require('../config/database');
const { awardPoints } = require('../services/gamificationService');

const difficultyOrder = { review: ['easy', 'easy', 'medium', 'medium', 'hard'], standard: ['easy', 'medium', 'medium', 'hard', 'hard'], advance: ['medium', 'hard', 'hard', 'challenge', 'challenge'] };

function bandFor(score) {
  if (score < 60) return 'review';
  if (score <= 80) return 'standard';
  return 'advance';
}

function recommendationFor(band) {
  if (band === 'review') return { action: 'review', message: 'Review this topic and retry with easier questions first.', nextTopic: null };
  if (band === 'standard') return { action: 'practice', message: 'Keep practicing with the standard question mix.', nextTopic: null };
  return { action: 'advance', message: 'Topic mastered. Continue to the next topic or try challenge questions.', nextTopic: 'next' };
}

async function recordQuizAttempt(req, res, next) {
  try {
    const { topicSlug, score, totalQuestions, timeSpentSeconds = 0, questionResults = [] } = req.body || {};
    if (!topicSlug || !Number.isFinite(score) || !Number.isInteger(totalQuestions) || totalQuestions < 1) return res.status(422).json({ error: 'topicSlug, score, and totalQuestions are required' });
    const normalizedScore = Math.max(0, Math.min(100, score));
    const band = bandFor(normalizedScore);
    const recommendation = recommendationFor(band);
    await pool.query('INSERT INTO quiz_attempts (user_id, topic_slug, score, total_questions, time_spent_seconds, question_results) VALUES ($1, $2, $3, $4, $5, $6)', [req.user.sub, topicSlug, normalizedScore, totalQuestions, Math.max(0, timeSpentSeconds), JSON.stringify(questionResults)]);
    await pool.query('INSERT INTO topic_performance (user_id, topic_slug, best_score, latest_score, attempts, status, updated_at) VALUES ($1, $2, $3, $3, 1, $4, CURRENT_TIMESTAMP) ON CONFLICT (user_id, topic_slug) DO UPDATE SET best_score = GREATEST(topic_performance.best_score, EXCLUDED.latest_score), latest_score = EXCLUDED.latest_score, attempts = topic_performance.attempts + 1, status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP', [req.user.sub, topicSlug, normalizedScore, band]);
    await pool.query('INSERT INTO topic_progress (user_id, topic_slug, completion_percent, best_score) VALUES ($1, $2, $3, $3) ON CONFLICT (user_id, topic_slug) DO UPDATE SET completion_percent = GREATEST(topic_progress.completion_percent, EXCLUDED.completion_percent), best_score = GREATEST(topic_progress.best_score, EXCLUDED.best_score), updated_at = CURRENT_TIMESTAMP', [req.user.sub, topicSlug, normalizedScore]);
    if (timeSpentSeconds > 0) await pool.query('INSERT INTO topic_time_logs (user_id, topic_slug, seconds_spent) VALUES ($1, $2, $3)', [req.user.sub, topicSlug, Math.round(timeSpentSeconds)]);
    const gamification = await awardPoints(req.user.sub, 50, 'quiz', topicSlug, { score: normalizedScore });
    return res.json({ topicSlug, score: normalizedScore, band, questionOrder: difficultyOrder[band], recommendation, gamification });
  } catch (error) { return next(error); }
}

async function getQuestionPlan(req, res, next) {
  try {
    const result = await pool.query('SELECT latest_score, best_score, status FROM topic_performance WHERE user_id = $1 AND topic_slug = $2', [req.user.sub, req.params.topicSlug]);
    const record = result.rows[0];
    const band = record?.status || 'standard';
    return res.json({ topicSlug: req.params.topicSlug, band, questionOrder: difficultyOrder[band], latestScore: record?.latest_score || null, bestScore: record?.best_score || null });
  } catch (error) { return next(error); }
}

async function getDashboard(req, res, next) {
  try {
    const result = await pool.query(`SELECT p.topic_slug, p.latest_score, p.best_score, p.attempts, p.status, COALESCE(SUM(t.seconds_spent), 0)::integer AS time_spent_seconds FROM topic_performance p LEFT JOIN topic_time_logs t ON t.user_id = p.user_id AND t.topic_slug = p.topic_slug WHERE p.user_id = $1 GROUP BY p.topic_slug, p.latest_score, p.best_score, p.attempts, p.status ORDER BY p.updated_at DESC`, [req.user.sub]);
    const topicsNeedingReview = result.rows.filter((topic) => topic.status === 'review');
    return res.json({ topics: result.rows, topicsNeedingReview, reviewCount: topicsNeedingReview.length });
  } catch (error) { return next(error); }
}

module.exports = { recordQuizAttempt, getQuestionPlan, getDashboard, bandFor };
