const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function buildHeaders(preferRepresentation = false) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...(preferRepresentation ? { Prefer: "return=representation" } : {})
  };
}

function buildUrl(path, query = "") {
  return `${SUPABASE_URL}/rest/v1/${path}${query}`;
}

async function parseResponse(response) {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${detail}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

/* ─── Users ─── */

function mapUserRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    institution: row.institution,
    role: row.role,
    yearOfStudy: row.year_of_study,
    specialization: row.specialization,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function createUser({ name, email, institution, role, yearOfStudy, specialization }) {
  const colors = ["#43d9ad", "#ffb36b", "#6b9fff", "#ff6b9d", "#b36bff", "#6bfff2"];
  const payload = {
    name,
    email: email.toLowerCase().trim(),
    institution: institution || null,
    role: role || "student",
    year_of_study: yearOfStudy || null,
    specialization: specialization || null,
    avatar_color: colors[Math.floor(Math.random() * colors.length)]
  };

  try {
    const rows = await fetch(buildUrl("users"), {
      method: "POST",
      headers: buildHeaders(true),
      body: JSON.stringify(payload)
    }).then(parseResponse);

    return mapUserRow(rows[0]);
  } catch (err) {
    if (err.message.includes("409") || err.message.includes("duplicate") || err.message.includes("23505")) {
      throw new Error("A user with this email already exists.");
    }
    throw err;
  }
}

async function getUserByEmail(email) {
  const rows = await fetch(
    buildUrl("users", `?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=*`),
    { method: "GET", headers: buildHeaders() }
  ).then(parseResponse);

  return rows && rows[0] ? mapUserRow(rows[0]) : null;
}

async function getUserById(userId) {
  const rows = await fetch(
    buildUrl("users", `?id=eq.${encodeURIComponent(userId)}&select=*`),
    { method: "GET", headers: buildHeaders() }
  ).then(parseResponse);

  return rows && rows[0] ? mapUserRow(rows[0]) : null;
}

async function updateUser(userId, updates) {
  const patchPayload = {};
  if (updates.name) patchPayload.name = updates.name;
  if (updates.institution !== undefined) patchPayload.institution = updates.institution;
  if (updates.yearOfStudy !== undefined) patchPayload.year_of_study = updates.yearOfStudy;
  if (updates.specialization !== undefined) patchPayload.specialization = updates.specialization;
  patchPayload.updated_at = new Date().toISOString();

  const rows = await fetch(
    buildUrl("users", `?id=eq.${encodeURIComponent(userId)}`),
    {
      method: "PATCH",
      headers: buildHeaders(true),
      body: JSON.stringify(patchPayload)
    }
  ).then(parseResponse);

  return rows && rows[0] ? mapUserRow(rows[0]) : null;
}

async function getUserSessions(userId, limit = 50) {
  const sessions = await fetch(
    buildUrl("sessions", `?user_id=eq.${encodeURIComponent(userId)}&select=*&order=updated_at.desc&limit=${limit}`),
    { method: "GET", headers: buildHeaders() }
  ).then(parseResponse);

  if (!sessions || !sessions.length) return [];

  const sessionIds = sessions.map((s) => s.id);
  const idsFilter = `in.(${sessionIds.map((id) => `"${id}"`).join(",")})`;

  const [allMessages, allEvaluations] = await Promise.all([
    fetch(
      buildUrl("session_messages", `?session_id=${idsFilter}&select=*&order=created_at.asc`),
      { method: "GET", headers: buildHeaders() }
    ).then(parseResponse),
    fetch(
      buildUrl("session_evaluations", `?session_id=${idsFilter}&select=*&order=created_at.desc`),
      { method: "GET", headers: buildHeaders() }
    ).then(parseResponse)
  ]);

  const messagesBySession = new Map();
  for (const msg of (allMessages || [])) {
    const list = messagesBySession.get(msg.session_id) || [];
    list.push({ id: msg.id, role: msg.role, text: msg.text, createdAt: msg.created_at });
    messagesBySession.set(msg.session_id, list);
  }

  const evalBySession = new Map();
  for (const ev of (allEvaluations || [])) {
    if (!evalBySession.has(ev.session_id)) {
      evalBySession.set(ev.session_id, mapEvaluationRow(ev));
    }
  }

  return sessions.map((session) => ({
    id: session.id,
    caseId: session.case_id,
    userId: session.user_id || null,
    learnerName: session.learner_name,
    status: session.status || "active",
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    messages: messagesBySession.get(session.id) || [],
    lastEvaluation: evalBySession.get(session.id) || null
  }));
}

async function getUserProgress(userId) {
  const userSessions = await getUserSessions(userId, 200);
  const evaluated = userSessions.filter((s) => s.lastEvaluation);
  const scores = evaluated.map((s) => s.lastEvaluation.score);

  const caseAttempts = new Map();
  for (const s of userSessions) {
    const existing = caseAttempts.get(s.caseId) || { attempts: 0, bestScore: null, lastScore: null };
    existing.attempts += 1;
    if (s.lastEvaluation) {
      existing.lastScore = s.lastEvaluation.score;
      if (existing.bestScore === null || s.lastEvaluation.score > existing.bestScore) {
        existing.bestScore = s.lastEvaluation.score;
      }
    }
    caseAttempts.set(s.caseId, existing);
  }

  const totalQuestions = userSessions.reduce(
    (sum, s) => sum + s.messages.filter((m) => m.role === "user").length,
    0
  );

  return {
    totalSessions: userSessions.length,
    evaluatedSessions: evaluated.length,
    totalQuestions,
    averageScore: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null,
    bestScore: scores.length ? Math.max(...scores) : null,
    scoreHistory: evaluated.map((s) => ({
      sessionId: s.id,
      caseId: s.caseId,
      score: s.lastEvaluation.score,
      diagnosisCorrect: s.lastEvaluation.diagnosisCorrect,
      date: s.lastEvaluation.createdAt || s.updatedAt
    })),
    caseBreakdown: Array.from(caseAttempts.entries()).map(([caseId, data]) => ({
      caseId,
      ...data
    }))
  };
}

/* ─── Sessions ─── */

function mapEvaluationRow(row) {
  return {
    score: row.score,
    diagnosisCorrect: row.diagnosis_correct,
    diagnosisSubmitted: row.diagnosis_submitted || null,
    reasoningSubmitted: row.reasoning_submitted || null,
    strengths: row.strengths || [],
    improvements: row.improvements || [],
    expectedLearningFocus: row.expected_learning_focus || [],
    feedbackSummary: row.feedback_summary,
    askedCoverage: row.asked_coverage || [],
    likelyDiagnosis: row.likely_diagnosis || null,
    differentialDiagnoses: row.differential_diagnoses || [],
    redFlagsAddressed: row.red_flags_addressed || [],
    redFlagsMissed: row.red_flags_missed || [],
    expectedQuestionsCovered: row.expected_questions_covered || [],
    expectedQuestionsMissed: row.expected_questions_missed || [],
    recommendedTests: row.recommended_tests || [],
    communicationObservations: row.communication_observations || [],
    communicationGoals: row.communication_goals || [],
    provider: row.provider,
    model: row.model,
    createdAt: row.created_at
  };
}

async function createSession({ caseId, learnerName, initialMessages, userId }) {
  const sessionPayload = {
    case_id: caseId,
    learner_name: learnerName || null,
    user_id: userId || null
  };

  const createdSessions = await fetch(buildUrl("sessions"), {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(sessionPayload)
  }).then(parseResponse);

  const createdSession = createdSessions[0];

  if (initialMessages?.length) {
    const messageRows = initialMessages.map((message) => ({
      id: message.id,
      session_id: createdSession.id,
      role: message.role,
      text: message.text,
      created_at: message.createdAt
    }));

    await fetch(buildUrl("session_messages"), {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(messageRows)
    }).then(parseResponse);
  }

  return {
    id: createdSession.id,
    caseId: createdSession.case_id,
    userId: createdSession.user_id || null,
    learnerName: createdSession.learner_name,
    createdAt: createdSession.created_at,
    updatedAt: createdSession.updated_at,
    messages: initialMessages || [],
    lastEvaluation: null
  };
}

async function getSession(sessionId) {
  const sessions = await fetch(
    buildUrl("sessions", `?id=eq.${encodeURIComponent(sessionId)}&select=*`),
    { method: "GET", headers: buildHeaders() }
  ).then(parseResponse);

  const session = sessions[0];
  if (!session) {
    return null;
  }

  const messages = await fetch(
    buildUrl("session_messages", `?session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=created_at.asc`),
    { method: "GET", headers: buildHeaders() }
  ).then(parseResponse);

  const evaluations = await fetch(
    buildUrl("session_evaluations", `?session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=created_at.desc&limit=1`),
    { method: "GET", headers: buildHeaders() }
  ).then(parseResponse);

  return {
    id: session.id,
    caseId: session.case_id,
    userId: session.user_id || null,
    learnerName: session.learner_name,
    status: session.status || "active",
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    messages: messages.map((message) => ({
      id: message.id,
      role: message.role,
      text: message.text,
      createdAt: message.created_at
    })),
    lastEvaluation: evaluations[0] ? mapEvaluationRow(evaluations[0]) : null
  };
}

async function appendMessages(sessionId, newMessages) {
  const rows = newMessages.map((message) => ({
    id: message.id,
    session_id: sessionId,
    role: message.role,
    text: message.text,
    created_at: message.createdAt
  }));

  await fetch(buildUrl("session_messages"), {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(rows)
  }).then(parseResponse);

  await fetch(buildUrl("sessions", `?id=eq.${encodeURIComponent(sessionId)}`), {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ updated_at: new Date().toISOString() })
  }).then(parseResponse);

  return getSession(sessionId);
}

