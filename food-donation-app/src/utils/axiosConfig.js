import axios from 'axios';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    // Return response data if successful
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Calculate request duration for failed requests
    if (config?.metadata?.startTime) {
      const endTime = new Date();
      const duration = endTime - config.metadata.startTime;
      console.error('❌ API Error:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        status: response?.status,
        duration: `${duration}ms`,
        error: response?.data || error.message,
      });
    }

    // Handle different error status codes
    if (response) {
      const { status, data } = response;

      switch (status) {
        case 400:
          // Bad Request
          handleBadRequest(data);
          break;

        case 401:
          // Unauthorized - Try to refresh token
          return handleUnauthorized(config, error);

        case 403:
          // Forbidden
          handleForbidden(data);
          break;

        case 404:
          // Not Found
          handleNotFound(data);
          break;

        case 409:
          // Conflict
          handleConflict(data);
          break;

        case 422:
          // Validation Error
          handleValidationError(data);
          break;

        case 429:
          // Too Many Requests
          handleTooManyRequests(data);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server Errors
          handleServerError(status, data);
          break;

        default:
          // Generic error handling
          handleGenericError(status, data);
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      handleTimeoutError();
    } else if (error.code === 'ERR_NETWORK') {
      // Network error
      handleNetworkError();
    } else {
      // Other errors
      handleGenericError(null, { message: error.message });
    }

    return Promise.reject(error);
  }
);

// Token refresh functionality
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const handleUnauthorized = async (originalConfig, error) => {
  // Avoid infinite loops
  if (originalConfig.url === '/auth/refresh' || originalConfig._retry) {
    // Redirect to login
    redirectToLogin();
    return Promise.reject(error);
  }

  if (isRefreshing) {
    // Queue the request
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then(() => {
        return axiosInstance(originalConfig);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  originalConfig._retry = true;
  isRefreshing = true;

  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    redirectToLogin();
    return Promise.reject(error);
  }

  try {
    // Attempt to refresh token
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken,
    });

    const { token: newToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens
    localStorage.setItem('token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    // Update authorization header
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    // Process queued requests
    processQueue(null, newToken);

    // Retry original request
    return axiosInstance(originalConfig);
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError);
    
    // Process queued requests with error
    processQueue(refreshError, null);
    
    // Clear tokens and redirect to login
    clearAuthData();
    redirectToLogin();
    
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

// Error handlers
const handleBadRequest = (data) => {
  const message = data?.message || 'অবৈধ তথ্য প্রদান করা হয়েছে';
  toast.error(message);
};

const handleForbidden = (data) => {
  const message = data?.message || 'এই কাজটি করার অনুমতি নেই';
  toast.error(message);
};

const handleNotFound = (data) => {
  const message = data?.message || 'তথ্য খুঁজে পাওয়া যায়নি';
  toast.error(message);
};

const handleConflict = (data) => {
  const message = data?.message || 'তথ্যের সংঘর্ষ হয়েছে';
  toast.error(message);
};

const handleValidationError = (data) => {
  if (data?.errors && Array.isArray(data.errors)) {
    // Show multiple validation errors
    data.errors.forEach((error) => {
      toast.error(error.message || error);
    });
  } else {
    const message = data?.message || 'তথ্য যাচাইকরণে সমস্যা হয়েছে';
    toast.error(message);
  }
};

const handleTooManyRequests = (data) => {
  const message = data?.message || 'অনেক বেশি অনুরোধ। একটু পরে চেষ্টা করুন';
  toast.error(message);
};

const handleServerError = (status, data) => {
  let message = 'সার্ভারে সমস্যা হয়েছে';
  
  switch (status) {
    case 500:
      message = 'অভ্যন্তরীণ সার্ভার ত্রুটি';
      break;
    case 502:
      message = 'খারাপ গেটওয়ে';
      break;
    case 503:
      message = 'সেবা অনুপলব্ধ';
      break;
    case 504:
      message = 'গেটওয়ে টাইমআউট';
      break;
  }

  if (data?.message) {
    message = data.message;
  }

  toast.error(message);
};

const handleTimeoutError = () => {
  toast.error('অনুরোধ টাইমআউট হয়েছে। আবার চেষ্টা করুন');
};

const handleNetworkError = () => {
  toast.error('ইন্টারনেট সংযোগ পরীক্ষা করুন');
};

const handleGenericError = (status, data) => {
  const message = data?.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে';
  toast.error(message);
};

// Utility functions
const redirectToLogin = () => {
  // Clear auth data
  clearAuthData();
  
  // Redirect to login page
  const currentPath = window.location.pathname;
  if (currentPath !== '/login') {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
};

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete axiosInstance.defaults.headers.common['Authorization'];
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Helper function to get current user token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls with retry logic
export const apiCall = async (config, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axiosInstance(config);
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Helper function for upload with progress
export const uploadWithProgress = (config, onProgress) => {
  return axiosInstance({
    ...config,
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress && onProgress(percentCompleted);
    },
  });
};

// Helper function for download with progress
export const downloadWithProgress = (url, filename, onProgress) => {
  return axiosInstance({
    method: 'GET',
    url,
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress && onProgress(percentCompleted);
    },
  }).then((response) => {
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });
};

// Request queue for offline support
let requestQueue = [];
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  // Process queued requests when back online
  processOfflineQueue();
});

window.addEventListener('offline', () => {
  isOnline = false;
});

const processOfflineQueue = async () => {
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    try {
      await axiosInstance(request.config);
      request.resolve();
    } catch (error) {
      request.reject(error);
    }
  }
};

// Enhanced axios instance with offline support
export const makeRequest = (config) => {
  if (!isOnline) {
    return new Promise((resolve, reject) => {
      requestQueue.push({ config, resolve, reject });
      toast.info('অফলাইন অবস্থায় অনুরোধটি সংরক্ষিত হয়েছে');
    });
  }
  
  return axiosInstance(config);
};

export default axiosInstance;