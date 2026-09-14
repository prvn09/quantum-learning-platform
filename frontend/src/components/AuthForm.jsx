import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function validate(values, mode) {
  if (mode === 'register' && !values.displayName.trim()) return 'Enter your display name';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) return 'Enter a valid email address';
  if (values.password.length < 8) return 'Password must be at least 8 characters';
  if (mode === 'register' && values.password !== values.confirmPassword) return 'Passwords do not match';
  return '';
}

export default function AuthForm({ mode = 'login', onForgotPassword, onSuccess }) {
  const { signIn, signUp, loading } = useAuth();
  const [values, setValues] = useState({ displayName: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  function update(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    const validationError = validate(values, mode);
    if (validationError) return setError(validationError);
    setError('');
    try { await (isRegister ? signUp(values) : signIn({ email: values.email, password: values.password })); onSuccess?.(); }
    catch (requestError) { setError(requestError.message); }
  }

  return <form className="auth-form" onSubmit={submit} noValidate>
    {isRegister && <label>Display name<input name="displayName" value={values.displayName} onChange={update} autoComplete="name" placeholder="Ada Lovelace" /></label>}
    <label>Email<input name="email" type="email" value={values.email} onChange={update} autoComplete="email" placeholder="you@example.com" /></label>
    <label>Password<input name="password" type="password" value={values.password} onChange={update} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="8+ characters" /></label>
    {isRegister && <><label>Confirm password<input name="confirmPassword" type="password" value={values.confirmPassword} onChange={update} autoComplete="new-password" placeholder="Repeat password" /></label><label>Learning role<select name="role" value={values.role} onChange={update}><option value="student">Student</option><option value="faculty">Faculty</option></select></label></>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="btn-primary auth-submit" type="submit" disabled={loading}>{loading ? 'Connecting...' : isRegister ? 'Create account' : 'Sign in'} <span>→</span></button>
    {!isRegister && <button className="text-button" type="button" onClick={onForgotPassword}>Forgot your password?</button>}
  </form>;
}
