import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Simple in-memory idempotency cache (prevents duplicate event processing)
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 1000;

/**
 * Update a listing's plan via Admin SDK (bypasses Firestore security rules).
 * Webhooks come from Stripe, not from the user, so there's no user token.
 */
async function updateListingPlan(listingId: string, fields: Record<string, unknown>) {
  const adminDb = getAdminDb();
  await adminDb.collection('pg_advertisements').doc(listingId).update({
    ...fields,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

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

    // Idempotency check — skip already processed events
    if (processedEvents.has(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Evict old entries if cache is too large
    if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
      const firstEntry = processedEvents.values().next().value;
      if (firstEntry) processedEvents.delete(firstEntry);
    }
    processedEvents.add(event.id);

    // Handle successful checkout — upgrade listing
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const listingId = session.metadata?.listingId;
      const plan = session.metadata?.plan as 'verified' | 'premium';

      if (listingId && plan) {
        await updateListingPlan(listingId, {
          verified: true,
          verificationPlan: plan,
        });
        console.log(`Listing ${listingId} upgraded to ${plan} plan`);
      }
    }

    // Handle subscription cancelled — downgrade listing
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const listingId = subscription.metadata?.listingId;

      if (listingId) {
        await updateListingPlan(listingId, {
          verified: false,
          verificationPlan: 'free',
        });
        console.log(`Listing ${listingId} downgraded to free (subscription cancelled)`);
      }
    }

    // Handle failed payment — downgrade listing after payment failure
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = (invoice as any).subscription as string | null;

      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const listingId = subscription.metadata?.listingId;

          if (listingId) {
            const attemptCount = invoice.attempt_count || 0;
            if (attemptCount >= 2) {
              await updateListingPlan(listingId, {
                verified: false,
                verificationPlan: 'free',
              });
              console.log(`Listing ${listingId} downgraded due to payment failure (attempt ${attemptCount})`);
            }
          }
        } catch (err) {
          console.error('Error handling payment failure:', err);
        }
      }
    }

    // Handle successful recurring payment — confirm listing stays active
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = (invoice as any).subscription as string | null;

      if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const listingId = subscription.metadata?.listingId;
          const plan = subscription.metadata?.plan as 'verified' | 'premium';

          if (listingId && plan) {
            await updateListingPlan(listingId, {
              verified: true,
              verificationPlan: plan,
            });
          }
        } catch (err) {
          console.error('Error handling invoice.paid:', err);
        }
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
