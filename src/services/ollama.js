/**
 * Ollama Local LLM Service
 * 
 * Connects to a locally running Ollama instance for AI-powered
 * patient simulation without requiring cloud API keys.
 * 
 * Default endpoint: http://localhost:11434
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b";

/**
 * Check if Ollama is reachable and has a model available
 */
async function isOllamaAvailable() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) return false;
    const data = await response.json();
    // Check if at least one model is available
    return Array.isArray(data.models) && data.models.length > 0;
  } catch {
    return false;
  }
}

/**
 * Generate a text completion using Ollama
 */
async function requestOllama({ prompt, systemInstruction, maxOutputTokens = 300 }) {
  const requestBody = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: maxOutputTokens
    }
  };

  if (systemInstruction) {
    requestBody.system = systemInstruction;
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(120_000) // 2 minute timeout for local models
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = (data.response || "").trim();

  if (!text) {
    throw new Error("Ollama returned an empty response.");
  }

  return text;
}

/**
 * Generate a plain-text reply using Ollama
 */
async function generateOllamaReply({ prompt, systemInstruction, maxOutputTokens }) {
  return requestOllama({ prompt, systemInstruction, maxOutputTokens });
}

/**
 * Generate a JSON response using Ollama
 * Ollama supports format: "json" to force JSON output
 */
async function generateOllamaJson({ prompt }) {
  const requestBody = {
    model: OLLAMA_MODEL,
    prompt: prompt + "\n\nIMPORTANT: Return ONLY a valid JSON object. No extra text before or after.",
    stream: false,
    format: "json",
    options: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 8192
    }
  };

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(180_000) // 3 minute timeout for JSON generation
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama JSON request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = (data.response || "").trim();

  if (!text) {
    throw new Error("Ollama returned an empty JSON response.");
  }

  // Try to extract JSON
  const jsonText = extractJsonBlock(text);
  return JSON.parse(jsonText);
}

function extractJsonBlock(text) {
  // Try fenced code block first
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  // Try raw JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

module.exports = {
  generateOllamaReply,
  generateOllamaJson,
  isOllamaAvailable,
  OLLAMA_MODEL,
  OLLAMA_BASE_URL
};
