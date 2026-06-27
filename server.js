const http = require("http");
const { randomUUID, scrypt, timingSafeEqual, randomBytes } = require("crypto");
const { promisify } = require("util");
const scryptAsync = promisify(scrypt);

// Password hashing using Node built-in crypto (scrypt)
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${salt}:${buf.toString('hex')}`;
}
async function verifyPassword(supplied, stored) {
  if (!stored) return false;
  // Support legacy plain-text passwords (first login after migration)
  if (!stored.includes(':')) return supplied === stored;
  const [salt, hash] = stored.split(':');
  const hashBuf = Buffer.from(hash, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashBuf, suppliedBuf);
}
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

const { config, isProduction } = require("./src/config");
const { caseStudies } = require("./src/data/cases");
const {
  buildPatientReply,
  evaluateSubmission,
  buildSessionSummary,
  buildGeminiPrompt,
  buildGeminiEvaluationPrompt
} = require("./src/services/simulator");
const {
  generateGeminiReply,
  generateGeminiJson,
  isGeminiConfigured,
  GEMINI_MODEL
} = require("./src/services/gemini");
const {
  generateOllamaReply,
  generateOllamaJson,
  isOllamaAvailable,
  OLLAMA_MODEL,
  OLLAMA_BASE_URL
} = require("./src/services/ollama");
const {
  generateOpenAIReply,
  generateOpenAIJson,
  isOpenAIConfigured,
  OPENAI_MODEL
} = require("./src/services/openai");
const {
  generateGroqReply,
  generateGroqJson,
  isGroqConfigured,
  GROQ_MODEL
} = require("./src/services/groq");
const { storage, getStorageMode } = require("./src/storage");
const { applyRateLimit, startCleanupTimer } = require("./src/http/rateLimiter");
const {
  validateSessionCreate,
  validateMessageCreate,
  validateEvaluation,
  validateUserRegister,
  validateUserLogin,
  validateUserUpdate
} = require("./src/http/validation");

function buildBaseHeaders(context = {}) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": config.allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-key, x-request-id",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "X-Request-Id": context.requestId || ""
  };
}

function sendJson(response, statusCode, payload, context = {}, extraHeaders = {}) {
  response.writeHead(statusCode, {
    ...buildBaseHeaders(context),
    ...extraHeaders
  });
  response.end(JSON.stringify(payload, null, 2));
}

function notFound(response, context, message = "Route not found") {
  sendJson(response, 404, { error: message, requestId: context.requestId }, context);
}

function methodNotAllowed(response, context, message = "Method not allowed") {
  sendJson(response, 405, { error: message, requestId: context.requestId }, context);
}

function unauthorized(response, context, message = "Unauthorized") {
  sendJson(response, 401, { error: message, requestId: context.requestId }, context);
}

function badRequest(response, context, message) {
  sendJson(response, 400, { error: message, requestId: context.requestId }, context);
}

function tooManyRequests(response, context, retryAfterSeconds) {
  sendJson(
    response,
    429,
    {
      error: "Rate limit exceeded. Please retry shortly.",
      requestId: context.requestId
    },
    context,
    {
      "Retry-After": String(retryAfterSeconds)
    }
  );
}

function getCaseById(caseId) {
  return caseStudies.find((entry) => entry.id === caseId) || aiCaseCache.get(caseId);
}

// In-memory cache for AI-generated cases (persists during server lifetime)
const aiCaseCache = new Map();

function sanitizeCase(caseStudy) {
  const ensureArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);
  
  let resolvedGender = caseStudy.gender;
  if (!resolvedGender) {
    const maleNames = ['daniel', 'james', 'david', 'michael', 'robert', 'john', 'william', 'richard', 'joseph', 'thomas', 'charles', 'christopher', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'timothy', 'ronald', 'edward', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'frank', 'benjamin', 'gregory', 'samuel', 'raymond', 'patrick', 'alexander', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'henry', 'douglas', 'peter', 'arthur', 'walter', 'harold', 'carl', 'jeremy', 'albert', 'lawrence', 'leo', 'carlos'];
    const firstName = caseStudy.name?.split(' ')[0]?.toLowerCase() || '';
    if (maleNames.includes(firstName)) {
      resolvedGender = 'Male';
    } else {
      const contextText = [
        caseStudy.summary,
        caseStudy.personality,
        caseStudy.history,
        caseStudy.complaint
      ].join(' ').toLowerCase();

      const maleCount = (contextText.match(/\b(he|him|his|man|boy|gentleman|husband|father|son|brother)\b/g) || []).length;
      const femaleCount = (contextText.match(/\b(she|her|hers|woman|girl|lady|wife|mother|daughter|sister)\b/g) || []).length;

      resolvedGender = maleCount > femaleCount ? 'Male' : 'Female';
    }
  }

  return {
    id: caseStudy.id || `ai-${Date.now()}`,
    name: caseStudy.name || 'Unknown Patient',
    gender: resolvedGender,
    age: caseStudy.age || 40,
    role: caseStudy.role || 'Patient',
    specialty: caseStudy.specialty || 'General Medicine',
    complexity: caseStudy.complexity || 'Moderate',
    urgency: caseStudy.urgency || 'Stable',
    personality: caseStudy.personality || 'Neutral',
    complaint: caseStudy.complaint || 'Feeling unwell',
    summary: caseStudy.summary || 'Patient requires evaluation.',
    vitals: caseStudy.vitals || 'Stable',
    history: caseStudy.history || 'None',
    evaluationFocus: ensureArray(caseStudy.evaluationFocus),
    hints: ensureArray(caseStudy.hints),
    differentialDiagnoses: ensureArray(caseStudy.differentialDiagnoses),
    redFlags: ensureArray(caseStudy.redFlags),
    expectedQuestions: ensureArray(caseStudy.expectedQuestions),
    recommendedTests: ensureArray(caseStudy.recommendedTests),
    communicationGoals: ensureArray(caseStudy.communicationGoals)
  };
}



function seedSessionMessages(caseStudy) {
  return [
    {
      id: randomUUID(),
      role: "assistant",
      text: `Hello doctor. I'm ${caseStudy.name}. ${caseStudy.complaint}.`,
      createdAt: new Date().toISOString()
    },
    {
      id: randomUUID(),
      role: "assistant",
      text: "You can ask me about my symptoms, medical history, medications, allergies, lifestyle, or concerns.",
      createdAt: new Date().toISOString()
    }
  ];
}