async function saveEvaluation(sessionId, evaluation) {
  const payload = {
    session_id: sessionId,
    score: evaluation.score,
    diagnosis_correct: evaluation.diagnosisCorrect,
    diagnosis_submitted: evaluation.diagnosisSubmitted || null,
    reasoning_submitted: evaluation.reasoningSubmitted || null,
    strengths: evaluation.strengths || [],
    improvements: evaluation.improvements || [],
    expected_learning_focus: evaluation.expectedLearningFocus || [],
    feedback_summary: evaluation.feedbackSummary || null,
    asked_coverage: evaluation.askedCoverage || [],
    likely_diagnosis: evaluation.likelyDiagnosis || null,
    differential_diagnoses: evaluation.differentialDiagnoses || [],
    red_flags_addressed: evaluation.redFlagsAddressed || [],
    red_flags_missed: evaluation.redFlagsMissed || [],
    expected_questions_covered: evaluation.expectedQuestionsCovered || [],
    expected_questions_missed: evaluation.expectedQuestionsMissed || [],
    recommended_tests: evaluation.recommendedTests || [],
    communication_observations: evaluation.communicationObservations || [],
    communication_goals: evaluation.communicationGoals || [],
    provider: evaluation.provider,
    model: evaluation.model
  };

  await fetch(buildUrl("session_evaluations"), {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  }).then(parseResponse);

  await fetch(buildUrl("sessions", `?id=eq.${encodeURIComponent(sessionId)}`), {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({ status: "completed", updated_at: new Date().toISOString() })
  }).then(parseResponse);

  return getSession(sessionId);
}

