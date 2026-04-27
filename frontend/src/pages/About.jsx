import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, background: 'var(--bg)' }}>
        <section style={{ padding: '100px 20px', textAlign: 'center', background: 'linear-gradient(180deg, var(--bg) 0%, white 100%)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="section-eyebrow">Our Mission</p>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.02em' }}>Built by doctors, <br/>for the future of medicine.</h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--muted)', lineHeight: '1.8' }}>
                Cura AI was founded with a single mission: to provide universally accessible, highly realistic clinical training to healthcare professionals across the globe, supporting SDG 3: Good Health and Well-being.
              </p>
            </motion.div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '24px' }}>The Hackathon Story</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: '1.8', marginBottom: '20px' }}>
                Cura AI was born out of a frantic 48-hour medical technology hackathon. Our team noticed a critical flaw in traditional medical education: students learn textbook theory, but lack the opportunity to practice the art of patient conversation before facing real humans in pain.
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: '1.8' }}>
                By combining the incredible reasoning capabilities of Large Language Models with strict, evidence-based medical rubrics, we successfully created a zero-risk environment where clinicians can safely make mistakes, learn from detailed feedback, and ultimately save lives.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ background: 'var(--primary)', padding: '60px', textAlign: 'center', color: 'white' }}>
                <svg width="64" height="64" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 24px' }}>
                  <rect width="32" height="32" rx="8" fill="white"/>
                  <path d="M16 8C12 8 9 11 9 14.5C9 18 12 20 14 21.5V23C14 23.6 14.4 24 15 24H17C17.6 24 18 23.6 18 23V21.5C20 20 23 18 23 14.5C23 11 20 8 16 8Z" fill="#6D28D9"/>
                </svg>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Cura AI Hub</h3>
                <p style={{ opacity: 0.8, marginTop: '12px' }}>Established 2026</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section style={{ padding: '100px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '60px' }}>Our Core Values</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              {[
                { title: 'Clinical Accuracy', desc: 'We never compromise on medical facts. Our AI is rigidly bound by standard medical guidelines.' },
                { title: 'Psychological Safety', desc: 'A judgment-free zone where making the wrong diagnosis is celebrated as a learning opportunity.' },
                { title: 'Universal Access', desc: 'Democratizing high-tier medical education so location and funding are no longer barriers to excellence.' }
              ].map((value, i) => (
                <div key={i}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 auto 20px' }}>{i + 1}</div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px' }}>{value.title}</h4>
                  <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
