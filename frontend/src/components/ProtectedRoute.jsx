import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <AuthPage />;
}
