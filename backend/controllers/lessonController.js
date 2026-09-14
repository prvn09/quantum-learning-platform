const lessons = [
  { id: 'qubits', title: 'Qubits & Superposition', level: 'foundations', durationMinutes: 25 },
  { id: 'entanglement', title: 'Entanglement Lab', level: 'intermediate', durationMinutes: 35 },
];

function listLessons(_req, res) { res.json({ data: lessons }); }
function getLesson(req, res) {
  const lesson = lessons.find((item) => item.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  return res.json({ data: lesson });
}
module.exports = { listLessons, getLesson };
