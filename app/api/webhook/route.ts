import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify the webhook is from Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const listingId = session.metadata?.listingId;
      const plan = session.metadata?.plan as 'verified' | 'premium';

      if (listingId && plan) {
        // Update listing in Firebase
        const { updatePGAdvertisement } = await import('@/lib/firestore');
        await updatePGAdvertisement(listingId, {
          verified: true,
          verificationPlan: plan,
        });
        console.log(`Listing ${listingId} upgraded to ${plan} plan`);
      }
    }

    // Handle subscription cancelled
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const listingId = subscription.metadata?.listingId;

      if (listingId) {
        const { updatePGAdvertisement } = await import('@/lib/firestore');
        await updatePGAdvertisement(listingId, {
          verified: false,
          verificationPlan: 'free',
        });
        console.log(`Listing ${listingId} downgraded to free (subscription cancelled)`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
