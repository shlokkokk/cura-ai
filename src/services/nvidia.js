const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct";

let rateLimitCooldownUntil = 0;

function isNvidiaRateLimited() {
  return Date.now() < rateLimitCooldownUntil;
}

function getNvidiaCooldownRemaining() {
  const remaining = rateLimitCooldownUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

function isNvidiaConfigured() {
  return Boolean(NVIDIA_API_KEY);
}

async function requestNvidia({ prompt, systemInstruction, maxTokens = 300, responseFormat, modelOverride, timeout = 45000 }) {
  if (!isNvidiaConfigured()) {
    throw new Error("Nvidia API key is not configured.");
  }

  if (isNvidiaRateLimited()) {
    const secs = getNvidiaCooldownRemaining();
    throw new Error(`Nvidia is temporarily rate-limited (cooldown active for another ${secs}s).`);
  }

  const endpoint = "https://integrate.api.nvidia.com/v1/chat/completions";
  const messages = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const selectedModel = modelOverride || NVIDIA_MODEL;

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
      "Authorization": `Bearer ${NVIDIA_API_KEY}`
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
      }
      rateLimitCooldownUntil = Date.now() + Math.max(cooldownMs, 10000); // minimum 10s
      console.warn(`\n[Nvidia Circuit Breaker] Tripped! Rate limit 429 reached. Cooldown active for ${Math.ceil(cooldownMs / 1000)}s.\n`);
    }
    throw new Error(`Nvidia request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Nvidia returned an empty response.");
  }

  return text;
}

async function generateNvidiaReply({ prompt, systemInstruction, maxTokens, modelOverride, timeout }) {
  return requestNvidia({ prompt, systemInstruction, maxTokens, modelOverride, timeout });
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

async function generateNvidiaJson({ prompt, modelOverride, timeout }) {
  const text = await requestNvidia({
    prompt: prompt + "\n\nRespond with ONLY valid JSON, no markdown or explanation.",
    responseFormat: "json",
    maxTokens: 8192,
    modelOverride,
    timeout
  });
  const jsonText = extractJsonBlock(text);
  return JSON.parse(jsonText);
}

module.exports = {
  generateNvidiaReply,
  generateNvidiaJson,
  isNvidiaConfigured,
  NVIDIA_MODEL
};
