require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const lessonData = [
  ['introduction-qubits', 'Introduction to Qubits', 'Foundational quantum information', 1],
  ['superposition-basics', 'Superposition Basics', 'Amplitudes and the Hadamard gate', 2],
  ['entanglement', 'Entanglement', 'Correlated multi-qubit states', 3],
  ['quantum-gates', 'Quantum Gates', 'X, Y, Z, and Hadamard operations', 4],
  ['deutsch-jozsa', 'Deutsch-Jozsa Algorithm', 'Oracle-based classification', 5],
  ['grover-algorithm', "Grover's Algorithm", 'Amplitude amplification and search', 6],
  ['shor-algorithm', "Shor's Algorithm Basics", 'Period finding and cryptography', 7],
];
const misconceptions = Array.from({ length: 20 }, (_, index) => ({ description: `Common quantum misconception ${index + 1}`, explanation: 'Use a circuit experiment and compare prediction with measurement to test this idea.', related: ['superposition-basics', 'entanglement'] }));
const achievements = [
  ['first-circuit', 'First Circuit', 'Complete your first circuit activity.', '⚡', 50], ['superposition-master', 'Superposition Master', 'Score 80% on superposition.', '◈', 100], ['quiz-streak', 'Quiz Streak', 'Complete three quizzes.', '✦', 150], ['quantum-explorer', 'Quantum Explorer', 'Earn 500 points.', '◎', 200],
  ...Array.from({ length: 11 }, (_, index) => [`achievement-${index + 5}`, `Quantum Milestone ${index + 5}`, 'Keep exploring quantum concepts.', '◇', 50]),
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const lessonIds = {};
    for (const [slug, title, description, order] of lessonData) {
      const result = await client.query('INSERT INTO lessons (slug, title, description, level, duration_minutes, lesson_order, content) VALUES ($1, $2, $3, $4, 35, $5, $6) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, lesson_order = EXCLUDED.lesson_order RETURNING id', [slug, title, description, `level-${order}`, order, JSON.stringify({ objectives: [`Understand ${title}`, 'Predict a circuit outcome', 'Compare theory and measurement'] })]);
      lessonIds[slug] = result.rows[0].id;
      for (let index = 1; index <= 8; index += 1) {
        await client.query('INSERT INTO quiz_questions (lesson_id, question, options, correct_answer, type, difficulty) SELECT $1, $2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE lesson_id = $1 AND question = $2)', [lessonIds[slug], `${title}: checkpoint question ${index}`, JSON.stringify(['|0>', '|1>', 'Both with amplitudes', 'Neither']), 'Both with amplitudes', index % 3 === 0 ? 'circuit' : 'mcq', index <= 2 ? 'easy' : index <= 5 ? 'standard' : 'hard']);
      }
    }
    for (const item of misconceptions) await client.query('INSERT INTO misconceptions (description, explanation, related_lessons) VALUES ($1, $2, $3) ON CONFLICT (description) DO NOTHING', [item.description, item.explanation, JSON.stringify(item.related)]);
    for (const achievement of achievements) await client.query('INSERT INTO achievements (key, title, description, icon, points) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (key) DO NOTHING', achievement);
    const passwordHash = await bcrypt.hash(process.env.SEED_FACULTY_PASSWORD || 'ChangeMe!Faculty123', 12);
    const faculty = await client.query('INSERT INTO users (email, display_name, password_hash, role) VALUES ($1, $2, $3, \'faculty\') ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id', [process.env.SEED_FACULTY_EMAIL || 'faculty@quantumatlas.local', 'Quantum Atlas Faculty', passwordHash]);
    await client.query('INSERT INTO faculty_classes (faculty_id, name) SELECT $1, \'Quantum Atlas Cohort\' WHERE NOT EXISTS (SELECT 1 FROM faculty_classes WHERE faculty_id = $1)', [faculty.rows[0].id]);
    await client.query('COMMIT');
    console.log(`Seeded ${lessonData.length} lessons, 56 questions, 20 misconceptions, 15 achievements.`);
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); await pool.end(); }
}
seed().catch((error) => { console.error(error); process.exitCode = 1; });
