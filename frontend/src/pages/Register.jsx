import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Logo from '../components/Logo';

/* ── Icons ─────────────────────────────────────────────────────── */
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

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

/* ── ECG SVG path (decorative) ──────────────────────────────────── */
const ECGPath = () => (
  <svg viewBox="0 0 900 120" preserveAspectRatio="none" style={{ width: '100%', height: 80, opacity: 0.18 }}>
    <polyline
      fill="none"
      stroke="url(#ecgGrad)"
      strokeWidth="2"
      points="0,60 60,60 80,60 100,10 115,110 130,35 145,60 200,60 220,60 240,10 255,110 270,35 285,60 340,60 360,60 380,10 395,110 410,35 425,60 480,60 500,60 520,10 535,110 550,35 565,60 620,60 640,60 660,10 675,110 690,35 705,60 760,60 780,60 800,10 815,110 830,35 845,60 900,60"
    />
    <defs>
      <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(0,201,177,0)"/>
        <stop offset="30%" stopColor="#00C9B1"/>
        <stop offset="70%" stopColor="#00C9B1"/>
        <stop offset="100%" stopColor="rgba(0,201,177,0)"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ── Static data ─────────────────────────────────────────────────── */
const ROLES = [
  { value: 'student',    label: 'Medical Student' },
  { value: 'resident',   label: 'Resident / Intern' },
  { value: 'faculty',    label: 'Faculty / Attending' },
  { value: 'researcher', label: 'Medical Researcher' },
];

const SPECIALTIES = [
  'General Medicine','Cardiology','Neurology','Respiratory Medicine','Endocrinology',
  'General Surgery','Orthopedics','Pediatrics','Psychiatry','Dermatology',
  'Gastroenterology','Nephrology','Oncology','Emergency Medicine','Obstetrics & Gynecology',
  'Radiology','Ophthalmology','ENT','Urology','Hematology',
];

const YEARS = ['Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Intern','PGY-1','PGY-2','PGY-3+','Attending'];

const PERKS = [
  { icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ), title: 'Unlimited AI patient sessions', desc: 'No caps, no paywalls' },
  { icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ), title: '10+ medical specialties', desc: 'Full coverage across all disciplines' },
  { icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ), title: 'Performance analytics & rubric scores', desc: 'Know exactly where you stand' },
  { icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ), title: 'Emergency timed scenarios', desc: 'Train under real clinical pressure' },
];

