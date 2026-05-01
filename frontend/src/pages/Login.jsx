import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { saveUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      saveUser(data.user);
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Left Panel: Informative Notes */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a1035, #6D28D9)', color: 'white', padding: '60px', flexDirection: 'column', justifyContent: 'space-between', display: window.innerWidth < 900 ? 'none' : 'flex' }} className="auth-left-panel">
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Logo size={40} dark={true} />
          </Link>
        </div>
        <div style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>Master your clinical reasoning.</h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '40px' }}>
            Join thousands of medical professionals using Cura AI to practice diagnosis, patient communication, and critical thinking in a safe, hyper-realistic simulated environment.
          </p>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎙️</div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Natural Conversations</h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Speak to virtual patients just like you would in a real clinic.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Instant Rubric Feedback</h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Get evaluated on differentials, red flags, and empathy instantly.</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
          &copy; {new Date().getFullYear()} Cura AI. Built for the future of medicine.
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)', position: 'relative' }}>
        <Link to="/" style={{ position: 'absolute', top: '40px', right: '40px', color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Home
        </Link>
        
        <div className="auth-box" style={{ width: '100%', maxWidth: '440px' }}>
          <div className="mobile-logo" style={{ marginBottom: '40px', display: 'none' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Logo size={40} dark={false} />
            </Link>
          </div>
          <div className="auth-icon" style={{ display: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <h1 className="auth-title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h1>
          <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: '32px' }}>Sign in to continue your clinical training.</p>
          
          {error && <div style={{ color: 'var(--danger)', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '24px' }}>
            <div className="sim-field">
              <label htmlFor="email">Email address</label>
              <input type="email" id="email" placeholder="doctor@example.com" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div className="sim-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="password">Password</label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</a>
              </div>
              <div className="pwd-wrapper" style={{ position: 'relative' }}>
                <input 
                  type={showPwd ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  autoComplete="current-password" 
                  style={{ paddingRight: '40px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!showPwd ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="auth-form__actions" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            
            <div className="auth-divider" style={{ margin: '20px 0' }}>or</div>
            
            <div className="auth-form__actions">
              <Link to="/register" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>Don't have an account? Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
