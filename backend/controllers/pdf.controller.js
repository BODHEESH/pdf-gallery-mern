const PDF = require('../models/pdf.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

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
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const pdf = new PDF({
    title: req.body.title || req.file.originalname,
    description: req.body.description,
    filePath: req.file.path,
    fileSize: req.file.size,
    uploadedBy: req.user._id,
    tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
  });

  await pdf.save();
  res.status(201).json(pdf);
};

// Get all PDFs
exports.getPDFs = async (req, res) => {
  try {
    console.log('Getting PDFs for user:', req.user._id);
    console.log('Query params:', req.query);

    const { search = '', sort = 'newest', filter = 'all', searchBy = 'all', dateFilter = 'all' } = req.query;

    // Build query
    let query = {};

    // Handle public/private filter
    if (filter === 'public') {
      query = { 
        $or: [
          { uploadedBy: req.user._id },
          { isPublic: true }
        ]
      };
    } else if (filter === 'private') {
      query = {
        uploadedBy: req.user._id,
        isPublic: false
      };
    } else {
      // Default to showing user's own PDFs
      query = { uploadedBy: req.user._id };
    }

    // Add search conditions
    if (search) {
      const searchQuery = searchBy === 'title' ? 
        { title: { $regex: search, $options: 'i' } } :
        searchBy === 'description' ? 
          { description: { $regex: search, $options: 'i' } } :
        searchBy === 'tags' ? 
          { tags: { $in: [new RegExp(search, 'i')] } } :
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { tags: { $in: [new RegExp(search, 'i')] } }
            ]
          };
      
      query = {
        $and: [query, searchQuery]
      };
    }

    // Add date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateQuery = {};
      
      if (dateFilter === 'today') {
        dateQuery = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        };
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        dateQuery = { $gte: weekAgo };
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        dateQuery = { $gte: monthAgo };
      }
      
      query = {
        $and: [query, { createdAt: dateQuery }]
      };
    }

    // Build sort
    let sortQuery = {};
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sort === 'name') {
      sortQuery = { title: 1 };
    } else if (sort === 'size') {
      sortQuery = { fileSize: -1 };
    }

    console.log('Final query:', JSON.stringify(query, null, 2));
    console.log('Sort query:', sortQuery);

    const pdfs = await PDF.find(query)
      .sort(sortQuery)
      .populate('uploadedBy', 'username')
      .lean()
      .exec();
      
    console.log('Found PDFs:', pdfs.length);

    // Transform the response to match frontend expectations
    const transformedPdfs = pdfs.map(pdf => ({
      ...pdf,
      uploadedBy: pdf.uploadedBy?.username || 'Unknown',
      id: pdf._id.toString()
    }));

    res.json({ pdfs: transformedPdfs });
  } catch (error) {
    console.error('Error in getPDFs:', error);
    res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
  }
};

// Get single PDF
exports.getPDF = async (req, res) => {
  const pdf = await PDF.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!pdf) {
    return res.status(404).json({ message: 'PDF not found' });
  }
  res.json(pdf);
};

// Download PDF
exports.downloadPdf = async (req, res) => {
  const pdf = await PDF.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!pdf) {
    return res.status(404).json({ message: 'PDF not found' });
  } 

  const filePath = path.resolve(__dirname, '..', pdf.filePath);
  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch (error) {
    res.status(404).json({ message: 'File not found on server' });
  }
};

// Update PDF details
exports.updatePDF = async (req, res) => {
  const pdf = await PDF.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!pdf) {
    return res.status(404).json({ message: 'PDF not found' });
  }

  Object.assign(pdf, req.body);
  await pdf.save();
  res.json(pdf);
};

// Delete PDF
exports.deletePDF = async (req, res) => {
  try {
    console.log('Deleting PDF with ID:', req.params.id);
    console.log('User ID:', req.user._id);

    const pdf = await PDF.findOne({ _id: req.params.id, uploadedBy: req.user._id });
    
    if (!pdf) {
      console.log('PDF not found or user does not have permission');
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Delete from database first
    console.log('Deleting from database...');
    const deleteResult = await PDF.deleteOne({ _id: pdf._id });
    
    if (deleteResult.deletedCount === 0) {
      console.log('PDF not found in database');
      return res.status(404).json({ message: 'PDF not found in database' });
    }

    // Then try to delete the file
    if (pdf.filePath) {
      try {
        console.log('Original filePath:', pdf.filePath);
        const filePath = path.resolve(__dirname, '..', pdf.filePath);
        console.log('Resolved filePath:', filePath);
        
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        console.log('File exists:', fileExists);
        
        if (fileExists) {
          await fs.unlink(filePath);
          console.log('File deleted successfully');
        } else {
          console.log('File does not exist on disk');
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        // Don't throw error if file deletion fails
      }
    }

    console.log('PDF deletion completed successfully');
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    console.error('Error in deletePDF:', error);
    throw error; // Let the asyncHandler middleware handle the error
  }
};

module.exports = {
  uploadPDF: exports.uploadPDF,
  getPDFs: exports.getPDFs,
  getPDF: exports.getPDF,
  deletePDF: exports.deletePDF,
  downloadPdf: exports.downloadPdf,
  updatePDF: exports.updatePDF,
};
