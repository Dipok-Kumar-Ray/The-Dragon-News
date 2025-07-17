const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'Donation reference is required']
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester information is required']
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Restaurant information is required']
  },
  message: {
    type: String,
    required: [true, 'Request message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  requestedQuantity: {
    value: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [300, 'Response message cannot exceed 300 characters']
  },
  pickupDetails: {
    preferredTime: Date,
    contactPerson: {
      name: String,
      phone: String,
      email: String
    },
    vehicleInfo: String,
    specialInstructions: String
  },
  organizationInfo: {
    name: String,
    type: {
      type: String,
      enum: ['charity', 'ngo', 'community-center', 'school', 'hospital', 'individual']
    },
    registrationNumber: String,
    servingArea: String,
    beneficiaryCount: Number,
    website: String
  },
  priorityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere'
  },
  distance: Number, // Distance from donation location
  
  // Response tracking
  respondedAt: Date,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Pickup tracking
  confirmedAt: Date,
  pickedUpAt: Date,
  completedAt: Date,
  
  // Documentation
  documents: [{
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Rating and feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  
  // Admin notes
  adminNotes: String,
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
donationRequestSchema.index({ donation: 1, requester: 1 }, { unique: true });
donationRequestSchema.index({ status: 1 });
donationRequestSchema.index({ restaurant: 1 });
donationRequestSchema.index({ requester: 1 });
donationRequestSchema.index({ urgency: 1 });
donationRequestSchema.index({ priorityScore: -1 });
donationRequestSchema.index({ createdAt: -1 });
donationRequestSchema.index({ coordinates: '2dsphere' });

// Virtual for time since request
donationRequestSchema.virtual('timeSinceRequest').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for response time
donationRequestSchema.virtual('responseTime').get(function() {
  if (!this.respondedAt) return null;
  return this.respondedAt.getTime() - this.createdAt.getTime();
});

// Virtual for requester type
donationRequestSchema.virtual('requesterType').get(function() {
  return this.organizationInfo?.type || 'individual';
});

// Pre-save middleware
donationRequestSchema.pre('save', function(next) {
  // Calculate priority score based on various factors
  if (this.isNew || this.isModified('urgency') || this.isModified('organizationInfo')) {
    this.priorityScore = this.calculatePriorityScore();
  }
  next();
});

// Instance methods
donationRequestSchema.methods.calculatePriorityScore = function() {
  let score = 0;
  
  // Urgency score (0-40 points)
  const urgencyScores = { low: 10, medium: 20, high: 30, critical: 40 };
  score += urgencyScores[this.urgency] || 20;
  
  // Organization type score (0-25 points)
  const orgTypeScores = {
    'charity': 25,
    'ngo': 23,
    'hospital': 22,
    'school': 20,
    'community-center': 18,
    'individual': 10
  };
  score += orgTypeScores[this.organizationInfo?.type] || 10;
  
  // Beneficiary count score (0-20 points)
  if (this.organizationInfo?.beneficiaryCount) {
    if (this.organizationInfo.beneficiaryCount >= 100) score += 20;
    else if (this.organizationInfo.beneficiaryCount >= 50) score += 15;
    else if (this.organizationInfo.beneficiaryCount >= 20) score += 10;
    else score += 5;
  }
  
  // Distance score (0-15 points) - closer gets higher score
  if (this.distance !== undefined) {
    if (this.distance <= 5) score += 15;
    else if (this.distance <= 10) score += 12;
    else if (this.distance <= 20) score += 8;
    else if (this.distance <= 50) score += 5;
  }
  
  return Math.min(score, 100);
};

donationRequestSchema.methods.approve = function(responseMessage = '', responderId = null) {
  this.status = 'approved';
  this.responseMessage = responseMessage;
  this.respondedAt = new Date();
  if (responderId) this.respondedBy = responderId;
  return this.save();
};

donationRequestSchema.methods.reject = function(responseMessage = '', responderId = null) {
  this.status = 'rejected';
  this.responseMessage = responseMessage;
  this.respondedAt = new Date();
  if (responderId) this.respondedBy = responderId;
  return this.save();
};

donationRequestSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

donationRequestSchema.methods.markAsPickedUp = function() {
  this.pickedUpAt = new Date();
  if (this.status === 'approved') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  return this.save();
};

donationRequestSchema.methods.addRating = function(rating, feedback = '') {
  this.rating = rating;
  this.feedback = feedback;
  return this.save();
};

// Static methods
donationRequestSchema.statics.findPendingForRestaurant = function(restaurantId) {
  return this.find({
    restaurant: restaurantId,
    status: 'pending'
  })
  .populate('requester', 'name email phone organizationInfo')
  .populate('donation', 'title foodType quantity location')
  .sort({ priorityScore: -1, createdAt: 1 });
};

donationRequestSchema.statics.findByRequester = function(requesterId) {
  return this.find({ requester: requesterId })
    .populate('donation', 'title foodType quantity status location restaurant')
    .populate('restaurant', 'name restaurantInfo.name address')
    .sort({ createdAt: -1 });
};

donationRequestSchema.statics.getStatistics = function(filters = {}) {
  return this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        pendingRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        completedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageResponseTime: {
          $avg: {
            $cond: [
              { $ne: ['$respondedAt', null] },
              { $subtract: ['$respondedAt', '$createdAt'] },
              null
            ]
          }
        },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
};

donationRequestSchema.statics.findUrgentRequests = function(timeFrame = 60) {
  const timeAgo = new Date(Date.now() - timeFrame * 60 * 1000);
  return this.find({
    urgency: { $in: ['high', 'critical'] },
    status: 'pending',
    createdAt: { $gte: timeAgo }
  })
  .populate('donation', 'title foodType location restaurant')
  .populate('requester', 'name organizationInfo')
  .sort({ priorityScore: -1 });
};

module.exports = mongoose.model('DonationRequest', donationRequestSchema);