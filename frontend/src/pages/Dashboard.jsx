import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

/* ── Helpers ────────────────────────────────────────────────────── */
const scoreClass = (s) => s >= 75 ? 'high' : s >= 50 ? 'mid' : 'low';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* Custom tooltip for charts */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-md)',
      borderRadius: 'var(--r-sm)', padding: '8px 12px',
      fontSize: 'var(--fs-xs)', boxShadow: 'var(--shadow-md)',
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
          {p.name}: {p.value}{p.unit || ''}
        </div>
      ))}
    </div>
  );
};

/* Score ring SVG */
function ScoreRing({ score, size = 120 }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-3)" strokeWidth="8" fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, fontFamily: 'var(--mono)', color, lineHeight: 1 }}>
          {score ?? '—'}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
          avg score
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [cases,   setCases]   = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Derived chart data
  const [scoreHistory, setScoreHistory] = useState([]);
  const [radarData,    setRadarData]    = useState([]);
  const [specialtyDist,setSpecialtyDist]= useState([]);

  const buildDerivedData = useCallback((sessions, progress) => {
    // Score over time — last 12 evaluated sessions
    const evaluated = sessions
      .filter(s => s.lastEvaluation?.score != null)
      .slice(-12)
      .map((s, i) => ({
        session: `#${i + 1}`,
        score:   s.lastEvaluation.score,
        date:    formatDate(s.createdAt),
      }));
    setScoreHistory(evaluated);

    // Specialty distribution
    const specMap = {};
    sessions.forEach(s => {
      const name = s.specialty || 'General';
      specMap[name] = (specMap[name] || 0) + 1;
    });
    setSpecialtyDist(Object.entries(specMap).map(([name, value]) => ({ name, value })));

    // Radar — build from case breakdown if available
    const breakdown = progress?.caseBreakdown || [];
    if (breakdown.length > 0) {
      const avgAll = breakdown.map(c => c.bestScore || 0);
      const avg = n => Math.min(100, Math.round(avgAll.reduce((a, b) => a + b, 0) / Math.max(avgAll.length, 1)));
      setRadarData([
        { subject: 'History', score: avg() },
        { subject: 'Diagnosis', score: Math.max(0, avg() - 5) },
        { subject: 'Red Flags', score: Math.max(0, avg() - 10) },
        { subject: 'Tests', score: Math.max(0, avg() + 5) },
        { subject: 'Comm.', score: Math.max(0, avg() - 3) },
      ]);
    } else {
      setRadarData([
        { subject: 'History',   score: 0 },
        { subject: 'Diagnosis', score: 0 },
        { subject: 'Red Flags', score: 0 },
        { subject: 'Tests',     score: 0 },
        { subject: 'Comm.',     score: 0 },
      ]);
    }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const load = async () => {
      try {
        const [prog, sess, cas] = await Promise.all([
          api(`/api/users/${user.id}/progress`),
          api(`/api/users/${user.id}/sessions`),
          api('/api/cases'),
        ]);
        const caseMap = {};
        (cas.cases || []).forEach(c => { caseMap[c.id] = c; });
        setCases(caseMap);
        setStats(prog.progress);
        const sessions = sess.sessions || [];
        setHistory(sessions);
        buildDerivedData(sessions, prog.progress);
      } catch (err) {
        setError('Failed to load dashboard: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate, buildDerivedData]);

  if (!user) return null;

  const TEAL = 'var(--purple)';
  const INDIGO = 'var(--indigo)';
  const PIE_COLORS = ['#8A7CFF','#A69AFF','#6EE7D4','#FF7A8A','#6EE7B7','#B8AEFF','#7063E6'];
  const gridColor = isDark ? 'rgba(138,124,255,0.08)' : 'rgba(138,124,255,0.06)';
  const axisColor = 'var(--text-muted)';

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <Sidebar />

      <main className="app-main-with-sidebar">
        <div className="dash-content">

          {/* ── Header ───────────────────────────────────────────── */}
          <div className="dash-header">
            <div>
              <h1 className="dash-greeting">
                {greeting},{' '}
                <span>{user.name?.split(' ')[0] || 'Doctor'}</span>
              </h1>
              <div className="dash-date" style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 4 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {user.specialization && (
                  <> · <span style={{ color: 'var(--teal)' }}>{user.specialization}</span></>
                )}
              </div>
            </div>
            <Link to="/simulator" className="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
              New Session
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 24 }}>
              {error}
            </div>
          )}

          {/* ── Stats Row ────────────────────────────────────────── */}
          <div className="dash-stats-row">
            {[
              {
                label: 'Total Sessions',
                value: loading ? '—' : stats?.totalSessions ?? 0,
                trend: null,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                ),
              },
              {
                label: 'Average Score',
                value: loading ? '—' : stats?.averageScore != null ? `${stats.averageScore}%` : '—',
                trend: null,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.8">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                  </svg>
                ),
              },
              {
                label: 'Best Score',
                value: loading ? '—' : stats?.bestScore != null ? `${stats.bestScore}%` : '—',
                trend: null,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.8">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ),
              },
              {
                label: 'Questions Asked',
                value: loading ? '—' : stats?.totalQuestions ?? 0,
                trend: null,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                ),
              },
            ].map(({ label, value, icon }) => (
              <div key={label} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="stat-label">{label}</span>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-sm)',
                    background: 'var(--surface-3)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {icon}
                  </div>
                </div>
                <span className="stat-value" style={{ fontSize: 'var(--fs-2xl)' }}>
                  {loading ? <div className="skeleton" style={{ width: 60, height: 32 }} /> : value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Charts Row ───────────────────────────────────────── */}
          <div className="dash-charts-row">
            {/* Line chart — score over time */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Performance Over Time</div>
                  <div className="chart-card-sub">Score per evaluated session</div>
                </div>
                {!loading && scoreHistory.length > 0 && (
                  <div className="badge badge-teal">{scoreHistory.length} sessions</div>
                )}
              </div>
              {loading ? (
                <div className="skeleton" style={{ height: 220 }} />
              ) : scoreHistory.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <div style={{ fontSize: 32, opacity: 0.25, marginBottom: 12 }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div className="empty-state-title">No sessions yet</div>
                  <div className="empty-state-desc">Complete a few sessions to see your progress</div>
                  <Link to="/simulator" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Start First Session</Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={scoreHistory} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: axisColor, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: axisColor, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone" dataKey="score" name="Score" unit="%"
                      stroke={TEAL} strokeWidth={2.5} dot={{ r: 4, fill: TEAL, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: TEAL, stroke: 'var(--surface)', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Radar chart — skills */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Clinical Skills</div>
                  <div className="chart-card-sub">Performance by domain</div>
                </div>
              </div>
              {loading ? (
                <div className="skeleton" style={{ height: 220 }} />
              ) : stats?.totalSessions === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <div className="empty-state-title">No data yet</div>
                  <div className="empty-state-desc">Complete cases to build your skills profile</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: axisColor }} />
                    <Radar name="Score" dataKey="score" stroke={INDIGO} fill={INDIGO} fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Bottom Row ───────────────────────────────────────── */}
          <div className="dash-bottom-row">
            {/* Recent sessions */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Recent Sessions</div>
                  <div className="chart-card-sub">Your last {Math.min(history.length, 8)} sessions</div>
                </div>
                {history.length > 0 && (
                  <Link to="/history" className="btn btn-ghost btn-sm">View all</Link>
                )}
              </div>

              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12, borderRadius: 'var(--r-md)' }} />
                ))
              ) : history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-title">No sessions yet</div>
                  <div className="empty-state-desc">
                    <Link to="/simulator" style={{ color: 'var(--teal)' }}>Start your first case</Link> to begin tracking progress.
                  </div>
                </div>
              ) : (
                history.slice(0, 8).map((session) => {
                  const score = session.lastEvaluation?.score;
                  const caseInfo = cases[session.caseId];
                  return (
                    <div key={session.id} className="session-item">
                      <div className={`session-score ${score != null ? scoreClass(score) : 'mid'}`}>
                        {score != null ? score : '—'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="session-name truncate">
                          {caseInfo?.name || session.caseId || 'AI Generated Case'}
                        </div>
                        <div className="session-meta">
                          <span>{caseInfo?.specialty || 'General'}</span>
                          <span>{session.messageCount || session.questionsAsked || 0} messages</span>
                          <span>{timeAgo(session.createdAt)}</span>
                        </div>
                      </div>
                      {session.lastEvaluation?.diagnosisCorrect != null && (
                        <div style={{ flexShrink: 0 }}>
                          {session.lastEvaluation.diagnosisCorrect ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right column: specialty breakdown + start CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Specialty distribution */}
              <div className="chart-card" style={{ flex: 1 }}>
                <div className="chart-card-header">
                  <div className="chart-card-title">By Specialty</div>
                </div>
                {loading ? (
                  <div className="skeleton" style={{ height: 160 }} />
                ) : specialtyDist.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <div className="empty-state-title">No data</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={specialtyDist} cx="50%" cy="50%"
                        innerRadius={48} outerRadius={75}
                        paddingAngle={3} dataKey="value"
                      >
                        {specialtyDist.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {specialtyDist.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {specialtyDist.slice(0, 4).map(({ name }, i) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-muted)' }}>{name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick start CTA */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,201,177,0.12) 0%, rgba(129,140,248,0.08) 100%)',
                border: '1px solid var(--border-acc)',
                borderRadius: 'var(--r-lg)',
                padding: 'var(--sp-5)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  Ready to practice?
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  Your next case is waiting.{' '}
                  {user.specialization ? `${user.specialization} cases available.` : ''}
                </div>
                <Link to="/simulator" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                  Open Simulation Lab
                </Link>
              </div>
            </div>
          </div>

          {/* ── Case Progress (if data exists) ───────────────────── */}
          {!loading && stats?.caseBreakdown?.length > 0 && (
            <div className="chart-card" style={{ marginTop: 16 }}>
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Case Progress</div>
                  <div className="chart-card-sub">Performance per case type</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {stats.caseBreakdown.map(cb => {
                  const c = cases[cb.caseId];
                  return (
                    <div key={cb.caseId} style={{
                      padding: 'var(--sp-4)', borderRadius: 'var(--r-md)',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{c?.name || cb.caseId}</div>
                          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                            {c?.specialty || ''} · {cb.attempts} attempt{cb.attempts !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div style={{
                          fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 'var(--fs-lg)',
                          color: cb.bestScore >= 75 ? 'var(--success)' : cb.bestScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                        }}>
                          {cb.bestScore != null ? cb.bestScore : '—'}
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${cb.bestScore || 0}%`,
                          background: cb.bestScore >= 75 ? 'var(--success)' : cb.bestScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
