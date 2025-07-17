const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  documentId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    createdTime: {
      type: Date
    },
    modifiedTime: {
      type: Date
    },
    revisionId: {
      type: String
    }
  },
  structure: {
    totalElements: {
      type: Number,
      default: 0
    },
    paragraphs: {
      type: Number,
      default: 0
    },
    tables: {
      type: Number,
      default: 0
    },
    tableOfContents: {
      type: Number,
      default: 0
    },
    images: {
      type: Number,
      default: 0
    },
    pageBreaks: {
      type: Number,
      default: 0
    }
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  notes: {
    type: String,
    maxlength: 1000
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  accessedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
DocumentSchema.index({ userId: 1, documentId: 1 }, { unique: true });
DocumentSchema.index({ userId: 1, accessedAt: -1 });
DocumentSchema.index({ userId: 1, isFavorite: 1 });
DocumentSchema.index({ title: 'text', content: 'text' });

// Virtuals
DocumentSchema.virtual('contentPreview').get(function() {
  return this.content ? this.content.substring(0, 200) + '...' : '';
});

DocumentSchema.virtual('formattedAccessedAt').get(function() {
  return this.accessedAt.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Pre-save middleware
DocumentSchema.pre('save', function(next) {
  if (this.content) {
    // শব্দ গণনা
    this.wordCount = this.content.split(/\s+/).length;
  }
  next();
});

// Static methods
DocumentSchema.statics.findByUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = 'active',
    sortBy = 'accessedAt',
    sortOrder = -1
  } = options;

  const skip = (page - 1) * limit;
  let query = { userId, status };

  if (search) {
    query.$text = { $search: search };
  }

  return this.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .select('-content'); // বড় content ফিল্ড বাদ দেওয়া
};

DocumentSchema.statics.getStatsByUser = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'active' } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalWords: { $sum: '$wordCount' },
        averageWords: { $avg: '$wordCount' },
        favoriteCount: {
          $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance methods
DocumentSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

DocumentSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

DocumentSchema.methods.restore = function() {
  this.status = 'active';
  return this.save();
};

DocumentSchema.methods.updateAccess = function() {
  this.accessedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Document', DocumentSchema);