/* ── Component ───────────────────────────────────────────────────── */
export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    institution: '', role: 'student', year: '', spec: '',
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { saveUser } = useAuth();
  const navigate     = useNavigate();

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'password') {
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/[0-9]/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      setPwdStrength(s);
    }
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'var(--danger)', 'var(--warning)', 'var(--indigo)', 'var(--success)'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.spec) { setError('Please select a specialization.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({
          name:           form.name.trim(),
          email:          form.email.trim(),
          password:       form.password,
          institution:    form.institution.trim() || undefined,
          role:           form.role,
          yearOfStudy:    form.year || undefined,
          specialization: form.spec,
        }),
      });
      saveUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formComplete = form.name.trim() && form.email.trim() && form.password && form.spec;

  return (
    <div className="reg-shell">
      {/* ── LEFT PANEL ──────────────────────────────────────────── */}
      <aside className="reg-left" aria-hidden="true">

        {/* Ambient layers */}
        <div className="reg-left-ambient" />
        <div className="reg-left-grid" />

        {/* Floating orbs */}
        <div className="reg-orb reg-orb-1" />
        <div className="reg-orb reg-orb-2" />

        {/* Logo */}
        <div className="reg-left-logo">
          <Logo size={28} />
        </div>

        {/* Main copy */}
        <div className="reg-left-body">
          {/* Badge */}
          <div className="reg-left-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Clinical Simulation Platform
          </div>

          <h2 className="reg-left-headline">
            Train like a<br />
            <span className="reg-left-accent">real doctor.</span>
          </h2>
          <p className="reg-left-sub">
            AI-generated patients. Real clinical reasoning.
            Instant feedback. Join thousands of med students and residents.
          </p>

          {/* ECG divider */}
          <div className="reg-ecg-wrap">
            <ECGPath />
          </div>

          {/* Perks list */}
          <div className="reg-perks">
            {PERKS.map(({ icon, title, desc }) => (
              <div key={title} className="reg-perk">
                <div className="reg-perk-icon">{icon}</div>
                <div>
                  <div className="reg-perk-title">{title}</div>
                  <div className="reg-perk-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="reg-social-proof">
            <div className="reg-proof-avatars">
              {['S','M','R','A','K'].map((l, i) => (
                <div key={i} className="reg-proof-avatar" style={{ background: i % 2 === 0 ? 'rgba(0,201,177,0.35)' : 'rgba(99,102,241,0.35)' }}>{l}</div>
              ))}
            </div>
            <div className="reg-proof-text">
              <strong>2,400+</strong> medical learners already training
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="reg-left-footer">
          © {new Date().getFullYear()} CURA.AI — Synapse Team
        </div>
      </aside>

      {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
      <main className="reg-right">

        {/* Back link */}
        <Link to="/" className="reg-back-link">
          <BackIcon />
          Back to home
        </Link>

        {/* Form card */}
        <div className="reg-form-card">

          {/* Header */}
          <div className="reg-form-header">
            <div className="reg-form-eyebrow">Free forever</div>
            <h1 className="reg-form-title">Create your account</h1>
            <p className="reg-form-sub">
              Join and start practicing clinical cases in minutes.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="reg-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="reg-form" onSubmit={handleSubmit} noValidate>

            {/* Row 1: Name + Email */}
            <div className="reg-row-2">
              <div className="reg-field">
                <label className="reg-label" htmlFor="reg-name">Full Name <span className="req">*</span></label>
                <div className="reg-input-wrap">
                  <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    id="reg-name" type="text"
                    className="reg-input"
                    placeholder="Dr. Sarah Johnson"
                    value={form.name} onChange={set('name')}
                    autoComplete="name" required disabled={loading}
                  />
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-label" htmlFor="reg-email">Email Address <span className="req">*</span></label>
                <div className="reg-input-wrap">
                  <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="reg-email" type="email"
                    className="reg-input"
                    placeholder="sarah@hospital.org"
                    value={form.email} onChange={set('email')}
                    autoComplete="email" required disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="reg-field">
              <label className="reg-label" htmlFor="reg-password">Password <span className="req">*</span></label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  className="reg-input reg-input-pwd"
                  placeholder="Create a strong password"
                  value={form.password} onChange={set('password')}
                  autoComplete="new-password" required disabled={loading} minLength={6}
                />
                <button
                  type="button"
                  className="reg-eye-btn"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>

              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="reg-strength">
                  <div className="reg-strength-bars">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className="reg-strength-bar"
                        style={{ background: i <= pwdStrength ? strengthColor[pwdStrength] : 'var(--border-str)' }}
                      />
                    ))}
                  </div>
                  <span className="reg-strength-label" style={{ color: strengthColor[pwdStrength] }}>
                    {strengthLabel[pwdStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Institution */}
            <div className="reg-field">
              <label className="reg-label" htmlFor="reg-institution">Institution <span className="reg-optional">optional</span></label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <input
                  id="reg-institution" type="text"
                  className="reg-input"
                  placeholder="University Medical Center"
                  value={form.institution} onChange={set('institution')}
                  autoComplete="organization" disabled={loading}
                />
              </div>
            </div>

            {/* Role + Year */}
            <div className="reg-row-2">
              <div className="reg-field">
                <label className="reg-label" htmlFor="reg-role">Role <span className="req">*</span></label>
                <div className="reg-select-wrap">
                  <select id="reg-role" className="reg-select" value={form.role} onChange={set('role')} disabled={loading} required>
                    {ROLES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <svg className="reg-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-label" htmlFor="reg-year">Year / Level</label>
                <div className="reg-select-wrap">
                  <select id="reg-year" className="reg-select" value={form.year} onChange={set('year')} disabled={loading}>
                    <option value="">Select year...</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <svg className="reg-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Specialization */}
            <div className="reg-field">
              <label className="reg-label" htmlFor="reg-spec">Primary Specialization <span className="req">*</span></label>
              <div className="reg-select-wrap">
                <select id="reg-spec" className="reg-select" value={form.spec} onChange={set('spec')} required disabled={loading}>
                  <option value="">Select your specialty...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <svg className="reg-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="reg-progress-row">
              {[
                !!form.name.trim(),
                !!form.email.trim(),
                form.password.length >= 6,
                !!form.spec,
              ].map((done, i) => (
                <div key={i} className={`reg-progress-step ${done ? 'done' : ''}`}>
                  {done ? <CheckIcon /> : i + 1}
                </div>
              ))}
              <div className="reg-progress-text">
                {[!!form.name.trim(), !!form.email.trim(), form.password.length >= 6, !!form.spec].filter(Boolean).length} of 4 required fields completed
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="reg-submit"
              disabled={loading || !formComplete}
              id="reg-submit-btn"
            >
              {loading ? (
                <>
                  <div className="reg-spinner" />
                  Creating your account...
                </>
              ) : (
                <>
                  Create Account — It's Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="reg-signin-link">
            Already have an account?{' '}
            <Link to="/login">Sign In</Link>
          </p>

          {/* Trust badges */}
          <div className="reg-trust">
            <div className="reg-trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secure & encrypted
            </div>
            <div className="reg-trust-sep" />
            <div className="reg-trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              No credit card needed
            </div>
            <div className="reg-trust-sep" />
            <div className="reg-trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              HIPAA-aware design
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
