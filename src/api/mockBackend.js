// Mock Backend API for User Dashboard
// This simulates a real backend using localStorage as database

const STORAGE_KEYS = {
  CHARITY_REQUESTS: 'charityRequests',
  USER_TRANSACTIONS: 'userTransactions',
  USER_FAVORITES: 'userFavorites',
  USER_REVIEWS: 'userReviews',
  DONATIONS: 'donations',
  USERS: 'users'
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getFromStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    console.error(`Error reading from ${key}:`, error);
    return [];
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to ${key}:`, error);
    return false;
  }
};

// Mock Database API
export const mockBackendAPI = {
  
  // User Management
  users: {
    async getUserProfile(email) {
      await delay(500); // Simulate network delay
      const users = getFromStorage(STORAGE_KEYS.USERS);
      return users.find(user => user.email === email) || null;
    },

    async updateUserProfile(email, profileData) {
      await delay(500);
      const users = getFromStorage(STORAGE_KEYS.USERS);
      const userIndex = users.findIndex(user => user.email === email);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        saveToStorage(STORAGE_KEYS.USERS, users);
        return users[userIndex];
      }
      return null;
    }
  },

  // Charity Role Requests
  charityRequests: {
    async create(requestData) {
      await delay(1000); // Simulate processing time
      const requests = getFromStorage(STORAGE_KEYS.CHARITY_REQUESTS);
      
      const newRequest = {
        id: Date.now().toString(),
        ...requestData,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      requests.push(newRequest);
      saveToStorage(STORAGE_KEYS.CHARITY_REQUESTS, requests);
      return newRequest;
    },

    async getByUser(userEmail) {
      await delay(300);
      const requests = getFromStorage(STORAGE_KEYS.CHARITY_REQUESTS);
      return requests.filter(request => request.userEmail === userEmail);
    },

    async getById(requestId) {
      await delay(300);
      const requests = getFromStorage(STORAGE_KEYS.CHARITY_REQUESTS);
      return requests.find(request => request.id === requestId);
    },

    async updateStatus(requestId, status, adminNotes = '') {
      await delay(500);
      const requests = getFromStorage(STORAGE_KEYS.CHARITY_REQUESTS);
      const requestIndex = requests.findIndex(request => request.id === requestId);
      
      if (requestIndex !== -1) {
        requests[requestIndex] = {
          ...requests[requestIndex],
          status,
          adminNotes,
          updatedAt: new Date().toISOString()
        };
        saveToStorage(STORAGE_KEYS.CHARITY_REQUESTS, requests);
        return requests[requestIndex];
      }
      return null;
    },

    async getAll() {
      await delay(300);
      return getFromStorage(STORAGE_KEYS.CHARITY_REQUESTS);
    }
  },

  // Transactions
  transactions: {
    async create(transactionData) {
      await delay(800);
      const transactions = getFromStorage(STORAGE_KEYS.USER_TRANSACTIONS);
      
      const newTransaction = {
        id: Date.now().toString(),
        ...transactionData,
        status: 'Completed',
        createdAt: new Date().toISOString()
      };
      
      transactions.push(newTransaction);
      saveToStorage(STORAGE_KEYS.USER_TRANSACTIONS, transactions);
      return newTransaction;
    },

    async getByUser(userEmail) {
      await delay(300);
      const transactions = getFromStorage(STORAGE_KEYS.USER_TRANSACTIONS);
      return transactions.filter(transaction => transaction.userEmail === userEmail);
    },

    async getById(transactionId) {
      await delay(300);
      const transactions = getFromStorage(STORAGE_KEYS.USER_TRANSACTIONS);
      return transactions.find(transaction => transaction.transactionId === transactionId);
    }
  },

  // Favorites
  favorites: {
    async add(userEmail, donationData) {
      await delay(500);
      const favorites = getFromStorage(STORAGE_KEYS.USER_FAVORITES);
      
      // Check if already exists
      const exists = favorites.some(fav => 
        fav.userEmail === userEmail && fav.donationId === donationData.donationId
      );
      
      if (exists) {
        throw new Error('Item already in favorites');
      }
      
      const newFavorite = {
        id: Date.now().toString(),
        userEmail,
        ...donationData,
        addedDate: new Date().toISOString()
      };
      
      favorites.push(newFavorite);
      saveToStorage(STORAGE_KEYS.USER_FAVORITES, favorites);
      return newFavorite;
    },

    async remove(userEmail, donationId) {
      await delay(500);
      const favorites = getFromStorage(STORAGE_KEYS.USER_FAVORITES);
      const filteredFavorites = favorites.filter(fav => 
        !(fav.userEmail === userEmail && fav.donationId === donationId)
      );
      
      saveToStorage(STORAGE_KEYS.USER_FAVORITES, filteredFavorites);
      return true;
    },

    async getByUser(userEmail) {
      await delay(300);
      const favorites = getFromStorage(STORAGE_KEYS.USER_FAVORITES);
      return favorites.filter(favorite => favorite.userEmail === userEmail);
    }
  },

  // Reviews
  reviews: {
    async create(reviewData) {
      await delay(800);
      const reviews = getFromStorage(STORAGE_KEYS.USER_REVIEWS);
      
      const newReview = {
        id: Date.now().toString(),
        ...reviewData,
        helpful: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      reviews.push(newReview);
      saveToStorage(STORAGE_KEYS.USER_REVIEWS, reviews);
      return newReview;
    },

    async getByUser(userEmail) {
      await delay(300);
      const reviews = getFromStorage(STORAGE_KEYS.USER_REVIEWS);
      return reviews.filter(review => review.userEmail === userEmail);
    },

    async getByDonation(donationId) {
      await delay(300);
      const reviews = getFromStorage(STORAGE_KEYS.USER_REVIEWS);
      return reviews.filter(review => review.donationId === donationId);
    },

    async update(reviewId, reviewData) {
      await delay(500);
      const reviews = getFromStorage(STORAGE_KEYS.USER_REVIEWS);
      const reviewIndex = reviews.findIndex(review => review.id === reviewId);
      
      if (reviewIndex !== -1) {
        reviews[reviewIndex] = {
          ...reviews[reviewIndex],
          ...reviewData,
          updatedAt: new Date().toISOString()
        };
        saveToStorage(STORAGE_KEYS.USER_REVIEWS, reviews);
        return reviews[reviewIndex];
      }
      return null;
    },

    async delete(reviewId) {
      await delay(500);
      const reviews = getFromStorage(STORAGE_KEYS.USER_REVIEWS);
      const filteredReviews = reviews.filter(review => review.id !== reviewId);
      saveToStorage(STORAGE_KEYS.USER_REVIEWS, filteredReviews);
      return true;
    }
  },

  // Stripe Payment Simulation
  stripe: {
    async processPayment(paymentData) {
      await delay(2000); // Simulate network delay
      
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        return {
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: paymentData.amount,
          currency: 'USD',
          paymentMethod: 'card',
          receiptUrl: `https://stripe.com/receipts/payment_${Date.now()}`
        };
      } else {
        return {
          success: false,
          error: 'Your card was declined. Please try a different payment method.',
          errorCode: 'card_declined'
        };
      }
    }
  },

  // Donations (for favorites and reviews)
  donations: {
    async getById(donationId) {
      await delay(300);
      // This would typically fetch from a real database
      // For now, return mock data
      return {
        id: donationId,
        title: 'Sample Donation',
        restaurantName: 'Sample Restaurant',
        location: 'Sample Location',
        status: 'Available',
        quantity: '10 portions',
        description: 'Sample donation description',
        image: '/api/placeholder/300/200'
      };
    },

    async getAll(filters = {}) {
      await delay(500);
      // Return mock donation data
      return [
        {
          id: 'don_001',
          title: 'Fresh Sandwiches & Salads',
          restaurantName: 'Green Garden Café',
          location: 'Downtown, City Center',
          status: 'Available',
          quantity: '15 portions',
          image: '/api/placeholder/300/200'
        },
        {
          id: 'don_002',
          title: 'Pizza Slices',
          restaurantName: 'Tony\'s Pizzeria',
          location: 'Little Italy District',
          status: 'Reserved',
          quantity: '8 slices',
          image: '/api/placeholder/300/200'
        }
      ];
    }
  },

  // Utility functions for data seeding
  utils: {
    clearAllData() {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    },

    seedSampleData(userEmail) {
      // This would seed sample data for testing
      const sampleData = {
        favorites: [
          {
            id: '1',
            userEmail,
            donationId: 'don_001',
            title: 'Fresh Sandwiches & Salads',
            restaurantName: 'Green Garden Café',
            location: 'Downtown, City Center',
            status: 'Available',
            quantity: '15 portions',
            image: '/api/placeholder/300/200',
            addedDate: new Date().toISOString()
          }
        ],
        reviews: [
          {
            id: '1',
            userEmail,
            donationId: 'don_001',
            donationTitle: 'Fresh Sandwiches & Salads',
            restaurantName: 'Green Garden Café',
            rating: 5,
            reviewText: 'Excellent quality food!',
            helpful: 12,
            createdAt: new Date().toISOString()
          }
        ]
      };

      saveToStorage(STORAGE_KEYS.USER_FAVORITES, sampleData.favorites);
      saveToStorage(STORAGE_KEYS.USER_REVIEWS, sampleData.reviews);
    }
  }
};

// Export individual modules for easier imports
export const {
  users,
  charityRequests,
  transactions,
  favorites,
  reviews,
  stripe,
  donations,
  utils
} = mockBackendAPI;

export default mockBackendAPI;