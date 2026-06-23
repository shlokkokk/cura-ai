import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';
import Navbar from '../components/Navbar';
import EkgMouseTrail from '../components/EkgMouseTrail';
import { usePageTransition } from '../utils/usePageTransition';

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

// Animated FAQ item with GSAP height tween
function FaqItem({ q, a, isOpen, onToggle }) {
  const answerRef = useRef(null);
  const prevOpen = useRef(isOpen);

  useGSAP(() => {
    if (!answerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (isOpen && !prevOpen.current) {
        gsap.fromTo(answerRef.current,
          { height: 0, autoAlpha: 0 },
          { height: 'auto', autoAlpha: 1, duration: 0.35, ease: 'power2.out' }
        );
      } else if (!isOpen && prevOpen.current) {
        gsap.to(answerRef.current, { height: 0, autoAlpha: 0, duration: 0.28, ease: 'power2.in' });
      }
      prevOpen.current = isOpen;
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      prevOpen.current = isOpen;
    });
    return () => mm.revert();
  }, { dependencies: [isOpen] });

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isOpen ? 'var(--border-acc)' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      transition: 'border-color var(--t)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--sp-5)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)',
          gap: 12,
        }}
      >
        {q}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
          style={{ flexShrink: 0, transition: 'transform 0.3s var(--ease)', transform: isOpen ? 'rotate(45deg)' : 'none' }}
        >
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <div
        ref={answerRef}
        style={{
          height: isOpen ? 'auto' : 0,
          overflow: 'hidden',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        <div style={{
          padding: '0 var(--sp-5) var(--sp-5)',
          fontSize: 'var(--fs-sm)', color: 'var(--text-2)',
          lineHeight: 1.7,
          borderTop: '1px solid var(--border)',
          paddingTop: 'var(--sp-4)',
        }}>
          {a}
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const pageRef = usePageTransition();
  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const faqRef = useRef(null);

  // Hero entrance
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // SplitText word-mask on pricing hero title lines
      const split = new SplitText('.pricing-hero-title-line', {
        type: 'words',
        wordsClass: 'split-word',
      });

      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'brandEase', duration: 0.65 } });
      tl
        .set('.pricing-hero-label', { autoAlpha: 1 })
        .to('.pricing-hero-label', {
          duration: 0.8,
          scrambleText: {
            text: 'Transparent Pricing',
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
        .from('.pricing-hero-sub', { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.3');
    });
    return () => mm.revert();
  }, { scope: heroRef });

  // Pricing cards entrance + 3D tilt
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Pre-set all targets to hidden before creating batches
      gsap.set('.pricing-card', { autoAlpha: 0, y: 50, scale: 0.97 });
      gsap.set('.pricing-feature-item', { autoAlpha: 0, x: -16 });

      ScrollTrigger.batch('.pricing-card', {
        start: 'top 88%',
        onEnter: batch => gsap.to(batch, {
          autoAlpha: 1, y: 0, scale: 1,
          stagger: 0.15, duration: 0.85, ease: 'power3.out', overwrite: true,
        }),
        once: true,
      });

      // Badge bounce
      gsap.from('.pricing-badge', {
        scale: 0, autoAlpha: 0, duration: 0.6,
        ease: 'elastic.out(1, 0.4)', delay: 0.5,
        scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' },
      });

      // Feature list items
      ScrollTrigger.batch('.pricing-feature-item', {
        start: 'top 92%',
        onEnter: batch => gsap.to(batch, {
          autoAlpha: 1, x: 0,
          stagger: 0.06, duration: 0.5, ease: 'power2.out', overwrite: true,
        }),
        once: true,
      });

      // 3D tilt on .pricing-card
      const cards = gsap.utils.toArray('.pricing-card');
      cards.forEach(card => {
        const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
        const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });
        
        card.style.transformPerspective = '1000px';
        
        const handleMouseMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = x / rect.width - 0.5;
          const cy = y / rect.height - 0.5;
          
          rotX(-cy * 8);
          rotY(cx * 8);
        };
        
        const handleMouseLeave = () => {
          rotX(0);
          rotY(0);
        };
        
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
      });
    });
    return () => mm.revert();
  }, { scope: cardsRef });

  // FAQ section entrance
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Pre-set
      gsap.set('.faq-item', { autoAlpha: 0, y: 30 });

      gsap.from('.faq-section-header', {
        y: 40, autoAlpha: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: faqRef.current, start: 'top 85%' },
      });
      ScrollTrigger.batch('.faq-item', {
        start: 'top 90%',
        onEnter: batch => gsap.to(batch, {
          autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', overwrite: true,
        }),
        once: true,
      });
    });
    return () => mm.revert();
  }, { scope: faqRef });

  return (
    <div ref={pageRef} style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <section ref={heroRef} style={{
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
          <div className="pricing-hero-label section-label" style={{ opacity: 0 }}>Transparent Pricing</div>
          <h1 className="pricing-hero-title" style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            margin: '16px 0 20px',
          }}>
            <span className="pricing-hero-title-line" style={{ display: 'block' }}>Invest in your</span>
            <span className="pricing-hero-title-line" style={{ display: 'block' }}>
              clinical{' '}
              <span className="text-gradient">
                excellence
              </span>
            </span>
          </h1>
          <p className="pricing-hero-sub" style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Whether you're a medical student prepping for OSCEs or a residency program scaling clinical training —
            we have a plan for you.
          </p>
        </div>
      </section>

      <section ref={cardsRef} style={{ padding: 'var(--sp-20) 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24,
            alignItems: 'start',
          }}>
            {PLANS.map(({ name, price, period, desc, features, cta, action, highlight, badge }) => (
              <div
                key={name}
                className="pricing-card"
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
                  <div className="pricing-badge" style={{
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
                    <div key={f} className="pricing-feature-item" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-sm)' }}>
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

      <section ref={faqRef} style={{ padding: 'var(--sp-20) 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="faq-section-header" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Got questions?</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Frequently Asked
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="faq-item">
                <FaqItem
                  q={q}
                  a={a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="cta-title">
            Ready to level up<br />
            <span className="text-gradient">
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
