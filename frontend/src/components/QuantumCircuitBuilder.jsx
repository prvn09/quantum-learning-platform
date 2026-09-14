import React, { useState } from 'react';
import BlochSphere from './BlochSphere';
import ProbabilityVisualization from './ProbabilityVisualization';

const palette = [
  { type: 'X', label: 'Pauli-X', color: 'violet', symbol: 'X', qubits: 1 },
  { type: 'Y', label: 'Pauli-Y', color: 'cyan', symbol: 'Y', qubits: 1 },
  { type: 'Z', label: 'Pauli-Z', color: 'green', symbol: 'Z', qubits: 1 },
  { type: 'H', label: 'Hadamard', color: 'gold', symbol: 'H', qubits: 1 },
  { type: 'CNOT', label: 'Controlled-NOT', color: 'pink', symbol: '⊕', qubits: 2 },
  { type: 'SWAP', label: 'Swap', color: 'blue', symbol: '×', qubits: 2 },
];

const qubits = ['q₀', 'q₁', 'q₂'];
const columns = Array.from({ length: 8 }, (_, index) => index);

export default function QuantumCircuitBuilder({ initialGates = [], guidedGate, guidedQubit, guidedColumn, onGuidedGateAdded }) {
  const [gates, setGates] = useState(initialGates);
  const [dragging, setDragging] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [runToken, setRunToken] = useState(0);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [measurementResults, setMeasurementResults] = useState(null);
  const [shots, setShots] = useState(1000);
  const [error, setError] = useState('');

  function startDrag(event, gate) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/quantum-gate', gate.type);
    setDragging(gate);
  }

  function dropGate(event, qubitIndex, column) {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/quantum-gate');
    const gate = palette.find((item) => item.type === type);
    if (!gate) return;
    const anchor = Math.min(qubitIndex, qubits.length - gate.qubits);
    setGates((current) => [...current, { id: `${type}-${Date.now()}`, ...gate, qubit: anchor, column }]);
    if (guidedGate && gate.type === guidedGate && anchor === guidedQubit && column === guidedColumn) onGuidedGateAdded?.();
    setDragging(null);
    setPreview(null);
  }

  function previewGate(event, qubitIndex, column) {
    event.preventDefault();
    const type = event.dataTransfer.types.includes('application/quantum-gate') ? event.dataTransfer.getData('application/quantum-gate') : dragging?.type;
    const gate = palette.find((item) => item.type === type);
    if (gate) setPreview({ ...gate, qubit: Math.min(qubitIndex, qubits.length - gate.qubits), column });
  }

  function removeGate(id) {
    setGates((current) => current.filter((gate) => gate.id !== id));
  }

  function resetCircuit() {
    setGates(initialGates);
    setPreview(null);
    setResults(null);
    setMeasurementResults(null);
    setError('');
  }

  async function simulateCircuit(action = 'run') {
    if (!gates.length) {
      setError('Add at least one gate before running the circuit.');
      setResults(null);
      return;
    }
    setRunning(true);
    setError('');
    setResults(null);
    if (action === 'measure') setMeasurementResults(null);
    setRunToken((current) => current + 1);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/quantum/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shots, circuit: gates.map(({ type, qubit, column }) => ({ type, qubit, column })) }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'The circuit could not be simulated');
      setResults(body);
      if (action === 'measure') setMeasurementResults(body);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the quantum service');
    } finally {
      setRunning(false);
    }
  }

  function downloadCsv() {
    const exportResults = measurementResults || results;
    if (!exportResults) return;
    const rows = [['basis_state', 'count', 'actual_probability', 'theoretical_probability']];
    Object.entries(exportResults.counts || {}).forEach(([state, count]) => rows.push([state, count, exportResults.probabilities?.[state] || 0, exportResults.theoretical_probabilities?.[state] || 0]));
    const csv = rows.map((row) => row.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum-measurement-${exportResults.shots}-shots.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="circuit-builder glassmorphism-card" aria-labelledby="circuit-title">
      <div className="circuit-header">
        <div><p className="eyebrow">Quantum lab / Interactive</p><h2 id="circuit-title">Circuit builder</h2><p className="muted circuit-intro">Drag a gate onto the grid. Click any placed gate to remove it.</p></div>
        <div className="circuit-actions"><label className="shots-select">Shots<select value={shots} onChange={(event) => setShots(Number(event.target.value))} disabled={running}><option value="100">100</option><option value="1000">1,000</option><option value="10000">10,000</option></select></label><button className="run-circuit" type="button" onClick={() => simulateCircuit('run')} disabled={running}>{running ? <><span className="loading-spinner" /> Running...</> : <>Run circuit <span>▶</span></>}</button><button className="measure-circuit" type="button" onClick={() => simulateCircuit('measure')} disabled={running}>{running ? 'Measuring...' : <>Measure <span>⌁</span></>}</button><button className="reset-circuit" type="button" onClick={resetCircuit}>Reset circuit <span>↺</span></button></div>
      </div>
      <div className="circuit-workspace">
        <aside className="gate-palette" aria-label="Quantum gate palette">
          <span className="palette-label">Gate palette</span>
          {palette.map((gate) => <div className={`palette-gate ${gate.color} ${guidedGate === gate.type ? 'guided-gate' : ''}`} draggable="true" key={gate.type} onDragStart={(event) => startDrag(event, gate)} onDragEnd={() => { setDragging(null); setPreview(null); }} title={`Drag ${gate.label} onto a qubit`}><span className="gate-symbol">{gate.symbol}</span><span><strong>{gate.type}</strong><small>{gate.label}</small></span><span className="drag-grip">⠿</span></div>)}
        </aside>
        <div className="circuit-scroll">
          <div className="circuit-grid" role="grid" aria-label="Quantum circuit grid">
            <div className="wire-label-spacer" />
            {columns.map((column) => <span className="column-label" key={column}>t{column + 1}</span>)}
            {qubits.map((qubit, qubitIndex) => <React.Fragment key={qubit}>
              <div className="qubit-label">{qubit}</div>
              {columns.map((column) => {
                const placed = gates.find((gate) => gate.column === column && gate.qubit === qubitIndex);
                const covered = gates.find((gate) => gate.column === column && gate.qubit < qubitIndex && qubitIndex < gate.qubit + gate.qubits);
                const isPreview = preview?.column === column && preview?.qubit === qubitIndex;
                const isGuidedTarget = guidedQubit === qubitIndex && guidedColumn === column;
                return <div className={`circuit-cell ${isPreview ? 'drop-preview' : ''} ${isGuidedTarget ? 'guided-target' : ''}`} key={`${qubit}-${column}`} onDragOver={(event) => previewGate(event, qubitIndex, column)} onDragLeave={() => setPreview(null)} onDrop={(event) => dropGate(event, qubitIndex, column)} role="gridcell">
                  <span className="wire" />
                  {placed && <button className={`placed-gate ${placed.color} ${placed.qubits > 1 ? 'multi-gate' : ''}`} type="button" onClick={() => removeGate(placed.id)} title={`Remove ${placed.label}`}><span>{placed.symbol}</span>{placed.qubits > 1 && <i />}</button>}
                  {covered && <span className="gate-connector" aria-hidden="true" />}
                </div>;
              })}
            </React.Fragment>)}
          </div>
        </div>
      </div>
      <BlochSphere gates={gates} selectedQubit={selectedQubit} setSelectedQubit={setSelectedQubit} runToken={runToken} />
      <ProbabilityVisualization gates={gates} results={results} />
      {error && <div className="circuit-error" role="alert"><strong>Simulation error</strong><span>{error}</span></div>}
      {measurementResults && <div className="measurement-summary"><div><span className="eyebrow">Measurement complete</span><strong>{measurementResults.shots.toLocaleString()} shots sampled</strong></div><button className="download-csv" type="button" onClick={downloadCsv}>Download CSV <span>↓</span></button></div>}
      {results && <div className="simulation-results" aria-live="polite"><div className="results-heading"><div><span className="eyebrow">Simulation complete</span><h3>Quantum state results</h3></div><span className="shots-label">{results.shots} shots</span></div><div className="result-grid">{Object.entries(results.counts || {}).map(([state, count]) => <div className="result-card" key={state}><span className="result-state">|{state}⟩</span><strong>{count}</strong><small>{Math.round((results.probabilities?.[state] || 0) * 100)}% probability</small><div className="result-bar"><span style={{ width: `${(results.probabilities?.[state] || 0) * 100}%` }} /></div></div>)}</div><details className="statevector-details"><summary>View state vector</summary><code>{results.statevector?.join(' · ')}</code></details></div>}
      <div className="circuit-footer"><span><span className="status-dot" /> {gates.length ? `${gates.length} gate${gates.length === 1 ? '' : 's'} placed` : 'Circuit ready'}</span><span className="muted">{dragging ? `Drop ${dragging.type} on a qubit line` : 'Tip: CNOT and SWAP occupy two qubit lines'}</span></div>
    </section>
  );
}
