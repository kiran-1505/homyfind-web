# How to Deploy Find-My-PG — Free & Cost Effective

## Option 1: Vercel (RECOMMENDED — Free)

Vercel is the company that made Next.js. Best free hosting for your stack.

### Free Tier Includes
- Unlimited deployments
- 100GB bandwidth/month (plenty for starting out)
- Free SSL certificate (https://)
- Automatic deployments from GitHub
- Preview URLs for every git push
- Edge network (fast worldwide)
- Custom domain support

### Step-by-Step Deployment

#### Step 1: Push code to GitHub
```bash
# If not already on GitHub
git remote add origin https://github.com/YOUR_USERNAME/Find-My-PG-Web.git
git push -u origin main
```

#### Step 2: Sign up on Vercel
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub

#### Step 3: Import your project
1. Click "Add New Project"
2. Select "Find-My-PG-Web" from your repositories
3. Vercel auto-detects Next.js — no configuration needed

#### Step 4: Add Environment Variables
In the Vercel dashboard, go to Settings → Environment Variables and add:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
NEXT_PUBLIC_FIREBASE_APP_ID=your_value
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_value
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_value

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_value
GOOGLE_MAPS_API_KEY=your_value

# Stripe (if using verified/premium plans)
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Admin
ADMIN_API_KEY=your_admin_key
```

Copy these from your `.env.local` file.

#### Step 5: Deploy
1. Click "Deploy"
2. Wait 1-2 minutes
3. Your site is live at `https://find-my-pg.com`

#### Step 6: Add Custom Domain
1. Buy a domain: `find-my-pg.com` (from GoDaddy/Namecheap)
2. In Vercel: Settings → Domains → Add `find-my-pg.com`
3. Update your domain's DNS:
   - Add A record: `76.76.21.21`
   - Add CNAME: `cname.vercel-dns.com`
4. Vercel auto-provisions SSL — your site is live at `https://find-my-pg.com`

### Auto-Deploy Setup
Every time you push to GitHub, Vercel automatically deploys:
```bash
git add .
git commit -m "New feature"
git push origin main
# → Vercel deploys automatically in ~60 seconds
```

---

## Option 2: Cloudflare Pages (Free Alternative)

### Free Tier Includes
- Unlimited bandwidth (better than Vercel!)
- 500 builds/month
- Free SSL
- Cloudflare CDN (very fast)

### Limitations
- Next.js support requires "Edge Runtime" (some features may not work)
- Slightly more complex setup than Vercel
- API routes need Cloudflare Workers (free tier: 100K requests/day)

### When to Use
- If you exceed Vercel's 100GB bandwidth
- If you want unlimited bandwidth from day 1

---

## Option 3: Railway (Cheap, $5/month)

### Good For
- If you need a backend server (Node.js, database)
- $5 free credit/month on free plan
- Easy PostgreSQL/MySQL database hosting

### When to Use
- When Firebase free tier isn't enough
- When you need a custom backend server

---

## Domain Name Suggestions

| Domain | Estimated Cost | Provider |
|--------|---------------|----------|
| find-my-pg.com | Purchased | GoDaddy |

**Domain purchased**: `find-my-pg.com` — connected to Vercel via nameservers.

---

## Post-Deployment Checklist

- [ ] Website loads correctly on `https://find-my-pg.com`
- [ ] All environment variables are set in Vercel
- [ ] Search works (test with "Bangalore")
- [ ] Add listing form submits to Firebase (requires login)
- [ ] Owner login works (Email + Password)
- [ ] Dashboard shows owner's listings
- [ ] Edit and delete work from dashboard
- [ ] Photo upload works in add-listing form
- [ ] All 6 languages work (`/hi`, `/kn`, `/te`, `/ta`, `/ml`)
- [ ] Mobile responsive (test on phone)
- [ ] Stripe webhook configured (if using paid plans)
- [ ] Set up Google Search Console (free SEO tool)
- [ ] Set up Google Analytics (free)
- [ ] Submit sitemap to Google
- [ ] Create Google My Business listing (free)
- [ ] Test page speed at https://pagespeed.web.dev

---

## Firebase Security (Important Before Going Live)

### Update Firestore Rules
Go to Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pg_advertisements/{document} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

This allows anyone to read and create listings, but only the owner (matching `ownerId` field) can update or delete their own listings.

### Restrict API Keys
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on your Google Maps API key
3. Under "Application restrictions": Select "HTTP referrers"
4. Add: `find-my-pg.com/*` and `*.find-my-pg.com/*`
5. Under "API restrictions": Select "Restrict key" → Only Maps JavaScript API, Places API

---

## Monthly Cost Summary After Deployment

| Service | Cost |
|---------|------|
| Vercel Hosting | ₹0 |
| Firebase (Spark) | ₹0 |
| Google Maps API | ₹0 (within free credit) |
| Domain (find-my-pg.com) | ~₹65/month |
| Zoho Email | ₹0 |
| Google Analytics | ₹0 |
| **Total** | **~₹65/month** |
