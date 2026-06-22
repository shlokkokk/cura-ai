import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import Logo from '../components/Logo';

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

const AUTH_FEATURES = [
  {
    title: 'Real clinical conversations',
    desc: 'AI patients respond with authentic symptoms, emotions, and history — not scripted keywords.',
  },
  {
    title: 'Rubric-based grading',
    desc: 'Every session scored on history-taking, diagnosis accuracy, red flags, and communication.',
  },
  {
    title: 'Track your progress',
    desc: 'Performance dashboard shows improvement over time across specialties and case types.',
  },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { saveUser } = useAuth();
  const { isDark }   = useTheme();
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
      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="auth-left" aria-hidden="true">
        <div className="auth-left-glow" />
        <div className="auth-left-pattern" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={32} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <h2 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
            Master clinical<br />decision-making.
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 36 }}>
            Practice patient consultations, sharpen diagnostic reasoning,
            and build confidence — in a completely risk-free environment.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {AUTH_FEATURES.map(({ title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--teal)', marginTop: 6, flexShrink: 0,
                  boxShadow: '0 0 8px var(--teal)',
                }} />
                <div>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--mono)' }}>
          © {new Date().getFullYear()} CURA.AI — Synapse Team
        </div>
      </div>

      {/* ── Right panel: form ───────────────────────────────────── */}
      <div className="auth-right">
        <Link
          to="/"
          style={{
            position: 'absolute', top: 24, left: 28,
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 'var(--fs-sm)', color: 'var(--text-muted)',
            textDecoration: 'none', transition: 'color var(--t)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </Link>

        <div className="auth-box">
          <div style={{ marginBottom: 32 }}>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue your clinical training.</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

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
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', cursor: 'default' }}>
                  {/* Future: Forgot Password link */}
                </span>
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
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }}>or</div>

          <Link
            to="/simulator?demo=cardiology"
            className="btn btn-outline btn-lg w-full"
            style={{ textAlign: 'center', justifyContent: 'center' }}
          >
            Try Demo — No Account Required
          </Link>

          <p className="auth-footer-link" style={{ marginTop: 24 }}>
            New to CURA.AI?{' '}
            <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600 }}>
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
