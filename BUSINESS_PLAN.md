# Find-My-PG Business Plan & Monetization Strategy

## The Problem You're Solving
- Students and working professionals in India struggle to find PGs
- Small PG owners (1-2 PGs) can't afford ads or websites
- No affordable, regional-language PG search platform exists

## Cost Breakdown (Keep It Almost Free)

| Item | Cost | Notes |
|------|------|-------|
| **Hosting (Vercel)** | ₹0/month | Free tier: 100GB bandwidth, perfect for Next.js |
| **Database (Firebase Spark)** | ₹0/month | Free: 1GB storage, 50K reads/day, 20K writes/day |
| **Google Maps API** | ₹0/month | $200 free credit/month (~₹16,500) — more than enough |
| **Domain (.in)** | ₹500-800/year | Buy from GoDaddy, Namecheap, or Hostinger |
| **SSL Certificate** | ₹0 | Vercel provides free SSL |
| **Email (Zoho Mail)** | ₹0/month | Free plan: 5 users, use contact@find-my-pg.com |
| **Analytics (Google Analytics)** | ₹0 | Free forever |
| **Total Monthly Cost** | **₹0-70/month** | Only domain cost (~₹800/year) |

### When to Upgrade (After Growth)
- **Firebase Blaze Plan**: Pay-as-you-go, starts billing only after free limits
- **Vercel Pro**: ₹1,600/month — only when you cross 100GB bandwidth
- **Google Maps**: Only if you exceed $200/month free credit (unlikely early on)

---

## Revenue Streams (How to Make Money)

### Stream 1: Verified PG Listings (Primary Revenue)
PG owners pay a small monthly fee to get a **"Verified" badge** and top ranking.

| Plan | Price | Features |
|------|-------|----------|
| **Basic (Free)** | ₹0/month | Standard listing, appears in search |
| **Verified** | ₹299/month | Verified badge, higher ranking, highlighted card |
| **Premium** | ₹599/month | Top of search, featured on homepage, priority support |

**Why PG owners will pay:**
- Verified badge builds trust → more tenant enquiries
- Top ranking means more visibility
- ₹299/month is much cheaper than any other advertising
- They're already spending ₹500-2000 on paper ads and brokers

**Revenue projection:**
- 50 verified PG owners = ₹14,950/month
- 200 verified PG owners = ₹59,800/month
- 500 verified PG owners = ₹1,49,500/month

### Stream 2: Google AdSense (Passive Income)
- Sign up at https://adsense.google.com
- Add ad units to your website (sidebar, between listings, footer)
- Google serves relevant ads automatically
- You earn per click (CPC) and per impression (CPM)

**Expected earnings:**
- 1,000 daily visitors = ₹3,000-8,000/month
- 10,000 daily visitors = ₹30,000-80,000/month
- Indian traffic CPC: ₹5-25 per click

**Best ad placements for Find-My-PG:**
1. Between every 6th listing in search results
2. Sidebar on listing detail page
3. Below search filters on mobile
4. Footer banner on all pages

### Stream 3: Local Business Ads (Direct Partnerships)
Sell ad space directly to local businesses near PG areas.

**Target businesses:**
- Furniture rental companies (Furlenco, RentMojo, CityFurnish)
- Food delivery services (Swiggy, Zomato, local tiffin services)
- Internet/broadband providers (ACT Fibernet, Airtel, Jio)
- Packers & movers
- Local grocery stores and laundry services
- Coaching institutes near college areas
- Gym memberships

**Pricing for direct ads:**
| Ad Placement | Price |
|-------------|-------|
| Homepage banner (top) | ₹5,000-10,000/month |
| Search results sidebar | ₹3,000-5,000/month |
| Listing detail page banner | ₹2,000-4,000/month |
| City-specific banner | ₹1,500-3,000/month |

### Stream 4: Affiliate Marketing
- Partner with services PG tenants need
- Earn commission on every referral

**Affiliate opportunities:**
- Furniture rental → 5-10% commission per order
- Internet connection → ₹200-500 per lead
- Insurance services → ₹100-300 per lead
- Online food subscriptions → ₹50-100 per referral

### Stream 5: Featured City Sponsorships (Future)
- A company can "sponsor" an entire city page
- Example: "PGs in Bangalore — Powered by Furlenco"
- Charge ₹10,000-25,000/month per city

---

## Growth Strategy (First 6 Months)

### Month 1-2: Launch & Seed Data
- Deploy on Vercel (free)
- Add 50-100 PG listings manually in Bangalore (your home city first)
- Visit PGs in person, take photos, get owner details
- Share on college WhatsApp groups and social media
- Create Instagram page: @findmypg

### Month 3-4: Grow Organically
- Expand to 2-3 more cities (Hyderabad, Chennai, Pune)
- Enable PG owners to self-list (already built!)
- Start Google AdSense once you hit 500+ daily visitors
- Create SEO-optimized pages for "PG in [city]" searches
- Write blog posts: "Best PGs near [college name]"

### Month 5-6: Monetize
- Launch Verified PG plan (₹299/month)
- Approach local businesses for direct ads
- Start affiliate partnerships
- Target: 50 verified PG owners, ₹15,000-20,000/month revenue

### Month 7-12: Scale
- Expand to 10+ cities
- Build mobile app (React Native, reuse your components)
- Hire 1-2 freelancers for PG data collection (₹5,000-8,000/month)
- Target: 200+ verified PG owners, ₹60,000-1,00,000/month

---

## SEO Strategy (Free Traffic)

### Target Keywords
- "PG in Bangalore" — 40K+ monthly searches
- "PG near [college name]" — 5-10K each
- "PG for girls in [city]" — 10K+ each
- "Paying guest in [city]" — 20K+ each

### SEO Actions (Free)
1. Create city-specific landing pages: `/pg-in-bangalore`, `/pg-in-hyderabad`
2. Add meta titles like "Best PG in Bangalore | Verified & Affordable | Find-My-PG"
3. Submit sitemap to Google Search Console (free)
4. Create Google My Business profile (free)
5. Write 2 blog posts/week on PG-related topics
6. Get backlinks from college forums and local directories

---

## Competitor Analysis

| Platform | Listing Fee | Broker Fee | Our Advantage |
|----------|------------|------------|---------------|
| NoBroker | Free listing, paid plans ₹999+ | No broker | We're free + regional languages |
| MagicBricks | ₹1,000+ for visibility | Brokers charge 1 month rent | We're much cheaper |
| 99acres | ₹3,000+ premium listing | Broker commissions | We focus only on PG |
| Flat & Flatmates | Free but limited | None | We have verified owners |
| **Find-My-PG** | **Free to list, ₹299 for verified** | **No brokers** | **PG-only, 6 languages, cheapest** |

---

## Key Metrics to Track
- Daily active users (Google Analytics - free)
- Number of PG listings (Firebase dashboard - free)
- Search queries per day (API logs)
- Verified PG conversions
- Revenue per city
- User retention rate
