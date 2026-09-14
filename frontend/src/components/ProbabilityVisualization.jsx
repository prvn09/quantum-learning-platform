import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as THREE from 'three';

const qubitNames = ['q₀', 'q₁', 'q₂'];
const basisStates = ['00', '01', '10', '11'];

function vectorForQubit(gates, qubit) {
  const vector = new THREE.Vector3(0, 0, 1);
  [...gates].filter((gate) => gate.qubit === qubit || (gate.qubits > 1 && qubit >= gate.qubit && qubit < gate.qubit + gate.qubits)).sort((left, right) => left.column - right.column).forEach((gate) => {
    if (gate.type === 'X') vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    if (gate.type === 'Y') vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    if (gate.type === 'Z') vector.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
    if (gate.type === 'H') vector.set(vector.z, vector.y, vector.x);
    if (gate.type === 'CNOT' && qubit !== gate.qubit) vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    if (gate.type === 'SWAP') vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  });
  return vector.normalize();
}

function percent(value) {
  return Math.round(value * 100);
}

function chartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((item) => <span key={item.dataKey} style={{ color: item.fill }}>{item.name}: {item.value}%</span>)}</div>;
}

export default function ProbabilityVisualization({ gates, results }) {
  const qubitData = qubitNames.map((name, qubit) => {
    const vector = vectorForQubit(gates, qubit);
    return { name, zero: percent((1 + vector.z) / 2), one: percent((1 - vector.z) / 2) };
  });
  const measuredCounts = results?.counts || {};
  const measuredTotal = Object.values(measuredCounts).reduce((total, count) => total + count, 0);
  const basisData = basisStates.map((state) => {
    const measured = measuredTotal ? (measuredCounts[state] || 0) / measuredTotal : null;
    if (measured !== null) return { state: `|${state}⟩`, theoretical: percent(results.theoretical_probabilities?.[state] || 0), actual: percent(measured) };
    const first = qubitData[0][state[0] === '0' ? 'zero' : 'one'] / 100;
    const second = qubitData[1][state[1] === '0' ? 'zero' : 'one'] / 100;
    return { state: `|${state}⟩`, theoretical: percent(first * second), actual: null };
  });

  return <section className="probability-panel glassmorphism-card" aria-labelledby="probability-title"><div className="probability-heading"><div><p className="eyebrow">Measurement readout</p><h3 id="probability-title">Probability map</h3></div><span className="muted">Live from circuit state</span></div><div className="probability-grid"><div className="probability-chart"><h4>Each qubit</h4><div className="chart-frame"><ResponsiveContainer width="100%" height="100%"><BarChart data={qubitData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} /><XAxis dataKey="name" stroke="rgba(245,245,245,0.6)" tickLine={false} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="rgba(245,245,245,0.45)" tickLine={false} /><Tooltip content={chartTooltip} /><Legend wrapperStyle={{ fontSize: '11px' }} /><Bar dataKey="zero" name="|0⟩" fill="#00d9ff" radius={[5, 5, 0, 0]} /><Bar dataKey="one" name="|1⟩" fill="#ff4f70" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="percentage-list">{qubitData.map((item) => <div className="percentage-row" key={item.name}><strong>{item.name}</strong><span className="zero-text">{item.zero}% |0⟩</span><span className="one-text">{item.one}% |1⟩</span></div>)}</div></div><div className="probability-chart"><h4>Two-qubit basis states</h4><div className="chart-frame"><ResponsiveContainer width="100%" height="100%"><BarChart data={basisData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} /><XAxis dataKey="state" stroke="rgba(245,245,245,0.6)" tickLine={false} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="rgba(245,245,245,0.45)" tickLine={false} /><Tooltip content={chartTooltip} /><Legend wrapperStyle={{ fontSize: '11px' }} /><Bar dataKey="theoretical" name="Expected" fill="#9d4edd" radius={[6, 6, 0, 0]} /><Bar dataKey="actual" name="Measured" fill="#39ff14" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="basis-list">{basisData.map((item) => <span key={item.state}><strong>{item.state}</strong> E {item.theoretical}% {item.actual !== null && `· A ${item.actual}%`}</span>)}</div></div></div></section>;
}
