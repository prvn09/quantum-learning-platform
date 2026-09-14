import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import QuantumCircuitBuilder from '../components/QuantumCircuitBuilder';
import AnimatedBackground from '../components/AnimatedBackground';
import FloatingCard from '../components/FloatingCard';
import GlowingIcon from '../components/GlowingIcon';
import LessonQuiz from '../components/LessonQuiz';
import ChatSidebar from '../components/ChatSidebar';

const lessons = [
  { level: 1, title: 'Introduction to Qubits', description: 'Build an intuition for the smallest unit of quantum information.', objectives: ['Describe how a qubit differs from a classical bit', 'Recognize |0> and |1> as computational basis states', 'Read a simple quantum circuit from left to right'], code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.measure_all()\nprint(qc)", concepts: [{ term: 'Qubit', definition: 'A quantum system that can encode a combination of two basis states.' }, { term: 'Computational basis', definition: 'The reference measurement basis formed by |0> and |1>.' }], gates: [] },
  { level: 2, title: 'Superposition Basics', description: 'See how the Hadamard gate creates a balanced quantum superposition.', objectives: ['Explain amplitudes as probability information', 'Apply a Hadamard gate to |0>', 'Predict equal |0> and |1> measurement probabilities'], code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, 1)\nqc.h(0)\nqc.measure(0, 0)", concepts: [{ term: 'Superposition', definition: 'A state that combines basis states until measurement selects an outcome.' }, { term: 'Amplitude', definition: 'A complex coefficient whose squared magnitude gives measurement probability.' }], gates: [{ id: 'lesson-h', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 0, column: 0 }] },
  { level: 3, title: 'Entanglement', description: 'Create correlations between qubits that have no classical equivalent.', objectives: ['Describe correlated measurement outcomes', 'Build a two-qubit Bell state', 'Interpret CNOT control and target roles'], code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()", concepts: [{ term: 'Entanglement', definition: 'A joint state whose outcomes cannot be described independently.' }, { term: 'Bell state', definition: 'A maximally entangled two-qubit state with correlated outcomes.' }], gates: [{ id: 'lesson-h', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 0, column: 0 }, { id: 'lesson-cnot', type: 'CNOT', label: 'Controlled-NOT', color: 'pink', symbol: '⊕', qubits: 2, qubit: 0, column: 1 }] },
  { level: 4, title: 'Quantum Gates', description: 'Use X, Y, Z, and Hadamard gates to rotate a qubit state.', objectives: ['Compare bit flips and phase flips', 'Identify X, Y, Z, and H gate matrices', 'Compose gates into a short circuit'], code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.x(0)\nqc.h(0)\nqc.z(0)\nqc.measure_all()", concepts: [{ term: 'Pauli-X', definition: 'The quantum equivalent of a bit flip between |0> and |1>.' }, { term: 'Phase flip', definition: 'A Z operation that changes relative phase without changing basis probabilities.' }], gates: [{ id: 'lesson-x', type: 'X', label: 'Pauli-X', color: 'violet', symbol: 'X', qubits: 1, qubit: 0, column: 0 }, { id: 'lesson-h', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 0, column: 1 }, { id: 'lesson-z', type: 'Z', label: 'Pauli-Z', color: 'green', symbol: 'Z', qubits: 1, qubit: 0, column: 2 }] },
  { level: 5, title: 'Deutsch-Jozsa Algorithm', description: 'Classify a hidden function with a single structured quantum query.', objectives: ['Understand constant and balanced functions', 'Trace an oracle between Hadamard layers', 'Explain the algorithm’s query advantage'], code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h([0, 1])\nqc.cx(0, 1)\nqc.h(0)\nqc.measure_all()", concepts: [{ term: 'Oracle', definition: 'A black-box operation that encodes a problem function into phase or bit information.' }, { term: 'Balanced function', definition: 'A function that returns each output value equally often.' }], gates: [{ id: 'lesson-h', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 0, column: 0 }, { id: 'lesson-cnot', type: 'CNOT', label: 'Controlled-NOT', color: 'pink', symbol: '⊕', qubits: 2, qubit: 0, column: 1 }] },
  { level: 6, title: "Grover's Algorithm", description: 'Amplify the amplitude of a marked answer through iterative search.', objectives: ['Describe amplitude amplification', 'Identify oracle and diffusion steps', 'Estimate Grover’s quadratic speed-up'], code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h([0, 1])\nqc.cz(0, 1)\nqc.h([0, 1])\nqc.measure_all()", concepts: [{ term: 'Amplitude amplification', definition: 'A repeated rotation that increases the chance of measuring a target state.' }, { term: 'Diffusion', definition: 'The inversion-about-the-mean step in Grover’s iteration.' }], gates: [{ id: 'lesson-h0', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 0, column: 0 }, { id: 'lesson-h1', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 1, column: 0 }, { id: 'lesson-swap', type: 'SWAP', label: 'Swap', color: 'blue', symbol: '×', qubits: 2, qubit: 0, column: 1 }] },
  { level: 7, title: "Shor's Algorithm Basics", description: 'Connect quantum period finding to the future of cryptography.', objectives: ['Explain why factoring relates to period finding', 'Separate classical and quantum subroutines', 'Recognize the role of the quantum Fourier transform'], code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3)\nqc.h([0, 1, 2])\nqc.swap(0, 2)\nqc.measure_all()", concepts: [{ term: 'Period finding', definition: 'Finding the repeating interval of a modular function.' }, { term: 'QFT', definition: 'The quantum Fourier transform maps periodic structure into measurable peaks.' }], gates: [{ id: 'lesson-h0', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 0, column: 0 }, { id: 'lesson-h1', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 1, column: 0 }, { id: 'lesson-h2', type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1, qubit: 2, column: 0 }] },
];

const tutorialSteps = [
  { title: 'Build the starting state', concept: 'Gate placement', instruction: 'Drag the glowing H gate onto the highlighted q0 cell.', hint: 'The highlighted cell is the first time step on the top qubit line.', gate: 'H', qubit: 0, column: 0 },
  { title: 'Add a second transformation', concept: 'State evolution', instruction: 'Try the X gate next. Drop it on the highlighted cell to flip the state.', hint: 'X is the quantum bit-flip gate; it rotates the vector halfway around the Bloch sphere.', gate: 'X', qubit: 0, column: 1 },
  { title: 'Watch the Bloch sphere', concept: 'Geometric intuition', instruction: 'Press Run Circuit and use Play to watch the red state vector move.', hint: 'The vector starts at |0> on +Z and rotates after every applied gate.', gate: null },
  { title: 'Read the probabilities', concept: 'Measurement probability', instruction: 'Compare the blue |0> bar with the red |1> bar after the evolution.', hint: 'The square magnitude of an amplitude becomes its measurement probability.', gate: null },
  { title: 'Test your prediction', concept: 'Sampling', instruction: 'Choose 1,000 shots and click Measure to compare theory with samples.', hint: 'More shots usually make measured results cluster closer to the expected distribution.', gate: null },
];

export default function LessonPage({ level }) {
  const { user, session } = useAuth();
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [mastery, setMastery] = useState(() => Number(sessionStorage.getItem(`lesson-mastery-${level}`) || 0));
  const startedAt = useRef(Date.now());
  const current = lessons.find((lesson) => lesson.level === level) || lessons[0];
  const next = lessons.find((lesson) => lesson.level === current.level + 1);
  const active = tutorialSteps[tutorialStep];

  function completeGuidedStep() {
    setShowHint(false);
    setTutorialStep((step) => Math.min(step + 1, tutorialSteps.length - 1));
  }

  function recordMastery(score) {
    setMastery(score);
    sessionStorage.setItem(`lesson-mastery-${level}`, String(score));
  }

  return (
    <main className="lesson-page page-enter">
      <AnimatedBackground />
      <nav className="glass-nav lesson-nav"><a className="brand-mark" href="#learn"><GlowingIcon label="Back to dashboard">←</GlowingIcon> QUANTUM ATLAS</a><span className="lesson-progress-label">Level {current.level} of 7 · {user?.displayName || 'Guest Explorer'}</span><a className="text-button" href="#learn">Exit lesson</a></nav>
      <div className="lesson-content">
        <header className="lesson-hero"><span className="course-number">0{current.level}</span><div><p className="eyebrow">Level {current.level} / Quantum pathway</p><h1>{current.title}</h1><p className="lesson-description muted">{current.description}</p></div></header>
        <div className="lesson-layout">
          <div className="lesson-main">
            <FloatingCard className="objectives-card"><p className="eyebrow">Learning objectives</p><ul>{current.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></FloatingCard>
            <article className="lesson-explanation"><p className="eyebrow">Core explanation</p><h2>Think in states, not switches</h2><p>Quantum programs describe how a state evolves through operations before it is measured. Each gate changes amplitudes, phase, or correlations, and the circuit gives us a readable timeline for those changes.</p><p>Use the interactive lab below to experiment with the example. Add a gate, run the circuit, then compare the Bloch vector with the probability readout. The best way to learn this material is to make a prediction before you measure.</p><div className="lesson-code"><div className="code-header"><span>Qiskit example</span><span>Python</span></div><pre><code>{current.code}</code></pre></div></article>
            <section>
              <div className="lesson-section-heading"><div><p className="eyebrow">Experiment</p><h2>Try the example circuit</h2></div><span className="muted">Pre-filled for this lesson</span></div>
              <div className="tutorial-guide"><div className="tutorial-topline"><div><p className="eyebrow">Guided mission</p><h3>{active.title}</h3></div><span className="tutorial-progress">Step {tutorialStep + 1} / {tutorialSteps.length}</span></div><div className="tutorial-progress-track"><span style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }} /></div><div className="tutorial-body"><div><span className="tutorial-concept">{active.concept}</span><p>{active.instruction}</p></div><button className="hint-button" type="button" onClick={() => setShowHint((visible) => !visible)}>💡 {showHint ? 'Hide hint' : 'Hint'}</button></div>{showHint && <div className="hint-popover" role="status"><strong>Quantum hint</strong><span>{active.hint}</span></div>}</div>
              <QuantumCircuitBuilder initialGates={current.gates} guidedGate={active.gate} guidedQubit={active.qubit} guidedColumn={active.column} onGuidedGateAdded={completeGuidedStep} />
              <LessonQuiz level={current.level} gates={current.gates} session={session} topicSlug={`lesson-${current.level}`} startedAt={startedAt.current} onMastery={recordMastery} />
            </section>
          </div>
          <aside className="lesson-sidebar"><ChatSidebar lessonTitle={current.title} /><FloatingCard className="concepts-card"><p className="eyebrow">Key concepts</p>{current.concepts.map((concept) => <div className="concept-item" key={concept.term}><strong>{concept.term}</strong><p className="muted">{concept.definition}</p></div>)}</FloatingCard><FloatingCard className="lesson-checkpoint"><span className="stat-icon">✦</span><h3>Ready to check your understanding?</h3><p className="muted">Make a prediction, then use Measure in the lab to test it.</p></FloatingCard></aside>
        </div>
        <footer className="lesson-footer"><a className="text-button" href="#learn">← Back to dashboard</a>{next && (mastery >= 80 ? <a className="btn-primary" href={`#lesson-${next.level}`}>{`Next lesson: ${next.title}`} <span>→</span></a> : <button className="btn-primary disabled-link" type="button" disabled>Score 80% to unlock <span>→</span></button>)}</footer>
      </div>
    </main>
  );
}

export { lessons };
