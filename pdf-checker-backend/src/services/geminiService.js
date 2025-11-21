const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = 'gemini-2.0-flash'; 

function buildPrompt({ pdfText, rules }) {
  return `
You are checking a PDF document against user-defined rules.

Document text (may be truncated):
"""
${pdfText}
"""

User rules:
${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

For each rule, you must:
- Decide if the rule PASSES or FAILS.
- Find exactly ONE clear evidence sentence from the document.
- If possible, include a page number in the evidence like: "Found on page 2: '<quote>'".
- Provide a short reasoning (1–2 sentences) explaining why it passed or failed.
- Assign a numeric confidence score between 0 and 100 (no % symbol).

Return ONLY a JSON array of 3 objects in this exact format:
[
  {
    "rule": "original rule text",
    "status": "pass" or "fail",
    "evidence": "one concise evidence sentence, ideally with page number like 'Found on page 2: ...'",
    "reasoning": "short reasoning (1–2 sentences).",
    "confidence": 0-100
  }
]

Do not include any extra keys, comments, or text outside the JSON array.
`;
}

async function analyzeWithGemini({ pdfText, rules }) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  }); 

  const prompt = buildPrompt({ pdfText, rules });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text(); 

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse Gemini JSON:', text);
    throw new Error('LLM returned invalid JSON');
  }

  
  if (!Array.isArray(parsed)) {
    throw new Error('LLM result is not an array');
  }

  const cleaned = parsed.map(item => ({
    rule: String(item.rule || ''),
    status: item.status === 'pass' ? 'pass' : 'fail',
    evidence: String(item.evidence || ''),
    reasoning: String(item.reasoning || ''),
    confidence: Number.isFinite(item.confidence) ? item.confidence : 0,
  }));

  return cleaned;
}

module.exports = { analyzeWithGemini };
