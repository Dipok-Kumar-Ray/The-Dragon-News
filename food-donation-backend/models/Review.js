const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'Donation reference is required']
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer information is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee information is required']
  },
  reviewType: {
    type: String,
    enum: ['charity-to-restaurant', 'restaurant-to-charity', 'user-to-restaurant'],
    required: [true, 'Review type is required']
  },
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    foodQuality: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    communication: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    punctuality: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    professionalism: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    }
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro point cannot exceed 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con point cannot exceed 100 characters']
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Review status and moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  moderationNotes: String,
  
  // Helpful votes
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      default: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Response from reviewee
  response: {
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Images attached to review
  images: [{
    url: String,
    alt: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Admin fields
  flagged: {
    type: Boolean,
    default: false
  },
  flagReasons: [{
    reason: {
      type: String,
      enum: ['inappropriate', 'fake', 'spam', 'offensive', 'irrelevant', 'other']
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Metadata
  editHistory: [{
    editedAt: { type: Date, default: Date.now },
    previousComment: String,
    editReason: String
  }],
  
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ donation: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, status: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ reviewType: 1 });
reviewSchema.index({ isVerified: 1 });

// Virtual for helpful votes count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpfulVotes.filter(vote => vote.helpful).length;
});

// Virtual for unhelpful votes count
reviewSchema.virtual('unhelpfulCount').get(function() {
  return this.helpfulVotes.filter(vote => !vote.helpful).length;
});

// Virtual for average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = [
    this.rating.foodQuality,
    this.rating.communication,
    this.rating.punctuality,
    this.rating.professionalism
  ].filter(Boolean);
  
  if (ratings.length === 0) return this.rating.overall;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for reviewer display name
reviewSchema.virtual('reviewerDisplayName').get(function() {
  if (this.isAnonymous) return 'Anonymous User';
  return this.reviewer?.name || 'Unknown User';
});

// Instance methods
reviewSchema.methods.addHelpfulVote = function(userId, helpful = true) {
  const existingVote = this.helpfulVotes.find(vote => vote.user.toString() === userId.toString());
  
  if (existingVote) {
    existingVote.helpful = helpful;
    existingVote.votedAt = new Date();
  } else {
    this.helpfulVotes.push({ user: userId, helpful, votedAt: new Date() });
  }
  
  return this.save();
};

reviewSchema.methods.removeHelpfulVote = function(userId) {
  this.helpfulVotes = this.helpfulVotes.filter(vote => vote.user.toString() !== userId.toString());
  return this.save();
};

reviewSchema.methods.addResponse = function(comment, responderId) {
  this.response = {
    comment,
    respondedAt: new Date(),
    respondedBy: responderId
  };
  return this.save();
};

reviewSchema.methods.flagReview = function(reason, reporterId, description = '') {
  this.flagged = true;
  this.flagReasons.push({
    reason,
    reportedBy: reporterId,
    reportedAt: new Date(),
    description
  });
  
  // Auto-moderate if multiple flags
  if (this.flagReasons.length >= 3) {
    this.status = 'flagged';
  }
  
  return this.save();
};

reviewSchema.methods.editReview = function(newComment, editReason = '') {
  this.editHistory.push({
    editedAt: new Date(),
    previousComment: this.comment,
    editReason
  });
  
  this.comment = newComment;
  this.isEdited = true;
  
  return this.save();
};

reviewSchema.methods.verify = function(verifierId) {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = verifierId;
  return this.save();
};

// Static methods
reviewSchema.statics.findByReviewee = function(revieweeId, filters = {}) {
  return this.find({
    reviewee: revieweeId,
    status: 'approved',
    ...filters
  })
  .populate('reviewer', 'name profileImage')
  .populate('donation', 'title foodType')
  .sort({ createdAt: -1 });
};

reviewSchema.statics.getAverageRating = function(revieweeId) {
  return this.aggregate([
    {
      $match: {
        reviewee: mongoose.Types.ObjectId(revieweeId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageOverall: { $avg: '$rating.overall' },
        averageFoodQuality: { $avg: '$rating.foodQuality' },
        averageCommunication: { $avg: '$rating.communication' },
        averagePunctuality: { $avg: '$rating.punctuality' },
        averageProfessionalism: { $avg: '$rating.professionalism' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating.overall'
        }
      }
    },
    {
      $addFields: {
        ratingBreakdown: {
          1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
          2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
        }
      }
    }
  ]);
};

reviewSchema.statics.getReviewStatistics = function(revieweeId = null) {
  const matchStage = revieweeId ? { reviewee: mongoose.Types.ObjectId(revieweeId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageRating: { $avg: '$rating.overall' }
      }
    }
  ]);
};

reviewSchema.statics.findTopReviewed = function(limit = 10) {
  return this.aggregate([
    {
      $match: { status: 'approved' }
    },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating.overall' },
        reviewCount: { $sum: 1 }
      }
    },
    {
      $match: {
        reviewCount: { $gte: 5 } // At least 5 reviews
      }
    },
    {
      $sort: { averageRating: -1, reviewCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    }
  ]);
};

reviewSchema.statics.findRecentReviews = function(limit = 20) {
  return this.find({ status: 'approved' })
    .populate('reviewer', 'name profileImage')
    .populate('reviewee', 'name restaurantInfo.name charityInfo.name')
    .populate('donation', 'title foodType')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Validate that reviewer and reviewee are different
  if (this.reviewer.toString() === this.reviewee.toString()) {
    const error = new Error('Cannot review yourself');
    return next(error);
  }
  
  // Set overall rating as average if not provided
  if (!this.rating.overall && this.rating.foodQuality) {
    const ratings = [
      this.rating.foodQuality,
      this.rating.communication,
      this.rating.punctuality,
      this.rating.professionalism
    ].filter(Boolean);
    
    if (ratings.length > 0) {
      this.rating.overall = Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
    }
  }
  
  next();
});

// Post-save middleware to update user stats
reviewSchema.post('save', async function(doc) {
  if (doc.status === 'approved') {
    try {
      const User = mongoose.model('User');
      const reviewee = await User.findById(doc.reviewee);
      
      if (reviewee) {
        // Recalculate average rating
        const stats = await mongoose.model('Review').getAverageRating(doc.reviewee);
        if (stats.length > 0) {
          reviewee.stats.rating = Math.round(stats[0].averageOverall * 10) / 10;
          reviewee.stats.reviewCount = stats[0].totalReviews;
          await reviewee.save();
        }
      }
    } catch (error) {
      console.error('Error updating user rating stats:', error);
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);