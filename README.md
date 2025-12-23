# 🏠 HomyFind - Find Your Perfect PG

> A modern, real-time PG (Paying Guest) accommodation search platform built with Next.js, Firebase, and Google Maps API.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

## ✨ Features

### 🔍 Smart Search
- **Real-time Google Maps Integration** - Fetch live PG listings from Google Maps
- **Firebase Firestore Storage** - User-submitted PG advertisements
- **Advanced Filtering** - Filter by rent, sharing type, gender, food inclusion
- **Pagination** - Browse through unlimited listings (21 per page)

### 🏠 Listing Management
- **Detailed PG Pages** - Photo galleries, amenities, contact details, Google Maps links
- **Add Advertisement** - PG owners can list their properties
- **Verified Listings** - Trust badges for verified properties
- **Real-time Updates** - Instant synchronization across all users

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Beautiful Cards** - Professional listing cards with images and details
- **Smooth Animations** - Engaging hover effects and transitions
- **Dark Mode Ready** - Clean, modern interface

### 🔐 Security & Performance
- **Firebase Security Rules** - Protected data access
- **Type Safety** - Full TypeScript implementation
- **Optimized Images** - Fast loading with Next.js Image optimization
- **SEO Friendly** - Meta tags and sitemap for better visibility

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account ([Get one free](https://firebase.google.com/))
- Google Cloud account for Maps API ([Get $200 free credit](https://cloud.google.com/))

### 1. Clone & Install

```bash
cd /Users/kiranbk/HomyFind-Web
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing: `homyfind-app`
3. Enable **Firestore Database**:
   - Click "Create Database"
   - Choose location: `us-central1` or `asia-southeast1`
   - Start in **test mode** (for development)

4. Set up **Firestore Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PG Advertisements - Open for development
    match /pg_advertisements/{adId} {
      allow read: if true;
      allow write: if true; // Change to require auth in production
    }
  }
}
```

### 4. Set Up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable these APIs:
   - **Places API (New)**
   - **Places API**
   - **Maps JavaScript API**
4. Create API Key in Credentials
5. Restrict API key to only enabled APIs
6. Add key to `.env.local`

**Cost:** $200 FREE credit/month = ~4,000 searches FREE! 🎉

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📂 Project Structure

```
HomyFind-Web/
├── app/
│   ├── page.tsx                    # Home page with search & listings
│   ├── layout.tsx                  # Root layout with metadata
│   ├── add-listing/
│   │   └── page.tsx               # PG advertisement form
│   ├── listing/[id]/
│   │   └── page.tsx               # Individual PG detail page
│   └── api/
│       ├── search-realtime/
│       │   └── route.ts           # Search API (Firebase + Google Maps)
│       ├── add-advertisement/
│       │   └── route.ts           # Add PG listing API
│       └── listing/[id]/
│           └── route.ts           # Get listing details API
├── components/
│   ├── PGCard.tsx                 # PG listing card component
│   └── SearchFilters.tsx          # Search and filter component
├── lib/
│   ├── firebase.ts                # Firebase configuration
│   ├── firestore.ts               # Firestore database functions
│   ├── google-maps-places.ts     # Google Maps API integration
│   └── skyscanner-approach.ts    # Web scraping fallback
├── types/
│   └── index.ts                   # TypeScript interfaces
├── public/
│   └── HomyFind-logo.png          # Logo image
├── .env.local                     # Environment variables (create this)
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎯 Key Features Breakdown

### Smart Search Algorithm

The search prioritizes data sources in this order:

1. **Firebase Firestore** - User-submitted PG advertisements
2. **Google Maps Places API** - Real-time PG listings from Google Maps
3. **Web Scraping Fallback** - Quality mock data if APIs unavailable

### Pagination System

- **21 listings per page**
- Previous/Next navigation buttons
- Clickable page numbers
- Shows "X - Y of Z" counter
- Auto-scroll to top on page change

### PG Detail Page

When users click "View Details":
- **Photo Gallery** with carousel and thumbnails
- **Complete Information** - Name, rating, description, amenities, rules
- **Pricing Details** - Rent, deposit, sharing type, food inclusion
- **Contact Information** - Owner name, phone, email
- **Google Maps Link** - Direct link to location

### Add Advertisement Feature

PG owners can submit listings with:
- PG name and description
- Owner contact details
- Full address with city, state, pincode
- Pricing (rent, deposit, sharing type)
- Amenities selection (WiFi, AC, parking, etc.)
- House rules
- Room availability
- Gender preference & food options

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Firebase Firestore** | NoSQL database for user listings |
| **Google Maps API** | Real-time PG data |
| **Lucide React** | Beautiful icon library |
| **Vercel** | Hosting & deployment |

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy to Production**:
```bash
vercel --prod
```

Your site will be live at: `https://homyfind-web.vercel.app`

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 💰 Cost Breakdown

### Free Tier Limits

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Vercel** | 100GB bandwidth/month | ~5GB | **$0** |
| **Firebase Firestore** | 50K reads, 20K writes/day | ~1K operations | **$0** |
| **Google Maps API** | $200 credit/month | ~$100 usage | **$0** |
| **Firebase Storage** | 5GB storage, 1GB/day download | ~100MB | **$0** |
| **Total** | | | **$0/month** ✅ |

Perfect for launching your startup! 🚀

---

## 📱 API Endpoints

### Search PGs
```
GET /api/search-realtime?location=Bangalore
```

**Response:**
```json
{
  "success": true,
  "data": [...listings],
  "count": 60,
  "source": "google-maps-places-api",
  "isRealData": true
}
```

### Add Advertisement
```
POST /api/add-advertisement
Content-Type: application/json

{
  "pgName": "Sunshine PG",
  "ownerName": "John Doe",
  "ownerPhone": "+91 98765 43210",
  "city": "Bangalore",
  "rent": 8000,
  ...
}
```

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Deploy to Vercel
vercel --prod
```

---

## 🎨 Customization

### Change Pagination Limit

Edit `app/page.tsx`:
```typescript
const LISTINGS_PER_PAGE = 21; // Change to any number
```

### Update Theme Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#0066FF', // Your brand color
    }
  }
}
```

### Add New Amenities

Edit `app/add-listing/page.tsx`:
```typescript
const amenitiesList = [
  'WiFi', 'AC', 'TV', 'Washing Machine',
  'Your New Amenity', // Add here
];
```

---

## 🐛 Troubleshooting

### Google Maps returns no results
- Check API key is correct in `.env.local`
- Verify APIs are enabled in Google Cloud Console
- Wait 5-10 minutes after creating key for propagation

### Firebase permission denied
- Check Firestore security rules allow read/write
- Verify Firebase config in `.env.local`
- Make sure Firestore is initialized in project

### Listings show ₹0
- Data transformation might be incorrect
- Check browser console for errors
- Verify API response structure

### Port 3000 already in use
- Next.js will automatically try port 3001
- Or manually kill process: `lsof -ti:3000 | xargs kill`

---

## 🔐 Security Best Practices

### For Production:

1. **Update Firestore Rules**:
```javascript
match /pg_advertisements/{adId} {
  allow read: if true;
  allow create: if request.auth != null; // Require login
  allow update, delete: if request.auth.uid == resource.data.ownerId;
}
```

2. **Restrict Google Maps API**:
   - Add HTTP referrer restrictions
   - Limit to your domain only

3. **Environment Variables**:
   - Never commit `.env.local` to git
   - Use Vercel's environment variables

---

## 📈 Future Enhancements

- [ ] User authentication (Firebase Auth)
- [ ] Image upload for PG listings
- [ ] Admin panel for verification
- [ ] Booking system
- [ ] Payment integration
- [ ] Email notifications
- [ ] Reviews and ratings system
- [ ] Chat between users and owners
- [ ] Advanced search with maps
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for backend infrastructure
- [Google Maps](https://developers.google.com/maps) for location services
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Lucide](https://lucide.dev/) for icon library

---

## 📞 Support

Need help? Contact:
- **Email**: support@homyfind.com
- **GitHub**: [Open an issue](https://github.com/yourusername/homyfind-web/issues)

---

**Built with ❤️ by the HomyFind Team**

🌐 **Live Demo**: [https://homyfind-web.vercel.app](https://homyfind-web.vercel.app)

---

## 🎯 Quick Setup Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.local` with Firebase & Google Maps credentials
- [ ] Set up Firestore database
- [ ] Enable Google Maps APIs
- [ ] Run `npm run dev`
- [ ] Test search functionality
- [ ] Deploy to Vercel
- [ ] Share with users! 🎉