function createSession(caseStudy, learnerName, userId) {
  return storage.createSession({
    caseId: caseStudy.id,
    learnerName,
    userId: userId || null,
    initialMessages: seedSessionMessages(caseStudy)
  });
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

function sanitizeSessionForAdmin(session) {
  return {
    id: session.id,
    caseId: session.caseId,
    userId: session.userId || null,
    learnerName: session.learnerName,
    status: session.status || "active",
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
    lastEvaluation: session.lastEvaluation
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    institution: user.institution,
    role: user.role,
    yearOfStudy: user.yearOfStudy,
    specialization: user.specialization,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt
  };
}

function assertAdminAccess(request, response, context) {
  if (!config.adminApiKey) {
    return true;
  }

  const providedKey = request.headers["x-admin-key"];
  if (providedKey === config.adminApiKey) {
    return true;
  }

  unauthorized(response, context, "Valid x-admin-key header required.");
  return false;
}

function routeMatches(pathname, pattern) {
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);

  if (pathParts.length !== patternParts.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = pathPart;
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

function sendSession(response, session, context) {
  const caseStudy = getCaseById(session.caseId);
  sendJson(response, 200, {
    session: {
      id: session.id,
      learnerName: session.learnerName,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      case: sanitizeCase(caseStudy),
      summary: buildSessionSummary(session, caseStudy),
      messages: session.messages,
      lastEvaluation: session.lastEvaluation
    },
    requestId: context.requestId
  }, context);
}

function shouldRateLimit(pathname) {
  return (
    pathname === "/api/sessions" ||
    pathname === "/api/users/register" ||
    pathname === "/api/users/login" ||
    pathname === "/api/admin/analytics" ||
    pathname === "/api/admin/sessions" ||
    pathname.includes("/messages") ||
    pathname.includes("/evaluate")
  );
}


const STATIC_ROOT = path.resolve(__dirname);
const STATIC_MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon"
};
const ALLOWED_STATIC = new Set(["index.html", "login.html", "register.html", "dashboard.html", "styles.css", "app.js", "favicon.svg", "hero-patient.png"]);

function tryServeStatic(reqPath, res) {
  const fileName = reqPath === "/" ? "index.html" : reqPath.replace(/^\//, "");
  if (!ALLOWED_STATIC.has(fileName)) return false;
  const ext = path.extname(fileName);
  const mime = STATIC_MIME[ext];
  if (!mime) return false;
  const filePath = path.join(STATIC_ROOT, fileName);
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Length": content.length,
      "Cache-Control": "no-cache"
    });
    res.end(content);
    return true;
  } catch { return false; }
}

