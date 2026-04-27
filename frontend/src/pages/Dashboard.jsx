import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && location.hash === '#history') {
      const el = document.getElementById('history');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, location]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [pRes, hRes, cRes] = await Promise.all([
          api(`/api/users/${user.id}/progress`),
          api(`/api/users/${user.id}/sessions`),
          api('/api/cases')
        ]);

        const caseMap = {};
        cRes.cases.forEach(c => caseMap[c.id] = c);
        setCases(caseMap);
        setStats(pRes.progress);
        setHistory(hRes.sessions || []);
      } catch (err) {
        setError('Failed to load dashboard data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main" style={{ padding: '40px 20px' }}>
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          <aside className="dash-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="user-profile-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '30px', textAlign: 'center' }}>
              <div className="profile-avatar" style={{ width: '80px', height: '80px', borderRadius: '20px', background: user.avatarColor || 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', margin: '0 auto 16px' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-name" style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>{user.name}</div>
            <div className="profile-meta" style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {user.role || 'User'} {user.institution && `· ${user.institution}`}
            </div>
          </div>
          
          <div className="dash-section" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
            <h3 className="dash-section-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>Quick Stats</h3>
            <div className="progress-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {loading ? <p className="text-muted" style={{ fontSize: '0.8rem' }}>Loading stats...</p> : (
                <>
                  <div className="stat-card"><span className="stat-value">{stats?.totalSessions || 0}</span><span className="stat-label">Sessions</span></div>
                  <div className="stat-card"><span className="stat-value">{stats?.averageScore != null ? stats.averageScore + '%' : '—'}</span><span className="stat-label">Avg Score</span></div>
                  <div className="stat-card"><span className="stat-value">{stats?.bestScore != null ? stats.bestScore + '%' : '—'}</span><span className="stat-label">Best</span></div>
                  <div className="stat-card"><span className="stat-value">{stats?.totalQuestions || 0}</span><span className="stat-label">Questions</span></div>
                </>
              )}
            </div>
          </div>
        </aside>

        <div className="dash-main" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {error && <div style={{ color: 'var(--danger)', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
          
          <div className="dash-section" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '30px' }}>
            <div className="dash-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h2 className="dash-section-title" style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0' }}>Case Progress</h2>
            </div>
            {loading ? <p className="text-muted">Loading progress...</p> : (
              stats?.caseBreakdown?.length > 0 ? (
                <div className="case-progress-list">
                  {stats.caseBreakdown.map(cb => {
                    const c = cases[cb.caseId];
                    return (
                      <div key={cb.caseId} className="case-progress-item" style={{ padding: '16px' }}>
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{c?.name || cb.caseId}</strong>
                          <small style={{ fontSize: '0.85rem', display: 'block', color: 'var(--muted)' }}>{c?.specialty || ''} · {cb.attempts} attempt{cb.attempts !== 1 ? 's' : ''}</small>
                        </div>
                        <div className="case-progress-scores" style={{ fontSize: '0.9rem' }}>
                          <span>Best: <strong>{cb.bestScore != null ? cb.bestScore + '%' : '—'}</strong></span>
                          <span>Last: <strong>{cb.lastScore != null ? cb.lastScore + '%' : '—'}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted">No case progress yet. Go to the Simulation Lab to practice.</p>
              )
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
