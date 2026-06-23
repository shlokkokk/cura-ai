import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function PatientHistory() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [history,          setHistory]          = useState([]);
  const [cases,            setCases]            = useState({});
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [reportLoadingId,  setReportLoadingId]  = useState(null);
  const [search,           setSearch]           = useState('');

  const downloadReport = async (sessionId) => {
    const reportWindow = window.open('about:blank', '_blank');
    if (!reportWindow) {
      alert('Please allow popups for this site to view reports.');
      return;
    }
    reportWindow.document.write(`<html><head><title>Loading...</title></head>
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
      const sections = reportText.split('\n').map(line => {
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

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        const [hRes, cRes] = await Promise.all([
          api(`/api/users/${user.id}/sessions`),
          api('/api/cases'),
        ]);
        const caseMap = {};
        (cRes.cases || []).forEach(c => { caseMap[c.id] = c; });
        setCases(caseMap);
        const activeSessions = (hRes.sessions || []).filter(s => s.questionsAsked > 0);
        setHistory(activeSessions);
      } catch (err) {
        setError('Failed to load session history: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  if (!user) return null;

  const filtered = history.filter(s => {
    if (!search.trim()) return true;
    const c = cases[s.caseId] || {};
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.specialty?.toLowerCase().includes(q) ||
      c.complaint?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <Sidebar />
      <main className="app-main-with-sidebar">
        <div className="dash-content">

          {/* Header */}
          <div className="dash-header">
            <div>
              <h1 className="dash-greeting">Session History</h1>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
                All your past patient simulations. Click any row to view the full report.
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
            <div className="alert alert-danger" style={{ marginBottom: 24 }}>{error}</div>
          )}

          {/* Table */}
          <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Search */}
            <div style={{ padding: 'var(--sp-5) var(--sp-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="chart-card-title" style={{ margin: 0 }}>Previous Cases</div>
                {!loading && (
                  <div className="badge badge-teal">{history.length}</div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by patient or specialty..."
                  style={{ paddingLeft: 32, fontSize: 'var(--fs-sm)', width: 220 }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Patient', 'Specialty / Complaint', 'Date', 'Session Time', 'Score', 'Diagnosis'].map(h => (
                      <th key={h} style={{
                        padding: 'var(--sp-3) var(--sp-4)',
                        fontSize: 'var(--fs-xs)', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: 'var(--text-muted)', textAlign: h === 'Score' ? 'center' : 'left',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} style={{ padding: 'var(--sp-4)' }}>
                            <div className="skeleton" style={{ height: 16 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length > 0 ? (
                    filtered.map((s, idx) => {
                      const c = cases[s.caseId] || {};
                      const score = s.lastEvaluation?.score;
                      const sessionNumber = history.length - history.indexOf(s);
                      const isLoading = reportLoadingId === s.id;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => downloadReport(s.id)}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            opacity: isLoading ? 0.5 : 1,
                            transition: 'background var(--t)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          title="Click to view full clinical report"
                        >
                          <td style={{ padding: 'var(--sp-4)', fontFamily: 'var(--mono)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', width: 48 }}>
                            {sessionNumber}
                          </td>
                          <td style={{ padding: 'var(--sp-4)' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>
                              {c.name || 'Unknown Patient'}
                              {isLoading && (
                                <span style={{ fontSize: 11, color: 'var(--teal)', marginLeft: 8 }}>Loading...</span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--mono)' }}>
                              {c.age && `${c.age}y`} {c.gender ? `· ${c.gender}` : ''}
                            </div>
                          </td>
                          <td style={{ padding: 'var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>
                            {c.complaint || c.specialty || '—'}
                          </td>
                          <td style={{ padding: 'var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {formatDate(s.createdAt)}
                          </td>
                          <td style={{ padding: 'var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'var(--mono)' }}>
                            {formatTime(s.createdAt)} – {formatTime(s.updatedAt)}
                          </td>
                          <td style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
                            {score != null ? (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 42, height: 42, borderRadius: '50%',
                                background: score >= 75 ? 'var(--success-dim)' : score >= 50 ? 'rgba(251,191,36,0.1)' : 'var(--danger-dim)',
                                fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 'var(--fs-sm)',
                                color: score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)',
                              }}>
                                {score}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
                            {s.lastEvaluation?.diagnosisCorrect != null ? (
                              s.lastEvaluation.diagnosisCorrect ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                              )
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-state" style={{ padding: '48px 20px' }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.25, marginBottom: 12 }}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <div className="empty-state-title">
                            {search ? 'No matching sessions' : 'No session history yet'}
                          </div>
                          <div className="empty-state-desc">
                            {search
                              ? 'Try different search terms.'
                              : <><Link to="/simulator" style={{ color: 'var(--teal)' }}>Start your first case</Link> to begin building your history.</>
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
