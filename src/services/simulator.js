function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function buildPatientReply(caseStudy, messages, question) {
  const normalized = normalizeText(question);
  const matched = caseStudy.scriptedAnswers.find((item) =>
    item.match.some((token) => normalized.includes(token))
  );

  if (matched) {
    return matched.answer;
  }

  const learnerTurns = messages.filter((entry) => entry.role === "user").length;
  return caseStudy.fallbackResponses[learnerTurns % caseStudy.fallbackResponses.length];
}

function buildGeminiPrompt(caseStudy, messages, latestQuestion) {
  const conversation = messages
    .slice(-20)
    .map((entry) => `${entry.role === "assistant" ? "Patient" : "Doctor"}: ${entry.text}`)
    .join("\n");

  const systemInstruction = [
    "You are simulating a virtual patient for medical education.",
    "Stay in character as the patient at all times.",
    "Do not act like a doctor, evaluator, or narrator.",
    "Do not reveal the diagnosis unless the patient would realistically know it.",
    "",
    "RULE #1 — HIGHEST PRIORITY — GREETINGS:",
    "If the doctor's message is a greeting like 'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'how are you', 'assalam alaikum', or any casual greeting, you MUST respond with a greeting FIRST.",
    "Example responses to greetings:",
    "- 'Hello doctor, thank you for seeing me today.'",
    "- 'Hi doctor, I really appreciate you taking the time.'",
    "- 'Good morning doctor, I've been wanting to talk to someone about how I've been feeling.'",
    "You must NEVER skip the greeting. You must NEVER respond to 'hi' or 'hello' with medical symptoms directly. Always greet back warmly first.",
    "",
    "RULE #2 — CONVERSATION STYLE:",
    "- Do NOT volunteer detailed medical information unless the doctor specifically asks about it.",
    "- Wait for the doctor to ask specific medical questions before giving clinical details.",
    "- Keep answers concise, natural, and realistic — like a real patient would speak.",
    "- Match the personality described below in your tone and word choices.",
    "- If asked something outside the case, respond as an uncertain patient rather than inventing detailed clinical data.",
    "- Keep responses to 1-3 sentences maximum.",
    "",
    "Reply with only what the patient would say."
  ].join("\n");

  const prompt = [
    `[CRITICAL INSTRUCTION: You are the PATIENT (${caseStudy.name}). You are NOT the doctor. You are answering the doctor's questions. Respond ONLY with what the patient says. Do not include quotes or narrator text.]`,
    `--- Patient Profile ---`,
    `Name: ${caseStudy.name}`,
    `Age: ${caseStudy.age}`,
    `Occupation: ${caseStudy.role}`,
    `Personality: ${caseStudy.personality}`,
    `Chief complaint: ${caseStudy.complaint}`,
    `Summary: ${caseStudy.summary}`,
    `Vitals: ${caseStudy.vitals}`,
    `History snapshot: ${caseStudy.history}`,
    `Key facts: ${(caseStudy.keyFacts || []).map((fact) => `${fact?.label || 'Info'}: ${fact?.value || 'N/A'}`).join("; ")}`,
    `-----------------------`,
    "Recent conversation:",
    conversation || "No prior conversation.",
    "",
    `Doctor: ${latestQuestion}`,
    `Patient (${caseStudy.name}):`
  ].join("\n");

  return { systemInstruction, prompt };
}

function buildGeminiEvaluationPrompt(caseStudy, messages, diagnosis, reasoning) {
  const conversation = messages
    .map((entry) => `${entry.role === "assistant" ? "Patient" : "Doctor"}: ${entry.text}`)
    .join("\n");

  return [
    "You are an educational clinical skills evaluator for a virtual patient simulator.",
    "Evaluate the learner's history-taking and provisional diagnosis.",
    "This is training feedback only, not real medical advice.",
    "Be concise, fair, and rubric-based.",
    "Return only valid JSON with the exact keys:",
    "score, diagnosisCorrect, strengths, improvements, expectedLearningFocus, feedbackSummary, likelyDiagnosis, differentialDiagnoses, redFlagsAddressed, redFlagsMissed, expectedQuestionsCovered, expectedQuestionsMissed, recommendedTests, communicationGoals, communicationObservations",
    "Rules:",
    "- score must be an integer from 0 to 100",
    "- diagnosisCorrect must be true or false",
    "- strengths must be an array of short strings",
    "- improvements must be an array of short strings",
    "- expectedLearningFocus must be an array of short strings",
    "- likelyDiagnosis must be a short string",
    "- differentialDiagnoses must be an array of short strings",
    "- redFlagsAddressed must be an array of short strings",
    "- redFlagsMissed must be an array of short strings",
    "- expectedQuestionsCovered must be an array of short strings",
    "- expectedQuestionsMissed must be an array of short strings",
    "- recommendedTests must be an array of short strings",
    "- communicationGoals must be an array of short strings",
    "- communicationObservations must be an array of short strings",
    "- feedbackSummary must be a short paragraph string",
    "",
    `Case: ${caseStudy.name} - ${caseStudy.complaint}`,
    `Specialty: ${caseStudy.specialty}`,
    `Summary: ${caseStudy.summary}`,
    `Vitals: ${caseStudy.vitals}`,
    `History snapshot: ${caseStudy.history}`,
    `Expected likely diagnoses: ${(caseStudy.expectedDiagnosis || []).join(", ")}`,
    `Differential diagnoses: ${(caseStudy.differentialDiagnoses || []).join(", ")}`,
    `Red flags: ${(caseStudy.redFlags || []).join(", ")}`,
    `Expected questions: ${(caseStudy.expectedQuestions || []).join(", ")}`,
    `Recommended tests: ${(caseStudy.recommendedTests || []).join(", ")}`,
    `Communication goals: ${(caseStudy.communicationGoals || []).join(", ")}`,
    `Learning focus: ${(caseStudy.evaluationFocus || []).join(", ")}`,
    "",
    "Conversation transcript:",
    conversation || "No conversation.",
    "",
    `Learner diagnosis: ${diagnosis || "Not provided"}`,
    `Learner reasoning: ${reasoning || "Not provided"}`,
    "",
    "Return only JSON."
  ].join("\n");
}

