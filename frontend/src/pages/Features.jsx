import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';
import Navbar from '../components/Navbar';
import EkgMouseTrail from '../components/EkgMouseTrail';
import { usePageTransition } from '../utils/usePageTransition';

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
    detailedBullets: [
      {
        title: 'Dynamic emotional responses',
        desc: 'Patients express real-time emotion like anxiety, fear, or frustration. They might hold back critical history until you show empathy and build trust.'
      },
      {
        title: 'Multi-system presentations',
        desc: 'Symptoms are not isolated. AI patients present complex multi-system complaints, requiring comprehensive and logical clinical evaluation.'
      },
      {
        title: 'Calibrated urgency & profiles',
        desc: 'Cases range from standard outpatient reviews to high-urgency emergency triages. No two consultation sessions are the same.'
      }
    ]
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
    detailedBullets: [
      {
        title: 'Diagnostic accuracy scoring',
        desc: 'Receive a structured performance score from 0 to 100 based on standard medical guidelines and a robust differentials checklist.'
      },
      {
        title: 'Red flag tracking',
        desc: 'The AI checks if you missed critical warning signs (like chest pain radiating to the jaw) and details why they are vital to follow.'
      },
      {
        title: 'Empathy & communication',
        desc: 'Evaluate how well you structured questions, handled patient anxiety, and explained instructions in plain, clear language.'
      }
    ]
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
    detailedBullets: [
      {
        title: 'Configurable countdown timer',
        desc: 'Simulate high-pressure situations with a custom timer. Every second counts when managing unstable emergency cases.'
      },
      {
        title: 'Automatic triage assessment',
        desc: 'If the timer runs out, the case automatically submits for assessment, scoring your performance up to that exact moment.'
      },
      {
        title: 'ACLS and critical triaging',
        desc: 'Experience trauma, stroke, and sepsis scenarios that demand rapid decision making and instant treatment directives.'
      }
    ]
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
    detailedBullets: [
      {
        title: 'ECG lightbox with zoom',
        desc: 'Examine high-quality 12-lead ECG strips in a fullscreen lightbox with panning, zooming, and clinical grid marks.'
      },
      {
        title: 'Lab values & vitals integration',
        desc: 'Request and analyze complete blood counts, metabolic panels, and live vital signs directly in the simulator panel.'
      },
      {
        title: 'Downloadable PDF reports',
        desc: 'Export your consultation transcripts, rubric evaluations, and detailed diagnostic logs as a clean clinical PDF report.'
      }
    ]
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
    detailedBullets: [
      {
        title: 'Score trajectory tracking',
        desc: 'Monitor your diagnostic scoring trends over time with clean visual charts showing your path to clinical mastery.'
      },
      {
        title: '5-Domain clinical radar',
        desc: 'View a breakdown of your strengths across diagnostic reasoning, communication, history taking, safety, and management.'
      },
      {
        title: 'Specialty insights',
        desc: 'Analyze your case distribution to ensure you are well-rounded across cardiology, neurology, pediatrics, and more.'
      }
    ]
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Zero-Risk Environment',
    sub: 'Safe to fail, designed to learn',
    desc: 'Make clinical mistakes, miss diagnoses, overlook red flags — and learn from every one of them. No real patients are harmed. No grades are affected. Just deliberate practice with full safety.',
    bullets: [
      'No consequences for wrong answers',
      'Immediate corrective feedback per error',
      'Retry any case instantly for comparison',
    ],
    detailedBullets: [
      {
        title: 'Practice with zero risk',
        desc: 'Experience the safety of a simulation environment where wrong diagnoses or missed flags are turned into learning opportunities.'
      },
      {
        title: 'Immediate corrective feedback',
        desc: 'Receive point-by-point feedback immediately following case submission, detailing exactly what you got wrong and why.'
      },
      {
        title: 'Instant repeat and comparison',
        desc: 'Restart any case to test if you can apply feedback successfully, allowing you to compare your scores side-by-side.'
      }
    ]
  },
];

