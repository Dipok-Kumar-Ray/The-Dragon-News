const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
  // Reference to donation
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'ডোনেশন রেফারেন্স প্রয়োজন'],
    index: true
  },

  // Charity Information
  charityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'দাতব্য সংস্থার তথ্য প্রয়োজন'],
    index: true
  },

  charityName: {
    type: String,
    required: [true, 'দাতব্য সংস্থার নাম প্রয়োজন'],
    trim: true
  },

  charityEmail: {
    type: String,
    required: [true, 'দাতব্য সংস্থার ইমেইল প্রয়োজন'],
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'সঠিক ইমেইল ঠিকানা দিন'
    }
  },

  // Request Details
  requestDescription: {
    type: String,
    required: [true, 'রিকুয়েস্টের বিবরণ প্রয়োজন'],
    trim: true,
    minlength: [10, 'বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে'],
    maxlength: [500, 'বিবরণ সর্বোচ্চ ৫০০ অক্ষরের হতে পারে']
  },

  // Pickup Time
  pickupTime: {
    type: Date,
    required: [true, 'পিকআপ সময় প্রয়োজন'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'পিকআপ সময় ভবিষ্যতে হতে হবে'
    }
  },

  // Request Status
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      message: 'অবৈধ রিকুয়েস্ট স্ট্যাটাস'
    },
    default: 'pending',
    index: true
  },

  // Response from Restaurant
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [300, 'প্রতিক্রিয়া সর্বোচ্চ ৩০০ অক্ষরের হতে পারে']
  },

  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  respondedAt: {
    type: Date
  },

  // Charity Contact Information
  contactInfo: {
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^(\+88)?01[3-9]\d{8}$/.test(v);
        },
        message: 'সঠিক মোবাইল নম্বর দিন'
      }
    },
    alternatePhone: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^(\+88)?01[3-9]\d{8}$/.test(v);
        },
        message: 'সঠিক বিকল্প মোবাইল নম্বর দিন'
      }
    },
    representativeName: {
      type: String,
      trim: true,
      maxlength: [100, 'প্রতিনিধির নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে']
    }
  },

  // Pickup Details
  pickupAddress: {
    type: String,
    trim: true,
    maxlength: [200, 'পিকআপ ঠিকানা সর্বোচ্চ ২০০ অক্ষরের হতে পারে']
  },

  transportArrangement: {
    type: String,
    enum: ['own_vehicle', 'hired_transport', 'public_transport', 'walking', 'other'],
    default: 'own_vehicle'
  },

  estimatedPickupDuration: {
    type: Number, // in minutes
    min: [5, 'পিকআপ সময় কমপক্ষে ৫ মিনিট'],
    max: [120, 'পিকআপ সময় সর্বোচ্চ ১২০ মিনিট']
  },

  // Usage Information
  beneficiaryInfo: {
    targetGroup: {
      type: String,
      enum: [
        'homeless',
        'orphans',
        'elderly',
        'disabled',
        'refugees',
        'students',
        'poor_families',
        'disaster_victims',
        'other'
      ]
    },
    estimatedBeneficiaries: {
      type: Number,
      min: [1, 'কমপক্ষে ১ জন উপকারভোগী'],
      max: [1000, 'সর্বোচ্চ ১০০০ জন উপকারভোগী']
    },
    distributionPlan: {
      type: String,
      trim: true,
      maxlength: [300, 'বিতরণ পরিকল্পনা সর্বোচ্চ ৩০০ অক্ষরের হতে পারে']
    }
  },

  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  urgencyReason: {
    type: String,
    trim: true,
    maxlength: [200, 'জরুরী কারণ সর্বোচ্চ ২০০ অক্ষরের হতে পারে']
  },

  // Completion Details
  pickupConfirmation: {
    confirmed: {
      type: Boolean,
      default: false
    },
    confirmedAt: {
      type: Date
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confirmationCode: {
      type: String,
      length: 6
    }
  },

  deliveryConfirmation: {
    delivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    beneficiariesFed: {
      type: Number,
      min: 0
    },
    feedbackMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'প্রতিক্রিয়া সর্বোচ্চ ৫০০ অক্ষরের হতে পারে']
    }
  },

  // Cancellation
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [300, 'বাতিলের কারণ সর্বোচ্চ ৩০০ অক্ষরের হতে পারে']
  },

  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  cancelledAt: {
    type: Date
  },

  // Ratings and Review
  rating: {
    charityToRestaurant: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'মন্তব্য সর্বোচ্চ ৫০০ অক্ষরের হতে পারে']
      }
    },
    restaurantToCharity: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'মন্তব্য সর্বোচ্চ ৫০০ অক্ষরের হতে পারে']
      }
    }
  },

  // Metadata
  notificationsSent: [{
    type: {
      type: String,
      enum: ['request_created', 'request_accepted', 'request_rejected', 'pickup_reminder', 'completion_reminder']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipient: {
      type: String,
      enum: ['charity', 'restaurant', 'both']
    }
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
donationRequestSchema.index({ donationId: 1, charityId: 1 }, { unique: true }); // One request per charity per donation
donationRequestSchema.index({ charityId: 1, status: 1 });
donationRequestSchema.index({ status: 1, createdAt: -1 });
donationRequestSchema.index({ pickupTime: 1 });
donationRequestSchema.index({ 'pickupConfirmation.confirmed': 1 });

// Virtual properties
donationRequestSchema.virtual('isActive').get(function() {
  return ['pending', 'accepted'].includes(this.status) && 
         new Date() < this.pickupTime;
});

donationRequestSchema.virtual('isExpired').get(function() {
  return new Date() > this.pickupTime && !this.pickupConfirmation.confirmed;
});

donationRequestSchema.virtual('canBeAccepted').get(function() {
  return this.status === 'pending' && new Date() < this.pickupTime;
});

donationRequestSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'accepted'].includes(this.status) && 
         new Date() < this.pickupTime;
});