async function getStats() {
  const sessionData = await fetch(
    buildUrl("sessions", "?select=id"),
    { method: "GET", headers: { ...buildHeaders(), Prefer: "count=exact" } }
  );

  if (!sessionData.ok) {
    const detail = await sessionData.text();
    throw new Error(`Supabase request failed: ${sessionData.status} ${detail}`);
  }

  const sessionCountHeader = sessionData.headers.get("content-range");
  const activeSessions = sessionCountHeader ? Number(sessionCountHeader.split("/")[1] || 0) : 0;

  const userData = await fetch(
    buildUrl("users", "?select=id"),
    { method: "GET", headers: { ...buildHeaders(), Prefer: "count=exact" } }
  );

  let totalUsers = 0;
  if (userData.ok) {
    const userCountHeader = userData.headers.get("content-range");
    totalUsers = userCountHeader ? Number(userCountHeader.split("/")[1] || 0) : 0;
  }

  return { activeSessions, totalUsers };
}

async function listSessions(limit = 20) {
  const sessions = await fetch(
    buildUrl("sessions", `?select=*&order=updated_at.desc&limit=${limit}`),
    { method: "GET", headers: buildHeaders() }
  ).then(parseResponse);

  if (!sessions || !sessions.length) return [];

  // Batch-fetch messages and evaluations for all sessions to avoid N+1
  const sessionIds = sessions.map((s) => s.id);
  const idsFilter = `in.(${sessionIds.map((id) => `"${id}"`).join(",")})`;

  const [allMessages, allEvaluations] = await Promise.all([
    fetch(
      buildUrl("session_messages", `?session_id=${idsFilter}&select=*&order=created_at.asc`),
      { method: "GET", headers: buildHeaders() }
    ).then(parseResponse),
    fetch(
      buildUrl("session_evaluations", `?session_id=${idsFilter}&select=*&order=created_at.desc`),
      { method: "GET", headers: buildHeaders() }
    ).then(parseResponse)
  ]);

  // Group messages by session_id
  const messagesBySession = new Map();
  for (const msg of (allMessages || [])) {
    const list = messagesBySession.get(msg.session_id) || [];
    list.push({ id: msg.id, role: msg.role, text: msg.text, createdAt: msg.created_at });
    messagesBySession.set(msg.session_id, list);
  }

  // Group evaluations by session_id (keep only the latest per session)
  const evalBySession = new Map();
  for (const ev of (allEvaluations || [])) {
    if (!evalBySession.has(ev.session_id)) {
      evalBySession.set(ev.session_id, mapEvaluationRow(ev));
    }
  }

  return sessions.map((session) => ({
    id: session.id,
    caseId: session.case_id,
    userId: session.user_id || null,
    learnerName: session.learner_name,
    status: session.status || "active",
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    messages: messagesBySession.get(session.id) || [],
    lastEvaluation: evalBySession.get(session.id) || null
  }));
}

