import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import FloatingCard from '../components/FloatingCard';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [resetMode, setResetMode] = useState(false);
  const { requestReset, resetPassword, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submitReset(event) {
    event.preventDefault(); setError(''); setMessage('');
    try { const result = token ? await resetPassword(token, password) : await requestReset(email); setMessage(result.developmentToken ? `Development token: ${result.developmentToken}` : result.message); }
    catch (requestError) { setError(requestError.message); }
  }

  return <main className="auth-shell page-enter"><div className="auth-visual"><p className="eyebrow">Quantum Atlas / Open learning</p><h1>Enter the <span className="text-gradient">learning orbit.</span></h1><p className="muted">Explore the learning path as a guest, or create an account to save progress and unlock your profile.</p></div><FloatingCard className="auth-card">
    {!resetMode ? <><div className="auth-heading"><div><p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Start exploring'}</p><h2>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2></div><span className="auth-glyph">ψ</span></div><AuthForm mode={mode} onForgotPassword={() => setResetMode(true)} /><button className="guest-button" type="button" onClick={continueAsGuest}>Continue as guest <span>↗</span></button><p className="guest-note">Guest mode includes the full learning dashboard. Sign in later to save progress.</p><p className="auth-switch">{mode === 'login' ? 'New to the Atlas?' : 'Already have an account?'} <button className="text-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></p></> : <><div className="auth-heading"><div><p className="eyebrow">Account recovery</p><h2>{token ? 'Choose a new password' : 'Reset your password'}</h2></div><span className="auth-glyph">↻</span></div><form className="auth-form" onSubmit={submitReset}>{!token ? <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label> : <><label>Reset token<input value={token} onChange={(event) => setToken(event.target.value)} required /></label><label>New password<input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></label></>}{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="success-text" role="status">{message}</p>}<button className="btn-primary auth-submit" type="submit">{token ? 'Update password' : 'Send reset link'} <span>→</span></button><button className="text-button" type="button" onClick={() => setResetMode(false)}>Back to sign in</button></form></>}
  </FloatingCard></main>;
}