function FeatureSection({ feature, index }) {
  const { icon, title, sub, desc, bullets, detailedBullets } = feature;
  const isEven = index % 2 === 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);

  // GSAP entrance, pinning, scroll sync, and hover animations for this section
  useGSAP(() => {
    const mm = gsap.matchMedia();

    // 1. Desktop-only pinning
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const pinContainer = sectionRef.current?.querySelector('.deep-feature-visual-pin-container');
      const card = sectionRef.current?.querySelector('.deep-feature-visual');
      if (pinContainer && card) {
        ScrollTrigger.create({
          trigger: sectionRef.current.querySelector('.deep-feature-visual-sticky'),
          pin: pinContainer,
          start: 'top 96px',
          end: () => `bottom top+=${96 + card.offsetHeight}px`,
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
        });
      }
    });

    // 2. Entrance, scroll-sync, and mouse animations (all screens)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const card = sectionRef.current?.querySelector('.deep-feature-visual');

      // Entrance timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl
        .from(sectionRef.current.querySelector('.deep-feature-text-col'), {
          x: isEven ? -60 : 60,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
        })
        .from(sectionRef.current.querySelector('.deep-feature-visual-sticky'), {
          x: isEven ? 60 : -60,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
        }, '<0.15')
        .from(sectionRef.current.querySelectorAll('.feature-detail-item-trigger'), {
          y: 30,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.5');

      // Scroll sync for active bullet trigger
      const items = sectionRef.current.querySelectorAll('.feature-detail-item-trigger');
      items.forEach((item, idx) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => setActiveIndex(idx),
          onEnterBack: () => setActiveIndex(idx),
        });
      });

      // 4. 3D tilt and GSAP hover effect on .deep-feature-visual
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
          
          rotX(-cy * 8); // subtle tilt
          rotY(cx * 8);
          // GSAP-only hover lift-up to avoid conflicts with CSS transitions
          gsap.to(card, { y: -8, z: 12, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        };
        
        const handleMouseLeave = () => {
          rotX(0);
          rotY(0);
          gsap.to(card, { y: 0, z: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        };
        
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          card.removeEventListener('mousemove', handleMouseMove);
          card.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="deep-feature-section"
      style={{
        background: isEven ? 'var(--bg)' : 'var(--surface)',
      }}
    >
      <div className="container" style={{ maxWidth: 1100 }}>
        <div className="deep-feature-content">
          {/* Text block */}
          <div 
            className="deep-feature-text-col"
            style={{ 
              order: isEven ? 1 : 2,
              paddingBottom: '40px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div className="feature-icon" style={{ marginBottom: 0, width: 52, height: 52, borderRadius: 'var(--r-md)' }}>
                {icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 'var(--fs-xs)', color: 'var(--purple)', fontWeight: 700 }}>
                  {sub}
                </div>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.2 }}>
              {title}
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 40, fontSize: 'var(--fs-base)' }}>
              {desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 60, paddingBottom: 40 }}>
              {detailedBullets.map((item, idx) => (
                <div
                  key={idx}
                  className="feature-detail-item-trigger"
                  style={{
                    opacity: activeIndex === idx ? 1 : 0.35,
                    transform: activeIndex === idx ? 'translateX(10px)' : 'none',
                    transition: 'all 0.5s var(--ease)',
                    borderLeft: `4px solid ${activeIndex === idx ? 'var(--purple)' : 'var(--border)'}`,
                    paddingLeft: 20,
                  }}
                >
                  <h4 style={{ fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Visual card */}
          <div
            className="deep-feature-visual-sticky"
            style={{
              order: isEven ? 2 : 1,
            }}
          >
            <div className="deep-feature-visual-pin-container" style={{ width: '100%' }}>
              <div className="deep-feature-visual">
              <div className="deep-feature-visual-header">
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#EF4444','#F59E0B','#22C55E'].map(c => (
                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)', marginLeft: 4 }}>
                  CURA.AI — {title}
                </div>
              </div>

              <div className="deep-feature-visual-body">
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Live Preview
                </div>
                {bullets.map((b, bi) => (
                  <div key={b} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 'var(--sp-3) var(--sp-4)',
                    borderRadius: 'var(--r-md)',
                    background: activeIndex === bi ? 'var(--purple-dim)' : 'var(--surface-2)',
                    border: '1px solid ' + (activeIndex === bi ? 'var(--border-md)' : 'var(--border)'),
                    marginBottom: 8,
                    transform: activeIndex === bi ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activeIndex === bi ? '0 4px 12px rgba(138,124,255,0.06)' : 'none',
                    transition: 'all 0.3s var(--ease)',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: activeIndex === bi ? 'var(--purple)' : 'var(--border-str)',
                      boxShadow: activeIndex === bi ? '0 0 8px var(--purple)' : 'none',
                      transition: 'all 0.3s var(--ease)',
                    }} />
                    <div style={{ fontSize: 'var(--fs-sm)', color: activeIndex === bi ? 'var(--purple)' : 'var(--text-2)', fontWeight: activeIndex === bi ? 600 : 400 }}>
                      {b}
                    </div>
                    {activeIndex === bi && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2.5" style={{ marginLeft: 'auto', animation: 'scaleIn 0.2s var(--ease)' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export default function Features() {
  const navigate = useNavigate();
  const pageRef = usePageTransition();
  const heroRef = useRef(null);

  // Hero + badges entrance
  useGSAP(() => {
    if (!heroRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Scoped DOM elements query for SplitText
      const splitTargets = heroRef.current.querySelectorAll('.features-hero-title-line');
      const split = new SplitText(splitTargets, {
        type: 'words',
        wordsClass: 'split-word',
      });

      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'brandEase', duration: 0.65 } });
      tl
        .set('.features-hero-label', { autoAlpha: 1 })
        .to('.features-hero-label', {
          duration: 0.8,
          scrambleText: {
            text: 'Advanced Capabilities',
            chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            revealDelay: 0.2,
            speed: 0.5,
          },
          ease: 'none',
        })
        .from(split.words, {
          yPercent: 115,
          duration: 0.88,
          stagger: { each: 0.06 },
          ease: 'power4.out',
        }, '-=0.4')
        .from('.features-hero-sub', { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.3')
        .from('.features-hero-btns > *', {
          y: 20, autoAlpha: 0, scale: 0.94, stagger: 0.1, duration: 0.5, ease: 'snapEase',
        }, '-=0.3')
        .from('.specialty-badge', {
          scale: 0.7,
          autoAlpha: 0,
          stagger: { each: 0.05, from: 'random' },
          duration: 0.4,
          ease: 'snapEase',
        }, '-=0.2');
    });
    return () => mm.revert();
  }, { scope: heroRef });

  return (
    <div ref={pageRef} style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <div ref={heroRef}>
        <section style={{
          paddingTop: 'calc(64px + 80px)', paddingBottom: 80,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(138,124,255,0.08) 0%, transparent 70%)',
          }} />
          <div className="container" style={{ maxWidth: 760, position: 'relative' }}>
            <div className="features-hero-label section-label" style={{ opacity: 0 }}>Advanced Capabilities</div>
            <h1 className="features-hero-title" style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 1.1,
              margin: '16px 0 24px', color: 'var(--text)',
            }}>
              <span className="features-hero-title-line" style={{ display: 'block' }}>Next-generation</span>
              <span className="features-hero-title-line" style={{ display: 'block' }}>
                clinical{' '}
                <span className="text-gradient">
                  simulation
                </span>
              </span>
            </h1>
            <p className="features-hero-sub" style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 32px' }}>
              CURA.AI bridges the gap between textbook theory and real-world clinical application
              with immersive, AI-powered patient simulations built for medical students and early-career doctors.
            </p>
            <div className="features-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg">Get Started Free</button>
              <button onClick={() => navigate('/simulator?demo=cardiology')} className="btn btn-outline btn-lg">Try Cardiology Demo</button>
            </div>
          </div>
        </section>

        <section style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: 'var(--sp-5) 0',
          overflow: 'hidden',
        }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 'var(--sp-3)', overflow: 'hidden', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SPECIALTIES.map(s => (
                <div key={s} className="badge badge-purple specialty-badge" style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/simulator?demo=${encodeURIComponent(s.toLowerCase())}`)}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {DEEP_FEATURES.map((feature, i) => (
        <FeatureSection key={feature.title} feature={feature} index={i} />
      ))}

      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="cta-title">
            Start training today.<br />
            <span className="text-gradient">
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
