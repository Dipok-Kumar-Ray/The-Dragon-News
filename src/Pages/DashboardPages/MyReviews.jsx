import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../provider/AuthProvider';
import { FaStar, FaMapMarkerAlt, FaTrash, FaClock, FaEdit } from 'react-icons/fa';

const MyReviews = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [user]);

  const loadReviews = () => {
    setLoading(true);
    try {
      // Simulate loading reviews from localStorage
      const allReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
      const userReviews = allReviews.filter(review => review.userEmail === user?.email);
      setReviews(userReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = (reviewId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this review? This action cannot be undone.');
    
    if (confirmDelete) {
      try {
        // Remove from localStorage
        const allReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
        const updatedReviews = allReviews.filter(review => review.id !== reviewId);
        localStorage.setItem('userReviews', JSON.stringify(updatedReviews));

        // Update local state
        setReviews(reviews.filter(review => review.id !== reviewId));
        
        // Show success message
        alert('Review deleted successfully!');
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review. Please try again.');
      }
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  // Sample data generator for demonstration
  const generateSampleReviews = () => {
    const sampleReviews = [
      {
        id: '1',
        userEmail: user?.email,
        userName: user?.displayName || user?.email,
        donationId: 'don_001',
        donationTitle: 'Fresh Sandwiches & Salads',
        restaurantName: 'Green Garden Café',
        rating: 5,
        reviewText: 'Excellent quality food! The sandwiches were fresh and the salads were crisp. The restaurant staff was very professional in handling the donation process. Would definitely recommend this place for future food donations.',
        reviewDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        helpful: 12
      },
      {
        id: '2',
        userEmail: user?.email,
        userName: user?.displayName || user?.email,
        donationId: 'don_002',
        donationTitle: 'Pizza Slices',
        restaurantName: 'Tony\'s Pizzeria',
        rating: 4,
        reviewText: 'Good quality pizza, still warm when picked up. The variety of toppings was great. Only minor issue was the timing - had to wait a bit longer than expected.',
        reviewDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        helpful: 8
      },
      {
        id: '3',
        userEmail: user?.email,
        userName: user?.displayName || user?.email,
        donationId: 'don_003',
        donationTitle: 'Bakery Items',
        restaurantName: 'Sweet Dreams Bakery',
        rating: 5,
        reviewText: 'Amazing bakery items! Everything was fresh and delicious. The variety was impressive - croissants, muffins, and artisanal bread. The bakery team was very generous with the portions.',
        reviewDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        helpful: 15
      },
      {
        id: '4',
        userEmail: user?.email,
        userName: user?.displayName || user?.email,
        donationId: 'don_004',
        donationTitle: 'Asian Cuisine Combo',
        restaurantName: 'Dragon Palace Restaurant',
        rating: 3,
        reviewText: 'The food was okay, but some items were a bit cold. The flavors were authentic though. The restaurant could improve on the packaging and temperature maintenance.',
        reviewDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        helpful: 5
      }
    ];

    // Save to localStorage if no reviews exist
    const existingReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    if (existingReviews.length === 0) {
      localStorage.setItem('userReviews', JSON.stringify(sampleReviews));
      setReviews(sampleReviews);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          {reviews.length === 0 && (
            <button
              onClick={generateSampleReviews}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Sample Data
            </button>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <FaStar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">
            Start reviewing donations you've received to help other users make informed decisions.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Donations
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {review.donationTitle}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaMapMarkerAlt className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{review.restaurantName}</span>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => alert('Edit functionality would be implemented here')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit review"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete review"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {review.reviewText}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <FaClock className="h-4 w-4 mr-2" />
                    <span>
                      Reviewed on {new Date(review.reviewDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 font-medium">
                      {review.helpful} people found this helpful
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-8">
          {/* Statistics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reviews.length}
                </div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {reviews.reduce((sum, review) => sum + review.helpful, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Helpful Votes</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Showing all {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;