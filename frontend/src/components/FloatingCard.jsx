import React from 'react';

export default function FloatingCard({ children, className = '', delay = 0 }) {
  return (
    <section className={`glassmorphism-card floating-card ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </section>
  );
}
