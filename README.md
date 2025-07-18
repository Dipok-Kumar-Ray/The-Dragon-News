# 🍽️ Food Donation App - User Dashboard

A comprehensive **User Dashboard** system for a food donation platform where users can manage their profiles, apply for charity roles, track favorites, write reviews, and monitor transaction history.

## 🌟 Features

### 🔒 **User Dashboard** (User Role Only)
Accessible via the Dashboard route with the following sub-routes:

#### 👤 **My Profile**
- Display user name, email, and profile picture
- Show user role and account status
- Account creation date and last sign-in
- Activity statistics (favorites, reviews, transactions)

#### 🏥 **Request Charity Role**
- Form for requesting charity organization status
- User information (readonly from logged-in user)
- Organization details (name and mission statement)
- $25 payment processing via Stripe simulation
- Status tracking (Pending/Approved/Rejected)
- Prevents duplicate requests

#### ❤️ **Favorites**
- View all saved/favorite donations
- Donation cards with image, title, restaurant info
- Status indicators and quantity information
- Remove from favorites functionality
- Quick access to donation details

#### ⭐ **My Reviews**
- Display all user-submitted reviews
- Review cards with rating, date, and content
- Delete review functionality
- Review statistics and helpful votes
- Restaurant and donation information

#### 💳 **Transaction History**
- Complete payment history table
- Transaction ID, amount, date, and status
- Linked to charity role requests
- Filter by status (All, Pending, Approved, Rejected)
- Responsive design (table/card views)

## 🎯 **Live Demo**

1. **Clone and run the project**
2. **Register/Login** with any email
3. **Navigate to Dashboard** via the navbar link
4. **Test all features** using the sample data buttons

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd food-donation-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### First Time Setup
1. **Register** a new account or **login**
2. Click **"Dashboard"** in the navigation
3. Explore each section:
   - Start with **"My Profile"** to see your info
   - Try **"Request Charity Role"** to test payments
   - Use **"Add Sample Data"** buttons to populate sections
   - Test **favorites** and **reviews** functionality

## 🏗️ **Architecture**

### **Frontend Stack**
- **React 19** - Modern UI library
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **React Icons** - Icon components
- **DaisyUI** - Component library
- **Vite** - Fast build tool

### **Backend Simulation**
- **Mock API** (`src/api/mockBackend.js`) - Simulates real backend
- **LocalStorage** - Browser storage for data persistence
- **Firebase Auth** - User authentication

### **Project Structure**
```
src/
├── Pages/
│   ├── Dashboard.jsx                 # Main dashboard layout
│   └── DashboardPages/
│       ├── MyProfile.jsx            # User profile page
│       ├── RequestCharityRole.jsx   # Charity application
│       ├── Favorites.jsx            # Saved donations
│       ├── MyReviews.jsx           # User reviews
│       └── TransactionHistory.jsx   # Payment history
├── Components/                      # Reusable components
├── api/
│   └── mockBackend.js              # Simulated database API
├── provider/
│   └── AuthProvider.jsx            # Authentication context
└── Routes/
    └── Router.jsx                  # Route definitions
```

## 💾 **Data Management**

### **Storage System**
Uses **localStorage** to simulate a real database:

```javascript
// Data structures
charityRequests: []     // User charity applications
userTransactions: []    // Payment history
userFavorites: []       // Saved donations
userReviews: []         // User reviews
```

### **API Simulation**
Mock backend API with realistic delays and responses:
- `mockBackendAPI.charityRequests` - Charity role management
- `mockBackendAPI.transactions` - Payment processing
- `mockBackendAPI.favorites` - Favorites management
- `mockBackendAPI.reviews` - Review system
- `mockBackendAPI.stripe` - Payment simulation

## 🎨 **UI/UX Features**

### **Design System**
- **Responsive Design** - Works on all screen sizes
- **Modern Interface** - Clean, professional appearance
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages
- **Interactive Elements** - Hover effects and transitions

### **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Focus indicators

## 🔐 **Security & Authentication**

### **Access Control**
- **Private Routes** - Dashboard requires authentication
- **User Data Isolation** - Users only see their own data
- **Role-based Features** - Different capabilities per role

### **Payment Security**
- **Stripe Simulation** - Realistic payment flow
- **Input Validation** - Prevents invalid submissions
- **Transaction Tracking** - Complete audit trail