const server = http.createServer(async (request, response) => {
  const requestId = request.headers["x-request-id"] || randomUUID();
  const context = { requestId };
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const { pathname } = url;

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true, requestId }, context);
    return;
  }

  if (request.method === "GET" && tryServeStatic(pathname, response)) {
    return;
  }

  try {
    if (shouldRateLimit(pathname)) {
      const limit = applyRateLimit(request, config);
      if (!limit.allowed) {
        tooManyRequests(response, context, limit.retryAfterSeconds);
        return;
      }
    }

    if (request.method === "GET" && pathname === "/health") {
      sendJson(response, 200, {
        status: "ok",
        service: "ai-virtual-patient-simulator-backend",
        timestamp: new Date().toISOString(),
        environment: config.appEnv,
        storage: getStorageMode(),
        ...(await storage.getStats()),
        requestId
      }, context);
      return;
    }

    if (request.method === "GET" && pathname === "/api/ai-status") {
      const ollamaReady = await isOllamaAvailable();
      const geminiReady = isGeminiConfigured();
      const openaiReady = isOpenAIConfigured();
      const groqReady = isGroqConfigured();
      let activeProvider = "local-scripted";
      let activeModel = "local-scripted";
      
      if (geminiReady) {
        activeProvider = "gemini";
        activeModel = GEMINI_MODEL;
      } else if (groqReady) {
        activeProvider = "groq";
        activeModel = GROQ_MODEL;
      } else if (openaiReady) {
        activeProvider = "openai";
        activeModel = OPENAI_MODEL;
      } else if (ollamaReady) {
        activeProvider = "ollama";
        activeModel = OLLAMA_MODEL;
      }

      sendJson(response, 200, {
        activeProvider,
        activeModel,
        providers: {
          gemini: { available: geminiReady, model: GEMINI_MODEL },
          groq: { available: groqReady, model: GROQ_MODEL },
          openai: { available: openaiReady, model: OPENAI_MODEL },
          ollama: { available: ollamaReady, model: OLLAMA_MODEL, baseUrl: OLLAMA_BASE_URL }
        },
        requestId
      }, context);
      return;
    }

    if (request.method === "GET" && pathname === "/api/cases") {
      const specialtyFilter = url.searchParams.get("specialty");
      const freshRequested = ["true", "1", "yes"].includes((url.searchParams.get("fresh") || "").toLowerCase());
      const excludedCaseId = url.searchParams.get("exclude");
      
      let filteredCases = caseStudies;
      
      if (specialtyFilter) {
        // Try exact match first, then partial match
        const normalizedFilter = specialtyFilter.toLowerCase().trim();
        filteredCases = caseStudies.filter(c => 
          c.specialty.toLowerCase() === normalizedFilter ||
          c.specialty.toLowerCase().includes(normalizedFilter) ||
          normalizedFilter.includes(c.specialty.toLowerCase())
        );
        
        // Also include any previously AI-generated cases for this specialty
        for (const [id, cachedCase] of aiCaseCache.entries()) {
          if (cachedCase.specialty && cachedCase.specialty.toLowerCase().includes(normalizedFilter)) {
            if (!filteredCases.find(fc => fc.id === id)) {
              filteredCases.push(cachedCase);
            }
          }
        }

        // AI case generation helper
        const generateSpecialtyCases = async (count, specialty) => {
          const randomSalt = Math.random().toString(36).substring(2, 10);
          
          // Gather existing patient names to prevent duplication
          const existingNames = [
            ...caseStudies.map(c => c.name),
            ...Array.from(aiCaseCache.values()).map(c => c.name)
          ].filter(Boolean);
          const uniqueNames = Array.from(new Set(existingNames));
          const prohibitedNamesString = uniqueNames.slice(-20).join(", ");

          const aiGenPrompt = `Generate ${count} realistic virtual patient case(s) for medical specialty: "${specialty}".
Ensure the patient name, age, gender, exact complaint, and clinical parameters are completely unique, creative, and random.
CRITICAL: Do NOT use any of the following names: [${prohibitedNamesString}]. You must invent a completely fresh, realistic name.
Random seed: [${randomSalt}].
Return a JSON array. Each case object must have: name (string), age (number), gender (string "Male" or "Female"), role (string), complaint (string), specialty: "${specialty}", complexity ("Low"/"Moderate"/"High"), urgency (string), personality (string), summary (string), vitals (string), history (string), expectedDiagnosis (array), differentialDiagnoses (array of 3-4), redFlags (array of 3-5), expectedQuestions (array of 5), recommendedTests (array of 4-5), communicationGoals (array of 2), hints (array of 3), evaluationFocus (array of 3).
Make cases medically accurate and diverse. Return ONLY valid JSON array, no markdown.`;




          let aiCases = null;
          if (isGeminiConfigured()) {
            aiCases = await generateGeminiJson({ prompt: aiGenPrompt }).catch(() => null);
          }
          if (!aiCases && isGroqConfigured()) {
            aiCases = await generateGroqJson({ prompt: aiGenPrompt }).catch(() => null);
          }
          if (!aiCases && isOpenAIConfigured()) {
            aiCases = await generateOpenAIJson({ prompt: aiGenPrompt }).catch(() => null);
          }
          if (!aiCases && await isOllamaAvailable()) {
            aiCases = await generateOllamaJson({ prompt: aiGenPrompt }).catch(() => null);
          }
          
          const generated = [];
          if (aiCases) {
            let casesArray = [];
            if (Array.isArray(aiCases)) {
              casesArray = aiCases;
            } else if (aiCases.cases && Array.isArray(aiCases.cases)) {
              casesArray = aiCases.cases;
            } else if (aiCases.caseStudies && Array.isArray(aiCases.caseStudies)) {
              casesArray = aiCases.caseStudies;
            } else {
              casesArray = [aiCases];
            }

            for (let i = 0; i < casesArray.length; i++) {
              const aiCase = casesArray[i];
              if (!aiCase) continue;
              const caseId = `ai-${specialty.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`;
              const fullCase = {
                ...aiCase,
                id: caseId,
                specialty: specialty,
                keywords: [],
                scriptedAnswers: [],
                fallbackResponses: [
                  "I'm not sure what else to tell you, doctor.",
                  "Can you ask me something more specific?",
                  "I've told you everything I can think of."
                ]
              };
              aiCaseCache.set(caseId, fullCase);
              generated.push(fullCase);
            }
            console.log(`[AI Case Gen] Generated ${generated.length} cases for ${specialty}`);
          }

          return generated;
        };

        if (freshRequested) {
          console.log(`[AI Case Gen] Fresh case requested for "${specialtyFilter}"`);
          try {
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 45000));
            const generated = await Promise.race([generateSpecialtyCases(1, specialtyFilter), timeout]);
            if (generated && generated.length > 0) {
              filteredCases = [
                ...generated,
                ...filteredCases.filter(c => c.id !== excludedCaseId && !generated.find(g => g.id === c.id))
              ];
            }
          } catch (err) {
            console.error(`[AI Case Gen] Fresh generation failed/timed out for ${specialtyFilter}:`, err.message);
          }
        }

        if (excludedCaseId && filteredCases.length > 1) {
          const withoutExcluded = filteredCases.filter(c => c.id !== excludedCaseId);
          if (withoutExcluded.length > 0) filteredCases = withoutExcluded;
        }

        if (filteredCases.length === 0) {
          // NO matching cases at all — we MUST wait for AI to generate at least one
          console.log(`[AI Case Gen] No cases for "${specialtyFilter}", generating 1 with AI to unblock...`);
          try {
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 45000));
            const generated = await Promise.race([generateSpecialtyCases(1, specialtyFilter), timeout]);
            filteredCases = generated;
            
            // Generate 2 more in background
            console.log(`[AI Case Gen] Background generating 2 more for "${specialtyFilter}"`);
            generateSpecialtyCases(2, specialtyFilter).catch(err => {
              console.error(`[AI Case Gen] Background generation failed:`, err.message);
            });
          } catch (err) {
            console.error(`[AI Case Gen] Failed/timed out for ${specialtyFilter}:`, err.message);
          }
        } else if (filteredCases.length < 3) {
          // Have some cases — return them immediately, generate more in the background
          const casesToGenerate = 3 - filteredCases.length;
          console.log(`[AI Case Gen] Background generating ${casesToGenerate} more for "${specialtyFilter}"`);
          generateSpecialtyCases(casesToGenerate, specialtyFilter).catch(err => {
            console.error(`[AI Case Gen] Background generation failed:`, err.message);
          });
          // Don't await — respond immediately with what we have
        }
      }

      // Return ONLY specialty-matched cases (no random backfill from other specialties)
      sendJson(response, 200, { 
        cases: filteredCases.map(sanitizeCase), 
        specialty: specialtyFilter || null,
        generated: specialtyFilter && filteredCases.some(c => c.id?.startsWith('ai-')),
        totalAvailable: filteredCases.length,
        requestId 
      }, context);
      return;
    }

    const caseParams = routeMatches(pathname, "/api/cases/:caseId");
    if (caseParams) {
      if (request.method !== "GET") {
        methodNotAllowed(response, context);
        return;
      }

      const caseStudy = getCaseById(caseParams.caseId);
      if (!caseStudy) {
        notFound(response, context, "Case not found");
        return;
      }

      sendJson(response, 200, { case: sanitizeCase(caseStudy), requestId }, context);
      return;
    }

    if (pathname === "/api/admin/analytics") {
      if (request.method !== "GET") {
        methodNotAllowed(response, context);
        return;
      }

      if (!assertAdminAccess(request, response, context)) {
        return;
      }

      const analytics = await storage.getAnalytics();
      sendJson(response, 200, {
        storage: getStorageMode(),
        analytics: {
          ...analytics,
          recentSessions: analytics.recentSessions.map(sanitizeSessionForAdmin)
        },
        requestId
      }, context);
      return;
    }

    if (pathname === "/api/admin/sessions") {
      if (request.method !== "GET") {
        methodNotAllowed(response, context);
        return;
      }

      if (!assertAdminAccess(request, response, context)) {
        return;
      }

      const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 20)));
      const sessions = await storage.listSessions(limit);
      sendJson(response, 200, {
        storage: getStorageMode(),
        sessions: sessions.map(sanitizeSessionForAdmin),
        requestId
      }, context);
      return;
    }


    if (pathname === "/api/users/register") {
      if (request.method !== "POST") { methodNotAllowed(response, context); return; }
      const body = await parseJsonBody(request);
      const regError = validateUserRegister(body);
      if (regError) { badRequest(response, context, regError); return; }

      try {
        // Hash password before storing
        if (body.password) {
          body.passwordHash = await hashPassword(body.password);
          delete body.password;
        }
        const user = await storage.createUser(body);
        sendJson(response, 201, { user: sanitizeUser(user), requestId }, context);
      } catch (err) {
        sendJson(response, 409, { error: err.message, requestId }, context);
      }
      return;
    }

    if (pathname === "/api/users/login") {
      if (request.method !== "POST") { methodNotAllowed(response, context); return; }
      const body = await parseJsonBody(request);
      const loginError = validateUserLogin(body);
      if (loginError) { badRequest(response, context, loginError); return; }

      const user = await storage.getUserByEmail(body.email);
      if (!user) { notFound(response, context, "No account found with this email. Please register first."); return; }

      // Verify password — supports hashed (passwordHash) and legacy plain-text (password)
      const storedCredential = user.passwordHash || user.password || null;
      const isValid = storedCredential
        ? await verifyPassword(body.password, storedCredential)
        : true; // No password stored = allow (legacy demo accounts)
      if (!isValid) {
        sendJson(response, 401, { error: "Incorrect password. Please try again.", requestId }, context);
        return;
      }
      sendJson(response, 200, { user: sanitizeUser(user), requestId }, context);
      return;
    }

    const userParams = routeMatches(pathname, "/api/users/:userId");
    if (userParams) {
      const user = await storage.getUserById(userParams.userId);
      if (!user) { notFound(response, context, "User not found"); return; }

      if (request.method === "GET") {
        sendJson(response, 200, { user: sanitizeUser(user), requestId }, context);
        return;
      }
      if (request.method === "PUT") {
        const body = await parseJsonBody(request);
        const updateError = validateUserUpdate(body);
        if (updateError) { badRequest(response, context, updateError); return; }
        const updated = await storage.updateUser(userParams.userId, body);
        sendJson(response, 200, { user: sanitizeUser(updated), requestId }, context);
        return;
      }
      methodNotAllowed(response, context);
      return;
    }

    const userSessionsParams = routeMatches(pathname, "/api/users/:userId/sessions");
    if (userSessionsParams) {
      if (request.method !== "GET") { methodNotAllowed(response, context); return; }
      const user = await storage.getUserById(userSessionsParams.userId);
      if (!user) { notFound(response, context, "User not found"); return; }

      const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50)));
      const userSessions = await storage.getUserSessions(userSessionsParams.userId, limit);
      sendJson(response, 200, {
        user: sanitizeUser(user),
        sessions: userSessions.map((s) => ({
          id: s.id,
          caseId: s.caseId,
          status: s.status || "active",
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          messageCount: s.messages.length,
          questionsAsked: s.messages.filter((m) => m.role === "user").length,
          lastEvaluation: s.lastEvaluation ? {
            score: s.lastEvaluation.score,
            diagnosisCorrect: s.lastEvaluation.diagnosisCorrect,
            provider: s.lastEvaluation.provider
          } : null
        })),
        requestId
      }, context);
      return;
    }

    const userProgressParams = routeMatches(pathname, "/api/users/:userId/progress");
    if (userProgressParams) {
      if (request.method !== "GET") { methodNotAllowed(response, context); return; }
      const user = await storage.getUserById(userProgressParams.userId);
      if (!user) { notFound(response, context, "User not found"); return; }

      const progress = await storage.getUserProgress(userProgressParams.userId);
      sendJson(response, 200, { user: sanitizeUser(user), progress, requestId }, context);
      return;
    }


    if (pathname === "/api/sessions") {
      if (request.method !== "POST") {
        methodNotAllowed(response, context);
        return;
      }

      const body = await parseJsonBody(request);
      
      // For AI-generated cases, accept inline case data
      let caseStudy = getCaseById(body.caseId);
      
      if (!caseStudy && body.caseData) {
        // AI-generated case passed from frontend
        caseStudy = {
          ...body.caseData,
          id: body.caseId,
          keywords: body.caseData.keywords || [],
          scriptedAnswers: body.caseData.scriptedAnswers || [],
          fallbackResponses: body.caseData.fallbackResponses || [
            "I'm not sure what else to tell you, doctor.",
            "Can you ask me something more specific?",
            "I've told you everything I can think of."
          ]
        };
        // Cache it for use during the session
        aiCaseCache.set(body.caseId, caseStudy);
      }
      
      if (!caseStudy) {
        // Check AI cache
        caseStudy = aiCaseCache.get(body.caseId);
      }
      
      if (!caseStudy) {
        badRequest(response, context, "Invalid case ID");
        return;
      }

      let sessionUserId = body.userId;
      if (sessionUserId) {
        // If Supabase is active, ensure the ID is a valid UUID, otherwise it crashes with 22P02
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionUserId);
        if (getStorageMode() === 'supabase' && !isUuid) {
          console.warn(`[Sessions] Invalid UUID for user: ${sessionUserId}. Falling back to anonymous session.`);
          sessionUserId = null;
        }
      }

      const session = await createSession(caseStudy, body.learnerName, sessionUserId);
      sendJson(response, 201, {
        session: {
          id: session.id,
          userId: session.userId,
          learnerName: session.learnerName,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          case: sanitizeCase(caseStudy),
          messages: session.messages
        },
        requestId
      }, context);
      return;
    }

    const sessionParams = routeMatches(pathname, "/api/sessions/:sessionId");
    if (sessionParams) {
      const session = await storage.getSession(sessionParams.sessionId);
      if (!session) {
        notFound(response, context, "Session not found");
        return;
      }

      if (request.method !== "GET") {
        methodNotAllowed(response, context);
        return;
      }

      sendSession(response, session, context);
      return;
    }

    const messageParams = routeMatches(pathname, "/api/sessions/:sessionId/messages");
    if (messageParams) {
      if (request.method !== "POST") {
        methodNotAllowed(response, context);
        return;
      }

      const session = await storage.getSession(messageParams.sessionId);
      if (!session) {
        notFound(response, context, "Session not found");
        return;
      }

      const body = await parseJsonBody(request);
      const messageError = validateMessageCreate(body);
      if (messageError) {
        badRequest(response, context, messageError);
        return;
      }

      const messageText = body.message.trim();
      const caseStudy = getCaseById(session.caseId);
      const learnerMessage = {
        id: randomUUID(),
        role: "user",
        text: messageText,
        createdAt: new Date().toISOString()
      };

      let replyText;
      let replyProvider = "local-scripted";
      let replyModel = "local-scripted";

      const { systemInstruction, prompt } = buildGeminiPrompt(caseStudy, session.messages, messageText);

      if (isGeminiConfigured() && !replyText) {
        try {
          replyText = await generateGeminiReply({ prompt, systemInstruction });
          replyProvider = "gemini";
          replyModel = GEMINI_MODEL;
        } catch (error) {
          console.error("[AI Cascade] Gemini failed:", error.message);
        }
      }

      if (isGroqConfigured() && !replyText) {
        try {
          replyText = await generateGroqReply({ prompt, systemInstruction });
          replyProvider = "groq";
          replyModel = GROQ_MODEL;
        } catch (error) {
          console.error("[AI Cascade] Groq failed:", error.message);
        }
      }

      if (isOpenAIConfigured() && !replyText) {
        try {
          replyText = await generateOpenAIReply({ prompt, systemInstruction });
          replyProvider = "openai";
          replyModel = OPENAI_MODEL;
        } catch (error) {
          console.error("[AI Cascade] OpenAI failed:", error.message);
        }
      }

      if (await isOllamaAvailable() && !replyText) {
        try {
          replyText = await generateOllamaReply({ prompt, systemInstruction });
          replyProvider = "ollama";
          replyModel = OLLAMA_MODEL;
        } catch (error) {
          console.error("[AI Cascade] Ollama failed:", error.message);
        }
      }

      if (!replyText) {
        replyText = buildPatientReply(caseStudy, session.messages, messageText);
      }

      const patientReply = {
        id: randomUUID(),
        role: "assistant",
        text: replyText,
        createdAt: new Date().toISOString()
      };

      await storage.appendMessages(session.id, [learnerMessage, patientReply]);

      sendJson(response, 201, {
        message: learnerMessage,
        reply: patientReply,
        sessionId: session.id,
        provider: replyProvider,
        model: replyModel,
        requestId
      }, context);
      return;
    }

    const evalParams = routeMatches(pathname, "/api/sessions/:sessionId/evaluate");
    if (evalParams) {
      if (request.method !== "POST") {
        methodNotAllowed(response, context);
        return;
      }

      const session = await storage.getSession(evalParams.sessionId);
      if (!session) {
        notFound(response, context, "Session not found");
        return;
      }

      const body = await parseJsonBody(request);
      const evaluationError = validateEvaluation(body);
      if (evaluationError) {
        badRequest(response, context, evaluationError);
        return;
      }

      const caseStudy = getCaseById(session.caseId);
      const evaluation = evaluateSubmission({
        caseStudy,
        messages: session.messages,
        diagnosis: body.diagnosis,
        reasoning: body.reasoning
      });

      let geminiEvaluation = null;
      let evalProvider = "local-rubric";
      let evalModel = "local-rubric";

      const evalPrompt = buildGeminiEvaluationPrompt(
        caseStudy,
        session.messages,
        body.diagnosis,
        body.reasoning
      );

      if (isGeminiConfigured() && !geminiEvaluation) {
        geminiEvaluation = await generateGeminiJson({ prompt: evalPrompt }).catch(() => null);
        if (geminiEvaluation) {
          evalProvider = "gemini";
          evalModel = GEMINI_MODEL;
        }
      }
      
      if (isGroqConfigured() && !geminiEvaluation) {
        geminiEvaluation = await generateGroqJson({ prompt: evalPrompt }).catch(() => null);
        if (geminiEvaluation) {
          evalProvider = "groq";
          evalModel = GROQ_MODEL;
        }
      }
      
      if (isOpenAIConfigured() && !geminiEvaluation) {
        geminiEvaluation = await generateOpenAIJson({ prompt: evalPrompt }).catch(() => null);
        if (geminiEvaluation) {
          evalProvider = "openai";
          evalModel = OPENAI_MODEL;
        }
      }

      if (await isOllamaAvailable() && !geminiEvaluation) {
        geminiEvaluation = await generateOllamaJson({ prompt: evalPrompt }).catch(() => null);
        if (geminiEvaluation) {
          evalProvider = "ollama";
          evalModel = OLLAMA_MODEL;
        }
      }

      const mergedEvaluation = geminiEvaluation
        ? {
            score: Number.isFinite(Number(geminiEvaluation.score))
              ? Math.max(0, Math.min(100, Math.round(Number(geminiEvaluation.score))))
              : evaluation.score,
            diagnosisCorrect: typeof geminiEvaluation.diagnosisCorrect === "boolean"
              ? geminiEvaluation.diagnosisCorrect
              : evaluation.diagnosisCorrect,
            strengths: Array.isArray(geminiEvaluation.strengths) && geminiEvaluation.strengths.length
              ? geminiEvaluation.strengths
              : evaluation.strengths,
            improvements: Array.isArray(geminiEvaluation.improvements) && geminiEvaluation.improvements.length
              ? geminiEvaluation.improvements
              : evaluation.improvements,
            expectedLearningFocus: Array.isArray(geminiEvaluation.expectedLearningFocus) && geminiEvaluation.expectedLearningFocus.length
              ? geminiEvaluation.expectedLearningFocus
              : evaluation.expectedLearningFocus,
            feedbackSummary: typeof geminiEvaluation.feedbackSummary === "string" && geminiEvaluation.feedbackSummary.trim()
              ? geminiEvaluation.feedbackSummary.trim()
              : null,
            askedCoverage: evaluation.askedCoverage,
            likelyDiagnosis: typeof geminiEvaluation.likelyDiagnosis === "string" && geminiEvaluation.likelyDiagnosis.trim()
              ? geminiEvaluation.likelyDiagnosis.trim()
              : evaluation.likelyDiagnosis,
            differentialDiagnoses: Array.isArray(geminiEvaluation.differentialDiagnoses)
              ? geminiEvaluation.differentialDiagnoses
              : evaluation.differentialDiagnoses,
            redFlagsAddressed: Array.isArray(geminiEvaluation.redFlagsAddressed)
              ? geminiEvaluation.redFlagsAddressed
              : evaluation.redFlagsAddressed,
            redFlagsMissed: Array.isArray(geminiEvaluation.redFlagsMissed)
              ? geminiEvaluation.redFlagsMissed
              : evaluation.redFlagsMissed,
            expectedQuestionsCovered: Array.isArray(geminiEvaluation.expectedQuestionsCovered)
              ? geminiEvaluation.expectedQuestionsCovered
              : evaluation.expectedQuestionsCovered,
            expectedQuestionsMissed: Array.isArray(geminiEvaluation.expectedQuestionsMissed)
              ? geminiEvaluation.expectedQuestionsMissed
              : evaluation.expectedQuestionsMissed,
            recommendedTests: Array.isArray(geminiEvaluation.recommendedTests)
              ? geminiEvaluation.recommendedTests
              : evaluation.recommendedTests,
            communicationGoals: Array.isArray(geminiEvaluation.communicationGoals)
              ? geminiEvaluation.communicationGoals
              : evaluation.communicationGoals,
            communicationObservations: Array.isArray(geminiEvaluation.communicationObservations)
              ? geminiEvaluation.communicationObservations
              : evaluation.communicationObservations
          }
        : {
            ...evaluation,
            feedbackSummary: null
          };

      const savedEvaluation = {
        ...mergedEvaluation,
        diagnosisSubmitted: body.diagnosis || null,
        reasoningSubmitted: body.reasoning || null,
        provider: evalProvider,
        model: evalModel,
        createdAt: new Date().toISOString()
      };

      await storage.saveEvaluation(session.id, savedEvaluation);

      sendJson(response, 200, {
        sessionId: session.id,
        evaluation: savedEvaluation,
        requestId
      }, context);
      return;
    }

    const reportParams = routeMatches(pathname, "/api/sessions/:sessionId/report");
    if (reportParams) {
      if (request.method !== "GET") {
        methodNotAllowed(response, context);
        return;
      }

      const session = await storage.getSession(reportParams.sessionId);
      if (!session) {
        notFound(response, context, "Session not found");
        return;
      }

      const caseStudy = getCaseById(session.caseId);
      if (!caseStudy) {
        notFound(response, context, "Case not found");
        return;
      }

      const evaluation = session.lastEvaluation;
      const conversation = session.messages
        .map((m) => `${m.role === "assistant" ? "Patient" : "Doctor"}: ${m.text}`)
        .join("\n");

      let reportContent;

      const reportPrompt = [
        "Generate a professional clinical visit report for a medical simulation session.",
        "The report should look like a real hospital/clinic visit report that a doctor would create after seeing a patient.",
        "Use the following format with clear sections:",
        "",
        "1. PATIENT INFORMATION (name, age, gender, specialty)",
        "2. CHIEF COMPLAINT",
        "3. HISTORY OF PRESENT ILLNESS (based on the conversation)",
        "4. REVIEW OF SYSTEMS (based on what was discussed)",
        "5. VITAL SIGNS",
        "6. ASSESSMENT (provisional diagnosis and clinical reasoning)",
        "7. PLAN (recommended tests, follow-up, treatment suggestions)",
        "8. CLINICAL PERFORMANCE EVALUATION (score, strengths, areas for improvement)",
        "",
        `Patient: ${caseStudy.name}`,
        `Age: ${caseStudy.age}`,
        `Specialty: ${caseStudy.specialty}`,
        `Chief Complaint: ${caseStudy.complaint}`,
        `Vitals: ${caseStudy.vitals}`,
        `History: ${caseStudy.history}`,
        "",
        "Doctor-Patient Conversation:",
        conversation,
        "",
        evaluation ? [
          "Evaluation Results:",
          `Score: ${evaluation.score}/100`,
          `Diagnosis Submitted: ${evaluation.diagnosisSubmitted || "Not provided"}`,
          `Diagnosis Correct: ${evaluation.diagnosisCorrect ? "Yes" : "No"}`,
          `Likely Diagnosis: ${evaluation.likelyDiagnosis || "N/A"}`,
          `Strengths: ${(evaluation.strengths || []).join(", ")}`,
          `Improvements: ${(evaluation.improvements || []).join(", ")}`,
          `Recommended Tests: ${(evaluation.recommendedTests || []).join(", ")}`,
        ].join("\n") : "No evaluation submitted yet.",
        "",
        "Return the report as clean, structured text with clear headers and bullet points.",
        "Make it look professional and clinical.",
        "Date the report with today's date.",
      ].join("\n");

      if (isGeminiConfigured()) {
        try {
          reportContent = await generateGeminiReply({ prompt: reportPrompt, maxOutputTokens: 2048 });
        } catch (error) {
          reportContent = null;
        }
      }

      // Fallback to OpenAI if Gemini not configured or failed
      if (!reportContent && isOpenAIConfigured()) {
        try {
          reportContent = await generateOpenAIReply({ prompt: reportPrompt, maxTokens: 2048 });
        } catch (error) {
          reportContent = null;
        }
      }

      // Fallback to Ollama if OpenAI also not available
      if (!reportContent && await isOllamaAvailable()) {
        try {
          reportContent = await generateOllamaReply({ prompt: reportPrompt, maxOutputTokens: 2048 });
        } catch (error) {
          reportContent = null;
        }
      }

      // Fallback if Gemini fails
      if (!reportContent) {
        const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        reportContent = [
          `CLINICAL VISIT REPORT`,
          `Date: ${now}`,
          ``,
          `PATIENT INFORMATION`,
          `Name: ${caseStudy.name}`,
          `Age: ${caseStudy.age}`,
          `Specialty: ${caseStudy.specialty}`,
          ``,
          `CHIEF COMPLAINT`,
          `${caseStudy.complaint}`,
          ``,
          `VITAL SIGNS`,
          `${caseStudy.vitals}`,
          ``,
          `HISTORY`,
          `${caseStudy.history}`,
          ``,
          `CONVERSATION SUMMARY`,
          `Total questions asked: ${session.messages.filter(m => m.role === "user").length}`,
          `Total responses: ${session.messages.filter(m => m.role === "assistant").length}`,
          ``,
          evaluation ? [
            `ASSESSMENT`,
            `Score: ${evaluation.score}/100`,
            `Diagnosis: ${evaluation.diagnosisSubmitted || "Not submitted"}`,
            `Correct: ${evaluation.diagnosisCorrect ? "Yes" : "No"}`,
            `Likely Diagnosis: ${evaluation.likelyDiagnosis || "N/A"}`,
          ].join("\n") : "ASSESSMENT\nNo evaluation submitted.",
        ].join("\n");
      }

      sendJson(response, 200, {
        report: reportContent,
        patient: {
          name: caseStudy.name,
          age: caseStudy.age,
          specialty: caseStudy.specialty,
          complaint: caseStudy.complaint,
          vitals: caseStudy.vitals
        },
        evaluation: evaluation ? {
          score: evaluation.score,
          diagnosisCorrect: evaluation.diagnosisCorrect,
          diagnosisSubmitted: evaluation.diagnosisSubmitted,
          likelyDiagnosis: evaluation.likelyDiagnosis
        } : null,
        messages: session.messages,
        sessionId: session.id,
        requestId
      }, context);
      return;
    }

    notFound(response, context);
  } catch (error) {
    if (!isProduction()) {
      console.error(`[${requestId}]`, error);
    }

    sendJson(response, 500, {
      error: "Internal server error",
      detail: isProduction() ? "An unexpected error occurred." : error.message,
      requestId
    }, context);
  }
});

