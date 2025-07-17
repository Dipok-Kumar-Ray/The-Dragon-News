const Donation = require('../models/Donation');
const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Get all donations with filters, search, sort, and pagination
const getAllDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      location = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      verified = true,
      approved = true,
      restaurantId = '',
      charityId = ''
    } = req.query;

    // Build filter object
    const filter = {};

    // Only show verified and approved donations by default
    if (verified === 'true') filter.verified = true;
    if (approved === 'true') filter.approved = true;

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { foodType: { $regex: search, $options: 'i' } },
        { restaurantName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Restaurant filter
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    // Charity filter (for assigned donations)
    if (charityId) {
      filter.assignedCharity = charityId;
    }

    // Check for expired donations and update status
    await Donation.updateMany(
      {
        pickupTimeEnd: { $lt: new Date() },
        status: { $in: ['available', 'requested', 'accepted'] }
      },
      { $set: { status: 'expired' } }
    );

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with aggregation pipeline for better performance
    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'restaurantId',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedCharity',
          foreignField: '_id',
          as: 'charity'
        }
      },
      {
        $lookup: {
          from: 'donationrequests',
          localField: '_id',
          foreignField: 'donationId',
          as: 'requests'
        }
      },
      {
        $addFields: {
          restaurantInfo: { $arrayElemAt: ['$restaurant', 0] },
          charityInfo: { $arrayElemAt: ['$charity', 0] },
          requestCount: { $size: '$requests' }
        }
      },
      {
        $project: {
          restaurant: 0,
          charity: 0
        }
      },
      { $sort: sort },
      {
        $facet: {
          donations: [{ $skip: skip }, { $limit: limitNumber }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const result = await Donation.aggregate(aggregationPipeline);
    const donations = result[0].donations;
    const totalCount = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    res.json({
      success: true,
      donations,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        limit: limitNumber,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1
      }
    });

  } catch (error) {
    console.error('Error in getAllDonations:', error);
    res.status(500).json({
      success: false,
      message: 'ডোনেশন তালিকা পেতে সমস্যা হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single donation by ID
const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ডোনেশন ID'
      });
    }

    const donation = await Donation.findById(id)
      .populate('restaurantId', 'name email phone location organizationName')
      .populate('assignedCharity', 'name email phone organizationName')
      .populate({
        path: 'requests',
        populate: {
          path: 'charityId',
          select: 'name email phone organizationName'
        }
      })
      .lean();

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ডোনেশন খুঁজে পাওয়া যায়নি'
      });
    }

    // Check if donation is expired and update status
    if (new Date(donation.pickupTimeEnd) < new Date() && 
        ['available', 'requested', 'accepted'].includes(donation.status)) {
      await Donation.findByIdAndUpdate(id, { status: 'expired' });
      donation.status = 'expired';
    }

    // Get donation requests
    const requests = await DonationRequest.find({ donationId: id })
      .populate('charityId', 'name email phone organizationName')
      .sort({ createdAt: -1 });

    donation.requests = requests;

    res.json({
      success: true,
      donation
    });

  } catch (error) {
    console.error('Error in getDonationById:', error);
    res.status(500).json({
      success: false,
      message: 'ডোনেশনের তথ্য পেতে সমস্যা হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Request a donation (Charity only)
const requestDonation = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'তথ্য যাচাইকরণে ত্রুটি',
        errors: errors.array()
      });
    }

    const {
      donationId,
      requestDescription,
      pickupTime
    } = req.body;

    const charityId = req.user.id;

    // Verify user is a charity
    if (req.user.role !== 'charity') {
      return res.status(403).json({
        success: false,
        message: 'শুধুমাত্র দাতব্য সংস্থা ডোনেশন রিকুয়েস্ট করতে পারে'
      });
    }

    // Check if donation exists and is available
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ডোনেশন খুঁজে পাওয়া যায়নি'
      });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'এই ডোনেশনটি আর উপলব্ধ নেই'
      });
    }

    // Check if pickup time is within allowed window
    const selectedTime = new Date(pickupTime);
    const startTime = new Date(donation.pickupTimeStart);
    const endTime = new Date(donation.pickupTimeEnd);

    if (selectedTime < startTime || selectedTime > endTime) {
      return res.status(400).json({
        success: false,
        message: 'পিকআপের সময় নির্দিষ্ট সময়সীমার মধ্যে হতে হবে'
      });
    }

    // Check if charity has already requested this donation
    const existingRequest = await DonationRequest.findOne({
      donationId,
      charityId
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'আপনি ইতিমধ্যে এই ডোনেশনের জন্য রিকুয়েস্ট করেছেন'
      });
    }

    // Get charity info
    const charity = await User.findById(charityId);

    // Create donation request
    const donationRequest = new DonationRequest({
      donationId,
      charityId,
      charityName: charity.organizationName || charity.name,
      charityEmail: charity.email,
      requestDescription,
      pickupTime,
      status: 'pending'
    });

    await donationRequest.save();

    // Update donation status to 'requested'
    await Donation.findByIdAndUpdate(donationId, {
      status: 'requested',
      $push: { requests: donationRequest._id }
    });

    // Populate the created request
    await donationRequest.populate('charityId', 'name email phone organizationName');

    res.status(201).json({
      success: true,
      message: 'ডোনেশন রিকুয়েস্ট সফলভাবে পাঠানো হয়েছে',
      request: donationRequest
    });

  } catch (error) {
    console.error('Error in requestDonation:', error);
    res.status(500).json({
      success: false,
      message: 'রিকুয়েস্ট পাঠাতে সমস্যা হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update donation status (for pickup confirmation)
const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ডোনেশন ID'
      });
    }

    const validStatuses = ['available', 'requested', 'accepted', 'picked_up', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস'
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ডোনেশন খুঁজে পাওয়া যায়নি'
      });
    }

    // Check permissions
    if (req.user.role === 'charity') {
      // Charity can only mark as picked_up if they have an accepted request
      if (status !== 'picked_up') {
        return res.status(403).json({
          success: false,
          message: 'আপনি শুধুমাত্র পিকআপ নিশ্চিত করতে পারেন'
        });
      }

      const acceptedRequest = await DonationRequest.findOne({
        donationId: id,
        charityId: userId,
        status: 'accepted'
      });

      if (!acceptedRequest) {
        return res.status(403).json({
          success: false,
          message: 'আপনার কোনো গৃহীত রিকুয়েস্ট নেই'
        });
      }
    } else if (req.user.role === 'restaurant') {
      // Restaurant can update their own donations
      if (donation.restaurantId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'আপনি শুধুমাত্র নিজের ডোনেশন আপডেট করতে পারেন'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'এই কাজটি করার অনুমতি নেই'
      });
    }

    // Update donation status
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date(),
        ...(status === 'picked_up' && { pickedUpAt: new Date() })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'ডোনেশনের স্ট্যাটাস আপডেট হয়েছে',
      donation: updatedDonation
    });

  } catch (error) {
    console.error('Error in updateDonationStatus:', error);
    res.status(500).json({
      success: false,
      message: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get donation statistics
const getDonationStats = async (req, res) => {
  try {
    const {
      timeRange = 'month',
      restaurantId = ''
    } = req.query;

    const userId = req.user.id;
    const userRole = req.user.role;

    // Build match filter
    const matchFilter = {
      verified: true,
      approved: true
    };

    // For restaurants, only show their own donations
    if (userRole === 'restaurant') {
      matchFilter.restaurantId = new mongoose.Types.ObjectId(userId);
    } else if (restaurantId) {
      matchFilter.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }

    // Set date range based on timeRange
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    matchFilter.createdAt = { $gte: startDate };

    // Aggregation pipeline for statistics
    const statsAggregation = await Donation.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'picked_up'] }, 1, 0]
                  }
                },
                totalQuantity: {
                  $sum: {
                    $convert: {
                      input: { $regexFind: { input: '$quantity', regex: /\d+/ } },
                      to: 'double',
                      onError: 1
                    }
                  }
                }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          byType: [
            {
              $group: {
                _id: '$foodType',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          monthly: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                donations: { $sum: 1 },
                quantity: {
                  $sum: {
                    $convert: {
                      input: { $regexFind: { input: '$quantity', regex: /\d+/ } },
                      to: 'double',
                      onError: 1
                    }
                  }
                }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ],
          daily: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' }
                },
                donations: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            { $limit: 30 }
          ]
        }
      }
    ]);

    const stats = statsAggregation[0];

    // Get request count
    const requestCount = await DonationRequest.countDocuments({
      donationId: { $in: await Donation.find(matchFilter).distinct('_id') }
    });

    // Format chart data
    const chartData = {
      monthly: stats.monthly.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        donations: item.donations,
        quantity: item.quantity
      })),
      byType: stats.byType.map(item => ({
        name: item._id,
        value: item.count
      })),
      daily: stats.daily.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        donations: item.donations
      }))
    };

    // Get top food types
    const topFoodTypes = stats.byType.map(item => ({
      type: item._id,
      count: item.count
    }));

    // Get recent activity
    const recentActivity = await Donation.find(matchFilter)
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title status updatedAt')
      .lean();

    const formattedActivity = recentActivity.map(donation => ({
      description: `${donation.title} - ${donation.status}`,
      timestamp: donation.updatedAt
    }));

    const summary = stats.summary[0] || {
      total: 0,
      completed: 0,
      totalQuantity: 0
    };

    summary.requests = requestCount;

    res.json({
      success: true,
      summary,
      chartData,
      topFoodTypes,
      recentActivity: formattedActivity,
      timeRange,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error in getDonationStats:', error);
    res.status(500).json({
      success: false,
      message: 'পরিসংখ্যান পেতে সমস্যা হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new donation (Restaurant only)
const createDonation = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'তথ্য যাচাইকরণে ত্রুটি',
        errors: errors.array()
      });
    }

    // Verify user is a restaurant
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({
        success: false,
        message: 'শুধুমাত্র রেস্তোরাঁ ডোনেশন তৈরি করতে পারে'
      });
    }

    const restaurantId = req.user.id;
    const restaurant = await User.findById(restaurantId);

    const donationData = {
      ...req.body,
      restaurantId,
      restaurantName: restaurant.organizationName || restaurant.name,
      verified: false, // Admin will verify
      approved: false, // Admin will approve
      status: 'pending'
    };

    const donation = new Donation(donationData);
    await donation.save();

    res.status(201).json({
      success: true,
      message: 'ডোনেশন সফলভাবে তৈরি হয়েছে। অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।',
      donation
    });

  } catch (error) {
    console.error('Error in createDonation:', error);
    res.status(500).json({
      success: false,
      message: 'ডোনেশন তৈরি করতে সমস্যা হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllDonations,
  getDonationById,
  requestDonation,
  updateDonationStatus,
  getDonationStats,
  createDonation
};