const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function isGroqConfigured() {
  return Boolean(GROQ_API_KEY);
}

async function requestGroq({ prompt, systemInstruction, maxTokens = 300, responseFormat }) {
  if (!isGroqConfigured()) {
    throw new Error("Groq API key is not configured.");
  }

  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const messages = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const requestBody = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
    ...(responseFormat === "json" ? { response_format: { type: "json_object" } } : {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}

async function generateGroqReply({ prompt, systemInstruction, maxTokens }) {
  return requestGroq({ prompt, systemInstruction, maxTokens });
}

function extractJsonBlock(text) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

async function generateGroqJson({ prompt }) {
  const text = await requestGroq({
    prompt: prompt + "\n\nRespond with ONLY valid JSON, no markdown wrapper or explanation.",
    responseFormat: "json",
    maxTokens: 4096
  });
  const jsonText = extractJsonBlock(text);
  return JSON.parse(jsonText);
}

module.exports = {
  generateGroqReply,
  generateGroqJson,
  isGroqConfigured,
  GROQ_MODEL
};
