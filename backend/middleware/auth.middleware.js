const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No authentication token, authorization denied.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);

      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = auth;
