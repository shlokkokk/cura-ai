import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CURA.AI Logo — Figma-aligned, purple brand
 * Uses DM Sans (loaded globally) + purple CSS variable
 */
export default function Logo({ size = 32, color = 'var(--text)' }) {
  const isWhite = color === '#fff' || color === 'white';
  const textColor = isWhite ? '#FFFFFF' : 'var(--text)';
  const accentColor = isWhite ? 'rgba(255,255,255,0.85)' : 'var(--purple)';
  const bgCenter = isWhite ? 'rgba(255,255,255,0.15)' : 'var(--bg)';

  return (
    <Link to="/" className="logo-container" aria-label="CURA.AI — Home">
      {/* Medical cross icon — purple brand */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="logo-icon"
      >
        {/* Outer dashed ring */}
        <circle
          cx="20" cy="20" r="18"
          stroke={isWhite ? 'rgba(255,255,255,0.4)' : 'var(--purple)'}
          strokeWidth="1.5"
          strokeDasharray="4 2.5"
          opacity="0.45"
        />
        {/* Background fill */}
        <circle
          cx="20" cy="20" r="13"
          fill={isWhite ? 'rgba(255,255,255,0.12)' : 'var(--purple-dim)'}
          stroke={isWhite ? 'rgba(255,255,255,0.5)' : 'var(--purple)'}
          strokeWidth="1.5"
        />
        {/* Medical cross — vertical */}
        <rect x="17" y="11" width="6" height="18" rx="2"
          fill={isWhite ? '#fff' : 'var(--purple)'}
        />
        {/* Medical cross — horizontal */}
        <rect x="11" y="17" width="18" height="6" rx="2"
          fill={isWhite ? '#fff' : 'var(--purple)'}
        />
        {/* Center accent dot */}
        <circle cx="20" cy="20" r="2.5" fill={bgCenter} />
      </svg>

      {/* Wordmark */}
      <span className="logo-text" style={{ color: textColor }}>
        CURA<span className="logo-accent" style={{ color: accentColor }}>.AI</span>
      </span>
    </Link>
  );
}
