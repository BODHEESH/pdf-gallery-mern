const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const {
  uploadPDF,
  getPDFs,
  getPDF,
  deletePDF,
  downloadPdf,
} = require('../controllers/pdf.controller');
const upload = require('../middleware/upload.middleware');

router.post('/upload', auth, upload.single('file'), uploadPDF);
router.get('/', auth, getPDFs);
router.get('/:id', auth, getPDF);
router.delete('/:id', auth, deletePDF);
router.get('/:id/download', auth, downloadPdf);

module.exports = router;
