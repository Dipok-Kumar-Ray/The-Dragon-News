# গুগল ডকস রিডার - MERN Stack অ্যাপ্লিকেশন

একটি সম্পূর্ণ MERN Stack অ্যাপ্লিকেশন যা Google Docs API ব্যবহার করে যেকোনো Google Docs ডকুমেন্ট পড়তে এবং বিশ্লেষণ করতে পারে।

## 🌟 বৈশিষ্ট্যসমূহ

### Frontend (React.js)
- 📱 **রেসপন্সিভ ডিজাইন** - সব ডিভাইসে সুন্দর দেখায়
- 🎨 **আধুনিক UI/UX** - Tailwind CSS + DaisyUI
- 🔐 **Google OAuth লগইন** - নিরাপদ অথেন্টিকেশন
- 📄 **ডকুমেন্ট রিডার** - ইন্টারঅ্যাক্টিভ ডকুমেন্ট ভিউয়ার
- 🔍 **সার্চ ও ফিল্টার** - দ্রুত ডকুমেন্ট খুঁজুন
- ⭐ **ফেভারিট সিস্টেম** - প্রিয় ডকুমেন্ট সেভ করুন
- 📊 **অ্যানালিটিক্স** - ডকুমেন্ট পরিসংখ্যান

### Backend (Node.js + Express)
- 🚀 **RESTful API** - সম্পূর্ণ CRUD অপারেশন
- 🔒 **JWT Authentication** - নিরাপদ টোকেন ভিত্তিক সিস্টেম
- 📈 **Rate Limiting** - API abuse প্রতিরোধ
- 🛡️ **Security Middleware** - Helmet, CORS
- 📝 **Google Docs Integration** - সরাসরি API সংযোগ
- 🗄️ **MongoDB Integration** - NoSQL ডাটাবেস

### ডাটাবেস (MongoDB)
- 📊 **User Management** - ব্যবহারকারী তথ্য
- 📄 **Document Storage** - ডকুমেন্ট মেটাডাটা
- 🔍 **Full-text Search** - পূর্ণ টেক্সট সার্চ
- 📈 **Analytics Data** - ব্যবহারের পরিসংখ্যান

## 🛠️ প্রযুক্তি স্ট্যাক

### Frontend
- **React.js 18** - UI Framework
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **DaisyUI** - Beautiful components
- **Framer Motion** - Smooth animations
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Google APIs** - Google Docs integration
- **JWT** - Authentication
- **Helmet** - Security middleware
- **CORS** - Cross-origin support

## 📋 প্রয়োজনীয়তা

- **Node.js** 16+ এবং npm
- **MongoDB** 4.4+ (local বা cloud)
- **Google Cloud Console** অ্যাকাউন্ট
- **Git** version control

## 🚀 ইনস্টলেশন গাইড

### ১. রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/your-username/mern-google-docs.git
cd mern-google-docs
```

### ২. Dependencies ইনস্টল করুন
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### ৩. Google Cloud Console সেটআপ

1. [Google Cloud Console](https://console.cloud.google.com/) এ যান
2. নতুন প্রজেক্ট তৈরি করুন
3. **APIs & Services > Library** এ যান
4. **Google Docs API** এবং **Google Drive API** enable করুন
5. **APIs & Services > Credentials** এ যান
6. **OAuth 2.0 Client IDs** তৈরি করুন:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

### ৪. Environment Variables সেটআপ

Backend এ `.env` ফাইল তৈরি করুন:
```bash
cd backend
cp .env.example .env
```

`.env` ফাইলে আপনার তথ্য দিন:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/google-docs-reader

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=7d
```

### ৫. MongoDB সেটআপ

**Option A: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb/brew/mongodb-community

