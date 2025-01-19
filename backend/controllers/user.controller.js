const User = require('../models/user.model');
const PDF = require('../models/pdf.model');
const bcrypt = require('bcryptjs');

// Get user profile with stats
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    // Get PDF statistics
    const pdfStats = await PDF.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalPDFs: { $sum: 1 },
          totalStorage: { $sum: "$fileSize" },
          publicPDFs: { 
            $sum: { 
              $cond: [{ $eq: ["$isPublic", true] }, 1, 0] 
            }
          },
          privatePDFs: { 
            $sum: { 
              $cond: [{ $eq: ["$isPublic", false] }, 1, 0] 
            }
          }
        }
      }
    ]);

    const stats = pdfStats[0] || {
      totalPDFs: 0,
      totalStorage: 0,
      publicPDFs: 0,
      privatePDFs: 0
    };

    res.json({
      user,
      stats: {
        ...stats,
        totalStorage: Math.round(stats.totalStorage / 1024 / 1024 * 100) / 100 // Convert to MB with 2 decimal places
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Error getting profile', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};
