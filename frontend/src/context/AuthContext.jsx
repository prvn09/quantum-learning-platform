import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext(null);

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Something went wrong');
  return body;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => JSON.parse(sessionStorage.getItem('quantum_session') || 'null'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) sessionStorage.setItem('quantum_session', JSON.stringify(session));
    else sessionStorage.removeItem('quantum_session');
  }, [session]);

  async function signIn(credentials) { setLoading(true); try { const next = await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); setSession(next); return next; } finally { setLoading(false); } }
  async function signUp(credentials) { setLoading(true); try { const next = await request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }); setSession(next); return next; } finally { setLoading(false); } }
  function continueAsGuest() { setSession({ user: { id: 'guest', email: '', displayName: 'Guest Explorer', role: 'student' }, isGuest: true }); }
  async function signOut() { try { if (session?.refreshToken) await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) }); } finally { setSession(null); } }
  async function requestReset(email) { return request('/auth/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) }); }
  async function resetPassword(token, password) { return request('/auth/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, password }) }); }

  return <AuthContext.Provider value={{ session, user: session?.user || null, isGuest: Boolean(session?.isGuest), loading, signIn, signUp, continueAsGuest, signOut, requestReset, resetPassword }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
