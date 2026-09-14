import React from 'react';

const particles = Array.from({ length: 12 }, (_, index) => index);

export default function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="background-particles">
      {particles.map((particle) => (
        <span
          className="particle"
          key={particle}
          style={{
            left: `${8 + ((particle * 17) % 86)}%`,
            top: `${12 + ((particle * 23) % 76)}%`,
            animationDelay: `${particle * -0.7}s`,
            opacity: 0.18 + (particle % 3) * 0.08,
          }}
        />
      ))}
    </div>
  );
}
