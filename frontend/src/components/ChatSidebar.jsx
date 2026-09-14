import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function ChatSidebar({ lessonTitle }) {
  const storageKey = `quantum-chat-${lessonTitle}`;
  const [messages, setMessages] = useState(() => JSON.parse(sessionStorage.getItem(storageKey) || '[]'));
  const [question, setQuestion] = useState('');
  const [showHints, setShowHints] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify(messages)); messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, storageKey]);

  async function ask(text = question, stuck = false) {
    const value = text.trim();
    if (!value || sending) return;
    const userMessage = { role: 'user', content: value };
    setMessages((current) => [...current, userMessage]);
    setQuestion(''); setError(''); setSending(true);
    try {
      const response = await fetch(`${API_URL}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: value, lessonTitle, history: messages, stuck }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Tutor unavailable');
      setMessages((current) => [...current, { role: 'assistant', content: body.answer, sources: body.sources }]);
    } catch (requestError) {
      const lower = value.toLowerCase();
      const localAnswer = lower.includes('superposition') ? '**Local tutor:** Superposition is a coherent combination of basis states, not simply a classical random choice. Try applying H twice: interference returns the qubit to |0>.\n\n*The Node tutor service is offline, so this answer came from the built-in lesson library.*' : `**Local tutor:** Start with the highlighted circuit step for **${lessonTitle}**, then compare the Bloch vector and probability bars after measuring.\n\n*The Node tutor service is offline, so this answer came from the built-in lesson library.*`;
      setMessages((current) => [...current, { role: 'assistant', content: localAnswer }]);
      setError('Live tutor unavailable; showing a grounded local answer.');
    }
    finally { setSending(false); }
  }

  function handleSubmit(event) { event.preventDefault(); ask(); }

  return <aside className="chat-sidebar glassmorphism-card" aria-label="Quantum tutor"><div className="chat-header"><div><p className="eyebrow">Context tutor</p><h2>Ask the Atlas</h2><span className="muted">Grounded in {lessonTitle}</span></div><span className="chat-status"><i /> Online</span></div><div className="chat-toolbar"><button type="button" className={showHints ? 'chat-toggle active' : 'chat-toggle'} onClick={() => setShowHints((visible) => !visible)}>{showHints ? 'Hints on' : 'Hints off'}</button><button type="button" className="stuck-button" onClick={() => ask("I'm stuck. Give me a small hint for this lesson.", true)} disabled={sending || !showHints}>I'm stuck</button></div><div className="chat-messages" ref={messagesRef}>{messages.length === 0 && <div className="chat-empty"><span className="chat-orb">ψ</span><strong>Your quantum study partner</strong><p>Ask about the current concept, a gate, or what the visualization means.</p>{showHints && <div className="suggestions"><button type="button" onClick={() => ask('What should I notice in this lesson?')}>What should I notice?</button><button type="button" onClick={() => ask('Explain this like I am new to quantum computing.')}>Explain simply</button></div>}</div>}{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><span className="message-label">{message.role === 'assistant' ? 'ATLAS' : 'YOU'}</span>{message.role === 'assistant' ? <ReactMarkdown>{message.content}</ReactMarkdown> : <p>{message.content}</p>}{message.sources?.length > 0 && <small className="source-note">Source: {message.sources.map((source) => source.title).join(', ')}</small>}</div>)}{sending && <div className="chat-message assistant typing"><span className="message-label">ATLAS</span><span className="typing-dots"><i /><i /><i /></span></div>}</div>{error && <p className="chat-error" role="alert">{error}</p>}<form className="chat-input-wrap" onSubmit={handleSubmit}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question..." rows="2" disabled={sending} /><button type="submit" aria-label="Ask question" disabled={sending || !question.trim()}>Ask Question <span>↑</span></button></form></aside>;
}
