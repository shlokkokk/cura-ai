import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';
import Navbar from '../components/Navbar';
import EkgMouseTrail from '../components/EkgMouseTrail';
import { usePageTransition } from '../utils/usePageTransition';


const VALUES = [
  {
    num: '01',
    title: 'Clinical Accuracy',
    desc: 'We never compromise on medical facts. Every AI patient response is grounded in evidence-based guidelines and standard clinical pathways.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Psychological Safety',
    desc: 'A judgment-free zone where a wrong diagnosis is a celebrated learning opportunity, not a failure. Mistakes here save real lives later.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Universal Access',
    desc: 'Democratising high-tier medical education so location and funding are no longer barriers. Supporting UN SDG3 and SDG4.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
];

export default function About() {
  const pageRef = usePageTransition();
  const heroRef = useRef(null);
  const originRef = useRef(null);
  const valuesRef = useRef(null);

  // Hero entrance
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // SplitText word-mask on about hero title lines
      const split = new SplitText('.about-hero-title-line', {
        type: 'words',
        wordsClass: 'split-word',
      });

      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'brandEase', duration: 0.65 } });
      tl
        .set('.about-hero-label', { autoAlpha: 1 })
        .to('.about-hero-label', {
          duration: 0.8,
          scrambleText: {
            text: 'Our Mission',
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
        .from('.about-hero-sub', { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.3')
        .from('.about-hero-btns > *', {
          y: 20, autoAlpha: 0, scale: 0.94, stagger: 0.1, duration: 0.5, ease: 'snapEase',
        }, '-=0.3');
    });
    return () => mm.revert();
  }, { scope: heroRef });

  // Origin section — two columns slide from sides + 3D tilt
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: originRef.current,
          start: 'top 80%',
        },
      });
      tl
        .from('.origin-text-col', { x: -70, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
        .from('.origin-card-col', { x: 70, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, '<0.15')
        .from('.origin-stat-row', {
          x: 20, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out',
        }, '-=0.5');

      // 3D tilt on .origin-card-col
      const card = originRef.current.querySelector('.origin-card-col');
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
          
          rotX(-cy * 8);
          rotY(cx * 8);
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
  }, { scope: originRef });

  // Values cards + 3D tilts
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Pre-set before creating any batches
      gsap.set('.value-card', { autoAlpha: 0, y: 50, scale: 0.97 });
      gsap.set('.value-num-badge', { autoAlpha: 0, scale: 0 });

      gsap.from('.values-section-header', {
        y: 40, autoAlpha: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: valuesRef.current, start: 'top 85%' },
      });
      ScrollTrigger.batch('.value-card', {
        start: 'top 90%',
        onEnter: batch => gsap.to(batch, {
          autoAlpha: 1, y: 0, scale: 1, stagger: 0.14, duration: 0.8,
          ease: 'power3.out', overwrite: true,
        }),
        once: true,
      });
      // Number badges pop
      gsap.to('.value-num-badge', {
        scale: 1, autoAlpha: 1,
        stagger: 0.15, duration: 0.5, ease: 'back.out(2.5)',
        scrollTrigger: { trigger: valuesRef.current, start: 'top 82%' },
      });

      // 3D tilt on .value-card
      const cards = gsap.utils.toArray('.value-card');
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
  }, { scope: valuesRef });

  return (
    <div ref={pageRef} style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <section ref={heroRef} style={{
        paddingTop: 'calc(64px + 80px)', paddingBottom: 80,
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 0%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div className="about-hero-label section-label" style={{ justifyContent: 'center', display: 'inline-block', opacity: 0 }}>Our Mission</div>
          <h1 className="about-hero-title" style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            margin: '16px 0 24px', color: 'var(--text)',
          }}>
            <span className="about-hero-title-line" style={{ display: 'block' }}>Built by students,</span>
            <span className="about-hero-title-line" style={{ display: 'block' }}>
              for the future{' '}
              <span className="text-gradient">
                of medicine.
              </span>
            </span>
          </h1>
          <p className="about-hero-sub" style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 32px' }}>
            CURA.AI was founded with a single mission — to provide universally accessible,
            highly realistic clinical training to healthcare professionals across the globe,
            supporting UN SDG3 and SDG4.
          </p>
          <div className="about-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/simulator?demo=cardiology" className="btn btn-primary btn-lg">Try the Simulator</Link>
            <Link to="/features" className="btn btn-outline btn-lg">Explore Features</Link>
          </div>
        </div>
      </section>

      <section ref={originRef} className="section-sm" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div className="origin-text-col">
              <div className="section-label">The Origin</div>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                The Hackathon Story
              </h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 20, fontSize: 'var(--fs-base)' }}>
                CURA.AI was born at the GNEC hackathon, where our team identified a critical gap in medical education:
                students master textbook theory, but rarely get to practice the art of patient conversation before
                facing real humans in pain.
              </p>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.8, fontSize: 'var(--fs-base)' }}>
                By combining the reasoning capabilities of Large Language Models with strict, evidence-based medical
                rubrics, we created a zero-risk environment where clinicians can safely make mistakes, receive
                detailed feedback, and ultimately build the confidence to save lives.
              </p>
            </div>

            {/* Visual card */}
            <div className="origin-card-col" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-md)',
              borderRadius: 'var(--r-xl)',
              padding: 'var(--sp-8)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 200, height: 200,
                background: 'radial-gradient(circle, rgba(0,201,177,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--r-md)',
                  background: 'var(--teal-dim)', border: '1px solid rgba(0,201,177,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--fs-lg)' }}>CURA.AI</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                    Synapse Team · Est. 2026
                  </div>
                </div>
              </div>
              {[
                { label: 'Specialties covered', val: '10+' },
                { label: 'AI providers supported', val: '3' },
                { label: 'Cases generated', val: 'Unlimited' },
                { label: 'Session feedback items', val: '5 categories' },
              ].map(({ label, val }) => (
                <div key={label} className="origin-stat-row" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--sp-3) 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--teal)', fontSize: 'var(--fs-sm)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={valuesRef} className="section-sm" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border-md)' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="values-section-header" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">What We Stand For</div>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 0 }}>
              Our Core Values
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {VALUES.map(({ num, title, desc, icon }) => (
              <div key={num} className="feature-card value-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="feature-icon" style={{ marginBottom: 0 }}>{icon}</div>
                  <div className="value-num-badge" style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
                    {num}
                  </div>
                </div>
                <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-2)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="cta-title">
            Ready to practice<br />
            <span className="text-gradient">
              without risk?
            </span>
          </h2>
          <p className="cta-sub">
            Join thousands of medical students improving their clinical reasoning with CURA.AI.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-xl">Create Free Account</Link>
            <Link to="/simulator?demo=cardiology" className="btn btn-outline btn-xl">Try Demo</Link>
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
