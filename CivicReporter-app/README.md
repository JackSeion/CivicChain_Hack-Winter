# CivicReporter - Community Issue Reporting App

A React Native mobile application built with Expo that empowers citizens to report civic issues, track complaints, and view community hotspots on an interactive map.

## 📱 Features

- **Issue Reporting**: Submit complaints about civic issues with photos, location, and detailed descriptions
- **Interactive Map**: View reported issues as hotspots on Google Maps
- **Leaderboard**: Track top contributors in the community
- **User Authentication**: Secure login/signup with Supabase
- **Location-Based Filtering**: Automatically filter complaints by your city
- **Real-time Updates**: Live complaint status tracking
- **Photo Upload**: Attach images to complaint reports

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (PostgreSQL + Authentication + Storage)
- **Maps**: react-native-maps with Google Maps Platform
- **Location**: expo-location
- **UI**: React Native components with custom styling
- **Build**: EAS Build (Expo Application Services)

## 📋 Prerequisites

- Node.js 18+ installed
- Expo account (sign up at expo.dev)
- EAS CLI installed globally
- Android Studio (for Android development) or Xcode (for iOS)
- Supabase account with project setup
- Google Maps API key

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Gautamo1/civicChain-2.git
cd civicChain-2/CivicReporter
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

The following secrets are configured in EAS:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GOOGLE_MAPS_API_KEY`
- `LOCATIONIQ_API_KEY`

For local development, create a `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_LOCATIONIQ_API_KEY=your_locationiq_api_key
```

4. **Configure Supabase**

Create the following tables in your Supabase project:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  city TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending',
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  city TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏃 Running the App

**Start development server:**
```bash
npx expo start
```

**Run on Android:**
```bash
npx expo start --android
```

**Run on iOS:**
```bash
npx expo start --ios
```

## 📦 Building APK

**Install EAS CLI:**
```bash
npm install -g eas-cli
```

**Login to Expo:**
```bash
eas login
```

**Build Android APK:**
```bash
eas build --platform android --profile preview
```

**Build Production AAB:**
```bash
eas build --platform android --profile production
```

The build includes:
- ✅ Hermes engine for faster performance
- ✅ ProGuard minification for smaller bundle size
- ✅ Console logs removed in production builds
- ✅ Optimized Metro bundler configuration

## 📁 Project Structure

```
CivicReporter/
├── src/
│   ├── app/                    # Expo Router pages
│   │   ├── (tabs)/            # Tab-based screens
│   │   │   ├── home.tsx       # Complaints list
│   │   │   ├── map.tsx        # Hotspot map
│   │   │   ├── leaderboard.tsx
│   │   │   └── profile.tsx
│   │   ├── _layout.tsx        # Root layout
│   │   ├── index.tsx          # Entry point
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── add-complaint.tsx
│   ├── components/            # Reusable components
│   ├── context/              # React Context (Auth)
│   ├── screens/              # Screen components
│   ├── lib/                  # Utilities & API clients
│   ├── constants/            # App constants
│   └── assets/               # Images, fonts
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── babel.config.js           # Babel config (console removal)
├── metro.config.js           # Metro bundler config
└── package.json
```

## 🔑 Key Optimizations

### Performance
- **Hermes Engine**: Faster JavaScript execution
- **ProGuard**: Code minification and obfuscation
- **Console Stripping**: Auto-removal of console logs in production
- **Lazy Loading Disabled**: Instant tab switching
- **Location Caching**: Uses last known position for faster map loads

### User Experience
- **City-based Filtering**: Shows relevant complaints first
- **8-second Location Timeout**: Prevents infinite loading
- **Parallel Data Fetching**: Loads user data and complaints simultaneously
- **Default Map Region**: Shows map instantly while fetching location

## 🌐 API Endpoints (Backend)

The backend is located in `civic-backend/` and provides:
- Complaint submission
- User management
- Statistics and leaderboard
- Blockchain integration (optional)

## 🔐 Security

- API keys stored in EAS secrets (not in codebase)
- Supabase Row Level Security (RLS) enabled
- ProGuard code obfuscation in production builds
- Secure authentication with Supabase Auth

## 🐛 Troubleshooting

**Build fails with "Unknown error":**
- Ensure NODE_ENV is not set to "production" in preview builds
- Check that web platform is excluded from app.json

**Map not loading:**
- Verify Google Maps API key is valid
- Enable Maps SDK for Android/iOS in Google Cloud Console
- Check location permissions are granted

**Location timeout:**
- App uses 8-second timeout for location services
- Falls back to last known position if current location unavailable

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

Project Link: [https://github.com/Gautamo1/civicChain-2](https://github.com/Gautamo1/civicChain-2)

## 🙏 Acknowledgments

- Expo team for excellent React Native framework
- Supabase for backend infrastructure
- Google Maps Platform for mapping services
- Community contributors