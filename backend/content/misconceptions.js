const misconceptions = [
  {
    key: 'superposition-randomness',
    title: 'Superposition is just classical randomness',
    patterns: ['superposition is random', 'superposition means random', 'qubit is randomly', 'coin flip', 'just random'],
    concepts: ['superposition', 'measurement', 'amplitude'],
    explanation: 'A superposition is a coherent quantum state with amplitudes and relative phase. Measurement is probabilistic, but the state before measurement is not simply an unknown classical choice.',
    counterExample: 'Apply H twice to |0>. The first H gives equal measurement probabilities, but the second H returns the qubit to |0> with certainty. That reversible interference cannot be produced by an ordinary hidden coin flip.',
    lessonSlugs: ['superposition-basics', 'qubits-basis-states'],
  },
  {
    key: 'measurement-does-not-change-state',
    title: 'Measurement is passive observation',
    patterns: ['measurement does not change', 'measure without changing', 'measurement only observes', 'look at the qubit'],
    concepts: ['measurement', 'collapse', 'basis'],
    explanation: 'Measurement is an interaction that projects a quantum state into an outcome in the chosen basis. After measurement, the state is generally different from the pre-measurement state.',
    counterExample: 'Measure H|0> in the computational basis. The result is |0> or |1>, and repeating the same measurement immediately returns that same outcome rather than another fresh 50/50 sample.',
    lessonSlugs: ['qubits-basis-states', 'superposition-basics'],
  },
  {
    key: 'entanglement-faster-than-light',
    title: 'Entanglement sends usable information faster than light',
    patterns: ['entanglement faster than light', 'instant communication', 'send message with entanglement', 'teleport information instantly'],
    concepts: ['entanglement', 'bell state', 'measurement'],
    explanation: 'Entanglement creates correlations, but each local result is random. Classical communication is still required to compare results or transmit a chosen message.',
    counterExample: 'A Bell pair can produce matching results, but neither party can choose whether their local result is 0 or 1. Correlation alone is not a controllable communication channel.',
    lessonSlugs: ['entanglement', 'qubits-basis-states'],
  },
  {
    key: 'quantum-parallelism-free-speedup',
    title: 'Quantum parallelism automatically solves every input at once',
    patterns: ['quantum tries every answer', 'all answers at once', 'automatic speedup', 'quantum computers solve everything faster'],
    concepts: ['algorithm', 'amplitude amplification', 'measurement'],
    explanation: 'Quantum algorithms use interference to increase useful amplitudes and suppress others. Preparing many amplitudes is not enough; the algorithm must make the desired information measurable.',
    counterExample: 'Grover search does not let you read every database answer. Its oracle and diffusion steps amplify a marked answer, giving a quadratic rather than unlimited speedup.',
    lessonSlugs: ['grover-algorithm', 'quantum-gates'],
  },
];

function detectMisconceptions(question = '', circuit = []) {
  const text = `${question} ${JSON.stringify(circuit)}`.toLowerCase();
  return misconceptions.map((item) => ({ ...item, score: item.patterns.reduce((score, pattern) => score + (text.includes(pattern) ? 3 : 0), 0) })).filter((item) => item.score > 0).sort((left, right) => right.score - left.score);
}

module.exports = { misconceptions, detectMisconceptions };
