const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Donation title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    enum: ['cooked', 'raw', 'packaged', 'fruits', 'vegetables', 'dairy', 'beverages', 'others']
  },
  cuisine: {
    type: String,
    enum: ['bengali', 'indian', 'chinese', 'continental', 'fast-food', 'desserts', 'mixed', 'others']
  },
  quantity: {
    value: {
      type: Number,
      required: [true, 'Quantity value is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: ['people', 'kg', 'pieces', 'plates', 'boxes', 'packets']
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Restaurant information is required']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required'],
      index: '2dsphere'
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    area: String,
    landmark: String
  },
  availability: {
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    isFlexible: {
      type: Boolean,
      default: false
    }
  },
  pickupInstructions: {
    type: String,
    maxlength: [500, 'Pickup instructions cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'available', 'requested', 'confirmed', 'picked-up', 'completed', 'expired', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dietary: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    dairyFree: { type: Boolean, default: false },
    nutFree: { type: Boolean, default: false },
    halal: { type: Boolean, default: false }
  },
  preservationMethod: {
    type: String,
    enum: ['fresh', 'refrigerated', 'frozen', 'canned', 'dried'],
    default: 'fresh'
  },
  shelfLife: {
    hours: {
      type: Number,
      required: [true, 'Shelf life is required'],
      min: [1, 'Shelf life must be at least 1 hour']
    }
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickedUpBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupTime: Date,
  completedAt: Date,
  
  // Tracking and analytics
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Quality and safety
  temperature: {
    type: String,
    enum: ['hot', 'warm', 'room-temperature', 'cold', 'frozen']
  },
  packaging: {
    type: String,
    enum: ['containers', 'wrapped', 'sealed', 'open', 'bulk']
  },
  safetyNotes: String,
  
  // Admin fields
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  rejectionReason: String,
  
  // Metadata
  tags: [String],
  estimatedValue: Number,
  servingSize: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and search
donationSchema.index({ status: 1 });
donationSchema.index({ restaurant: 1 });
donationSchema.index({ foodType: 1 });
donationSchema.index({ 'location.coordinates': '2dsphere' });
donationSchema.index({ 'location.city': 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ 'availability.startTime': 1 });
donationSchema.index({ 'availability.endTime': 1 });
donationSchema.index({ title: 'text', description: 'text' });

// Compound indexes
donationSchema.index({ status: 1, 'availability.endTime': 1 });
donationSchema.index({ 'location.city': 1, status: 1 });
donationSchema.index({ restaurant: 1, status: 1 });

// Virtual for formatted quantity
donationSchema.virtual('formattedQuantity').get(function() {
  return `${this.quantity.value} ${this.quantity.unit}`;
});

// Virtual for availability status
donationSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  return this.status === 'available' && 
         this.availability.endTime > now &&
         this.availability.startTime <= now;
});

// Virtual for time remaining
donationSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const timeLeft = this.availability.endTime - now;
  if (timeLeft <= 0) return 0;
  return Math.floor(timeLeft / (1000 * 60 * 60)); // hours
});

// Virtual for primary image
donationSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for distance (will be added during queries)
donationSchema.virtual('distance');

// Pre-save middleware
donationSchema.pre('save', function(next) {
  // Auto-expire if end time has passed
  if (this.availability.endTime < new Date() && this.status === 'available') {
    this.status = 'expired';
  }
  
  // Validate pickup time
  if (this.pickupTime && this.pickupTime > this.availability.endTime) {
    const error = new Error('Pickup time cannot be after availability end time');
    return next(error);
  }
  
  next();
});

// Instance methods
donationSchema.methods.addToFavorites = function(userId) {
  const existingFavorite = this.favorites.find(fav => fav.user.toString() === userId.toString());
  if (!existingFavorite) {
    this.favorites.push({ user: userId });
  }
  return this.save();
};

donationSchema.methods.removeFromFavorites = function(userId) {
  this.favorites = this.favorites.filter(fav => fav.user.toString() !== userId.toString());
  return this.save();
};

donationSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

donationSchema.methods.canBeRequestedBy = function(user) {
  if (!user) return false;
  if (this.status !== 'available') return false;
  if (this.restaurant.toString() === user._id.toString()) return false;
  if (user.role !== 'charity' && user.role !== 'user') return false;
  return true;
};

donationSchema.methods.updateStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'requested':
      this.requestedBy = userId;
      break;
    case 'confirmed':
      this.confirmedBy = userId;
      break;
    case 'picked-up':
      this.pickedUpBy = userId;
      this.pickupTime = new Date();
      break;
    case 'completed':
      this.completedAt = new Date();
      break;
  }
  
  return this.save();
};

// Static methods
donationSchema.statics.findAvailable = function(filters = {}) {
  const query = {
    status: 'available',
    'availability.endTime': { $gt: new Date() },
    isVerified: true,
    ...filters
  };
  
  return this.find(query)
    .populate('restaurant', 'name restaurantInfo.name address profileImage')
    .sort({ createdAt: -1 });
};

donationSchema.statics.findNearby = function(coordinates, maxDistance = 10000, filters = {}) {
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: coordinates
        },
        distanceField: 'distance',
        maxDistance: maxDistance,
        spherical: true,
        query: {
          status: 'available',
          'availability.endTime': { $gt: new Date() },
          isVerified: true,
          ...filters
        }
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
      $sort: { distance: 1, createdAt: -1 }
    }
  ]);
};

donationSchema.statics.getStatistics = function(restaurantId = null) {
  const matchStage = restaurantId ? { restaurant: mongoose.Types.ObjectId(restaurantId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDonations: { $sum: 1 },
        totalQuantity: { $sum: '$quantity.value' },
        activeDonations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
          }
        },
        completedDonations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        averageViews: { $avg: '$views' },
        totalViews: { $sum: '$views' },
        totalFavorites: { $sum: { $size: '$favorites' } }
      }
    }
  ]);
};

module.exports = mongoose.model('Donation', donationSchema);