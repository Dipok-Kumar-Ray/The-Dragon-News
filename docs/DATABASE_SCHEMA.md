# Database Schema Documentation

This document outlines the database schema for the User Dashboard system. The system manages users, charity role requests, transactions, favorites, reviews, and donations.

## Tables Overview

### 1. Users Table
Stores user account information and authentication details.

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  photo_url TEXT,
  role ENUM('User', 'Charity', 'Admin') DEFAULT 'User',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_sign_in TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

**Sample Data:**
```json
{
  "id": "user_123456789",
  "email": "user@example.com",
  "display_name": "John Doe",
  "photo_url": "https://example.com/photo.jpg",
  "role": "User",
  "email_verified": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "last_sign_in": "2024-01-20T14:25:00Z"
}
```

### 2. Charity Requests Table
Stores applications for charity role with payment information.

```sql
CREATE TABLE charity_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  mission_statement TEXT NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  admin_notes TEXT,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
  INDEX idx_user_email (user_email),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id)
);
```

**Sample Data:**
```json
{
  "id": "req_123456789",
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "organization_name": "Food for All Foundation",
  "mission_statement": "Our mission is to reduce food waste and help those in need...",
  "transaction_id": "txn_1701234567_abc123",
  "amount": 25.00,
  "status": "Pending",
  "admin_notes": null,
  "request_date": "2024-01-15T10:30:00Z",
  "processed_date": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 3. Transactions Table
Stores payment transaction history.

```sql
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  purpose VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  receipt_url TEXT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
  INDEX idx_user_email (user_email),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status),
  INDEX idx_transaction_date (transaction_date)
);
```

**Sample Data:**
```json
{
  "id": "txn_123456789",
  "user_email": "user@example.com",
  "transaction_id": "txn_1701234567_abc123",
  "amount": 25.00,
  "currency": "USD",
  "purpose": "Charity Role Request",
  "status": "Completed",
  "payment_method": "card",
  "stripe_payment_intent_id": "pi_1234567890",
  "receipt_url": "https://stripe.com/receipts/payment_123",
  "transaction_date": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 4. Donations Table
Stores information about available food donations.

```sql
CREATE TABLE donations (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  restaurant_name VARCHAR(255) NOT NULL,
  restaurant_location VARCHAR(255) NOT NULL,
  quantity VARCHAR(100) NOT NULL,
  status ENUM('Available', 'Reserved', 'Claimed', 'Expired') DEFAULT 'Available',
  image_url TEXT,
  pickup_time_start TIMESTAMP,
  pickup_time_end TIMESTAMP,
  expiry_date TIMESTAMP,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_restaurant_name (restaurant_name),
  INDEX idx_created_by (created_by),
  INDEX idx_pickup_time (pickup_time_start),
  INDEX idx_expiry_date (expiry_date)
);
```

**Sample Data:**
```json
{
  "id": "don_123456789",
  "title": "Fresh Sandwiches & Salads",
  "description": "Fresh sandwiches and healthy salads, perfect for lunch...",
  "restaurant_name": "Green Garden Café",
  "restaurant_location": "Downtown, City Center",
  "quantity": "15 portions",
  "status": "Available",
  "image_url": "https://example.com/food-image.jpg",
  "pickup_time_start": "2024-01-15T18:00:00Z",
  "pickup_time_end": "2024-01-15T20:00:00Z",
  "expiry_date": "2024-01-16T08:00:00Z",
  "created_by": "restaurant@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 5. User Favorites Table
Stores user's saved/favorite donations.

```sql
CREATE TABLE user_favorites (
  id VARCHAR(36) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  donation_id VARCHAR(36) NOT NULL,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_donation (user_email, donation_id),
  INDEX idx_user_email (user_email),
  INDEX idx_donation_id (donation_id)
);
```

**Sample Data:**
```json
{
  "id": "fav_123456789",
  "user_email": "user@example.com",
  "donation_id": "don_123456789",
  "added_date": "2024-01-15T10:30:00Z"
}
```

### 6. User Reviews Table
Stores user reviews for donations.

```sql
CREATE TABLE user_reviews (
  id VARCHAR(36) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  donation_id VARCHAR(36) NOT NULL,
  donation_title VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  INDEX idx_user_email (user_email),
  INDEX idx_donation_id (donation_id),
  INDEX idx_rating (rating),
  INDEX idx_review_date (review_date)
);
```

**Sample Data:**
```json
{
  "id": "rev_123456789",
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "donation_id": "don_123456789",
  "donation_title": "Fresh Sandwiches & Salads",
  "restaurant_name": "Green Garden Café",
  "rating": 5,
  "review_text": "Excellent quality food! The sandwiches were fresh...",
  "helpful_count": 12,
  "review_date": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Relationships

```
users (1) -----> (M) charity_requests
users (1) -----> (M) transactions
users (1) -----> (M) user_favorites
users (1) -----> (M) user_reviews

donations (1) -----> (M) user_favorites
donations (1) -----> (M) user_reviews

charity_requests (1) -----> (1) transactions (via transaction_id)
```

## Indexes

### Performance Indexes
- `users.email` - for authentication lookups
- `charity_requests.user_email` - for user dashboard queries
- `charity_requests.status` - for admin dashboard filtering
- `transactions.user_email` - for transaction history
- `transactions.transaction_id` - for payment verification
- `user_favorites.user_email` - for favorites page
- `user_reviews.user_email` - for reviews page
- `donations.status` - for available donations filtering

### Composite Indexes
- `user_favorites(user_email, donation_id)` - for uniqueness and fast lookups
- `transactions(user_email, transaction_date)` - for user transaction history with date sorting

## Data Validation Rules

### Users
- Email must be unique and valid format
- Role must be one of: 'User', 'Charity', 'Admin'
- Display name is optional but recommended

### Charity Requests
- Organization name is required (max 255 characters)
- Mission statement is required (max 5000 characters)
- Amount must be exactly $25.00
- Status must be: 'Pending', 'Approved', or 'Rejected'

### Transactions
- Amount must be positive
- Transaction ID must be unique
- Purpose is required for tracking

### Reviews
- Rating must be between 1 and 5
- Review text is required (minimum 10 characters)
- User can only review each donation once

### Favorites
- User cannot favorite the same donation twice
- Donation must exist when adding to favorites

## API Endpoints

### Authentication Required Endpoints

#### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

#### Charity Requests
- `POST /api/charity-requests` - Submit charity role request
- `GET /api/charity-requests/user` - Get user's charity requests

#### Transactions
- `GET /api/transactions/user` - Get user's transaction history
- `GET /api/transactions/:id` - Get specific transaction details

#### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add donation to favorites
- `DELETE /api/favorites/:donationId` - Remove from favorites

#### Reviews
- `GET /api/reviews/user` - Get user's reviews
- `POST /api/reviews` - Submit a review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

#### Donations
- `GET /api/donations` - Get available donations
- `GET /api/donations/:id` - Get donation details

### Admin Only Endpoints
- `GET /api/admin/charity-requests` - Get all charity requests
- `PUT /api/admin/charity-requests/:id/status` - Update request status

## Migration Scripts

### Initial Setup
```sql
-- Create database
CREATE DATABASE food_donation_app;
USE food_donation_app;

-- Run table creation scripts in order:
-- 1. users
-- 2. donations
-- 3. charity_requests
-- 4. transactions
-- 5. user_favorites
-- 6. user_reviews
```

### Sample Data Insert
```sql
-- Insert sample user
INSERT INTO users (id, email, display_name, role, email_verified) 
VALUES ('user_1', 'user@example.com', 'John Doe', 'User', TRUE);

-- Insert sample donation
INSERT INTO donations (id, title, restaurant_name, restaurant_location, quantity, status, created_by)
VALUES ('don_1', 'Fresh Sandwiches', 'Green Café', 'Downtown', '10 portions', 'Available', 'restaurant@example.com');
```

## Security Considerations

1. **Data Encryption**: All sensitive data should be encrypted at rest
2. **Access Control**: Implement proper role-based access control
3. **Input Validation**: Validate all inputs on both client and server side
4. **SQL Injection Prevention**: Use parameterized queries
5. **Authentication**: Implement proper session management
6. **Payment Security**: Follow PCI DSS compliance for payment processing

## Backup Strategy

1. **Daily Backups**: Automated daily database backups
2. **Transaction Logs**: Regular transaction log backups
3. **Point-in-time Recovery**: Ability to restore to any point in time
4. **Offsite Storage**: Store backups in multiple geographic locations