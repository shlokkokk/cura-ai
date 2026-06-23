import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import EkgMouseTrail from '../components/EkgMouseTrail';

const icons = {
  brain: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  pulse: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  file: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  zap: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
};

const SPECIALTIES = [
  { name: 'Cardiology',        icon: icons.pulse,  desc: 'ECGs, ACS, Heart Failure' },
  { name: 'Neurology',         icon: icons.brain,  desc: 'Stroke, Seizures, Headache' },
  { name: 'Emergency Medicine',icon: icons.zap,    desc: 'Trauma, Sepsis, ACLS' },
  { name: 'General Medicine',  icon: icons.shield, desc: 'Common presentations' },
  { name: 'Respiratory',       icon: icons.pulse,  desc: 'COPD, Asthma, PE' },
  { name: 'Pediatrics',        icon: icons.shield, desc: 'Neonatal, Growth, Fever' },
  { name: 'Psychiatry',        icon: icons.brain,  desc: 'MDD, Anxiety, Psychosis' },
  { name: 'Gastroenterology',  icon: icons.file,   desc: 'GI Bleed, IBD, Liver' },
  { name: 'Endocrinology',     icon: icons.chart,  desc: 'Diabetes, Thyroid, DKA' },
  { name: 'Oncology',          icon: icons.shield, desc: 'Staging, Paraneoplastic' },
];

const FEATURES = [
  {
    icon: icons.brain,
    title: 'Smart AI Patients',
    desc: 'Interact with virtual patients responding dynamically in natural language. Every patient has a unique history, personality, and emotional presentation — just like a real clinical consultation.',
  },
  {
    icon: icons.shield,
    title: 'Safe Practice',
    desc: 'Learn and make mistakes in a completely risk-free environment. Grow your clinical confidence at your own pace with zero risk to real patient safety.',
  },
  {
    icon: icons.zap,
    title: 'Multi-Specialties',
    desc: 'Explore cases across all major medical specialties including Respiratory, Cardiology, Endocrinology, Neurology, Emergency Medicine, and Pediatrics.',
  },
  {
    icon: icons.chart,
    title: 'Progress Tracking',
    desc: 'Monitor diagnostic accuracy and clinical outcomes. Get rubric-based evaluations scored across history-taking, differentials, red flags, and communication.',
  },
];

const ECG_PATH = `M0,30 L60,30 L70,30 L80,5 L90,55 L100,30 L115,30 L120,30 L130,30 L140,30 L150,30 
  L210,30 L220,30 L230,5 L240,55 L250,30 L265,30 L270,30 L280,30 L290,30 L300,30 
  L360,30 L370,30 L380,5 L390,55 L400,30 L415,30 L420,30 L430,30 L440,30 L450,30
  L510,30 L520,30 L530,5 L540,55 L550,30 L565,30 L570,30 L580,30 L590,30 L600,30`;

const DEMO_MSGS = [
  { role: 'patient', text: "Hello doctor. I'm Marcus Webb. I've had crushing chest pain for the past 2 hours. It started suddenly at rest." },
  { role: 'doctor',  text: "Is the pain radiating anywhere — your jaw, left arm, or back?" },
  { role: 'patient', text: "Yes... my left arm and jaw. I'm also feeling quite short of breath and sweaty." },
  { role: 'doctor',  text: "Any previous cardiac history? Are you on any medications?" },
  { role: 'patient', text: "I had high blood pressure for 10 years. I take lisinopril, but I haven't taken it in a few days." },
  { role: 'doctor',  text: "How severe is the pain on a scale of 1 to 10?" },
  { role: 'patient', text: "Nine. Maybe a ten. It's the worst pain I've ever felt in my life." },
];

