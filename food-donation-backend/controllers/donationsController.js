const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Create new donation
const createDonation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const donationData = {
      ...req.body,
      restaurant: req.user.id
    };

    // Validate that user is a restaurant
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({
        error: 'Only restaurants can create donations'
      });
    }

    const donation = new Donation(donationData);
    await donation.save();

    // Populate restaurant info
    await donation.populate('restaurant', 'name restaurantInfo.name address profileImage');

    // Update user stats
    await req.user.updateStats('donationCreated');

    res.status(201).json({
      message: 'Donation created successfully',
      donation
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      error: 'Failed to create donation',
      details: error.message
    });
  }
};

// Get all donations with filtering, sorting, and pagination
const getAllDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      foodType,
      status,
      city,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      latitude,
      longitude,
      maxDistance = 10000,
      minQuantity,
      maxQuantity,
      cuisine,
      dietary
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {
      status: { $in: ['available', 'approved'] },
      isVerified: true,
      'availability.endTime': { $gt: new Date() }
    };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (foodType) query.foodType = foodType;
    if (status) query.status = status;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (cuisine) query.cuisine = cuisine;
    if (minQuantity) query['quantity.value'] = { $gte: parseInt(minQuantity) };
    if (maxQuantity) query['quantity.value'] = { ...query['quantity.value'], $lte: parseInt(maxQuantity) };

    // Dietary filters
    if (dietary) {
      const dietaryArray = dietary.split(',');
      dietaryArray.forEach(diet => {
        if (diet in Donation.schema.paths.dietary.schema.paths) {
          query[`dietary.${diet}`] = true;
        }
      });
    }

    let donationsQuery;

    // Geospatial query if coordinates provided
    if (latitude && longitude) {
      const coords = [parseFloat(longitude), parseFloat(latitude)];
      
      donationsQuery = Donation.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: coords
            },
            distanceField: 'distance',
            maxDistance: parseInt(maxDistance),
            spherical: true,
            query: query
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'restaurant',
            foreignField: '_id',
            as: 'restaurant'
          }
        },
        {
          $unwind: '$restaurant'
        },
        {
          $sort: { distance: 1, [sortBy]: sortOrder === 'desc' ? -1 : 1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limitNum
        }
      ]);
    } else {
      // Regular query
      const sortObj = {};
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

      donationsQuery = Donation.find(query)
        .populate('restaurant', 'name restaurantInfo.name address profileImage stats phone')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);
    }

    const donations = await donationsQuery;

    // Get total count for pagination
    const total = await Donation.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      donations,
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
    console.error('Get donations error:', error);
    res.status(500).json({
      error: 'Failed to get donations',
      details: error.message
    });
  }
};

// Get donation by ID
const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid donation ID'
      });
    }

    const donation = await Donation.findById(id)
      .populate('restaurant', 'name restaurantInfo address profileImage stats phone')
      .populate('requestedBy', 'name email phone organizationInfo')
      .populate('confirmedBy', 'name email phone');

    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    // Increment view count if not the owner
    if (!req.user || req.user.id !== donation.restaurant._id.toString()) {
      await donation.incrementViews();
    }

    res.json({
      donation
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      error: 'Failed to get donation'
    });
  }
};

// Update donation
const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid donation ID'
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    // Check ownership
    if (donation.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to update this donation'
      });
    }

    // Don't allow updating certain fields if donation is already requested
    if (donation.status === 'requested' || donation.status === 'confirmed') {
      const restrictedFields = ['quantity', 'foodType', 'availability'];
      const hasRestrictedUpdates = restrictedFields.some(field => field in updates);
      
      if (hasRestrictedUpdates && req.user.role !== 'admin') {
        return res.status(400).json({
          error: 'Cannot update quantity, food type, or availability for requested donations'
        });
      }
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('restaurant', 'name restaurantInfo.name address profileImage');

    res.json({
      message: 'Donation updated successfully',
      donation: updatedDonation
    });

  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      error: 'Failed to update donation',
      details: error.message
    });
  }
};

