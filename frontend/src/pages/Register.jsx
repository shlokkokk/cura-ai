import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Logo from '../components/Logo';
import EkgMouseTrail from '../components/EkgMouseTrail';

// Register GSAP plugins locally for this file's context
gsap.registerPlugin(SplitText, ScrambleTextPlugin, useGSAP);

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

const ECGPath = () => (
  <svg viewBox="0 0 900 120" preserveAspectRatio="none" style={{ width: '100%', height: 80, opacity: 0.22 }}>
    <polyline
      fill="none"
      stroke="url(#ecgGradReg)"
      strokeWidth="2"
      points="0,60 60,60 80,60 100,10 115,110 130,35 145,60 200,60 220,60 240,10 255,110 270,35 285,60 340,60 360,60 380,10 395,110 410,35 425,60 480,60 500,60 520,10 535,110 550,35 565,60 620,60 640,60 660,10 675,110 690,35 705,60 760,60 780,60 800,10 815,110 830,35 845,60 900,60"
    />
    <defs>
      <linearGradient id="ecgGradReg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="rgba(138,124,255,0)"/>
        <stop offset="25%"  stopColor="#8A7CFF"/>
        <stop offset="75%"  stopColor="#A69AFF"/>
        <stop offset="100%" stopColor="rgba(166,154,255,0)"/>
      </linearGradient>
    </defs>
  </svg>
);

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

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    institution: '', role: 'student', year: '', spec: '',
  });
  const [step, setStep] = useState(1);
  const [showPwd, setShowPwd]   = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { saveUser } = useAuth();
  const navigate     = useNavigate();
  const shellRef     = useRef(null);

  // Animate orbs on mount
  useGSAP(() => {
    console.log("Register useGSAP callback running. shellRef.current exists:", !!shellRef.current);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      console.log("Register matchMedia prefers-reduced-motion: no-preference matched. Setting up timeline...");
      gsap.to('.auth-orb-purple', { y: -30, x: 20, duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to('.auth-orb-mint',   { y: 25, x: -15, duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 });
      gsap.to('.auth-orb-indigo', { y: -20, x: 30, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 });

      // Card entrance
      const tl = gsap.timeline({
        onComplete: () => console.log("Register entrance timeline played to completion!"),
        onStart: () => console.log("Register entrance timeline started!"),
        onUpdate: () => console.log("Register entrance timeline update, progress:", tl.progress().toFixed(2)),
      });
      tl
        .fromTo('.reg-form-card',
          { y: 50, autoAlpha: 0, scale: 0.97 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
        )
        .fromTo('.reg-form-header .reg-logo-wrap',
          { scale: 0, rotation: -90, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.5)' },
          '-=0.4'
        )
        .fromTo('.reg-form-header .reg-form-eyebrow',
          { y: -16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.3'
        )
        .to('.reg-form-eyebrow-text', {
          duration: 0.8,
          scrambleText: {
            text: 'Medical Practitioner Portal',
            chars: '0101100110',
            revealDelay: 0.1,
            speed: 0.4,
          },
          ease: 'none',
        }, '-=0.2')
        .fromTo('.reg-form-header .reg-form-title',
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out' },
          '-=0.25'
        );

      // SplitText on reg-form-title
      const titleEl = shellRef.current.querySelector('.reg-form-title');
      const split = new SplitText(titleEl, {
        type: 'words',
        wordsClass: 'split-word',
      });

      tl
        .fromTo(split.words,
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.04, ease: 'power3.out' },
          '-=0.25'
        )
        .fromTo('.reg-form-header .reg-form-sub',
          { y: 15, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.medical-monitor-panel',
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo('.medical-step-tracker',
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' },
          '-=0.15'
        );

      // 3D tilt on .reg-form-card
      const card = shellRef.current.querySelector('.reg-form-card');
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

  // Step transition animation
  const stepContainerRef = useRef(null);
  useEffect(() => {
    const el = stepContainerRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(el,
        { x: step === 1 ? -30 : 30, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }
      );
    });
    return () => mm.revert();
  }, [step]);

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

  const validateStep1 = () => {
    if (!form.name.trim()) { setError('Please enter your full name.'); return false; }
    if (!form.email.trim()) { setError('Please enter your email address.'); return false; }
    if (!form.password) { setError('Please create a password.'); return false; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
    setError('');
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) { setStep(1); return; }
    if (!form.spec) { setError('Please select a specialization.'); return; }
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

  const formComplete = form.name.trim() && form.email.trim() && form.password.length >= 6 && form.spec;

  return (
    <div ref={shellRef} className="reg-shell">
      {/* Mesh Grid Backdrop */}
      <div className="auth-grid-bg" />

      {/* Floating Ambient Glowing Blobs */}
      <div className="auth-bg-orb auth-orb-purple" />
      <div className="auth-bg-orb auth-orb-mint" />
      <div className="auth-bg-orb auth-orb-indigo" />

      {/* Centered Workspace Card */}
      <main className="reg-right">
        {/* Back link */}
        <Link to="/" className="reg-back-link">
          <BackIcon />
          Back to home
        </Link>

        <div className="reg-form-card card-tech-corners">
          <div className="card-scanline" />

          {/* Logo & Header */}
          <div className="reg-form-header" style={{ textAlign: 'center' }}>
            <div className="reg-logo-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Logo size={36} color="var(--purple)" />
            </div>
            <div className="reg-form-eyebrow" style={{ opacity: 0 }}>
              <span className="reg-form-eyebrow-text">Medical Practitioner Portal</span>
            </div>
            <h1 className="reg-form-title">Practitioner Registration</h1>
            <p className="reg-form-sub">
              Set up your workstation profile to begin simulation cases.
            </p>
          </div>

          {/* Medical Monitor Vital Signs Readout */}
          <div className="medical-monitor-panel">
            <div className="monitor-vital-col">
              <div className="monitor-vital-val">
                <div className="pulse-dot" />
                72 <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>BPM</span>
              </div>
              <div className="monitor-vital-lbl">Practitioner HR</div>
            </div>

            <svg className="monitor-ekg-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path
                d="M0 15 L20 15 L25 10 L30 20 L35 0 L40 30 L45 12 L50 15 L70 15 L75 10 L80 20 L85 0 L90 30 L95 12 L100 15"
                fill="none"
                stroke="var(--mint)"
                strokeWidth="1.5"
                strokeDasharray="200"
                strokeDashoffset="200"
                style={{ animation: 'drawEcg 4s linear infinite' }}
              />
            </svg>

            <div className="monitor-vital-col" style={{ alignItems: 'flex-end' }}>
              <div className="monitor-vital-val" style={{ color: 'var(--purple)' }}>
                SYS 120
              </div>
              <div className="monitor-vital-lbl">Link Status: Online</div>
            </div>
          </div>

          {/* Medical Progress Tab Tracker */}
          <div className="medical-step-tracker">
            <div
              className={`med-step-tab ${step === 1 ? 'active' : ''}`}
              onClick={() => step === 2 && setStep(1)}
            >
              <span className="step-num">01</span> Identification
            </div>
            <div className="med-step-arrow">→</div>
            <div
              className={`med-step-tab ${step === 2 ? 'active' : ''}`}
              onClick={() => step === 1 && validateStep1() && setStep(2)}
            >
              <span className="step-num">02</span> Specialization
            </div>
          </div>

          {/* Errors */}
          {error && (
            <div className="reg-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Forms */}
          <form className="reg-form" onSubmit={step === 1 ? handleNextStep : handleSubmit} noValidate>
            <div ref={stepContainerRef}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                  {/* Password Strength Indicators */}
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

                <button
                  type="submit"
                  className="reg-submit"
                  disabled={loading || !form.name.trim() || !form.email.trim() || form.password.length < 6}
                >
                  Continue to Specialty Selection
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            )}

            {/* PHASE 2: Specialization & Scope of Practice */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                {/* Progress Indicators */}
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

                {/* Submit Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="submit"
                    className="reg-submit"
                    disabled={loading || !formComplete}
                    id="reg-submit-btn"
                  >
                    {loading ? (
                      <>
                        <div className="reg-spinner" />
                        Initializing Workstation...
                      </>
                    ) : (
                      <>
                        Complete Setup — Access Console
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="reg-submit"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-str)',
                      color: 'var(--text-muted)',
                      boxShadow: 'none',
                      padding: '10px 24px',
                      fontSize: 'var(--fs-sm)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    ← Back to Identification
                  </button>
                </div>
              </div>
            )}
            </div>
          </form>

          {/* Sign In Link */}
          <p className="reg-signin-link">
            Already registered?{' '}
            <Link to="/login">Sign In</Link>
          </p>

          {/* Secure Trust Badges */}
          <div className="reg-trust">
            <div className="reg-trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secure Link
            </div>
            <div className="reg-trust-sep" />
            <div className="reg-trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              No payment req.
            </div>
            <div className="reg-trust-sep" />
            <div className="reg-trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              HIPAA Compliant
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
