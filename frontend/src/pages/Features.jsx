import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Features() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <section style={{ padding: '100px 20px', background: 'var(--surface)', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="section-eyebrow">Advanced Capabilities</p>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.02em' }}>
                Next-generation clinical <span className="gradient-text">simulation</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--muted)', lineHeight: '1.6' }}>
                Cura AI provides an immersive, hyper-realistic environment designed to bridge the gap between textbook medical knowledge and real-world clinical application.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Alternating Feature 1 */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '24px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 0 1 5 5c0 3-2 5-5 8-3-3-5-5-5-8a5 5 0 0 1 5-5z"/><path d="M12 22c-4.97 0-9-2.24-9-5v-1c0-1.66 3-3 9-3s9 1.34 9 3v1c0 2.76-4.03 5-9 5z"/></svg>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px' }}>Hyper-realistic Patient Conversations</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.7' }}>
                Powered by Google Gemini, our virtual patients understand nuance, express emotion, and respond uniquely based on their complex medical backgrounds. They will guard sensitive information until asked properly, mimicking real clinical hesitancy.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Dynamic emotional responses', 'Context-aware medical history', 'Complex multi-system symptoms'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: '500' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ background: 'linear-gradient(135deg, #f0eeff, #f8f7ff)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', position: 'relative' }}>
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(109,40,217,0.1)', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>SS</div>
                  <div>
                    <h4 style={{ margin: 0 }}>Sarah Smith</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Chief Complaint: Abdominal Pain</span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-alt)', padding: '16px', borderRadius: '12px', marginBottom: '12px', color: 'var(--text)', borderBottomLeftRadius: '4px' }}>
                  "It hurts really bad right here under my ribs... especially after I eat anything greasy."
                </div>
                <div style={{ background: 'var(--primary)', padding: '16px', borderRadius: '12px', color: 'white', marginLeft: '40px', borderBottomRightRadius: '4px' }}>
                  "On a scale of 1 to 10, how severe is the pain when it occurs?"
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Alternating Feature 2 */}
        <section style={{ padding: '80px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ order: 2 }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '24px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px' }}>Comprehensive Clinical Rubrics</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.7' }}>
                Stop guessing how you performed. Our proprietary evaluation engine breaks down your clinical interview against standard medical rubrics, checking if you asked critical differential questions and identified red flag symptoms.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Diagnostic accuracy scoring', 'Missed red flag identification', 'Communication and empathy grading'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: '500' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ background: 'linear-gradient(135deg, rgba(67, 217, 173, 0.1), rgba(167, 139, 250, 0.1))', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', order: 1 }}>
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Evaluation Report</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontWeight: '600' }}>Diagnostic Accuracy</span>
                  <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '999px', fontWeight: 'bold' }}>92%</span>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', marginTop: '20px' }}>
                  <h4 style={{ color: '#dc2626', marginBottom: '8px', fontSize: '0.9rem' }}>Missed Questions</h4>
                  <p style={{ color: '#7f1d1d', fontSize: '0.85rem', margin: 0 }}>You failed to ask the patient if the chest pain radiated to the left arm or jaw, which is a critical indicator of myocardial infarction.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ padding: '100px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Everything You Need</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginTop: '16px' }}>A complete toolset for modern medical education.</p>
            </div>
            <div style={{ display: 'grid', gap: '40px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {[
                { icon: '📈', title: 'Progress Tracking', desc: 'Track your score history over time and identify specific clinical areas for improvement through our Dashboard analytics.' },
                { icon: '🩺', title: 'Diverse Scenarios', desc: 'From routine checkups to critical emergencies, practice across a wide range of medical specialties including Cardiology and Neurology.' },
                { icon: '⚡', title: 'Instant Feedback', desc: 'No waiting for a professor. Get immediate, actionable feedback the second you submit your provisional diagnosis.' },
                { icon: '🔒', title: '100% Risk Free', desc: 'Make mistakes without consequences. The simulation lab is the perfect place to test your clinical limits safely and confidently.' }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(109,40,217,0.1)' }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
