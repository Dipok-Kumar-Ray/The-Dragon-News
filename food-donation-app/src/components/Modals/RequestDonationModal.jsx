import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaUser, FaEnvelope, FaRestaurant, FaClock, FaClipboardList } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useDonations } from '../../hooks/useDonations';

const RequestDonationModal = ({ donation, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    requestDescription: '',
    pickupTime: '',
  });
  const [loading, setLoading] = useState(false);

  const { requestDonation } = useDonations();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.requestDescription.trim()) {
      toast.error('রিকুয়েস্টের বিবরণ দিন');
      return;
    }

    if (!formData.pickupTime) {
      toast.error('পিকআপের সময় নির্বাচন করুন');
      return;
    }

    // Check if pickup time is within allowed window
    const selectedTime = new Date(formData.pickupTime);
    const startTime = new Date(donation.pickupTimeStart);
    const endTime = new Date(donation.pickupTimeEnd);

    if (selectedTime < startTime || selectedTime > endTime) {
      toast.error('পিকআপের সময় নির্দিষ্ট সময়সীমার মধ্যে হতে হবে');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        donationId: donation._id,
        charityId: user._id,
        charityName: user.organizationName || user.name,
        charityEmail: user.email,
        requestDescription: formData.requestDescription,
        pickupTime: formData.pickupTime,
        status: 'pending'
      };

      await requestDonation(requestData);
      toast.success('ডোনেশন রিকুয়েস্ট পাঠানো হয়েছে');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Request error:', error);
      toast.error('রিকুয়েস্ট পাঠাতে সমস্যা হয়েছে');
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
            <FaClipboardList className="mr-3 text-primary" />
            ডোনেশন রিকুয়েস্ট
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
          {/* Donation Title (Readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ডোনেশনের শিরোনাম
            </label>
            <div className="input input-bordered bg-gray-50 flex items-center">
              <FaClipboardList className="mr-2 text-gray-400" />
              <span className="text-gray-600">{donation.title}</span>
            </div>
          </div>

          {/* Restaurant Name (Readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              রেস্তোরাঁর নাম
            </label>
            <div className="input input-bordered bg-gray-50 flex items-center">
              <FaRestaurant className="mr-2 text-gray-400" />
              <span className="text-gray-600">{donation.restaurantName}</span>
            </div>
          </div>

          {/* Charity Name (Readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              দাতব্য সংস্থার নাম
            </label>
            <div className="input input-bordered bg-gray-50 flex items-center">
              <FaUser className="mr-2 text-gray-400" />
              <span className="text-gray-600">
                {user.organizationName || user.name}
              </span>
            </div>
          </div>

          {/* Charity Email (Readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              দাতব্য সংস্থার ইমেইল
            </label>
            <div className="input input-bordered bg-gray-50 flex items-center">
              <FaEnvelope className="mr-2 text-gray-400" />
              <span className="text-gray-600">{user.email}</span>
            </div>
          </div>

          {/* Available Pickup Time Window */}
          <div className="bg-info bg-opacity-10 p-4 rounded-lg">
            <h4 className="font-medium text-info mb-2 flex items-center">
              <FaClock className="mr-2" />
              উপলব্ধ পিকআপ সময়
            </h4>
            <p className="text-sm text-gray-600">
              {new Date(donation.pickupTimeStart).toLocaleString('bn-BD')}
              <br />
              থেকে {new Date(donation.pickupTimeEnd).toLocaleString('bn-BD')}
            </p>
          </div>

          {/* Request Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              রিকুয়েস্টের বিবরণ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="requestDescription"
              value={formData.requestDescription}
              onChange={handleInputChange}
              className="textarea textarea-bordered w-full h-24"
              placeholder="আপনার সংস্থার পরিচয় এবং কেন এই ডোনেশনটি প্রয়োজন তা লিখুন..."
              required
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.requestDescription.length}/500 অক্ষর
            </div>
          </div>

          {/* Pickup Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পিকআপের সময় নির্বাচন করুন <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              min={new Date(donation.pickupTimeStart).toISOString().slice(0, 16)}
              max={new Date(donation.pickupTimeEnd).toISOString().slice(0, 16)}
              required
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              নির্দিষ্ট সময়সীমার মধ্যে একটি সময় নির্বাচন করুন
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-warning bg-opacity-10 p-4 rounded-lg">
            <h4 className="font-medium text-warning mb-2">গুরুত্বপূর্ণ তথ্য:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• রিকুয়েস্ট পাঠানোর পর রেস্তোরাঁর অনুমোদনের জন্য অপেক্ষা করতে হবে</li>
              <li>• অনুমোদিত হলে নির্দিষ্ট সময়ে পিকআপ করতে হবে</li>
              <li>• পিকআপের সময় আপনার সংস্থার পরিচয়পত্র সাথে রাখুন</li>
              <li>• খাবার সংগ্রহের পর "পিকআপ নিশ্চিত করুন" বাটনে ক্লিক করুন</li>
            </ul>
          </div>

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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  পাঠানো হচ্ছে...
                </>
              ) : (
                'রিকুয়েস্ট পাঠান'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RequestDonationModal;