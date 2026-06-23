const { randomUUID } = require("crypto");

const sessions = new Map();
const users = new Map();


function buildUserRecord({ name, email, institution, role, yearOfStudy, specialization }) {
  const now = new Date().toISOString();
  const colors = ["#43d9ad", "#ffb36b", "#6b9fff", "#ff6b9d", "#b36bff", "#6bfff2"];
  return {
    id: randomUUID(),
    name,
    email: email.toLowerCase().trim(),
    institution: institution || null,
    role: role || "student",
    yearOfStudy: yearOfStudy || null,
    specialization: specialization || null,
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    createdAt: now,
    updatedAt: now
  };
}

async function createUser({ name, email, institution, role, yearOfStudy, specialization }) {
  const existing = Array.from(users.values()).find(
    (u) => u.email === email.toLowerCase().trim()
  );
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const user = buildUserRecord({ name, email, institution, role, yearOfStudy, specialization });
  users.set(user.id, user);
  return user;
}

async function getUserByEmail(email) {
  return (
    Array.from(users.values()).find(
      (u) => u.email === email.toLowerCase().trim()
    ) || null
  );
}

async function getUserById(userId) {
  return users.get(userId) || null;
}

async function updateUser(userId, updates) {
  const user = users.get(userId);
  if (!user) return null;

  if (updates.name) user.name = updates.name;
  if (updates.institution !== undefined) user.institution = updates.institution;
  if (updates.yearOfStudy !== undefined) user.yearOfStudy = updates.yearOfStudy;
  if (updates.specialization !== undefined) user.specialization = updates.specialization;
  user.updatedAt = new Date().toISOString();
  return user;
}

async function getUserSessions(userId, limit = 50) {
  return Array.from(sessions.values())
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);
}

async function getUserProgress(userId) {
  const userSessions = Array.from(sessions.values()).filter((s) => s.userId === userId);
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


function buildSessionRecord({ caseId, learnerName, userId }) {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    caseId,
    userId: userId || null,
    learnerName: learnerName || null,
    status: "active",
    createdAt: now,
    updatedAt: now,
    messages: [],
    lastEvaluation: null
  };
}

async function createSession({ caseId, learnerName, initialMessages, userId }) {
  const session = buildSessionRecord({ caseId, learnerName, userId });
  session.messages = initialMessages || [];
  sessions.set(session.id, session);
  return session;
}

async function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

async function appendMessages(sessionId, newMessages) {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  session.messages.push(...newMessages);
  session.updatedAt = new Date().toISOString();
  return session;
}

async function saveEvaluation(sessionId, evaluation) {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  session.lastEvaluation = evaluation;
  session.status = "completed";
  session.updatedAt = new Date().toISOString();
  return session;
}

async function getStats() {
  return {
    activeSessions: sessions.size,
    totalUsers: users.size
  };
}

async function listSessions(limit = 20) {
  return Array.from(sessions.values())
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);
}

async function getAnalytics() {
  const allSessions = Array.from(sessions.values());
  const totalSessions = allSessions.length;
  const sessionsWithEvaluation = allSessions.filter((session) => session.lastEvaluation);
  const averageScore = sessionsWithEvaluation.length
    ? Math.round(
        sessionsWithEvaluation.reduce((sum, session) => sum + session.lastEvaluation.score, 0) /
          sessionsWithEvaluation.length
      )
    : null;

  const caseBreakdownMap = new Map();
  for (const session of allSessions) {
    const existing = caseBreakdownMap.get(session.caseId) || {
      caseId: session.caseId,
      sessionCount: 0,
      evaluatedCount: 0,
      averageScore: null,
      scoreTotal: 0
    };

    existing.sessionCount += 1;
    if (session.lastEvaluation) {
      existing.evaluatedCount += 1;
      existing.scoreTotal += session.lastEvaluation.score;
      existing.averageScore = Math.round(existing.scoreTotal / existing.evaluatedCount);
    }

    caseBreakdownMap.set(session.caseId, existing);
  }

  const caseBreakdown = Array.from(caseBreakdownMap.values()).map((item) => ({
    caseId: item.caseId,
    sessionCount: item.sessionCount,
    evaluatedCount: item.evaluatedCount,
    averageScore: item.averageScore
  }));

  return {
    totalSessions,
    totalUsers: users.size,
    evaluatedSessions: sessionsWithEvaluation.length,
    averageScore,
    caseBreakdown,
    recentSessions: await listSessions(10)
  };
}

module.exports = {
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
