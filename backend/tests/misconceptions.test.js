const { detectMisconceptions } = require('../content/misconceptions');
const { bandFor } = require('../controllers/quizAnalyticsController');

test('detects the classical randomness misconception', () => {
  expect(detectMisconceptions('Is superposition just random?')[0].key).toBe('superposition-randomness');
});

test('maps scores to adaptive bands', () => {
  expect(bandFor(59)).toBe('review');
  expect(bandFor(70)).toBe('standard');
  expect(bandFor(81)).toBe('advance');
});
