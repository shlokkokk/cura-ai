// OpenAI via n8n Webhook Proxy
// Routes all OpenAI requests through n8n which holds the actual OpenAI API key

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function isOpenAIConfigured() {
  return Boolean(N8N_WEBHOOK_URL);
}

async function requestOpenAI({ prompt, systemInstruction, maxTokens = 300, responseFormat }) {
  if (!isOpenAIConfigured()) {
    throw new Error("n8n webhook URL is not configured.");
  }

  const requestBody = {
    prompt,
    systemInstruction: systemInstruction || "",
    maxTokens,
    responseFormat: responseFormat || "text"
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`n8n/OpenAI request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  
  // n8n AI Agent returns the output in various formats — handle them all
  let text = "";
  if (typeof data === "string") {
    text = data;
  } else if (data.output) {
    text = data.output;
  } else if (data.text) {
    text = data.text;
  } else if (data.message) {
    text = data.message;
  } else if (data.response) {
    text = data.response;
  } else if (Array.isArray(data) && data.length > 0) {
    // n8n sometimes returns array of results
    const first = data[0];
    text = first.output || first.text || first.message || first.response || JSON.stringify(first);
  } else {
    // Last resort — stringify the whole response
    text = JSON.stringify(data);
  }

  if (!text || text === "{}") {
    throw new Error("n8n/OpenAI returned an empty response.");
  }

  return text.trim();
}

async function generateOpenAIReply({ prompt, systemInstruction, maxTokens }) {
  return requestOpenAI({ prompt, systemInstruction, maxTokens });
}

function extractJsonBlock(text) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  // Try array
  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return text.slice(arrayStart, arrayEnd + 1);
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

async function generateOpenAIJson({ prompt }) {
  const text = await requestOpenAI({
    prompt: prompt + "\n\nRespond with ONLY valid JSON, no markdown or explanation.",
    responseFormat: "json",
    maxTokens: 8192
  });
  const jsonText = extractJsonBlock(text);
  return JSON.parse(jsonText);
}

module.exports = {
  generateOpenAIReply,
  generateOpenAIJson,
  isOpenAIConfigured,
  OPENAI_MODEL
};
