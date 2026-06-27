const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

let rateLimitCooldownUntil = 0;

function isGroqRateLimited() {
  return Date.now() < rateLimitCooldownUntil;
}

function getGroqCooldownRemaining() {
  const remaining = rateLimitCooldownUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

function isGroqConfigured() {
  return Boolean(GROQ_API_KEY);
}

async function requestGroq({ prompt, systemInstruction, maxTokens = 300, responseFormat, modelOverride, timeout = 30000 }) {
  if (!isGroqConfigured()) {
    throw new Error("Groq API key is not configured.");
  }

  if (isGroqRateLimited()) {
    const secs = getGroqCooldownRemaining();
    throw new Error(`Groq is temporarily rate-limited (cooldown active for another ${secs}s).`);
  }

  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const messages = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const selectedModel = modelOverride || GROQ_MODEL;

  const requestBody = {
    model: selectedModel,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
    ...(responseFormat === "json" ? { response_format: { type: "json_object" } } : {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

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
    if (response.status === 429) {
      let cooldownMs = 120000; // Default to 2 minutes
      const retryAfter = response.headers.get("retry-after");
      if (retryAfter) {
        const parsed = parseFloat(retryAfter);
        if (!isNaN(parsed) && parsed > 0) {
          cooldownMs = parsed * 1000;
        }
      } else {
        const xReset = response.headers.get("x-ratelimit-reset");
        if (xReset) {
          const parsed = parseFloat(xReset);
          if (!isNaN(parsed) && parsed > 0) {
            cooldownMs = parsed > 1e11 ? (parsed - Date.now()) : (parsed * 1000);
          }
        }
      }
      rateLimitCooldownUntil = Date.now() + Math.max(cooldownMs, 10000); // minimum 10s
      console.warn(`\n[Groq Circuit Breaker] Tripped! Rate limit 429 reached. Cooldown active for ${Math.ceil(cooldownMs / 1000)}s.\n`);
    }
    throw new Error(`Groq request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}

async function generateGroqReply({ prompt, systemInstruction, maxTokens, modelOverride, timeout }) {
  return requestGroq({ prompt, systemInstruction, maxTokens, modelOverride, timeout });
}

function extractJsonBlock(text) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const startArr = text.indexOf("[");
  const startObj = text.indexOf("{");

  if (startArr === -1 && startObj === -1) {
    return text.trim();
  }

  const start = (startArr !== -1 && (startObj === -1 || startArr < startObj)) ? startArr : startObj;
  const openChar = text[start];
  const closeChar = openChar === "[" ? "]" : "}";
  
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === openChar) {
        depth++;
      } else if (char === closeChar) {
        depth--;
        if (depth === 0) {
          return text.slice(start, i + 1);
        }
      }
    }
  }

  const lastClose = text.lastIndexOf(closeChar);
  if (lastClose > start) {
    return text.slice(start, lastClose + 1);
  }

  return text.trim();
}

async function generateGroqJson({ prompt, modelOverride, timeout }) {
  const text = await requestGroq({
    prompt: prompt + "\n\nRespond with ONLY valid JSON, no markdown wrapper or explanation.",
    responseFormat: "json",
    maxTokens: 4096,
    modelOverride,
    timeout
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
