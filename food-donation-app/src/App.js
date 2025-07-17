import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import layouts and components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ScrollToTop from './components/ui/ScrollToTop';

// Import pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import AllDonations from './pages/AllDonations';
import DonationDetails from './pages/DonationDetails';
import CreateDonation from './pages/CreateDonation';
import MyDonations from './pages/MyDonations';
import Favorites from './pages/Favorites';
import Dashboard from './pages/Dashboard';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import CharityDashboard from './pages/charity/CharityDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

// Import protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import hooks
import { useAuth } from './hooks/useAuth';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.response?.status === 401) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// App layout wrapper
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

// Main App component
function App() {
  useEffect(() => {
    // Add Bangla font to body
    document.body.style.fontFamily = "'Noto Sans Bengali', 'Inter', sans-serif";
    
    // Set initial theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && !localStorage.getItem('theme')) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={
                      <AppLayout>
                        <Home />
                      </AppLayout>
                    } />
                    
                    <Route path="/about" element={
                      <AppLayout>
                        <About />
                      </AppLayout>
                    } />
                    
                    <Route path="/contact" element={
                      <AppLayout>
                        <Contact />
                      </AppLayout>
                    } />
                    
                    <Route path="/privacy" element={
                      <AppLayout>
                        <PrivacyPolicy />
                      </AppLayout>
                    } />
                    
                    <Route path="/terms" element={
                      <AppLayout>
                        <TermsOfService />
                      </AppLayout>
                    } />

                    {/* Auth routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Public donation routes */}
                    <Route path="/donations" element={
                      <AppLayout>
                        <AllDonations />
                      </AppLayout>
                    } />
                    
                    <Route path="/donations/:id" element={
                      <AppLayout>
                        <DonationDetails />
                      </AppLayout>
                    } />

                    {/* Protected routes */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Profile />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    <Route path="/favorites" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Favorites />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Dashboard />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    {/* Restaurant routes */}
                    <Route path="/restaurant/dashboard" element={
                      <ProtectedRoute allowedRoles={['restaurant']}>
                        <AppLayout>
                          <RestaurantDashboard />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    <Route path="/restaurant/create-donation" element={
                      <ProtectedRoute allowedRoles={['restaurant']}>
                        <AppLayout>
                          <CreateDonation />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    <Route path="/restaurant/my-donations" element={
                      <ProtectedRoute allowedRoles={['restaurant']}>
                        <AppLayout>
                          <MyDonations />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    {/* Charity routes */}
                    <Route path="/charity/dashboard" element={
                      <ProtectedRoute allowedRoles={['charity']}>
                        <AppLayout>
                          <CharityDashboard />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    {/* Admin routes */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AppLayout>
                          <AdminDashboard />
                        </AppLayout>
                      </ProtectedRoute>
                    } />

                    {/* Catch all route */}
                    <Route path="/404" element={
                      <AppLayout>
                        <NotFound />
                      </AppLayout>
                    } />
                    
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </motion.div>

                {/* Global components */}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--toast-bg)',
                      color: 'var(--toast-color)',
                      fontSize: '14px',
                      fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif",
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
        
        {/* React Query Devtools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;