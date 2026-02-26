import { NextRequest, NextResponse } from 'next/server';
import stripe, { PLANS, PlanType } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Payments not configured yet' },
        { status: 503 }
      );
    }

    const { plan, listingId, ownerEmail } = await request.json();

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

    const selectedPlan = PLANS[plan as PlanType];
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe Checkout Session with UPI + Card + Netbanking
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // UPI is automatically available for INR payments via Stripe India
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `HomyFind ${selectedPlan.name}`,
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
      customer_email: ownerEmail || undefined,
      metadata: {
        listingId,
        plan,
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
      { success: false, error: error instanceof Error ? error.message : 'Payment failed' },
      { status: 500 }
    );
  }
}
