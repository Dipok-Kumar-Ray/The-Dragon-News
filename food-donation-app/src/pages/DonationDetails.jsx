import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaRegHeart, 
  FaMapMarkerAlt, 
  FaClock, 
  FaRestaurant,
  FaStar,
  FaUser,
  FaCalendarAlt,
  FaClipboardList,
  FaCheckCircle,
  FaTruck,
  FaEdit
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Custom Hooks
import { useAuth } from '../hooks/useAuth';
import { useDonations } from '../hooks/useDonations';
import { useFavorites } from '../hooks/useFavorites';
import { useReviews } from '../hooks/useReviews';

// Components
import RequestDonationModal from '../components/Modals/RequestDonationModal';
import AddReviewModal from '../components/Modals/AddReviewModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userRequest, setUserRequest] = useState(null);

  // Custom hooks
  const { getDonationById, updateDonationStatus } = useDonations();
  const { addToFavorites, removeFromFavorites, checkIfFavorite } = useFavorites();
  const { getReviewsByDonation, addReview } = useReviews();

  // Load donation data
  useEffect(() => {
    loadDonationData();
  }, [id]);

  const loadDonationData = async () => {
    try {
      setLoading(true);
      
      // Donation details পাওয়া
      const donationData = await getDonationById(id);
      setDonation(donationData);

      // Favorite status চেক করা
      if (user) {
        const favoriteStatus = await checkIfFavorite(id);
        setIsFavorite(favoriteStatus);
      }

      // Reviews পাওয়া
      const reviewsData = await getReviewsByDonation(id);
      setReviews(reviewsData);

      // User এর request আছে কিনা চেক করা
      if (user && user.role === 'charity') {
        const request = donationData.requests?.find(
          req => req.charityId === user._id
        );
        setUserRequest(request);
      }

    } catch (err) {
      setError('ডোনেশনের তথ্য লোড করতে সমস্যা হয়েছে');
      console.error('Error loading donation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const handleAddToFavorites = async () => {
    if (!user) {
      toast.error('প্রিয় তালিকায় যোগ করতে লগইন করুন');
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        toast.success('প্রিয় তালিকা থেকে সরানো হয়েছে');
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        toast.success('প্রিয় তালিকায় যোগ করা হয়েছে');
      }
    } catch (error) {
      toast.error('সমস্যা হয়েছে। আবার চেষ্টা করুন');
    }
  };

  // Request donation
  const handleRequestDonation = () => {
    if (!user || user.role !== 'charity') {
      toast.error('শুধুমাত্র দাতব্য সংস্থা ডোনেশন রিকুয়েস্ট করতে পারে');
      return;
    }
    setShowRequestModal(true);
  };

  // Confirm pickup
  const handleConfirmPickup = async () => {
    try {
      await updateDonationStatus(id, 'picked_up');
      setDonation(prev => ({ ...prev, status: 'picked_up' }));
      toast.success('পিকআপ নিশ্চিত করা হয়েছে');
    } catch (error) {
      toast.error('পিকআপ নিশ্চিত করতে সমস্যা হয়েছে');
    }
  };

  // Add review
  const handleAddReview = async (reviewData) => {
    try {
      const newReview = await addReview(id, reviewData);
      setReviews(prev => [newReview, ...prev]);
      setShowReviewModal(false);
      toast.success('রিভিউ যোগ করা হয়েছে');
    } catch (error) {
      toast.error('রিভিউ যোগ করতে সমস্যা হয়েছে');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { 
        text: 'উপলব্ধ', 
        className: 'badge-success' 
      },
      requested: { 
        text: 'রিকুয়েস্ট করা হয়েছে', 
        className: 'badge-warning' 
      },
      accepted: { 
        text: 'গৃহীত', 
        className: 'badge-info' 
      },
      picked_up: { 
        text: 'পিকআপ সম্পন্ন', 
        className: 'badge-primary' 
      },
      expired: { 
        text: 'মেয়াদ শেষ', 
        className: 'badge-error' 
      }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <div className={`badge ${config.className} badge-lg`}>
        {config.text}
      </div>
    );
  };

  // Render star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!donation) return <ErrorMessage message="ডোনেশন খুঁজে পাওয়া যায়নি" />;

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {donation.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                {getStatusBadge(donation.status)}
                <div className="flex items-center text-gray-600">
                  <FaRestaurant className="mr-2" />
                  <span>{donation.restaurantName}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 lg:mt-0">
              {/* Favorites Button */}
              <button
                onClick={handleAddToFavorites}
                className={`btn btn-outline ${
                  isFavorite ? 'btn-primary' : 'btn-secondary'
                }`}
                disabled={!user}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
                <span className="ml-2">
                  {isFavorite ? 'প্রিয় তালিকায় আছে' : 'প্রিয় তালিকায় যোগ করুন'}
                </span>
              </button>

              {/* Request Button - Charity Only */}
              {user && user.role === 'charity' && donation.status === 'available' && !userRequest && (
                <button
                  onClick={handleRequestDonation}
                  className="btn btn-primary"
                >
                  <FaClipboardList className="mr-2" />
                  ডোনেশন রিকুয়েস্ট করুন
                </button>
              )}

              {/* Confirm Pickup Button - Charity Only */}
              {user && user.role === 'charity' && userRequest?.status === 'accepted' && (
                <button
                  onClick={handleConfirmPickup}
                  className="btn btn-success"
                >
                  <FaCheckCircle className="mr-2" />
                  পিকআপ নিশ্চিত করুন
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaClipboardList className="mr-3 text-primary" />
                বিবরণ
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">খাবারের ধরন:</h3>
                  <p className="text-gray-600">{donation.foodType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">পরিমাণ:</h3>
                  <p className="text-gray-600">{donation.quantity}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">বিস্তারিত:</h3>
                  <p className="text-gray-600">{donation.description}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">পিকআপ নির্দেশনা:</h3>
                  <p className="text-gray-600">{donation.pickupInstructions}</p>
                </div>
              </div>
            </motion.div>

            {/* Location & Time Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-3 text-primary" />
                অবস্থান ও সময়
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FaRestaurant className="mr-2" />
                    রেস্তোরাঁর তথ্য
                  </h3>
                  <p className="text-gray-600 mb-1">{donation.restaurantName}</p>
                  <p className="text-gray-500 text-sm">{donation.location}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FaClock className="mr-2" />
                    পিকআপের সময়
                  </h3>
                  <p className="text-gray-600">
                    {new Date(donation.pickupTimeStart).toLocaleString('bn-BD')}
                  </p>
                  <p className="text-gray-600">
                    থেকে {new Date(donation.pickupTimeEnd).toLocaleString('bn-BD')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Request Status Card - For Charity */}
            {user && user.role === 'charity' && userRequest && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaTruck className="mr-3 text-primary" />
                  আপনার রিকুয়েস্টের অবস্থা
                </h2>
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">অবস্থা:</span>
                    {getStatusBadge(userRequest.status)}
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">রিকুয়েস্টের সময়:</span> {new Date(userRequest.requestedAt).toLocaleString('bn-BD')}</p>
                    <p><span className="font-medium">পিকআপের সময়:</span> {new Date(userRequest.pickupTime).toLocaleString('bn-BD')}</p>
                    {userRequest.description && (
                      <p><span className="font-medium">বিবরণ:</span> {userRequest.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaStar className="mr-3 text-primary" />
                  রিভিউসমূহ ({reviews.length})
                </h2>
                {user && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn btn-sm btn-outline btn-primary"
                  >
                    <FaEdit className="mr-2" />
                    রিভিউ যোগ করুন
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaStar className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>এখনো কোনো রিভিউ নেই</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-base-100 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                              <FaUser />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">{review.reviewerName}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                        </div>
                        {renderStarRating(review.rating)}
                      </div>
                      <p className="text-gray-600">{review.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">দ্রুত তথ্য</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">পোস্ট করেছেন:</span>
                  <span className="font-medium">{donation.postedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">পোস্টের সময়:</span>
                  <span className="font-medium">
                    {new Date(donation.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">সর্বশেষ আপডেট:</span>
                  <span className="font-medium">
                    {new Date(donation.updatedAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">রিভিউ:</span>
                  <span className="font-medium">{reviews.length} টি</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Card */}
            {donation.contactInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-4">যোগাযোগের তথ্য</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">ফোন: {donation.contactInfo.phone}</p>
                  <p className="text-gray-600">ইমেইল: {donation.contactInfo.email}</p>
                </div>
              </motion.div>
            )}

            {/* Action Guide Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-primary bg-opacity-10 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-primary">
                কিভাবে রিকুয়েস্ট করবেন?
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>আপনার দাতব্য সংস্থার অ্যাকাউন্ট দিয়ে লগইন করুন</li>
                <li>"ডোনেশন রিকুয়েস্ট করুন" বাটনে ক্লিক করুন</li>
                <li>প্রয়োজনীয় তথ্য পূরণ করুন</li>
                <li>রেস্তোরাঁর অনুমোদনের জন্য অপেক্ষা করুন</li>
                <li>অনুমোদনের পর নির্দিষ্ট সময়ে পিকআপ করুন</li>
              </ol>
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        {showRequestModal && (
          <RequestDonationModal
            donation={donation}
            user={user}
            onClose={() => setShowRequestModal(false)}
            onSuccess={loadDonationData}
          />
        )}

        {showReviewModal && (
          <AddReviewModal
            donationId={id}
            user={user}
            onClose={() => setShowReviewModal(false)}
            onSuccess={handleAddReview}
          />
        )}
      </div>
    </div>
  );
};

export default DonationDetails;