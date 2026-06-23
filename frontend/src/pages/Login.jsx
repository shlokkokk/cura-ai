import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Logo from '../components/Logo';

/* ── Icons ─────────────────────────────────────────────────────────── */
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

/* ── Left panel feature bullets ─────────────────────────────────────── */
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

/* ── ECG decoration ─────────────────────────────────────────────────── */
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

/* ── Main Login ─────────────────────────────────────────────────────── */
export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { saveUser } = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();

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
    <div className="auth-shell">
      {/* ── Left panel — Figma purple gradient ──────────────────────── */}
      <div className="auth-left" aria-hidden="true">
        <div className="auth-left-glow" />
        <div className="auth-left-pattern" />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={32} color="#fff" />
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.20)',
            marginBottom: 20,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6EE7B7', boxShadow: '0 0 8px #6EE7B7' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
              Clinical Training Platform
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font)',
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 800, letterSpacing: '-0.04em',
            color: '#fff', marginBottom: 14, lineHeight: 1.2,
          }}>
            Master clinical<br />decision-making.
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.60)', lineHeight: 1.75, marginBottom: 36, fontFamily: 'var(--font-body)' }}>
            Practice patient consultations, sharpen diagnostic reasoning,
            and build real confidence — in a zero-risk environment.
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {BENEFITS.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.9)', flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'rgba(255,255,255,0.95)', marginBottom: 2, fontFamily: 'var(--font-body)' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ECG decoration */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <EcgDecoration />
          <div style={{ fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--mono)', marginTop: 8 }}>
            © {new Date().getFullYear()} CURA.AI — Synapse Team
          </div>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────────────── */}
      <div className="auth-right">
        {/* Back link */}
        <Link
          to="/"
          className="auth-back-link"
          style={{
            position: 'absolute', top: 24, left: 28,
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

        <div className="auth-box">
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue your clinical training.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="doctor@hospital.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="login-password">Password</label>
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
              <div className="input-group">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading || !email.trim() || !password.trim()}
              style={{ marginTop: 4, justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{ margin: '22px 0' }}>or</div>

          <Link
            to="/simulator?demo=cardiology"
            className="btn btn-outline btn-lg w-full"
            style={{ textAlign: 'center', justifyContent: 'center' }}
          >
            Try Demo — No Account Required
          </Link>

          <p className="auth-footer-link">
            New to CURA.AI?{' '}
            <Link to="/register" style={{ color: 'var(--purple)', fontWeight: 600 }}>
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
