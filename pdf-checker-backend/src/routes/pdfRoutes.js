const express = require('express');
const multer = require('multer');
const { analyzePdf } = require('../controllers/pdfController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }, 
});

// POST /api/pdf/analyze
router.post('/analyze', upload.single('file'), analyzePdf);

module.exports = router;