## 📱 **Testing Guide**

### **Testing Each Feature**

#### **1. Profile Management**
```bash
1. Login to the application
2. Navigate to /dashboard/profile
3. Verify user information display
4. Check activity statistics
```

#### **2. Charity Role Request**
```bash
1. Go to /dashboard/request-charity
2. Fill form: Organization = "Test Charity", Mission = "Help people"
3. Click "Pay $25 & Submit Application"
4. Wait for payment simulation (2 seconds)
5. Verify success message and data storage
```

#### **3. Favorites System**
```bash
1. Visit /dashboard/favorites
2. Click "Add Sample Data" if empty
3. Test "Remove" functionality
4. Verify real-time updates
```

#### **4. Review Management**
```bash
1. Go to /dashboard/reviews
2. Add sample data if needed
3. Test delete functionality
4. Check statistics updates
```

#### **5. Transaction History**
```bash
1. Complete a charity request first
2. Visit /dashboard/transactions
3. Test filter tabs (All, Pending, Approved, etc.)
4. Verify responsive table/card views
```

## 🗄️ **Database Schema**

### **Key Tables** (Simulated)
```sql
-- Users
users: { id, email, display_name, role, created_at }

-- Charity Requests
charity_requests: { id, user_email, organization_name, 
                   mission_statement, amount, status, transaction_id }

-- Transactions
transactions: { id, user_email, transaction_id, amount, 
               purpose, status, date }

-- Favorites
user_favorites: { id, user_email, donation_id, added_date }

-- Reviews
user_reviews: { id, user_email, donation_id, rating, 
               review_text, helpful_count, date }
```

See [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) for complete schema documentation.

## 📚 **Documentation**

### **Available Guides**
- [`docs/BEGINNER_GUIDE.md`](docs/BEGINNER_GUIDE.md) - Comprehensive beginner tutorial
- [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) - Complete database documentation

### **Learning Path**
1. **Start with Beginner Guide** - Understand concepts and features
2. **Review Database Schema** - Learn data relationships
3. **Explore Code** - Study component structure
4. **Test Features** - Hands-on experience
5. **Customize** - Make your own modifications

## 🔄 **Development Workflow**

### **Adding New Features**
```bash
1. Create component in appropriate directory
2. Add routing in src/Routes/Router.jsx
3. Update navigation if needed
4. Add mock API endpoints
5. Test functionality
```

### **Modifying Existing Features**
```bash
1. Locate component in src/Pages/DashboardPages/
2. Update component logic
3. Modify mock API if needed
4. Test changes thoroughly
```

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

### **Deploy Options**
- **Vercel** - Automatic deployments
- **Netlify** - Static site hosting
- **GitHub Pages** - Free hosting
- **Firebase Hosting** - Google's platform

## 🔮 **Future Enhancements**

### **Phase 1: Core Improvements**
- [ ] Real backend API integration
- [ ] Proper database (PostgreSQL)
- [ ] Email notifications
- [ ] Advanced error handling
- [ ] Real Stripe integration

### **Phase 2: Advanced Features**
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Mobile app version
- [ ] Admin dashboard
- [ ] Restaurant management

### **Phase 3: Scale & Analytics**
- [ ] Multi-city support
- [ ] Analytics dashboard
- [ ] API for third parties
- [ ] Performance optimization
- [ ] Advanced security features

## 🤝 **Contributing**

### **How to Contribute**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Contribution Guidelines**
- Follow existing code style
- Add comments for complex logic
- Test all functionality
- Update documentation
- Keep commits focused and descriptive

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 🆘 **Support**

### **Common Issues**
- **Dashboard not loading**: Check authentication status
- **Payment failures**: Normal in demo (90% success rate)
- **Data disappearing**: Don't clear browser storage
- **Routing errors**: Verify React Router setup

### **Getting Help**
1. Check the **Beginner Guide** for detailed explanations
2. Review **Database Schema** for data structure understanding
3. Open an issue for bugs or feature requests
4. Join React community forums for general help

## 🏆 **Acknowledgments**

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first approach
- **Vite** - For lightning-fast development
- **Firebase** - For authentication services
- **Stripe** - For payment processing inspiration

---

### 📞 **Contact**

For questions, suggestions, or collaboration opportunities, please reach out through:
- GitHub Issues
- Project Discussions
- Email (if provided)

**Happy coding! 🚀**
