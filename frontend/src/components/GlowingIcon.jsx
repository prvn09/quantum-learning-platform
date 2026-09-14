import React from 'react';

export default function GlowingIcon({ children, label }) {
  return <span className="glowing-icon icon-pulse" role="img" aria-label={label}>{children}</span>;
}
