import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const SPECIALTIES = [
  'General Medicine', 'Cardiology', 'Neurology', 'Respiratory Medicine',
  'Endocrinology', 'General Surgery', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT',
  'Gastroenterology', 'Nephrology', 'Urology', 'Obstetrics & Gynecology',
  'Dentistry', 'Emergency Medicine', 'Oncology', 'Radiology'
];

export default function Profile() {
  const { user, saveUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    institution: user?.institution || '',
    role: user?.role || 'student',
    yearOfStudy: user?.yearOfStudy || '',
    specialization: user?.specialization || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) { navigate('/login'); return null; }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const data = await api(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      saveUser(data.user);
      setMessage('Profile updated successfully! Your simulator cases will now match your specialty.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const profileComplete = formData.name && formData.specialization && formData.role;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main" style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          
          {/* Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '20px', 
              background: `linear-gradient(135deg, ${user.avatarColor || '#7C3AED'}, ${user.avatarColor || '#7C3AED'}dd)`, 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '2rem', fontWeight: '800', flexShrink: 0 
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 4px' }}>{user.name}</h1>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                {user.specialization || 'No specialty set'} · {user.role === 'faculty' ? 'Doctor / Faculty' : 'Medical Student'}
              </p>
              {!profileComplete && (
                <div style={{ 
                  marginTop: '8px', padding: '8px 16px', background: 'rgba(251, 191, 36, 0.1)', 
                  border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', 
                  fontSize: '0.85rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  ⚠️ Complete your profile to get specialty-matched patients
                </div>
              )}
            </div>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', marginBottom: '24px', color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ {message}
            </div>
          )}
          {error && (
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', marginBottom: '24px', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSave}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '30px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>Personal Information</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="sim-field">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="sim-field">
                  <label>Email</label>
                  <input type="email" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="sim-field">
                  <label>Institution</label>
                  <input type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="e.g. Harvard Medical School" />
                </div>
                <div className="sim-field">
                  <label>Year of Study</label>
                  <input type="text" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} placeholder="e.g. MS3, PGY-1" />
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '30px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Medical Specialty</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Your specialty determines which AI patients you'll receive in the Simulation Lab. Choose your area of practice or study.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="sim-field">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="student">🎓 Medical Student</option>
                    <option value="faculty">👨‍⚕️ Doctor / Faculty</option>
                  </select>
                </div>
                <div className="sim-field">
                  <label>Specialization *</label>
                  <select name="specialization" value={formData.specialization} onChange={handleChange} required>
                    <option value="">Select your specialty...</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {formData.specialization && (
                <div style={{ 
                  marginTop: '20px', padding: '16px 20px', 
                  background: 'linear-gradient(135deg, rgba(138,124,255,0.08), rgba(67,217,173,0.08))', 
                  borderRadius: '12px', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🩺</span>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{formData.specialization}</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                      AI patients in the simulator will be tailored to this specialty
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
