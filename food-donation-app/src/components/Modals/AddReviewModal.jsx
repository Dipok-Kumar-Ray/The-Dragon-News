import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaStar, FaUser, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AddReviewModal = ({ donationId, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    description: '',
    reviewerName: user?.name || user?.organizationName || ''
  });
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle star rating
  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Handle star hover
  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  // Handle star mouse leave
  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reviewerName.trim()) {
      toast.error('আপনার নাম লিখুন');
      return;
    }

    if (formData.rating === 0) {
      toast.error('রেটিং দিন');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('রিভিউ লিখুন');
      return;
    }

    try {
      setLoading(true);

      const reviewData = {
        donationId,
        reviewerId: user._id,
        reviewerName: formData.reviewerName,
        reviewerType: user.role,
        rating: formData.rating,
        description: formData.description.trim()
      };

      await onSuccess(reviewData);

    } catch (error) {
      console.error('Review submission error:', error);
      toast.error('রিভিউ যোগ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get star display value
  const getStarValue = (starIndex) => {
    return hoveredStar > 0 ? hoveredStar : formData.rating;
  };

  // Get rating text
  const getRatingText = (rating) => {
    const ratingTexts = {
      1: 'খুবই খারাপ',
      2: 'খারাপ',
      3: 'মোটামুটি',
      4: 'ভালো',
      5: 'চমৎকার'
    };
    return ratingTexts[rating] || '';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaStar className="mr-3 text-primary" />
            রিভিউ যোগ করুন
          </h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reviewer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              আপনার নাম <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={handleInputChange}
                className="input input-bordered w-full pl-10"
                placeholder="আপনার নাম বা সংস্থার নাম"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              রেটিং দিন <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="text-2xl transition-colors duration-200 hover:scale-110 transform"
                  disabled={loading}
                >
                  <FaStar
                    className={`${
                      star <= getStarValue(star)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
              {(formData.rating > 0 || hoveredStar > 0) && (
                <span className="ml-3 text-sm font-medium text-gray-600">
                  {getRatingText(hoveredStar || formData.rating)}
                </span>
              )}
            </div>
            {formData.rating === 0 && (
              <p className="text-xs text-gray-500">
                ১ থেকে ৫ স্টার দিয়ে রেটিং করুন
              </p>
            )}
          </div>

          {/* Review Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              আপনার রিভিউ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaEdit className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full h-32 pl-10 pt-3"
                placeholder="এই ডোনেশন সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন..."
                required
                disabled={loading}
                maxLength={500}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>আপনার অভিজ্ঞতা বিস্তারিত লিখুন</span>
              <span>{formData.description.length}/500</span>
            </div>
          </div>

          {/* Review Guidelines */}
          <div className="bg-info bg-opacity-10 p-4 rounded-lg">
            <h4 className="font-medium text-info mb-2">রিভিউ গাইডলাইন:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• সৎ এবং গঠনমূলক মতামত দিন</li>
              <li>• খাবারের গুণমান, পরিমাণ এবং সেবা নিয়ে লিখুন</li>
              <li>• রেস্তোরাঁর সহযোগিতা সম্পর্কে মন্তব্য করুন</li>
              <li>• অন্যদের সাহায্য করার জন্য বিস্তারিত লিখুন</li>
              <li>• অশালীন বা আক্রমণাত্মক ভাষা ব্যবহার করবেন না</li>
            </ul>
          </div>

          {/* User Type Info */}
          <div className="bg-base-100 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <FaUser className="text-gray-400" />
              <span className="text-gray-600">
                আপনি একজন <span className="font-medium">
                  {user.role === 'charity' ? 'দাতব্য সংস্থার প্রতিনিধি' : 'ব্যবহারকারী'}
                </span> হিসেবে রিভিউ দিচ্ছেন
              </span>
            </div>
          </div>

          {/* Preview */}
          {formData.rating > 0 && formData.description.trim() && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">রিভিউ প্রিভিউ:</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-sm ${
                        star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{formData.reviewerName}</span>
              </div>
              <p className="text-sm text-gray-600">{formData.description}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || formData.rating === 0 || !formData.description.trim()}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  জমা দেওয়া হচ্ছে...
                </>
              ) : (
                'রিভিউ জমা দিন'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddReviewModal;