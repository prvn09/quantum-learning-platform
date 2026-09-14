const pool = require('../config/database');

async function getDashboardAnalytics(req, res, next) {
  try {
    const userId = req.user.sub;
    const [progress, time, topicTime, scores, activity, classAverage] = await Promise.all([
      pool.query('SELECT topic_slug, completion_percent, best_score FROM topic_progress WHERE user_id = $1 ORDER BY topic_slug', [userId]),
      pool.query('SELECT COALESCE(SUM(seconds_spent), 0)::integer AS total_seconds FROM topic_time_logs WHERE user_id = $1', [userId]),
      pool.query('SELECT topic_slug AS topic, COALESCE(SUM(seconds_spent), 0)::integer AS seconds FROM topic_time_logs WHERE user_id = $1 GROUP BY topic_slug ORDER BY seconds DESC', [userId]),
      pool.query('SELECT topic_slug, score, created_at FROM quiz_attempts WHERE user_id = $1 ORDER BY created_at ASC LIMIT 50', [userId]),
      pool.query("SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') AS day, COALESCE(SUM(seconds_spent), 0)::integer AS seconds FROM topic_time_logs WHERE user_id = $1 AND created_at > CURRENT_DATE - INTERVAL '13 days' GROUP BY created_at::date ORDER BY day", [userId]),
      pool.query('SELECT COALESCE(AVG(latest_score), 0)::numeric(5,2) AS average FROM topic_performance WHERE user_id <> $1', [userId]),
    ]);
    const mastered = progress.rows.filter((topic) => Number(topic.best_score) >= 80);
    const needingReview = progress.rows.filter((topic) => Number(topic.best_score) < 60);
    const totalSeconds = Number(time.rows[0].total_seconds);
    const completedTopics = mastered.length;
    const totalTopics = Math.max(progress.rows.length, 7);
    const streak = activity.rows.length ? Math.min(12, activity.rows.length) : 0;
    return res.json({
      overallCompletion: Math.round((completedTopics / totalTopics) * 100),
      totalSeconds,
      timeByTopic: topicTime.rows,
      scoreTrend: scores.rows.map((score) => ({ topic: score.topic_slug, score: Number(score.score), date: score.created_at })),
      mastered,
      needingReview,
      currentLevel: completedTopics >= 5 ? 'Advanced' : completedTopics >= 2 ? 'Intermediate' : 'Beginner',
      estimatedMinutesRemaining: Math.max(0, (totalTopics - completedTopics) * 35),
      streak,
      activity: activity.rows,
      classAverage: Number(classAverage.rows[0].average) || 0,
    });
  } catch (error) { return next(error); }
}

module.exports = { getDashboardAnalytics };
