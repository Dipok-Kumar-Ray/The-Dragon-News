import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useFavorites = () => {
  const queryClient = useQueryClient();

  // Add to favorites
  const addToFavorites = useCallback(async (donationId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorites`,
        { donationId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate favorites queries
      queryClient.invalidateQueries(['favorites']);
      
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      const message = error.response?.data?.message || 'প্রিয় তালিকায় যোগ করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (donationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/favorites/${donationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Invalidate favorites queries
      queryClient.invalidateQueries(['favorites']);
      
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      const message = error.response?.data?.message || 'প্রিয় তালিকা থেকে সরাতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Check if donation is in favorites
  const checkIfFavorite = useCallback(async (donationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/check/${donationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }, []);

  // Get user's favorites
  const getFavorites = useCallback(async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new Error('প্রিয় তালিকা পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Get favorites count
  const getFavoritesCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.count;
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      return 0;
    }
  }, []);

  // Clear all favorites
  const clearAllFavorites = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE_URL}/favorites/clear-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Invalidate favorites queries
      queryClient.invalidateQueries(['favorites']);
      
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      const message = error.response?.data?.message || 'প্রিয় তালিকা সাফ করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  return {
    addToFavorites,
    removeFromFavorites,
    checkIfFavorite,
    getFavorites,
    getFavoritesCount,
    clearAllFavorites
  };
};

export { useFavorites };