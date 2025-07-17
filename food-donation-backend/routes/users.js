const express = require('express');
const { query, body } = require('express-validator');
const router = express.Router();
const {
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
} = require('../controllers/usersController');
const { auth, authorize } = require('../middleware/auth');

// Validation rules
const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  query('role')
    .optional()
    .isIn(['user', 'restaurant', 'charity', 'admin'])
    .withMessage('Invalid role'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'email', 'lastLogin'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'restaurant', 'charity', 'admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const nearbyRestaurantsValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude is required and must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude is required and must be between -180 and 180'),
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('Max distance must be between 100 and 100000 meters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const searchUsersValidation = [
  query('query')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('role')
    .optional()
    .isIn(['user', 'restaurant', 'charity', 'admin'])
    .withMessage('Invalid role'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Routes

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), getUsersValidation, getAllUsers);

// @route   GET /api/users/statistics
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/statistics', auth, authorize('admin'), getUserStatistics);

// @route   GET /api/users/restaurants/nearby
// @desc    Get nearby restaurants
// @access  Public
router.get('/restaurants/nearby', nearbyRestaurantsValidation, getNearbyRestaurants);

// @route   GET /api/users/restaurants/top-rated
// @desc    Get top-rated restaurants
// @access  Public
router.get('/restaurants/top-rated', getTopRatedRestaurants);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, searchUsersValidation, searchUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or own profile)
router.get('/:id', auth, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:id', auth, authorize('admin'), updateUserValidation, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), deleteUser);

// @route   PATCH /api/users/:id/verify
// @desc    Toggle user verification status (Admin only)
// @access  Private (Admin)
router.patch('/:id/verify', auth, authorize('admin'), toggleUserVerification);

// @route   PATCH /api/users/:id/activate
// @desc    Toggle user active status (Admin only)
// @access  Private (Admin)
router.patch('/:id/activate', auth, authorize('admin'), toggleUserActiveStatus);

module.exports = router;