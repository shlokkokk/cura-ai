import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function UserAvatar({ name, onClick, title }) {
  const initial = name?.charAt(0).toUpperCase() || '?';
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36, height: 36,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--purple) 0%, #A69AFF 100%)',
        border: '2px solid rgba(138,124,255,0.3)',
        color: '#fff',
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font)',
        boxShadow: '0 2px 10px rgba(138,124,255,0.30)',
        transition: 'all var(--t)',
        outline: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = 'var(--purple-glow)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(138,124,255,0.30)'; }}
    >
      {initial}
    </button>
  );
}

export default function Navbar() {
  const { user, saveUser } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navRef = useRef(null);
  const drawerRef = useRef(null);

  // Entrance animation — slides in from top on first mount
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline();
      tl.from(navRef.current, {
        y: -80,
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
      .from('.navbar-logo-anim', {
        scale: 0.7,
        autoAlpha: 0,
        duration: 0.4,
        ease: 'back.out(2)',
      }, '-=0.3')
      .from('.nav-link-anim', {
        y: -12,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 0.35,
        ease: 'power2.out',
      }, '-=0.25')
      .from('.nav-actions-anim > *', {
        scale: 0.85,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.35,
        ease: 'back.out(1.7)',
      }, '-=0.2');
    });
    return () => mm.revert();
  }, { scope: navRef });

  // Mobile drawer animation
  useGSAP(() => {
    if (!drawerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (menuOpen) {
        gsap.fromTo(drawerRef.current,
          { y: -20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.from('.drawer-link-anim', {
          x: -16,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.25,
          ease: 'power2.out',
          delay: 0.1,
        });
      }
    });
    return () => mm.revert();
  }, { scope: drawerRef, dependencies: [menuOpen] });

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

  const navLinks = [
    { to: '/',         label: 'Home'     },
    { to: '/features', label: 'Features' },
    { to: '/about',    label: 'About'    },
    { to: '/pricing',  label: 'Pricing'  },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <span className="navbar-logo-anim">
          <Logo size={30} />
        </span>

        {/* Desktop Nav */}
        <div className="navbar-nav" id="navbar-links">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link nav-link-anim${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="nav-actions-anim" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <div className="navbar-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/simulator" className="btn btn-primary btn-sm">
                Open Lab
              </Link>
              <UserAvatar
                name={user.name}
                onClick={() => navigate('/dashboard')}
                title={`${user.name} — Dashboard`}
              />
            </div>
          ) : (
            <div className="navbar-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-icon"
            id="nav-mobile-toggle"
            style={{ display: 'none' }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div ref={drawerRef} className="mobile-drawer" role="navigation" aria-label="Mobile navigation">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="nav-link drawer-link-anim"
              style={{ display: 'block', padding: '10px 14px' }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="drawer-link-anim" style={{ height: 1, background: 'var(--border-md)', margin: '4px 0' }} />
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="btn btn-outline btn-sm w-full drawer-link-anim"
                onClick={() => setMenuOpen(false)}
                style={{ textAlign: 'center', justifyContent: 'center' }}
              >
                Dashboard
              </Link>
              <button className="btn btn-ghost btn-sm w-full drawer-link-anim" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-outline btn-sm w-full drawer-link-anim"
                onClick={() => setMenuOpen(false)}
                style={{ textAlign: 'center', justifyContent: 'center' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm w-full drawer-link-anim"
                onClick={() => setMenuOpen(false)}
                style={{ textAlign: 'center', justifyContent: 'center' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #nav-mobile-toggle { display: flex !important; }
          #navbar-links { display: none !important; }
        }
      `}</style>
    </>
  );
}
