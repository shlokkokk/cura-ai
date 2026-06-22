import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PLANS = [
  {
    name: 'Student',
    price: '$0',
    period: 'Free forever',
    desc: 'Perfect for medical students getting started with clinical reasoning practice.',
    features: [
      '5 Case Studies per month',
      'Basic AI feedback after each session',
      'Standard progress tracking',
      'Community support',
    ],
    cta: 'Get Started Free',
    action: '/register',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    desc: 'For residents and junior doctors requiring rigorous, unlimited preparation.',
    features: [
      'Unlimited case studies',
      'Advanced rubric evaluation',
      'Differential diagnosis breakdown',
      'Emergency mode scenarios',
      'Full session PDF reports',
      'Priority 24/7 support',
    ],
    cta: 'Start 14-Day Free Trial',
    action: '/register',
    highlight: true,
    badge: 'Most Popular',
  },
];

const FAQS = [
  {
    q: 'Can I use CURA.AI on my phone?',
    a: 'Yes. The web application is fully responsive. You can practice clinical scenarios on any modern mobile device or tablet.',
  },
  {
    q: 'Who creates the clinical cases?',
    a: 'All scenarios are designed and validated by medical educators to ensure accuracy and strict adherence to clinical guidelines.',
  },
  {
    q: 'Can medical schools purchase bulk licenses?',
    a: 'Absolutely. We offer Enterprise plans for universities and residency programs with administrative dashboards to monitor student progress. Contact us for custom pricing.',
  },
  {
    q: 'Is there a free trial for the Professional plan?',
    a: 'Yes — 14 days full access, no credit card required. Downgrade to free any time.',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 'calc(64px + 80px)', paddingBottom: 80,
        textAlign: 'center',
        position: 'relative',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,201,177,0.05) 0%, transparent 70%)',
        }} />
        <div className="container" style={{ maxWidth: 720, position: 'relative' }}>
          <div className="section-label">Transparent Pricing</div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            margin: '16px 0 20px',
          }}>
            Invest in your<br />
            <span style={{
              background: 'var(--grad-brand)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              clinical excellence
            </span>
          </h1>
          <p style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Whether you're a medical student prepping for OSCEs or a residency program scaling clinical training —
            we have a plan for you.
          </p>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'var(--sp-20) 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24,
            alignItems: 'start',
          }}>
            {PLANS.map(({ name, price, period, desc, features, cta, action, highlight, badge }) => (
              <div
                key={name}
                style={{
                  background: 'var(--surface)',
                  border: highlight ? '2px solid var(--teal)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)',
                  padding: 'var(--sp-8)',
                  position: 'relative',
                  boxShadow: highlight ? 'var(--shadow-teal)' : 'none',
                }}
              >
                {badge && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--teal)', color: '#050810',
                    padding: '5px 16px', borderRadius: 'var(--r-full)',
                    fontSize: 'var(--fs-xs)', fontWeight: 800, letterSpacing: '0.06em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {badge}
                  </div>
                )}

                <div style={{ marginBottom: 'var(--sp-5)' }}>
                  <h3 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 8 }}>{name}</h3>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', minHeight: 40 }}>{desc}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 'var(--sp-6)' }}>
                  <span style={{
                    fontSize: 'var(--fs-5xl)', fontWeight: 900, letterSpacing: '-0.04em',
                    fontFamily: 'var(--mono)', color: highlight ? 'var(--teal)' : 'var(--text)',
                  }}>
                    {price}
                  </span>
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{period}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--sp-8)' }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-sm)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={highlight ? 'var(--teal)' : 'var(--success)'} strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                      </svg>
                      <span style={{ color: 'var(--text-2)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(action)}
                  className={`btn ${highlight ? 'btn-primary' : 'btn-outline'} btn-lg`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {cta}
                </button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            No credit card required to start. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section style={{ padding: 'var(--sp-20) 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Got questions?</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Frequently Asked
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map(({ q, a }, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid ' + (openFaq === i ? 'var(--border-acc)' : 'var(--border)'),
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  transition: 'border-color var(--t)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'var(--sp-5) var(--sp-5)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)',
                    gap: 12,
                  }}
                >
                  {q}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                    style={{ flexShrink: 0, transition: 'transform var(--t)', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 var(--sp-5) var(--sp-5)',
                    fontSize: 'var(--fs-sm)', color: 'var(--text-2)',
                    lineHeight: 1.7,
                    borderTop: '1px solid var(--border)',
                    paddingTop: 'var(--sp-4)',
                  }}>
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="cta-title">
            Ready to level up<br />
            <span style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              your clinical skills?
            </span>
          </h2>
          <p className="cta-sub">Start for free today. No credit card required.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-xl">Create Free Account</button>
            <button onClick={() => navigate('/features')} className="btn btn-outline btn-xl">See All Features</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <span>© {new Date().getFullYear()} CURA.AI — Synapse Team</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/features" className="footer-link">Features</Link>
              <Link to="/simulator" className="footer-link">Simulator</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
