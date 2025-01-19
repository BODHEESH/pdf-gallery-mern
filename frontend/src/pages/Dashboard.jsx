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
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');

  // Form data for PDF upload
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: true,
    file: null,
  });

  // Fetch PDFs with enhanced search
  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/pdfs?search=${search}&sort=${sort}&filter=${filter}&searchBy=${searchBy}`
      );
      setPdfs(response.data.pdfs);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      toast.error('Error fetching PDFs');
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
  }, [search, sort, filter, searchBy]);

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

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section with Search, Sort, and Filter */}
      <div className="bg-gradient-to-r from-violet-600/10 via-fuchsia-500/10 to-pink-500/10 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-fuchsia-500" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    searchBy === 'tags'
                      ? "Search by tags (comma-separated)..."
                      : searchBy === 'name'
                      ? "Search by PDF name..."
                      : "Search PDFs..."
                  }
                  className="w-full pl-10 pr-4 py-2 border border-fuchsia-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                />
              </div>

              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="pl-2 pr-8 py-2 border border-fuchsia-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-white/80 backdrop-blur-sm text-gray-900"
              >
                <option value="all">All Fields</option>
                <option value="name">Name Only</option>
                <option value="tags">Tags Only</option>
              </select>
            </div>

            {/* Sort and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-2 pr-8 py-2 border border-fuchsia-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-white/80 backdrop-blur-sm text-gray-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-2 pr-8 py-2 border border-fuchsia-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-white/80 backdrop-blur-sm text-gray-900"
                >
                  <option value="all">All PDFs</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 transition-all duration-300"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Upload PDF
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
          </div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No PDFs</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading a PDF.</p>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 transition-all duration-300"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Upload PDF
              </motion.button>
            </div>
          </div>
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
                      onClick={() => {
                        setSelectedPdf(pdf);
                        setIsViewModalOpen(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 transition-all duration-200"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Details
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
    </div>
  );
};

export default Dashboard;
