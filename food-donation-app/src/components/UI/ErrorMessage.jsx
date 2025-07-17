import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaRefresh } from 'react-icons/fa';

const ErrorMessage = ({ 
  message = 'কিছু সমস্যা হয়েছে', 
  onRetry = null, 
  onClose = null,
  type = 'error',
  className = '' 
}) => {
  const getAlertClass = () => {
    switch (type) {
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      default:
        return 'alert-error';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'error':
        return <FaExclamationTriangle className="text-xl" />;
      default:
        return <FaExclamationTriangle className="text-xl" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`alert ${getAlertClass()} ${className}`}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        
        <div className="flex gap-2">
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="btn btn-sm btn-outline"
            >
              <FaRefresh className="mr-1" />
              আবার চেষ্টা করুন
            </motion.button>
          )}
          
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="btn btn-sm btn-ghost"
            >
              <FaTimes />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Page Error Component
export const PageErrorMessage = ({ 
  title = 'পেইজ লোড করতে সমস্যা হয়েছে',
  message = 'দুঃখিত, এই পেইজটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
  onRetry = null,
  showHome = true 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-error text-6xl mb-4"
          >
            <FaExclamationTriangle className="mx-auto" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            {title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            {message}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 justify-center"
          >
            {onRetry && (
              <button onClick={onRetry} className="btn btn-primary">
                <FaRefresh className="mr-2" />
                আবার চেষ্টা করুন
              </button>
            )}
            
            {showHome && (
              <button 
                onClick={() => window.location.href = '/'}
                className="btn btn-outline"
              >
                হোম পেইজে যান
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Form Error Component
export const FormErrorMessage = ({ errors = [], className = '' }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`alert alert-error ${className}`}
    >
      <FaExclamationTriangle />
      <div>
        {errors.length === 1 ? (
          <p>{errors[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

// Network Error Component
export const NetworkErrorMessage = ({ onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="alert alert-warning"
    >
      <FaExclamationTriangle />
      <div>
        <h3 className="font-bold">ইন্টারনেট সংযোগের সমস্যা</h3>
        <div className="text-xs">আপনার ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm">
          <FaRefresh className="mr-1" />
          আবার চেষ্টা
        </button>
      )}
    </motion.div>
  );
};

// Empty State Component
export const EmptyStateMessage = ({ 
  title = 'কোনো তথ্য পাওয়া যায়নি',
  message = 'এখানে কোনো তথ্য নেই',
  icon = null,
  action = null,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl text-gray-300 mb-4"
        >
          {icon}
        </motion.div>
      )}
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-gray-600 mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-500 mb-4"
      >
        {message}
      </motion.p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ErrorMessage;