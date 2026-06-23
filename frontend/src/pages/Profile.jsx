import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

const SPECIALTIES = [
  'General Medicine', 'Cardiology', 'Neurology', 'Respiratory Medicine',
  'Endocrinology', 'General Surgery', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT',
  'Gastroenterology', 'Nephrology', 'Urology', 'Obstetrics & Gynecology',
  'Emergency Medicine', 'Oncology', 'Radiology', 'Hematology', 'Genetics'
];

const ROLES = [
  { value: 'student',    label: 'Medical Student' },
  { value: 'resident',   label: 'Resident / Intern' },
  { value: 'faculty',    label: 'Doctor / Faculty' },
  { value: 'researcher', label: 'Medical Researcher' },
];

export default function Profile() {
  const { user, saveUser } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name:          user?.name || '',
    institution:   user?.institution || '',
    role:          user?.role || 'student',
    yearOfStudy:   user?.yearOfStudy || '',
    specialization:user?.specialization || '',
  });
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');

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
        body: JSON.stringify(formData),
      });
      saveUser(data.user);
      setMessage('Profile updated. Your simulator will now use cases matched to your specialty.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const profileComplete = formData.name && formData.specialization && formData.role;

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <Sidebar />
      <main className="app-main-with-sidebar">
        <div className="dash-content">

          {/* Header */}
          <div className="dash-header">
            <div>
              <h1 className="dash-greeting">Your Profile</h1>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
                Update your details to personalise the AI simulation experience.
              </div>
            </div>
          </div>

          {/* Profile card header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: 'var(--sp-6)',
            background: 'linear-gradient(135deg, rgba(0,201,177,0.08) 0%, rgba(129,140,248,0.05) 100%)',
            border: '1px solid var(--border-acc)', borderRadius: 'var(--r-xl)',
            marginBottom: 'var(--sp-6)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--r-lg)',
              background: 'var(--teal-dim)', border: '2px solid rgba(0,201,177,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'var(--teal)',
              fontFamily: 'var(--mono)', flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 3 }}>
                {user.email}
                {user.specialization && (
                  <> · <span style={{ color: 'var(--teal)' }}>{user.specialization}</span></>
                )}
                {user.institution && (
                  <> · {user.institution}</>
                )}
              </div>
              {!profileComplete && (
                <div className="alert alert-warning" style={{ marginTop: 12, padding: '8px 14px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Complete your profile to receive specialty-matched AI patients in the simulator.
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className="alert alert-success" style={{ marginBottom: 'var(--sp-5)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
              </svg>
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 'var(--sp-5)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Personal info */}
            <div className="chart-card" style={{ marginBottom: 'var(--sp-5)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-base)', marginBottom: 4 }}>Personal Information</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                Your basic account details.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                <div className="field">
                  <label htmlFor="prof-name">Full Name *</label>
                  <input id="prof-name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Dr. Jane Smith" />
                </div>
                <div className="field">
                  <label htmlFor="prof-email">Email</label>
                  <input id="prof-email" type="email" value={user.email} disabled style={{ opacity: 0.55, cursor: 'not-allowed' }} />
                </div>
                <div className="field">
                  <label htmlFor="prof-institution">Institution</label>
                  <input id="prof-institution" type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="e.g. Harvard Medical School (optional)" />
                </div>
                <div className="field">
                  <label htmlFor="prof-year">Year / Level</label>
                  <input id="prof-year" type="text" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} placeholder="e.g. MS3, PGY-1, Attending" />
                </div>
              </div>
            </div>

            {/* Specialty */}
            <div className="chart-card" style={{ marginBottom: 'var(--sp-5)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-base)', marginBottom: 4 }}>Medical Specialty</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                Your specialty determines which AI patients you receive in the Simulation Lab.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                <div className="field">
                  <label htmlFor="prof-role">Role *</label>
                  <select id="prof-role" name="role" value={formData.role} onChange={handleChange}>
                    {ROLES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="prof-spec">Specialization *</label>
                  <select id="prof-spec" name="specialization" value={formData.specialization} onChange={handleChange} required>
                    <option value="">Select specialty...</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {formData.specialization && (
                <div style={{
                  marginTop: 20, padding: 'var(--sp-4) var(--sp-5)',
                  background: 'var(--teal-dim)', border: '1px solid rgba(0,201,177,0.2)',
                  borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>
                      {formData.specialization}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                      AI patients will be tailored to this specialty
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving || !formData.name.trim() || !formData.specialization}
              style={{ width: '100%' }}
            >
              {saving ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Saving...</>
              ) : 'Save Profile'}
            </button>
          </form>

          {/* Mobile-only app settings */}
          <div className="mobile-only-settings" style={{ marginTop: 'var(--sp-6)', display: 'none' }}>
            <div className="chart-card">
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-base)', marginBottom: 4 }}>App Settings</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                Theme and session preferences for mobile view.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  type="button"
                  onClick={toggle}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveUser(null);
                    navigate('/');
                  }}
                  className="btn btn-danger"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign Out / Log Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
