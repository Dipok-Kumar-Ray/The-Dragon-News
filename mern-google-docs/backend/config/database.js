const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-docs-reader', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🗄️  MongoDB সংযুক্ত হয়েছে: ${conn.connection.host}`);
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB সংযোগ ত্রুটি:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB সংযোগ বিচ্ছিন্ন হয়েছে');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB পুনরায় সংযুক্ত হয়েছে');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🛑 MongoDB সংযোগ বন্ধ করা হয়েছে');
        process.exit(0);
      } catch (error) {
        console.error('MongoDB সংযোগ বন্ধ করতে ত্রুটি:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('ডাটাবেস সংযোগ ত্রুটি:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;