async function getAnalytics() {
  // Get true total count using Supabase count header
  const countRes = await fetch(
    buildUrl("sessions", "?select=id"),
    { method: "GET", headers: { ...buildHeaders(), Prefer: "count=exact" } }
  );

  let totalSessions = 0;
  if (countRes.ok) {
    const countHeader = countRes.headers.get("content-range");
    totalSessions = countHeader ? Number(countHeader.split("/")[1] || 0) : 0;
  }

  // Get user count
  const userCountRes = await fetch(
    buildUrl("users", "?select=id"),
    { method: "GET", headers: { ...buildHeaders(), Prefer: "count=exact" } }
  );

  let totalUsers = 0;
  if (userCountRes.ok) {
    const userCountHeader = userCountRes.headers.get("content-range");
    totalUsers = userCountHeader ? Number(userCountHeader.split("/")[1] || 0) : 0;
  }

  const recentSessions = await listSessions(50);
  const sessionsWithEvaluation = recentSessions.filter((session) => session.lastEvaluation);
  const averageScore = sessionsWithEvaluation.length
    ? Math.round(
        sessionsWithEvaluation.reduce((sum, session) => sum + session.lastEvaluation.score, 0) /
          sessionsWithEvaluation.length
      )
    : null;

  const caseBreakdownMap = new Map();
  for (const session of recentSessions) {
    const existing = caseBreakdownMap.get(session.caseId) || {
      caseId: session.caseId,
      sessionCount: 0,
      evaluatedCount: 0,
      scoreTotal: 0,
      averageScore: null
    };

    existing.sessionCount += 1;
    if (session.lastEvaluation) {
      existing.evaluatedCount += 1;
      existing.scoreTotal += session.lastEvaluation.score;
      existing.averageScore = Math.round(existing.scoreTotal / existing.evaluatedCount);
    }

    caseBreakdownMap.set(session.caseId, existing);
  }

  return {
    totalSessions,
    totalUsers,
    evaluatedSessions: sessionsWithEvaluation.length,
    averageScore,
    caseBreakdown: Array.from(caseBreakdownMap.values()).map((item) => ({
      caseId: item.caseId,
      sessionCount: item.sessionCount,
      evaluatedCount: item.evaluatedCount,
      averageScore: item.averageScore
    })),
    recentSessions: recentSessions.slice(0, 10)
  };
}

module.exports = {
  isSupabaseConfigured,
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  getUserSessions,
  getUserProgress,
  createSession,
  getSession,
  appendMessages,
  saveEvaluation,
  getStats,
  listSessions,
  getAnalytics
};
