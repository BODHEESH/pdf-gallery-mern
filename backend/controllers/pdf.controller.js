const PDF = require('../models/pdf.model');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}).single('pdf');

// Upload PDF
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { title, description, tags, isPublic } = req.body;
    
    const pdf = new PDF({
      title,
      description,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic === 'true'
    });

    await pdf.save();
    res.status(201).json({
      message: 'PDF uploaded successfully',
      pdf: {
        _id: pdf._id,
        title: pdf.title,
        description: pdf.description,
        fileSize: pdf.fileSize,
        tags: pdf.tags,
        isPublic: pdf.isPublic,
        createdAt: pdf.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ message: 'Error uploading PDF', error: error.message });
  }
};

// Get all PDFs (with enhanced search, sort, and filter)
exports.getPDFs = async (req, res) => {
  try {
    const { search = '', sort = 'newest', filter = 'all', searchBy = 'all' } = req.query;

    // Build query
    let query = {};

    // Enhanced search based on searchBy parameter
    if (search) {
      const searchTerms = search.split(',').map(term => term.trim()).filter(Boolean);
      
      if (searchBy === 'tags') {
        // Search only in tags array
        query.tags = {
          $in: searchTerms.map(term => new RegExp(term, 'i'))
        };
      } else if (searchBy === 'name') {
        // Search only in title
        query.title = { $regex: search, $options: 'i' };
      } else {
        // Search in all fields (default)
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } }
        ];
      }
    }

    // Filter public/private
    if (filter === 'public') {
      query.isPublic = true;
    } else if (filter === 'private') {
      query.isPublic = false;
      query.uploadedBy = req.user._id;
    } else {
      // For 'all', show public PDFs and user's private PDFs
      const accessQuery = {
        $or: [
          { isPublic: true },
          { uploadedBy: req.user._id }
        ]
      };
      query = query.$or 
        ? { $and: [query, accessQuery] }
        : { ...query, ...accessQuery };
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'name':
        sortOptions = { title: 1 };
        break;
      default: // 'newest'
        sortOptions = { createdAt: -1 };
    }

    const pdfs = await PDF.find(query)
      .sort(sortOptions)
      .populate('uploadedBy', 'username')
      .exec();

    res.json({
      pdfs: pdfs.map(pdf => ({
        _id: pdf._id,
        title: pdf.title,
        description: pdf.description,
        fileSize: pdf.fileSize,
        tags: pdf.tags,
        isPublic: pdf.isPublic,
        createdAt: pdf.createdAt,
        uploadedBy: pdf.uploadedBy.username
      }))
    });
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
  }
};

// Get single PDF
exports.getPDF = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id).populate('uploadedBy', 'username');
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    if (!pdf.isPublic && pdf.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(pdf);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PDF', error: error.message });
  }
};

// Download PDF
const downloadPdf = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Check if user has access to the PDF
    if (!pdf.isPublic && pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Send the file
    res.download(pdf.filePath, pdf.title + '.pdf');
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: 'Error downloading PDF' });
  }
};

// Delete PDF
exports.deletePDF = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await pdf.remove();
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting PDF', error: error.message });
  }
};

module.exports = {
  uploadPDF: exports.uploadPDF,
  getPDFs: exports.getPDFs,
  getPDF: exports.getPDF,
  deletePDF: exports.deletePDF,
  downloadPdf,
};
