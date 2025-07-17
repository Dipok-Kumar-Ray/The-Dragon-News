const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'ডোনেশনের শিরোনাম প্রয়োজন'],
    trim: true,
    minlength: [3, 'শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে'],
    maxlength: [100, 'শিরোনাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে']
  },
  
  description: {
    type: String,
    required: [true, 'ডোনেশনের বিবরণ প্রয়োজন'],
    trim: true,
    minlength: [10, 'বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে'],
    maxlength: [1000, 'বিবরণ সর্বোচ্চ ১০০০ অক্ষরের হতে পারে']
  },

  // Food Details
  foodType: {
    type: String,
    required: [true, 'খাবারের ধরন উল্লেখ করুন'],
    trim: true,
    enum: {
      values: [
        'ভাত ও তরকারি',
        'রুটি ও তরকারি', 
        'বিরিয়ানি',
        'পোলাও',
        'খিচুড়ি',
        'নুডলস',
        'পাস্তা',
        'স্যান্ডউইচ',
        'বার্গার',
        'পিৎজা',
        'সালাদ',
        'ফল',
        'মিষ্টি',
        'বেকারি আইটেম',
        'পানীয়',
        'অন্যান্য'
      ],
      message: 'অবৈধ খাবারের ধরন'
    }
  },

  quantity: {
    type: String,
    required: [true, 'পরিমাণ উল্লেখ করুন'],
    trim: true,
    validate: {
      validator: function(v) {
        // Accept formats like "10 kg", "5 portions", "20 people", etc.
        return /^[\d\s]+(kg|কেজি|portions?|জন|লোক|people|টি|টুকরা|pieces?|লিটার|liters?|গ্লাস|glass|কাপ|cups?|প্লেট|plates?)$/i.test(v);
      },
      message: 'পরিমাণ সঠিক ফরম্যাটে দিন (যেমন: ১০ কেজি, ৫ জন, ২০ প্লেট)'
    }
  },

  // Restaurant Information
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'রেস্তোরাঁর তথ্য প্রয়োজন']
  },

  restaurantName: {
    type: String,
    required: [true, 'রেস্তোরাঁর নাম প্রয়োজন'],
    trim: true
  },

  // Location
  location: {
    type: String,
    required: [true, 'অবস্থান প্রয়োজন'],
    trim: true,
    minlength: [5, 'অবস্থান কমপক্ষে ৫ অক্ষরের হতে হবে'],
    maxlength: [200, 'অবস্থান সর্বোচ্চ ২০০ অক্ষরের হতে পারে']
  },

  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'অক্ষাংশ -৯০ থেকে ৯০ এর মধ্যে হতে হবে'],
      max: [90, 'অক্ষাংশ -৯০ থেকে ৯০ এর মধ্যে হতে হবে']
    },
    longitude: {
      type: Number,
      min: [-180, 'দ্রাঘিমাংশ -১৮০ থেকে ১৮০ এর মধ্যে হতে হবে'],
      max: [180, 'দ্রাঘিমাংশ -১৮০ থেকে ১৮০ এর মধ্যে হতে হবে']
    }
  },

  // Pickup Time Window
  pickupTimeStart: {
    type: Date,
    required: [true, 'পিকআপ শুরুর সময় প্রয়োজন'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'পিকআপ শুরুর সময় ভবিষ্যতে হতে হবে'
    }
  },

  pickupTimeEnd: {
    type: Date,
    required: [true, 'পিকআপ শেষের সময় প্রয়োজন'],
    validate: {
      validator: function(v) {
        return v > this.pickupTimeStart;
      },
      message: 'পিকআপ শেষের সময় শুরুর সময়ের পরে হতে হবে'
    }
  },

  pickupInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'পিকআপ নির্দেশনা সর্বোচ্চ ৫০০ অক্ষরের হতে পারে'],
    default: ''
  },

  // Status Management
  status: {
    type: String,
    enum: {
      values: ['pending', 'available', 'requested', 'accepted', 'picked_up', 'expired', 'cancelled'],
      message: 'অবৈধ স্ট্যাটাস'
    },
    default: 'pending'
  },

  // Admin Verification
  verified: {
    type: Boolean,
    default: false
  },

  approved: {
    type: Boolean,
    default: false
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  verifiedAt: {
    type: Date
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approvedAt: {
    type: Date
  },

  // Assignment
  assignedCharity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  assignedAt: {
    type: Date
  },

  // Image
  image: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'ছবির URL সঠিক ফরম্যাটে দিন'
    }
  },

  // Contact Information
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
    email: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'সঠিক ইমেইল ঠিকানা দিন'
      }
    },
    alternateContact: {
      type: String,
      maxlength: [100, 'বিকল্প যোগাযোগ সর্বোচ্চ ১০০ অক্ষরের হতে পারে']
    }
  },

  // Requests and Reviews
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationRequest'
  }],

  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],

  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },

  favoriteCount: {
    type: Number,
    default: 0
  },

  // Special Instructions
  allergyInfo: {
    type: String,
    maxlength: [200, 'অ্যালার্জি তথ্য সর্বোচ্চ ২০০ অক্ষরের হতে পারে'],
    trim: true
  },

  storageInstructions: {
    type: String,
    maxlength: [200, 'সংরক্ষণ নির্দেশনা সর্বোচ্চ ২০০ অক্ষরের হতে পারে'],
    trim: true
  },

  // Metadata
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // Automatic deletion based on this field
  },

  pickedUpAt: {
    type: Date
  },

  cancelledAt: {
    type: Date
  },

  cancellationReason: {
    type: String,
    maxlength: [300, 'বাতিলের কারণ সর্বোচ্চ ৩০০ অক্ষরের হতে পারে']
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
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
donationSchema.index({ restaurantId: 1, status: 1 });
donationSchema.index({ location: 'text', title: 'text', description: 'text', foodType: 'text' });
donationSchema.index({ pickupTimeStart: 1, pickupTimeEnd: 1 });
donationSchema.index({ verified: 1, approved: 1, status: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ coordinates: '2dsphere' }); // For geospatial queries

// Virtual properties
donationSchema.virtual('isActive').get(function() {
  return ['available', 'requested', 'accepted'].includes(this.status) && 
         new Date() < this.pickupTimeEnd;
});

donationSchema.virtual('isExpired').get(function() {
  return new Date() > this.pickupTimeEnd;
});

donationSchema.virtual('timeRemaining').get(function() {
  if (this.isExpired) return 0;
  return Math.max(0, this.pickupTimeEnd.getTime() - new Date().getTime());
});

donationSchema.virtual('requestCount').get(function() {
  return this.requests ? this.requests.length : 0;
});

donationSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  // This would need to be populated with actual review data
  return 0;
});