if (require.main === module) {
  // Start periodic rate-limiter cleanup to prevent memory leaks
  startCleanupTimer(config.rateLimitWindowMs);

  server.listen(config.port, async () => {
    const ollamaReady = await isOllamaAvailable();
    console.log(`AI Virtual Patient Simulator backend running on http://localhost:${config.port}`);
    console.log(`Storage: ${getStorageMode()} | Gemini: ${isGeminiConfigured() ? "enabled" : "disabled"} | Groq: ${isGroqConfigured() ? `enabled (${GROQ_MODEL})` : "disabled"} | OpenAI: ${isOpenAIConfigured() ? `enabled (${OPENAI_MODEL})` : "disabled"} | Ollama: ${ollamaReady ? `enabled (${OLLAMA_MODEL})` : "disabled"}`);
    if (isGeminiConfigured()) {
      console.log(`→ Using Gemini (${GEMINI_MODEL}) as primary AI provider`);
    } else if (isGroqConfigured()) {
      console.log(`→ Using Groq (${GROQ_MODEL}) as primary AI provider`);
    } else if (isOpenAIConfigured()) {
      console.log(`→ Using OpenAI (${OPENAI_MODEL}) as primary AI provider`);
    } else if (ollamaReady) {
      console.log(`→ Using Ollama (${OLLAMA_MODEL}) as primary AI provider`);
    } else {
      console.log(`⚠  No AI provider available! Using local scripted responses only.`);
      console.log(`   To fix: run 'ollama pull qwen2.5:7b' or set GEMINI_API_KEY or GROQ_API_KEY`);
    }
  });

  // Graceful shutdown
  function shutdown(signal) {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
    // Force exit after 5 seconds if connections haven't drained
    setTimeout(() => process.exit(1), 5000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

module.exports = server;
