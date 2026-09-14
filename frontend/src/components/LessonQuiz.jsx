import React, { useState } from 'react';

function questionsFor(level) {
  const banks = {
    1: [
      { type: 'mcq', prompt: 'What can a qubit represent before measurement?', options: ['Only 0', 'Only 1', 'A coherent combination of |0> and |1>', 'A classical byte'], answer: 2 },
      { type: 'mcq', prompt: 'What does computational-basis measurement return?', options: ['A probability only', '|0> or |1>', 'A gate matrix', 'A Bloch sphere'], answer: 1 },
      { type: 'gate', prompt: 'Build a circuit that flips |0> to |1>. Which gate is required?', requiredGate: 'X', options: ['H', 'X', 'Z', 'SWAP'] },
      { type: 'mcq', prompt: 'Which symbol commonly denotes a qubit state?', options: ['ψ', 'π', 'λ', '∑'], answer: 0 },
      { type: 'mcq', prompt: 'What is measured from amplitudes?', options: ['Gate names', 'Probabilities', 'Circuit width', 'Qubit labels'], answer: 1 },
    ],
    2: [
      { type: 'probability', prompt: 'What is the output probability after applying H to |0>?', options: ['100% |0>', '50% |0> and 50% |1>', '100% |1>', '25% each'], answer: 1 },
      { type: 'gate', prompt: 'Build a balanced superposition from |0>. Which gate belongs in the circuit?', requiredGate: 'H', options: ['H', 'X', 'Z', 'CNOT'] },
      { type: 'mcq', prompt: 'What is an amplitude?', options: ['A complex coefficient', 'A wire label', 'A measurement device', 'A classical bit'], answer: 0 },
      { type: 'probability', prompt: 'What is the probability of measuring |1> after H|0>?', options: ['0%', '25%', '50%', '100%'], answer: 2 },
      { type: 'mcq', prompt: 'Why can H followed by H return |0>?', options: ['Interference', 'Randomness only', 'More qubits', 'A reset command'], answer: 0 },
    ],
    3: [
      { type: 'mcq', prompt: 'Which pair creates a Bell state from |00>?', options: ['X then Z', 'H then CNOT', 'Y then SWAP', 'Z then H'], answer: 1 },
      { type: 'gate', prompt: 'Build an entangled pair. Which two-gate pattern is required?', requiredGate: 'CNOT', requiredBefore: 'H', options: ['H + CNOT', 'X + Z', 'H + X', 'SWAP only'] },
      { type: 'mcq', prompt: 'What is special about entangled outcomes?', options: ['They are always 00', 'They can be correlated beyond classical description', 'They are never measured', 'They are faster than light communication'], answer: 1 },
      { type: 'probability', prompt: 'For a Bell state (|00> + |11>)/sqrt(2), what outcomes appear?', options: ['01 and 10', '00 and 11', 'All states equally', 'Only 01'], answer: 1 },
      { type: 'mcq', prompt: 'In CNOT, what controls the target flip?', options: ['The target state', 'The control qubit', 'The measurement result', 'The circuit title'], answer: 1 },
    ],
  };
  const common = [
    { type: 'mcq', prompt: 'Which operation changes a qubit state?', options: ['A quantum gate', 'A label', 'A comment', 'A screenshot'], answer: 0 },
    { type: 'gate', prompt: 'Build a circuit using the highlighted lesson gate.', requiredGate: level >= 4 ? 'X' : 'H', options: ['H', 'X', 'Z', 'CNOT'] },
    { type: 'probability', prompt: 'What should you compare after measuring?', options: ['Theory and samples', 'Only colors', 'File names', 'Screen size'], answer: 0 },
    { type: 'mcq', prompt: 'What does a circuit describe?', options: ['State evolution', 'A password', 'A web route', 'A database row'], answer: 0 },
    { type: 'mcq', prompt: 'What is the best way to test a prediction?', options: ['Run and measure', 'Delete the circuit', 'Ignore results', 'Change the question'], answer: 0 },
  ];
  return banks[level] || common;
}

export default function LessonQuiz({ level, gates, session, topicSlug, startedAt, onMastery }) {
  const questions = questionsFor(level);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[index];

  function checkAnswer() {
    if (answered) return;
    const correct = question.type === 'gate' ? gates.some((gate) => gate.type === question.requiredGate) && (!question.requiredBefore || gates.some((gate) => gate.type === question.requiredBefore)) : selected === question.answer;
    setScore((current) => current + (correct ? 1 : 0));
    setAnswered(true);
  }

  function next() {
    if (index === questions.length - 1) {
      const finalScore = Math.min(score, questions.length);
      const percentage = Math.min(100, Math.round((finalScore / questions.length) * 100));
      if (session?.accessToken) fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/quiz-analytics/attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` }, body: JSON.stringify({ topicSlug, score: percentage, totalQuestions: questions.length, timeSpentSeconds: Math.round((Date.now() - startedAt) / 1000) }) }).catch(() => undefined);
      setScore(finalScore); setFinished(true); onMastery?.(percentage);
      return;
    }
    setIndex((current) => current + 1); setSelected(null); setAnswered(false);
  }

  if (finished) return <section className="quiz-card glassmorphism-card"><p className="eyebrow">Checkpoint complete</p><h2>{score >= Math.ceil(questions.length * 0.8) ? 'Mastery unlocked' : 'Keep exploring'}</h2><div className="quiz-score">{Math.round((score / questions.length) * 100)}<span>%</span></div><p className="muted">{score >= Math.ceil(questions.length * 0.8) ? 'You reached the 80% threshold. The next lesson is ready.' : 'You need 80% to unlock the next level. Review the hints and try again.'}</p><button className="quiz-retry" type="button" onClick={() => { setIndex(0); setScore(0); setFinished(false); setAnswered(false); setSelected(null); }}>Try again</button></section>;

  return <section className="quiz-card glassmorphism-card"><div className="quiz-header"><div><p className="eyebrow">Knowledge check</p><h2>Lesson quiz</h2></div><span className="quiz-counter">Question {index + 1} / {questions.length}</span></div><div className="quiz-progress"><span style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }} /></div><span className="quiz-type">{question.type === 'gate' ? 'Circuit build' : question.type === 'probability' ? 'Probability' : 'Multiple choice'}</span><h3>{question.prompt}</h3>{question.type === 'gate' && <div className="quiz-gate-callout">Use the circuit builder above, then return here and submit your circuit.</div>}<div className="quiz-options">{question.options.map((option, optionIndex) => <button className={selected === optionIndex ? 'quiz-option selected' : 'quiz-option'} type="button" key={option} disabled={answered} onClick={() => setSelected(optionIndex)}>{option}<span>{selected === optionIndex ? '●' : '○'}</span></button>)}</div>{answered && <p className={(question.type === 'gate' ? gates.some((gate) => gate.type === question.requiredGate) : selected === question.answer) ? 'quiz-feedback correct' : 'quiz-feedback incorrect'}>{(question.type === 'gate' ? gates.some((gate) => gate.type === question.requiredGate) : selected === question.answer) ? 'Correct. Nice work.' : 'Not quite. Use the lesson explanation and try the idea again.'}</p>}<button className="btn-primary quiz-submit" type="button" disabled={question.type !== 'gate' && selected === null} onClick={answered ? next : checkAnswer}>{answered ? index === questions.length - 1 ? 'See score' : 'Next question' : 'Check answer'} <span>→</span></button></section>;
}
