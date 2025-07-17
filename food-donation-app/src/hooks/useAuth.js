import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        setIsAuthenticated(true);
        toast.success('সফলভাবে লগইন হয়েছে');
        return { success: true, user };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.success) {
        toast.success('সফলভাবে রেজিস্ট্রেশন হয়েছে। এখন লগইন করুন।');
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Optional: Call logout endpoint
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      // Ignore logout endpoint errors
      console.log('Logout endpoint error (ignored):', error);
    }
    
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('সফলভাবে লগআউট হয়েছে');
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('প্রোফাইল আপডেট হয়েছে');
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে');
        return { success: true };
      }
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      
      if (response.data.success) {
        toast.success('পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে');
        return { success: true };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword
      });
      
      if (response.data.success) {
        toast.success('পাসওয়ার্ড রিসেট হয়েছে। এখন লগইন করুন।');
        return { success: true };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Email verification
  const verifyEmail = useCallback(async (token) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
      
      if (response.data.success) {
        toast.success('ইমেইল যাচাই সফল হয়েছে');
        await checkAuthStatus(); // Refresh user data
        return { success: true };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      const message = error.response?.data?.message || 'ইমেইল যাচাই করতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend verification email
  const resendVerificationEmail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/auth/resend-verification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('যাচাইকরণ ইমেইল পুনরায় পাঠানো হয়েছে');
        return { success: true };
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      const message = error.response?.data?.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete account
  const deleteAccount = useCallback(async (password) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/auth/delete-account`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: { password }
      });
      
      if (response.data.success) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('অ্যাকাউন্ট মুছে ফেলা হয়েছে');
        return { success: true };
      }
    } catch (error) {
      console.error('Delete account error:', error);
      const message = error.response?.data?.message || 'অ্যাকাউন্ট মুছতে সমস্যা হয়েছে';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Auth functions
    login,
    register,
    logout,
    
    // Profile functions
    updateProfile,
    changePassword,
    
    // Password reset
    forgotPassword,
    resetPassword,
    
    // Email verification
    verifyEmail,
    resendVerificationEmail,
    
    // Account management
    deleteAccount,
    
    // Utility
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};