# Windows - MongoDB Community Server ডাউনলোড করুন
```

**Option B: MongoDB Atlas (Cloud)**
1. [MongoDB Atlas](https://www.mongodb.com/atlas) এ অ্যাকাউন্ট তৈরি করুন
2. Free cluster তৈরি করুন
3. Connection string কপি করে `.env` এ যোগ করুন

### ৬. অ্যাপ্লিকেশন চালান

**Development mode (সব একসাথে):**
```bash
# Root ডিরেক্টরি থেকে
npm run dev
```

**আলাদা আলাদা:**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

অ্যাপ্লিকেশন চালু হবে:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📁 প্রজেক্ট স্ট্রাকচার

```
mern-google-docs/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── .env.example        # Environment variables template
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main App component
│   └── package.json
├── package.json            # Root package.json
└── README.md              # এই ফাইল
```

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth URL
- `POST /api/auth/google/callback` - OAuth callback
- `GET /api/auth/user` - Current user info
- `POST /api/auth/logout` - Logout

### Google Docs
- `GET /api/google-docs/auth-url` - Get OAuth URL
- `POST /api/google-docs/callback` - Handle OAuth callback
- `POST /api/google-docs/read` - Read Google Doc
- `GET /api/google-docs/documents` - Get user documents
- `GET /api/google-docs/documents/:id` - Get specific document
- `DELETE /api/google-docs/documents/:id` - Delete document
- `POST /api/google-docs/extract-id` - Extract document ID from URL

## 🎯 ব্যবহারের নির্দেশনা

### ১. Google এর সাথে লগইন করুন
- হোম পেজে "শুরু করুন" বাটনে ক্লিক করুন
- Google অ্যাকাউন্ট দিয়ে সাইন ইন করুন
- প্রয়োজনীয় permissions দিন

### ২. ডকুমেন্ট পড়ুন
- Dashboard এ যান
- Google Docs URL পেস্ট করুন
- "ডকুমেন্ট পড়ুন" বাটনে ক্লিক করুন

### ৩. ডকুমেন্ট ম্যানেজ করুন
- সব ডকুমেন্ট দেখুন Documents পেজে
- ফেভারিট হিসেবে মার্ক করুন
- সার্চ এবং ফিল্টার ব্যবহার করুন

## 🔒 নিরাপত্তা বৈশিষ্ট্য

- **OAuth 2.0** - Google এর মাধ্যমে নিরাপদ লগইন
- **JWT Tokens** - Stateless authentication
- **Rate Limiting** - API abuse প্রতিরোধ
- **CORS Protection** - Cross-origin security
- **Helmet.js** - HTTP headers security
- **Input Validation** - Data sanitization
- **Environment Variables** - Sensitive data protection

## 🧪 টেস্টিং

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Production Build

```bash
# Frontend build
cd frontend
npm run build

# Backend start
cd backend
npm start
```

## 🚀 Deployment

### Heroku
1. Heroku CLI ইনস্টল করুন
2. `heroku create your-app-name`
3. Environment variables সেট করুন
4. `git push heroku main`

### Vercel (Frontend)
1. Vercel CLI ইনস্টল করুন
2. `vercel --prod`

### MongoDB Atlas
1. Production database সেটআপ করুন
2. IP whitelist কনফিগার করুন

## 🤝 Contribution

1. Fork করুন
2. নতুন branch তৈরি করুন (`git checkout -b feature/amazing-feature`)
3. Commit করুন (`git commit -m 'Add amazing feature'`)
4. Push করুন (`git push origin feature/amazing-feature`)
5. Pull Request তৈরি করুন

## 📝 License

এই প্রজেক্ট MIT License এর অধীনে লাইসেন্সকৃত।

## 💬 Support

সমস্যা বা প্রশ্ন থাকলে:
- Issue তৈরি করুন GitHub এ
- Email করুন: your-email@example.com

## 🙏 Acknowledgments

- [Google Docs API](https://developers.google.com/docs/api)
- [MERN Stack](https://www.mongodb.com/mern-stack)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

---

**বানিয়েছেন** ❤️ দিয়ে **[Your Name]**