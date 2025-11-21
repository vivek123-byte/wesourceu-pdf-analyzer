const { extractTextFromBuffer } = require("../utils/pdfExtractor");
const { analyzeWithGemini } = require("./geminiService");

async function analyzePdfService({ file, rules }) {
  const cleanedRules = rules
    .map((r) => (r || "").trim())
    .filter((r) => r.length > 0);

  if (cleanedRules.length === 0) {
    throw new Error("At least one rule is required");
  }

  const { totalPages, text } = await extractTextFromBuffer(file.buffer);

  // checks 2–10 page PDFs constraints
  if (totalPages < 2 || totalPages > 10) {
    throw new Error("PDF must be between 2 and 10 pages.");
  }

  const maxChars = 15000;
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

  //Call Gemini
  let llmResults = await analyzeWithGemini({
    pdfText: truncatedText,
    rules: cleanedRules,
  });

  llmResults = llmResults.map((item) => {
    const normalizedRule = (item.rule || "").toLowerCase();

    if (
      normalizedRule.includes("at least 2 page") ||
      normalizedRule.includes("at least two page")
    ) {
      const passed = totalPages >= 2;

      return {
        ...item,
        status: passed ? "pass" : "fail",
        evidence: passed
          ? `Document has ${totalPages} pages, which is at least 2.`
          : `Document has only ${totalPages} page(s), which is less than 2.`,
        reasoning: passed
          ? "Using the PDF metadata, the document length satisfies the minimum page requirement."
          : "Using the PDF metadata, the document length does not satisfy the minimum page requirement.",
        confidence: 100,
      };
    }

    return item;
  });

  const summaryData = {
    fileName: file.originalname,
    totalPages,
    results: llmResults,
  };

  return { summaryData };
}

module.exports = { analyzePdfService };
