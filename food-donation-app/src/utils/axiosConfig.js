import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for debugging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`Request to ${response.config.url} took ${duration}ms`);
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      const networkError = 'নেটওয়ার্ক সংযোগে সমস্যা। ইন্টারনেট সংযোগ পরীক্ষা করুন।';
      toast.error(networkError);
      return Promise.reject(new Error(networkError));
    }
    
    const { status, data } = error.response;
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Add failed request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        // No refresh token available, redirect to login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        // Attempt to refresh token
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken }
        );
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);
        
        // Process queued requests
        processQueue(null, accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        clearTokens();
        toast.error('সেশন শেষ হয়েছে। আবার লগইন করুন।');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle specific status codes
    switch (status) {
      case 400:
        const validationErrors = data.details || [];
        if (validationErrors.length > 0) {
          // Show first validation error
          toast.error(validationErrors[0].msg || data.error);
        } else {
          toast.error(data.error || 'অবৈধ তথ্য প্রদান করা হয়েছে।');
        }
        break;
        
      case 403:
        toast.error('এই কাজটি করার অনুমতি নেই।');
        break;
        
      case 404:
        toast.error('তথ্য খুঁজে পাওয়া যায়নি।');
        break;
        
      case 409:
        toast.error(data.error || 'ডেটা দ্বন্দ্ব।');
        break;
        
      case 429:
        toast.error('অনেক বেশি অনুরোধ। একটু পরে চেষ্টা করুন।');
        break;
        
      case 500:
        toast.error('সার্ভার ত্রুটি। পরে আবার চেষ্টা করুন।');
        break;
        
      case 502:
      case 503:
      case 504:
        toast.error('সার্ভার অস্থায়ীভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন।');
        break;
        
      default:
        toast.error(data.error || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।');
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { resetToken: token, newPassword: password }),
  
  // Donations
  getDonations: (params) => api.get('/donations', { params }),
  getDonationById: (id) => api.get(`/donations/${id}`),
  createDonation: (donationData) => api.post('/donations', donationData),
  updateDonation: (id, donationData) => api.put(`/donations/${id}`, donationData),
  deleteDonation: (id) => api.delete(`/donations/${id}`),
  addToFavorites: (id) => api.post(`/donations/${id}/favorite`),
  removeFromFavorites: (id) => api.delete(`/donations/${id}/favorite`),
  getFavorites: (params) => api.get('/donations/favorites', { params }),
  getTrendingDonations: (params) => api.get('/donations/trending', { params }),
  getNearbyDonations: (params) => api.get('/donations/nearby', { params }),
  getRestaurantDonations: (params) => api.get('/donations/restaurant', { params }),
  updateDonationStatus: (id, statusData) => api.patch(`/donations/${id}/status`, statusData),
  getDonationStatistics: (params) => api.get('/donations/statistics', { params }),
  
  // Users
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStatistics: () => api.get('/users/statistics'),
  toggleUserVerification: (id) => api.patch(`/users/${id}/verify`),
  toggleUserActiveStatus: (id) => api.patch(`/users/${id}/activate`),
  getNearbyRestaurants: (params) => api.get('/users/restaurants/nearby', { params }),
  getTopRatedRestaurants: (params) => api.get('/users/restaurants/top-rated', { params }),
  searchUsers: (params) => api.get('/users/search', { params }),
  
  // Requests
  getDonationRequests: (params) => api.get('/requests', { params }),
  createDonationRequest: (requestData) => api.post('/requests', requestData),
  updateRequestStatus: (id, statusData) => api.patch(`/requests/${id}/status`, statusData),
  getMyRequests: (params) => api.get('/requests/my-requests', { params }),
  getPendingRequests: (params) => api.get('/requests/pending', { params }),
  
  // Reviews
  getReviews: (params) => api.get('/reviews', { params }),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  addHelpfulVote: (id, helpful) => api.post(`/reviews/${id}/helpful`, { helpful }),
  flagReview: (id, flagData) => api.post(`/reviews/${id}/flag`, flagData),
  
  // File upload
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

// Export configured axios instance
export default api;