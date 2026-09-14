const progress = new Map();

function getProgress(req, res) {
  res.json({ data: progress.get(req.params.userId) || { completedLessons: [], percent: 0 } });
}

function updateProgress(req, res) {
  const current = progress.get(req.params.userId) || { completedLessons: [], percent: 0 };
  const next = { ...current, ...req.body, updatedAt: new Date().toISOString() };
  progress.set(req.params.userId, next);
  res.json({ data: next });
}
module.exports = { getProgress, updateProgress };
