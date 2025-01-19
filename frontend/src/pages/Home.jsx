import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentTextIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      title: 'Organize PDFs',
      description: 'Keep all your PDFs in one place, organized and easily accessible.',
      icon: <DocumentTextIcon className="w-6 h-6 text-white" />,
      gradient: 'from-violet-600 to-fuchsia-600',
    },
    {
      title: 'Quick Search',
      description: 'Find any document instantly with our powerful search feature.',
      icon: <SparklesIcon className="w-6 h-6 text-white" />,
      gradient: 'from-fuchsia-600 to-pink-600',
    },
    {
      title: 'Secure Storage',
      description: 'Your documents are safe with our secure storage system.',
      icon: <SparklesIcon className="w-6 h-6 text-white" />,
      gradient: 'from-pink-600 to-rose-600',
    },
    {
      title: 'Easy Sharing',
      description: 'Share your PDFs with others in just a few clicks.',
      icon: <SparklesIcon className="w-6 h-6 text-white" />,
      gradient: 'from-rose-600 to-violet-600',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50">
      {/* Hero Section */}
      <div className="w-full">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 animate-float"
          >
            <div className="h-24 w-24 md:h-32 md:w-32 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
              <DocumentTextIcon className="h-16 w-16 md:h-20 md:w-20 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 mb-6">
            Your Digital PDF Library
          </h1>
          <p className="text-lg md:text-xl text-gray-600 text-center mb-8 max-w-3xl">
            Store, organize, and access your PDF documents from anywhere. The smart way to
            manage your digital documents! ✨
          </p>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </motion.section>
      </div>

      {/* Features Section */}
      <div className="w-full bg-white/50 backdrop-blur-sm py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border border-white"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
