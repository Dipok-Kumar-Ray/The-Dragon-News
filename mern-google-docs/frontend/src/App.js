import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DocumentReader from './pages/DocumentReader';
import DocumentList from './pages/DocumentList';
import GoogleAuth from './pages/GoogleAuth';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Hooks
import { useAuthStore } from './store/authStore';

// Styles
import './App.css';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // ৫ মিনিট
    },
  },
});

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App min-h-screen bg-base-200">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* পাবলিক রুটস */}
                <Route path="/" element={<Home />} />
                <Route path="/auth/google" element={<GoogleAuth />} />
                
                {/* প্রাইভেট রুটস */}
                {user ? (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/documents" element={<DocumentList />} />
                    <Route path="/documents/:id" element={<DocumentReader />} />
                    <Route path="/profile" element={<Profile />} />
                  </>
                ) : (
                  <Route path="/dashboard" element={<GoogleAuth />} />
                )}
                
                {/* ৪০৪ পেজ */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Footer />
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  fontFamily: 'SolaimanLipi, Arial, sans-serif'
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;