// Delete donation
const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid donation ID'
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    // Check ownership
    if (donation.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to delete this donation'
      });
    }

    // Don't allow deletion if donation has active requests
    if (['requested', 'confirmed'].includes(donation.status)) {
      return res.status(400).json({
        error: 'Cannot delete donation with active requests'
      });
    }

    await Donation.findByIdAndDelete(id);

    res.json({
      message: 'Donation deleted successfully'
    });

  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      error: 'Failed to delete donation'
    });
  }
};

// Get donations by restaurant
const getDonationsByRestaurant = async (req, res) => {
  try {
    const {
      restaurantId = req.user.id,
      page = 1,
      limit = 10,
      status
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { restaurant: restaurantId };
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .populate('requestedBy', 'name email phone organizationInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Get restaurant donations error:', error);
    res.status(500).json({
      error: 'Failed to get restaurant donations'
    });
  }
};

// Add donation to favorites
const addToFavorites = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid donation ID'
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    await donation.addToFavorites(req.user.id);

    res.json({
      message: 'Added to favorites successfully'
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      error: 'Failed to add to favorites'
    });
  }
};

// Remove donation from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid donation ID'
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    await donation.removeFromFavorites(req.user.id);

    res.json({
      message: 'Removed from favorites successfully'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      error: 'Failed to remove from favorites'
    });
  }
};

// Get user's favorite donations
const getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const donations = await Donation.find({
      'favorites.user': req.user.id,
      status: 'available'
    })
    .populate('restaurant', 'name restaurantInfo.name address profileImage')
    .sort({ 'favorites.addedAt': -1 })
    .skip(skip)
    .limit(limitNum);

    const total = await Donation.countDocuments({
      'favorites.user': req.user.id
    });

    res.json({
      donations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Failed to get favorites'
    });
  }
};

// Update donation status
const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'Invalid donation ID'
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found'
      });
    }

    // Check authorization
    const isOwner = donation.restaurant.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Not authorized to update donation status'
      });
    }

    await donation.updateStatus(status, userId);

    res.json({
      message: 'Donation status updated successfully',
      donation
    });

  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      error: 'Failed to update donation status'
    });
  }
};

// Get donation statistics
const getDonationStatistics = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    // If restaurantId is provided and user is not admin, check ownership
    if (restaurantId && req.user.role !== 'admin' && restaurantId !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to view these statistics'
      });
    }

    const stats = await Donation.getStatistics(restaurantId);

    res.json({
      statistics: stats[0] || {
        totalDonations: 0,
        totalQuantity: 0,
        activeDonations: 0,
        completedDonations: 0,
        averageViews: 0,
        totalViews: 0,
        totalFavorites: 0
      }
    });

  } catch (error) {
    console.error('Get donation statistics error:', error);
    res.status(500).json({
      error: 'Failed to get donation statistics'
    });
  }
};

// Search donations nearby
const searchNearby = async (req, res) => {
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
    const donations = await Donation.findNearby(coords, parseInt(maxDistance));

    res.json({
      donations: donations.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Search nearby error:', error);
    res.status(500).json({
      error: 'Failed to search nearby donations'
    });
  }
};

// Get trending donations
const getTrendingDonations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const donations = await Donation.find({
      status: 'available',
      isVerified: true,
      'availability.endTime': { $gt: new Date() }
    })
    .populate('restaurant', 'name restaurantInfo.name address profileImage stats.rating')
    .sort({ 
      views: -1, 
      'favorites.length': -1, 
      createdAt: -1 
    })
    .limit(parseInt(limit));

    res.json({
      donations
    });

  } catch (error) {
    console.error('Get trending donations error:', error);
    res.status(500).json({
      error: 'Failed to get trending donations'
    });
  }
};

module.exports = {
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
};