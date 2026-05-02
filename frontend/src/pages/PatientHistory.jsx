import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function PatientHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [cases, setCases] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportLoadingId, setReportLoadingId] = useState(null);

  const downloadReport = async (sessionId) => {
    const reportWindow = window.open('about:blank', '_blank');
    if (!reportWindow) {
      alert("Please allow popups for this site to view reports.");
      return;
    }
    
    reportWindow.document.write('<html><head><title>Loading Report...</title></head><body style="font-family: sans-serif; padding: 40px; text-align: center; color: #666;"><h2>Generating clinical report...</h2><p>Please wait while we assemble your session transcript and AI evaluation.</p></body></html>');
    
    setReportLoadingId(sessionId);
    try {
      const data = await api(`/api/sessions/${sessionId}/report`);
      const reportText = data.report;
      const patient = data.patient;
      const evalData = data.evaluation;
      const messages = data.messages || [];
      
      const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      const sections = reportText.split('\n').map(line => {
        if (/^[A-Z\s\d.—\-:]{5,}$/.test(line.trim()) || /^\d+\./.test(line.trim())) {
          return `<h3 style="color:#5046a3;margin:18px 0 8px;font-size:14px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${line}</h3>`;
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return `<li style="margin:3px 0;font-size:12px;color:#333;">${line.trim().replace(/^[-•]\s*/, '')}</li>`;
        }
        if (line.includes(':') && line.indexOf(':') < 30) {
          const [key, ...rest] = line.split(':');
          return `<p style="margin:4px 0;font-size:12px;"><strong>${key}:</strong>${rest.join(':')}</p>`;
        }
        if (line.trim()) {
          return `<p style="margin:4px 0;font-size:12px;color:#333;">${line}</p>`;
        }
        return '<br/>';
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Clinical Report - ${patient.name}</title>
          <style>
            @media print { body { margin: 0; } @page { margin: 20mm; } }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 3px solid #5046a3; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #5046a3; font-size: 24px; margin: 0; }
            .header h2 { color: #666; font-size: 14px; font-weight: 400; margin: 8px 0 0; }
            .logo { font-size: 28px; font-weight: 800; color: #5046a3; margin-bottom: 4px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #666; }
            .score-box { text-align: center; background: linear-gradient(135deg, #f0edff, #e8e4ff); padding: 20px; border-radius: 12px; margin: 20px 0; }
            .score-box .score { font-size: 42px; font-weight: 800; color: #5046a3; }
            .score-box .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CURA.AI</div>
            <h1>Clinical Visit Report</h1>
            <h2>AI-Powered Virtual Patient Simulation</h2>
          </div>
          <div class="meta">
            <span><strong>Date:</strong> ${reportDate}</span>
            <span><strong>Patient:</strong> ${patient.name} (${patient.age} yrs)</span>
            <span><strong>Specialty:</strong> ${patient.specialty}</span>
          </div>
          ${evalData ? `
            <div class="score-box">
              <div class="label">Clinical Performance Score</div>
              <div class="score">${evalData.score}/100</div>
              <div style="font-size:13px;color:${evalData.diagnosisCorrect ? '#10b981' : '#ef4444'};font-weight:600;">
                ${evalData.diagnosisCorrect ? '✅ Diagnosis Correct' : '❌ Diagnosis Incorrect'}
              </div>
            </div>
          ` : ''}
          <div class="report-body">
            ${sections}
          </div>
          
          <div style="margin-top: 40px; border-top: 2px solid #5046a3; padding-top: 20px;">
            <h2 style="color: #5046a3; font-size: 18px; margin-bottom: 16px;">Chat Transcript</h2>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              ${messages.map(m => `
                <div style="margin-bottom: 12px; font-size: 13px;">
                  <span style="font-weight: 700; color: ${m.role === 'user' ? '#0284c7' : '#059669'};">
                    ${m.role === 'user' ? 'Doctor' : 'Patient'}:
                  </span>
                  <span style="color: #334155;">${m.text}</span>
                </div>
              `).join('') || '<p style="color: #64748b; font-size: 13px;">No chat history available.</p>'}
            </div>
          </div>

          <div class="footer">
            <p>Generated by CURA.AI — Virtual Patient Simulator</p>
            <p>This is a simulation report for educational purposes only. Not a real medical document.</p>
          </div>
        </body>
        </html>
      `;

      reportWindow.document.open();
      reportWindow.document.write(htmlContent);
      reportWindow.document.close();
      
      // Auto-trigger print
      setTimeout(() => reportWindow.print(), 500);
    } catch (err) {
      reportWindow.close();
      alert('Failed to generate report: ' + err.message);
    } finally {
      setReportLoadingId(null);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [hRes, cRes] = await Promise.all([
          api(`/api/users/${user.id}/sessions`),
          api('/api/cases')
        ]);

        const caseMap = {};
        cRes.cases.forEach(c => caseMap[c.id] = c);
        setCases(caseMap);
        
        // Filter out empty sessions (where user didn't ask any questions)
        const activeSessions = (hRes.sessions || []).filter(s => s.questionsAsked > 0);
        setHistory(activeSessions);
      } catch (err) {
        setError('Failed to load patient history: ' + err.message);
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
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div className="dash-section" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '30px' }}>
            <div className="dash-section-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0', color: 'var(--text)' }}>Previous Cases</h1>
              <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '0.95rem' }}>
                View details of all past virtual patients you have treated. Click on any record to view the full chat transcript and evaluation.
              </p>
            </div>

            {error && <div style={{ color: 'var(--danger)', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>Session #</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>Patient Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>Disease / Complaint</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>Time In/Out</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading history...</td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((s, idx) => {
                      const c = cases[s.caseId] || {};
                      const score = s.lastEvaluation?.score;
                      // Session number: history is ordered descending, so reverse the index
                      const sessionNumber = history.length - idx;
                      const dateObj = new Date(s.createdAt);
                      const endDateObj = new Date(s.updatedAt);
                      
                      const timeIn = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const timeOut = endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const dateStr = dateObj.toLocaleDateString();

                      return (
                        <tr 
                          key={s.id} 
                          onClick={() => downloadReport(s.id)}
                          style={{ 
                            borderBottom: '1px solid var(--border)', 
                            cursor: 'pointer', 
                            transition: 'background 0.2s',
                            opacity: reportLoadingId === s.id ? 0.5 : 1
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-alt)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          title="Click to view full chat & clinical report"
                        >
                          <td style={{ padding: '16px', fontWeight: '600', color: 'var(--primary)' }}>#{sessionNumber}</td>
                          <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>
                            {c.name || 'Unknown'}
                            {reportLoadingId === s.id && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginLeft: '8px' }}>Loading...</span>}
                          </td>
                          <td style={{ padding: '16px', color: 'var(--text)' }}>{c.complaint || c.specialty || 'N/A'}</td>
                          <td style={{ padding: '16px', color: 'var(--muted)' }}>{dateStr}</td>
                          <td style={{ padding: '16px', color: 'var(--muted)' }}>{timeIn} - {timeOut}</td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {score != null ? (
                              <span className={`score-badge ${score >= 70 ? 'score-badge--good' : score >= 40 ? 'score-badge--ok' : 'score-badge--low'}`} style={{ padding: '4px 10px', fontSize: '0.85rem' }}>{score}%</span>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                        No session history found. Go to the Simulation Lab to practice.
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
