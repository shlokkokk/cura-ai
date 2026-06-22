import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Emergency Medicine', 'Respiratory', 'Endocrinology',
  'Psychiatry', 'Pediatrics', 'Gastroenterology', 'Oncology', 'General Medicine',
];

const DEEP_FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
    title: 'Hyper-Realistic AI Patients',
    sub: 'Powered by Google Gemini',
    desc: 'Our virtual patients have unique personalities, medical histories, and emotional states. They guard sensitive information until asked the right way — just like real people. They express fear, confusion, and relief — because clinical communication is more than a checklist.',
    bullets: [
      'Dynamic emotional and contextual responses',
      'Medically accurate multi-system presentations',
      'Unique history, personality, and urgency per case',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    title: 'Evidence-Based Rubric Evaluation',
    sub: 'Immediate AI-powered feedback',
    desc: 'Stop guessing how you performed. After every session, our AI evaluates your interview against standard clinical rubrics — checking whether you asked critical differential questions, identified red flag symptoms, and reasoned correctly.',
    bullets: [
      'Diagnostic accuracy scoring (0–100)',
      'Missed red flag identification',
      'Communication and empathy grading',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Emergency Mode',
    sub: 'Time-pressured clinical scenarios',
    desc: 'Real on-call decisions happen under extreme time pressure. Emergency mode activates a countdown timer, forcing you to prioritize, triage, and act — exactly as you would at 3am on a busy ward.',
    bullets: [
      'Configurable countdown timer (10 minutes)',
      'Automatic assessment at time-out',
      'High-urgency patient presentations',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: 'Integrated Clinical Reports',
    sub: 'ECGs, labs, and imaging in context',
    desc: 'Access ECG tracings, lab panels, and imaging results within the simulator. Cardiology cases include real-style 12-lead ECG interpretations — viewable in a fullscreen lightbox. Learn to interpret reports in clinical context, not isolation.',
    bullets: [
      'ECG tracing lightbox with zoom',
      'Lab values and vital sign parsing',
      'Downloadable session PDF report',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    title: 'Performance Analytics Dashboard',
    sub: 'Track improvement over time',
    desc: 'Your personal analytics hub shows performance trends, specialty breakdowns, skill radar charts, and session history. Identify exactly which clinical areas need the most work — with data, not guesswork.',
    bullets: [
      'Score trajectory line chart',
      'Clinical skills radar (5 domains)',
      'Specialty distribution insights',
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Zero-Risk Environment',
    sub: 'Safe to fail, designed to learn',
    desc: 'Make clinical mistakes, miss diagnoses, overlook red flags — and learn from every one of them. No real patients are harmed. No grades are affected. Just pure deliberate practice with full safety.',
    bullets: [
      'No consequences for wrong answers',
      'Immediate corrective feedback per error',
      'Retry any case instantly for comparison',
    ],
  },
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 'calc(64px + 80px)', paddingBottom: 80,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,201,177,0.06) 0%, transparent 70%)',
        }} />
        <div className="container" style={{ maxWidth: 760, position: 'relative' }}>
          <div className="section-label">Advanced Capabilities</div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            margin: '16px 0 24px', color: 'var(--text)',
          }}>
            Next-generation{' '}
            <span style={{
              background: 'var(--grad-brand)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              clinical simulation
            </span>
          </h1>
          <p style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 32px' }}>
            CURA.AI bridges the gap between textbook theory and real-world clinical application
            with immersive, AI-powered patient simulations built for medical students and early-career doctors.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg">Get Started Free</button>
            <button onClick={() => navigate('/simulator?demo=cardiology')} className="btn btn-outline btn-lg">Try Cardiology Demo</button>
          </div>
        </div>
      </section>

      {/* ── Specialties stripe ────────────────────────────────────── */}
      <section style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--sp-5) 0',
        overflow: 'hidden',
      }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 'var(--sp-3)', overflow: 'hidden', flexWrap: 'wrap', justifyContent: 'center' }}>
            {SPECIALTIES.map(s => (
              <div key={s} className="badge badge-teal" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/simulator?demo=${encodeURIComponent(s.toLowerCase())}`)}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature detail sections — alternating ─────────────────── */}
      {DEEP_FEATURES.map(({ icon, title, sub, desc, bullets }, i) => {
        const isEven = i % 2 === 0;
        return (
          <section
            key={title}
            style={{
              padding: 'var(--sp-20) 0',
              borderBottom: '1px solid var(--border)',
              background: isEven ? 'var(--bg)' : 'var(--surface)',
            }}
          >
            <div className="container" style={{ maxWidth: 1100 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 64,
                alignItems: 'center',
              }}>
                {/* Text block */}
                <div style={{ order: isEven ? 1 : 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div className="feature-icon" style={{ marginBottom: 0, width: 52, height: 52, borderRadius: 'var(--r-md)' }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 'var(--fs-xs)', color: 'var(--teal)', fontWeight: 700 }}>
                        {sub}
                      </div>
                    </div>
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.2 }}>
                    {title}
                  </h2>
                  <p style={{ color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 24, fontSize: 'var(--fs-base)' }}>
                    {desc}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bullets.map(b => (
                      <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {b}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual card */}
                <div style={{
                  order: isEven ? 2 : 1,
                  background: 'var(--surface)',
                  border: '1px solid var(--border-md)',
                  borderRadius: 'var(--r-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                }}>
                  {/* Header bar */}
                  <div style={{
                    background: 'var(--surface-2)',
                    padding: 'var(--sp-3) var(--sp-4)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['#EF4444','#F59E0B','#22C55E'].map(c => (
                        <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)', marginLeft: 4 }}>
                      CURA.AI — {title}
                    </div>
                  </div>

                  {/* Feature visual */}
                  <div style={{ padding: 'var(--sp-6)' }}>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                      Feature Preview
                    </div>
                    {bullets.map((b, bi) => (
                      <div key={b} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: 'var(--sp-3) var(--sp-4)',
                        borderRadius: 'var(--r-md)',
                        background: bi === 0 ? 'var(--teal-dim)' : 'var(--surface-2)',
                        border: '1px solid ' + (bi === 0 ? 'rgba(0,201,177,0.15)' : 'var(--border)'),
                        marginBottom: 8,
                        transition: 'all var(--t)',
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: bi === 0 ? 'var(--teal)' : 'var(--border-str)',
                        }} />
                        <div style={{ fontSize: 'var(--fs-sm)', color: bi === 0 ? 'var(--teal)' : 'var(--text-2)', fontWeight: bi === 0 ? 600 : 400 }}>
                          {b}
                        </div>
                        {bi === 0 && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" style={{ marginLeft: 'auto' }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="cta-title">
            Start training today.<br />
            <span style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Zero risk. Real results.
            </span>
          </h2>
          <p className="cta-sub">Free account. Unlimited cases. Instant feedback after every session.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-xl">Create Free Account</button>
            <button onClick={() => navigate('/about')} className="btn btn-outline btn-xl">About the Team</button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <span>© {new Date().getFullYear()} CURA.AI — Synapse Team</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/simulator" className="footer-link">Simulator</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
