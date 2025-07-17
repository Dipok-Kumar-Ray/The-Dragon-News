const express = require('express');
const { body, validationResult } = require('express-validator');
const googleDocsService = require('../services/googleDocsService');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/google-docs/auth-url
 * @desc    Google OAuth URL পায়
 * @access  Public
 */
router.get('/auth-url', (req, res) => {
  try {
    const authUrl = googleDocsService.getAuthUrl();
    
    res.json({
      success: true,
      message: 'Google অথরাইজেশন URL তৈরি করা হয়েছে',
      data: { authUrl }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'অথরাইজেশন URL তৈরি করতে ত্রুটি',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/google-docs/callback
 * @desc    Google OAuth callback হ্যান্ডল করে
 * @access  Private
 */
router.post('/callback', [
  auth,
  body('code').notEmpty().withMessage('Authorization code প্রয়োজন')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ডাটা',
        errors: errors.array()
      });
    }

    const { code } = req.body;
    const tokens = await googleDocsService.getTokens(code);
    
    // ডাটাবেসে টোকেন সংরক্ষণ (যদি প্রয়োজন হয়)
    // এখানে User model এ tokens সেভ করতে পারেন

    res.json({
      success: true,
      message: 'সফলভাবে Google এর সাথে সংযুক্ত হয়েছে',
      data: { tokens }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Google অথরাইজেশনে ত্রুটি',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/google-docs/read
 * @desc    Google Docs ডকুমেন্ট পড়ে
 * @access  Private
 */
router.post('/read', [
  auth,
  body('documentUrl').notEmpty().withMessage('ডকুমেন্ট URL প্রয়োজন'),
  body('tokens').notEmpty().withMessage('Access tokens প্রয়োজন')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ডাটা',
        errors: errors.array()
      });
    }

    const { documentUrl, tokens } = req.body;
    
    // URL থেকে Document ID বের করা
    const documentId = googleDocsService.extractDocumentId(documentUrl);
    
    // ডকুমেন্ট পড়া
    const documentData = await googleDocsService.readDocument(documentId, tokens);
    
    // ডাটাবেসে সংরক্ষণ
    const newDocument = new Document({
      userId: req.user.id,
      documentId: documentData.documentId,
      title: documentData.title,
      content: documentData.content,
      metadata: documentData.metadata,
      structure: documentData.structure,
      originalUrl: documentUrl,
      accessedAt: new Date()
    });

    await newDocument.save();

    res.json({
      success: true,
      message: 'ডকুমেন্ট সফলভাবে পড়া হয়েছে',
      data: documentData
    });

  } catch (error) {
    console.error('ডকুমেন্ট পড়তে ত্রুটি:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'ডকুমেন্ট পড়তে ত্রুটি'
    });
  }
});

/**
 * @route   GET /api/google-docs/documents
 * @desc    ব্যবহারকারীর সব ডকুমেন্ট পায়
 * @access  Private
 */
router.get('/documents', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const documents = await Document.find({ userId: req.user.id })
      .select('-content') // বড় content ফিল্ড বাদ দেওয়া
      .sort({ accessedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      message: 'ডকুমেন্ট তালিকা পাওয়া গেছে',
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ডকুমেন্ট তালিকা পেতে ত্রুটি',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/google-docs/documents/:id
 * @desc    নির্দিষ্ট ডকুমেন্ট পায়
 * @access  Private
 */
router.get('/documents/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'ডকুমেন্ট খুঁজে পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'ডকুমেন্ট পাওয়া গেছে',
      data: document
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ডকুমেন্ট পেতে ত্রুটি',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/google-docs/documents/:id
 * @desc    ডকুমেন্ট মুছে ফেলে
 * @access  Private
 */
router.delete('/documents/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'ডকুমেন্ট খুঁজে পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ডকুমেন্ট মুছতে ত্রুটি',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/google-docs/extract-id
 * @desc    URL থেকে Document ID বের করে
 * @access  Public
 */
router.post('/extract-id', [
  body('url').isURL().withMessage('বৈধ URL প্রয়োজন')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ URL',
        errors: errors.array()
      });
    }

    const { url } = req.body;
    const documentId = googleDocsService.extractDocumentId(url);

    res.json({
      success: true,
      message: 'Document ID সফলভাবে বের করা হয়েছে',
      data: { documentId, originalUrl: url }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;