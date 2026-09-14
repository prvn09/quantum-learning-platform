const pool = require('../config/database');
const PDFDocument = require('pdfkit');

async function scopedStudent(facultyId, studentId) {
  const result = await pool.query('SELECT u.id, u.display_name, u.email FROM users u JOIN class_members cm ON cm.student_id = u.id JOIN faculty_classes fc ON fc.id = cm.class_id WHERE fc.faculty_id = $1 AND u.id = $2 LIMIT 1', [facultyId, studentId]);
  return result.rows[0];
}

async function detail(req, res, next) {
  try {
    const student = await scopedStudent(req.user.sub, req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student is not in your class' });
    const [attempts, progress, time, misconceptions] = await Promise.all([
      pool.query('SELECT topic_slug, score, total_questions, time_spent_seconds, created_at FROM quiz_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [student.id]),
      pool.query('SELECT topic_slug, completion_percent, best_score, updated_at FROM topic_progress WHERE user_id = $1 ORDER BY updated_at DESC', [student.id]),
      pool.query('SELECT topic_slug, SUM(seconds_spent)::integer AS seconds FROM topic_time_logs WHERE user_id = $1 GROUP BY topic_slug ORDER BY seconds DESC', [student.id]),
      pool.query('SELECT misconception_key, confidence, occurrences, last_detected_at FROM student_misconceptions WHERE user_id = $1 ORDER BY last_detected_at DESC', [student.id]),
    ]);
    const interventions = misconceptions.rows.slice(0, 4).map((item) => ({ misconception: item.misconception_key, message: item.misconception_key === 'superposition-randomness' ? 'Review Superposition Basics and compare H followed by H.' : `Review the ${item.misconception_key.replaceAll('-', ' ')} lesson with a guided circuit.` }));
    return res.json({ student, timeline: attempts.rows, attempts: attempts.rows, progress: progress.rows, timeByTopic: time.rows, misconceptions: misconceptions.rows, interventions });
  } catch (error) { return next(error); }
}

async function sendMessage(req, res, next) {
  try {
    const student = await scopedStudent(req.user.sub, req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student is not in your class' });
    if (!req.body?.message?.trim()) return res.status(422).json({ error: 'Message is required' });
    const result = await pool.query('INSERT INTO student_messages (faculty_id, student_id, message) VALUES ($1, $2, $3) RETURNING *', [req.user.sub, student.id, req.body.message.trim()]);
    return res.status(201).json({ message: result.rows[0] });
  } catch (error) { return next(error); }
}

async function csv(req, res, next) { try { const data = await detailData(req.user.sub, req.params.studentId); if (!data) return res.status(404).json({ error: 'Student is not in your class' }); const rows = [['topic', 'score', 'completion_percent', 'time_seconds'], ...data.progress.map((topic) => [topic.topic_slug, topic.best_score, topic.completion_percent, data.timeByTopic.find((time) => time.topic_slug === topic.topic_slug)?.seconds || 0])]; res.type('text/csv').attachment('student-progress.csv').send(rows.map((row) => row.join(',')).join('\n')); } catch (error) { return next(error); } }
async function pdf(req, res, next) { try { const data = await detailData(req.user.sub, req.params.studentId); if (!data) return res.status(404).json({ error: 'Student is not in your class' }); const doc = new PDFDocument({ margin: 48 }); res.type('application/pdf').attachment('student-progress.pdf'); doc.pipe(res).fontSize(20).text(`Student Progress: ${data.student.display_name}`).moveDown().fontSize(11).text(`Email: ${data.student.email}`).moveDown(); data.progress.forEach((topic) => doc.text(`${topic.topic_slug} | ${topic.best_score}% score | ${topic.completion_percent}% complete`)); doc.end(); } catch (error) { return next(error); } }
async function detailData(facultyId, studentId) { const student = await scopedStudent(facultyId, studentId); if (!student) return null; const [progress, time] = await Promise.all([pool.query('SELECT topic_slug, completion_percent, best_score FROM topic_progress WHERE user_id = $1', [student.id]), pool.query('SELECT topic_slug, SUM(seconds_spent)::integer AS seconds FROM topic_time_logs WHERE user_id = $1 GROUP BY topic_slug', [student.id])]); return { student, progress: progress.rows, timeByTopic: time.rows }; }
module.exports = { detail, sendMessage, csv, pdf };
