import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  DocumentPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  HashtagIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: true,
  });

  // Form data for PDF upload
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: true,
    file: null,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter menu animation variants
  const filterMenuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Filter button animation variants
  const filterButtonVariants = {
    initial: { rotate: 0 },
    rotated: { 
      rotate: 180,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  // Empty state animation variants
  const emptyStateVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 2
      }
    }
  };

  const uploadButtonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: "easeInOut"
      }
    }
  };

  // Fetch PDFs with enhanced search
  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view PDFs');
        navigate('/login');
        return;
      }

      const params = new URLSearchParams({
        search,
        sort,
        filter,
        searchBy,
        dateFilter
      });

      const response = await axios.get(`/api/pdfs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('PDF Response:', response.data);
      
      if (response.data && Array.isArray(response.data.pdfs)) {
        setPdfs(response.data.pdfs);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Error loading PDFs: Invalid response format');
        setPdfs([]);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      toast.error(error.response?.data?.message || 'Error loading PDFs');
      setPdfs([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPDFs();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, sort, filter, searchBy, dateFilter]);

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a PDF file');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('tags', formData.tags);
    formDataToSend.append('isPublic', formData.isPublic);
    formDataToSend.append('file', formData.file);

    try {
      setUploadLoading(true);
      const response = await axios.post('/api/pdfs/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      toast.success('PDF uploaded successfully! 📄');
      setIsModalOpen(false);
      fetchPDFs();
      setFormData({
        title: '',
        description: '',
        tags: '',
        isPublic: true,
        file: null,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading PDF');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle PDF download
  const handleDownload = async (pdf) => {
    try {
      // Handle both cases where pdf is the full object or just the id
      const pdfId = typeof pdf === 'object' ? pdf._id : pdf;
      const response = await axios.get(`/api/pdfs/${pdfId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Get title from pdf object if available, otherwise use the ID
      const fileName = typeof pdf === 'object' ? pdf.title : 'document';
      link.setAttribute('download', `${fileName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started! 📥');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading PDF');
    }
  };

  // Handle view PDF details
  const handleViewDetails = (pdf) => {
    setSelectedPdf(pdf);
    setIsViewModalOpen(true);
  };

  // Handle PDF delete
  const handleDelete = async () => {
    if (!pdfToDelete) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`/api/pdfs/${pdfToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.message) {
        toast.success('PDF deleted successfully! 🗑️');
        setIsDeleteModalOpen(false);
        setPdfToDelete(null);
        await fetchPDFs(); // Refresh the PDFs list
      }
    } catch (error) {
      console.error('Delete error:', error);
      let errorMessage = 'Failed to delete PDF';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        if (error.response.status === 401) {
          errorMessage = 'Please login again to continue';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to delete this PDF';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please try again.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF edit
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/pdfs/${selectedPdf._id}`, editFormData);
      toast.success('PDF updated successfully! ✏️');
      setIsEditModalOpen(false);
      fetchPDFs();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error updating PDF');
    }
  };

  // Open edit modal with PDF data
  const openEditModal = (pdf) => {
    setSelectedPdf(pdf);
    setEditFormData({
      title: pdf.title,
      description: pdf.description,
      tags: pdf.tags.join(', '),
      isPublic: pdf.isPublic,
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  // Open delete confirmation modal
  const openDeleteModal = (pdf) => {
    setPdfToDelete(pdf);
    setIsDeleteModalOpen(true);
  };

  // Render filter section
  const renderFilterSection = () => (
    <div className="relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PDFs..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200" />
          </div>
          
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border-2 border-gray-100 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            animate={showFilters ? "rotated" : "initial"}
            variants={filterButtonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FunnelIcon className="h-5 w-5 text-gray-500 hover:text-blue-500 transition-colors duration-200" />
          </motion.button>
        </div>

        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <DocumentPlusIcon className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-200" />
          <span>Upload PDF</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={filterMenuVariants}
            className="absolute left-0 right-0 mt-2 p-6 bg-white rounded-xl shadow-xl border border-gray-100 backdrop-blur-lg backdrop-saturate-150"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search By</label>
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Fields</option>
                  <option value="title">Title</option>
                  <option value="description">Description</option>
                  <option value="tags">Tags</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All PDFs</option>
                  <option value="public">Public PDFs</option>
                  <option value="private">Private PDFs</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Time Period</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <motion.div 
      className="text-center py-16 px-4"
      variants={emptyStateVariants}
      initial="initial"
      animate="animate"
    >
      <div className="relative w-40 h-40 mx-auto mb-6">
        <motion.div
          className="absolute inset-0 bg-blue-100/50 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          variants={iconVariants}
          initial="initial"
          animate="hover"
        >
          <svg
            className="w-24 h-24 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              animate={{
                pathLength: [0, 1],
                opacity: [0, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No PDFs Found</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Your PDF collection is empty. Start by uploading your first PDF document.
        </p>

        <motion.button
          variants={uploadButtonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
          Upload Your First PDF
        </motion.button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My PDFs</h1>
        </div>
        
        {renderFilterSection()}
        
        {/* Main Content */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pdfs.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.map((pdf) => (
                <motion.div
                  key={pdf._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-fuchsia-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{pdf.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{pdf.description}</p>
                      </div>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        pdf.isPublic 
                          ? 'bg-fuchsia-100 text-fuchsia-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {pdf.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    
                    {pdf.tags && pdf.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pdf.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 text-fuchsia-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(pdf.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <UserCircleIcon className="h-4 w-4 mr-1" />
                        {pdf.uploadedBy}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(pdf)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 transition-all duration-200"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(pdf)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(pdf)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload PDF</h2>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-fuchsia-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full border border-fuchsia-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-fuchsia-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                        placeholder="work, important, project"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PDF File</label>
                      <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-600 hover:file:bg-fuchsia-100"
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Make this PDF public</label>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={uploadLoading}
                      className={`w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 transition-all duration-300 ${
                        uploadLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                          Upload PDF
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* View PDF Modal */}
        <AnimatePresence>
          {isViewModalOpen && selectedPdf && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsViewModalOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedPdf.title}</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-gray-900">{selectedPdf.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedPdf.tags && selectedPdf.tags.length > 0 ? (
                          selectedPdf.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 text-fuchsia-700"
                            >
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No tags</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(selectedPdf.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <UserCircleIcon className="h-4 w-4 mr-1" />
                        {selectedPdf.uploadedBy}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownload(selectedPdf._id)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 transition-all duration-300"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Download PDF
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit PDF Details</h2>
                  <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="mt-1 block w-full border border-fuchsia-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border border-fuchsia-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={editFormData.tags}
                        onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                        className="mt-1 block w-full border border-fuchsia-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                        placeholder="work, important, project"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editFormData.isPublic}
                        onChange={(e) => setEditFormData({ ...editFormData, isPublic: e.target.checked })}
                        className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Make this PDF public</label>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 transition-all duration-300"
                    >
                      Save Changes
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => !loading && setIsDeleteModalOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Delete PDF</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Are you sure you want to delete "{pdfToDelete?.title}"? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !loading && setIsDeleteModalOpen(false)}
                        disabled={loading}
                        className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDelete}
                        disabled={loading}
                        className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                            Deleting...
                          </div>
                        ) : (
                          'Delete PDF'
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
