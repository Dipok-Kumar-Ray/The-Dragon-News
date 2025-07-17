import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = 'লোড হচ্ছে...', className = '' }) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Main Spinner */}
        <div className={`loading loading-spinner loading-primary ${sizeClasses[size]}`}></div>
        
        {/* Text */}
        {text && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-center"
          >
            {text}
          </motion.p>
        )}
        
        {/* Animated dots */}
        <motion.div 
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

// Page Loading Spinner
export const PageLoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="loading loading-spinner loading-primary loading-lg mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          খাদ্য দান অ্যাপ্লিকেশন
        </h2>
        <p className="text-gray-500">লোড হচ্ছে...</p>
      </motion.div>
    </div>
  );
};

// Button Loading Spinner
export const ButtonLoadingSpinner = ({ size = 'sm' }) => {
  const sizeClasses = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md'
  };

  return (
    <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
  );
};

// Inline Loading Spinner
export const InlineLoadingSpinner = ({ text = 'লোড হচ্ছে...', className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="loading loading-spinner loading-sm"></span>
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};

export default LoadingSpinner;