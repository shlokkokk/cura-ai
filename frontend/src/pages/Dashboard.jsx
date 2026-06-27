import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

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

/* Format raw session ID into human readable case title */
function formatSessionName(name, caseId) {
  if (name) return name;
  if (!caseId) return 'AI Generated Case';
  
  // Format raw ID: ai-general-medicine-1782541968693-0 -> General Medicine
  const parts = caseId.split('-');
  const words = parts
    .filter(p => isNaN(p) && p !== 'ai' && p !== 'case')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1));
  
  return words.length > 0 ? words.join(' ') : 'AI Patient Case';
}

/* Custom tooltip for charts */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-3)',
      border: '1px solid var(--border-acc)',
      borderRadius: 'var(--r-sm)',
      padding: '6px 10px',
      boxShadow: 'var(--shadow-md)',
      pointerEvents: 'none',
      zIndex: 100,
    }}>
      {label && (
        <div style={{
          color: 'var(--text-2)',
          marginBottom: 3,
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{
          color: p.color || 'var(--text)',
          fontFamily: 'var(--mono)',
          fontWeight: 700,
          fontSize: '11px',
        }}>
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

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const dashRef = useRef(null);

  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [cases,   setCases]   = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Derived chart data
  const [scoreHistory, setScoreHistory] = useState([]);
  const [radarData,    setRadarData]    = useState([]);
  const [specialtyDist,setSpecialtyDist]= useState([]);

  const [reportLoadingId, setReportLoadingId] = useState(null);

  const cleanMarkdown = (text) => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  };

  const downloadReport = async (sessionId) => {
    const reportWindow = window.open('about:blank', '_blank');
    if (!reportWindow) {
      alert('Please allow popups for this site to view reports.');
      return;
    }
    reportWindow.document.write(`<html><head><title>Loading Report...</title></head>
      <body style="font-family:sans-serif;padding:40px;text-align:center;color:#666;">
        <h2>Generating clinical report...</h2>
        <p>Please wait while we assemble your session transcript and evaluation.</p>
      </body></html>`);

    setReportLoadingId(sessionId);
    try {
      const data     = await api(`/api/sessions/${sessionId}/report`);
      const reportText = data.report;
      const patient  = data.patient;
      const evalData = data.evaluation;
      const messages = data.messages || [];
      const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const cleanedReport = cleanMarkdown(reportText);
      const sections = cleanedReport.split('\n').map(line => {
        if (/^[A-Z\s\d.—\-:]{5,}$/.test(line.trim()) || /^\d+\./.test(line.trim())) {
          return `<h3 style="color:#8A7CFF;margin:18px 0 8px;font-size:14px;border-bottom:1px solid rgba(138,124,255,0.2);padding-bottom:4px;">${line}</h3>`;
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return `<li style="margin:3px 0;font-size:12px;color:#333;">${line.trim().replace(/^[-•]\s*/, '')}</li>`;
        }
        if (line.includes(':') && line.indexOf(':') < 30) {
          const [key, ...rest] = line.split(':');
          return `<p style="margin:4px 0;font-size:12px;"><strong>${key}:</strong>${rest.join(':')}</p>`;
        }
        if (line.trim()) return `<p style="margin:4px 0;font-size:12px;color:#333;">${line}</p>`;
        return '<br/>';
      }).join('');

      const htmlContent = `<!DOCTYPE html><html><head><title>Clinical Report - ${patient.name}</title>
        <style>
          @media print { body { margin: 0; } @page { margin: 20mm; } }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 3px solid #8A7CFF; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 800; color: #8A7CFF; margin-bottom: 4px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #666; }
          .score-box { text-align: center; background: linear-gradient(135deg, #f0fff8, #e0faf5); padding: 20px; border-radius: 12px; margin: 20px 0; }
          .score-box .score { font-size: 42px; font-weight: 800; color: #8A7CFF; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 10px; color: #999; }
        </style></head><body>
        <div class="header"><div class="logo">CURA.AI</div><h1>Clinical Visit Report</h1></div>
        <div class="meta"><span><strong>Date:</strong> ${reportDate}</span><span><strong>Patient:</strong> ${patient.name} (${patient.age} yrs)</span><span><strong>Specialty:</strong> ${patient.specialty}</span></div>
        ${evalData ? `<div class="score-box"><div class="score">${evalData.score}/100</div><div style="font-size:13px;color:${evalData.diagnosisCorrect ? '#059669' : '#dc2626'};font-weight:600;">${evalData.diagnosisCorrect ? 'Diagnosis Correct' : 'Diagnosis Incorrect'}</div></div>` : ''}
        <div>${sections}</div>
        <div style="margin-top:40px;border-top:2px solid #8A7CFF;padding-top:20px;">
          <h2 style="color:#8A7CFF;font-size:18px;margin-bottom:16px;">Chat Transcript</h2>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
            ${messages.map(m => `<div style="margin-bottom:12px;font-size:13px;"><span style="font-weight:700;color:${m.role === 'user' ? '#0284c7' : '#059669'};">${m.role === 'user' ? 'Doctor' : 'Patient'}:</span> <span style="color:#334155;">${m.text}</span></div>`).join('') || '<p style="color:#64748b;font-size:13px;">No chat history available.</p>'}
          </div>
        </div>
        <div class="footer"><p>Generated by CURA.AI — Virtual Patient Simulator</p><p>Educational simulation only.</p></div>
        </body></html>`;

      reportWindow.document.open();
      reportWindow.document.write(htmlContent);
      reportWindow.document.close();
      setTimeout(() => reportWindow.print(), 500);
    } catch (err) {
      reportWindow.close();
      alert('Failed to generate report: ' + err.message);
    } finally {
      setReportLoadingId(null);
    }
  };

  useGSAP(() => {
    if (loading) return;

    const tl = gsap.timeline();
    tl.fromTo('.dash-header', 
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
    )
    .fromTo('.stat-outer-wrap', 
      { y: 25, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.chart-outer-wrap', 
      { y: 25, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out' },
      '-=0.35'
    )
    .fromTo('.start-cta-outer', 
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.25'
    )
    .fromTo('.session-item',
      { x: -12, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out' },
      '-=0.2'
    );
  }, { dependencies: [loading], scope: dashRef });

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
      const avg = () => Math.min(100, Math.round(avgAll.reduce((a, b) => a + b, 0) / Math.max(avgAll.length, 1)));
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
        const sessions = (sess.sessions || []).filter(s => s.questionsAsked > 0);
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
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
  const axisColor = isDark ? 'var(--text-2)' : '#4B5563';

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <Sidebar />

      <main className="app-main-with-sidebar">
        <div ref={dashRef} className="dash-content">

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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                ),
              },
            ].map(({ label, value, icon }) => (
              <div key={label} className="outer-bezel-card stat-outer-wrap">
                <div className="inner-core-card stat-inner">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span className="stat-label">{label}</span>
                    <div className="stat-icon-wrap">
                      {icon}
                    </div>
                  </div>
                  <span className="stat-value" style={{ fontSize: 'var(--fs-2xl)' }}>
                    {loading ? <div className="skeleton" style={{ width: 60, height: 32 }} /> : value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="dash-charts-row">
            {/* Line chart — score over time */}
            <div className="outer-bezel-card chart-outer-wrap">
              <div className="inner-core-card chart-inner">
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
                  <div className="skeleton" style={{ height: 220, borderRadius: 'var(--r-lg)' }} />
                ) : scoreHistory.length === 0 ? (
                  <div className="empty-state" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="empty-chart-svg-wrap" style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="100%" height="100%" viewBox="0 0 600 200" fill="none" stroke="var(--purple)" strokeWidth="2.5" style={{ strokeDasharray: '8 4' }}>
                        <path d="M0,100 L180,100 L200,70 L210,130 L220,30 L230,170 L240,90 L250,110 L270,100 L600,100" />
                      </svg>
                    </div>
                    <div style={{ fontSize: 32, opacity: 0.25, marginBottom: 12, zIndex: 2 }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </div>
                    <div className="empty-state-title">
                      {history.length > 0 ? 'Evaluation Pending' : 'No sessions yet'}
                    </div>
                    <div className="empty-state-desc">
                      {history.length > 0 
                        ? 'Submit your case diagnosis inside the Simulator to receive a score and see it plotted here.'
                        : 'Complete a few sessions to see your progress.'}
                    </div>
                    <Link to="/simulator" className="btn btn-primary btn-sm" style={{ marginTop: 16, zIndex: 2 }}>
                      {history.length > 0 ? 'Open Simulator' : 'Start First Session'}
                    </Link>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={scoreHistory} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                      <defs>
                        <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="session" tick={{ fontSize: 11, fill: axisColor, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: axisColor, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone" dataKey="score" name="Score" unit="%"
                        stroke={TEAL} strokeWidth={2.5} fill="url(#scoreGlow)"
                        dot={{ r: 4, fill: TEAL, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: TEAL, stroke: 'var(--surface)', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Radar chart — skills */}
            <div className="outer-bezel-card chart-outer-wrap">
              <div className="inner-core-card chart-inner">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Clinical Skills</div>
                    <div className="chart-card-sub">Performance by domain</div>
                  </div>
                </div>
                {loading ? (
                  <div className="skeleton" style={{ height: 220, borderRadius: 'var(--r-lg)' }} />
                ) : stats?.totalSessions === 0 ? (
                  <div className="empty-state" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="empty-radar-svg-wrap" style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="var(--indigo)" strokeWidth="1">
                        <polygon points="50,10 88,38 73,82 27,82 12,38" strokeDasharray="3 3" />
                        <polygon points="50,25 78,46 67,73 33,73 22,46" strokeDasharray="3 3" />
                        <polygon points="50,40 68,53 62,64 38,64 32,53" strokeDasharray="3 3" />
                        <line x1="50" y1="50" x2="50" y2="10" />
                        <line x1="50" y1="50" x2="88" y2="38" />
                        <line x1="50" y1="50" x2="73" y2="82" />
                        <line x1="50" y1="50" x2="27" y2="82" />
                        <line x1="50" y1="50" x2="12" y2="38" />
                      </svg>
                    </div>
                    <div className="empty-state-title">No data yet</div>
                    <div className="empty-state-desc">Complete cases to build your skills profile</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
                    {radarData.map(({ subject, score }, i) => (
                      <div key={subject}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', marginBottom: 5 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{subject}</span>
                          <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-2)', fontWeight: 700 }}>{score}%</span>
                        </div>
                        <div className="progress-bar" style={{ height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <div className="progress-fill" style={{
                            width: `${score}%`,
                            height: '100%',
                            background: PIE_COLORS[i % PIE_COLORS.length],
                            borderRadius: 4,
                            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dash-bottom-row">
            {/* Recent sessions */}
            <div className="outer-bezel-card chart-outer-wrap">
              <div className="inner-core-card chart-inner">
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {history.slice(0, 8).map((session) => {
                      const score = session.lastEvaluation?.score;
                      const caseInfo = cases[session.caseId];
                      const isGenerating = reportLoadingId === session.id;
                      return (
                        <div
                          key={session.id}
                          className="session-item"
                          onClick={() => downloadReport(session.id)}
                          title="Click to generate and print full clinical report"
                          style={{
                            opacity: isGenerating ? 0.65 : 1,
                            cursor: 'pointer',
                          }}
                        >
                          <div className={`session-score ${score != null ? scoreClass(score) : 'mid'}`}>
                            {score != null ? score : '—'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="session-name truncate" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{formatSessionName(caseInfo?.name, session.caseId)}</span>
                              {isGenerating && (
                                <span style={{ fontSize: 10, color: 'var(--teal)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>Generating Report...</span>
                              )}
                            </div>
                            <div className="session-meta">
                              <span>{caseInfo?.specialty || 'General'}</span>
                              <span>{session.messageCount || session.questionsAsked || 0} messages</span>
                              <span>{timeAgo(session.createdAt)}</span>
                            </div>
                          </div>
                          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                            {session.lastEvaluation?.diagnosisCorrect != null ? (
                              session.lastEvaluation.diagnosisCorrect ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              )
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeDasharray="3 3">
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right column: specialty breakdown + start CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Specialty distribution */}
              <div className="outer-bezel-card chart-outer-wrap">
                <div className="inner-core-card chart-inner">
                  <div className="chart-card-header" style={{ marginBottom: 12 }}>
                    <div className="chart-card-title">By Specialty</div>
                  </div>
                  {loading ? (
                    <div className="skeleton" style={{ height: 160 }} />
                  ) : specialtyDist.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px 0' }}>
                      <div className="empty-state-title">No data</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                      {/* Left Column: Big metrics */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Primary Focus
                        </div>
                        <div className="truncate" style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text)', marginTop: 4, lineHeight: 1.2 }} title={
                          specialtyDist.length > 0
                            ? specialtyDist.reduce((max, d) => d.value > max.value ? d : max, specialtyDist[0]).name
                            : 'None'
                        }>
                          {specialtyDist.length > 0
                            ? specialtyDist.reduce((max, d) => d.value > max.value ? d : max, specialtyDist[0]).name
                            : 'None'}
                        </div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-2)', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {specialtyDist.slice(0, 3).map(({ name, value }, i) => (
                            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{name}</span>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.8 }}>({value})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Column: Donut Chart */}
                      <div style={{ width: 130, height: 130, position: 'relative', flexShrink: 0 }}>
                        <PieChart width={130} height={130}>
                          <Pie
                            data={specialtyDist} cx="50%" cy="50%"
                            innerRadius={36} outerRadius={50}
                            paddingAngle={4} dataKey="value"
                          >
                            {specialtyDist.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} style={{ outline: 'none' }} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} position={{ x: -90, y: 15 }} />
                        </PieChart>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                          pointerEvents: 'none',
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)', lineHeight: 1 }}>
                            {specialtyDist.reduce((sum, d) => sum + d.value, 0)}
                          </div>
                          <div style={{ fontSize: '8px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 1 }}>
                            cases
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick start CTA */}
              <div className="outer-bezel-card start-cta-outer" style={{ height: 'auto' }}>
                <div className="inner-core-card start-cta-inner" style={{
                  background: 'linear-gradient(135deg, rgba(0,201,177,0.06) 0%, rgba(129,140,248,0.04) 100%)',
                  textAlign: 'center',
                  padding: 'var(--sp-5) var(--sp-6)',
                }}>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Ready to practice?
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                    Your next case is waiting.{' '}
                    {user.specialization ? `${user.specialization} cases available.` : 'General Medicine cases available.'}
                  </div>
                  <Link to="/simulator" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                    Open Simulation Lab
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {!loading && stats?.caseBreakdown?.length > 0 && (
            <div className="outer-bezel-card chart-outer-wrap" style={{ marginTop: 16 }}>
              <div className="inner-core-card chart-inner">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Case Progress</div>
                    <div className="chart-card-sub">Performance per case type</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 16 }}>
                  {stats.caseBreakdown.map(cb => {
                    const c = cases[cb.caseId];
                    return (
                      <div key={cb.caseId} style={{
                        padding: 'var(--sp-4)', borderRadius: 'var(--r-md)',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-acc)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>
                              {formatSessionName(c?.name, cb.caseId)}
                            </div>
                            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                              {c?.specialty || 'General Medicine'} · {cb.attempts} attempt{cb.attempts !== 1 ? 's' : ''}
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
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

