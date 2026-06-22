import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar() {
  const { user, saveUser } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    saveUser(null);
    navigate('/');
    setMenuOpen(false);
  };

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 'var(--z-sticky)',
    height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px',
    background: scrolled
      ? isDark ? 'rgba(8,13,20,0.95)' : 'rgba(242,246,251,0.95)'
      : isDark ? 'rgba(8,13,20,0.8)' : 'rgba(242,246,251,0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: scrolled ? '1px solid var(--border-md)' : '1px solid var(--border)',
    transition: 'all 300ms var(--ease)',
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/features', label: 'Features' },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      <nav style={navStyle} role="navigation" aria-label="Main navigation">
        {/* Brand */}
        <Logo size={30} />

        {/* Desktop Nav */}
        <div className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <>
              <Link to="/simulator" className="btn btn-primary btn-sm">
                Open Lab
              </Link>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--teal-dim)', border: '1.5px solid rgba(0,201,177,0.3)',
                  color: 'var(--teal)', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)',
                }}
                title={`${user.name} — Dashboard`}
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-icon"
            style={{ display: 'none' }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            id="nav-mobile-toggle"
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', top: 64, left: 0, right: 0, zIndex: 'var(--z-sticky)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border-md)',
            padding: '16px 24px 20px',
            display: 'flex', flexDirection: 'column', gap: 8,
            animation: 'slideDown 200ms var(--ease)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to} to={to}
              className="nav-link"
              style={{ display: 'block', padding: '10px 12px' }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline btn-sm w-full" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center' }}>Dashboard</Link>
              <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm w-full" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm w-full" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center' }}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
