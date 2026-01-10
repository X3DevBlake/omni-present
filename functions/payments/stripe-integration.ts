import Stripe from 'stripe';
import { base44 } from '@/api/base44Client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(userEmail, tier, billingCycle) {
  const tiers = {
    starter: { monthly: 2999, yearly: 29999 },
    pro: { monthly: 9999, yearly: 99999 },
    enterprise: { monthly: 29999, yearly: 299999 }
  };

  const priceInCents = tiers[tier]?.[billingCycle] || tiers.starter.monthly;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
          description: `${billingCycle === 'monthly' ? 'Monthly' : 'Annual'} subscription`,
        },
        recurring: {
          interval: billingCycle === 'monthly' ? 'month' : 'year',
          interval_count: 1,
        },
      },
      quantity: 1,
    }],
    customer_email: userEmail,
    success_url: `${process.env.APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/subscription`,
  });

  return session;
}

export async function handleStripeWebhook(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.customer_email;

    // Create or update subscription
    const subscription = await base44.entities.Subscription.filter({ user_email: userEmail });
    const tierMap = { 'Starter Plan': 'starter', 'Pro Plan': 'pro', 'Enterprise Plan': 'enterprise' };
    const tier = tierMap[session.display_items?.[0]?.plan?.product?.name] || 'starter';

    if (subscription.length > 0) {
      await base44.entities.Subscription.update(subscription[0].id, {
        status: 'active',
        tier,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
      });
    } else {
      await base44.entities.Subscription.create({
        user_email: userEmail,
        tier,
        status: 'active',
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
      });
    }
  }
}

export async function getSubscriptionStatus(userEmail) {
  const subscription = await base44.entities.Subscription.filter({ user_email: userEmail });
  return subscription[0] || null;
}