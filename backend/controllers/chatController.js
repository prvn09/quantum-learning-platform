const { retrieve } = require('../content/library');

function fallbackAnswer(question, sources, stuck = false) {
  if (!sources.length) return `I could not find that in this lesson's content library. Try asking about qubits, gates, superposition, entanglement, or measurement.${stuck ? '\n\n**Try this:** start with the highlighted gate in the circuit and predict what the Bloch vector should do.' : ''}`;
  const source = sources[0];
  return `**Short answer:** ${source.text}\n\n**Why it matters:** connect your question to the current lesson by checking the circuit and probability readout after the next gate.${stuck ? '\n\n**Try this next:** place one gate at a time, run the circuit, and compare the measured result with your prediction.' : ''}`;
}

async function answerWithClaude(question, lesson, sources, history, stuck) {
  if (!process.env.ANTHROPIC_API_KEY) return fallbackAnswer(question, sources, stuck);
  const context = sources.map((source) => `[${source.title}] ${source.text}`).join('\n');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest', max_tokens: 500, system: `You are a patient quantum computing tutor. Answer only from the supplied lesson context. If the context does not support an answer, say so clearly. Use concise Markdown, equations in plain text, and one actionable next step. Current lesson: ${lesson || 'Quantum learning'}. Retrieved context:\n${context}`, messages: [...history.slice(-6).map((message) => ({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.content })), { role: 'user', content: `${stuck ? 'The learner is stuck. Give a small hint before the answer. ' : ''}${question}` }] }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || 'LLM request failed');
  return body.content?.map((part) => part.text || '').join('') || fallbackAnswer(question, sources, stuck);
}

async function chat(req, res, next) {
  try {
    const { question, lessonTitle = '', history = [], stuck = false } = req.body || {};
    if (typeof question !== 'string' || question.trim().length < 2) return res.status(422).json({ error: 'Ask a question with at least two characters' });
    const sources = retrieve(question, lessonTitle);
    const answer = await answerWithClaude(question.trim(), lessonTitle, sources, Array.isArray(history) ? history : [], stuck);
    return res.json({ answer, sources: sources.map(({ id, title }) => ({ id, title })) });
  } catch (error) { return next(error); }
}

module.exports = { chat };
