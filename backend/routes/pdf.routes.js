const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdf.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Wrap controller methods with try-catch 
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all PDFs (with search, sort, and filter)
router.get('/', auth, asyncHandler(pdfController.getPDFs));

// Get single PDF
router.get('/:id', auth, asyncHandler(pdfController.getPDF));

// Download PDF
router.get('/:id/download', auth, asyncHandler(pdfController.downloadPDF));

// Upload PDF
router.post('/upload', auth, upload.single('file'), asyncHandler(pdfController.uploadPDF));

// Update PDF details
router.put('/:id', auth, asyncHandler(pdfController.updatePDF));

// Delete PDF
router.delete('/:id', auth, asyncHandler(pdfController.deletePDF));

module.exports = router;
