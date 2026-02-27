import { NextRequest, NextResponse } from 'next/server';
import stripe, { PLANS, PlanType } from '@/lib/stripe';
import { verifyAuthToken } from '@/lib/auth-server';
import { getPGAdvertisementById } from '@/lib/firestore';

// Allowed origins for Stripe redirect URLs
const ALLOWED_ORIGINS = [
  'https://pg-find.com',
  'https://www.pg-find.com',
  'https://find-my-pg.vercel.app',
  'http://localhost:3000',
];

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Payments not configured yet' },
        { status: 503 }
      );
    }

    // Verify authentication
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { plan, listingId } = await request.json();

    // Validate plan
    if (!plan || !['verified', 'premium'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan. Choose verified or premium.' },
        { status: 400 }
      );
    }

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Verify the user owns this listing
    const listing = await getPGAdvertisementById(listingId);
    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const isOwner =
      (user.phone && listing.ownerPhone === user.phone) ||
      (user.email && listing.ownerEmail && listing.ownerEmail === user.email);

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'You do not own this listing' },
        { status: 403 }
      );
    }

    const selectedPlan = PLANS[plan as PlanType];

    // Validate origin against allowlist to prevent open redirects
    const requestOrigin = request.headers.get('origin') || '';
    const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[ALLOWED_ORIGINS.length - 1];

    // Create Stripe Checkout Session with subscription metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Find-My-PG ${selectedPlan.name}`,
              description: `Monthly ${plan} plan for your PG listing`,
            },
            unit_amount: selectedPlan.priceInPaisa,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&listing=${listingId}&plan=${plan}`,
      cancel_url: `${origin}/payment-cancelled`,
      customer_email: user.email || undefined,
      metadata: {
        listingId,
        plan,
      },
      // Copy metadata to the subscription so webhook handlers can access it
      subscription_data: {
        metadata: {
          listingId,
          plan,
        },
      },
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
