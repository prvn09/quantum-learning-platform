const pool = require('../config/database');
const { detectMisconceptions } = require('../content/misconceptions');

function fallbackAnalysis(detected) {
  if (!detected.length) return { detected: false, confidence: 0, message: 'No strong misconception pattern detected. Keep testing predictions against the circuit and measurement results.', recommendations: [] };
  const primary = detected[0];
  return { detected: true, confidence: Math.min(0.98, 0.58 + primary.score * 0.1), misconception: primary.title, explanation: primary.explanation, counterExample: primary.counterExample, recommendations: primary.lessonSlugs };
}

async function refineWithLlm(question, circuit, detected, analysis) {
  if (!process.env.ANTHROPIC_API_KEY || !detected.length) return analysis;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest', max_tokens: 450, system: 'You are a quantum education diagnostician. Ground your answer in the supplied misconception records. Return JSON with keys explanation, counterExample, confidence, recommendations. Do not invent unsupported misconceptions.', messages: [{ role: 'user', content: JSON.stringify({ question, circuit, misconceptionRecords: detected.map(({ key, title, explanation, counterExample, lessonSlugs }) => ({ key, title, explanation, counterExample, lessonSlugs })), initialAnalysis: analysis }) }] }),
  });
  if (!response.ok) return analysis;
  const body = await response.json();
  const text = body.content?.map((part) => part.text || '').join('') || '';
  try { return { ...analysis, ...JSON.parse(text) }; } catch (_error) { return analysis; }
}

async function analyzeAttempt(req, res, next) {
  try {
    const { question = '', circuit = [], attemptId = null } = req.body || {};
    if (typeof question !== 'string' || !Array.isArray(circuit)) return res.status(422).json({ error: 'question must be text and circuit must be an array' });
    const detected = detectMisconceptions(question, circuit);
    const analysis = await refineWithLlm(question, circuit, detected, fallbackAnalysis(detected));
    if (detected.length) {
      for (const misconception of detected) {
        await pool.query('INSERT INTO student_misconceptions (user_id, misconception_key, confidence, evidence, attempt_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, misconception_key) DO UPDATE SET confidence = GREATEST(student_misconceptions.confidence, EXCLUDED.confidence), evidence = EXCLUDED.evidence, attempt_id = EXCLUDED.attempt_id, occurrences = student_misconceptions.occurrences + 1, last_detected_at = CURRENT_TIMESTAMP', [req.user.sub, misconception.key, analysis.confidence || 0.5, JSON.stringify({ question, circuit }), attemptId]);
      }
      for (const lessonSlug of analysis.recommendations || detected[0].lessonSlugs) {
        await pool.query('INSERT INTO review_recommendations (user_id, misconception_key, lesson_slug, reason) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, misconception_key, lesson_slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP', [req.user.sub, detected[0].key, lessonSlug, `Review recommended for ${detected[0].title}`]);
      }
    }
    return res.json({ ...analysis, matchedRecords: detected.map(({ key, title, score }) => ({ key, title, score })) });
  } catch (error) { return next(error); }
}

async function getStudentInsights(req, res, next) {
  try {
    const misconceptions = await pool.query('SELECT misconception_key, confidence, occurrences, last_detected_at FROM student_misconceptions WHERE user_id = $1 ORDER BY last_detected_at DESC', [req.user.sub]);
    const recommendations = await pool.query('SELECT lesson_slug, misconception_key, reason FROM review_recommendations WHERE user_id = $1 AND completed_at IS NULL ORDER BY updated_at DESC', [req.user.sub]);
    return res.json({ misconceptions: misconceptions.rows, recommendations: recommendations.rows });
  } catch (error) { return next(error); }
}

module.exports = { analyzeAttempt, getStudentInsights };
