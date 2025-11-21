const { analyzePdfService } = require('../services/pdfService');

async function analyzePdf(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required',
      });
    }

    const { rule1, rule2, rule3 } = req.body;

    const { summaryData } = await analyzePdfService({
      file: req.file,
      rules: [rule1, rule2, rule3],
    });

    return res.json({
      success: true,
      message: 'PDF parsed and rules captured successfully',
      data: summaryData,
    });
  } catch (err) {
    console.error('Analyze PDF error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to analyze PDF',
    });
  }
}

module.exports = { analyzePdf };
