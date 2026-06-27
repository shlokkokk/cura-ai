import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { api } from '../utils/api';
import Logo from '../components/Logo';

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const MicIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#EF4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const HintIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

function parseVitals(vitalsStr) {
  if (!vitalsStr) return [];
  const patterns = [
    { key: 'HR',   regex: /HR[:\s]+(\d+)/i,              unit: 'bpm' },
    { key: 'BP',   regex: /BP[:\s]+([\d/]+)/i,           unit: 'mmHg' },
    { key: 'SpO₂', regex: /SpO[2₂][:\s]+(\d+)%?/i,      unit: '%' },
    { key: 'Temp', regex: /Temp[:\s]+([\d.]+)[°C]?/i,    unit: '°C' },
    { key: 'RR',   regex: /RR[:\s]+(\d+)/i,              unit: '/min' },
  ];
  return patterns
    .map(({ key, regex, unit }) => {
      const m = vitalsStr.match(regex);
      return m ? { key, val: m[1], unit } : null;
    })
    .filter(Boolean);
}

const formatTime = (s) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="65" cy="65" r={r} stroke="var(--surface-3)" strokeWidth="10" fill="none" />
        <circle cx="65" cy="65" r={r} stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, fontFamily: 'var(--mono)', color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          / 100
        </div>
      </div>
    </div>
  );
}

function TestItem({ name, ordered, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`test-item${ordered ? ' ordered' : ''}`}
    >
      <div className="test-checkbox">
        {ordered && <CheckIcon />}
      </div>
      <span style={{ fontSize: 'var(--fs-xs)' }}>{name}</span>
    </button>
  );
}

