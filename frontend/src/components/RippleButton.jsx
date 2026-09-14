import React, { useState } from 'react';

export default function RippleButton({ children, onClick, disabled = false }) {
  const [ripples, setRipples] = useState([]);

  function handleClick(event) {
    if (disabled) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ripple = { id: Date.now(), x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => setRipples((current) => current.filter((item) => item.id !== ripple.id)), 650);
    onClick?.(event);
  }

  return (
    <button className="btn-primary ripple-button" type="button" onClick={handleClick} disabled={disabled}>
      {children}
      {ripples.map((ripple) => (
        <span className="ripple-wave" key={ripple.id} style={{ left: ripple.x, top: ripple.y }} />
      ))}
    </button>
  );
}
