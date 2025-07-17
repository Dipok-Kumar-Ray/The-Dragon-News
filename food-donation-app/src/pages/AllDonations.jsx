import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaWeight,
  FaEye,
  FaHeart,
  FaRegHeart,
  FaRestaurant,
  FaHandHolding,
  FaBoxOpen,
  FaChevronDown,
  FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Custom Hooks
import { useAuth } from '../hooks/useAuth';
import { useDonations } from '../hooks/useDonations';
import { useFavorites } from '../hooks/useFavorites';

// Components
import DonationCard from '../components/Cards/DonationCard';
import SearchFilters from '../components/Filters/SearchFilters';
import SortOptions from '../components/Filters/SortOptions';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';
import Pagination from '../components/UI/Pagination';

const AllDonations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDonations } = useDonations();
  const { getFavorites } = useFavorites();

  // States
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(12);

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Load donations data
  useEffect(() => {
    loadDonations();
  }, [currentPage, searchQuery, locationFilter, statusFilter, sortBy, sortOrder]);

  // Load user favorites
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        limit,
        search: searchQuery,
        location: locationFilter,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder,
        verified: true, // Only show verified donations
        approved: true  // Only show admin-approved donations
      };

      const response = await getDonations(filters);
      
      setDonations(response.donations);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      setCurrentPage(response.currentPage);

    } catch (err) {
      console.error('Error loading donations:', err);
      setError('ডোনেশন তালিকা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesData = await getFavorites();
      setFavorites(favoritesData.favorites?.map(fav => fav.donation._id) || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle location filter
  const handleLocationFilter = (location) => {
    setLocationFilter(location);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to donation details
  const handleViewDetails = (donationId) => {
    navigate(`/donations/${donationId}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setStatusFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locations = donations.map(donation => donation.location);
    return [...new Set(locations)].filter(Boolean);
  }, [donations]);

  // Filter status options
  const statusOptions = [
    { value: 'all', label: 'সব স্ট্যাটাস', count: totalCount },
    { value: 'available', label: 'উপলব্ধ', icon: FaBoxOpen },
    { value: 'requested', label: 'রিকুয়েস্ট করা হয়েছে', icon: FaHandHolding },
    { value: 'picked_up', label: 'পিকআপ সম্পন্ন', icon: FaBoxOpen }
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'তারিখ অনুযায়ী', icon: FaCalendarAlt },
    { value: 'quantity', label: 'পরিমাণ অনুযায়ী', icon: FaWeight },
    { value: 'pickupTimeStart', label: 'পিকআপ সময় অনুযায়ী', icon: FaCalendarAlt },
    { value: 'restaurantName', label: 'রেস্তোরাঁর নাম অনুযায়ী', icon: FaRestaurant }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">লগইন করুন</h2>
          <p className="text-gray-600 mb-4">ডোনেশন দেখতে লগইন করা প্রয়োজন</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            লগইন করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                সকল খাদ্য দান
              </h1>
              <p className="text-gray-600">
                যাচাইকৃত এবং অনুমোদিত খাদ্য দান সমূহ
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4 mt-4 lg:mt-0">
              <div className="stat bg-primary text-primary-content rounded-lg">
                <div className="stat-value text-sm">{totalCount}</div>
                <div className="stat-title text-xs">মোট ডোনেশন</div>
              </div>
              <div className="stat bg-success text-success-content rounded-lg">
                <div className="stat-value text-sm">
                  {donations.filter(d => d.status === 'available').length}
                </div>
                <div className="stat-title text-xs">উপলব্ধ</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ডোনেশন খুঁজুন (নাম, রেস্তোরাঁ, খাবারের ধরন...)"
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-outline ${showFilters ? 'btn-active' : ''}`}
              >
                <FaFilter className="mr-2" />
                ফিল্টার
                <FaChevronDown className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline">
                  <FaSort className="mr-2" />
                  সাজান
                </label>
                <div className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  {sortOptions.map((option) => (
                    <div key={option.value} className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text flex items-center">
                          <option.icon className="mr-2" />
                          {option.label}
                        </span>
                        <input
                          type="radio"
                          name="sort"
                          className="radio radio-primary radio-sm"
                          checked={sortBy === option.value}
                          onChange={() => handleSort(option.value, sortOrder)}
                        />
                      </label>
                    </div>
                  ))}
                  <div className="divider my-2"></div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">ক্রমানুসার</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={sortOrder === 'asc'}
                        onChange={(e) => handleSort(sortBy, e.target.checked ? 'asc' : 'desc')}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
              >
                {/* Location Filter */}
                <div>
                  <label className="label">
                    <span className="label-text">অবস্থান অনুযায়ী</span>
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => handleLocationFilter(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="">সব অবস্থান</option>
                    {uniqueLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="label">
                    <span className="label-text">স্ট্যাটাস অনুযায়ী</span>
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost w-full"
                  >
                    ফিল্টার সাফ করুন
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        {loading ? (
          <LoadingSpinner text="ডোনেশন লোড হচ্ছে..." />
        ) : error ? (
          <ErrorMessage 
            message={error} 
            onRetry={loadDonations}
          />
        ) : donations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              কোনো ডোনেশন পাওয়া যায়নি
            </h3>
            <p className="text-gray-500 mb-4">
              আপনার অনুসন্ধানের জন্য কোনো ফলাফল নেই
            </p>
            <button onClick={clearFilters} className="btn btn-primary">
              সব ডোনেশন দেখুন
            </button>
          </motion.div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {totalCount} টি ডোনেশনের মধ্যে {donations.length} টি দেখানো হচ্ছে
              </p>
              
              {/* View Mode Toggle */}
              <div className="join">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`btn btn-sm join-item ${viewMode === 'grid' ? 'btn-active' : 'btn-outline'}`}
                >
                  গ্রিড
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`btn btn-sm join-item ${viewMode === 'list' ? 'btn-active' : 'btn-outline'}`}
                >
                  তালিকা
                </button>
              </div>
            </div>

            {/* Donations Grid/List */}
            <motion.div
              layout
              className={`grid gap-6 mb-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence>
                {donations.map((donation, index) => (
                  <motion.div
                    key={donation._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DonationCard
                      donation={donation}
                      isFavorite={favorites.includes(donation._id)}
                      onViewDetails={handleViewDetails}
                      onFavoriteToggle={loadFavorites}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalCount={totalCount}
                limit={limit}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllDonations;