import { loadStripe } from '@stripe/stripe-js';

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

/**
 * Redirect to Stripe Checkout for plan upgrade
 */
export async function redirectToCheckout(plan: 'verified' | 'premium', listingId: string, ownerEmail?: string) {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, listingId, ownerEmail }),
  });

  const data = await response.json();

  if (data.success && data.url) {
    // Redirect to Stripe's hosted checkout page (supports UPI, cards, netbanking)
    window.location.href = data.url;
  } else {
    throw new Error(data.error || 'Failed to create checkout session');
  }
}
