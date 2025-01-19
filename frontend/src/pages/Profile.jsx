import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      // Add password change API call here
      toast.success('Password updated successfully! 🔐');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Total PDFs', 
      value: '42',
      icon: <SparklesIcon className="h-5 w-5 text-white" />,
      gradient: 'from-violet-600 to-fuchsia-600'
    },
    { 
      label: 'Public PDFs', 
      value: '28',
      icon: <SparklesIcon className="h-5 w-5 text-white" />,
      gradient: 'from-fuchsia-600 to-pink-600'
    },
    { 
      label: 'Private PDFs', 
      value: '14',
      icon: <SparklesIcon className="h-5 w-5 text-white" />,
      gradient: 'from-pink-600 to-rose-600'
    },
    { 
      label: 'Storage Used', 
      value: '1.2 GB',
      icon: <SparklesIcon className="h-5 w-5 text-white" />,
      gradient: 'from-rose-600 to-violet-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-8 border border-white"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-4 rounded-xl shadow-lg">
              <UserCircleIcon className="h-16 w-16 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500">
                {user?.username}
              </h1>
              <p className="text-gray-600 flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                {user?.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl p-4 text-center border border-white"
            >
              <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Change Password Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white"
        >
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 mb-6">
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-fuchsia-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-fuchsia-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-fuchsia-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-gray-50"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                  Updating...
                </div>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Update Password
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
