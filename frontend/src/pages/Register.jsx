import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', institution: '', role: 'student', year: '', spec: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { saveUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        institution: formData.institution.trim() || undefined,
        role: formData.role,
        yearOfStudy: formData.year.trim() || undefined,
        specialization: formData.spec.trim() || undefined
      };
      const data = await api('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      saveUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Left Panel: Informative Notes */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a1035, #6D28D9)', color: 'white', padding: '60px', flexDirection: 'column', justifyContent: 'space-between', display: window.innerWidth < 900 ? 'none' : 'flex' }} className="auth-left-panel">
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Logo size={40} dark={true} />
          </Link>
        </div>
        <div style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>Start your journey today.</h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '40px' }}>
            Create an account to track your clinical learning progress, save your patient session history, and unlock advanced diagnostic scenarios.
          </p>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Track Progress over time</h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Your dashboard automatically analyzes your strengths and weaknesses.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔒</div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>100% Risk Free Practice</h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Test your clinical limits safely before treating real patients.</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
          &copy; {new Date().getFullYear()} Cura AI. Built for the future of medicine.
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)', position: 'relative' }}>
        <Link to="/" style={{ position: 'absolute', top: '40px', right: '40px', color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Home
        </Link>

        <div className="auth-box" style={{ width: '100%', maxWidth: '500px' }}>
          <div className="mobile-logo" style={{ marginBottom: '40px', display: 'none' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Logo size={40} dark={false} />
            </Link>
          </div>
          <div className="auth-icon" style={{ display: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <h1 className="auth-title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '8px' }}>Create Account</h1>
          <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: '32px' }}>Register to save your session history and track your progress.</p>
          
          {error && <div style={{ color: 'var(--danger)', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '24px' }}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="sim-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="name">Full name *</label>
                <input type="text" id="name" placeholder="Dr. Sarah Johnson" required autoComplete="name" value={formData.name} onChange={handleChange} />
              </div>
              
              <div className="sim-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="email">Email address *</label>
                <input type="email" id="email" placeholder="sarah@hospital.org" required autoComplete="email" value={formData.email} onChange={handleChange} />
              </div>
              
              <div className="sim-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="password">Password *</label>
                <div className="pwd-wrapper" style={{ position: 'relative' }}>
                  <input 
                    type={showPwd ? "text" : "password"} 
                    id="password" 
                    placeholder="Create a strong password" 
                    required 
                    autoComplete="new-password" 
                    style={{ paddingRight: '40px' }}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!showPwd ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="sim-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="institution">Institution</label>
                <input type="text" id="institution" placeholder="University Medical Center" autoComplete="organization" value={formData.institution} onChange={handleChange} />
              </div>
              
              <div className="sim-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="role">Role</label>
                <select id="role" value={formData.role} onChange={handleChange}>
                  <option value="student">🎓 Medical Student</option>
                  <option value="faculty">👨‍⚕️ Faculty / Doctor</option>
                  <option value="researcher">🔬 Medical Researcher</option>
                </select>
              </div>
              
              <div className="sim-field">
                <label htmlFor="year">Year of Study</label>
                <input type="text" id="year" placeholder="e.g. MS3" value={formData.year} onChange={handleChange} />
              </div>
              
              <div className="sim-field">
                <label htmlFor="spec">Specialization *</label>
                <select id="spec" value={formData.spec} onChange={handleChange} required>
                  <option value="">Select your specialty...</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Respiratory Medicine">Respiratory Medicine</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="ENT">ENT (Otolaryngology)</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Urology">Urology</option>
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                  <option value="Dentistry">Dentistry</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Genetics">Genetics</option>
                </select>
              </div>
            </div>
            
            <div className="auth-form__actions" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
            
            <div className="auth-divider" style={{ margin: '20px 0' }}>or</div>
            
            <div className="auth-form__actions">
              <Link to="/login" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>Already have an account? Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
