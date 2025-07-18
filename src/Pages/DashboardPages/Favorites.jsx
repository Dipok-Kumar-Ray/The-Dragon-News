import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../provider/AuthProvider';
import { FaHeart, FaMapMarkerAlt, FaEye, FaTrash, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router';

const Favorites = () => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = () => {
    setLoading(true);
    try {
      // Simulate loading favorites from localStorage
      const allFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
      const userFavorites = allFavorites.filter(fav => fav.userEmail === user?.email);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (donationId) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this item from your favorites?');
    
    if (confirmRemove) {
      try {
        // Remove from localStorage
        const allFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const updatedFavorites = allFavorites.filter(
          fav => !(fav.userEmail === user?.email && fav.donationId === donationId)
        );
        localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));

        // Update local state
        setFavorites(favorites.filter(fav => fav.donationId !== donationId));
        
        // Show success message
        alert('Item removed from favorites successfully!');
      } catch (error) {
        console.error('Error removing favorite:', error);
        alert('Error removing item from favorites. Please try again.');
      }
    }
  };

  const viewDonationDetails = (donationId) => {
    // Navigate to donation details page
    navigate(`/donation-details/${donationId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Available': { bg: 'bg-green-100', text: 'text-green-800' },
      'Reserved': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Claimed': { bg: 'bg-red-100', text: 'text-red-800' },
      'Expired': { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  // Sample data generator for demonstration
  const generateSampleFavorites = () => {
    const sampleFavorites = [
      {
        id: '1',
        userEmail: user?.email,
        donationId: 'don_001',
        title: 'Fresh Sandwiches & Salads',
        restaurantName: 'Green Garden Café',
        location: 'Downtown, City Center',
        status: 'Available',
        quantity: '15 portions',
        image: '/api/placeholder/300/200',
        addedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        description: 'Fresh sandwiches and healthy salads, perfect for lunch. Prepared this morning with organic ingredients.'
      },
      {
        id: '2',
        userEmail: user?.email,
        donationId: 'don_002',
        title: 'Pizza Slices',
        restaurantName: 'Tony\'s Pizzeria',
        location: 'Little Italy District',
        status: 'Reserved',
        quantity: '8 slices',
        image: '/api/placeholder/300/200',
        addedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        description: 'Delicious pizza slices with various toppings. Still fresh and ready to serve.'
      },
      {
        id: '3',
        userEmail: user?.email,
        donationId: 'don_003',
        title: 'Bakery Items',
        restaurantName: 'Sweet Dreams Bakery',
        location: 'Westside Mall',
        status: 'Available',
        quantity: '20 items',
        image: '/api/placeholder/300/200',
        addedDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        description: 'Mixed bakery items including croissants, muffins, and bread. Perfect for breakfast or snacks.'
      }
    ];

    // Save to localStorage if no favorites exist
    const existingFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    if (existingFavorites.length === 0) {
      localStorage.setItem('userFavorites', JSON.stringify(sampleFavorites));
      setFavorites(sampleFavorites);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your favorites...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-1">
              {favorites.length} saved donation{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
          {favorites.length === 0 && (
            <button
              onClick={generateSampleFavorites}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Sample Data
            </button>
          )}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6">
            Start exploring donations and save your favorites to see them here.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Donations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative">
                <img
                  src={favorite.image}
                  alt={favorite.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Rm9vZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(favorite.status)}
                </div>
                <div className="absolute top-3 left-3">
                  <FaHeart className="h-5 w-5 text-red-500" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {favorite.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{favorite.restaurantName}</span>
                    <span className="mx-2">•</span>
                    <span>{favorite.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Quantity:</span>
                    <span className="ml-2">{favorite.quantity}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="h-4 w-4 mr-2" />
                    <span>Added {new Date(favorite.addedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {favorite.description}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewDonationDetails(favorite.donationId)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FaEye className="h-4 w-4 mr-2" />
                    Details
                  </button>
                  <button
                    onClick={() => removeFavorite(favorite.donationId)}
                    className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing all {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;