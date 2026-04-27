import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, background: 'var(--bg)' }}>
        <section style={{ padding: '100px 20px 60px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="section-eyebrow">Transparent Pricing</p>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.02em' }}>Invest in your clinical excellence</h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '40px' }}>
                Whether you're a medical student prepping for OSCEs or a residency program looking to scale training, we have a plan for you.
              </p>
            </motion.div>
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {/* Student Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', textAlign: 'left' }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Student</h3>
              <p style={{ color: 'var(--muted)', height: '48px' }}>Perfect for medical students getting started with clinical reasoning.</p>
              <div style={{ fontSize: '3.5rem', fontWeight: '800', margin: '24px 0', color: 'var(--text)' }}>
                $0<span style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 'normal' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['5 Case Studies per month', 'Basic AI Feedback', 'Standard Progress Tracking', 'Community Support'].map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/register')} className="btn btn-outline btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Get Started Free</button>
            </motion.div>

            {/* Professional Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: '24px', padding: '40px', textAlign: 'left', position: 'relative', boxShadow: '0 20px 40px rgba(109,40,217,0.15)' }}
            >
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px' }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Professional</h3>
              <p style={{ color: 'var(--muted)', height: '48px' }}>For residents and practicing doctors requiring rigorous preparation.</p>
              <div style={{ fontSize: '3.5rem', fontWeight: '800', margin: '24px 0', color: 'var(--text)' }}>
                $29<span style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 'normal' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['Unlimited Case Studies', 'Advanced Rubric Evaluation', 'Differential Diagnosis Breakdown', 'Priority 24/7 Support'].map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Start 14-Day Free Trial</button>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '80px 20px', background: 'white', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '60px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { q: "Can I use Cura AI on my phone?", a: "Yes, our web application is fully responsive. You can practice clinical scenarios on any modern mobile device or tablet." },
                { q: "Who creates the clinical cases?", a: "All of our scenarios are designed and validated by a board-certified team of medical educators to ensure medical accuracy and strict adherence to clinical guidelines." },
                { q: "Can medical schools purchase bulk licenses?", a: "Absolutely. We offer Enterprise plans for universities and residency programs which include administrative dashboards to monitor student progress. Contact us for custom pricing." }
              ].map((faq, i) => (
                <div key={i} style={{ background: 'var(--bg)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px' }}>{faq.q}</h4>
                  <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>{faq.a}</p>
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
