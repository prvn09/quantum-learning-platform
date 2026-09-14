const documents = [
  { id: 'qubit-basics', title: 'Qubits and basis states', topics: ['qubit', 'basis', 'measurement'], text: 'A qubit is a two-level quantum system. The computational basis states are |0> and |1>. Measurement in that basis returns one of those outcomes, with probabilities determined by the squared magnitudes of the amplitudes.' },
  { id: 'superposition', title: 'Superposition and the Hadamard gate', topics: ['superposition', 'hadamard', 'amplitude'], text: 'The Hadamard gate maps |0> to (|0> + |1>) / sqrt(2), producing equal measurement probabilities. Amplitudes can be complex; probabilities are obtained from squared magnitudes.' },
  { id: 'entanglement', title: 'Entanglement and CNOT', topics: ['entanglement', 'cnot', 'bell'], text: 'Applying H to the control qubit followed by CNOT creates the Bell state (|00> + |11>) / sqrt(2). The outcomes are correlated even though each individual qubit is locally uncertain.' },
  { id: 'gates', title: 'X, Y, Z and quantum gates', topics: ['x', 'y', 'z', 'gate'], text: 'X acts like a bit flip, exchanging |0> and |1>. Z changes the phase of |1> without changing computational-basis probabilities. Y combines a bit flip and phase change. H creates and reverses balanced superposition.' },
  { id: 'algorithms', title: 'Quantum algorithms overview', topics: ['grover', 'shor', 'deutsch-jozsa', 'algorithm'], text: 'Deutsch-Jozsa distinguishes constant from balanced functions with a structured oracle. Grover amplifies the amplitude of a marked item and provides a quadratic search speedup. Shor uses period finding and the quantum Fourier transform as part of integer factoring.' },
];

function retrieve(query, lessonTitle = '') {
  const terms = `${query} ${lessonTitle}`.toLowerCase().split(/[^a-z0-9-]+/).filter((term) => term.length > 2);
  return documents.map((document) => ({
    ...document,
    score: terms.reduce((score, term) => score + (document.title.toLowerCase().includes(term) ? 3 : document.topics.includes(term) ? 2 : document.text.toLowerCase().includes(term) ? 1 : 0), 0),
  })).filter((document) => document.score > 0).sort((left, right) => right.score - left.score).slice(0, 3);
}

module.exports = { documents, retrieve };
