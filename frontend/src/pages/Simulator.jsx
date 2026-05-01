import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Logo from '../components/Logo';

// Inline SVG for Send icon (from Figma export)
const SendIcon = () => (
  <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.7756 28.0113C18.8247 28.1336 18.91 28.2379 19.0201 28.3103C19.1302 28.3827 19.2598 28.4197 19.3915 28.4164C19.5233 28.413 19.6508 28.3694 19.7571 28.2915C19.8633 28.2135 19.9432 28.1049 19.9859 27.9803L28.3818 3.43851C28.4231 3.32406 28.431 3.20021 28.4045 3.08144C28.378 2.96267 28.3183 2.85389 28.2322 2.76785C28.1462 2.6818 28.0374 2.62204 27.9186 2.59556C27.7999 2.56907 27.676 2.57696 27.5616 2.6183L3.01983 11.0142C2.89518 11.0569 2.78659 11.1368 2.70863 11.243C2.63067 11.3493 2.58708 11.4768 2.58371 11.6085C2.58033 11.7403 2.61734 11.8699 2.68975 11.98C2.76217 12.0901 2.86653 12.1754 2.98883 12.2245L13.2318 16.332C13.5556 16.4616 13.8498 16.6555 14.0966 16.9019C14.3435 17.1483 14.5379 17.4422 14.6681 17.7657L18.7756 28.0113Z" stroke="white" strokeWidth="2.58334" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28.228 2.77325L14.0972 16.9028" stroke="white" strokeWidth="2.58334" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Simulator() {
  const { user, saveUser } = useAuth();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [question, setQuestion] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [lightboxImg, setLightboxImg] = useState(null);
  
  const chatLogRef = useRef(null);

  // Cardiology medical report images mapped by condition keywords
  const cardiologyReports = [
    { id: 'ecg-interpretation', title: 'ECG — 12 Lead Interpretation', image: '/reports/ecg-interpretation.png', type: 'ECG', keywords: ['acute coronary syndrome', 'myocardial infarction', 'heart attack', 'stemi', 'chest pain', 'crushing', 'pressure'] },
    { id: 'ecg-pattern-comparison', title: 'ECG — Pattern Comparison', image: '/reports/ecg-pattern-comparison.png', type: 'Reference', keywords: ['acute coronary syndrome', 'myocardial infarction', 'heart attack', 'stemi', 'chest pain', 'crushing', 'pressure', 'atrial fibrillation', 'irregular', 'palpitation', 'arrhythmia', 'afib', 'tachycardia', 'fast heart', 'anxiety', 'normal', 'baseline', 'stable'] }
  ];

  // Get relevant reports for the current cardiology case
  const getReportsForCase = (caseData) => {
    if (!caseData || caseData.specialty?.toLowerCase() !== 'cardiology') return [];
    // Use only fields that sanitizeCase sends to the frontend
    // (expectedDiagnosis is NOT sent — it's the answer key)
    const caseText = [
      caseData.complaint || '',
      caseData.summary || '',
      caseData.vitals || '',
      caseData.personality || '',
      caseData.urgency || '',
      ...(caseData.differentialDiagnoses || []),
      ...(caseData.recommendedTests || []),
      ...(caseData.redFlags || []),
      ...(caseData.hints || [])
    ].join(' ').toLowerCase();
    
    const matched = cardiologyReports.filter(report =>
      report.keywords.some(kw => caseText.includes(kw))
    );
    // Always include the available reports for any cardiology case
    const defaults = cardiologyReports;
    for (const d of defaults) {
      if (!matched.find(m => m.id === d.id)) matched.push(d);
    }
    return matched.slice(0, 4);
  };

  const activeReports = getReportsForCase(activeCase);

  // Format AI text to remove markdown stars
  const cleanMarkdown = (text) => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  };

  const downloadReport = async () => {
    if (!sessionId) return;
    setReportLoading(true);
    try {
      const data = await api(`/api/sessions/${sessionId}/report`);
      const reportText = data.report;
      const patient = data.patient;
      const evalData = data.evaluation;
      
      // Convert report text into styled HTML for PDF
      const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Parse sections from report text
      const cleanedReportText = cleanMarkdown(reportText);
      const sections = cleanedReportText.split('\n').map(line => {
        // Bold headers (lines in ALL CAPS or starting with number + dot)
        if (/^[A-Z\s\d.—\-:]{5,}$/.test(line.trim()) || /^\d+\./.test(line.trim())) {
          return `<h3 style="color:#5046a3;margin:18px 0 8px;font-size:14px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${line}</h3>`;
        }
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return `<li style="margin:3px 0;font-size:12px;color:#333;">${line.trim().replace(/^[-•]\s*/, '')}</li>`;
        }
        // Bold key-value pairs
        if (line.includes(':') && line.indexOf(':') < 30) {
          const [key, ...rest] = line.split(':');
          return `<p style="margin:4px 0;font-size:12px;"><strong>${key}:</strong>${rest.join(':')}</p>`;
        }
        // Regular text
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
          <div class="footer">
            <p>Generated by CURA.AI — Virtual Patient Simulator</p>
            <p>This is a simulation report for educational purposes only. Not a real medical document.</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window and trigger print/save as PDF
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(htmlContent);
      reportWindow.document.close();
      
      // Auto-trigger print dialog after content loads
      reportWindow.onload = () => {
        setTimeout(() => reportWindow.print(), 500);
      };
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (isEmergencyMode && timeLeft > 0 && sessionId && !evaluation) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsAssessmentModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isEmergencyMode, timeLeft, sessionId, evaluation]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const demoSpecialty = searchParams.get('demo');
  const demoUserObj = React.useMemo(() => ({ id: null, name: 'Demo User', specialization: 'Cardiology' }), []);
  const effectiveUser = user || (demoSpecialty === 'cardiology' ? demoUserObj : null);

  useEffect(() => {
    if (!effectiveUser) {
      navigate('/login');
      return;
    }

    const fetchCases = async () => {
      setGeneratingAI(true);
      try {
        const specialtyToUse = demoSpecialty === 'cardiology' ? 'Cardiology' : effectiveUser.specialization;
        const specialtyParam = specialtyToUse ? `?specialty=${encodeURIComponent(specialtyToUse)}` : '';
        const data = await api(`/api/cases${specialtyParam}`);
        
        if (data.cases && data.cases.length > 0) {
          setCases(data.cases);
          if (!activeCase) {
            loadCase(data.cases[0].id, data.cases, data.cases[0]);
          }
        } else {
          // If AI generation failed, don't leave the user stuck loading forever
          setCases([]);
          setLoading(false);
          setMessages([{ role: 'assistant', content: 'Patient generation failed. Please try "New Patient" or refresh the page.' }]);
          showToast("AI generation timed out or failed. Please try again.");
        }
      } catch (err) {
        console.error('Failed to load cases', err);
        setCases([]);
        setLoading(false);
        setMessages([{ role: 'assistant', content: 'Connection error. Please refresh.' }]);
        showToast("Error generating AI patient. Please try again.");
      } finally {
        setGeneratingAI(false);
      }
    };
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUser, navigate, demoSpecialty]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages, evaluation]);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }
  async function loadCase(caseId, caseList = cases, caseData = null) {
    setLoading(true);
    setEvaluation(null);
    setDiagnosis('');
    setReasoning('');
    setQuestion('');
    setIsAssessmentModalOpen(false);
    setTimeLeft(180);
    
    const patient = caseData || caseList.find(c => c.id === caseId);
    if (!patient) return;
    
    setActiveCase(patient);
    try {
      // For AI-generated cases, pass the full case data so the server can use it
      const payload = { userId: effectiveUser.id, caseId };
      if (caseId.startsWith('ai-')) {
        payload.caseData = patient;
      }
      
      const data = await api('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSessionId(data.session.id);
      const initialMsgs = (data.session.messages || []).map(m => ({
        role: m.role,
        content: m.text || m.content || 'Hello doctor.'
      }));
      setMessages(initialMsgs.length > 0 ? initialMsgs : [{ role: 'assistant', content: 'Hello doctor.' }]);
    } catch (err) {
      alert('Failed to start session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || !sessionId || loading) return;
    
    const userMsg = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    
    try {
      const data = await api(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: userMsg })
      });
      const replyContent = data.reply?.text || data.reply?.content || '';
      if (replyContent) {
        // Play subtle sound effect
        const audio = new Audio('/pop.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed', e));
        
        setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
      }
    } catch (err) {
      showToast('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const evaluateCase = async () => {
    if (!diagnosis.trim() || !reasoning.trim()) {
      alert("Please enter both a provisional diagnosis and clinical reasoning.");
      return;
    }
    setLoading(true);
    try {
      const data = await api(`/api/sessions/${sessionId}/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ diagnosis, reasoning })
      });
      setEvaluation(data.evaluation);
    } catch (err) {
      alert("Evaluation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHint = () => {
    if (!activeCase?.hints?.length) return;
    const asked = messages.filter(m => m.role === 'user').length;
    setQuestion(activeCase.hints[asked % activeCase.hints.length]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    saveUser(null);
    navigate('/');
  };

  if (!effectiveUser) return null;

  return (
    <div className="figma-chat-bot">
      {generatingAI && (
        <div className="ai-loading-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="typing-dots" style={{ marginBottom: '16px', transform: 'scale(1.5)' }}><span></span><span></span><span></span></div>
          <h2 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700' }}>Generating AI Patient...</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Creating a custom scenario for your specialty</p>
        </div>
      )}
      
      {/* ─── Top Navigation Bar ─── */}
      <header className="figma-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            title="Return to Dashboard"
          >
            ← Back
          </button>
          <div className="figma-chat-logo">
            <Logo size={28} dark={false} />
          </div>
        </div>

        <nav className="figma-chat-nav">
          <Link to="/" className="figma-chat-nav-btn">Home</Link>
          <Link to="/simulator" className="figma-chat-nav-btn figma-chat-nav-btn--active">Simulation Lab</Link>
          <Link to="/dashboard" className="figma-chat-nav-btn">Analytics</Link>
          <Link to="/about" className="figma-chat-nav-btn">About</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="figma-chat-avatar" onClick={handleLogout} title="Logout">
            {effectiveUser.name.substring(0, 2).toUpperCase()}
          </button>
        </div>
      </header>

      {/* ─── Main 3-Panel Workspace ─── */}
      <main className="figma-chat-workspace">
        
        {/* ── LEFT PANEL: Tests & Case Info ── */}
        <section className="figma-tests-panel">
          <div className="figma-tests-header">
            <h3>Recommended Tests</h3>
          </div>

          {activeCase?.recommendedTests?.length > 0 ? (
            <div className="figma-test-category">
              {activeCase.recommendedTests.map((test, i) => (
                <div className="figma-test-item" key={i}>
                  {test}
                </div>
              ))}
            </div>
          ) : (
            <div className="figma-test-category">
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '8px 0' }}>No tests recommended yet. Interview the patient first.</p>
            </div>
          )}


          <div className="figma-tests-actions">
            <button className="figma-test-action-btn" onClick={async () => {
              const specialtyToUse = demoSpecialty === 'cardiology' ? 'Cardiology' : effectiveUser.specialization;
              const specialtyParam = specialtyToUse ? `?specialty=${encodeURIComponent(specialtyToUse)}` : '';
              const data = await api(`/api/cases${specialtyParam}`);
              setCases(data.cases);
              if (data.cases.length > 0) loadCase(data.cases[0].id, data.cases, data.cases[0]);
            }}>🔄 New Patient</button>
            <button 
              className="figma-test-action-btn" 
              onClick={() => {
                setIsEmergencyMode(!isEmergencyMode);
                setTimeLeft(600);
              }}
              style={{ background: isEmergencyMode ? '#fef2f2' : '', borderColor: isEmergencyMode ? '#ef4444' : '', color: isEmergencyMode ? '#dc2626' : '' }}
            >
              🚨 {isEmergencyMode ? 'Emergency: ON' : 'Emergency: OFF'}
            </button>
          </div>
        </section>

        {/* ── CENTER PANEL: Chat ── */}
        <section className="figma-chat-center">
          {/* Chat Header Bar */}
          <div className="figma-chat-patient-bar">
            <div className="figma-chat-patient-info">
              {cases.length > 1 ? (
                <select 
                  value={activeCase?.id || ''} 
                  onChange={e => loadCase(e.target.value)}
                  style={{ 
                    background: 'transparent', border: 'none', fontSize: '1rem', 
                    fontWeight: 700, color: 'var(--text)', cursor: 'pointer',
                    padding: '4px 0', outline: 'none', fontFamily: 'inherit'
                  }}
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {isEmergencyMode ? 'EMERGENCY' : c.specialty}</option>
                  ))}
                </select>
              ) : (
                <h3>{activeCase?.name || 'Select Patient'}</h3>
              )}
            </div>
            <div className="figma-chat-specialty-badge">
              {isEmergencyMode ? 'EMERGENCY' : (activeCase?.specialty || effectiveUser.specialization || 'General')}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="figma-chat-messages" ref={chatLogRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`figma-msg ${m.role === 'user' ? 'figma-msg--doctor' : 'figma-msg--patient'}`}>
                <div className="figma-msg-bubble">
                  {m.content}
                </div>
              </div>
            ))}
            {loading && !evaluation && (
              <div className="figma-msg figma-msg--patient">
                <div className="figma-msg-bubble">
                  <div className="typing-dots"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
          </div>

          {/* Scrollbar decorative (matches Figma) */}
          <div className="figma-chat-scrollbar-deco">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.95468 1.05126C3.70999 -0.350415 5.72067 -0.350413 6.47598 1.05126L9.18855 6.08516C9.90657 7.41764 8.94152 9.03391 7.4279 9.03391H2.00276C0.489141 9.03391 -0.475905 7.41764 0.242115 6.08516L2.95468 1.05126Z" fill="#6B7280" fillOpacity="0.61"/></svg>
            <div className="figma-chat-scroll-track"></div>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.95468 1.05126C3.70999 -0.350415 5.72067 -0.350413 6.47598 1.05126L9.18855 6.08516C9.90657 7.41764 8.94152 9.03391 7.4279 9.03391H2.00276C0.489141 9.03391 -0.475905 7.41764 0.242115 6.08516L2.95468 1.05126Z" fill="#6B7280" fillOpacity="0.61"/></svg>
          </div>
        </section>

        {/* ── RIGHT PANEL: Patient Data ── */}
        <section className="figma-patient-panel">
          {/* Patient Summary Card */}
          <div className="figma-patient-summary">
            <div className="figma-patient-age">
              {activeCase?.age || '—'} Years {activeCase?.gender === 'Female' ? '♀' : '♂'}
            </div>
            <div className="figma-patient-state">
              <span className="figma-state-badge" style={{ 
                background: activeCase?.urgency?.includes('critical') || activeCase?.urgency?.includes('Urgent') 
                  ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                color: activeCase?.urgency?.includes('critical') || activeCase?.urgency?.includes('Urgent') 
                  ? '#dc2626' : '#059669'
              }}>
                {activeCase?.urgency || 'Stable State'}
              </span>
            </div>
            {!isEmergencyMode && (
              <div className="figma-patient-traits">
                {activeCase?.personality || 'Loading...'}
              </div>
            )}
            {!isEmergencyMode && activeCase?.complexity && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Complexity: <strong>{activeCase.complexity}</strong>
              </div>
            )}
            {activeCase?.vitals && (
              <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(138,124,255,0.06)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--text)', fontSize: '0.8rem' }}>Vitals:</strong><br/>
                {activeCase.vitals}
              </div>
            )}
            {isEmergencyMode && (
              <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem', width: '100%' }}>
                ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Patient Reports — Cardiology images */}
          {activeReports.length > 0 && (
            <div style={{ marginTop: '12px', padding: '0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem' }}>📋</span> Patient Reports
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeReports.map(report => (
                  <div 
                    key={report.id}
                    onClick={() => setLightboxImg(report)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      background: 'var(--surface)',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(138,124,255,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                  >
                    <img 
                      src={report.image} 
                      alt={report.title}
                      style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)', lineHeight: '1.3' }}>{report.title}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{report.type} • Click to view</div>
                      </div>
                      <span style={{ fontSize: '1rem', opacity: 0.5 }}>🔍</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint & Abort Buttons */}
          <div className="figma-patient-actions">
            <button className="figma-hint-btn" onClick={handleHint}>Hints</button>
            <button className="figma-abort-btn" onClick={() => activeCase && loadCase(activeCase.id)}>Abort case</button>
          </div>

          {/* Make Diagnosis Button */}
          <div className="figma-diagnosis-dock">
            <button 
              className="figma-diagnosis-btn" 
              onClick={() => setIsAssessmentModalOpen(true)}
            >
              {evaluation ? 'View Report' : 'Make Diagnosis'}
            </button>
          </div>
        </section>
      </main>

      {/* ─── Bottom Chat Input Bar ─── */}
      {!evaluation && (
        <div className="figma-chat-input-bar">
          <form onSubmit={sendMessage} className="figma-chat-input-form">
            <input
              type="text"
              className="figma-chat-input"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Write your question here..."
            />
            <button 
              type="submit" 
              className="figma-chat-send-btn" 
              disabled={loading || !question.trim()}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      {/* ─── Assessment & Feedback Modal ─── */}
      {isAssessmentModalOpen && (
        <div className="modal-overlay is-visible">
          <div className="modal-backdrop" onClick={() => setIsAssessmentModalOpen(false)}></div>
          <div className="modal-content" style={{ width: 'min(600px, calc(100% - 40px))' }}>
            <div className="modal-header">
              <h2>{evaluation ? 'Feedback Report' : 'Submit Diagnosis'}</h2>
              <button onClick={() => setIsAssessmentModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted)' }}>&times;</button>
            </div>

            {!evaluation ? (
              <div className="assessment-form">
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Review your patient interaction and submit your final clinical assessment.</p>
                <div className="sim-field">
                  <label>Provisional Diagnosis</label>
                  <input 
                    type="text" 
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. Community-acquired pneumonia" 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', marginBottom: '16px' }}
                  />
                </div>
                <div className="sim-field">
                  <label>Clinical Reasoning</label>
                  <textarea 
                    value={reasoning}
                    onChange={e => setReasoning(e.target.value)}
                    disabled={loading}
                    placeholder="Explain symptoms, risk factors, and logic behind your diagnosis." 
                    rows="4"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', marginBottom: '24px', resize: 'vertical' }}
                  />
                </div>
                <button onClick={evaluateCase} disabled={loading} className="figma-diagnosis-btn" style={{ width: '100%' }}>
                  {loading ? 'Evaluating...' : 'Submit & Evaluate'}
                </button>
              </div>
            ) : (
              <div className="feedback-container">
                <div className="score-ring-container" style={{ textAlign: 'center', padding: '20px', background: 'var(--bg)', borderRadius: '16px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 'bold' }}>SESSION SCORE</p>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', margin: '10px 0' }}>{evaluation.score}%</div>
                  <p style={{ fontSize: '0.9rem' }}>{cleanMarkdown(evaluation.feedbackSummary) || (evaluation.score >= 70 ? "Strong clinical performance." : "Good effort — keep practicing.")}</p>
                </div>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <article style={{ background: evaluation.diagnosisCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {evaluation.diagnosisCorrect ? '✅ Diagnosis Correct' : '❌ Diagnosis Incorrect'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Likely diagnosis: <strong>{cleanMarkdown(evaluation.likelyDiagnosis) || "Check rubric for standard"}</strong>.</p>
                  </article>
                  
                  {evaluation.strengths?.length > 0 && (
                    <article style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>💪 Strengths</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--muted)' }}>{evaluation.strengths.map((s,i) => <li key={i}>{cleanMarkdown(s)}</li>)}</ul>
                    </article>
                  )}
                  
                  {evaluation.improvements?.length > 0 && (
                    <article style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#d97706' }}>⚠️ Improve</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--muted)' }}>{evaluation.improvements.map((s,i) => <li key={i}>{cleanMarkdown(s)}</li>)}</ul>
                    </article>
                  )}
                  
                  {evaluation.expectedQuestionsMissed?.length > 0 && (
                    <article style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>❓ Should Ask</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--muted)' }}>{evaluation.expectedQuestionsMissed.map((s,i) => <li key={i}>{cleanMarkdown(s)}</li>)}</ul>
                    </article>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button onClick={downloadReport} disabled={reportLoading} className="figma-diagnosis-btn" style={{ flex: 1, fontSize: '16px' }}>
                    {reportLoading ? 'Generating...' : '📄 Download'}
                  </button>
                  <button onClick={() => { setIsAssessmentModalOpen(false); activeCase && loadCase(activeCase.id); }} className="figma-test-action-btn" style={{ flex: 1, fontSize: '16px' }}>Retry Case</button>
                  <button onClick={() => navigate('/dashboard')} className="figma-test-action-btn" style={{ flex: 1, fontSize: '16px' }}>Dashboard</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Error / Status Toast ─── */}
      {toastMessage && (
        <div className="figma-toast" style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 10000, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontWeight: '500', animation: 'fadeInUp 0.3s ease-out' }}>
          {toastMessage}
        </div>
      )}
      {/* ─── Report Image Lightbox ─── */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 20000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'fadeInUp 0.25s ease-out'
          }}
        >
          <div style={{ 
            background: 'white', borderRadius: '16px', overflow: 'hidden',
            maxWidth: '900px', width: '100%', maxHeight: '85vh',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 100%)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{lightboxImg.title}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>{lightboxImg.type} Report • For educational simulation only</p>
              </div>
              <button 
                onClick={() => setLightboxImg(null)}
                style={{ 
                  background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '8px',
                  width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#374151', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              >✕</button>
            </div>
            <div style={{ overflow: 'auto', padding: '16px', display: 'flex', justifyContent: 'center', background: '#fafafa' }}>
              <img 
                src={lightboxImg.image} 
                alt={lightboxImg.title}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