export default function Simulator() {
  const { user } = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();

  const [cases,                setCases]                = useState([]);
  const [activeCase,           setActiveCase]           = useState(null);
  const [sessionId,            setSessionId]            = useState(null);
  const [messages,             setMessages]             = useState([]);
  const [loading,              setLoading]              = useState(false);
  const [generatingAI,         setGeneratingAI]         = useState(false);
  const [question,             setQuestion]             = useState('');
  const [diagnosis,            setDiagnosis]            = useState('');
  const [reasoning,            setReasoning]            = useState('');
  const [evaluation,           setEvaluation]           = useState(null);
  const [isAssessmentModalOpen,setIsAssessmentModalOpen]= useState(false);
  const [reportLoading,        setReportLoading]        = useState(false);
  const [toastMessage,         setToastMessage]         = useState(null);
  const [isEmergencyMode,      setIsEmergencyMode]      = useState(false);
  const [timeLeft,             setTimeLeft]             = useState(600);
  const [lightboxImg,          setLightboxImg]          = useState(null);

  const [orderedTests,  setOrderedTests]  = useState(new Set());
  const [listening,     setListening]     = useState(false);
  const [toastType,     setToastType]     = useState('info'); // 'info' | 'error' | 'success'
  const [activeTab,     setActiveTab]     = useState('chat'); // 'chat' | 'tests' | 'profile'
  const [isKeyboardOpen,setIsKeyboardOpen]= useState(false);
  const [visualViewportHeight, setVisualViewportHeight] = useState(null);

  const chatLogRef = useRef(null);
  const inputRef   = useRef(null);
  const recognitionRef = useRef(null);

  const cardiologyReports = [
    { id: 'ecg-interpretation', title: 'ECG — 12 Lead Interpretation', image: '/reports/ecg-interpretation.png', type: 'ECG', keywords: ['acute coronary syndrome', 'myocardial infarction', 'heart attack', 'stemi', 'chest pain', 'crushing', 'pressure'] },
    { id: 'ecg-pattern-comparison', title: 'ECG — Pattern Comparison', image: '/reports/ecg-pattern-comparison.png', type: 'Reference', keywords: ['acute coronary syndrome', 'myocardial infarction', 'heart attack', 'stemi', 'chest pain', 'crushing', 'pressure', 'atrial fibrillation', 'irregular', 'palpitation', 'arrhythmia', 'afib', 'tachycardia', 'fast heart', 'anxiety', 'normal', 'baseline', 'stable'] }
  ];

  const getReportsForCase = (caseData) => {
    if (!caseData || caseData.specialty?.toLowerCase() !== 'cardiology') return [];
    const caseText = [
      caseData.complaint || '', caseData.summary || '', caseData.vitals || '',
      caseData.personality || '', caseData.urgency || '',
      ...(caseData.differentialDiagnoses || []), ...(caseData.recommendedTests || []),
      ...(caseData.redFlags || []), ...(caseData.hints || [])
    ].join(' ').toLowerCase();
    const matched = cardiologyReports.filter(r => r.keywords.some(kw => caseText.includes(kw)));
    const defaults = cardiologyReports;
    for (const d of defaults) {
      if (!matched.find(m => m.id === d.id)) matched.push(d);
    }
    return matched.slice(0, 4);
  };

  const activeReports = getReportsForCase(activeCase);

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
      const patient    = data.patient;
      const evalData   = data.evaluation;
      const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const cleanedReportText = cleanMarkdown(reportText);
      const sections = cleanedReportText.split('\n').map(line => {
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
          .header h1 { color: #8A7CFF; font-size: 24px; margin: 0; }
          .logo { font-size: 28px; font-weight: 800; color: #8A7CFF; margin-bottom: 4px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #666; }
          .score-box { text-align: center; background: linear-gradient(135deg, #f0fff8, #e0faf5); padding: 20px; border-radius: 12px; margin: 20px 0; }
          .score-box .score { font-size: 42px; font-weight: 800; color: #8A7CFF; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 10px; color: #999; }
        </style></head><body>
        <div class="header"><div class="logo">CURA.AI</div><h1>Clinical Visit Report</h1><h2>AI-Powered Virtual Patient Simulation</h2></div>
        <div class="meta"><span><strong>Date:</strong> ${reportDate}</span><span><strong>Patient:</strong> ${patient.name} (${patient.age} yrs)</span><span><strong>Specialty:</strong> ${patient.specialty}</span></div>
        ${evalData ? `<div class="score-box"><div class="label">Score</div><div class="score">${evalData.score}/100</div><div style="font-size:13px;color:${evalData.diagnosisCorrect ? '#059669' : '#dc2626'};font-weight:600;">${evalData.diagnosisCorrect ? 'Diagnosis Correct' : 'Diagnosis Incorrect'}</div></div>` : ''}
        <div>${sections}</div>
        <div class="footer"><p>Generated by CURA.AI — Virtual Patient Simulator</p><p>Educational simulation only. Not a real medical document.</p></div>
        </body></html>`;

      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(htmlContent);
      reportWindow.document.close();
      reportWindow.onload = () => setTimeout(() => reportWindow.print(), 500);
    } catch (err) {
      showToast('Failed to generate report: ' + err.message, 'error');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (isEmergencyMode && timeLeft > 0 && sessionId && !evaluation) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); setIsAssessmentModalOpen(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isEmergencyMode, timeLeft, sessionId, evaluation]);

  const searchParams = new URLSearchParams(location.search);
  const demoSpecialty = searchParams.get('demo');
  const demoUserObj = React.useMemo(() => ({ id: null, name: 'Demo User', specialization: 'Cardiology' }), []);
  const effectiveUser = user || (demoSpecialty ? demoUserObj : null);

  useEffect(() => {
    if (!effectiveUser) { navigate('/login'); return; }

    const fetchCases = async () => {
      setGeneratingAI(true);
      try {
        const specialtyToUse = demoSpecialty ? demoSpecialty.charAt(0).toUpperCase() + demoSpecialty.slice(1) : effectiveUser.specialization;
        const specialtyParam = specialtyToUse ? `?specialty=${encodeURIComponent(specialtyToUse)}` : '';
        const data = await api(`/api/cases${specialtyParam}`);
        if (data.cases && data.cases.length > 0) {
          setCases(data.cases);
          if (!activeCase) loadCase(data.cases[0].id, data.cases, data.cases[0]);
        } else {
          setCases([]);
          setLoading(false);
          setMessages([{ role: 'assistant', content: 'Patient generation failed. Please try "New Patient" or refresh.' }]);
          showToast('AI generation failed. Please try again.', 'error');
        }
      } catch (err) {
        console.error('Failed to load cases', err);
        setCases([]);
        setLoading(false);
        setMessages([{ role: 'assistant', content: 'Connection error. Please refresh.' }]);
        showToast('Error connecting to AI. Please try again.', 'error');
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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return undefined;

    const updateViewport = () => {
      if (!isMobileViewport()) {
        setVisualViewportHeight(null);
        setIsKeyboardOpen(false);
        return;
      }

      const viewportHeight = window.visualViewport.height;
      setVisualViewportHeight(viewportHeight);
      setIsKeyboardOpen(window.innerHeight - viewportHeight > 120);
    };

    updateViewport();
    window.visualViewport.addEventListener('resize', updateViewport);
    window.visualViewport.addEventListener('scroll', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.visualViewport.removeEventListener('resize', updateViewport);
      window.visualViewport.removeEventListener('scroll', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  function showToast(msg, type = 'info') {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function pickNextCase(caseList, currentCaseId = activeCase?.id) {
    if (!Array.isArray(caseList) || caseList.length === 0) return null;
    const differentCases = caseList.filter(c => c.id !== currentCaseId);
    if (differentCases.length === 0) return caseList[0];

    const aiCases = differentCases.filter(c => c.id?.startsWith('ai-'));
    const pool = aiCases.length > 0 ? aiCases : differentCases;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  async function loadCase(caseId, caseList = cases, caseData = null) {
    setLoading(true);
    setEvaluation(null);
    setDiagnosis('');
    setReasoning('');
    setQuestion('');
    setIsAssessmentModalOpen(false);
    setTimeLeft(600);
    setOrderedTests(new Set());

    const patient = caseData || caseList.find(c => c.id === caseId);
    if (!patient) return;
    setActiveCase(patient);
    try {
      const payload = { userId: effectiveUser.id, caseId };
      if (caseId.startsWith('ai-')) payload.caseData = patient;
      const data = await api('/api/sessions', { method: 'POST', body: JSON.stringify(payload) });
      setSessionId(data.session.id);
      const initialMsgs = (data.session.messages || []).map(m => ({
        role: m.role, content: m.text || m.content || 'Hello doctor.',
      }));
      setMessages(initialMsgs.length > 0 ? initialMsgs : [{ role: 'assistant', content: 'Hello doctor.' }]);
    } catch (err) {
      showToast('Failed to start session: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

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
        body: JSON.stringify({ message: userMsg }),
      });
      const replyContent = data.reply?.text || data.reply?.content || '';
      if (replyContent) {
        const audio = new Audio('/pop.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
        setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
      }
    } catch (err) {
      showToast('Network error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const evaluateCase = async () => {
    if (!diagnosis.trim() || !reasoning.trim()) {
      showToast('Please enter a diagnosis and reasoning before submitting.', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await api(`/api/sessions/${sessionId}/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ diagnosis, reasoning }),
      });
      setEvaluation(data.evaluation);
    } catch (err) {
      showToast('Evaluation failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHint = () => {
    if (!activeCase?.hints?.length) {
      showToast('No hints available for this case.', 'info');
      return;
    }
    const asked = messages.filter(m => m.role === 'user').length;
    const cameFromMobileDrawer = isMobileViewport() && activeTab !== 'chat';
    setQuestion(activeCase.hints[asked % activeCase.hints.length]);
    if (isMobileViewport()) setActiveTab('chat');
    if (!cameFromMobileDrawer) {
      window.setTimeout(() => inputRef.current?.focus(), 140);
    }

  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewPatient = async () => {
    const mobile = isMobileViewport();
    if (mobile) {
      document.activeElement?.blur();
      setIsKeyboardOpen(false);
      setActiveTab('chat');
      await new Promise(resolve => window.setTimeout(resolve, 180));
    }

    setGeneratingAI(true);
    try {
      const specialtyToUse = demoSpecialty
        ? demoSpecialty.charAt(0).toUpperCase() + demoSpecialty.slice(1)
        : effectiveUser.specialization;
      const params = new URLSearchParams();
      if (specialtyToUse) params.set('specialty', specialtyToUse);
      params.set('fresh', 'true');
      if (activeCase?.id) params.set('exclude', activeCase.id);

      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await api(`/api/cases${query}`);
      const nextCases = data.cases || [];
      setCases(nextCases);
      const nextCase = pickNextCase(nextCases);
      if (nextCase) {
        await loadCase(nextCase.id, nextCases, nextCase);
        if (isMobileViewport()) setActiveTab('chat');
      } else {
        showToast('No patient cases available for this specialty yet.', 'info');
      }
    } catch (err) {
      showToast('Failed to generate new patient: ' + err.message, 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Voice input not supported in this browser.', 'info'); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const initialText = question;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (e) => {
      let finalTranscript = '';
      for (let i = 0; i < e.results.length; ++i) {
        finalTranscript += e.results[i][0].transcript;
      }
      setQuestion(initialText ? initialText + ' ' + finalTranscript : finalTranscript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (err) => {
      setListening(false);
      if (err.error !== 'no-speech' && err.error !== 'aborted') {
        const message = err.error === 'network'
          ? 'Voice dictation is blocked by this browser or network. You can keep typing or try Chrome with microphone permission.'
          : 'Voice input failed: ' + err.error;
        showToast(message, err.error === 'network' ? 'info' : 'error');
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      showToast('Voice input could not start. Check microphone permission and try again.', 'info');
    }
  };

  const vitals = parseVitals(activeCase?.vitals);
  const isUrgent = activeCase?.urgency?.toLowerCase().includes('critical') ||
    activeCase?.urgency?.toLowerCase().includes('urgent');
  const patientInitials = activeCase?.name
    ? activeCase.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  if (!effectiveUser) return null;

  return (
    <div
      className={`sim-shell ${isKeyboardOpen ? 'keyboard-open' : ''} ${generatingAI ? 'is-generating' : ''}`}
      style={visualViewportHeight ? { '--sim-vvh': `${visualViewportHeight}px` } : undefined}
    >

      {generatingAI && (
        <div className="page-loading sim-loading-overlay">
          <div className="sim-loading-card">
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--r-lg)',
              background: 'var(--teal-dim)', border: '1px solid rgba(0,201,177,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
            <div className="spinner-lg" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--text)' }}>
            Generating AI Patient
          </div>
          <div className="page-loading-label">
            Creating a unique case for {effectiveUser.specialization || 'your specialty'}...
          </div>
          </div>
        </div>
      )}

      <header className="sim-header">
        <div className="sim-header-left" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="btn btn-ghost btn-sm"
            style={{ gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {user ? 'Dashboard' : 'Home'}
          </button>
          <div className="sim-header-divider" style={{ width: 1, height: 20, background: 'var(--border-md)' }} />
          <Logo size={24} />
        </div>

        {/* Patient info in header */}
        {activeCase && (
          <div className="sim-header-patient" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="sim-header-patient-avatar" style={{
              width: 32, height: 32, borderRadius: 'var(--r-sm)',
              background: 'var(--teal-dim)', border: '1px solid rgba(0,201,177,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--teal)',
            }}>
              {patientInitials}
            </div>
            <div className="sim-header-patient-copy">
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text)', lineHeight: 1.2 }}>
                {activeCase.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                {activeCase.age}y · {activeCase.gender} · {activeCase.specialty}
              </div>
            </div>
            {isUrgent && (
              <div className="badge badge-danger sim-header-urgency">
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
                {activeCase.urgency}
              </div>
            )}
          </div>
        )}

        {/* Right actions */}
        <div className="sim-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isEmergencyMode && (
            <div className="emergency-timer" style={{ fontSize: 'var(--fs-lg)' }}>
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => { setIsEmergencyMode(e => !e); setTimeLeft(600); }}
            className={`btn btn-sm sim-emergency-btn ${isEmergencyMode ? 'btn-danger' : 'btn-outline'}`}
            title="Toggle Emergency Mode"
          >
            <ZapIcon />
            Emergency
          </button>
          {!evaluation && (
            <button
              onClick={() => setIsAssessmentModalOpen(true)}
              className="btn btn-primary btn-sm sim-diagnosis-btn"
              disabled={!sessionId || messages.length < 2}
            >
              Make Diagnosis
            </button>
          )}
          {evaluation && (
            <button onClick={() => setIsAssessmentModalOpen(true)} className="btn btn-primary btn-sm sim-diagnosis-btn">
              View Feedback
            </button>
          )}
          {/* User avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--teal-dim)', border: '1.5px solid rgba(0,201,177,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--mono)',
            cursor: 'pointer',
          }}
            title={effectiveUser.name}
            onClick={() => user ? navigate('/dashboard') : navigate('/')}
          >
            {effectiveUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="sim-mobile-tabs">
        <button 
          className={`sim-mobile-tab ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          Investigations
        </button>
        <button 
          className={`sim-mobile-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Consultation
        </button>
        <button 
          className={`sim-mobile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Patient Profile
        </button>
      </div>

      {activeTab !== 'chat' && (
        <button
          className="sim-mobile-drawer-scrim"
          type="button"
          aria-label="Close side panel"
          onClick={() => setActiveTab('chat')}
        />
      )}

      <div className="sim-workspace">

        <div className={`sim-panel sim-panel-left ${activeTab === 'tests' ? 'mobile-active' : ''}`}>
          <div className="sim-panel-header sim-sheet-header"><span>Recommended Tests</span><button type="button" className="sim-sheet-close" onClick={() => setActiveTab('chat')} aria-label="Close investigations"><XIcon /></button></div>

          <div className="sim-panel-body">
            {/* New Patient button */}
            <button
              onClick={handleNewPatient}
              className="btn btn-outline btn-sm w-full"
              disabled={generatingAI}
              style={{ marginBottom: 12, gap: 6 }}
            >
              <RefreshIcon />
              New Patient
            </button>

            {/* Test list */}
            {activeCase?.recommendedTests?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activeCase.recommendedTests.map((test, i) => (
                  <TestItem
                    key={i}
                    name={test}
                    ordered={orderedTests.has(i)}
                    onToggle={() => setOrderedTests(prev => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    })}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px 0', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Interview the patient to reveal recommended investigations.
              </div>
            )}

            {/* Complexity/urgency */}
            {activeCase && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {activeCase.complexity && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                      Complexity
                    </div>
                    <div className={`badge ${activeCase.complexity.toLowerCase() === 'high' ? 'badge-danger' : activeCase.complexity.toLowerCase() === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                      {activeCase.complexity}
                    </div>
                  </div>
                )}
                {activeCase.differentialDiagnoses?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                      Consider
                    </div>
                    {activeCase.differentialDiagnoses.slice(0, 4).map((d, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 3, paddingLeft: 8, borderLeft: '2px solid var(--border-md)' }}>
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`sim-panel sim-panel-center ${activeTab === 'chat' ? 'mobile-active' : ''}`}>
          {/* Patient selector bar */}
          <div className="chat-patient-bar">
            {cases.length > 1 ? (
              <label className="chat-patient-switcher" aria-label="Switch patient case">
                <select
                  className="chat-patient-selector"
                  value={activeCase?.id || ''}
                  onChange={e => loadCase(e.target.value)}
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {isEmergencyMode ? 'EMERGENCY' : c.specialty}
                    </option>
                  ))}
                </select>
                <span className="chat-patient-switcher-main">
                  <span className="chat-patient-switcher-title">
                    {activeCase?.name || 'Waiting for patient'} - {isEmergencyMode ? 'Emergency' : activeCase?.specialty}
                  </span>
                  <span className="chat-patient-switcher-hint">Switch patient</span>
                </span>
                <span className="chat-patient-switcher-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </label>
            ) : (
              <span style={{ fontWeight: 700, fontSize: 'var(--fs-base)', color: 'var(--text)' }}>
                {activeCase?.name || 'Waiting for patient...'}
              </span>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isEmergencyMode && (
                <div className="badge badge-danger">
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite' }} />
                  Emergency Mode
                </div>
              )}
              {messages.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                  {messages.filter(m => m.role === 'user').length} questions asked
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div ref={chatLogRef} className="chat-area">
            {messages.map((m, idx) => {
              const isDoc = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`chat-msg ${isDoc ? 'chat-msg-doctor' : 'chat-msg-patient'}`}
                  style={{ animation: 'slideUp 200ms var(--ease)' }}
                >
                  <div className={`chat-avatar ${isDoc ? 'chat-avatar-doctor' : 'chat-avatar-patient'}`}>
                    {isDoc
                      ? effectiveUser.name.charAt(0).toUpperCase()
                      : patientInitials
                    }
                  </div>
                  <div>
                    <div className={`chat-bubble ${isDoc ? 'chat-bubble-doctor' : 'chat-bubble-patient'}`}>
                      {cleanMarkdown(m.content)}
                    </div>
                    <div className={`chat-time`} style={{ textAlign: isDoc ? 'right' : 'left' }}>
                      {isDoc ? (effectiveUser.name?.split(' ')[0] || 'Doctor') : (activeCase?.name?.split(' ')[0] || 'Patient')}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && !evaluation && (
              <div className="chat-msg chat-msg-patient">
                <div className="chat-avatar chat-avatar-patient">{patientInitials}</div>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          {!evaluation && (
            <div className="chat-input-dock">
              <form onSubmit={sendMessage} className={`chat-input-form ${listening ? 'recording-active' : ''}`}>
                <button
                  type="button"
                  onClick={handleHint}
                  className="btn btn-ghost btn-sm chat-tool-btn"
                  title="Get a hint question"
                  style={{ padding: '6px', flexShrink: 0, color: 'var(--text-muted)' }}
                >
                  <HintIcon />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  name="patient-question"
                  autoComplete="off"
                  autoCorrect="on"
                  enterKeyHint="send"
                  className="chat-input"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (isMobileViewport()) setIsKeyboardOpen(true); }}
                  onBlur={() => window.setTimeout(() => setIsKeyboardOpen(false), 120)}
                  disabled={loading || !sessionId}
                  placeholder={listening ? 'Listening...' : 'Ask the patient a question...'}
                />

                {/* Voice button */}
                <button
                  type="button"
                  onClick={handleVoice}
                  className="btn btn-ghost btn-sm chat-tool-btn"
                  title="Voice input (Chrome/Edge)"
                  style={{
                    padding: '6px', flexShrink: 0,
                    color: listening ? '#EF4444' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {listening && (
                    <div className="recording-dot" style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#EF4444',
                      animation: 'pulseRed 1.2s infinite'
                    }} />
                  )}
                  <MicIcon active={listening} />
                </button>

                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={loading || !question.trim() || !sessionId}
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          )}

          {/* Post-evaluation action bar */}
          {evaluation && (
            <div className="chat-input-dock">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>
                  Session complete.{' '}
                  <span style={{ color: evaluation.diagnosisCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    Score: {evaluation.score}/100
                  </span>
                </div>
                <button onClick={handleNewPatient} className="btn btn-outline btn-sm" style={{ gap: 6 }}>
                  <RefreshIcon /> New Patient
                </button>
                <button onClick={downloadReport} disabled={reportLoading} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                  <DownloadIcon /> {reportLoading ? 'Generating...' : 'Download Report'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`sim-panel sim-panel-right ${activeTab === 'profile' ? 'mobile-active' : ''}`}>
          <div className="sim-panel-header sim-sheet-header"><span>Patient Profile</span><button type="button" className="sim-sheet-close" onClick={() => setActiveTab('chat')} aria-label="Close patient profile"><XIcon /></button></div>

          <div className="sim-panel-body">
            {/* Patient card */}
            {activeCase ? (
              <>
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <div
                    className={`patient-avatar-lg ${isUrgent ? 'critical' : ''}`}
                    style={{ margin: '0 auto 8px' }}
                  >
                    {patientInitials}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--fs-base)', color: 'var(--text)' }}>
                    {activeCase.name}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                    {activeCase.age} years · {activeCase.gender}
                  </div>
                </div>

                {/* Urgency badge */}
                {activeCase.urgency && (
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div className={`badge ${isUrgent ? 'badge-danger' : 'badge-success'}`}>
                      {activeCase.urgency}
                    </div>
                  </div>
                )}

                {/* Emergency timer */}
                {isEmergencyMode && (
                  <div className="emergency-banner" style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--danger)' }}>TIME REMAINING</div>
                    <div className={`emergency-timer ${timeLeft < 60 ? 'critical' : ''}`}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                )}

                {/* Vitals monitor */}
                {vitals.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Vitals
                    </div>
                    <div className="vitals-grid">
                      {vitals.map(({ key, val, unit }, index) => {
                        const isCritical = (key === 'HR' && (parseInt(val) > 120 || parseInt(val) < 50)) ||
                          (key === 'SpO₂' && parseInt(val) < 94) ||
                          (key === 'Temp' && parseFloat(val) > 39);
                        const isLastAndOdd = index === vitals.length - 1 && vitals.length % 2 !== 0;
                        return (
                          <div
                            key={key}
                            className={`vital-item${isCritical ? ' vital-critical' : ''}`}
                            style={isLastAndOdd ? { gridColumn: 'span 2' } : {}}
                          >
                            <div className="vital-value" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
                              <span>{val}</span>
                              <span className="vital-unit" style={{ fontSize: '10px', color: 'var(--text-2)', opacity: 0.85, fontFamily: 'var(--mono)', fontWeight: 500 }}>{unit}</span>
                            </div>
                            <div className="vital-label" style={{ marginTop: 4 }}>{key}</div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Vitals string fallback for non-parsed */}
                    {vitals.length < 2 && (
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'var(--mono)' }}>
                        {activeCase.vitals}
                      </div>
                    )}
                  </div>
                )}

                {/* Personality / presentation */}
                {activeCase.personality && !isEmergencyMode && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                      Presentation
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{activeCase.personality}"
                    </div>
                  </div>
                )}

                {/* Patient reports (cardiology) */}
                {activeReports.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Patient Reports
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {activeReports.map(report => (
                        <div
                          key={report.id}
                          className="report-thumb"
                          onClick={() => setLightboxImg(report)}
                        >
                          <img src={report.image} alt={report.title} />
                          <div className="report-thumb-info">
                            <div>
                              <div className="report-thumb-title">{report.title}</div>
                              <div className="report-thumb-type">{report.type} · Click to view</div>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={handleHint} className="btn btn-outline btn-sm w-full" style={{ gap: 6 }}>
                    <HintIcon /> Hint
                  </button>
                  <button
                    onClick={() => activeCase && loadCase(activeCase.id)}
                    className="btn btn-ghost btn-sm w-full"
                    style={{ gap: 6, color: 'var(--text-muted)' }}
                  >
                    <RefreshIcon /> Restart Case
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '40px 12px' }}>
                <div style={{ opacity: 0.3, marginBottom: 12 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>Loading patient...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAssessmentModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{evaluation ? 'Session Feedback' : 'Submit Diagnosis'}</h2>
              <button className="btn-icon" onClick={() => setIsAssessmentModalOpen(false)} aria-label="Close">
                <XIcon />
              </button>
            </div>

            {!evaluation ? (
              <div className="modal-body">
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
                  Review your patient interaction and submit your final clinical assessment.
                  Be specific — both the diagnosis and reasoning are scored.
                </p>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label htmlFor="diagnosis">Provisional Diagnosis *</label>
                  <input
                    id="diagnosis"
                    type="text"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. STEMI — Anterior wall myocardial infarction"
                  />
                </div>

                <div className="field" style={{ marginBottom: 24 }}>
                  <label htmlFor="reasoning">Clinical Reasoning *</label>
                  <textarea
                    id="reasoning"
                    value={reasoning}
                    onChange={e => setReasoning(e.target.value)}
                    disabled={loading}
                    placeholder="Describe the key symptoms, findings, and the logic behind your diagnosis..."
                    rows={5}
                  />
                </div>

                <button
                  onClick={evaluateCase}
                  disabled={loading || !diagnosis.trim() || !reasoning.trim()}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Evaluating with AI...</>
                  ) : 'Submit & Evaluate'}
                </button>
              </div>
            ) : (
              <div className="modal-body">
                {/* Score */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <ScoreRing score={evaluation.score} />
                  <div style={{ marginTop: 12, fontSize: 'var(--fs-sm)', color: 'var(--text-2)', maxWidth: 360, margin: '12px auto 0', lineHeight: 1.6 }}>
                    {cleanMarkdown(evaluation.feedbackSummary) ||
                      (evaluation.score >= 70 ? 'Strong clinical performance.' : 'Good effort — keep practicing.')}
                  </div>
                </div>

                {/* Diagnosis result */}
                <div style={{
                  padding: 'var(--sp-4)',
                  borderRadius: 'var(--r-md)',
                  background: evaluation.diagnosisCorrect ? 'var(--success-dim)' : 'var(--danger-dim)',
                  border: `1px solid ${evaluation.diagnosisCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                  marginBottom: 16,
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ color: evaluation.diagnosisCorrect ? 'var(--success)' : 'var(--danger)', marginTop: 2 }}>
                    {evaluation.diagnosisCorrect ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: evaluation.diagnosisCorrect ? 'var(--success)' : 'var(--danger)' }}>
                      {evaluation.diagnosisCorrect ? 'Correct Diagnosis' : 'Incorrect Diagnosis'}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-2)', marginTop: 3 }}>
                      Likely diagnosis: <strong>{cleanMarkdown(evaluation.likelyDiagnosis) || 'See rubric'}</strong>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                {evaluation.strengths?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--success)', marginBottom: 8 }}>
                      Strengths
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {evaluation.strengths.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {cleanMarkdown(s)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {evaluation.improvements?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--warning)', marginBottom: 8 }}>
                      Areas to Improve
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {evaluation.improvements.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {cleanMarkdown(s)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missed questions */}
                {evaluation.expectedQuestionsMissed?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: 8 }}>
                      Should Have Asked
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {evaluation.expectedQuestionsMissed.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          {cleanMarkdown(s)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer actions */}
                <div className="modal-footer" style={{ marginTop: 20, padding: '16px 0 0', border: 'none', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setIsAssessmentModalOpen(false); activeCase && loadCase(activeCase.id); }}
                      className="btn btn-outline btn-sm"
                    >
                      Retry Case
                    </button>
                    <button
                      onClick={() => { setIsAssessmentModalOpen(false); navigate(user ? '/dashboard' : '/'); }}
                      className="btn btn-ghost btn-sm"
                    >
                      {user ? 'Dashboard' : 'Home'}
                    </button>
                  </div>
                  <button
                    onClick={downloadReport}
                    disabled={reportLoading}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 6 }}
                  >
                    <DownloadIcon />
                    {reportLoading ? 'Generating...' : 'Download Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {lightboxImg && (
        <div className="lightbox" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <div className="lightbox-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>{lightboxImg.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {lightboxImg.type} · Educational simulation only
                </div>
              </div>
              <button className="btn-icon" onClick={() => setLightboxImg(null)} aria-label="Close">
                <XIcon />
              </button>
            </div>
            <div className="lightbox-body">
              <img src={lightboxImg.image} alt={lightboxImg.title} />
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toastType === 'error' ? 'var(--danger)' : toastType === 'success' ? 'var(--success)' : 'var(--surface-2)',
          color: toastType === 'info' ? 'var(--text)' : '#fff',
          padding: '10px 20px', borderRadius: 'var(--r-full)',
          fontSize: 'var(--fs-sm)', fontWeight: 500, zIndex: 'var(--z-toast)',
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-md)',
          animation: 'slideUp 200ms var(--ease)',
          whiteSpace: 'nowrap',
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
