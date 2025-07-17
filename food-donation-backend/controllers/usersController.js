const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Get all users with filtering and pagination
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'restaurantInfo.name': { $regex: search, $options: 'i' } },
        { 'charityInfo.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password -resetPasswordToken -verificationToken')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      details: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    const user = await User.findById(id)
      .select('-password -resetPasswordToken -verificationToken');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user'
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.resetPasswordToken;
    delete updates.verificationToken;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -verificationToken');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      details: error.message
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    // Don't allow admin to delete themselves
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Soft delete by deactivating the account
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user'
    });
  }
};

// Get user statistics
const getUserStatistics = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          restaurants: {
            $sum: { $cond: [{ $eq: ['$role', 'restaurant'] }, 1, 0] }
          },
          charities: {
            $sum: { $cond: [{ $eq: ['$role', 'charity'] }, 1, 0] }
          },
          regularUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
          },
          admins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get user registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      summary: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        restaurants: 0,
        charities: 0,
        regularUsers: 0,
        admins: 0
      },
      registrationTrends
    });

  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics'
    });
  }
};

// Toggle user verification status (Admin only)
const toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.isVerified = !user.isVerified;
    if (user.isVerified) {
      user.verificationToken = undefined;
    }
    await user.save();

    res.json({
      message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Toggle verification error:', error);
    res.status(500).json({
      error: 'Failed to toggle user verification'
    });
  }
};

// Toggle user active status (Admin only)
const toggleUserActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    // Don't allow admin to deactivate themselves
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Toggle active status error:', error);
    res.status(500).json({
      error: 'Failed to toggle user active status'
    });
  }
};

// Get nearby restaurants
const getNearbyRestaurants = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      maxDistance = 10000,
      limit = 20
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const coords = [parseFloat(longitude), parseFloat(latitude)];

    const restaurants = await User.findNearby(coords, parseInt(maxDistance))
      .find({ role: 'restaurant', isActive: true, isVerified: true })
      .select('name restaurantInfo address profileImage stats')
      .limit(parseInt(limit));

    res.json({
      restaurants
    });

  } catch (error) {
    console.error('Get nearby restaurants error:', error);
    res.status(500).json({
      error: 'Failed to get nearby restaurants'
    });
  }
};

// Get top-rated restaurants
const getTopRatedRestaurants = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const restaurants = await User.find({
      role: 'restaurant',
      isActive: true,
      isVerified: true,
      'stats.reviewCount': { $gte: 5 } // At least 5 reviews
    })
    .select('name restaurantInfo address profileImage stats')
    .sort({ 'stats.rating': -1, 'stats.reviewCount': -1 })
    .limit(parseInt(limit));

    res.json({
      restaurants
    });

  } catch (error) {
    console.error('Get top-rated restaurants error:', error);
    res.status(500).json({
      error: 'Failed to get top-rated restaurants'
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const {
      query: searchQuery,
      role,
      limit = 10
    } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long'
      });
    }

    let query = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ],
      isActive: true
    };

    if (role === 'restaurant') {
      query['restaurantInfo.name'] = { $regex: searchQuery, $options: 'i' };
      query.role = 'restaurant';
    } else if (role === 'charity') {
      query['charityInfo.name'] = { $regex: searchQuery, $options: 'i' };
      query.role = 'charity';
    } else if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email role restaurantInfo.name charityInfo.name profileImage stats')
      .limit(parseInt(limit));

    res.json({
      users
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Failed to search users'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStatistics,
  toggleUserVerification,
  toggleUserActiveStatus,
  getNearbyRestaurants,
  getTopRatedRestaurants,
  searchUsers
};