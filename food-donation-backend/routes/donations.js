const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getDonationsByRestaurant,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  updateDonationStatus,
  getDonationStatistics,
  searchNearby,
  getTrendingDonations
} = require('../controllers/donationsController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

// Validation rules
const createDonationValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('foodType')
    .isIn(['cooked', 'raw', 'packaged', 'fruits', 'vegetables', 'dairy', 'beverages', 'others'])
    .withMessage('Invalid food type'),
  body('cuisine')
    .optional()
    .isIn(['bengali', 'indian', 'chinese', 'continental', 'fast-food', 'desserts', 'mixed', 'others'])
    .withMessage('Invalid cuisine type'),
  body('quantity.value')
    .isInt({ min: 1 })
    .withMessage('Quantity value must be a positive integer'),
  body('quantity.unit')
    .isIn(['people', 'kg', 'pieces', 'plates', 'boxes', 'packets'])
    .withMessage('Invalid quantity unit'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with longitude and latitude'),
  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('availability.startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  body('availability.endTime')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.availability.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('shelfLife.hours')
    .isInt({ min: 1 })
    .withMessage('Shelf life must be at least 1 hour'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('temperature')
    .optional()
    .isIn(['hot', 'warm', 'room-temperature', 'cold', 'frozen'])
    .withMessage('Invalid temperature type'),
  body('packaging')
    .optional()
    .isIn(['containers', 'wrapped', 'sealed', 'open', 'bulk'])
    .withMessage('Invalid packaging type'),
  body('pickupInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pickup instructions cannot exceed 500 characters'),
  body('safetyNotes')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Safety notes cannot exceed 300 characters')
];

const updateDonationValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('pickupInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pickup instructions cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'available', 'requested', 'confirmed', 'picked-up', 'completed', 'expired', 'cancelled'])
    .withMessage('Invalid status')
];

const getAllDonationsValidation = [
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
  query('foodType')
    .optional()
    .isIn(['cooked', 'raw', 'packaged', 'fruits', 'vegetables', 'dairy', 'beverages', 'others'])
    .withMessage('Invalid food type'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'available', 'requested', 'confirmed', 'picked-up', 'completed', 'expired', 'cancelled'])
    .withMessage('Invalid status'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'quantity.value', 'availability.startTime', 'views'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('Max distance must be between 100 and 100000 meters'),
  query('minQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum quantity must be a positive integer'),
  query('maxQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum quantity must be a positive integer')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'approved', 'available', 'requested', 'confirmed', 'picked-up', 'completed', 'expired', 'cancelled'])
    .withMessage('Invalid status'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID')
];

const searchNearbyValidation = [
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

// Routes

// @route   POST /api/donations
// @desc    Create new donation
// @access  Private (Restaurant only)
router.post('/', auth, authorize('restaurant'), createDonationValidation, createDonation);

// @route   GET /api/donations
// @desc    Get all donations with filters
// @access  Public
router.get('/', optionalAuth, getAllDonationsValidation, getAllDonations);

// @route   GET /api/donations/trending
// @desc    Get trending donations
// @access  Public
router.get('/trending', optionalAuth, getTrendingDonations);

// @route   GET /api/donations/nearby
// @desc    Search donations nearby
// @access  Public
router.get('/nearby', searchNearbyValidation, searchNearby);

// @route   GET /api/donations/restaurant
// @desc    Get donations by restaurant
// @access  Private (Restaurant only)
router.get('/restaurant', auth, authorize('restaurant'), getDonationsByRestaurant);

// @route   GET /api/donations/favorites
// @desc    Get user's favorite donations
// @access  Private
router.get('/favorites', auth, getFavorites);

// @route   GET /api/donations/statistics
// @desc    Get donation statistics
// @access  Private (Restaurant/Admin only)
router.get('/statistics', auth, authorize('restaurant', 'admin'), getDonationStatistics);

// @route   GET /api/donations/:id
// @desc    Get donation by ID
// @access  Public
router.get('/:id', optionalAuth, getDonationById);

// @route   PUT /api/donations/:id
// @desc    Update donation
// @access  Private (Restaurant owner or Admin)
router.put('/:id', auth, updateDonationValidation, updateDonation);

// @route   DELETE /api/donations/:id
// @desc    Delete donation
// @access  Private (Restaurant owner or Admin)
router.delete('/:id', auth, deleteDonation);

// @route   POST /api/donations/:id/favorite
// @desc    Add donation to favorites
// @access  Private
router.post('/:id/favorite', auth, addToFavorites);

// @route   DELETE /api/donations/:id/favorite
// @desc    Remove donation from favorites
// @access  Private
router.delete('/:id/favorite', auth, removeFromFavorites);

// @route   PATCH /api/donations/:id/status
// @desc    Update donation status
// @access  Private (Restaurant owner or Admin)
router.patch('/:id/status', auth, updateStatusValidation, updateDonationStatus);

module.exports = router;