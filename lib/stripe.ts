import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Stripe secret key not configured — payments disabled');
}

const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-18.acacia' as Stripe.LatestApiVersion })
  : null;

export default stripe;

// Plan pricing in INR (paisa)
export const PLANS = {
  verified: {
    name: 'Verified Plan',
    priceInPaisa: 29900, // ₹299
    priceDisplay: '₹299',
    features: [
      'Verified badge on listing',
      'Higher ranking in search',
      'Priority in search results',
    ],
  },
  premium: {
    name: 'Premium Plan',
    priceInPaisa: 59900, // ₹599
    priceDisplay: '₹599',
    features: [
      'Gold Premium badge',
      'Top of search results',
      'Featured on homepage',
      'Priority customer support',
      'Highlighted listing card',
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
