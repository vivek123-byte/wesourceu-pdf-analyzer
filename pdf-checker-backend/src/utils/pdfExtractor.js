const { extractText, getDocumentProxy } = require('unpdf');

async function extractTextFromBuffer(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });

  return { totalPages, text };
}

module.exports = { extractTextFromBuffer };
