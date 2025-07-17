const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const googleDocsRoutes = require('./routes/googleDocs');
const authRoutes = require('./routes/auth');
const connectDB = require('./config/database');

const app = express();

// Database সংযোগ
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 100, // প্রতি IP এর জন্য সর্বোচ্চ ১০০ রিকুয়েস্ট
  message: {
    error: 'অনেক বেশি রিকুয়েস্ট পাঠানো হয়েছে। দয়া করে ১৫ মিনিট পর আবার চেষ্টা করুন।'
  }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/google-docs', googleDocsRoutes);

// স্বাস্থ্য পরীক্ষার জন্য endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'সার্ভার সফলভাবে চালু আছে',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Error Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'অনুরোধকৃত পথ খুঁজে পাওয়া যায়নি'
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('সার্ভার ত্রুটি:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'অভ্যন্তরীণ সার্ভার ত্রুটি',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 সার্ভার চালু হয়েছে পোর্ট ${PORT} এ`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
});