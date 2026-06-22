import React from 'react';
import { Link } from 'react-router-dom';

/** CURA.AI Logo — clean, med-themed, CSS-var aware */
export default function Logo({ size = 32 }) {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring */}
        <circle cx="20" cy="20" r="18" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
        {/* Core circle */}
        <circle cx="20" cy="20" r="13" fill="var(--teal-dim)" stroke="var(--teal)" strokeWidth="1.5" />
        {/* Cross (medical) */}
        <rect x="17" y="11" width="6" height="18" rx="2" fill="var(--teal)" />
        <rect x="11" y="17" width="18" height="6" rx="2" fill="var(--teal)" />
        {/* Center accent */}
        <circle cx="20" cy="20" r="2.5" fill="var(--bg)" />
      </svg>
      <span style={{
        fontSize: size > 28 ? '1.2rem' : '1rem',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: 'var(--text)',
        fontFamily: 'var(--font)',
      }}>
        CURA<span style={{ color: 'var(--teal)' }}>.AI</span>
      </span>
    </Link>
  );
}
