import React from 'react';

export default function ProgressBar({ value, label = 'Progress' }) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-wrap">
      <div className="progress-label"><span>{label}</span><strong>{percentage}%</strong></div>
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
