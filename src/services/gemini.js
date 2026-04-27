const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta";

function isGeminiConfigured() {
  return Boolean(GEMINI_API_KEY);
}

async function requestGemini({ prompt, systemInstruction, responseMimeType, maxOutputTokens = 300 }) {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`;
  
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens,
      ...(responseMimeType ? { responseMimeType } : {})
    }
  };

  // Add system instruction if provided (Gemini v1beta supports this)
  if (systemInstruction) {
    requestBody.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

async function generateGeminiReply({ prompt, systemInstruction, maxOutputTokens }) {
  return requestGemini({ prompt, systemInstruction, maxOutputTokens });
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

async function generateGeminiJson({ prompt }) {
  const text = await requestGemini({
    prompt,
    responseMimeType: "application/json",
    maxOutputTokens: 8192
  });
  const jsonText = extractJsonBlock(text);
  return JSON.parse(jsonText);
}

module.exports = {
  generateGeminiReply,
  generateGeminiJson,
  isGeminiConfigured,
  GEMINI_MODEL
};