donationRequestSchema.virtual('timeUntilPickup').get(function() {
  if (this.isExpired) return 0;
  return Math.max(0, this.pickupTime.getTime() - new Date().getTime());
});

// Instance methods
donationRequestSchema.methods.accept = function(respondedBy, responseMessage = '') {
  this.status = 'accepted';
  this.respondedBy = respondedBy;
  this.respondedAt = new Date();
  this.responseMessage = responseMessage;
  this.updatedAt = new Date();
  return this.save();
};

donationRequestSchema.methods.reject = function(respondedBy, responseMessage = '') {
  this.status = 'rejected';
  this.respondedBy = respondedBy;
  this.respondedAt = new Date();
  this.responseMessage = responseMessage;
  this.updatedAt = new Date();
  return this.save();
};

donationRequestSchema.methods.cancel = function(cancelledBy, reason = '') {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.updatedAt = new Date();
  return this.save();
};

donationRequestSchema.methods.confirmPickup = function(confirmedBy) {
  this.pickupConfirmation.confirmed = true;
  this.pickupConfirmation.confirmedAt = new Date();
  this.pickupConfirmation.confirmedBy = confirmedBy;
  this.pickupConfirmation.confirmationCode = this.generateConfirmationCode();
  this.updatedAt = new Date();
  return this.save();
};

donationRequestSchema.methods.confirmDelivery = function(beneficiariesFed, feedbackMessage = '') {
  this.deliveryConfirmation.delivered = true;
  this.deliveryConfirmation.deliveredAt = new Date();
  this.deliveryConfirmation.beneficiariesFed = beneficiariesFed;
  this.deliveryConfirmation.feedbackMessage = feedbackMessage;
  this.status = 'completed';
  this.updatedAt = new Date();
  return this.save();
};

donationRequestSchema.methods.generateConfirmationCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

donationRequestSchema.methods.addNotification = function(type, recipient = 'both') {
  this.notificationsSent.push({
    type,
    recipient,
    sentAt: new Date()
  });
  return this.save();
};

// Static methods
donationRequestSchema.statics.findPendingForDonation = function(donationId) {
  return this.find({
    donationId,
    status: 'pending'
  }).populate('charityId', 'name organizationName email phone');
};

donationRequestSchema.statics.findByCharityAndStatus = function(charityId, status) {
  return this.find({
    charityId,
    status
  }).populate('donationId');
};

donationRequestSchema.statics.findExpiredRequests = function() {
  return this.find({
    status: { $in: ['pending', 'accepted'] },
    pickupTime: { $lt: new Date() },
    'pickupConfirmation.confirmed': false
  });
};

donationRequestSchema.statics.getStatsForCharity = function(charityId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        charityId: charityId,
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBeneficiaries: { $sum: '$deliveryConfirmation.beneficiariesFed' }
      }
    }
  ]);
};

// Middleware
donationRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-expire if pickup time has passed and not confirmed
  if (new Date() > this.pickupTime && 
      ['pending', 'accepted'].includes(this.status) &&
      !this.pickupConfirmation.confirmed) {
    this.status = 'cancelled';
    this.cancellationReason = 'সময়সীমা অতিক্রম করেছে';
  }
  
  next();
});

donationRequestSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Post-save middleware for notifications
donationRequestSchema.post('save', function(doc) {
  // Log the request status change
  console.log(`Donation Request ${doc._id} status changed to: ${doc.status}`);
  
  // Here you could trigger email/SMS notifications
  // Example: if status changed to 'accepted', notify charity
  // if status changed to 'rejected', notify charity with reason
});

module.exports = mongoose.model('DonationRequest', donationRequestSchema);