import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function stateVector(gates, selectedQubit) {
  const vector = new THREE.Vector3(0, 0, 1);
  gates.filter((gate) => gate.qubit === selectedQubit || (gate.qubits > 1 && selectedQubit >= gate.qubit && selectedQubit < gate.qubit + gate.qubits)).sort((left, right) => left.column - right.column).forEach((gate) => {
    if (gate.type === 'X') vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    if (gate.type === 'Y') vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    if (gate.type === 'Z') vector.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
    if (gate.type === 'H') vector.set(vector.z, vector.y, vector.x);
    if (gate.type === 'CNOT' && selectedQubit !== gate.qubit) vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    if (gate.type === 'SWAP') vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  });
  return vector.normalize();
}

function evolutionFor(gates, selectedQubit) {
  const orderedGates = [...gates].sort((left, right) => left.column - right.column);
  return [{ vector: new THREE.Vector3(0, 0, 1), label: 'Initial state · |0⟩' }, ...orderedGates.map((gate, index) => ({ vector: stateVector(orderedGates.slice(0, index + 1), selectedQubit), label: `Step ${index + 1} · ${gate.type} gate` }))];
}

function ketFromVector(vector) {
  const theta = Math.acos(Math.max(-1, Math.min(1, vector.z)));
  const alpha = Math.cos(theta / 2);
  const beta = Math.sin(theta / 2);
  const phase = Math.atan2(vector.y, vector.x);
  const round = (value) => Math.abs(value) < 0.01 ? '0' : value.toFixed(2);
  const betaText = Math.abs(phase) < 0.02 ? `${round(beta)}|1⟩` : `${round(beta)}e^{i${round(phase)}}|1⟩`;
  return `${round(alpha)}|0⟩ + ${betaText}`;
}

export default function BlochSphere({ gates, selectedQubit, setSelectedQubit, runToken }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const targetRef = useRef(new THREE.Vector3(0, 0, 1));
  const currentRef = useRef(new THREE.Vector3(0, 0, 1));
  const spinRef = useRef(0);
  const gatesRef = useRef(gates);
  const selectedQubitRef = useRef(selectedQubit);
  const [sequence, setSequence] = useState(() => evolutionFor([], 0));
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(3.6, 2.8, 5.4);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 20), new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.08, wireframe: true }));
    group.add(sphere);
    const equator = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.008, 8, 64), new THREE.MeshBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.45 }));
    equator.rotation.x = Math.PI / 2;
    group.add(equator);

    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.55 });
    [[[-1.7, 0, 0], [1.7, 0, 0]], [[0, -1.7, 0], [0, 1.7, 0]], [[0, 0, -1.7], [0, 0, 1.7]]].forEach(([start, end]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...start), new THREE.Vector3(...end)]);
      group.add(new THREE.Line(geometry, axisMaterial));
    });
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.35, 0xff4f70, 0.18, 0.1);
    group.add(arrow);
    const point = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff4f70 }));
    group.add(point);

    sceneRef.current = { scene, camera, renderer, group, arrow, point };
    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(mount);
    let frame;
    const render = () => {
      frame = requestAnimationFrame(render);
      currentRef.current.lerp(targetRef.current, 0.09);
      const direction = currentRef.current.clone().normalize();
      arrow.setDirection(direction);
      arrow.setLength(1.35, 0.18, 0.1);
      point.position.copy(direction).multiplyScalar(1.35);
      group.rotation.y += spinRef.current;
      spinRef.current *= 0.94;
      renderer.render(scene, camera);
    };
    render();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    gatesRef.current = gates;
    selectedQubitRef.current = selectedQubit;
  }, [gates, selectedQubit]);

  useEffect(() => {
    targetRef.current.copy(stateVector(gates, selectedQubit));
    spinRef.current = 0.035;
    if (!runToken) {
      const nextSequence = evolutionFor(gates, selectedQubit);
      setSequence(nextSequence);
      setStepIndex(nextSequence.length - 1);
    }
  }, [gates, selectedQubit, runToken]);

  useEffect(() => {
    if (!runToken) return;
    const nextSequence = evolutionFor(gatesRef.current, selectedQubitRef.current);
    setSequence(nextSequence);
    setStepIndex(0);
    setPlaying(true);
  }, [runToken]);

  useEffect(() => {
    const frame = sequence[stepIndex];
    if (frame) {
      targetRef.current.copy(frame.vector);
      spinRef.current = 0.055;
    }
  }, [sequence, stepIndex]);

  useEffect(() => {
    if (!playing || sequence.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= sequence.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1300 / speed);
    return () => window.clearInterval(timer);
  }, [playing, sequence, speed]);

  const activeFrame = sequence[stepIndex] || sequence[0];
  const displayedVector = activeFrame?.vector || new THREE.Vector3(0, 0, 1);

  return <div className="bloch-panel glassmorphism-card"><div className="bloch-heading"><div><p className="eyebrow">Live state / Qubit {selectedQubit + 1}</p><h3>Bloch sphere</h3></div><label className="qubit-select">Visualize<select value={selectedQubit} onChange={(event) => setSelectedQubit(Number(event.target.value))}><option value="0">Qubit 1 (q₀)</option><option value="1">Qubit 2 (q₁)</option><option value="2">Qubit 3 (q₂)</option></select></label></div><div className="bloch-canvas"><div ref={mountRef} className="bloch-renderer" /><span className="axis-label axis-x">X</span><span className="axis-label axis-y">Y</span><span className="axis-label axis-z">Z</span><span className="vector-legend"><i /> State vector</span></div><div className="bloch-state"><span className="state-step">{activeFrame?.label || 'Initial state · |0⟩'}</span><code>{ketFromVector(displayedVector)}</code></div><div className="bloch-controls"><button type="button" onClick={() => { setStepIndex(0); setPlaying(false); }} disabled={stepIndex === 0}>⏮ Start</button><button className="play-control" type="button" onClick={() => { if (stepIndex >= sequence.length - 1) setStepIndex(0); setPlaying((current) => !current); }}>{playing ? '⏸ Pause' : '▶ Play'}</button><button type="button" onClick={() => setSpeed((current) => current === 1 ? 0.5 : current === 0.5 ? 0.25 : 1)}>Speed {speed}x</button><span className="step-counter">{stepIndex + 1} / {sequence.length}</span></div><p className="muted bloch-caption">Run the circuit to replay each gate. The red vector rotates smoothly between states.</p></div>;
}
