import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useReviews = () => {
  const queryClient = useQueryClient();

  // Get reviews for a specific donation
  const getReviewsByDonation = useCallback(async (donationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/donation/${donationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('রিভিউ পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Add review for a donation
  const addReview = useCallback(async (donationId, reviewData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          donationId,
          ...reviewData
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate reviews queries
      queryClient.invalidateQueries(['reviews', donationId]);
      
      return response.data.review;
    } catch (error) {
      console.error('Error adding review:', error);
      const message = error.response?.data?.message || 'রিভিউ যোগ করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Update review
  const updateReview = useCallback(async (reviewId, reviewData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reviews/${reviewId}`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate reviews queries
      queryClient.invalidateQueries(['reviews']);
      
      return response.data.review;
    } catch (error) {
      console.error('Error updating review:', error);
      const message = error.response?.data?.message || 'রিভিউ আপডেট করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Delete review
  const deleteReview = useCallback(async (reviewId) => {
    try {
      await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Invalidate reviews queries
      queryClient.invalidateQueries(['reviews']);
      
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      const message = error.response?.data?.message || 'রিভিউ মুছতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Get user's reviews
  const getUserReviews = useCallback(async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reviews/my-reviews?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('আপনার রিভিউ পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Get review statistics for a donation
  const getReviewStats = useCallback(async (donationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/stats/${donationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw new Error('রিভিউ পরিসংখ্যান পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Check if user has already reviewed a donation
  const checkUserReview = useCallback(async (donationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/check/${donationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking user review:', error);
      return { hasReviewed: false, review: null };
    }
  }, []);

  // Get all reviews with filters
  const getAllReviews = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_BASE_URL}/reviews?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw new Error('সকল রিভিউ পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Like/Unlike review
  const toggleReviewLike = useCallback(async (reviewId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews/${reviewId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Invalidate reviews queries
      queryClient.invalidateQueries(['reviews']);
      
      return response.data;
    } catch (error) {
      console.error('Error toggling review like:', error);
      const message = error.response?.data?.message || 'লাইক করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Report review
  const reportReview = useCallback(async (reviewId, reason) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews/${reviewId}/report`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error reporting review:', error);
      const message = error.response?.data?.message || 'রিপোর্ট করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, []);

  return {
    // Main review functions
    getReviewsByDonation,
    addReview,
    updateReview,
    deleteReview,
    
    // User reviews
    getUserReviews,
    checkUserReview,
    
    // Review analytics
    getReviewStats,
    getAllReviews,
    
    // Review interactions
    toggleReviewLike,
    reportReview
  };
};

export { useReviews };