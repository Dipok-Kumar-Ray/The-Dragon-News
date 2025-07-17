const express = require('express');
const { body, query, param } = require('express-validator');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  getAllDonations,
  getDonationById,
  requestDonation,
  updateDonationStatus,
  getDonationStats,
  createDonation
} = require('../controllers/donationsController');

const router = express.Router();

// Validation schemas
const donationValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('শিরোনাম ৩-১০০ অক্ষরের মধ্যে হতে হবে'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('বিবরণ ১০-১০০০ অক্ষরের মধ্যে হতে হবে'),
  body('foodType')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('খাবারের ধরন ২-৫০ অক্ষরের মধ্যে হতে হবে'),
  body('quantity')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('পরিমাণ ১-৫০ অক্ষরের মধ্যে হতে হবে'),
  body('location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('অবস্থান ৫-২০০ অক্ষরের মধ্যে হতে হবে'),
  body('pickupTimeStart')
    .isISO8601()
    .withMessage('পিকআপ শুরুর সময় সঠিক ফরম্যাটে দিন')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('পিকআপ শুরুর সময় ভবিষ্যতে হতে হবে');
      }
      return true;
    }),
  body('pickupTimeEnd')
    .isISO8601()
    .withMessage('পিকআপ শেষের সময় সঠিক ফরম্যাটে দিন')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.pickupTimeStart)) {
        throw new Error('পিকআপ শেষের সময় শুরুর সময়ের পরে হতে হবে');
      }
      return true;
    }),
  body('pickupInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('পিকআপ নির্দেশনা সর্বোচ্চ ৫০০ অক্ষরের হতে পারে'),
  body('image')
    .optional()
    .isURL()
    .withMessage('ছবির URL সঠিক ফরম্যাটে দিন')
];

const requestValidation = [
  body('donationId')
    .isMongoId()
    .withMessage('অবৈধ ডোনেশন ID'),
  body('requestDescription')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('রিকুয়েস্টের বিবরণ ১০-৫০০ অক্ষরের মধ্যে হতে হবে'),
  body('pickupTime')
    .isISO8601()
    .withMessage('পিকআপ সময় সঠিক ফরম্যাটে দিন')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('পিকআপ সময় ভবিষ্যতে হতে হবে');
      }
      return true;
    })
];

const statusUpdateValidation = [
  param('id')
    .isMongoId()
    .withMessage('অবৈধ ডোনেশন ID'),
  body('status')
    .isIn(['available', 'requested', 'accepted', 'picked_up', 'expired'])
    .withMessage('অবৈধ স্ট্যাটাস')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('পেইজ নম্বর ১ বা তার বেশি হতে হবে'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('লিমিট ১-১০০ এর মধ্যে হতে হবে'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'pickupTimeStart', 'quantity', 'title', 'restaurantName'])
    .withMessage('অবৈধ সর্ট ফিল্ড'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('সর্ট অর্ডার asc বা desc হতে হবে'),
  query('status')
    .optional()
    .isIn(['all', 'available', 'requested', 'accepted', 'picked_up', 'expired'])
    .withMessage('অবৈধ স্ট্যাটাস ফিল্টার')
];

// @route   GET /api/donations
// @desc    Get all donations with search, filter, sort, and pagination
// @access  Private
router.get('/', 
  auth, 
  queryValidation,
  getAllDonations
);

// @route   GET /api/donations/stats
// @desc    Get donation statistics
// @access  Private (Restaurant, Admin)
router.get('/stats',
  auth,
  roleAuth(['restaurant', 'admin']),
  query('timeRange')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('অবৈধ সময়সীমা'),
  getDonationStats
);

// @route   GET /api/donations/:id
// @desc    Get single donation by ID
// @access  Private
router.get('/:id',
  auth,
  param('id').isMongoId().withMessage('অবৈধ ডোনেশন ID'),
  getDonationById
);

// @route   POST /api/donations
// @desc    Create a new donation
// @access  Private (Restaurant only)
router.post('/',
  auth,
  roleAuth(['restaurant']),
  donationValidation,
  createDonation
);

// @route   POST /api/donations/request
// @desc    Request a donation
// @access  Private (Charity only)
router.post('/request',
  auth,
  roleAuth(['charity']),
  requestValidation,
  requestDonation
);

// @route   PATCH /api/donations/:id/status
// @desc    Update donation status
// @access  Private (Restaurant, Charity, Admin)
router.patch('/:id/status',
  auth,
  statusUpdateValidation,
  updateDonationStatus
);

// @route   PUT /api/donations/:id
// @desc    Update donation details
// @access  Private (Restaurant only - own donations, Admin)
const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find donation
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ডোনেশন খুঁজে পাওয়া যায়নি'
      });
    }

    // Check permissions
    if (userRole === 'restaurant' && donation.restaurantId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'আপনি শুধুমাত্র নিজের ডোনেশন আপডেট করতে পারেন'
      });
    }

    // Don't allow updating if donation has requests
    if (donation.status !== 'available' && donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'এই ডোনেশনে ইতিমধ্যে রিকুয়েস্ট আছে, আপডেট করা যাবে না'
      });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'ডোনেশন আপডেট হয়েছে',
      donation: updatedDonation
    });

  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({
      success: false,
      message: 'ডোনেশন আপডেট করতে সমস্যা হয়েছে'
    });
  }
};

router.put('/:id',
  auth,
  roleAuth(['restaurant', 'admin']),
  param('id').isMongoId().withMessage('অবৈধ ডোনেশন ID'),
  donationValidation,
  updateDonation
);

// @route   DELETE /api/donations/:id
// @desc    Delete donation
// @access  Private (Restaurant only - own donations, Admin)
const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find donation
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ডোনেশন খুঁজে পাওয়া যায়নি'
      });
    }

    // Check permissions
    if (userRole === 'restaurant' && donation.restaurantId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'আপনি শুধুমাত্র নিজের ডোনেশন মুছতে পারেন'
      });
    }

    // Don't allow deleting if donation has active requests
    if (['requested', 'accepted', 'picked_up'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: 'সক্রিয় রিকুয়েস্ট থাকায় এই ডোনেশন মুছা যাবে না'
      });
    }

    await Donation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'ডোনেশন মুছে ফেলা হয়েছে'
    });

  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({
      success: false,
      message: 'ডোনেশন মুছতে সমস্যা হয়েছে'
    });
  }
};

router.delete('/:id',
  auth,
  roleAuth(['restaurant', 'admin']),
  param('id').isMongoId().withMessage('অবৈধ ডোনেশন ID'),
  deleteDonation
);

// @route   GET /api/donations/restaurant/:restaurantId
// @desc    Get donations by restaurant
// @access  Private
router.get('/restaurant/:restaurantId',
  auth,
  param('restaurantId').isMongoId().withMessage('অবৈধ রেস্তোরাঁ ID'),
  queryValidation,
  async (req, res) => {
    req.query.restaurantId = req.params.restaurantId;
    getAllDonations(req, res);
  }
);

// @route   GET /api/donations/my/donations
// @desc    Get current user's donations (for restaurants)
// @access  Private (Restaurant only)
router.get('/my/donations',
  auth,
  roleAuth(['restaurant']),
  queryValidation,
  async (req, res) => {
    req.query.restaurantId = req.user.id;
    getAllDonations(req, res);
  }
);

// @route   GET /api/donations/my/requests
// @desc    Get current user's donation requests (for charities)
// @access  Private (Charity only)
const getMyRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = ''
    } = req.query;

    const charityId = req.user.id;

    // Build filter
    const filter = { charityId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get requests with populated donation details
    const requests = await DonationRequest.find(filter)
      .populate({
        path: 'donationId',
        select: 'title description foodType quantity location restaurantName image pickupTimeStart pickupTimeEnd status',
        populate: {
          path: 'restaurantId',
          select: 'name organizationName email phone'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalCount = await DonationRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNumber);

    res.json({
      success: true,
      requests,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        limit: limitNumber
      }
    });

  } catch (error) {
    console.error('Error in getMyRequests:', error);
    res.status(500).json({
      success: false,
      message: 'আপনার রিকুয়েস্ট তালিকা পেতে সমস্যা হয়েছে'
    });
  }
};

router.get('/my/requests',
  auth,
  roleAuth(['charity']),
  queryValidation,
  getMyRequests
);

// @route   GET /api/donations/search/locations
// @desc    Get unique locations for search dropdown
// @access  Private
router.get('/search/locations',
  auth,
  async (req, res) => {
    try {
      const locations = await Donation.distinct('location', {
        verified: true,
        approved: true,
        status: { $ne: 'expired' }
      });

      res.json({
        success: true,
        locations: locations.filter(location => location && location.trim())
      });

    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({
        success: false,
        message: 'অবস্থানের তালিকা পেতে সমস্যা হয়েছে'
      });
    }
  }
);

module.exports = router;