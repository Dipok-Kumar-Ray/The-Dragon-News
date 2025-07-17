import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useDonations = () => {
  const queryClient = useQueryClient();

  // Get single donation by ID
  const getDonationById = useCallback(async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/donations/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.donation;
    } catch (error) {
      console.error('Error fetching donation:', error);
      throw new Error('ডোনেশনের তথ্য পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Request donation
  const requestDonation = useCallback(async (requestData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/donations/request`, 
        requestData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate donation queries to refresh data
      queryClient.invalidateQueries(['donation', requestData.donationId]);
      
      return response.data;
    } catch (error) {
      console.error('Error requesting donation:', error);
      const message = error.response?.data?.message || 'রিকুয়েস্ট পাঠাতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Update donation status
  const updateDonationStatus = useCallback(async (donationId, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/donations/${donationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate donation queries to refresh data
      queryClient.invalidateQueries(['donation', donationId]);
      
      return response.data;
    } catch (error) {
      console.error('Error updating donation status:', error);
      const message = error.response?.data?.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Get all donations with filters
  const getDonations = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_BASE_URL}/donations?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw new Error('ডোনেশন তালিকা পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Accept/Reject donation request (Restaurant only)
  const updateRequestStatus = useCallback(async (requestId, status, note = '') => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/donations/requests/${requestId}`,
        { status, note },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries(['donations']);
      
      return response.data;
    } catch (error) {
      console.error('Error updating request status:', error);
      const message = error.response?.data?.message || 'রিকুয়েস্ট আপডেট করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Get user's donation requests
  const getUserRequests = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/donations/my-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.requests;
    } catch (error) {
      console.error('Error fetching user requests:', error);
      throw new Error('আপনার রিকুয়েস্ট তালিকা পেতে সমস্যা হয়েছে');
    }
  }, []);

  // Create new donation (Restaurant only)
  const createDonation = useCallback(async (donationData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/donations`,
        donationData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate donations list
      queryClient.invalidateQueries(['donations']);
      
      return response.data;
    } catch (error) {
      console.error('Error creating donation:', error);
      const message = error.response?.data?.message || 'ডোনেশন তৈরি করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Update donation (Restaurant only)
  const updateDonation = useCallback(async (donationId, donationData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/donations/${donationId}`,
        donationData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries(['donation', donationId]);
      queryClient.invalidateQueries(['donations']);
      
      return response.data;
    } catch (error) {
      console.error('Error updating donation:', error);
      const message = error.response?.data?.message || 'ডোনেশন আপডেট করতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Delete donation (Restaurant only)
  const deleteDonation = useCallback(async (donationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/donations/${donationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Invalidate donations list
      queryClient.invalidateQueries(['donations']);
      
      return true;
    } catch (error) {
      console.error('Error deleting donation:', error);
      const message = error.response?.data?.message || 'ডোনেশন মুছতে সমস্যা হয়েছে';
      throw new Error(message);
    }
  }, [queryClient]);

  // Get donation statistics
  const getDonationStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/donations/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      throw new Error('পরিসংখ্যান পেতে সমস্যা হয়েছে');
    }
  }, []);

  return {
    // Main functions
    getDonationById,
    getDonations,
    createDonation,
    updateDonation,
    deleteDonation,
    
    // Request related
    requestDonation,
    updateRequestStatus,
    getUserRequests,
    
    // Status updates
    updateDonationStatus,
    
    // Statistics
    getDonationStats
  };
};

export { useDonations };