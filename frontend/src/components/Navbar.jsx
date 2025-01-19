import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      show: true,
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: DocumentIcon,
      show: !!user,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserCircleIcon,
      show: !!user,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link 
            to="/"
            className="flex items-center space-x-2 text-white"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"
            >
              <SparklesIcon className="h-6 w-6 text-white" />
            </motion.div>
            <motion.span 
              className="text-xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              PDF Gallery
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems
              .filter(item => item.show)
              .map(item => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-white text-fuchsia-600 shadow-lg shadow-white/20'
                          : 'hover:bg-white/10 text-white backdrop-blur-sm'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-1.5" />
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                Logout
              </motion.button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-white hover:text-pink-200 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-fuchsia-600 hover:bg-pink-100 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-b from-fuchsia-600/90 to-pink-600/90 backdrop-blur-md border-t border-white/10">
              {navItems
                .filter(item => item.show)
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-white text-fuchsia-600 shadow-lg shadow-white/20'
                            : 'text-white hover:bg-white/10 backdrop-blur-sm'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5 mr-1.5" />
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              
              {user ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                  Logout
                </motion.button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="text-white hover:text-pink-200 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-fuchsia-600 hover:bg-pink-100 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
