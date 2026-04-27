(() => {
  "use strict";

  const API = window.location.origin;

  const integrations = [
    { title: "LLM Patient Engine", description: "Replace scripted responses with OpenAI or another model for natural patient dialogue.", readiness: "Best next upgrade" },
    { title: "Speech Layer", description: "Add speech-to-text and text-to-speech for spoken bedside communication.", readiness: "Easy integration" },
    { title: "Database + Analytics", description: "Store cases, scores, transcripts, and learner progress.", readiness: "Recommended" },
    { title: "LMS Integration", description: "Connect with Moodle, Canvas, or institutional dashboards.", readiness: "Academic use" },
    { title: "Medical Sources", description: "Use curated guidelines for rubric-driven feedback.", readiness: "High value" },
    { title: "Hospital Interop", description: "HL7 FHIR-compatible structures for training records.", readiness: "Advanced" },
    { title: "Authentication", description: "Add institutional login with Clerk, Auth0, or Firebase Auth.", readiness: "Production" },
    { title: "Video / Avatar", description: "Add avatars or animated patients for stronger demos.", readiness: "Wow factor" }
  ];

  const state = {
    cases: [],
    activeCaseId: null,
    activeCase: null,
    sessionId: null,
    loading: false,
    user: JSON.parse(localStorage.getItem("vps_user") || "null")
  };

  /* ── DOM refs ── */
  const $ = (id) => document.getElementById(id);
  const el = {
    landingPage: $("landingPage"),
    simulatorSection: $("simulatorSection"),
    caseList: $("caseList"),
    patientName: $("patientName"),
    patientMeta: $("patientMeta"),
    complexityBadge: $("complexityBadge"),
    personaBadge: $("personaBadge"),
    chiefComplaint: $("chiefComplaint"),
    urgencyPill: $("urgencyPill"),
    patientInsights: $("patientInsights"),
    chatLog: $("chatLog"),
    chatForm: $("chatForm"),
    userQuestion: $("userQuestion"),
    diagnosisInput: $("diagnosisInput"),
    reasoningInput: $("reasoningInput"),
    evaluateBtn: $("evaluateBtn"),
    resetBtn: $("resetBtn"),
    scoreValue: $("scoreValue"),
    scoreSummary: $("scoreSummary"),
    feedbackPanel: $("feedbackPanel"),
    startSessionBtn: $("startSessionBtn"),
    showIntegrationsBtn: $("showIntegrationsBtn"),
    hintBtn: $("hintBtn"),
    userBar: $("userBar"),
    authModal: $("authModal"),
    historyPanel: $("historyPanel"),
    integrationGrid: $("integrationGrid"),
    backToLanding: $("backToLanding"),
    ctaSignUp: $("ctaSignUp"),
    navSimulation: $("navSimulation")
  };

  /* ── Page Navigation ── */
  function showSimulator() {
    if (!state.user) {
      showToast("Please sign in to access the Simulation Lab.", "warning");
      setTimeout(() => { window.location.href = "/login.html"; }, 1500);
      return;
    }
    if (!el.landingPage || !el.simulatorSection) return window.location.href = "/#simulatorSection";
    el.landingPage.style.display = "none";
    el.simulatorSection.style.display = "block";
    window.scrollTo(0, 0);
  }

  function showLanding() {
    if (!el.landingPage || !el.simulatorSection) return window.location.href = "/";
    el.simulatorSection.style.display = "none";
    el.landingPage.style.display = "block";
  }

  el.backToLanding?.addEventListener("click", showLanding);
  el.navSimulation?.addEventListener("click", (e) => { e.preventDefault(); showSimulator(); });

  /* ── Toast ── */
  function showToast(message, type = "error") {
    let c = $("toastContainer");
    if (!c) { c = document.createElement("div"); c.id = "toastContainer"; c.className = "toast-container"; document.body.appendChild(c); }
    const t = document.createElement("div");
    t.className = `toast toast--${type}`;
    t.textContent = message;
    c.appendChild(t);
    requestAnimationFrame(() => t.classList.add("toast--visible"));
    setTimeout(() => { t.classList.remove("toast--visible"); setTimeout(() => t.remove(), 400); }, 4500);
  }

  /* ── API Helper ── */
  async function api(path, options = {}) {
    const res = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function setLoading(v) {
    state.loading = v;
    document.body.classList.toggle("is-loading", v);
    el.userQuestion.disabled = v;
    el.evaluateBtn.disabled = v;
  }

  /* ── User Management ── */
  function saveUser(user) { state.user = user; localStorage.setItem("vps_user", JSON.stringify(user)); renderUserBar(); }
  function clearUser() { state.user = null; localStorage.removeItem("vps_user"); renderUserBar(); }

  function renderUserBar() {
    if (!el.userBar) return;
    if (state.user) {
      el.userBar.innerHTML = `
        <div class="user-bar-info">
          <span class="user-avatar" style="background:${state.user.avatarColor || '#6D28D9'}">${state.user.name.charAt(0).toUpperCase()}</span>
          <strong style="font-size:.85rem">${state.user.name}</strong>
        </div>
        <a href="/dashboard.html" class="btn btn-ghost btn-sm">Dashboard</a>
        <button id="logoutBtn" class="btn btn-ghost btn-sm">Logout</button>`;
      $("logoutBtn")?.addEventListener("click", () => { clearUser(); showToast("Logged out.", "info"); if (window.location.pathname.includes("dashboard")) window.location.href = "/"; });
    } else {
      el.userBar.innerHTML = `
        <a href="/login.html" class="btn btn-ghost btn-sm">Sign In</a>
        <a href="/register.html" class="btn btn-primary btn-sm">Register</a>`;
    }
  }

  function showAuthModal(mode = "login") {
    window.location.href = mode === "register" ? "/register.html" : "/login.html";
  }

  function closeAuthModal() { if (el.authModal) { el.authModal.classList.remove("is-visible"); el.authModal.innerHTML = ""; } }

  /* ── History ── */
  async function showHistory() {
    if (!state.user || !el.historyPanel) return;
    el.historyPanel.classList.add("is-visible");
    el.historyPanel.innerHTML = `<div class="modal-backdrop" id="historyBackdrop"></div>
      <div class="modal-content modal-content--wide">
        <div class="modal-header"><h2>Session History</h2><button id="historyClose" class="btn btn-ghost btn-sm">\u2715</button></div>
        <p class="text-muted">Loading\u2026</p></div>`;
    $("historyBackdrop")?.addEventListener("click", closeHistory);
    $("historyClose")?.addEventListener("click", closeHistory);
    try {
      const data = await api(`/api/users/${state.user.id}/sessions`);
      const sessions = data.sessions || [];
      const content = el.historyPanel.querySelector(".modal-content");
      const caseLookup = {}; state.cases.forEach(c => { caseLookup[c.id] = c; });
      if (!sessions.length) {
        content.innerHTML = `<div class="modal-header"><h2>Session History</h2><button id="historyClose" class="btn btn-ghost btn-sm">\u2715</button></div><p class="text-muted">No sessions yet.</p>`;
        $("historyClose")?.addEventListener("click", closeHistory); return;
      }
      content.innerHTML = `
        <div class="modal-header"><h2>Session History <span class="text-muted">(${sessions.length})</span></h2><button id="historyClose" class="btn btn-ghost btn-sm">\u2715</button></div>
        <div class="history-list">${sessions.map(s => {
          const c = caseLookup[s.caseId]; const score = s.lastEvaluation?.score;
          return `<article class="history-item"><div class="history-item__main"><h4>${c?.name || s.caseId}</h4><p>${c?.specialty || "Unknown"} \u00b7 ${s.questionsAsked} questions</p><small>${new Date(s.createdAt).toLocaleDateString()} \u00b7 ${s.status}</small></div><div class="history-item__score">${score != null ? `<span class="score-badge ${score >= 70 ? 'score-badge--good' : score >= 40 ? 'score-badge--ok' : 'score-badge--low'}">${score}%</span>` : '<span class="score-badge score-badge--none">\u2014</span>'}${s.lastEvaluation?.diagnosisCorrect ? '<small class="text-success">\u2713 Correct</small>' : s.lastEvaluation ? '<small class="text-danger">\u2717 Incorrect</small>' : ''}</div></article>`;
        }).join("")}</div>`;
      $("historyClose")?.addEventListener("click", closeHistory);
    } catch (err) { showToast("Failed to load history: " + err.message); closeHistory(); }
  }

  function closeHistory() { if (el.historyPanel) { el.historyPanel.classList.remove("is-visible"); el.historyPanel.innerHTML = ""; } }

  /* ── Progress ── */
  async function showProgress() {
    if (!state.user || !el.historyPanel) return;
    el.historyPanel.classList.add("is-visible");
    el.historyPanel.innerHTML = `<div class="modal-backdrop" id="progressBackdrop"></div>
      <div class="modal-content modal-content--wide">
        <div class="modal-header"><h2>Learning Progress</h2><button id="progressClose" class="btn btn-ghost btn-sm">\u2715</button></div>
        <p class="text-muted">Loading\u2026</p></div>`;
    $("progressBackdrop")?.addEventListener("click", closeHistory);
    $("progressClose")?.addEventListener("click", closeHistory);
    try {
      const data = await api(`/api/users/${state.user.id}/progress`);
      const p = data.progress; const content = el.historyPanel.querySelector(".modal-content");
      const caseLookup = {}; state.cases.forEach(c => { caseLookup[c.id] = c; });
      content.innerHTML = `
        <div class="modal-header"><h2>Learning Progress</h2><button id="progressClose" class="btn btn-ghost btn-sm">\u2715</button></div>
        <div class="progress-stats">
          <div class="stat-card"><span class="stat-value">${p.totalSessions}</span><span class="stat-label">Sessions</span></div>
          <div class="stat-card"><span class="stat-value">${p.evaluatedSessions}</span><span class="stat-label">Evaluated</span></div>
          <div class="stat-card"><span class="stat-value">${p.averageScore != null ? p.averageScore + "%" : "\u2014"}</span><span class="stat-label">Avg Score</span></div>
          <div class="stat-card"><span class="stat-value">${p.bestScore != null ? p.bestScore + "%" : "\u2014"}</span><span class="stat-label">Best</span></div>
          <div class="stat-card"><span class="stat-value">${p.totalQuestions}</span><span class="stat-label">Questions</span></div>
        </div>
        ${p.caseBreakdown?.length ? `<h3 style="margin:16px 0 8px">By Case</h3><div class="case-progress-list">${p.caseBreakdown.map(cb => { const c = caseLookup[cb.caseId]; return `<div class="case-progress-item"><div><strong>${c?.name || cb.caseId}</strong><small>${c?.specialty || ""} \u00b7 ${cb.attempts} attempt${cb.attempts !== 1 ? 's' : ''}</small></div><div class="case-progress-scores"><span>Best: <strong>${cb.bestScore != null ? cb.bestScore + "%" : "\u2014"}</strong></span><span>Last: <strong>${cb.lastScore != null ? cb.lastScore + "%" : "\u2014"}</strong></span></div></div>`; }).join("")}</div>` : ""}`;
      $("progressClose")?.addEventListener("click", closeHistory);
    } catch (err) { showToast("Failed to load progress: " + err.message); closeHistory(); }
  }

  /* ── Rendering ── */
  function renderCases() {
    el.caseList.innerHTML = state.cases.map(p => `
      <article class="case-card ${p.id === state.activeCaseId ? "is-active" : ""}" data-case-id="${p.id}">
        <h3>${p.name}</h3>
        <p>${p.specialty}</p>
        <div class="case-tags">
          <span class="case-tag">${p.complexity}</span>
          <span class="case-tag">${p.urgency}</span>
        </div>
      </article>`).join("");
    el.caseList.querySelectorAll(".case-card").forEach(card => {
      card.addEventListener("click", () => loadCase(card.dataset.caseId));
    });
  }

  function renderIntegrations() {
    el.integrationGrid.innerHTML = integrations.map(item => `
      <article class="integration-card">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <span>${item.readiness}</span>
      </article>`).join("");
  }

  function addMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `message message--${role}`;
    const roleLabel = document.createElement("span");
    roleLabel.className = "message__role";
    roleLabel.textContent = role === "user" ? `${state.user?.name || "You"} (Doctor)` : `Patient${state.activeCase ? " \u2014 " + state.activeCase.name : ""}`;
    const body = document.createElement("p");
    body.className = "message__text";
    body.textContent = text;
    bubble.appendChild(roleLabel);
    bubble.appendChild(body);
    el.chatLog.appendChild(bubble);
    el.chatLog.scrollTop = el.chatLog.scrollHeight;
  }

  function showTyping() {
    const d = document.createElement("div");
    d.className = "message message--assistant typing-indicator"; d.id = "typingIndicator";
    d.innerHTML = `<span class="message__role">Patient is thinking\u2026</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
    el.chatLog.appendChild(d); el.chatLog.scrollTop = el.chatLog.scrollHeight;
  }
  function hideTyping() { const e = $("typingIndicator"); if (e) e.remove(); }

  /* ── Fetch Cases ── */
  async function fetchCases() {
    try { const data = await api("/api/cases"); state.cases = data.cases || []; renderCases(); }
    catch (err) { showToast("Could not load patient cases \u2014 is the backend running?"); console.error("fetchCases:", err); }
  }

  /* ── Load Case ── */
  async function loadCase(caseId) {
    if (!state.user) {
      showToast("Please sign in to practice.", "warning");
      setTimeout(() => { window.location.href = "/login.html"; }, 1500);
      return;
    }
    const patient = state.cases.find(c => c.id === caseId);
    if (!patient) return;
    state.activeCaseId = caseId; state.activeCase = patient;
    showSimulator(); renderCases();
    el.patientName.textContent = patient.name;
    el.patientMeta.textContent = `${patient.age}-year-old ${patient.role} \u2014 ${patient.specialty}`;
    el.complexityBadge.textContent = patient.complexity;
    el.personaBadge.textContent = patient.personality;
    el.chiefComplaint.textContent = patient.complaint;
    el.urgencyPill.textContent = patient.urgency;
    el.patientInsights.innerHTML = `
      <div class="insight-tile"><h4>Summary</h4><p>${patient.summary}</p></div>
      <div class="insight-tile"><h4>Vitals</h4><p>${patient.vitals}</p></div>
      <div class="insight-tile"><h4>History</h4><p>${patient.history}</p></div>
      <div class="insight-tile"><h4>Focus</h4><p>${patient.evaluationFocus.join(", ")}</p></div>`;
    el.chatLog.innerHTML = ""; el.diagnosisInput.value = ""; el.reasoningInput.value = "";
    el.scoreValue.textContent = "\u2014"; el.scoreSummary.textContent = "Creating session\u2026"; el.feedbackPanel.innerHTML = "";
    try {
      setLoading(true);
      const body = { caseId, learnerName: state.user?.name || "Guest" };
      if (state.user) body.userId = state.user.id;
      const data = await api("/api/sessions", { method: "POST", body: JSON.stringify(body) });
      state.sessionId = data.session.id;
      (data.session.messages || []).forEach(msg => addMessage(msg.role, msg.text));
      el.scoreSummary.textContent = "Interview the patient, then submit your diagnosis.";
      showToast("Session started \u2014 interview the patient.", "success");
    } catch (err) { showToast("Failed to start session: " + err.message); el.scoreSummary.textContent = "Session failed."; }
    finally { setLoading(false); }
  }

  /* ── Send Message ── */
  async function sendMessage(text) {
    if (!state.sessionId || state.loading) return;
    addMessage("user", text); el.userQuestion.value = ""; showTyping();
    try {
      setLoading(true);
      const data = await api(`/api/sessions/${state.sessionId}/messages`, { method: "POST", body: JSON.stringify({ message: text }) });
      hideTyping(); addMessage("assistant", data.reply.text);
      if (data.provider === "gemini") el.personaBadge.textContent = "AI-powered \u00b7 " + (state.activeCase?.personality || "");
    } catch (err) { hideTyping(); addMessage("assistant", "I\u2019m sorry, could you ask that again?"); showToast("Message failed: " + err.message); }
    finally { setLoading(false); }
  }

  /* ── Evaluate ── */
  async function evaluateCase() {
    if (!state.sessionId) { showToast("Start a patient session first.", "warning"); return; }
    const diagnosis = el.diagnosisInput.value.trim();
    const reasoning = el.reasoningInput.value.trim();
    if (!diagnosis) { showToast("Enter a diagnosis first.", "warning"); el.diagnosisInput.focus(); return; }
    try {
      setLoading(true); el.scoreValue.textContent = "\u2026"; el.scoreSummary.textContent = "Analyzing\u2026"; el.feedbackPanel.innerHTML = "";
      const data = await api(`/api/sessions/${state.sessionId}/evaluate`, { method: "POST", body: JSON.stringify({ diagnosis, reasoning }) });
      const ev = data.evaluation;
      el.scoreValue.textContent = `${ev.score}%`;
      el.scoreValue.classList.add("score-pop"); setTimeout(() => el.scoreValue.classList.remove("score-pop"), 600);
      el.scoreSummary.textContent = ev.feedbackSummary || (ev.score >= 70 ? "Strong clinical performance." : "Good effort \u2014 keep practicing.");
      let html = "";
      if (ev.diagnosisCorrect) html += fb("\u2705 Diagnosis", [`Correct \u2014 <strong>${ev.likelyDiagnosis || "confirmed"}</strong>.`], "success");
      else html += fb("\u274C Diagnosis", [`Likely diagnosis: <strong>${ev.likelyDiagnosis || "not determined"}</strong>.`], "danger");
      if (ev.strengths?.length) html += fb("\uD83D\uDCAA Strengths", ev.strengths, "success");
      if (ev.improvements?.length) html += fb("\u26A0\uFE0F Improve", ev.improvements, "warning");
      if (ev.differentialDiagnoses?.length) html += fb("\uD83D\uDD0D Differentials", ev.differentialDiagnoses);
      if (ev.redFlagsAddressed?.length) html += fb("\uD83D\uDFE2 Red Flags Hit", ev.redFlagsAddressed, "success");
      if (ev.redFlagsMissed?.length) html += fb("\uD83D\uDEA9 Red Flags Missed", ev.redFlagsMissed, "danger");
      if (ev.expectedQuestionsCovered?.length) html += fb("\u2705 Questions Asked", ev.expectedQuestionsCovered, "success");
      if (ev.expectedQuestionsMissed?.length) html += fb("\u2753 Should Ask", ev.expectedQuestionsMissed, "warning");
      if (ev.recommendedTests?.length) html += fb("\uD83E\uDDEA Tests", ev.recommendedTests);
      if (ev.communicationObservations?.length) html += fb("\uD83D\uDCAC Communication", ev.communicationObservations);
      html += `<article class="feedback-item feedback-item--meta"><p>Evaluated by <strong>${ev.provider === "gemini" ? "Gemini AI" : "Local Rubric"}</strong></p></article>`;
      el.feedbackPanel.innerHTML = html;
      showToast(`Score: ${ev.score}%`, ev.score >= 70 ? "success" : "info");
    } catch (err) { showToast("Evaluation failed: " + err.message); el.scoreSummary.textContent = "Error. Try again."; }
    finally { setLoading(false); }
  }

  function fb(title, items, variant) {
    const cls = variant ? ` feedback-item--${variant}` : "";
    return `<article class="feedback-item${cls}"><h4>${title}</h4><ul>${items.map(i => `<li>${i}</li>`).join("")}</ul></article>`;
  }

  /* ── Events ── */
  el.chatForm?.addEventListener("submit", e => { e.preventDefault(); const q = el.userQuestion.value.trim(); if (q) sendMessage(q); });
  el.userQuestion?.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const q = el.userQuestion.value.trim(); if (q) sendMessage(q); } });
  el.evaluateBtn?.addEventListener("click", evaluateCase);
  el.resetBtn?.addEventListener("click", () => { if (state.activeCaseId) loadCase(state.activeCaseId); });
  el.startSessionBtn?.addEventListener("click", () => {
    if (state.cases.length) { loadCase(state.cases[0].id); }
    else showToast("Cases not loaded yet.", "warning");
  });
  el.showIntegrationsBtn?.addEventListener("click", () => {
    if (state.cases.length) { loadCase(state.cases[0].id); }
    else showToast("Cases not loaded yet.", "warning");
  });
  el.ctaSignUp?.addEventListener("click", () => { if (state.user) { showSimulator(); } else { window.location.href = "/register.html"; } });
  el.hintBtn?.addEventListener("click", () => {
    const p = state.activeCase; if (!p?.hints?.length) return;
    const asked = el.chatLog.querySelectorAll(".message--user").length;
    el.userQuestion.value = p.hints[asked % p.hints.length]; el.userQuestion.focus();
  });

  /* ── Smooth scroll for nav links ── */
  document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
    });
  });

  /* ── Init ── */
  renderUserBar();
  if (el.integrationGrid) renderIntegrations();
  if (el.caseList) fetchCases();
  
  // Check hash for direct simulator access
  if (window.location.hash === "#simulatorSection" && el.simulatorSection) {
    showSimulator();
  }
  
  // Expose api to global for standalone pages
  window.curaApi = api;
  window.curaSaveUser = saveUser;
  window.curaShowToast = showToast;
  window.curaState = state;
})();