function AnimatedCount({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setVal(Math.round(eased * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Live demo chat animation
  const [visibleMsgs, setVisibleMsgs] = useState(1);
  const previewRef = useRef(null);
  useEffect(() => {
    if (visibleMsgs >= DEMO_MSGS.length) {
      const t = setTimeout(() => setVisibleMsgs(1), 5000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleMsgs(n => n + 1), 2200);
    return () => clearTimeout(t);
  }, [visibleMsgs]);
  // Auto-scroll chat preview
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [visibleMsgs]);

  // Fetch live stats from API health endpoint
  const [liveStats, setLiveStats] = useState(null);
  useEffect(() => {
    api('/health').then(d => setLiveStats(d)).catch(() => {});
  }, []);

  const handleStart = () => navigate(user ? '/simulator' : '/register');
  const handleDemo  = () => navigate('/simulator?demo=cardiology');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <EkgMouseTrail />

      <section className="landing-hero" id="hero">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}>
            {/* Left: Copy */}
            <div>
              <div className="hero-eyebrow">
                Clinical Training Platform
              </div>

              <h1 className="hero-title">
                <span>The simulator</span>
                <span>medical students</span>
                <span>
                  actually{' '}
                  <span style={{
                    background: 'var(--grad-brand)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    use.
                  </span>
                </span>
              </h1>

              <p className="hero-sub">
                Practice patient interviews, order investigations, and diagnose complex cases —
                with AI patients that respond like real people.
                Instant rubric-based feedback after every session.
              </p>

              <div className="hero-actions">
                <button onClick={handleStart} className="btn btn-primary btn-xl">
                  Start Practicing
                  <span style={{ display: 'flex', alignItems: 'center' }}>{icons.arrowRight}</span>
                </button>
                <button onClick={handleDemo} className="btn btn-outline btn-xl">
                  Try Demo — Cardiology
                </button>
              </div>

              {/* Inline trust signals — no emojis, just data */}
              <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
                {[
                  { val: '10+', label: 'Specialties' },
                  { val: '50+', label: 'Case scenarios' },
                  { val: 'AI', label: 'Powered feedback' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{val}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live simulation preview */}
            <div style={{ position: 'relative' }}>
              {/* Glow behind preview */}
              <div style={{
                position: 'absolute', inset: -24,
                background: 'radial-gradient(ellipse at center, rgba(138,124,255,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} aria-hidden="true" />

              <div className="hero-preview">
                {/* Window chrome */}
                <div className="preview-header">
                  <div className="preview-dots">
                    <div className="preview-dot" />
                    <div className="preview-dot" />
                    <div className="preview-dot" />
                  </div>
                  <div className="preview-label">CURA.AI — Simulation Lab</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>AI Connected</span>
                  </div>
                </div>

                {/* Patient info bar */}
                <div style={{
                  padding: '10px 16px',
                  background: 'var(--surface-2)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--purple-dim)',
                      border: '1px solid var(--border-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'var(--purple)',
                    }}>MW</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Marcus Webb, 58M</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cardiology · High urgency</div>
                    </div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 999,
                    background: 'var(--danger-dim)', border: '1px solid rgba(248,113,113,0.2)',
                    fontSize: 11, fontWeight: 700, color: 'var(--danger)', fontFamily: 'var(--mono)',
                  }}>CRITICAL</div>
                </div>

                {/* Chat messages */}
                <div ref={previewRef} className="preview-chat" style={{ overflow: 'hidden', minHeight: 260 }}>
                  {DEMO_MSGS.slice(0, visibleMsgs).map((msg, i) => {
                    const isDoc = msg.role === 'doctor';
                    return (
                      <div
                        key={i}
                        className={`preview-msg ${isDoc ? 'preview-msg-doctor' : ''}`}
                        style={{ animation: 'slideUp 200ms var(--ease)' }}
                      >
                        <div
                          className={`chat-avatar ${isDoc ? 'chat-avatar-doctor' : 'chat-avatar-patient'}`}
                          style={{ width: 28, height: 28 }}
                        >
                          {isDoc ? (
                            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M25.8947 23H34.4211V41H25.8947V23Z" fill="currentColor"></path>
                              <path d="M14.5263 23H21.1579V29.6316H14.5263V23Z" fill="currentColor"></path>
                              <path fillRule="evenodd" clipRule="evenodd" d="M26.2102 10.7896H37.3173L37.3161 10.7902L36.2105 11.343V12.579V39.0001H11.7895V12.579V11.343L10.6839 10.7902L10.6827 10.7896H13.053C13.1426 10.0821 13.3437 9.40935 13.6381 8.78955H8H6V10.6843L6.21053 10.7896L9.78947 12.579V37.0001V39.0001H8H7.78947H6V41.0001H8H9.78947H11.7895H36.2105H38.2105H40H42V39.0001H40.2105H40H38.2105V37.0001V12.579L41.7895 10.7896L42 10.6843V8.78955H40H25.625C25.9194 9.40935 26.1206 10.0821 26.2102 10.7896Z" fill="currentColor"></path>
                              <path fillRule="evenodd" clipRule="evenodd" d="M26.2632 11.6316C26.2632 15.2941 23.2941 18.2632 19.6316 18.2632C15.9691 18.2632 13 15.2941 13 11.6316C13 7.96906 15.9691 5 19.6316 5C23.2941 5 26.2632 7.96906 26.2632 11.6316ZM18.6527 8H20.9264V10.6526H23.5789V12.9263H20.9264V15.579H18.6527V12.9263H16L16 10.6526H18.6527V8Z" fill="currentColor"></path>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          )}
                        </div>
                        <div className={`preview-bubble ${isDoc ? 'preview-bubble-doctor' : 'preview-bubble-patient'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {visibleMsgs < DEMO_MSGS.length && (
                    <div className="preview-msg" style={{ alignSelf: 'flex-start' }}>
                      <div className="chat-avatar chat-avatar-patient" style={{ width: 28, height: 28 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="typing-indicator" style={{ padding: '8px 12px' }}>
                        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Vitals footer */}
                <div className="preview-vitals">
                  {[
                    { val: '118', lbl: 'HR bpm' },
                    { val: '88/60', lbl: 'BP mmHg' },
                    { val: '92%', lbl: 'SpO₂' },
                    { val: '38.4°', lbl: 'Temp' },
                  ].map(({ val, lbl }) => (
                    <div key={lbl} className="preview-vital">
                      <div className="preview-vital-val">{val}</div>
                      <div className="preview-vital-lbl">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ECG line at bottom */}
        <div className="ecg-container" aria-hidden="true">
          <svg className="ecg-line" viewBox="0 0 600 60" preserveAspectRatio="none" fill="none">
            <path d={ECG_PATH} stroke="var(--purple)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar-inner">
            {[
              { num: 50, suffix: '+', label: 'Clinical cases' },
              { num: 10, suffix: '+', label: 'Medical specialties' },
              { num: 3,  suffix: '',  label: 'AI providers supported' },
              { num: liveStats?.totalSessions || 200, suffix: '+', label: 'Sessions completed' },
            ].map(({ num, suffix, label }) => (
              <div key={label} className="stat-item">
                <div className="stat-item-num">
                  <AnimatedCount to={num} /><span>{suffix}</span>
                </div>
                <div className="stat-item-lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label">Case Library</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Train across every specialty
            </h2>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', maxWidth: 360 }}>
              AI generates unique cases on demand for any specialty you choose.
              No case is repeated.
            </p>
          </div>

          <div className="specialties-scroll-container">
            {/* Desktop View: Single row containing all 10 specialties */}
            <div className="specialties-desktop-only">
              <div className="specialties-scroll-track" role="list">
                <div className="specialties-scroll-group">
                  {SPECIALTIES.map(({ name, icon, desc }) => (
                    <button
                      key={name}
                      role="listitem"
                      className="specialty-chip"
                      onClick={() => navigate(`/simulator?demo=${encodeURIComponent(name.toLowerCase())}`)}
                      title={`Try a ${name} case`}
                    >
                      <div className="specialty-chip-icon">{icon}</div>
                      <div>
                        <div className="specialty-chip-name">{name}</div>
                        <div className="specialty-chip-count">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="specialties-scroll-group" aria-hidden="true">
                  {SPECIALTIES.map(({ name, icon, desc }) => (
                    <button
                      key={`${name}-dup`}
                      tabIndex="-1"
                      className="specialty-chip"
                      onClick={() => navigate(`/simulator?demo=${encodeURIComponent(name.toLowerCase())}`)}
                      title={`Try a ${name} case`}
                    >
                      <div className="specialty-chip-icon">{icon}</div>
                      <div>
                        <div className="specialty-chip-name">{name}</div>
                        <div className="specialty-chip-count">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile View: Two rows scrolling in opposite directions */}
            <div className="specialties-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', overflow: 'hidden' }}>
              {/* Row 1: First 5 specialties */}
              <div className="specialties-scroll-track" role="list">
                <div className="specialties-scroll-group">
                  {SPECIALTIES.slice(0, 5).map(({ name, icon, desc }) => (
                    <button
                      key={name}
                      role="listitem"
                      className="specialty-chip"
                      onClick={() => navigate(`/simulator?demo=${encodeURIComponent(name.toLowerCase())}`)}
                      title={`Try a ${name} case`}
                    >
                      <div className="specialty-chip-icon">{icon}</div>
                      <div>
                        <div className="specialty-chip-name">{name}</div>
                        <div className="specialty-chip-count">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="specialties-scroll-group" aria-hidden="true">
                  {SPECIALTIES.slice(0, 5).map(({ name, icon, desc }) => (
                    <button
                      key={`${name}-dup`}
                      tabIndex="-1"
                      className="specialty-chip"
                      onClick={() => navigate(`/simulator?demo=${encodeURIComponent(name.toLowerCase())}`)}
                      title={`Try a ${name} case`}
                    >
                      <div className="specialty-chip-icon">{icon}</div>
                      <div>
                        <div className="specialty-chip-name">{name}</div>
                        <div className="specialty-chip-count">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Remaining 5 specialties (scrolls in reverse) */}
              <div className="specialties-scroll-track-2" role="list" style={{ marginTop: 4 }}>
                <div className="specialties-scroll-group">
                  {SPECIALTIES.slice(5).map(({ name, icon, desc }) => (
                    <button
                      key={name}
                      role="listitem"
                      className="specialty-chip"
                      onClick={() => navigate(`/simulator?demo=${encodeURIComponent(name.toLowerCase())}`)}
                      title={`Try a ${name} case`}
                    >
                      <div className="specialty-chip-icon">{icon}</div>
                      <div>
                        <div className="specialty-chip-name">{name}</div>
                        <div className="specialty-chip-count">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="specialties-scroll-group" aria-hidden="true">
                  {SPECIALTIES.slice(5).map(({ name, icon, desc }) => (
                    <button
                      key={`${name}-dup`}
                      tabIndex="-1"
                      className="specialty-chip"
                      onClick={() => navigate(`/simulator?demo=${encodeURIComponent(name.toLowerCase())}`)}
                      title={`Try a ${name} case`}
                    >
                      <div className="specialty-chip-icon">{icon}</div>
                      <div>
                        <div className="specialty-chip-name">{name}</div>
                        <div className="specialty-chip-count">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div style={{ maxWidth: 600, marginBottom: 0 }}>
            <div className="section-label">Why CURA.AI</div>
            <h2 className="section-title">Built for how doctors actually learn</h2>
            <p className="section-sub">
              Not another video lecture or MCQ bank.
              CURA.AI puts you in the room with a patient and makes you think.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map(({ icon, title, desc }, idx) => {
              const isSpan2 = idx === 0 || idx === 3;
              return (
                <div key={title} className={`feature-card ${isSpan2 ? 'feature-card-span-2' : ''}`}>
                  <div className="feature-icon">{icon}</div>
                  <div className="feature-content-wrapper">
                    <h3 className="feature-title">{title}</h3>
                    <p className="feature-desc">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hiw-section" id="how-it-works">
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
          <div style={{
            position: 'absolute', width: 500, height: 500,
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(138,124,255,0.07) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">Simple Process</div>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              How it{' '}
              <span style={{
                background: 'var(--grad-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>works?</span>
            </h2>
            <p className="section-sub" style={{ maxWidth: 480, margin: '0 auto' }}>
              Three steps between you and your next clinical breakthrough.
            </p>
          </div>

          <div className="hiw-grid">
            {/* Card 1 */}
            <div className="hiw-card">
              <div className="hiw-num-badge" style={{ color: 'var(--purple)' }}>1</div>
              <div className="hiw-icon-circle" style={{ color: 'var(--purple)', background: 'var(--purple-dim)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="hiw-card-label" style={{ color: 'var(--purple)' }}>Step 1</div>
              <h3 className="hiw-card-title">Choose a Patient</h3>
              <p className="hiw-card-desc">Pick from 50+ clinical scenarios across every major specialty, or let CURA.AI generate a randomised case. Each patient has a unique history, personality, and presentation.</p>
              <div className="hiw-card-accent" style={{ background: 'linear-gradient(90deg, var(--purple), transparent)' }} />
            </div>

            {/* Connector 1 */}
            <div className="hiw-connector" aria-hidden="true">
              <svg width="48" height="16" viewBox="0 0 48 16" fill="none">
                <path d="M0,8 L40,8" stroke="var(--purple)" strokeWidth="2.5" strokeDasharray="5 3" />
                <path d="M34,3 L42,8 L34,13" stroke="var(--purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Card 2 */}
            <div className="hiw-card">
              <div className="hiw-num-badge" style={{ color: '#A78BFF' }}>2</div>
              <div className="hiw-icon-circle" style={{ color: '#A78BFF', background: 'rgba(167,139,255,0.10)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="hiw-card-label" style={{ color: '#A78BFF' }}>Step 2</div>
              <h3 className="hiw-card-title">Take History & Ask Questions</h3>
              <p className="hiw-card-desc">Conduct a full patient interview in natural language. The AI responds with realistic symptoms, emotional cues, and guarded disclosures — just like a real consultation.</p>
              <div className="hiw-card-accent" style={{ background: 'linear-gradient(90deg, #A78BFF, transparent)' }} />
            </div>

            {/* Connector 2 */}
            <div className="hiw-connector" aria-hidden="true">
              <svg width="48" height="16" viewBox="0 0 48 16" fill="none">
                <path d="M0,8 L40,8" stroke="var(--purple)" strokeWidth="2.5" strokeDasharray="5 3" />
                <path d="M34,3 L42,8 L34,13" stroke="var(--purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Card 3 */}
            <div className="hiw-card">
              <div className="hiw-num-badge" style={{ color: '#6EE7B7' }}>3</div>
              <div className="hiw-icon-circle" style={{ color: '#6EE7B7', background: 'rgba(110,231,183,0.10)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="hiw-card-label" style={{ color: '#6EE7B7' }}>Step 3</div>
              <h3 className="hiw-card-title">Diagnose & Get Feedback</h3>
              <p className="hiw-card-desc">Submit your provisional diagnosis and clinical reasoning. Receive instant rubric-based evaluation scored across history-taking, differentials, red flags, and communication.</p>
              <div className="hiw-card-accent" style={{ background: 'linear-gradient(90deg, #6EE7B7, transparent)' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
          <div style={{
            position: 'absolute', top: '30%', left: '10%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(138,124,255,0.06) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', top: '20%', right: '5%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(166,154,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">Testimonials</div>
            <h2 className="section-title" style={{ marginBottom: 12 }}>Our Users Reviews</h2>
            <p className="section-sub" style={{ maxWidth: 420, margin: '0 auto' }}>
              From medical students to residents — here's what they say.
            </p>
          </div>

          <div className="reviews-grid">
            {[
              {
                quote: 'It feels like a real OSCE! This helped me a lot in my study and in exam cases. The AI patient responses are incredibly realistic.',
                name: 'Amina K.',
                role: 'Medical Student',
                school: 'Harvard Medical School',
                initial: 'A',
                color: 'var(--purple)',
                bg: 'var(--purple-dim)',
                stars: 5,
                specialty: 'Cardiology'
              },
              {
                quote: 'Saves a lot of practicing time! I can safely practice and make mistakes to learn. The feedback covers exactly what I miss in real consults.',
                name: 'Dr. Daniel R.',
                role: 'Intern Doctor',
                school: 'Oxford University',
                initial: 'D',
                color: '#A78BFF',
                bg: 'rgba(167,139,255,0.12)',
                stars: 5,
                specialty: 'Emergency Medicine'
              },
              {
                quote: 'Easiest way to get more experience. I can learn about all diseases in one place. The emergency timed mode is genuinely stressful — in the best way.',
                name: 'Fatima N.',
                role: 'Resident Doctor',
                school: 'Ain Shams University',
                initial: 'F',
                color: '#6EE7B7',
                bg: 'rgba(110,231,183,0.10)',
                stars: 5,
                specialty: 'Internal Medicine'
              },
            ].map(({ quote, name, role, school, initial, color, bg, stars, specialty }) => (
              <div key={name} className="review-card">
                {/* Floating quote mark */}
                <div className="review-quote-mark" style={{ color }}>&ldquo;</div>

                {/* Stars */}
                <div className="review-stars">
                  {Array.from({ length: stars }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" style={{ flexShrink: 0 }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Quote text */}
                <blockquote className="review-text">{quote}</blockquote>

                {/* Specialty chip */}
                <div className="review-specialty-chip" style={{ color, background: bg }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  {specialty}
                </div>

                {/* Author row */}
                <div className="review-author">
                  <div className="review-avatar" style={{ color, background: bg }}>
                    {initial}
                  </div>
                  <div>
                    <div className="review-name">{name}</div>
                    <div className="review-role">{role} · {school}</div>
                  </div>
                </div>

                {/* Bottom gradient accent */}
                <div className="review-card-glow" style={{ background: `radial-gradient(ellipse at 50% 100%, ${color.replace('var(--purple)', 'rgba(138,124,255,0.12)').replace('#A78BFF','rgba(167,139,255,0.10)').replace('#6EE7B7','rgba(110,231,183,0.08)')} 0%, transparent 70%)` }} />
              </div>
            ))}
          </div>

          {/* Bottom trust line */}
          <div style={{ textAlign: 'center', marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: -8 }}>
              {['A','D','F','M','R'].map((l, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i % 2 === 0 ? 'var(--purple-dim)' : 'rgba(167,139,255,0.15)',
                  border: '2px solid var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'var(--purple)',
                  fontFamily: 'var(--font)',
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: 5 - i,
                  position: 'relative',
                }}>{l}</div>
              ))}
            </div>
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Trusted by <strong style={{ color: 'var(--text)' }}>2,400+</strong> medical learners worldwide
            </span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="hero-eyebrow"
            style={{ justifyContent: 'center', display: 'inline-flex', margin: '0 auto 24px' }}
          >
            Ready to practice?
          </div>
          <h2 className="cta-title">
            Your next patient<br />
            <span style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              is waiting.
            </span>
          </h2>
          <p className="cta-sub">
            No credit card. No sign-up required for the demo.
            Full access with a free account.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleStart} className="btn btn-primary btn-xl">
              {user ? 'Open Simulation Lab' : 'Create Free Account'}
              <span style={{ display: 'flex', alignItems: 'center' }}>{icons.arrowRight}</span>
            </button>
            <button onClick={handleDemo} className="btn btn-outline btn-xl">
              Try Demo — No Sign-up
            </button>
          </div>
        </div>
      </section>

      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Logo size={28} />
              <p className="footer-brand-desc">
                The clinical training platform for medical students and early-career doctors.
                Practice diagnosis with realistic AI patients across every major specialty.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-links">
                <Link to="/features" className="footer-link">Features</Link>
                <Link to="/pricing" className="footer-link">Pricing</Link>
                <Link to="/simulator" className="footer-link">Simulation Lab</Link>
                <Link to="/register" className="footer-link">Get Started</Link>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Specialties</div>
              <div className="footer-links">
                {SPECIALTIES.slice(0, 4).map(s => (
                  <button
                    key={s.name}
                    className="footer-link"
                    style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}
                    onClick={() => navigate(`/simulator?demo=${encodeURIComponent(s.name.toLowerCase())}`)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <div className="footer-links">
                <Link to="/about" className="footer-link">About</Link>
                <Link to="/pricing" className="footer-link">Pricing</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} CURA.AI — Synapse Team</span>
            <span style={{ fontFamily: 'var(--mono)' }}>
              {liveStats ? (
                <span style={{ color: 'var(--success)' }}>● System Online</span>
              ) : (
                <span style={{ color: 'var(--text-faint)' }}>— Checking status...</span>
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