// Instance methods
donationSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

donationSchema.methods.addToFavorites = function() {
  this.favoriteCount += 1;
  return this.save();
};

donationSchema.methods.removeFromFavorites = function() {
  this.favoriteCount = Math.max(0, this.favoriteCount - 1);
  return this.save();
};

donationSchema.methods.markAsExpired = function() {
  this.status = 'expired';
  this.updatedAt = new Date();
  return this.save();
};

donationSchema.methods.assignToCharity = function(charityId) {
  this.assignedCharity = charityId;
  this.assignedAt = new Date();
  this.status = 'accepted';
  this.updatedAt = new Date();
  return this.save();
};

donationSchema.methods.markAsPickedUp = function() {
  this.status = 'picked_up';
  this.pickedUpAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Static methods
donationSchema.statics.findAvailable = function() {
  return this.find({
    status: 'available',
    verified: true,
    approved: true,
    pickupTimeEnd: { $gt: new Date() }
  });
};

donationSchema.statics.findByLocation = function(location, radius = 10) {
  return this.find({
    location: { $regex: location, $options: 'i' },
    verified: true,
    approved: true,
    status: { $in: ['available', 'requested'] }
  });
};

donationSchema.statics.findExpired = function() {
  return this.find({
    $or: [
      { pickupTimeEnd: { $lt: new Date() } },
      { status: 'expired' }
    ]
  });
};

donationSchema.statics.getStatsByRestaurant = function(restaurantId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        restaurantId: restaurantId,
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
        totalQuantity: { $sum: 1 } // Would need to parse quantity string
      }
    }
  ]);
};

// Middleware
donationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-expire if pickup time has passed
  if (new Date() > this.pickupTimeEnd && 
      ['available', 'requested', 'accepted'].includes(this.status)) {
    this.status = 'expired';
  }
  
  // Set expiry for automatic cleanup (30 days after pickup end time)
  if (!this.expiresAt) {
    this.expiresAt = new Date(this.pickupTimeEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

donationSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Post-save middleware for logging
donationSchema.post('save', function(doc) {
  console.log(`Donation ${doc._id} saved with status: ${doc.status}`);
});

module.exports = mongoose.model('Donation', donationSchema);