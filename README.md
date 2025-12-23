# HomyFind Web - Deployment Guide

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd /Users/kiranbk/HomyFind/web
npm install
```

### 2. Update Firebase Config

Edit `lib/firebase.ts` and replace with your Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## 🌐 Deploy to Vercel (FREE)

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub/Gmail (FREE)

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Deploy

```bash
cd /Users/kiranbk/HomyFind/web
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **homyfind-web**
- Directory? **./** (press enter)
- Override settings? **No**

### Step 4: Done!

Your site will be live at: `https://homyfind-web.vercel.app`

---

## 🔄 Update Website

Every time you make changes:

```bash
vercel --prod
```

---

## 💰 Costs

**Vercel FREE Plan:**
- ✅ Unlimited websites
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 100GB bandwidth/month
- ✅ Perfect for startups

**No credit card needed!**

---

## 📱 Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Fast loading with Next.js
- ✅ SEO optimized
- ✅ Same Firebase backend as mobile app
- ✅ Real-time data sync

---

## 🛠️ Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Backend
- **Vercel** - Hosting

---

## 📂 Project Structure

```
web/
├── app/
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   └── firebase.ts        # Firebase config
├── types/
│   └── index.ts           # TypeScript types
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

---

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Update Firebase config** in `lib/firebase.ts`
3. **Test locally**: `npm run dev`
4. **Deploy**: `vercel`
5. **Share your website**: `https://homyfind-web.vercel.app`

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Firebase Docs: https://firebase.google.com/docs

---

**Your website will be live in 5 minutes!** 🎉

