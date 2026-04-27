import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Logo({ size = 32, dark = false }) {
  const color1 = dark ? '#c4b5fd' : '#7C3AED';
  const color2 = dark ? '#a78bfa' : '#5B21B6';

  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <motion.div 
        style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}
        whileHover={{ scale: 1.05, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circuit board pins - top */}
          <line x1="20" y1="2" x2="20" y2="10" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="32" y1="2" x2="32" y2="10" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="44" y1="2" x2="44" y2="10" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Circuit board pins - bottom */}
          <line x1="20" y1="54" x2="20" y2="62" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="32" y1="54" x2="32" y2="62" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="44" y1="54" x2="44" y2="62" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Circuit board pins - left */}
          <line x1="2" y1="20" x2="10" y2="20" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="2" y1="32" x2="10" y2="32" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="2" y1="44" x2="10" y2="44" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Circuit board pins - right */}
          <line x1="54" y1="20" x2="62" y2="20" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="54" y1="32" x2="62" y2="32" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="54" y1="44" x2="62" y2="44" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Corner diagonal pins */}
          <line x1="4" y1="4" x2="12" y2="12" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="60" y1="4" x2="52" y2="12" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="4" y1="60" x2="12" y2="52" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="60" y1="60" x2="52" y2="52" stroke={color1} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Main chip body - rounded rect */}
          <rect x="10" y="10" width="44" height="44" rx="8" stroke={color2} strokeWidth="3" fill="none"/>
          {/* Heart shape */}
          <path d="M32 44C32 44 20 36 20 28C20 24 23 22 26 22C28.5 22 30.5 23.5 32 25.5C33.5 23.5 35.5 22 38 22C41 22 44 24 44 28C44 36 32 44 32 44Z" 
                stroke={color2} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Cross inside heart */}
          <line x1="32" y1="29" x2="32" y2="37" stroke={color2} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="28" y1="33" x2="36" y2="33" stroke={color2} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </motion.div>
      <span style={{ 
        fontSize: size > 28 ? '1.3rem' : '1.1rem', 
        fontWeight: '800', 
        letterSpacing: '0.02em',
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        CURA.AI
      </span>
    </Link>
  );
}
