import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Logo from '../components/Logo';
import EkgMouseTrail from '../components/EkgMouseTrail';

// Register GSAP plugins locally for this file's context
gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const BENEFITS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: 'Real clinical conversations',
    desc: 'AI patients respond with authentic symptoms and emotions.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Rubric-based grading',
    desc: 'Scored on history-taking, diagnosis accuracy, and communication.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    title: 'Track your progress',
    desc: 'Performance dashboard showing improvement over time.',
  },
];

function EcgDecoration() {
  return (
    <svg viewBox="0 0 900 80" preserveAspectRatio="none" style={{ width: '100%', height: 56, opacity: 0.20 }}>
      <defs>
        <linearGradient id="ecgGradLogin" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(138,124,255,0)"/>
          <stop offset="25%"  stopColor="#8A7CFF"/>
          <stop offset="75%"  stopColor="#A69AFF"/>
          <stop offset="100%" stopColor="rgba(166,154,255,0)"/>
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#ecgGradLogin)"
        strokeWidth="2"
        points="0,40 80,40 110,40 135,8 155,72 175,22 200,40 280,40 310,40 335,8 355,72 375,22 400,40 480,40 510,40 535,8 555,72 575,22 600,40 680,40 710,40 735,8 755,72 775,22 800,40 900,40"
      />
    </svg>
  );
}

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { saveUser } = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const shellRef     = useRef(null);

  // ── GSAP entrance ──────────────────────────────────────────────────────────
  useGSAP(() => {
    console.log("Login useGSAP callback running. shellRef.current exists:", !!shellRef.current);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      console.log("Login matchMedia prefers-reduced-motion: no-preference matched. Setting up timeline...");
      // Floating orbs continuous animation
      gsap.to('.auth-orb-purple', {
        y: -30, x: 20, duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true,
      });
      gsap.to('.auth-orb-mint', {
        y: 25, x: -15, duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1,
      });
      gsap.to('.auth-orb-indigo', {
        y: -20, x: 30, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2,
      });

      // Card entrance cascade
      const tl = gsap.timeline({
        onComplete: () => console.log("Login entrance timeline played to completion!"),
        onStart: () => console.log("Login entrance timeline started!"),
        onUpdate: () => console.log("Login entrance timeline update, progress:", tl.progress().toFixed(2)),
      });
      tl
        .fromTo('.auth-box',
          { y: 50, autoAlpha: 0, scale: 0.97 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
        )
        .fromTo('.auth-box .login-logo-wrap',
          { scale: 0, rotation: -90, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.5)' },
          '-=0.4'
        )
        .fromTo('.auth-box .login-eyebrow',
          { y: -16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.3'
        )
        .to('.login-eyebrow-text', {
          duration: 0.8,
          scrambleText: {
            text: 'Clinical Console Link',
            chars: '0101100110',
            revealDelay: 0.1,
            speed: 0.4,
          },
          ease: 'none',
        }, '-=0.2')
        .fromTo('.auth-box .auth-title',
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out' },
          '-=0.2'
        );

      // SplitText on auth-title
      const titleEl = shellRef.current.querySelector('.auth-title');
      const split = new SplitText(titleEl, {
        type: 'words',
        wordsClass: 'split-word',
      });

      tl
        .fromTo(split.words,
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.04, ease: 'power3.out' },
          '-=0.2'
        )
        .fromTo('.auth-box .auth-subtitle',
          { y: 15, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.medical-monitor-panel',
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        )
        .to('.monitor-vital-syslink', {
          duration: 0.8,
          scrambleText: {
            text: 'SYS.LINK',
            chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            speed: 0.5,
          },
          ease: 'none',
        }, '-=0.25')
        .fromTo('.auth-form .reg-field',
          { x: -20, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, stagger: 0.09, duration: 0.45, ease: 'power2.out' },
          '-=0.15'
        )
        .fromTo('.reg-submit',
          { y: 16, autoAlpha: 0, scale: 0.95 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' },
          '-=0.1'
        );

      // 3D tilt on .auth-box
      const card = shellRef.current.querySelector('.auth-box');
      if (card) {
        const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
        const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });
        
        card.style.transformPerspective = '1000px';
        
        const handleMouseMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = x / rect.width - 0.5;
          const cy = y / rect.height - 0.5;
          
          rotX(-cy * 4); // subtle tilt for form
          rotY(cx * 4);
        };
        
        const handleMouseLeave = () => {
          rotX(0);
          rotY(0);
        };
        
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
      }
    });
    return () => mm.revert();
  }, { scope: shellRef });
  // ───────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      saveUser(data.user);
      const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={shellRef} className="auth-shell">
      {/* Mesh Grid Backdrop */}
      <div className="auth-grid-bg" />

      {/* Floating Ambient Glowing Blobs */}
      <div className="auth-bg-orb auth-orb-purple" />
      <div className="auth-bg-orb auth-orb-mint" />
      <div className="auth-bg-orb auth-orb-indigo" />

      {/* Centered Workspace Card */}
      <div className="auth-right">
        {/* Back link */}
        <Link
          to="/"
          className="auth-back-link"
          style={{
            position: 'absolute', top: -48, left: 0,
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 'var(--fs-sm)', color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            textDecoration: 'none', transition: 'color var(--t)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to home
        </Link>

        <div className="auth-box card-tech-corners">
          <div className="card-scanline" />

          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="login-logo-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Logo size={36} color="var(--purple)" />
            </div>
            <div className="login-eyebrow" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '4px 12px', borderRadius: 999,
              background: 'var(--purple-dim)',
              border: '1px solid var(--border-md)',
              marginBottom: 12,
              opacity: 0,
            }}>
              <div className="pulse-dot" style={{ width: 6, height: 6 }} />
              <span className="login-eyebrow-text" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--purple)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
                Clinical Console Link
              </span>
            </div>
            <h1 className="auth-title">Welcome back, Practitioner</h1>
            <p className="auth-subtitle">Establish connection to load patient profiles.</p>
          </div>

          {/* Medical Monitor Vital Signs Readout */}
          <div className="medical-monitor-panel">
            <div className="monitor-vital-col">
              <div className="monitor-vital-val" style={{ color: 'var(--success)' }}>
                <div className="pulse-dot" style={{ backgroundColor: 'var(--success)' }} />
                SECURE
              </div>
              <div className="monitor-vital-lbl">Station Status</div>
            </div>

            <svg className="monitor-ekg-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path
                d="M0 15 L20 15 L25 10 L30 20 L35 0 L40 30 L45 12 L50 15 L70 15 L75 10 L80 20 L85 0 L90 30 L95 12 L100 15"
                fill="none"
                stroke="var(--purple)"
                strokeWidth="1.5"
                strokeDasharray="200"
                strokeDashoffset="200"
                style={{ animation: 'drawEcg 4s linear infinite' }}
              />
            </svg>

            <div className="monitor-vital-col" style={{ alignItems: 'flex-end' }}>
              <div className="monitor-vital-val monitor-vital-syslink" style={{ color: 'var(--mint)' }}>
                SYS.LINK
              </div>
              <div className="monitor-vital-lbl">Diagnostic Port</div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="reg-error" style={{ marginBottom: 20 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="reg-field">
              <label className="reg-label" htmlFor="login-email">Email Address</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ left: 14 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="login-email"
                  type="email"
                  className="reg-input"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div className="reg-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="reg-label" htmlFor="login-password">Password</label>
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Demo platform: Password recovery is disabled. You can register a new account or try the demo mode.');
                  }}
                  style={{ fontSize: 'var(--fs-xs)', color: 'var(--purple)', fontWeight: 500 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ left: 14 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="reg-input reg-input-pwd"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  style={{ paddingLeft: 40 }}
                />
                <button
                  type="button"
                  className="reg-eye-btn"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="reg-submit w-full"
              disabled={loading || !email.trim() || !password.trim()}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <>
                  <div className="reg-spinner" />
                  Establishing Diagnostic Link...
                </>
              ) : 'Access Clinical Console'}
            </button>
          </form>

          <div className="divider" style={{ margin: '22px 0' }}>or</div>

          <Link
            to="/simulator?demo=cardiology"
            className="reg-submit w-full"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-str)',
              color: 'var(--text)',
              boxShadow: 'none',
              textAlign: 'center',
              justifyContent: 'center',
              marginTop: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-str)'}
          >
            Load Demo Session — Offline Access
          </Link>

          <p className="reg-signin-link">
            New to CURA.AI?{' '}
            <Link to="/register" style={{ color: 'var(--purple)', fontWeight: 600 }}>
              Create practitioner account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