function evaluateSubmission({ caseStudy, messages, diagnosis, reasoning }) {
  const normalizedDiagnosis = normalizeText(diagnosis);
  const normalizedReasoning = normalizeText(reasoning);
  const askedQuestions = messages
    .filter((entry) => entry.role === "user")
    .map((entry) => normalizeText(entry.text));

  const askedCoverage = (caseStudy.keywords || []).filter((keyword) =>
    askedQuestions.some((question) => question.includes(keyword))
  );

  let score = 0;
  const diagnosisCorrect = (caseStudy.expectedDiagnosis || []).some((expected) =>
    normalizedDiagnosis.includes(expected)
  );

  if (diagnosisCorrect) {
    score += 45;
  }

  const coverageScore = Math.min(30, askedCoverage.length * 5);
  score += coverageScore;

  const reasoningHits = (caseStudy.expectedDiagnosis || []).filter((expected) =>
    normalizedReasoning.includes(expected.split(" ")[0])
  );

  if (normalizedReasoning.length > 40) {
    score += 15;
  }

  score += Math.min(10, reasoningHits.length * 5);
  score = Math.min(100, score);

  const strengths = [];
  const improvements = [];
  const coveredExpectedQuestions = (caseStudy.expectedQuestions || []).filter((question) => {
    const anchorWords = normalizeText(question).split(" ").filter((word) => word.length > 4).slice(0, 3);
    return anchorWords.some((word) =>
      askedQuestions.some((askedQuestion) => askedQuestion.includes(word))
    );
  });
  const missedExpectedQuestions = (caseStudy.expectedQuestions || []).filter(
    (question) => !coveredExpectedQuestions.includes(question)
  );
  const redFlagsAddressed = (caseStudy.redFlags || []).filter((flag) => {
    const keywords = normalizeText(flag).split(" ").filter((word) => word.length > 4);
    return keywords.some((word) =>
      askedQuestions.some((askedQuestion) => askedQuestion.includes(word)) ||
      normalizedReasoning.includes(word)
    );
  });
  const redFlagsMissed = (caseStudy.redFlags || []).filter((flag) => !redFlagsAddressed.includes(flag));
  const communicationObservations = [];

  if (diagnosisCorrect) {
    strengths.push("Your provisional diagnosis matches the most likely clinical picture.");
  } else {
    improvements.push(`The likely diagnosis is closer to ${(caseStudy.expectedDiagnosis || ['unknown'])[0] || 'what is expected'}.`);
  }

  if (coverageScore >= 20) {
    strengths.push("You asked a broad enough set of history questions to uncover key clues.");
  } else {
    improvements.push("Ask more targeted questions about timing, risk factors, and associated symptoms.");
  }

  if (normalizedReasoning.length > 40) {
    strengths.push("You documented your reasoning instead of only naming a diagnosis.");
  } else {
    improvements.push("Expand your reasoning to connect symptoms and risk factors to the diagnosis.");
  }

  if (coveredExpectedQuestions.length >= 3) {
    strengths.push("You covered several of the most clinically relevant history questions.");
  } else {
    improvements.push("Cover more of the key history domains expected for this presentation.");
  }

  if (normalizedReasoning.includes("worried") || normalizedReasoning.includes("reassur") || normalizedReasoning.includes("explain")) {
    communicationObservations.push("Your reasoning suggests some attention to patient-centered communication.");
  } else {
    communicationObservations.push("Add explicit patient communication and explanation points to strengthen bedside performance.");
  }

  return {
    score,
    diagnosisCorrect,
    askedCoverage,
    strengths,
    improvements,
    expectedLearningFocus: caseStudy.evaluationFocus || [],
    likelyDiagnosis: (caseStudy.expectedDiagnosis || ['Unknown'])[0] || 'Unknown',
    differentialDiagnoses: caseStudy.differentialDiagnoses || [],
    redFlagsAddressed,
    redFlagsMissed,
    expectedQuestionsCovered: coveredExpectedQuestions,
    expectedQuestionsMissed: missedExpectedQuestions,
    recommendedTests: caseStudy.recommendedTests || [],
    communicationGoals: caseStudy.communicationGoals || [],
    communicationObservations
  };
}

function buildSessionSummary(session, caseStudy) {
  const learnerQuestions = session.messages.filter((entry) => entry.role === "user").length;
  return {
    learnerQuestions,
    caseName: caseStudy.name,
    caseSpecialty: caseStudy.specialty,
    lastEvaluationScore: session.lastEvaluation ? session.lastEvaluation.score : null
  };
}

module.exports = {
  buildPatientReply,
  buildGeminiPrompt,
  buildGeminiEvaluationPrompt,
  evaluateSubmission,
  buildSessionSummary
};
