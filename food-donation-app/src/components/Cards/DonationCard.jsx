import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaRegHeart, 
  FaEye, 
  FaMapMarkerAlt, 
  FaClock, 
  FaWeight,
  FaRestaurant,
  FaHandHolding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Custom Hooks
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';

const DonationCard = ({ 
  donation, 
  isFavorite = false, 
  onViewDetails, 
  onFavoriteToggle,
  viewMode = 'grid' 
}) => {
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle favorite toggle
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('প্রিয় তালিকায় যোগ করতে লগইন করুন');
      return;
    }

    try {
      setFavoriteLoading(true);
      
      if (isFavorite) {
        await removeFromFavorites(donation._id);
        toast.success('প্রিয় তালিকা থেকে সরানো হয়েছে');
      } else {
        await addToFavorites(donation._id);
        toast.success('প্রিয় তালিকায় যোগ করা হয়েছে');
      }
      
      onFavoriteToggle && onFavoriteToggle();
    } catch (error) {
      toast.error('সমস্যা হয়েছে। আবার চেষ্টা করুন');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    onViewDetails(donation._id);
  };

  // Get status badge
  const getStatusBadge = () => {
    const statusConfig = {
      available: { 
        text: 'উপলব্ধ', 
        className: 'badge-success',
        icon: FaCheckCircle
      },
      requested: { 
        text: 'রিকুয়েস্ট করা হয়েছে', 
        className: 'badge-warning',
        icon: FaExclamationTriangle
      },
      accepted: { 
        text: 'গৃহীত', 
        className: 'badge-info',
        icon: FaHandHolding
      },
      picked_up: { 
        text: 'পিকআপ সম্পন্ন', 
        className: 'badge-primary',
        icon: FaCheckCircle
      },
      expired: { 
        text: 'মেয়াদ শেষ', 
        className: 'badge-error',
        icon: FaExclamationTriangle
      }
    };

    const config = statusConfig[donation.status] || statusConfig.available;
    const IconComponent = config.icon;

    return (
      <div className={`badge ${config.className} gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get pickup time status
  const getPickupTimeStatus = () => {
    const now = new Date();
    const startTime = new Date(donation.pickupTimeStart);
    const endTime = new Date(donation.pickupTimeEnd);

    if (now > endTime) {
      return { status: 'expired', text: 'মেয়াদ শেষ', className: 'text-error' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', text: 'পিকআপ সময় চলছে', className: 'text-success' };
    } else {
      return { status: 'upcoming', text: 'পিকআপ সময় আসছে', className: 'text-warning' };
    }
  };

  const timeStatus = getPickupTimeStatus();

  // Grid view layout
  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={handleViewDetails}
      >
        {/* Image */}
        <figure className="relative h-48 overflow-hidden">
          {donation.image && !imageError ? (
            <img
              src={donation.image}
              alt={donation.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <FaImage className="text-4xl text-gray-400" />
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-3 right-3">
            <button
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className={`btn btn-circle btn-sm ${
                isFavorite ? 'btn-primary' : 'btn-ghost bg-white/80'
              } ${favoriteLoading ? 'loading' : ''}`}
            >
              {!favoriteLoading && (
                isFavorite ? (
                  <FaHeart className="text-white" />
                ) : (
                  <FaRegHeart className="text-gray-600" />
                )
              )}
            </button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>
        </figure>

        {/* Card Body */}
        <div className="card-body p-4">
          {/* Title */}
          <h3 className="card-title text-lg font-bold text-gray-800 line-clamp-1">
            {donation.title}
          </h3>

          {/* Restaurant Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FaRestaurant className="text-primary" />
            <span className="font-medium">{donation.restaurantName}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FaMapMarkerAlt className="text-primary" />
            <span className="line-clamp-1">{donation.location}</span>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FaWeight className="text-primary" />
            <span>{donation.quantity}</span>
          </div>

          {/* Charity Assignment */}
          {donation.assignedCharity && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FaHandHolding className="text-success" />
              <span className="line-clamp-1">{donation.assignedCharity.name}</span>
            </div>
          )}

          {/* Pickup Time */}
          <div className="flex items-center gap-2 text-xs mb-3">
            <FaClock className="text-primary" />
            <div>
              <div className={`font-medium ${timeStatus.className}`}>
                {timeStatus.text}
              </div>
              <div className="text-gray-500">
                {formatDate(donation.pickupTimeStart)} - {formatDate(donation.pickupTimeEnd)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="btn btn-primary btn-sm"
            >
              <FaEye className="mr-1" />
              বিস্তারিত
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // List view layout
  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.99 }}
      className="card card-side bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={handleViewDetails}
    >
      {/* Image */}
      <figure className="w-32 h-24 flex-shrink-0 overflow-hidden">
        {donation.image && !imageError ? (
          <img
            src={donation.image}
            alt={donation.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <FaImage className="text-2xl text-gray-400" />
          </div>
        )}
      </figure>

      {/* Card Body */}
      <div className="card-body flex-1 p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Title and Status */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="card-title text-lg font-bold text-gray-800">
                {donation.title}
              </h3>
              {getStatusBadge()}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {/* Restaurant */}
              <div className="flex items-center gap-2 text-gray-600">
                <FaRestaurant className="text-primary" />
                <span className="font-medium">{donation.restaurantName}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-primary" />
                <span>{donation.location}</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2 text-gray-600">
                <FaWeight className="text-primary" />
                <span>{donation.quantity}</span>
              </div>

              {/* Pickup Time */}
              <div className="flex items-center gap-2 text-gray-600">
                <FaClock className="text-primary" />
                <span className={timeStatus.className}>
                  {timeStatus.text}
                </span>
              </div>
            </div>

            {/* Charity Assignment */}
            {donation.assignedCharity && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <FaHandHolding className="text-success" />
                <span>দায়িত্বপ্রাপ্ত: {donation.assignedCharity.name}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className={`btn btn-circle btn-sm ${
                isFavorite ? 'btn-primary' : 'btn-ghost'
              } ${favoriteLoading ? 'loading' : ''}`}
            >
              {!favoriteLoading && (
                isFavorite ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="btn btn-primary btn-sm"
            >
              <FaEye className="mr-1" />
              বিস্তারিত
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DonationCard;